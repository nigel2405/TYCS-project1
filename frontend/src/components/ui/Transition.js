import React, { useState, useEffect, useRef } from 'react';

const Transition = ({
  show = false,
  appear = false,
  enter = 'transition-opacity duration-300',
  enterFrom = 'opacity-0',
  enterTo = 'opacity-100',
  leave = 'transition-opacity duration-300',
  leaveFrom = 'opacity-100',
  leaveTo = 'opacity-0',
  children,
  className = '',
  as: Component = 'div',
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const [isEntering, setIsEntering] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsEntering(true);
      setIsLeaving(false);
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Trigger enter animation
      timeoutRef.current = setTimeout(() => {
        setIsEntering(false);
      }, 50);
    } else if (isVisible) {
      setIsLeaving(true);
      setIsEntering(false);
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Hide after leave animation
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        setIsLeaving(false);
      }, 300); // Default duration
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [show, isVisible]);

  if (!isVisible && !show) {
    return null;
  }

  const getClasses = () => {
    const classes = [className];
    
    if (isEntering) {
      classes.push(enter, enterFrom);
    } else if (isLeaving) {
      classes.push(leave, leaveFrom);
    } else if (isVisible) {
      classes.push(enterTo);
    }
    
    return classes.filter(Boolean).join(' ');
  };

  return (
    <Component className={getClasses()} {...props}>
      {children}
    </Component>
  );
};

// Fade transition
export const FadeTransition = ({ show, children, ...props }) => (
  <Transition
    show={show}
    enter="transition-opacity duration-300 ease-out"
    enterFrom="opacity-0"
    enterTo="opacity-100"
    leave="transition-opacity duration-200 ease-in"
    leaveFrom="opacity-100"
    leaveTo="opacity-0"
    {...props}
  >
    {children}
  </Transition>
);

// Slide transition
export const SlideTransition = ({ 
  show, 
  children, 
  direction = 'down',
  ...props 
}) => {
  const directions = {
    up: {
      enterFrom: 'transform translate-y-2 opacity-0',
      enterTo: 'transform translate-y-0 opacity-100',
      leaveFrom: 'transform translate-y-0 opacity-100',
      leaveTo: 'transform -translate-y-2 opacity-0'
    },
    down: {
      enterFrom: 'transform -translate-y-2 opacity-0',
      enterTo: 'transform translate-y-0 opacity-100',
      leaveFrom: 'transform translate-y-0 opacity-100',
      leaveTo: 'transform translate-y-2 opacity-0'
    },
    left: {
      enterFrom: 'transform translate-x-2 opacity-0',
      enterTo: 'transform translate-x-0 opacity-100',
      leaveFrom: 'transform translate-x-0 opacity-100',
      leaveTo: 'transform -translate-x-2 opacity-0'
    },
    right: {
      enterFrom: 'transform -translate-x-2 opacity-0',
      enterTo: 'transform translate-x-0 opacity-100',
      leaveFrom: 'transform translate-x-0 opacity-100',
      leaveTo: 'transform translate-x-2 opacity-0'
    }
  };

  const config = directions[direction];

  return (
    <Transition
      show={show}
      enter="transition-all duration-300 ease-out"
      enterFrom={config.enterFrom}
      enterTo={config.enterTo}
      leave="transition-all duration-200 ease-in"
      leaveFrom={config.leaveFrom}
      leaveTo={config.leaveTo}
      {...props}
    >
      {children}
    </Transition>
  );
};

// Scale transition
export const ScaleTransition = ({ show, children, ...props }) => (
  <Transition
    show={show}
    enter="transition-all duration-300 ease-out"
    enterFrom="transform scale-95 opacity-0"
    enterTo="transform scale-100 opacity-100"
    leave="transition-all duration-200 ease-in"
    leaveFrom="transform scale-100 opacity-100"
    leaveTo="transform scale-95 opacity-0"
    {...props}
  >
    {children}
  </Transition>
);

export default Transition;