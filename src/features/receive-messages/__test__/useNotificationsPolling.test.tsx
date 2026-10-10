import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import GreenApi from '@/shared/api/GreenApi';
import { connect } from '@/features/instance-connection';
import { useNotificationsPolling } from '@/features/receive-messages';
import { createTestStore } from '@/shared/lib/TestUtils';

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

afterEach(() => {
  vi.clearAllMocks();
});

function renderPollingHook(store: ReturnType<typeof createTestStore>) {
  return renderHook(() => useNotificationsPolling(), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });
}

describe('useNotificationsPolling', () => {
  it('не опрашивает, пока инстанс не подключён', async () => {
    vi.mocked(GreenApi.receiveNotification).mockResolvedValue(null);
    const store = createTestStore();

    renderPollingHook(store);
    await sleep(150);

    expect(GreenApi.receiveNotification).not.toHaveBeenCalled();
  });

  it('начинает polling сразу после подключения', async () => {
    vi.mocked(GreenApi.receiveNotification).mockResolvedValue(null);
    const store = createTestStore();
    store.dispatch(connect({ idInstance: '111', apiTokenInstance: 'aaa' }));

    const { unmount } = renderPollingHook(store);

    await waitFor(() => {
      expect(GreenApi.receiveNotification).toHaveBeenCalledTimes(1);
    });

    unmount();
    await sleep(200);

    expect(GreenApi.receiveNotification).toHaveBeenCalledTimes(1);
  });

  it('продолжает цикл после обработки уведомления без долгой паузы', async () => {
    const receipt = {
      receiptId: 1,
      body: {
        typeWebhook: 'incomingMessageReceived',
        timestamp: 1,
        idMessage: 'm1',
        senderData: { chatId: 'c1', chatName: 'Имя', chatType: 'user', sender: 'c1', senderName: 'Имя' },
        messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: 'текст' } },
      },
    };
    vi.mocked(GreenApi.receiveNotification).mockResolvedValue(receipt);
    vi.mocked(GreenApi.deleteNotification).mockResolvedValue({ result: true });
    const store = createTestStore();
    store.dispatch(connect({ idInstance: '111', apiTokenInstance: 'aaa' }));

    const { unmount } = renderPollingHook(store);

    await waitFor(
      () => {
        expect(vi.mocked(GreenApi.receiveNotification).mock.calls.length).toBeGreaterThanOrEqual(2);
      },
      { timeout: 5000 },
    );

    unmount();
  });
});