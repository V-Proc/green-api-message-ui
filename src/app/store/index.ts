import { configureStore } from '@reduxjs/toolkit';
import { chatsReducer } from '@/entities/chat';
import { messagesReducer } from '@/entities/message';
import { connectionReducer } from '@/features/instance-connection';
import { pollingReducer } from '@/features/receive-messages';

const reducer = {
  connection: connectionReducer,
  chats: chatsReducer,
  messages: messagesReducer,
  polling: pollingReducer,
};

export type RootState = {
  [K in keyof typeof reducer]: ReturnType<(typeof reducer)[K]>;
};

export const createAppStore = () =>
  configureStore({
    reducer,
  });

export const store = createAppStore();

export type AppDispatch = typeof store.dispatch;