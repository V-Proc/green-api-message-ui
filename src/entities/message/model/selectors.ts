import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '@/app/store';

const selectMessagesState = (state: RootState) => state.messages;

export const selectMessagesByChatId = createSelector(
  [selectMessagesState, (_state: RootState, chatId: string) => chatId],
  (messages, chatId) => messages.byChatId[chatId] ?? [],
);
