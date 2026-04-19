import React from 'react';
import styles from './Spinner.module.scss';

interface Props {
  size?: number;
}

const Spinner: React.FC<Props> = ({ size = 20 }) => (
  <div className={styles.spinner} style={{ width: size, height: size }} />
);

export default Spinner;
