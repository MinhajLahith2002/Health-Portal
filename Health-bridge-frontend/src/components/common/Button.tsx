import React, { ButtonHTMLAttributes } from 'react';
import styles from './common.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  icon,
  className = '',
  ...props 
}) => {
  return (
    <button 
      className={`${styles.button} ${styles[variant]} ${className}`}
      {...props}
    >
      {icon && <span style={{ marginRight: '6px', display: 'flex' }}>{icon}</span>}
      {children}
    </button>
  );
};
