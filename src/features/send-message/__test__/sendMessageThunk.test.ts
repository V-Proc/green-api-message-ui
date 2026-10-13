import { beforeEach, describe, expect, it, vi } from 'vitest';

import GreenApi from '@/shared/api/GreenApi';
import { createTestStore } from '@/shared/lib/TestUtils';

import { connect } from '@/features/instance-connection';
import { sendMessage } from '@/features/send-message';

vi.mock('@/shared/api/GreenApi', () => ({
  default: {
    sendMessage: vi.fn(),
    receiveNotification: vi.fn(),
    deleteNotification: vi.fn(),
  },
}));

let store: ReturnType<typeof createTestStore>;

beforeEach(() => {
  store = createTestStore();
  store.dispatch(connect({ idInstance: '111', apiTokenInstance: 'aaa' }));
  vi.clearAllMocks();
});

describe('sendMessageThunk', () => {
  it('оптимистично добавляет сообщение и помечает sent после ответа API', async () => {
    vi.mocked(GreenApi.sendMessage).mockResolvedValue({ idMessage: 'api-id' });

    await store.dispatch(sendMessage({ chatId: 'c1', text: 'Привет!' }));

    const message = store.getState().messages.byChatId.c1[0];

    expect(message.text).toBe('Привет!');
    expect(message.direction).toBe('outgoing');
    expect(message.status).toBe('sent');
    expect(GreenApi.sendMessage).toHaveBeenCalledWith(
      { idInstance: '111', apiTokenInstance: 'aaa' },
      { chatId: 'c1', message: 'Привет!' },
    );
  });

  it('создаёт чат с последним сообщением при первой отправке', async () => {
    vi.mocked(GreenApi.sendMessage).mockResolvedValue({ idMessage: 'api-id' });

    await store.dispatch(sendMessage({ chatId: 'c1', text: 'Привет!' }));

    const chat = store.getState().chats.byId.c1;

    expect(chat).toMatchObject({
      chatId: 'c1',
      title: 'c1',
      lastMessageText: 'Привет!',
    });
  });

  it('помечает сообщение failed при ошибке API', async () => {
    vi.mocked(GreenApi.sendMessage).mockRejectedValue(new Error('Ошибка запроса'));

    await store.dispatch(sendMessage({ chatId: 'c1', text: 'Привет!' }));

    expect(store.getState().messages.byChatId.c1[0].status).toBe('failed');
  });

  it('не отправляет пустой текст', async () => {
    await store.dispatch(sendMessage({ chatId: 'c1', text: '   ' }));

    expect(store.getState().messages.byChatId.c1).toBeUndefined();
    expect(GreenApi.sendMessage).not.toHaveBeenCalled();
  });

  it('не отправляет текст длиннее 4000 символов', async () => {
    await store.dispatch(sendMessage({ chatId: 'c1', text: 'a'.repeat(4001) }));

    expect(store.getState().messages.byChatId.c1).toBeUndefined();
    expect(GreenApi.sendMessage).not.toHaveBeenCalled();
  });
});
