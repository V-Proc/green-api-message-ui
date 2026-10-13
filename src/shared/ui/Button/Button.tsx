import type { ButtonHTMLAttributes } from 'react';

import styles from './Button.module.scss';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ className, type = 'button', ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={className ? `${styles.button} ${className}` : styles.button}
      {...rest}
    />
  );
}
