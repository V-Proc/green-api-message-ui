import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { Avatar, Button, Spinner, TextField } from '@/shared/ui';

describe('Button', () => {
  it('рендерит детей и вызывает onClick', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Отправить</Button>);

    await user.click(screen.getByRole('button', { name: 'Отправить' }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('не вызывает onClick при disabled', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button disabled onClick={handleClick}>
        Отправить
      </Button>,
    );

    await user.click(screen.getByRole('button', { name: 'Отправить' }));

    expect(handleClick).not.toHaveBeenCalled();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('подмешивает переданный className к базовому', () => {
    render(<Button className="custom">Ok</Button>);

    expect(screen.getByRole('button', { name: 'Ok' }).className).toContain('custom');
  });
});

describe('TextField', () => {
  it('передаёт значение и onChange', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<TextField value="" placeholder="ID чата" onChange={handleChange} />);

    await user.type(screen.getByPlaceholderText('ID чата'), '1');

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('рендерится с переданным type', () => {
    render(<TextField type="password" placeholder="Пароль" value="" onChange={() => {}} />);

    expect(screen.getByPlaceholderText('Пароль')).toHaveAttribute('type', 'password');
  });
});

describe('Spinner', () => {
  it('рендерит индикатор с role status', () => {
    render(<Spinner />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

describe('Avatar', () => {
  it('показывает первую букву в верхнем регистре', () => {
    render(<Avatar title="анна" />);

    expect(screen.getByText('А')).toBeInTheDocument();
  });

  it('показывает # для пустого имени', () => {
    render(<Avatar title="  " />);

    expect(screen.getByText('#')).toBeInTheDocument();
  });

  it('генерирует цвет детерминированно от имени', () => {
    const { container } = render(<Avatar title="Иван" />);
    const first = container.querySelector('span')?.style.getPropertyValue('--avatar-color');

    expect(first).toBeTruthy();
  });
});