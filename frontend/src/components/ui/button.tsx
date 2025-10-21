import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  icon,
  iconPosition = 'left'
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-lg';

  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-soft hover:shadow-medium',
    secondary: 'bg-white text-neutral-900 hover:bg-neutral-50 focus:ring-primary-500 border border-neutral-300 shadow-soft hover:shadow-medium',
    outline: 'border border-neutral-300 bg-transparent text-neutral-700 hover:bg-neutral-50 focus:ring-primary-500',
    ghost: 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus:ring-primary-500',
    success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 shadow-soft hover:shadow-medium',
    warning: 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500 shadow-soft hover:shadow-medium',
    error: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500 shadow-soft hover:shadow-medium'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
    xl: 'px-8 py-4 text-lg gap-3'
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        isDisabled && 'cursor-not-allowed',
        className
      )}
    >
      {loading && (
        <div className="loading-spinner w-4 h-4" />
      )}
      {!loading && icon && iconPosition === 'left' && icon}
      <span className={loading ? 'ml-2' : ''}>{children}</span>
      {!loading && icon && iconPosition === 'right' && icon}
    </button>
  );
};
