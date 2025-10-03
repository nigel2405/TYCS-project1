import React from 'react';

const Container = React.forwardRef(({
  children,
  className = '',
  size = 'default',
  centered = false,
  ...props
}, ref) => {
  const baseClasses = ['w-full'];

  const sizeClasses = {
    sm: ['max-w-2xl'],
    default: ['max-w-4xl'],
    lg: ['max-w-6xl'],
    xl: ['max-w-7xl'],
    full: ['max-w-full']
  };

  const centeredClasses = centered ? ['mx-auto'] : [];

  const classes = [
    ...baseClasses,
    ...sizeClasses[size],
    ...centeredClasses,
    className
  ].join(' ');

  return (
    <div
      ref={ref}
      className={classes}
      {...props}
    >
      {children}
    </div>
  );
});

Container.displayName = 'Container';

const Section = React.forwardRef(({
  children,
  className = '',
  padding = 'default',
  background = 'transparent',
  ...props
}, ref) => {
  const baseClasses = ['w-full'];

  const paddingClasses = {
    none: [],
    sm: ['py-4', 'px-4'],
    default: ['py-6', 'px-4', 'sm:px-6', 'lg:px-8'],
    lg: ['py-12', 'px-4', 'sm:px-6', 'lg:px-8'],
    xl: ['py-16', 'px-4', 'sm:px-6', 'lg:px-8']
  };

  const backgroundClasses = {
    transparent: [],
    white: ['bg-white'],
    gray: ['bg-gray-50'],
    primary: ['bg-primary-50'],
    secondary: ['bg-secondary-50']
  };

  const classes = [
    ...baseClasses,
    ...paddingClasses[padding],
    ...backgroundClasses[background],
    className
  ].join(' ');

  return (
    <section
      ref={ref}
      className={classes}
      {...props}
    >
      {children}
    </section>
  );
});

Section.displayName = 'Section';

const Grid = React.forwardRef(({
  children,
  className = '',
  cols = 1,
  gap = 'default',
  responsive = true,
  ...props
}, ref) => {
  const baseClasses = ['grid'];

  const colsClasses = {
    1: ['grid-cols-1'],
    2: ['grid-cols-1', responsive && 'md:grid-cols-2'].filter(Boolean),
    3: ['grid-cols-1', responsive && 'md:grid-cols-2', responsive && 'lg:grid-cols-3'].filter(Boolean),
    4: ['grid-cols-1', responsive && 'md:grid-cols-2', responsive && 'lg:grid-cols-4'].filter(Boolean),
    6: ['grid-cols-1', responsive && 'md:grid-cols-3', responsive && 'lg:grid-cols-6'].filter(Boolean),
    12: ['grid-cols-1', responsive && 'md:grid-cols-6', responsive && 'lg:grid-cols-12'].filter(Boolean)
  };

  const gapClasses = {
    none: [],
    sm: ['gap-2'],
    default: ['gap-4'],
    lg: ['gap-6'],
    xl: ['gap-8']
  };

  const classes = [
    ...baseClasses,
    ...colsClasses[cols],
    ...gapClasses[gap],
    className
  ].join(' ');

  return (
    <div
      ref={ref}
      className={classes}
      {...props}
    >
      {children}
    </div>
  );
});

Grid.displayName = 'Grid';

const Stack = React.forwardRef(({
  children,
  className = '',
  direction = 'vertical',
  spacing = 'default',
  align = 'stretch',
  justify = 'start',
  ...props
}, ref) => {
  const baseClasses = ['flex'];

  const directionClasses = {
    vertical: ['flex-col'],
    horizontal: ['flex-row']
  };

  const spacingClasses = {
    none: [],
    xs: direction === 'vertical' ? ['space-y-1'] : ['space-x-1'],
    sm: direction === 'vertical' ? ['space-y-2'] : ['space-x-2'],
    default: direction === 'vertical' ? ['space-y-4'] : ['space-x-4'],
    lg: direction === 'vertical' ? ['space-y-6'] : ['space-x-6'],
    xl: direction === 'vertical' ? ['space-y-8'] : ['space-x-8']
  };

  const alignClasses = {
    start: ['items-start'],
    center: ['items-center'],
    end: ['items-end'],
    stretch: ['items-stretch']
  };

  const justifyClasses = {
    start: ['justify-start'],
    center: ['justify-center'],
    end: ['justify-end'],
    between: ['justify-between'],
    around: ['justify-around'],
    evenly: ['justify-evenly']
  };

  const classes = [
    ...baseClasses,
    ...directionClasses[direction],
    ...spacingClasses[spacing],
    ...alignClasses[align],
    ...justifyClasses[justify],
    className
  ].join(' ');

  return (
    <div
      ref={ref}
      className={classes}
      {...props}
    >
      {children}
    </div>
  );
});

Stack.displayName = 'Stack';

export {
  Container,
  Section,
  Grid,
  Stack
};