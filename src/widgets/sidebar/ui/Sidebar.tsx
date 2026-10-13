import { type FormEvent,useState } from 'react';

import { formatChatTitle, formatTime } from '@/shared/lib/FormatHelpers';
import { Avatar, Button, TextField } from '@/shared/ui';

import { selectChat, selectChats, selectSelectedChatId, upsertChat } from '@/entities/chat';

import { ConnectionStatus } from '@/features/receive-messages';

import { useAppDispatch, useAppSelector } from '@/app/store/ReduxHooks';

import styles from './Sidebar.module.scss';

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const chats = useAppSelector(selectChats);
  const selectedChatId = useAppSelector(selectSelectedChatId);
  const [newChatId, setNewChatId] = useState('');

  const handleCreateChat = (event: FormEvent) => {
    event.preventDefault();

    const chatId = newChatId.trim();

    if (!chatId) {
      return;
    }

    const timestamp = Date.now();

    dispatch(
      upsertChat({
        chatId,
        title: formatChatTitle(chatId),
        lastMessageText: '',
        lastMessageTimestamp: timestamp,
      }),
    );
    dispatch(selectChat(chatId));
    setNewChatId('');
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebar__header}>
        <span className={styles.sidebar__logo}>MAX</span>
        <span className={styles.sidebar__title}>GREEN-API</span>
      </div>

      <form className={styles.sidebar__newchat} onSubmit={handleCreateChat}>
        <TextField
          className={styles['sidebar__chat-id-field']}
          placeholder="ID чата: 10000000 или 79991234567@c.us"
          value={newChatId}
          onChange={(event) => setNewChatId(event.target.value)}
        />
        <Button
          className={styles['sidebar__add-button']}
          type="submit"
          aria-label="Открыть чат"
        >
          +
        </Button>
      </form>

      <nav className={styles.sidebar__list}>
        {chats.length === 0 ? (
          <p className={styles.sidebar__placeholder}>
            Введите ID чата или дождитесь входящих сообщений
          </p>
        ) : (
          chats.map((chat) => {
            const itemClass = [styles.sidebar__item];

            if (chat.chatId === selectedChatId) {
              itemClass.push(styles['sidebar__item_active']);
            }

            return (
              <button
                type="button"
                key={chat.chatId}
                className={itemClass.join(' ')}
                onClick={() => dispatch(selectChat(chat.chatId))}
              >
                <Avatar title={chat.title} className={styles.sidebar__avatar} />
                <span className={styles.sidebar__info}>
                  <span className={styles.sidebar__top}>
                    <span className={styles.sidebar__name}>{chat.title}</span>
                    <span className={styles.sidebar__time}>
                      {chat.lastMessageTimestamp ? formatTime(chat.lastMessageTimestamp) : ''}
                    </span>
                  </span>
                  <span className={styles.sidebar__preview}>{chat.lastMessageText}</span>
                </span>
                {chat.unread ? <span className={styles.sidebar__badge} /> : null}
              </button>
            );
          })
        )}
      </nav>

      <ConnectionStatus />
    </aside>
  );
}
