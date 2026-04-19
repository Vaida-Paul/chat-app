import React from 'react';
import styles from './IconButton.module.scss';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: number;
  variant?: 'default' | 'ghost' | 'danger';
  active?: boolean;
}

const IconButton: React.FC<Props> = ({
  children,
  size = 34,
  variant = 'default',
  active = false,
  className,
  ...rest
}) => {
  return (
    <button
      className={`
        ${styles.btn}
        ${styles[`variant-${variant}`]}
        ${active ? styles.active : ''}
        ${className ?? ''}
      `}
      style={{ width: size, height: size }}
      {...rest}
    >
      {children}
    </button>
  );
};

export default IconButton;
