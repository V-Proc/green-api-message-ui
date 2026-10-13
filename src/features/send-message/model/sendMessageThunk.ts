import { createAsyncThunk } from '@reduxjs/toolkit';

import GreenApi from '@/shared/api/GreenApi';
import { MAX_MESSAGE_LENGTH } from '@/shared/config/GreenApiConfig';

import { upsertChat } from '@/entities/chat';
import { addMessage, updateMessageStatus } from '@/entities/message';

import type { AppDispatch,RootState } from '@/app/store';

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

  const { apiUrl, idInstance, apiTokenInstance } = getState().connection;

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
    await GreenApi.sendMessage({ apiUrl, idInstance, apiTokenInstance }, {
      chatId,
      message: trimmedText,
    });

    dispatch(updateMessageStatus({ chatId, localId, status: 'sent' }));
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Неизвестная ошибка отправки';

    console.error('[sendMessage] не отправлено', chatId, reason);
    dispatch(updateMessageStatus({ chatId, localId, status: 'failed', error: reason }));
  }
});
