import { describe, expect, it } from 'vitest';

import { formatChatTitle, formatTime } from '@/shared/lib/FormatHelpers';

describe('FormatHelpers', () => {
  it('formatTime форматирует время в ЧЧ:ММ', () => {
    const timestamp = new Date(2026, 9, 10, 9, 5).getTime();

    expect(formatTime(timestamp)).toBe('09:05');
  });

  it('formatChatTitle убирает суффикс @c.us у номера телефона', () => {
    expect(formatChatTitle('79991234567@c.us')).toBe('79991234567');
  });

  it('formatChatTitle не меняет пользовательский ID', () => {
    expect(formatChatTitle('10000000')).toBe('10000000');
  });

  it('formatChatTitle не меняет ID группового чата', () => {
    expect(formatChatTitle('-10000000000000')).toBe('-10000000000000');
  });
});
