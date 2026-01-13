# CSS Architecture Documentation

## Overview

The CSS has been refactored from a single 2300+ line file into a modular architecture for better maintainability, scalability, and organization.

## Directory Structure

```
src/
├── style.css                    # Main entry point (imports all modules)
├── style.css.backup            # Original monolithic file (backup)
└── styles/
    ├── variables.css           # CSS custom properties & design tokens
    ├── base.css               # Base styles & typography
    ├── utilities.css          # Utility classes (flex, grid, spacing, text)
    ├── responsive.css         # Media queries & responsive styles
    ├── components/
    │   ├── buttons.css       # Button styles & variants
    │   ├── cards.css         # Card components (stat, action, price)
    │   ├── forms.css         # Form inputs, labels, validation
    │   ├── modal.css         # Modal dialog components
    │   ├── navigation.css    # Header, navbar, footer
    │   └── tables.css        # Data tables & badges
    └── pages/
        ├── auth.css          # Login, register, landing pages
        ├── dashboard.css     # Dashboard-specific styles
        └── manage.css        # Management pages (products, markets)
```

## Module Descriptions

### Foundation Layer

#### `variables.css`

- **Purpose**: Centralized design tokens
- **Contains**: Colors, spacing, typography, shadows, transitions, z-index scale
- **Benefit**: Single source of truth for design system values

#### `base.css`

- **Purpose**: Base HTML element styles
- **Contains**: Resets, typography, default link/code styles
- **Benefit**: Consistent baseline across browsers

#### `utilities.css`

- **Purpose**: Reusable utility classes
- **Contains**: Flexbox, grid, spacing (margin/padding), text alignment, display
- **Benefit**: Rapid prototyping without writing custom CSS

### Components Layer

#### `buttons.css`

- Button base styles
- Variants: primary, secondary, danger, outline
- Sizes: sm, lg, block
- Icon buttons

#### `forms.css`

- Form inputs (text, email, password, select, textarea)
- Labels, validation, error messages
- Checkbox groups, fieldsets
- Form actions footer

#### `cards.css`

- Generic card component
- Stat cards with gradients
- Action cards for navigation
- Price cards for marketplace

#### `tables.css`

- Responsive data tables
- Table header/body styles
- Status badges (pending, approved, rejected)
- Role badges (admin, collector)

#### `modal.css`

- Modal overlay & dialog
- Modal header/body/footer
- Size variants (small, medium, large)
- Detail rows for data display
- Animations (fadeIn, slideUp)

#### `navigation.css`

- Main header & navbar
- Navigation menu
- User info display
- Footer styles

### Pages Layer

#### `auth.css`

- Login/register page layouts
- Auth card container
- Landing page hero
- Welcome cards

#### `dashboard.css`

- Dashboard layout
- Page headers
- Stats grid
- Quick actions
- Loading & empty states

#### `manage.css`

- Management page layouts
- Filter containers
- Price grids
- Form sections
- Help cards

### Responsive Layer

#### `responsive.css`

- Mobile-first breakpoints
- Touch target sizing
- Tablet layouts
- Desktop optimizations
- Print styles
- Reduced motion support

## Breakpoints

```css
/* Mobile */
max-width: 767px

/* Tablet */
768px - 1023px

/* Desktop */
1024px - 1439px

/* Large Desktop */
min-width: 1440px
```

## Benefits of Modular Architecture

### 1. **Maintainability**

- Easy to find and update specific styles
- Clear separation of concerns
- Reduced cognitive load when editing

### 2. **Scalability**

- Add new components without affecting existing ones
- Easy to add new pages
- Can remove unused modules

### 3. **Performance**

- Can selectively load only needed modules (future optimization)
- Better caching granularity
- Easier to identify unused CSS

### 4. **Collaboration**

- Multiple developers can work on different modules
- Clear file naming conventions
- Self-documenting structure

### 5. **Reusability**

- Components can be reused across pages
- Utilities reduce custom CSS
- Consistent design system

## Usage Guidelines

### Adding New Styles

#### For a new component:

1. Create file in `styles/components/[component-name].css`
2. Add import to `style.css`

#### For a new page:

1. Create file in `styles/pages/[page-name].css`
2. Add import to `style.css`

#### For utilities:

- Add to existing `utilities.css`

### Naming Conventions

- **Components**: `.component-name` (e.g., `.btn`, `.card`, `.modal`)
- **Variants**: `.component-variant` (e.g., `.btn-primary`, `.card-header`)
- **States**: `.component-state` (e.g., `.btn-disabled`, `.form-error`)
- **Utilities**: `.utility-value` (e.g., `.text-center`, `.mt-lg`)

### Best Practices

1. **Use CSS Variables**: Prefer `var(--color-primary)` over hard-coded values
2. **Mobile First**: Write base styles for mobile, enhance for larger screens
3. **BEM-like**: Use clear, descriptive class names
4. **Avoid Deep Nesting**: Keep selectors flat (max 2-3 levels)
5. **Group Related Styles**: Keep related declarations together with comments

## Migration Notes

- Original file backed up as `style.css.backup`
- All existing classes maintained for backward compatibility
- No changes required to HTML files
- Import structure uses relative paths for Vite compatibility

## Future Enhancements

1. **CSS Modules**: Consider CSS Modules or CSS-in-JS for component scoping
2. **Purge CSS**: Remove unused styles in production
3. **CSS Variables**: Expand use of custom properties for theming
4. **Dark Mode**: Add comprehensive dark mode support
5. **Animation Library**: Extract animations to separate module

## Rollback

If needed, restore original file:

```bash
cd src
mv style.css style.css.modular
mv style.css.backup style.css
```

---

**Last Updated**: January 13, 2026
**Version**: 2.0.0
**Architecture**: Modular CSS with component-based organization
