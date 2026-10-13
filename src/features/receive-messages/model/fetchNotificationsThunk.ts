import { createAsyncThunk } from '@reduxjs/toolkit';

import GreenApi from '@/shared/api/GreenApi';
import { GreenApiError } from '@/shared/lib/GreenApiError';

import { upsertChat } from '@/entities/chat';
import { addMessage } from '@/entities/message';

import { setPollingError } from './pollingSlice';

import type { AppDispatch,RootState } from '@/app/store';

export const fetchNotifications = createAsyncThunk<
  boolean,
  void,
  { state: RootState; dispatch: AppDispatch }
>('receive-messages/fetchNotifications', async (_, { dispatch, getState }) => {
  const { apiUrl, idInstance, apiTokenInstance } = getState().connection;
  const credentials = { apiUrl, idInstance, apiTokenInstance };

  try {
    const notification = await GreenApi.receiveNotification(credentials);

    if (!notification?.body) {
      dispatch(setPollingError(null));

      return false;
    }

    const { body, receiptId } = notification;

    if (
      body.typeWebhook === 'incomingMessageReceived' &&
      body.messageData.typeMessage === 'textMessage' &&
      body.messageData.textMessageData
    ) {
      const timestamp = body.timestamp * 1000;

      dispatch(
        addMessage({
          id: body.idMessage,
          chatId: body.senderData.chatId,
          text: body.messageData.textMessageData.textMessage,
          direction: 'incoming',
          timestamp,
          status: 'sent',
        }),
      );

      dispatch(
        upsertChat({
          chatId: body.senderData.chatId,
          title: body.senderData.chatName || body.senderData.chatId,
          lastMessageText: body.messageData.textMessageData.textMessage,
          lastMessageTimestamp: timestamp,
          markUnread: true,
        }),
      );
    } else {
      console.error(
        '[notifications] необработанное уведомление',
        body.typeWebhook,
        body.messageData?.typeMessage,
      );
    }

    await GreenApi.deleteNotification(credentials, receiptId);
    dispatch(setPollingError(null));

    return true;
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Ошибка получения уведомлений';
    const httpStatus = error instanceof GreenApiError ? error.status : 0;
    const isTransient = httpStatus === 0 || httpStatus >= 500;

    if (isTransient) {
      console.error('[notifications] временный сбой опроса, повторим в следующем цикле:', reason);
      dispatch(setPollingError(null));
    } else {
      dispatch(setPollingError(reason));
    }

    return false;
  }
});
