/**
 * Accessibility Utilities
 * 
 * This file contains utility functions and constants for improving accessibility
 * across the application, including ARIA labels, keyboard navigation helpers,
 * and focus management utilities.
 */

// ARIA role constants
export const ARIA_ROLES = {
  BUTTON: 'button',
  LINK: 'link',
  NAVIGATION: 'navigation',
  MAIN: 'main',
  BANNER: 'banner',
  CONTENTINFO: 'contentinfo',
  COMPLEMENTARY: 'complementary',
  FORM: 'form',
  SEARCH: 'search',
  DIALOG: 'dialog',
  ALERT: 'alert',
  ALERTDIALOG: 'alertdialog',
  STATUS: 'status',
  PROGRESSBAR: 'progressbar',
  TAB: 'tab',
  TABLIST: 'tablist',
  TABPANEL: 'tabpanel',
  MENUBAR: 'menubar',
  MENU: 'menu',
  MENUITEM: 'menuitem',
  LISTBOX: 'listbox',
  OPTION: 'option',
  GRID: 'grid',
  GRIDCELL: 'gridcell',
  ROW: 'row',
  COLUMNHEADER: 'columnheader',
  ROWHEADER: 'rowheader'
};

// ARIA live region constants
export const ARIA_LIVE = {
  OFF: 'off',
  POLITE: 'polite',
  ASSERTIVE: 'assertive'
};

// ARIA expanded states
export const ARIA_EXPANDED = {
  TRUE: 'true',
  FALSE: 'false'
};

// Common ARIA labels
export const ARIA_LABELS = {
  CLOSE: 'Close',
  OPEN: 'Open',
  MENU: 'Menu',
  SEARCH: 'Search',
  LOADING: 'Loading',
  REQUIRED: 'Required field',
  OPTIONAL: 'Optional field',
  ERROR: 'Error',
  SUCCESS: 'Success',
  WARNING: 'Warning',
  INFO: 'Information',
  SHOW_PASSWORD: 'Show password',
  HIDE_PASSWORD: 'Hide password',
  PREVIOUS: 'Previous',
  NEXT: 'Next',
  FIRST: 'First',
  LAST: 'Last',
  SORT_ASCENDING: 'Sort ascending',
  SORT_DESCENDING: 'Sort descending',
  FILTER: 'Filter',
  CLEAR_FILTER: 'Clear filter',
  EXPAND: 'Expand',
  COLLAPSE: 'Collapse',
  SELECT: 'Select',
  DESELECT: 'Deselect',
  EDIT: 'Edit',
  DELETE: 'Delete',
  SAVE: 'Save',
  CANCEL: 'Cancel',
  SUBMIT: 'Submit',
  RESET: 'Reset'
};

// Keyboard key constants
export const KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown'
};

/**
 * Generates a unique ID for form elements
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Unique ID
 */
export const generateId = (prefix = 'element') => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Creates accessible button props for clickable elements that aren't buttons
 * @param {Function} onClick - Click handler
 * @param {string} label - Accessible label
 * @returns {Object} Props object with accessibility attributes
 */
export const createButtonProps = (onClick, label) => ({
  role: ARIA_ROLES.BUTTON,
  tabIndex: 0,
  'aria-label': label,
  onClick,
  onKeyDown: (e) => {
    if (e.key === KEYS.ENTER || e.key === KEYS.SPACE) {
      e.preventDefault();
      onClick(e);
    }
  }
});

/**
 * Creates accessible link props for navigation elements
 * @param {string} href - Link destination
 * @param {string} label - Accessible label
 * @param {boolean} external - Whether link is external
 * @returns {Object} Props object with accessibility attributes
 */
export const createLinkProps = (href, label, external = false) => ({
  href,
  'aria-label': label,
  ...(external && {
    target: '_blank',
    rel: 'noopener noreferrer',
    'aria-label': `${label} (opens in new tab)`
  })
});

/**
 * Creates accessible form field props
 * @param {string} id - Field ID
 * @param {boolean} required - Whether field is required
 * @param {string} error - Error message
 * @param {string} helperText - Helper text
 * @returns {Object} Props object with accessibility attributes
 */
export const createFieldProps = (id, required = false, error = null, helperText = null) => {
  const describedBy = [];
  if (error) describedBy.push(`${id}-error`);
  if (helperText) describedBy.push(`${id}-helper`);

  return {
    id,
    'aria-required': required,
    'aria-invalid': error ? 'true' : 'false',
    'aria-describedby': describedBy.length > 0 ? describedBy.join(' ') : undefined
  };
};

