import { beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import GreenApi from '@/shared/api/GreenApi';
import { SendMessageForm } from '@/features/send-message';
import { connect } from '@/features/instance-connection';
import { renderWithStore, createTestStore } from '@/shared/lib/TestUtils';

vi.mock('@/shared/api/GreenApi', () => ({
  default: {
    sendMessage: vi.fn(),
    receiveNotification: vi.fn(),
    deleteNotification: vi.fn(),
  },
}));

function setup() {
  const store = createTestStore();
  store.dispatch(connect({ idInstance: '111', apiTokenInstance: 'aaa' }));
  vi.mocked(GreenApi.sendMessage).mockResolvedValue({ idMessage: 'api-id' });

  return renderWithStore(<SendMessageForm chatId="c1" />, store);
}

describe('SendMessageForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('отправляет сообщение по Enter и очищает поле', async () => {
    const user = userEvent.setup();
    const { store } = setup();

    const input = screen.getByPlaceholderText('Написать сообщение...');
    await user.type(input, 'Привет!{Enter}');

    await waitFor(() => {
      expect(store.getState().messages.byChatId.c1[0]).toMatchObject({
        text: 'Привет!',
        direction: 'outgoing',
        status: 'sent',
      });
    });
    expect(input).toHaveValue('');
  });

  it('отправляет сообщение по клику на кнопку', async () => {
    const user = userEvent.setup();
    const { store } = setup();

    await user.type(screen.getByPlaceholderText('Написать сообщение...'), 'Текст кнопкой');
    await user.click(screen.getByRole('button', { name: 'Отправить' }));

    await waitFor(() => {
      expect(store.getState().messages.byChatId.c1[0].text).toBe('Текст кнопкой');
    });
  });

  it('не отправляет пустое сообщение', async () => {
    const user = userEvent.setup();
    const { store } = setup();

    await user.click(screen.getByRole('button', { name: 'Отправить' }));

    expect(store.getState().messages.byChatId.c1).toBeUndefined();
    expect(GreenApi.sendMessage).not.toHaveBeenCalled();
  });

  it('Shift+Enter вставляет перенос строки вместо отправки', async () => {
    const user = userEvent.setup();
    const { store } = setup();

    const input = screen.getByPlaceholderText('Написать сообщение...') as HTMLTextAreaElement;
    await user.type(input, 'строка{Shift>}{Enter}{/Shift}вторая');

    expect(store.getState().messages.byChatId.c1).toBeUndefined();
    expect(input.value).toContain('\n');
  });

  it('показывает статус failed при ошибке API', async () => {
    const user = userEvent.setup();
    const { store } = setup();
    vi.mocked(GreenApi.sendMessage).mockRejectedValue(new Error('Ошибка запроса'));

    await user.type(screen.getByPlaceholderText('Написать сообщение...'), 'Привет!{Enter}');

    await waitFor(() => {
      expect(store.getState().messages.byChatId.c1[0].status).toBe('failed');
    });
  });
});