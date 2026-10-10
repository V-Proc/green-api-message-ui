import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState, AppDispatch } from '@/app/store';
import { addMessage } from '@/entities/message';
import { upsertChat } from '@/entities/chat';
import GreenApi from '@/shared/api/GreenApi';
import { setPollingError } from './pollingSlice';

export const fetchNotifications = createAsyncThunk<
  boolean,
  void,
  { state: RootState; dispatch: AppDispatch }
>('receive-messages/fetchNotifications', async (_, { dispatch, getState }) => {
  const credentials = getState().connection;

  try {
    const notification = await GreenApi.receiveNotification({
      idInstance: credentials.idInstance,
      apiTokenInstance: credentials.apiTokenInstance,
    });

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
    }

    await GreenApi.deleteNotification(
      {
        idInstance: credentials.idInstance,
        apiTokenInstance: credentials.apiTokenInstance,
      },
      receiptId,
    );
    dispatch(setPollingError(null));

    return true;
  } catch (error) {
    dispatch(
      setPollingError(error instanceof Error ? error.message : 'Ошибка получения уведомлений'),
    );

    return false;
  }
});