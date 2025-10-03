import React from 'react';
import { buttonTokens } from '../../assets/design-tokens';
import { ARIA_LABELS, announceToScreenReader } from '../../utils/accessibility';

const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  onClick,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  loadingText = 'Loading...',
  ...props
}, ref) => {
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'rounded-lg',
    'border',
    'transition-all',
    'duration-200',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'focus:ring-primary-500',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'disabled:pointer-events-none'
  ];

  const sizeClasses = {
    sm: ['px-3', 'py-1.5', 'text-sm'],
    md: ['px-4', 'py-2', 'text-sm'],
    lg: ['px-6', 'py-3', 'text-base'],
    xl: ['px-8', 'py-4', 'text-lg']
  };

  const variantClasses = {
    primary: [
      'bg-primary-500',
      'border-primary-500',
      'text-white',
      'hover:bg-primary-600',
      'hover:border-primary-600',
      'active:bg-primary-700',
      'shadow-sm',
      'hover:shadow-md'
    ],
    secondary: [
      'bg-white',
      'border-primary-300',
      'text-primary-700',
      'hover:bg-primary-50',
      'hover:border-primary-400',
      'active:bg-primary-100',
      'shadow-sm',
      'hover:shadow-md'
    ],
    danger: [
      'bg-error-500',
      'border-error-500',
      'text-white',
      'hover:bg-error-600',
      'hover:border-error-600',
      'active:bg-error-700',
      'shadow-sm',
      'hover:shadow-md'
    ],
    ghost: [
      'bg-transparent',
      'border-transparent',
      'text-primary-600',
      'hover:bg-primary-50',
      'hover:text-primary-700',
      'active:bg-primary-100'
    ]
  };

  const classes = [
    ...baseClasses,
    ...sizeClasses[size],
    ...variantClasses[variant],
    className
  ].join(' ');

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  // Generate accessible label
  const getAccessibleLabel = () => {
    if (loading) {
      return ariaLabel ? `${ariaLabel} - ${loadingText}` : loadingText;
    }
    return ariaLabel;
  };

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={handleClick}
      aria-disabled={disabled || loading}
      aria-label={getAccessibleLabel()}
      aria-describedby={ariaDescribedBy}
      {...props}
    >
      {loading && (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
            role="img"
            aria-label="Loading spinner"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="sr-only">{loadingText}</span>
        </>
      )}
      <span aria-hidden={loading ? 'true' : 'false'}>
        {children}
      </span>
    </button>
  );
});

Button.displayName = 'Button';

export default Button;