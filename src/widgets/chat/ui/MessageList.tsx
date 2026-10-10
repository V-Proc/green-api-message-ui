import { useEffect, useRef } from 'react';
import { useAppSelector } from '@/app/store/ReduxHooks';
import { selectMessagesByChatId } from '@/entities/message';
import MessageItem from './MessageItem';
import styles from './MessageList.module.scss';

type MessageListProps = {
  chatId: string;
};

function startsNewDay(current: number, previous: number | undefined): boolean {
  if (!previous) {
    return true;
  }

  return new Date(current).getDate() !== new Date(previous).getDate();
}

export default function MessageList({ chatId }: MessageListProps) {
  const messages = useAppSelector((state) => selectMessagesByChatId(state, chatId));
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, chatId]);

  return (
    <div className={styles['message-list']}>
      <div className={styles['message-list__inner']}>
        {messages.map((message, index) => (
          <MessageItem
            key={message.id}
            message={message}
            showDateDivider={startsNewDay(
              message.timestamp,
              messages[index - 1]?.timestamp,
            )}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}