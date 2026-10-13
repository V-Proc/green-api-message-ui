import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { createTestStore, renderWithStore } from '@/shared/lib/TestUtils';

import { selectChat, upsertChat } from '@/entities/chat';

import { connect } from '@/features/instance-connection';

import { ChatWindow } from '@/widgets/chat';

function renderSelectedChat() {
  const store = createTestStore();
  store.dispatch(connect({ idInstance: '111', apiTokenInstance: 'aaa' }));
  store.dispatch(
    upsertChat({
      chatId: '10000000',
      title: 'Ходабрыш',
      lastMessageText: '',
      lastMessageTimestamp: Date.now(),
    }),
  );
  store.dispatch(selectChat('10000000'));

  return renderWithStore(<ChatWindow />, store);
}

describe('ChatWindow', () => {
  it('показывает пустое состояние, когда чат не выбран', () => {
    renderWithStore(<ChatWindow />);

    expect(screen.getByText('Выберите чат, чтобы начать переписку')).toBeInTheDocument();
  });

  it('показывает имя и ID выбранного чата в шапке', () => {
    renderSelectedChat();

    expect(screen.getByText('Ходабрыш')).toBeInTheDocument();
    expect(screen.getByText('10000000')).toBeInTheDocument();
  });

  it('кнопка «Сменить инстанс» отключает соединение', async () => {
    const user = userEvent.setup();
    const { store } = renderSelectedChat();

    await user.click(screen.getByRole('button', { name: 'Отключиться' }));

    expect(store.getState().connection.isConnected).toBe(false);
  });

  it('рендерит форму отправки для выбранного чата', () => {
    renderSelectedChat();

    expect(screen.getByPlaceholderText('Написать сообщение...')).toBeInTheDocument();
  });

  it('disconnect не показывается, когда чат не выбран', () => {
    renderWithStore(<ChatWindow />);

    expect(screen.queryByRole('button', { name: 'Отключиться' })).not.toBeInTheDocument();
  });
});
