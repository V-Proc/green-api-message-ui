import { describe, expect, it } from 'vitest';
import { addMessage, updateMessageStatus, selectMessagesByChatId } from '@/entities/message';
import type { Message } from '@/entities/message';
import { createTestStore } from '@/shared/lib/TestUtils';

function buildMessage(overrides: Partial<Message>): Message {
  return {
    id: 'm1',
    chatId: 'c1',
    text: 'текст',
    direction: 'incoming',
    timestamp: Date.now(),
    status: 'sent',
    ...overrides,
  };
}

describe('messagesSlice', () => {
  it('addMessage добавляет сообщение в чат', () => {
    const store = createTestStore();

    store.dispatch(addMessage(buildMessage({ id: 'm1', text: 'Привет' })));

    const messages = store.getState().messages.byChatId.c1;

    expect(messages).toHaveLength(1);
    expect(messages[0].text).toBe('Привет');
  });

  it('addMessage сортирует сообщения по времени', () => {
    const store = createTestStore();

    store.dispatch(addMessage(buildMessage({ id: 'a', timestamp: 200 })));
    store.dispatch(addMessage(buildMessage({ id: 'b', timestamp: 100 })));

    const ids = store.getState().messages.byChatId.c1.map((message) => message.id);

    expect(ids).toEqual(['b', 'a']);
  });

  it('addMessage игнорирует дубликат по id', () => {
    const store = createTestStore();

    store.dispatch(addMessage(buildMessage({ id: 'a', text: 'первый' })));
    store.dispatch(addMessage(buildMessage({ id: 'a', text: 'второй' })));

    const messages = store.getState().messages.byChatId.c1;

    expect(messages).toHaveLength(1);
    expect(messages[0].text).toBe('первый');
  });

  it('updateMessageStatus меняет статус по локальному id', () => {
    const store = createTestStore();

    store.dispatch(addMessage(buildMessage({ id: 'a', status: 'pending' })));
    store.dispatch(updateMessageStatus({ chatId: 'c1', localId: 'a', status: 'sent' }));

    expect(store.getState().messages.byChatId.c1[0].status).toBe('sent');
  });

  it('updateMessageStatus не падает на несуществующем сообщении', () => {
    const store = createTestStore();

    store.dispatch(updateMessageStatus({ chatId: 'c1', localId: 'nope', status: 'failed' }));

    expect(store.getState().messages.byChatId.c1).toBeUndefined();
  });

  it('selectMessagesByChatId возвращает пустой список для неизвестного чата', () => {
    const store = createTestStore();

    const result = selectMessagesByChatId(store.getState(), 'unknown');

    expect(result).toEqual([]);
  });
});