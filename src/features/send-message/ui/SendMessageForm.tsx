import { type KeyboardEvent,useEffect, useRef } from 'react';

import { Button } from '@/shared/ui';

import { sendMessage } from '@/features/send-message';

import { useAppDispatch } from '@/app/store/ReduxHooks';

import styles from './SendMessageForm.module.scss';

type SendMessageFormProps = {
  chatId: string;
};

export default function SendMessageForm({ chatId }: SendMessageFormProps) {
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [chatId]);

  const submit = () => {
    const input = inputRef.current;

    if (!input) {
      return;
    }

    const text = input.value.trim();

    if (!text) {
      return;
    }

    input.value = '';
    dispatch(sendMessage({ chatId, text }));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form className={styles['message-form']} onSubmit={(event) => event.preventDefault()}>
      <textarea
        ref={inputRef}
        className={styles['message-form__input']}
        placeholder="Написать сообщение..."
        rows={1}
        onKeyDown={handleKeyDown}
      />
      <Button
        className={styles['message-form__send']}
        type="submit"
        aria-label="Отправить"
        onClick={submit}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 21V4M4 12 12 4 20 12"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Button>
    </form>
  );
}
