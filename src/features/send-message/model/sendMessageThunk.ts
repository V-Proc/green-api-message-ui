import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState, AppDispatch } from '@/app/store';
import { addMessage, updateMessageStatus } from '@/entities/message';
import { upsertChat } from '@/entities/chat';
import GreenApi from '@/shared/api/GreenApi';
import { MAX_MESSAGE_LENGTH } from '@/shared/config/GreenApiConfig';

interface SendMessageArgs {
  chatId: string;
  text: string;
}

export const sendMessage = createAsyncThunk<
  void,
  SendMessageArgs,
  { state: RootState; dispatch: AppDispatch }
>('send-message/send', async ({ chatId, text }, { dispatch, getState }) => {
  const trimmedText = text.trim();

  if (!trimmedText || trimmedText.length > MAX_MESSAGE_LENGTH) {
    return;
  }

  const { idInstance, apiTokenInstance } = getState().connection;

  const localId = crypto.randomUUID();
  const timestamp = Date.now();

  dispatch(
    addMessage({
      id: localId,
      chatId,
      text: trimmedText,
      direction: 'outgoing',
      timestamp,
      status: 'pending',
    }),
  );

  dispatch(
    upsertChat({
      chatId,
      title: chatId,
      lastMessageText: trimmedText,
      lastMessageTimestamp: timestamp,
    }),
  );

  try {
    await GreenApi.sendMessage({ idInstance, apiTokenInstance }, {
      chatId,
      message: trimmedText,
    });

    dispatch(updateMessageStatus({ chatId, localId, status: 'sent' }));
  } catch (error) {
    dispatch(updateMessageStatus({ chatId, localId, status: 'failed' }));
  }
});