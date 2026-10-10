import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';

const selectChatsState = (state: RootState) => state.chats;

export const selectChats = createSelector(
  [selectChatsState],
  (chats) =>
    chats.ids
      .map((id) => chats.byId[id])
      .sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp),
);

export const selectSelectedChatId = createSelector(
  [selectChatsState],
  (chats) => chats.selectedChatId,
);

export const selectSelectedChat = createSelector(
  [selectChatsState],
  (chats) => (chats.selectedChatId ? chats.byId[chats.selectedChatId] ?? null : null),
);