import React from 'react';
import { cn } from '../../utils/cn';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text,
  className = '',
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50'
    : 'flex flex-col items-center justify-center p-8';

  return (
    <div className={cn(containerClasses, className)}>
      <div className={cn('loading-spinner', sizeClasses[size])} />
      {text && (
        <p className="mt-4 text-sm text-neutral-600 text-center">
          {text}
        </p>
      )}
    </div>
  );
};

interface LoadingCardProps {
  title?: string;
  description?: string;
  className?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  title = 'Loading...',
  description,
  className = ''
}) => (
  <div className={cn('card p-8', className)}>
    <div className="text-center space-y-4">
      <div className="loading-spinner w-8 h-8 mx-auto" />
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-neutral-600 text-sm">
            {description}
          </p>
        )}
      </div>
    </div>
  </div>
);

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  lines = 1
}) => (
  <div className={cn('animate-pulse space-y-3', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="h-4 bg-neutral-200 rounded"
        style={{
          width: lines === 1 ? '100%' : `${Math.random() * 40 + 60}%`
        }}
      />
    ))}
  </div>
);
