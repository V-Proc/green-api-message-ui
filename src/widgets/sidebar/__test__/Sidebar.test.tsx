import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { selectChat, upsertChat } from '@/entities/chat';
import { Sidebar } from '@/widgets/sidebar';
import { createTestStore, renderWithStore, type TestStore } from '@/shared/lib/TestUtils';

function seedChat(
  store: TestStore,
  chatId: string,
  overrides: { markUnread?: boolean; lastMessageText?: string } = {},
) {
  store.dispatch(
    upsertChat({
      chatId,
      title: chatId,
      lastMessageText: overrides.lastMessageText ?? '',
      lastMessageTimestamp: Date.now(),
      markUnread: overrides.markUnread,
    }),
  );
}

describe('Sidebar', () => {
  it('показывает подсказку, когда чатов нет', () => {
    renderWithStore(<Sidebar />);

    expect(
      screen.getByText('Введите ID чата или дождитесь входящих сообщений'),
    ).toBeInTheDocument();
  });

  it('показывает список чатов и выбирает чат по клику', async () => {
    const user = userEvent.setup();
    const store = createTestStore();
    seedChat(store, 'c1', { lastMessageText: 'Последнее' });
    seedChat(store, 'c2');

    renderWithStore(<Sidebar />, store);

    await user.click(screen.getByRole('button', { name: /c1/ }));

    expect(store.getState().chats.selectedChatId).toBe('c1');
  });

  it('помечает выбранный чат классом активного элемента', () => {
    const store = createTestStore();
    seedChat(store, 'c1');
    seedChat(store, 'c2');
    store.dispatch(selectChat('c2'));

    renderWithStore(<Sidebar />, store);

    expect(screen.getByRole('button', { name: /c2/ }).className).toContain(
      'sidebar__item_active',
    );
  });

  it('показывает бейдж у чата с непрочитанным сообщением', () => {
    const store = createTestStore();
    seedChat(store, 'c1', { markUnread: true });

    renderWithStore(<Sidebar />, store);

    expect(
      screen.getByRole('button', { name: /c1/ }).querySelector('[class*="sidebar__badge"]'),
    ).not.toBeNull();
  });

  it('создаёт новый чат по введённому ID и выбирает его', async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<Sidebar />);

    await user.type(screen.getByPlaceholderText(/ID чата/), '79991234567@c.us');
    await user.click(screen.getByRole('button', { name: 'Открыть чат' }));

    const state = store.getState().chats;

    expect(state.selectedChatId).toBe('79991234567@c.us');
    expect(state.byId['79991234567@c.us'].title).toBe('79991234567');
  });

  it('не создаёт чат для пустого поля', async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<Sidebar />);

    await user.click(screen.getByRole('button', { name: 'Открыть чат' }));

    expect(store.getState().chats.ids).toHaveLength(0);
  });

  it('показывает текст последнего сообщения в превью чата', () => {
    const store = createTestStore();
    seedChat(store, 'c1', { lastMessageText: 'Привет от собеседника' });

    renderWithStore(<Sidebar />, store);

    expect(screen.getByText('Привет от собеседника')).toBeInTheDocument();
  });
});