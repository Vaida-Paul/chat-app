import React from 'react';
import styles from './Modal.module.scss';

interface Props {
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

const Modal: React.FC<Props> = ({
  title,
  description,
  confirmLabel,
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
}) => (
  <>
    <div className={styles.overlay} onClick={onCancel} />
    <div className={styles.modal}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.desc}>{description}</p>
      <div className={styles.actions}>
        <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
        <button
          className={`${styles.confirmBtn} ${styles[confirmVariant]}`}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </>
);

export default Modal;
