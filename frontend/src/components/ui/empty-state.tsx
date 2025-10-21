import React from 'react';
import { cn } from '../../utils/cn';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = ''
}) => (
  <div className={cn(
    'flex flex-col items-center justify-center py-12 px-4 text-center',
    className
  )}>
    {icon && (
      <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
      {title}
    </h3>
    {description && (
      <p className="text-neutral-600 max-w-md mb-6">
        {description}
      </p>
    )}
    {action && (
      <div className="flex justify-center">
        {action}
      </div>
    )}
  </div>
);

interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  description = 'We encountered an error while loading this content. Please try again.',
  action,
  className = ''
}) => (
  <div className={cn(
    'flex flex-col items-center justify-center py-12 px-4 text-center',
    className
  )}>
    <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mb-4">
      <svg className="w-8 h-8 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
      {title}
    </h3>
    <p className="text-neutral-600 max-w-md mb-6">
      {description}
    </p>
    {action && (
      <div className="flex justify-center">
        {action}
      </div>
    )}
  </div>
);
