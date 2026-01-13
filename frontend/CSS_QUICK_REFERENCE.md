# CSS Quick Reference Guide

## 🎨 Design Tokens (Variables)

### Colors

```css
/* Primary */
var(--color-primary)        /* #646cff */
var(--color-primary-dark)   /* #535bf2 */
var(--color-primary-light)  /* #747bff */

/* Semantic */
var(--color-success)        /* #10b981 */
var(--color-warning)        /* #f59e0b */
var(--color-error)          /* #ef4444 */
var(--color-info)           /* #3b82f6 */

/* Neutrals */
var(--color-gray-100)       /* Light gray */
var(--color-gray-500)       /* Medium gray */
var(--color-gray-900)       /* Dark gray */
```

### Spacing

```css
var(--spacing-xs)    /* 4px */
var(--spacing-sm)    /* 8px */
var(--spacing-md)    /* 16px */
var(--spacing-lg)    /* 24px */
var(--spacing-xl)    /* 32px */
var(--spacing-2xl)   /* 48px */
var(--spacing-3xl)   /* 64px */
```

### Typography

```css
var(--font-size-xs)    /* 12px */
var(--font-size-sm)    /* 14px */
var(--font-size-base)  /* 16px */
var(--font-size-lg)    /* 18px */
var(--font-size-xl)    /* 20px */
var(--font-size-2xl)   /* 24px */
var(--font-size-3xl)   /* 30px */
```

## 🧩 Common Components

### Buttons

```html
<!-- Primary -->
<button class="btn btn-primary">Primary</button>

<!-- Secondary -->
<button class="btn btn-secondary">Secondary</button>

<!-- Outline -->
<button class="btn btn-outline">Outline</button>

<!-- Danger -->
<button class="btn btn-danger">Delete</button>

<!-- Sizes -->
<button class="btn btn-sm">Small</button>
<button class="btn btn-lg">Large</button>

<!-- Icon Button -->
<button class="btn-icon btn-primary">👁️</button>
```

### Forms

```html
<!-- Form Group -->
<div class="form-group">
  <label class="form-label required">Name</label>
  <input type="text" class="form-input" required />
  <span class="form-help">Helper text</span>
</div>

<!-- Form Row (2 columns) -->
<div class="form-row">
  <div class="form-group">...</div>
  <div class="form-group">...</div>
</div>

<!-- Checkbox -->
<label class="checkbox-label">
  <input type="checkbox" />
  <span>Remember me</span>
</label>
```

### Cards

```html
<!-- Basic Card -->
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Title</h3>
    <p class="card-subtitle">Subtitle</p>
  </div>
  <div class="card-body">Content</div>
</div>

<!-- Stat Card -->
<div class="stat-card stat-card-primary">
  <div class="stat-icon">📊</div>
  <div class="stat-content">
    <div class="stat-label">Total Sales</div>
    <div class="stat-value">1,234</div>
  </div>
</div>
```

### Tables

```html
<div class="table-responsive">
  <table class="data-table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>John Doe</td>
        <td><span class="badge badge-success">Active</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon btn-primary">✏️</button>
            <button class="btn-icon btn-danger">🗑️</button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Badges

```html
<span class="badge badge-success">Approved</span>
<span class="badge badge-pending">Pending</span>
<span class="badge badge-danger">Rejected</span>
<span class="badge badge-admin">Admin</span>
```

## 📐 Layout Utilities

### Flexbox

```html
<!-- Flex Container -->
<div class="flex items-center justify-between gap-md">
  <div>Left</div>
  <div>Right</div>
</div>

<!-- Flex Column -->
<div class="flex flex-col gap-lg">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Grid

```html
<!-- Auto-fit Grid -->
<div class="grid grid-cols-3 gap-lg">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>
```

### Spacing

```html
<!-- Margin -->
<div class="mt-lg mb-xl">Vertical margins</div>

<!-- Padding -->
<div class="p-md">All padding</div>
<div class="px-lg py-md">Horizontal & vertical</div>
```

### Text

```html
<!-- Alignment -->
<p class="text-center">Centered</p>
<p class="text-right">Right aligned</p>

<!-- Size -->
<p class="text-sm">Small text</p>
<p class="text-xl">Large text</p>

<!-- Weight -->
<span class="font-bold">Bold</span>
<span class="font-medium">Medium</span>

<!-- Color -->
<span class="text-primary">Primary color</span>
<span class="text-success">Success color</span>
<span class="text-error">Error color</span>
```

## 📱 Responsive Classes

```html
<!-- Hide on mobile -->
<div class="hide-mobile">Desktop only</div>

<!-- Show on mobile -->
<div class="show-mobile">Mobile only</div>

<!-- Hide on tablet -->
<div class="hide-tablet">Not on tablet</div>
```

## 🎯 Common Patterns

### Page Header

```html
<div class="page-header">
  <div>
    <h2 class="page-title">Dashboard</h2>
    <p>Welcome back!</p>
  </div>
  <div class="page-header-actions">
    <button class="btn btn-primary">Action</button>
  </div>
</div>
```

### Stats Grid

```html
<div class="stats-grid">
  <div class="stat-card stat-card-primary">
    <!-- Stat content -->
  </div>
  <!-- More stat cards -->
</div>
```

### Loading State

```html
<div class="loading-container">
  <div class="spinner"></div>
  <p>Loading...</p>
</div>
```

### Empty State

```html
<div class="empty-state">
  <p>📦 No items found</p>
  <button class="btn btn-primary">Add Item</button>
</div>
```

### Error Container

```html
<div class="error-container">
  <p class="error-message">❌ Something went wrong</p>
  <button class="btn btn-outline">Retry</button>
</div>
```

## 🎨 Custom Styling

### Using Variables

```css
.my-component {
  padding: var(--spacing-lg);
  background: var(--bg-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}
```

### Following Patterns

```css
/* Component base */
.my-component {
  /* Layout */
  /* Sizing */
  /* Colors */
  /* Typography */
  /* Effects */
}

/* Variants */
.my-component-primary {
}
.my-component-secondary {
}

/* States */
.my-component:hover {
}
.my-component:active {
}
.my-component.is-active {
}
```

## 📚 Where to Find Things

| Looking for...       | File location                      |
| -------------------- | ---------------------------------- |
| Color/spacing values | `styles/variables.css`             |
| Typography styles    | `styles/base.css`                  |
| Button styles        | `styles/components/buttons.css`    |
| Form inputs          | `styles/components/forms.css`      |
| Cards                | `styles/components/cards.css`      |
| Tables               | `styles/components/tables.css`     |
| Modals               | `styles/components/modal.css`      |
| Navigation           | `styles/components/navigation.css` |
| Auth pages           | `styles/pages/auth.css`            |
| Dashboard            | `styles/pages/dashboard.css`       |
| Management pages     | `styles/pages/manage.css`          |
| Utility classes      | `styles/utilities.css`             |
| Responsive styles    | `styles/responsive.css`            |

## 🔧 Development Tips

1. **Use existing utilities first** before writing custom CSS
2. **Follow the variable system** for consistent design
3. **Add to existing modules** rather than creating new files
4. **Test responsive behavior** on mobile/tablet/desktop
5. **Check browser DevTools** to see which file styles come from

---

For detailed architecture info, see [styles/README.md](src/styles/README.md)
