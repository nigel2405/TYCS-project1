import React from 'react';

const Loading = ({
  size = 'md',
  color = 'primary',
  text = 'Loading...',
  className = '',
  inline = false,
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };
  
  const colorClasses = {
    primary: 'border-primary-500',
    secondary: 'border-secondary-500',
    success: 'border-success-500',
    warning: 'border-warning-500',
    error: 'border-error-500',
    white: 'border-white'
  };
  
  const Wrapper = inline ? 'span' : 'div';
  const wrapperClasses = inline 
    ? 'inline-flex items-center gap-2'
    : 'flex flex-col items-center justify-center gap-3';
  
  return (
    <Wrapper 
      className={`${wrapperClasses} ${className}`}
      role="status"
      aria-live="polite"
      {...props}
    >
      <div
        className={`
          animate-spin rounded-full border-2 border-gray-200 border-t-transparent
          ${sizeClasses[size]} ${colorClasses[color]}
        `}
        aria-hidden="true"
      />
      
      {text && (
        <span className={`text-gray-600 ${inline ? 'text-sm' : 'text-base'}`}>
          {text}
        </span>
      )}
      
      <span className="sr-only">Loading content, please wait</span>
    </Wrapper>
  );
};

// Skeleton loading component for content placeholders
export const Skeleton = ({
  width = 'w-full',
  height = 'h-4',
  className = '',
  rounded = 'rounded',
  ...props
}) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 ${width} ${height} ${rounded} ${className}`}
      role="status"
      aria-label="Loading content"
      {...props}
    />
  );
};

// Skeleton text lines
export const SkeletonText = ({
  lines = 3,
  className = '',
  ...props
}) => {
  return (
    <div className={`space-y-2 ${className}`} role="status" aria-label="Loading text content" {...props}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? 'w-3/4' : 'w-full'}
          height="h-4"
        />
      ))}
    </div>
  );
};

export default Loading;