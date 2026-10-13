import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import MessageItem from '@/widgets/chat/ui/MessageItem';

import type { Message } from '@/entities/message';

function buildMessage(overrides: Partial<Message>): Message {
  return {
    id: 'm1',
    chatId: 'c1',
    text: 'текст',
    direction: 'incoming',
    timestamp: new Date(2026, 9, 10, 12, 30).getTime(),
    status: 'sent',
    ...overrides,
  };
}

function queryByClass(container: HTMLElement, className: string): Element | null {
  return container.querySelector(`[class*="${className}"]`);
}

describe('MessageItem', () => {
  it('показывает текст, время и дату при showDateDivider', () => {
    const { container } = render(
      <MessageItem message={buildMessage({ text: 'Привет!' })} showDateDivider />,
    );

    expect(container).toHaveTextContent('Привет!');
    expect(container).toHaveTextContent('12:30');
    expect(container).toHaveTextContent('10 октября');
    expect(queryByClass(container, 'message-item_out')).toBeNull();
  });

  it('не показывает дату без showDateDivider', () => {
    const { container } = render(
      <MessageItem message={buildMessage({})} showDateDivider={false} />,
    );

    expect(container).not.toHaveTextContent('10 октября');
  });

  it('исходящее сообщение выравнивается вправо и показывает галочку', () => {
    const { container } = render(
      <MessageItem message={buildMessage({ direction: 'outgoing' })} showDateDivider={false} />,
    );

    expect(queryByClass(container, 'message-item_out')).not.toBeNull();
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('неудачное сообщение показывает статус «Не отправлено»', () => {
    const { container } = render(
      <MessageItem
        message={buildMessage({ direction: 'outgoing', status: 'failed' })}
        showDateDivider={false}
      />,
    );

    expect(container).toHaveTextContent('Не отправлено');
  });

  it('отправляющееся сообщение не показывает галочку', () => {
    const { container } = render(
      <MessageItem
        message={buildMessage({ direction: 'outgoing', status: 'pending' })}
        showDateDivider={false}
      />,
    );

    expect(container.querySelector('svg')).toBeNull();
  });
});
