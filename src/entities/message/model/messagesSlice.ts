import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Message } from '@/entities/message/model/types';

interface MessagesState {
  byChatId: Record<string, Message[]>;
}

const initialState: MessagesState = {
  byChatId: {},
};

function compareByTimestamp(a: Message, b: Message): number {
  return a.timestamp - b.timestamp;
}

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    addMessage(state, action: PayloadAction<Message>) {
      const { chatId } = action.payload;
      const list = state.byChatId[chatId] ?? [];
      const existing = list.some((message) => message.id === action.payload.id);

      if (!existing) {
        list.push(action.payload);
        list.sort(compareByTimestamp);
        state.byChatId[chatId] = list;
      }
    },
    updateMessageStatus(
      state,
      action: PayloadAction<{
        chatId: string;
        localId: string;
        status: Message['status'];
        error?: string;
      }>,
    ) {
      const list = state.byChatId[action.payload.chatId];
      const message = list?.find((item) => item.id === action.payload.localId);

      if (message) {
        message.status = action.payload.status;
        message.error = action.payload.error;
      }
    },
  },
});

export const { addMessage, updateMessageStatus } = messagesSlice.actions;
export default messagesSlice.reducer;
