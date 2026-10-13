import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import GreenApi from '@/shared/api/GreenApi';
import { createTestStore, renderWithStore } from '@/shared/lib/TestUtils';

import { upsertChat } from '@/entities/chat';

import { connect } from '@/features/instance-connection';

import { MessengerView } from '@/views/messenger';

vi.mock('@/shared/api/GreenApi', () => ({
  default: {
    sendMessage: vi.fn(),
    receiveNotification: vi.fn(),
    deleteNotification: vi.fn(),
  },
}));

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(GreenApi.receiveNotification).mockResolvedValue(null);
});

describe('MessengerView', () => {
  it('рендерит сайдбар и окно чата', () => {
    renderWithStore(<MessengerView />);

    expect(
      screen.getByText('Введите ID чата или дождитесь входящих сообщений'),
    ).toBeInTheDocument();
    expect(screen.getByText('Выберите чат, чтобы начать переписку')).toBeInTheDocument();
  });

  it('сайдбар и окно чата работают с общим стором: выбор чата открывает переписку', async () => {
    const user = userEvent.setup();
    const store = createTestStore();
    store.dispatch(connect({ apiUrl: 'https://api.green-api.com', idInstance: '111', apiTokenInstance: 'aaa' }));
    store.dispatch(
      upsertChat({
        chatId: '10000000',
        title: 'Ходабрыш',
        lastMessageText: '',
        lastMessageTimestamp: Date.now(),
      }),
    );

    renderWithStore(<MessengerView />, store);

    await user.click(screen.getByRole('button', { name: /Ходабрыш/ }));

    expect(screen.queryByText('Выберите чат, чтобы начать переписку')).not.toBeInTheDocument();
    expect(screen.getByText('10000000')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Написать сообщение...')).toBeInTheDocument();
  });

  it('запускает polling входящих уведомлений при подключении', async () => {
    const store = createTestStore();
    store.dispatch(connect({ apiUrl: 'https://api.green-api.com', idInstance: '111', apiTokenInstance: 'aaa' }));

    renderWithStore(<MessengerView />, store);

    await waitFor(() => {
      expect(GreenApi.receiveNotification).toHaveBeenCalledTimes(1);
    });
  });

  it('не опрашивает уведомления без подключения', async () => {
    renderWithStore(<MessengerView />);

    await sleep(150);

    expect(GreenApi.receiveNotification).not.toHaveBeenCalled();
  });

  it('останавливает polling при размонтировании', async () => {
    const store = createTestStore();
    store.dispatch(connect({ apiUrl: 'https://api.green-api.com', idInstance: '111', apiTokenInstance: 'aaa' }));

    const { unmount } = renderWithStore(<MessengerView />, store);

    await waitFor(() => {
      expect(GreenApi.receiveNotification).toHaveBeenCalledTimes(1);
    });

    unmount();
    await sleep(250);

    expect(GreenApi.receiveNotification).toHaveBeenCalledTimes(1);
  });
});
