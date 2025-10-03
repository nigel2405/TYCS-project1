# Design System Documentation

## Overview

This document outlines the design system foundation for the RFID Attendance System. The design system provides consistent visual language, reusable components, and design tokens that ensure a cohesive user experience across all pages.

## Design Tokens

### Colors

Our color palette is built around semantic meaning and accessibility:

#### Primary Colors (Blue)
- Used for primary actions, links, and brand elements
- Range: `primary-50` to `primary-900`
- Main color: `primary-500` (#3b82f6)

#### Secondary Colors (Purple)
- Used for secondary actions and highlights
- Range: `secondary-50` to `secondary-900`
- Main color: `secondary-500` (#8b5cf6)

#### Semantic Colors
- **Success**: `success-500` (#10b981) - Success states, confirmations
- **Warning**: `warning-500` (#f59e0b) - Warnings, attention needed
- **Error**: `error-500` (#ef4444) - Errors, destructive actions
- **Info**: `info-500` (#06b6d4) - Informational content

#### Neutral Colors
- **Gray Scale**: `gray-50` to `gray-900`
- Used for text, borders, backgrounds, and subtle elements

### Typography

#### Font Family
- **Primary**: Inter (loaded from Google Fonts)
- **Fallback**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif

#### Font Sizes
- `text-xs`: 12px - Captions, small labels
- `text-sm`: 14px - Small body text, form labels
- `text-base`: 16px - Default body text
- `text-lg`: 18px - Large body text
- `text-xl`: 20px - Small headings
- `text-2xl`: 24px - Medium headings
- `text-3xl`: 30px - Large headings
- `text-4xl`: 36px - Page titles
- `text-display`: 48px - Hero text

#### Font Weights
- `font-light`: 300
- `font-normal`: 400
- `font-medium`: 500
- `font-semibold`: 600
- `font-bold`: 700

### Spacing

Based on an 8px grid system:
- `space-xs`: 4px (0.25rem)
- `space-sm`: 8px (0.5rem)
- `space-md`: 16px (1rem)
- `space-lg`: 24px (1.5rem)
- `space-xl`: 32px (2rem)
- `space-2xl`: 48px (3rem)
- `space-3xl`: 64px (4rem)

### Border Radius
- `rounded-sm`: 2px - Small elements
- `rounded-md`: 6px - Form inputs
- `rounded-lg`: 8px - Buttons, cards
- `rounded-xl`: 12px - Large cards
- `rounded-2xl`: 16px - Modals, major containers
- `rounded-full`: 9999px - Circular elements

### Shadows
- `shadow-sm`: Subtle shadow for small elements
- `shadow-md`: Standard shadow for cards
- `shadow-lg`: Prominent shadow for modals
- `shadow-card`: Specific shadow for card components
- `shadow-card-hover`: Enhanced shadow for card hover states

## Component Classes

### Buttons

#### Primary Button
```html
<button class="btn btn-primary">Primary Action</button>
```

#### Secondary Button
```html
<button class="btn btn-secondary">Secondary Action</button>
```

#### Danger Button
```html
<button class="btn btn-danger">Delete</button>
```

#### Ghost Button
```html
<button class="btn btn-ghost">Cancel</button>
```

### Form Elements

#### Input Field
```html
<div>
  <label class="form-label">Email Address</label>
  <input type="email" class="form-input" placeholder="Enter your email">
</div>
```

#### Input with Error
```html
<div>
  <label class="form-label">Email Address</label>
  <input type="email" class="form-input form-input-error" placeholder="Enter your email">
  <p class="form-error">Please enter a valid email address</p>
</div>
```

### Cards

#### Basic Card
```html
<div class="card">
  <div class="card-header">
    <h3>Card Title</h3>
  </div>
  <div class="card-body">
    <p>Card content goes here</p>
  </div>
</div>
```

#### Interactive Card
```html
<div class="card card-hover">
  <div class="card-body">
    <p>This card has hover effects</p>
  </div>
</div>
```

### Status Indicators

```html
<span class="status-success">Active</span>
<span class="status-warning">Pending</span>
<span class="status-error">Failed</span>
<span class="status-info">Info</span>
```

### Layout Utilities

#### Authentication Pages
```html
<div class="auth-container">
  <div class="auth-card">
    <!-- Auth form content -->
  </div>
</div>
```

#### Dashboard Layout
```html
<div class="dashboard-container">
  <aside class="dashboard-sidebar">
    <!-- Sidebar content -->
  </aside>
  <main class="dashboard-main">
    <div class="dashboard-content">
      <!-- Main content -->
    </div>
  </main>
</div>
```

## CSS Custom Properties

All design tokens are available as CSS custom properties for dynamic theming:

```css
/* Colors */
var(--color-primary-500)
var(--color-secondary-500)
var(--color-success-500)
var(--color-gray-900)

/* Typography */
var(--font-family-sans)
var(--font-size-base)
var(--line-height-normal)

/* Spacing */
var(--spacing-md)
var(--spacing-lg)

/* Shadows */
var(--shadow-card)
var(--shadow-card-hover)
```

## JavaScript Design Tokens

Import design tokens in JavaScript components:

```javascript
import { colors, typography, spacing } from '../assets/design-tokens';

// Access specific tokens
const primaryColor = colors.primary[500];
const baseFontSize = typography.fontSize.base;
const mediumSpacing = spacing.md;

// Use utility functions
import { getColor, getFontSize } from '../assets/design-tokens';

const buttonColor = getColor('primary', 500);
const headingSize = getFontSize('2xl');
```

## Accessibility

### Color Contrast
- All color combinations meet WCAG 2.1 AA standards
- Text on colored backgrounds maintains 4.5:1 contrast ratio
- Interactive elements maintain 3:1 contrast ratio

### Focus Management
- All interactive elements have visible focus indicators
- Focus ring uses `focus:ring-2 focus:ring-primary-500`
- Tab order follows logical page flow

### Semantic HTML
- Use proper heading hierarchy (h1, h2, h3, etc.)
- Form labels are properly associated with inputs
- Interactive elements use appropriate ARIA attributes

## Responsive Design

### Breakpoints
- `sm`: 640px and up
- `md`: 768px and up
- `lg`: 1024px and up
- `xl`: 1280px and up
- `2xl`: 1536px and up

### Mobile-First Approach
- Base styles target mobile devices
- Use responsive prefixes for larger screens: `md:text-lg`, `lg:px-8`

### Dashboard Responsiveness
- Sidebar collapses on mobile devices
- Tables become horizontally scrollable
- Cards stack vertically on smaller screens

## Best Practices

### Consistency
- Always use design tokens instead of hardcoded values
- Follow established patterns for similar components
- Maintain consistent spacing and typography scales

### Performance
- Use Tailwind's utility classes for optimal CSS bundle size
- Leverage CSS custom properties for dynamic theming
- Minimize custom CSS in favor of utility classes

### Maintainability
- Document any custom components or utilities
- Use semantic class names for complex components
- Keep design tokens centralized and well-organized

## Migration Guide

When updating existing components:

1. Replace hardcoded colors with design token classes
2. Update font families to use Inter
3. Apply consistent spacing using the 8px grid system
4. Add proper focus states and accessibility attributes
5. Ensure responsive behavior follows mobile-first approach

## Examples

### Before (Old Styling)
```html
<button style="background-color: #007bff; color: white; padding: 10px 20px; border-radius: 4px;">
  Submit
</button>
```

### After (Design System)
```html
<button class="btn btn-primary">
  Submit
</button>
```

This design system provides the foundation for consistent, accessible, and maintainable UI components across the entire application.