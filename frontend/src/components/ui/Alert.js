import React from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { ARIA_ROLES, ARIA_LIVE } from '../../utils/accessibility';

const Alert = ({
  type = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  className = '',
  icon: CustomIcon,
  ...props
}) => {
  const typeConfig = {
    success: {
      bgColor: 'bg-success-50',
      borderColor: 'border-success-200',
      textColor: 'text-success-800',
      iconColor: 'text-success-500',
      icon: FaCheckCircle,
      ariaLive: ARIA_LIVE.POLITE
    },
    error: {
      bgColor: 'bg-error-50',
      borderColor: 'border-error-200',
      textColor: 'text-error-800',
      iconColor: 'text-error-500',
      icon: FaExclamationCircle,
      ariaLive: ARIA_LIVE.ASSERTIVE
    },
    warning: {
      bgColor: 'bg-warning-50',
      borderColor: 'border-warning-200',
      textColor: 'text-warning-800',
      iconColor: 'text-warning-500',
      icon: FaExclamationTriangle,
      ariaLive: ARIA_LIVE.POLITE
    },
    info: {
      bgColor: 'bg-info-50',
      borderColor: 'border-info-200',
      textColor: 'text-info-800',
      iconColor: 'text-info-500',
      icon: FaInfoCircle,
      ariaLive: ARIA_LIVE.POLITE
    }
  };
  
  const config = typeConfig[type];
  const IconComponent = CustomIcon || config.icon;
  
  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && dismissible) {
      handleDismiss();
    }
  };
  
  return (
    <div
      className={`
        rounded-lg border p-4 flex items-start gap-3
        ${config.bgColor} ${config.borderColor} ${config.textColor}
        ${className}
      `}
      role={type === 'error' ? ARIA_ROLES.ALERT : ARIA_ROLES.STATUS}
      aria-live={config.ariaLive}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        <IconComponent 
          className={`w-5 h-5 ${config.iconColor}`}
          aria-hidden="true"
        />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className="text-sm font-semibold mb-1">
            {title}
          </h3>
        )}
        
        <div className="text-sm">
          {children}
        </div>
      </div>
      
      {/* Dismiss button */}
      {dismissible && (
        <button
          onClick={handleDismiss}
          className={`
            flex-shrink-0 p-1 rounded-md transition-colors duration-200
            hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 
            focus:ring-offset-2 focus:ring-offset-transparent focus:ring-current
          `}
          aria-label="Dismiss alert"
        >
          <FaTimes className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

// Specific alert variants for common use cases
export const SuccessAlert = (props) => <Alert type="success" {...props} />;
export const ErrorAlert = (props) => <Alert type="error" {...props} />;
export const WarningAlert = (props) => <Alert type="warning" {...props} />;
export const InfoAlert = (props) => <Alert type="info" {...props} />;

export default Alert;