import React, { useState, useEffect, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { FaCheckCircle, FaExclamationTriangle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { ARIA_ROLES, ARIA_LIVE, announceToScreenReader } from '../../utils/accessibility';

// Toast Context
const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Provider Component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = {
      id,
      type: 'info',
      duration: 5000,
      dismissible: true,
      ...toast
    };
    
    setToasts(prev => [...prev, newToast]);
    
    // Announce to screen readers
    announceToScreenReader(
      `${newToast.type}: ${newToast.title || newToast.message}`,
      newToast.type === 'error' ? ARIA_LIVE.ASSERTIVE : ARIA_LIVE.POLITE
    );
    
    // Auto dismiss
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const removeAllToasts = () => {
    setToasts([]);
  };

  // Convenience methods
  const toast = {
    success: (message, options = {}) => addToast({ type: 'success', message, ...options }),
    error: (message, options = {}) => addToast({ type: 'error', message, duration: 0, ...options }),
    warning: (message, options = {}) => addToast({ type: 'warning', message, ...options }),
    info: (message, options = {}) => addToast({ type: 'info', message, ...options }),
    custom: (toast) => addToast(toast)
  };

  return (
    <ToastContext.Provider value={{ toast, removeToast, removeAllToasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// Individual Toast Component
const Toast = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && toast.dismissible) {
      handleRemove();
    }
  };

  const typeConfig = {
    success: {
      bgColor: 'bg-success-50',
      borderColor: 'border-success-200',
      textColor: 'text-success-800',
      iconColor: 'text-success-500',
      icon: FaCheckCircle
    },
    error: {
      bgColor: 'bg-error-50',
      borderColor: 'border-error-200',
      textColor: 'text-error-800',
      iconColor: 'text-error-500',
      icon: FaExclamationCircle
    },
    warning: {
      bgColor: 'bg-warning-50',
      borderColor: 'border-warning-200',
      textColor: 'text-warning-800',
      iconColor: 'text-warning-500',
      icon: FaExclamationTriangle
    },
    info: {
      bgColor: 'bg-info-50',
      borderColor: 'border-info-200',
      textColor: 'text-info-800',
      iconColor: 'text-info-500',
      icon: FaInfoCircle
    }
  };

  const config = typeConfig[toast.type];
  const IconComponent = config.icon;

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out mb-4
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isLeaving ? 'scale-95' : 'scale-100'}
      `}
      role={toast.type === 'error' ? ARIA_ROLES.ALERT : ARIA_ROLES.STATUS}
      aria-live={toast.type === 'error' ? ARIA_LIVE.ASSERTIVE : ARIA_LIVE.POLITE}
      onKeyDown={handleKeyDown}
      tabIndex={toast.dismissible ? 0 : -1}
    >
      <div className={`
        max-w-sm w-full bg-white shadow-lg rounded-lg border pointer-events-auto
        ${config.borderColor} ${config.textColor}
      `}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <IconComponent 
                className={`w-5 h-5 ${config.iconColor}`}
                aria-hidden="true"
              />
            </div>
            
            <div className="ml-3 w-0 flex-1">
              {toast.title && (
                <p className="text-sm font-semibold">
                  {toast.title}
                </p>
              )}
              
              <p className={`text-sm ${toast.title ? 'mt-1' : ''}`}>
                {toast.message}
              </p>
              
              {toast.action && (
                <div className="mt-3">
                  <button
                    onClick={toast.action.onClick}
                    className="text-sm font-medium text-primary-600 hover:text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
                  >
                    {toast.action.label}
                  </button>
                </div>
              )}
            </div>
            
            {toast.dismissible && (
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  onClick={handleRemove}
                  className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  aria-label="Dismiss notification"
                >
                  <FaTimes className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Progress bar for auto-dismiss */}
        {toast.duration > 0 && (
          <div className="h-1 bg-gray-200">
            <div 
              className="h-full bg-primary-500 transition-all ease-linear"
              style={{
                animation: `shrink ${toast.duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Toast Container Component
const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50"
      aria-live="polite"
      aria-label="Notifications"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            toast={toast}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>,
    document.body
  );
};

// Add CSS animation for progress bar
const style = document.createElement('style');
style.textContent = `
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
`;
document.head.appendChild(style);

export default Toast;