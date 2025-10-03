import React from 'react';

const Card = React.forwardRef(({
  children,
  className = '',
  hover = false,
  interactive = false,
  padding = 'default',
  shadow = 'default',
  ...props
}, ref) => {
  const baseClasses = [
    'bg-white',
    'border',
    'border-gray-200',
    'rounded-xl',
    'transition-all',
    'duration-200'
  ];

  const paddingClasses = {
    none: [],
    sm: ['p-3'],
    default: ['p-4'],
    lg: ['p-6'],
    xl: ['p-8']
  };

  const shadowClasses = {
    none: [],
    sm: ['shadow-sm'],
    default: ['shadow-md'],
    lg: ['shadow-lg'],
    xl: ['shadow-xl']
  };

  const interactiveClasses = interactive || hover ? [
    'cursor-pointer',
    'hover:shadow-lg',
    'hover:border-gray-300',
    'hover:-translate-y-0.5',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-primary-500',
    'focus:ring-offset-2'
  ] : [];

  const classes = [
    ...baseClasses,
    ...paddingClasses[padding],
    ...shadowClasses[shadow],
    ...interactiveClasses,
    className
  ].join(' ');

  const Component = interactive ? 'button' : 'div';

  return (
    <Component
      ref={ref}
      className={classes}
      {...props}
    >
      {children}
    </Component>
  );
});

Card.displayName = 'Card';

const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`border-b border-gray-200 pb-4 mb-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardTitle = ({ children, className = '', as: Component = 'h3', ...props }) => {
  return (
    <Component
      className={`text-lg font-semibold text-gray-900 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

const CardDescription = ({ children, className = '', ...props }) => {
  return (
    <p
      className={`text-sm text-gray-600 mt-1 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};

const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`border-t border-gray-200 pt-4 mt-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
};
