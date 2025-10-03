import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { focusManager, KEYS, ARIA_ROLES } from '../../utils/accessibility';

const Dropdown = ({
  trigger,
  children,
  placement = 'bottom-start',
  offset = 8,
  className = '',
  menuClassName = '',
  disabled = false,
  closeOnSelect = true,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const toggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  const close = () => {
    setIsOpen(false);
  };

  const updatePosition = () => {
    if (!triggerRef.current || !menuRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    let top, left;

    switch (placement) {
      case 'bottom-start':
        top = triggerRect.bottom + scrollTop + offset;
        left = triggerRect.left + scrollLeft;
        break;
      case 'bottom-end':
        top = triggerRect.bottom + scrollTop + offset;
        left = triggerRect.right + scrollLeft - menuRect.width;
        break;
      case 'top-start':
        top = triggerRect.top + scrollTop - menuRect.height - offset;
        left = triggerRect.left + scrollLeft;
        break;
      case 'top-end':
        top = triggerRect.top + scrollTop - menuRect.height - offset;
        left = triggerRect.right + scrollLeft - menuRect.width;
        break;
      case 'right-start':
        top = triggerRect.top + scrollTop;
        left = triggerRect.right + scrollLeft + offset;
        break;
      case 'left-start':
        top = triggerRect.top + scrollTop;
        left = triggerRect.left + scrollLeft - menuRect.width - offset;
        break;
      default:
        top = triggerRect.bottom + scrollTop + offset;
        left = triggerRect.left + scrollLeft;
    }

    // Keep menu within viewport
    const padding = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < padding) {
      left = padding;
    } else if (left + menuRect.width > viewportWidth - padding) {
      left = viewportWidth - menuRect.width - padding;
    }

    if (top < padding) {
      top = padding;
    } else if (top + menuRect.height > viewportHeight - padding) {
      top = viewportHeight - menuRect.height - padding;
    }

    setPosition({ top, left });
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      
      const handleResize = () => updatePosition();
      const handleScroll = () => updatePosition();
      const handleClickOutside = (e) => {
        if (
          triggerRef.current &&
          menuRef.current &&
          !triggerRef.current.contains(e.target) &&
          !menuRef.current.contains(e.target)
        ) {
          close();
        }
      };
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll);
      document.addEventListener('mousedown', handleClickOutside);
      
      // Focus first menu item
      setTimeout(() => {
        if (menuRef.current) {
          focusManager.focusFirst(menuRef.current);
        }
      }, 0);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === KEYS.ESCAPE) {
      close();
      if (triggerRef.current) {
        triggerRef.current.focus();
      }
    } else if (e.key === KEYS.TAB && menuRef.current) {
      focusManager.trapFocus(menuRef.current, e);
    }
  };

  const handleItemClick = (onClick) => {
    return (e) => {
      if (onClick) {
        onClick(e);
      }
      if (closeOnSelect) {
        close();
      }
    };
  };

  // Clone children and add click handlers
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === DropdownItem) {
      return React.cloneElement(child, {
        onClick: handleItemClick(child.props.onClick)
      });
    }
    return child;
  });

  return (
    <div className={`relative inline-block ${className}`} {...props}>
      {/* Trigger */}
      <div
        ref={triggerRef}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === KEYS.ENTER || e.key === KEYS.SPACE) {
            e.preventDefault();
            toggle();
          }
        }}
        className="cursor-pointer"
        tabIndex={0}
        role="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </div>

      {/* Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className={`
            fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1
            transform transition-all duration-200 ease-out
            ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
            ${menuClassName}
          `}
          style={{
            top: position.top,
            left: position.left,
            minWidth: '160px'
          }}
          role={ARIA_ROLES.MENU}
          onKeyDown={handleKeyDown}
        >
          {enhancedChildren}
        </div>
      )}
    </div>
  );
};

// Dropdown Item Component
export const DropdownItem = ({
  children,
  onClick,
  disabled = false,
  className = '',
  icon,
  ...props
}) => {
  const handleClick = (e) => {
    if (disabled) return;
    if (onClick) {
      onClick(e);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === KEYS.ENTER || e.key === KEYS.SPACE) {
      e.preventDefault();
      handleClick(e);
    }
  };

  return (
    <div
      className={`
        px-4 py-2 text-sm cursor-pointer transition-colors duration-150
        ${disabled 
          ? 'text-gray-400 cursor-not-allowed' 
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        }
        ${className}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={ARIA_ROLES.MENUITEM}
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      {...props}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
        <span className="flex-1">{children}</span>
      </div>
    </div>
  );
};

// Dropdown Divider Component
export const DropdownDivider = ({ className = '' }) => (
  <div className={`border-t border-gray-200 my-1 ${className}`} role="separator" />
);

// Button with dropdown
export const DropdownButton = ({
  children,
  variant = 'secondary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: 'bg-primary-500 border-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
    secondary: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
    ghost: 'bg-transparent border-transparent text-gray-700 hover:bg-gray-100 focus:ring-primary-500'
  };

  return (
    <button
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
      <FaChevronDown className="w-3 h-3" aria-hidden="true" />
    </button>
  );
};

export default Dropdown;