/**
 * Creates accessible modal props
 * @param {string} labelId - ID of element that labels the modal
 * @param {string} descriptionId - ID of element that describes the modal
 * @returns {Object} Props object with accessibility attributes
 */
export const createModalProps = (labelId, descriptionId) => ({
  role: ARIA_ROLES.DIALOG,
  'aria-modal': 'true',
  'aria-labelledby': labelId,
  'aria-describedby': descriptionId
});

/**
 * Creates accessible table props
 * @param {string} caption - Table caption
 * @returns {Object} Props object with accessibility attributes
 */
export const createTableProps = (caption) => ({
  role: ARIA_ROLES.GRID,
  'aria-label': caption
});

/**
 * Creates accessible progress bar props
 * @param {number} value - Current value
 * @param {number} max - Maximum value
 * @param {string} label - Accessible label
 * @returns {Object} Props object with accessibility attributes
 */
export const createProgressProps = (value, max, label) => ({
  role: ARIA_ROLES.PROGRESSBAR,
  'aria-valuenow': value,
  'aria-valuemax': max,
  'aria-valuemin': 0,
  'aria-label': label
});

/**
 * Creates accessible tab props
 * @param {string} id - Tab ID
 * @param {string} panelId - Associated panel ID
 * @param {boolean} selected - Whether tab is selected
 * @returns {Object} Props object with accessibility attributes
 */
export const createTabProps = (id, panelId, selected) => ({
  id,
  role: ARIA_ROLES.TAB,
  'aria-selected': selected,
  'aria-controls': panelId,
  tabIndex: selected ? 0 : -1
});

/**
 * Creates accessible tab panel props
 * @param {string} id - Panel ID
 * @param {string} tabId - Associated tab ID
 * @returns {Object} Props object with accessibility attributes
 */
export const createTabPanelProps = (id, tabId) => ({
  id,
  role: ARIA_ROLES.TABPANEL,
  'aria-labelledby': tabId,
  tabIndex: 0
});

/**
 * Manages focus for keyboard navigation
 */
export class FocusManager {
  constructor() {
    this.focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');
  }

  /**
   * Gets all focusable elements within a container
   * @param {HTMLElement} container - Container element
   * @returns {HTMLElement[]} Array of focusable elements
   */
  getFocusableElements(container) {
    return Array.from(container.querySelectorAll(this.focusableSelectors));
  }

  /**
   * Traps focus within a container (useful for modals)
   * @param {HTMLElement} container - Container element
   * @param {KeyboardEvent} event - Keyboard event
   */
  trapFocus(container, event) {
    if (event.key !== KEYS.TAB) return;

    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  /**
   * Sets focus to the first focusable element in a container
   * @param {HTMLElement} container - Container element
   */
  focusFirst(container) {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  /**
   * Restores focus to a previously focused element
   * @param {HTMLElement} element - Element to focus
   */
  restoreFocus(element) {
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  }
}

/**
 * Announces messages to screen readers
 * @param {string} message - Message to announce
 * @param {string} priority - Priority level ('polite' or 'assertive')
 */
export const announceToScreenReader = (message, priority = ARIA_LIVE.POLITE) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Validates color contrast ratio
 * @param {string} foreground - Foreground color (hex)
 * @param {string} background - Background color (hex)
 * @returns {Object} Contrast ratio and WCAG compliance
 */
export const checkColorContrast = (foreground, background) => {
  // Convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Calculate relative luminance
  const getLuminance = (rgb) => {
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);

  if (!fgRgb || !bgRgb) {
    return { ratio: 0, wcagAA: false, wcagAAA: false };
  }

  const fgLuminance = getLuminance(fgRgb);
  const bgLuminance = getLuminance(bgRgb);

  const ratio = (Math.max(fgLuminance, bgLuminance) + 0.05) / 
                (Math.min(fgLuminance, bgLuminance) + 0.05);

  return {
    ratio: Math.round(ratio * 100) / 100,
    wcagAA: ratio >= 4.5,
    wcagAAA: ratio >= 7
  };
};

// Screen reader only CSS class
export const SR_ONLY_CLASS = 'sr-only';

// Export focus manager instance
export const focusManager = new FocusManager();