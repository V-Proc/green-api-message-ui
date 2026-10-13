import { beforeEach, describe, expect, it, vi } from 'vitest';

import GreenApi from '@/shared/api/GreenApi';
import { GreenApiError } from '@/shared/lib/GreenApiError';
import { createTestStore } from '@/shared/lib/TestUtils';

import { connect } from '@/features/instance-connection';
import { fetchNotifications } from '@/features/receive-messages';

import type { NotificationReceipt } from '@/shared/api/Types';

vi.mock('@/shared/api/GreenApi', () => ({
  default: {
    sendMessage: vi.fn(),
    receiveNotification: vi.fn(),
    deleteNotification: vi.fn(),
  },
}));

function textNotification(text: string, chatId = '10000000'): NotificationReceipt {
  return {
    receiptId: 1234567,
    body: {
      typeWebhook: 'incomingMessageReceived',
      timestamp: 1763115112,
      idMessage: 'msg-api-id',
      senderData: {
        chatId,
        chatName: 'Ходабрыш Пробешёлов',
        chatType: 'user',
        sender: chatId,
        senderName: 'Ходабрыш Пробешёлов',
      },
      messageData: {
        typeMessage: 'textMessage',
        textMessageData: { textMessage: text },
      },
    },
  };
}

let store: ReturnType<typeof createTestStore>;

beforeEach(() => {
  store = createTestStore();
  store.dispatch(connect({ apiUrl: 'https://api.green-api.com', idInstance: '111', apiTokenInstance: 'aaa' }));
  vi.clearAllMocks();
});

describe('fetchNotificationsThunk', () => {
  it('добавляет текстовое сообщение, создаёт чат и подтверждает удаление', async () => {
    vi.mocked(GreenApi.receiveNotification).mockResolvedValue(
      textNotification('Привет от Green-API!'),
    );
    vi.mocked(GreenApi.deleteNotification).mockResolvedValue({ result: true });

    const received = await store.dispatch(fetchNotifications()).unwrap();

    expect(received).toBe(true);
    expect(store.getState().messages.byChatId['10000000'][0]).toMatchObject({
      id: 'msg-api-id',
      text: 'Привет от Green-API!',
      direction: 'incoming',
      status: 'sent',
    });
    expect(store.getState().chats.byId['10000000']).toMatchObject({
      title: 'Ходабрыш Пробешёлов',
      lastMessageText: 'Привет от Green-API!',
      unread: true,
    });
    expect(GreenApi.deleteNotification).toHaveBeenCalledWith(
      { apiUrl: 'https://api.green-api.com', idInstance: '111', apiTokenInstance: 'aaa' },
      1234567,
    );
    expect(store.getState().polling.lastError).toBeNull();
  });

  it('возвращает false без удаления, когда очередь пуста', async () => {
    vi.mocked(GreenApi.receiveNotification).mockResolvedValue(null);

    const received = await store.dispatch(fetchNotifications()).unwrap();

    expect(received).toBe(false);
    expect(GreenApi.deleteNotification).not.toHaveBeenCalled();
    expect(Object.keys(store.getState().messages.byChatId)).toHaveLength(0);
  });

  it('удаляет неподдерживаемые типы уведомлений без добавления сообщения', async () => {
    vi.mocked(GreenApi.receiveNotification).mockResolvedValue({
      receiptId: 5,
      body: {
        typeWebhook: 'outgoingMessageStatus',
        timestamp: 1763115112,
        idMessage: 'msg-api-id',
        senderData: {
          chatId: '10000000',
          chatName: '',
          chatType: 'user',
          sender: '10000000',
          senderName: '',
        },
        messageData: { typeMessage: 'empty' },
      },
    });
    vi.mocked(GreenApi.deleteNotification).mockResolvedValue({ result: true });

    const received = await store.dispatch(fetchNotifications()).unwrap();

    expect(received).toBe(true);
    expect(store.getState().messages.byChatId['10000000']).toBeUndefined();
    expect(GreenApi.deleteNotification).toHaveBeenCalledWith(expect.anything(), 5);
  });

  it('фиксирует ошибку polling при ошибке API (4xx)', async () => {
    vi.mocked(GreenApi.receiveNotification).mockRejectedValue(
      new GreenApiError('Неверный apiTokenInstance', 400),
    );

    const received = await store.dispatch(fetchNotifications()).unwrap();

    expect(received).toBe(false);
    expect(store.getState().polling.lastError).toBe('Неверный apiTokenInstance');
  });

  it('не показывает ошибку при преходящем сетевом/5xx сбое', async () => {
    vi.mocked(GreenApi.receiveNotification).mockRejectedValue(
      new GreenApiError('Proxy error: read ETIMEDOUT', 502),
    );

    const received = await store.dispatch(fetchNotifications()).unwrap();

    expect(received).toBe(false);
    expect(store.getState().polling.lastError).toBeNull();
  });

  it('фиксирует ошибку при неудачном подтверждении удаления', async () => {
    vi.mocked(GreenApi.receiveNotification).mockResolvedValue(textNotification('текст'));
    vi.mocked(GreenApi.deleteNotification).mockRejectedValue(
      new GreenApiError('Не найдено сообщение', 400),
    );

    const received = await store.dispatch(fetchNotifications()).unwrap();

    expect(received).toBe(false);
    expect(store.getState().polling.lastError).toBe('Не найдено сообщение');
  });

  it('очищает предыдущую ошибку после успешного цикла', async () => {
    vi.mocked(GreenApi.receiveNotification)
      .mockRejectedValueOnce(new GreenApiError('Ошибка запроса', 400))
      .mockResolvedValueOnce(null);

    await store.dispatch(fetchNotifications()).unwrap();
    await store.dispatch(fetchNotifications()).unwrap();

    expect(store.getState().polling.lastError).toBeNull();
  });
});
