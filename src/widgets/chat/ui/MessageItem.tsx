import { formatTime } from '@/shared/lib/FormatHelpers';

import type { Message } from '@/entities/message';

import styles from './MessageItem.module.scss';

type MessageItemProps = {
  message: Message;
  showDateDivider: boolean;
};

export default function MessageItem({ message, showDateDivider }: MessageItemProps) {
  const isOutgoing = message.direction === 'outgoing';

  const bubbleClass = [styles['message-item__bubble']];

  if (isOutgoing) {
    bubbleClass.push(styles['message-item__bubble_out']);
  }

  const itemClass = [styles['message-item']];

  if (isOutgoing) {
    itemClass.push(styles['message-item_out']);
  }

  return (
    <>
      {showDateDivider ? (
        <div className={styles['message-item__date']}>
          {new Date(message.timestamp).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
          })}
        </div>
      ) : null}
      <div className={itemClass.join(' ')}>
        <div className={bubbleClass.join(' ')}>
          <p className={styles['message-item__text']}>{message.text}</p>
          <span className={styles['message-item__meta']}>
            {message.status === 'failed' ? (
              <span className={styles['message-item__status']} title={message.error}>
                <svg
                  className={styles['message-item__failed-icon']}
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <circle cx="8" cy="8" r="6.7" stroke="currentColor" strokeWidth="1.4" fill="none" />
                  <path d="M8 4.4v4.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="8" cy="11.6" r="0.9" fill="currentColor" />
                </svg>
                Не отправлено
              </span>
            ) : null}
            <span className={styles['message-item__time']}>{formatTime(message.timestamp)}</span>
            {isOutgoing && message.status === 'sent' ? (
              <svg className={styles['message-item__tick']} width="16" height="12" viewBox="0 0 16 12">
                <path
                  d="M1 6.5 4.8 10 15 1"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            ) : null}
          </span>
        </div>
      </div>
    </>
  );
}
