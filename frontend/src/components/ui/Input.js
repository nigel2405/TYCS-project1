import React from 'react';
import { generateId, ARIA_LABELS } from '../../utils/accessibility';

const Input = React.forwardRef(({
  label,
  error,
  helperText,
  required = false,
  className = '',
  id,
  type = 'text',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}, ref) => {
  const inputId = id || generateId('input');
  const errorId = error ? `${inputId}-error` : undefined;
  const helperTextId = helperText ? `${inputId}-helper` : undefined;
  
  // Combine all describedby IDs
  const allDescribedBy = [
    errorId,
    helperTextId,
    ariaDescribedBy
  ].filter(Boolean).join(' ') || undefined;

  const baseInputClasses = [
    'block',
    'w-full',
    'px-3',
    'py-2',
    'border',
    'rounded-md',
    'shadow-sm',
    'placeholder-gray-400',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-0',
    'transition-colors',
    'duration-200',
    'disabled:bg-gray-50',
    'disabled:text-gray-500',
    'disabled:cursor-not-allowed'
  ];

  const inputStateClasses = error
    ? [
        'border-error-300',
        'text-error-900',
        'focus:border-error-500',
        'focus:ring-error-500'
      ]
    : [
        'border-gray-300',
        'text-gray-900',
        'focus:border-primary-500',
        'focus:ring-primary-500'
      ];

  const inputClasses = [
    ...baseInputClasses,
    ...inputStateClasses,
    className
  ].join(' ');

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && (
            <span className="text-error-500 ml-1" aria-label={ARIA_LABELS.REQUIRED}>
              *
            </span>
          )}
        </label>
      )}
      
      <input
        ref={ref}
        id={inputId}
        type={type}
        className={inputClasses}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={allDescribedBy}
        aria-required={required}
        aria-label={!label ? ariaLabel : undefined}
        {...props}
      />
      
      {error && (
        <p
          id={errorId}
          className="text-sm text-error-600"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p
          id={helperTextId}
          className="text-sm text-gray-500"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;