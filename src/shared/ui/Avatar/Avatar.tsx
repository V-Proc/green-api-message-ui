import type { CSSProperties } from 'react';

import styles from './Avatar.module.scss';

type AvatarProps = {
  title: string;
  className?: string;
};

function buildColor(title: string): string {
  const colors = ['#62a8f0', '#e079b6', '#7fd97f', '#f0a762', '#a88ce0', '#e0c462'];
  const hash = [...title].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 997, 7);

  return colors[hash % colors.length];
}

export default function Avatar({ title, className }: AvatarProps) {
  const letter = title.trim().charAt(0).toUpperCase() || '#';
  const style = { '--avatar-color': buildColor(title) } as CSSProperties;

  return (
    <span
      className={className ? `${styles.avatar} ${className}` : styles.avatar}
      style={style}
      aria-hidden="true"
    >
      {letter}
    </span>
  );
}
