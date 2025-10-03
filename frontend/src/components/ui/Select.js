import React from 'react';
import { generateId, ARIA_LABELS } from '../../utils/accessibility';

const Select = React.forwardRef(({
  label,
  error,
  helperText,
  required = false,
  className = '',
  id,
  children,
  placeholder,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}, ref) => {
  const selectId = id || generateId('select');
  const errorId = error ? `${selectId}-error` : undefined;
  const helperTextId = helperText ? `${selectId}-helper` : undefined;
  
  // Combine all describedby IDs
  const allDescribedBy = [
    errorId,
    helperTextId,
    ariaDescribedBy
  ].filter(Boolean).join(' ') || undefined;

  const baseSelectClasses = [
    'block',
    'w-full',
    'px-3',
    'py-2',
    'border',
    'rounded-md',
    'shadow-sm',
    'bg-white',
    'text-gray-900',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-0',
    'transition-colors',
    'duration-200',
    'disabled:bg-gray-50',
    'disabled:text-gray-500',
    'disabled:cursor-not-allowed',
    'appearance-none',
    'bg-no-repeat',
    'bg-right',
    'pr-10'
  ];

  const selectStateClasses = error
    ? [
        'border-error-300',
        'focus:border-error-500',
        'focus:ring-error-500'
      ]
    : [
        'border-gray-300',
        'focus:border-primary-500',
        'focus:ring-primary-500'
      ];

  const selectClasses = [
    ...baseSelectClasses,
    ...selectStateClasses,
    className
  ].join(' ');

  const chevronIcon = (
    <svg
      className="h-5 w-5 text-gray-400 pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={selectId}
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
      
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={selectClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={allDescribedBy}
          aria-required={required}
          aria-label={!label ? ariaLabel : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          {chevronIcon}
        </div>
      </div>
      
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

Select.displayName = 'Select';

export default Select;