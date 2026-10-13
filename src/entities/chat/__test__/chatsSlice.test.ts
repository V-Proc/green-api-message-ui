import { describe, expect, it } from 'vitest';

import { createTestStore } from '@/shared/lib/TestUtils';

import {
  selectChat,
  selectChats,
  selectSelectedChat,
  selectSelectedChatId,
  upsertChat,
} from '@/entities/chat';

describe('chatsSlice', () => {
  it('upsertChat создаёт новый чат и добавляет его в ids', () => {
    const store = createTestStore();

    store.dispatch(
      upsertChat({
        chatId: '10000000',
        title: 'Иван',
        lastMessageText: 'Привет',
        lastMessageTimestamp: 1000,
      }),
    );

    const state = store.getState().chats;

    expect(state.ids).toEqual(['10000000']);
    expect(state.byId['10000000']).toMatchObject({
      title: 'Иван',
      lastMessageText: 'Привет',
      unread: false,
    });
  });

  it('upsertChat обновляет существующий чат, не создавая дубликат', () => {
    const store = createTestStore();

    store.dispatch(
      upsertChat({
        chatId: 'c1',
        title: 'c1',
        lastMessageText: 'первое',
        lastMessageTimestamp: 1000,
      }),
    );
    store.dispatch(
      upsertChat({
        chatId: 'c1',
        title: 'c1',
        lastMessageText: 'второе',
        lastMessageTimestamp: 2000,
      }),
    );

    const state = store.getState().chats;

    expect(state.ids).toEqual(['c1']);
    expect(state.byId.c1.lastMessageText).toBe('второе');
    expect(state.byId.c1.lastMessageTimestamp).toBe(2000);
  });

  it('markUnread помечает чат непрочитанным, если он не выбран', () => {
    const store = createTestStore();

    store.dispatch(
      upsertChat({
        chatId: 'c1',
        title: 'c1',
        lastMessageText: '',
        lastMessageTimestamp: 1000,
      }),
    );
    store.dispatch(
      upsertChat({
        chatId: 'c2',
        title: 'c2',
        lastMessageText: '',
        lastMessageTimestamp: 2000,
        markUnread: true,
      }),
    );

    expect(store.getState().chats.byId.c2.unread).toBe(true);
  });

  it('markUnread не помечает выбранный чат', () => {
    const store = createTestStore();

    store.dispatch(
      upsertChat({
        chatId: 'c1',
        title: 'c1',
        lastMessageText: '',
        lastMessageTimestamp: 1000,
      }),
    );
    store.dispatch(selectChat('c1'));
    store.dispatch(
      upsertChat({
        chatId: 'c1',
        title: 'c1',
        lastMessageText: 'новое',
        lastMessageTimestamp: 2000,
        markUnread: true,
      }),
    );

    expect(store.getState().chats.byId.c1.unread).toBe(false);
  });

  it('selectChat выбирает чат и снимает непрочитанность', () => {
    const store = createTestStore();

    store.dispatch(
      upsertChat({
        chatId: 'c1',
        title: 'c1',
        lastMessageText: '',
        lastMessageTimestamp: 1000,
        markUnread: true,
      }),
    );
    store.dispatch(selectChat('c1'));

    const state = store.getState().chats;

    expect(state.selectedChatId).toBe('c1');
    expect(state.byId.c1.unread).toBe(false);
  });

  it('selectChats сортирует по времени последнего сообщения', () => {
    const store = createTestStore();

    store.dispatch(
      upsertChat({ chatId: 'old', title: 'old', lastMessageText: '', lastMessageTimestamp: 100 }),
    );
    store.dispatch(
      upsertChat({ chatId: 'new', title: 'new', lastMessageText: '', lastMessageTimestamp: 900 }),
    );

    const ids = selectChats(store.getState()).map((chat) => chat.chatId);

    expect(ids).toEqual(['new', 'old']);
  });

  it('selectSelectedChat возвращает выбранный чат или null', () => {
    const store = createTestStore();

    expect(selectSelectedChat(store.getState())).toBeNull();

    store.dispatch(
      upsertChat({ chatId: 'c1', title: 'c1', lastMessageText: '', lastMessageTimestamp: 1 }),
    );
    store.dispatch(selectChat('c1'));

    expect(selectSelectedChat(store.getState())?.chatId).toBe('c1');
    expect(selectSelectedChatId(store.getState())).toBe('c1');
  });
});
