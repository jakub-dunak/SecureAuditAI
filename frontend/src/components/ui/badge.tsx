import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  icon
}) => {
  const baseClasses = 'badge inline-flex items-center gap-1';

  const variantClasses = {
    default: 'badge-info',
    primary: 'bg-primary-100 text-primary-800',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'bg-primary-100 text-primary-800',
    outline: 'border border-neutral-300 text-neutral-700 bg-transparent'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  return (
    <span className={cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    )}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

// Security-specific badge variants
export const SecurityBadge: React.FC<{
  severity: 'low' | 'medium' | 'high' | 'critical';
  children: React.ReactNode;
  className?: string;
}> = ({ severity, children, className = '' }) => {
  const severityConfig = {
    low: { variant: 'success' as const, icon: '🟢' },
    medium: { variant: 'warning' as const, icon: '🟡' },
    high: { variant: 'error' as const, icon: '🟠' },
    critical: { variant: 'error' as const, icon: '🔴' }
  };

  const config = severityConfig[severity];

  return (
    <Badge
      variant={config.variant}
      className={cn('font-semibold uppercase tracking-wide', className)}
      icon={<span className="text-xs">{config.icon}</span>}
    >
      {children}
    </Badge>
  );
};

// Status badge variants
export const StatusBadge: React.FC<{
  status: 'pass' | 'fail' | 'warning' | 'running' | 'pending' | 'completed';
  children: React.ReactNode;
  className?: string;
}> = ({ status, children, className = '' }) => {
  const statusConfig = {
    pass: { className: 'status-pass' },
    fail: { className: 'status-fail' },
    warning: { className: 'status-warning' },
    running: { className: 'status-running' },
    pending: { className: 'bg-neutral-100 text-neutral-800' },
    completed: { className: 'status-pass' }
  };

  return (
    <span className={cn(
      'status-indicator',
      statusConfig[status].className,
      className
    )}>
      {children}
    </span>
  );
};
