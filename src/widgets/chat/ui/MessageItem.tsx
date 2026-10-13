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

  if (message.status === 'failed') {
    bubbleClass.push(styles['message-item__bubble_failed']);
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
              <span className={styles['message-item__status']}>Не отправлено</span>
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
