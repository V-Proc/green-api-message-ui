import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderWithStore } from '@/shared/lib/TestUtils';

import { ConnectionForm } from '@/features/instance-connection';

afterEach(() => {
  localStorage.clear();
  vi.useRealTimers();
});

describe('ConnectionForm', () => {
  it('показывает ошибку при отправке пустой формы и не подключается', async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<ConnectionForm />);

    await user.click(screen.getByRole('button', { name: 'Подключиться' }));

    expect(screen.getByText('Заполните оба поля')).toBeInTheDocument();
    expect(store.getState().connection.isConnected).toBe(false);
  });

  it('подключается и сохраняет креденшалы в localStorage', async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<ConnectionForm />);

    await user.type(screen.getByPlaceholderText('idInstance'), '1101234567');
    await user.type(screen.getByPlaceholderText('apiTokenInstance'), 'secret');
    await user.click(screen.getByRole('button', { name: 'Подключиться' }));

    expect(store.getState().connection.isConnected).toBe(true);
    expect(JSON.parse(localStorage.getItem('green-api-credentials') ?? '{}')).toEqual({
      idInstance: '1101234567',
      apiTokenInstance: 'secret',
    });
  });

  it('обрезает пробелы в креденшалах перед подключением', async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<ConnectionForm />);

    await user.type(screen.getByPlaceholderText('idInstance'), '  110  ');
    await user.type(screen.getByPlaceholderText('apiTokenInstance'), ' secret ');
    await user.click(screen.getByRole('button', { name: 'Подключиться' }));

    expect(store.getState().connection.idInstance).toBe('110');
    expect(store.getState().connection.apiTokenInstance).toBe('secret');
  });

  it('ошибка валидации исчезает через 5 секунд', () => {
    vi.useFakeTimers();
    renderWithStore(<ConnectionForm />);

    fireEvent.click(screen.getByRole('button', { name: 'Подключиться' }));
    expect(screen.getByText('Заполните оба поля')).toBeInTheDocument();

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.queryByText('Заполните оба поля')).not.toBeInTheDocument();
  });
});
