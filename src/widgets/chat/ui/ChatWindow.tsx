import { Avatar, Button } from '@/shared/ui';

import { selectSelectedChat } from '@/entities/chat';

import { disconnect } from '@/features/instance-connection';
import { SendMessageForm } from '@/features/send-message';

import { useAppDispatch, useAppSelector } from '@/app/store/ReduxHooks';

import MessageList from './MessageList';

import styles from './ChatWindow.module.scss';

export default function ChatWindow() {
  const dispatch = useAppDispatch();
  const chat = useAppSelector(selectSelectedChat);

  if (!chat) {
    return (
      <section className={`${styles.chat} ${styles.chat_empty}`}>
        <p className={styles.chat__placeholder}>Выберите чат, чтобы начать переписку</p>
      </section>
    );
  }

  return (
    <section className={styles.chat}>
      <header className={styles.chat__header}>
        <Avatar title={chat.title} />
        <div className={styles.chat__info}>
          <span className={styles.chat__name}>{chat.title}</span>
          <span className={styles.chat__id}>{chat.chatId}</span>
        </div>
        <Button
          className={styles.chat__disconnect}
          onClick={() => dispatch(disconnect())}
          aria-label="Отключиться"
        >
          Сменить инстанс
        </Button>
      </header>
      <MessageList chatId={chat.chatId} />
      <SendMessageForm chatId={chat.chatId} />
    </section>
  );
}
