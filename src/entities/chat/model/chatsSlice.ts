import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Chat } from '@/entities/chat/model/types';

interface ChatsState {
  byId: Record<string, Chat>;
  ids: string[];
  selectedChatId: string | null;
}

const initialState: ChatsState = {
  byId: {},
  ids: [],
  selectedChatId: null,
};

function touchChat(state: ChatsState, chat: Chat): void {
  const existing = state.byId[chat.chatId];

  if (existing) {
    existing.lastMessageText = chat.lastMessageText;
    existing.lastMessageTimestamp = chat.lastMessageTimestamp;
  } else {
    state.byId[chat.chatId] = chat;
    state.ids.push(chat.chatId);
  }
}

const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    selectChat(state, action: PayloadAction<string>) {
      state.selectedChatId = action.payload;
      const chat = state.byId[action.payload];

      if (chat) {
        chat.unread = false;
      }
    },
    upsertChat(state, action: PayloadAction<Omit<Chat, 'unread'> & { markUnread?: boolean }>) {
      const { markUnread, ...chat } = action.payload;

      touchChat(state, { ...chat, unread: false });

      if (markUnread && state.byId[chat.chatId] && state.selectedChatId !== chat.chatId) {
        state.byId[chat.chatId].unread = true;
      }
    },
  },
});

export const { selectChat, upsertChat } = chatsSlice.actions;
export default chatsSlice.reducer;
