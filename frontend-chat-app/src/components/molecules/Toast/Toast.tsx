import React from 'react';
import styles from './Toast.module.scss';

interface ToastItem {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface Props {
  toasts: ToastItem[];
}

const ToastContainer: React.FC<Props> = ({ toasts }) => {
  if (!toasts.length) return null;

  return (
    <div className={styles.container}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${styles.toast} ${styles[t.type ?? 'success']}`}
        >
          <span className={styles.icon}>
            {t.type === 'error' ? '✕' : '✓'}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
