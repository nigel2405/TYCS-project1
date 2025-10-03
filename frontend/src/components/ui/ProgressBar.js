import React from 'react';
import { createProgressProps } from '../../utils/accessibility';

const ProgressBar = ({
  value,
  max = 100,
  label,
  className = '',
  showPercentage = true,
  color = 'primary',
  size = 'md',
  ...props
}) => {
  const percentage = Math.round((value / max) * 100);
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };
  
  const colorClasses = {
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
    info: 'bg-info-500'
  };
  
  const progressProps = createProgressProps(value, max, label);
  
  return (
    <div className={`w-full ${className}`} {...props}>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-500">{percentage}%</span>
          )}
        </div>
      )}
      
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <div
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-300 ease-in-out`}
          style={{ width: `${percentage}%` }}
          {...progressProps}
        />
      </div>
      
      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="polite">
        {label ? `${label}: ` : ''}{percentage}% complete
      </div>
    </div>
  );
};

export default ProgressBar;