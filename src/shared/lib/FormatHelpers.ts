export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatChatTitle(chatId: string): string {
  return chatId.replace(/@c\.us$/, '');
}
