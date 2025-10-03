import React from 'react';
import { generateId, ARIA_LABELS } from '../../utils/accessibility';

const Textarea = React.forwardRef(({
  label,
  error,
  helperText,
  required = false,
  className = '',
  id,
  rows = 4,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}, ref) => {
  const textareaId = id || generateId('textarea');
  const errorId = error ? `${textareaId}-error` : undefined;
  const helperTextId = helperText ? `${textareaId}-helper` : undefined;
  
  // Combine all describedby IDs
  const allDescribedBy = [
    errorId,
    helperTextId,
    ariaDescribedBy
  ].filter(Boolean).join(' ') || undefined;

  const baseTextareaClasses = [
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
    'disabled:cursor-not-allowed',
    'resize-vertical'
  ];

  const textareaStateClasses = error
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

  const textareaClasses = [
    ...baseTextareaClasses,
    ...textareaStateClasses,
    className
  ].join(' ');

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={textareaId}
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
      
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={textareaClasses}
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

Textarea.displayName = 'Textarea';

export default Textarea;