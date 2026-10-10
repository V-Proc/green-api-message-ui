export type MessageDirection = 'incoming' | 'outgoing';

export type MessageStatus = 'pending' | 'sent' | 'failed';

export interface Message {
  id: string;
  chatId: string;
  text: string;
  direction: MessageDirection;
  timestamp: number;
  status: MessageStatus;
}