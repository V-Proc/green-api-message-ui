export interface Chat {
  chatId: string;
  title: string;
  lastMessageText: string;
  lastMessageTimestamp: number;
  unread: boolean;
}