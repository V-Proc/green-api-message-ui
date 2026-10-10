export interface InstanceCredentials {
  idInstance: string;
  apiTokenInstance: string;
}

export interface GreenApiErrorPayload {
  error: string;
}

export interface SendMessageRequest {
  chatId: string;
  message: string;
}

export interface SendMessageResponse {
  idMessage: string;
}

export interface NotificationReceipt {
  receiptId: number;
  body: NotificationBody | null;
}

export interface NotificationBody {
  typeWebhook: string;
  timestamp: number;
  idMessage: string;
  senderData: {
    chatId: string;
    chatName: string;
    chatType: string;
    sender: string;
    senderName: string;
  };
  messageData: {
    typeMessage: string;
    textMessageData?: {
      textMessage: string;
    };
  };
}