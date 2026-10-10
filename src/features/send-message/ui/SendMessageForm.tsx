import { useEffect, useRef, type KeyboardEvent } from 'react';
import { useAppDispatch } from '@/app/store/ReduxHooks';
import { sendMessage } from '@/features/send-message';
import { Button } from '@/shared/ui';
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
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3.4 20.4 20.85 12.92a1 1 0 0 0 0-1.84L3.4 3.6a.9.9 0 0 0-1.25 1.06L4.5 11.1a1 1 0 0 0 .86.83l9.24 1.07-9.24 1.07a1 1 0 0 0-.86.83l-2.35 6.44a.9.9 0 0 0 1.25 1.06Z" />
        </svg>
      </Button>
    </form>
  );
}