import type { InputHTMLAttributes } from 'react';
import styles from './TextField.module.scss';

type TextFieldProps = InputHTMLAttributes<HTMLInputElement>;

export default function TextField({ className, ...rest }: TextFieldProps) {
  return (
    <input
      className={className ? `${styles.field} ${className}` : styles.field}
      {...rest}
    />
  );
}