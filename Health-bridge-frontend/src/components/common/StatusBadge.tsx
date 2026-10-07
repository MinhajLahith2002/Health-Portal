import React from 'react';
import styles from './common.module.css';

interface StatusBadgeProps {
  label: string;
  color: 'green' | 'orange';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, color }) => {
  return (
    <span className={`${styles.statusBadge} ${styles[color]}`}>
      {label}
    </span>
  );
};
