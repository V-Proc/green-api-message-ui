import styles from './Spinner.module.scss';

export default function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={className ? `${styles.spinner} ${className}` : styles.spinner}
      role="status"
      aria-label="Загрузка"
    />
  );
}
