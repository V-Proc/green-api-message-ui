import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createTestStore, renderWithStore } from '@/shared/lib/TestUtils';

import { addMessage } from '@/entities/message';

import MessageList from '@/widgets/chat/ui/MessageList';

import type { Message } from '@/entities/message';

function buildMessage(id: string, day: number, text: string): Message {
  return {
    id,
    chatId: 'c1',
    text,
    direction: 'incoming',
    timestamp: new Date(2026, 9, day, 10, 0).getTime(),
    status: 'sent',
  };
}

function renderSeededList(messages: Message[]) {
  const store = createTestStore();
  messages.forEach((message) => store.dispatch(addMessage(message)));

  return renderWithStore(<MessageList chatId="c1" />, store);
}

describe('MessageList', () => {
  it('показывает все сообщения чата', () => {
    renderSeededList([
      buildMessage('m1', 10, 'Первое'),
      buildMessage('m2', 10, 'Второе'),
    ]);

    expect(screen.getByText('Первое')).toBeInTheDocument();
    expect(screen.getByText('Второе')).toBeInTheDocument();
  });

  it('вставляет разделитель даты между разными днями', () => {
    renderSeededList([
      buildMessage('m1', 10, 'Вчера'),
      buildMessage('m2', 11, 'Сегодня'),
    ]);

    expect(screen.getByText('10 октября')).toBeInTheDocument();
    expect(screen.getByText('11 октября')).toBeInTheDocument();
    expect(screen.getAllByText(/октября/)).toHaveLength(2);
  });

  it('показывает один разделитель даты внутри одного дня (над первым сообщением)', () => {
    renderSeededList([
      buildMessage('m1', 10, 'a'),
      buildMessage('m2', 10, 'b'),
    ]);

    expect(screen.getByText('10 октября')).toBeInTheDocument();
    expect(screen.getAllByText(/октября/)).toHaveLength(1);
  });

  it('показывает пустой список для чата без сообщений', () => {
    renderSeededList([]);

    expect(screen.queryByText(/октября/)).not.toBeInTheDocument();
  });
});
