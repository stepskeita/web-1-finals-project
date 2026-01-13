# Frontend - Web 1 Final Project

A Vite-powered Vanilla JavaScript frontend application with user authentication.

## ✨ Features

### Authentication System

- ✅ **Login Page** - Email/password authentication with JWT
- ✅ **Registration Page** - New user account creation
- ✅ **Form Validation** - Real-time client-side validation
- ✅ **Token Management** - JWT storage in localStorage with expiration handling
- ✅ **Protected Routes** - Automatic redirect for unauthenticated users
- ✅ **Auth State Persistence** - Login state maintained across page reloads
- ✅ **Token Expiration** - Automatic warning and logout on token expiration
- ✅ **User Info Display** - Name and role badge in navigation
- ✅ **Role-Based UI** - Admin-only links hidden for collectors
- ✅ **Error Handling** - User-friendly error messages

### Dashboard Features

- ✅ **Dynamic Statistics** - Real-time metrics (products, markets, submissions)
- ✅ **Recent Submissions** - Table with latest price submissions
- ✅ **Quick Actions** - Role-based action cards
- ✅ **Data Fetching** - Parallel API calls for optimal performance

### Price Submission

- ✅ **Dynamic Product Selection** - Products loaded from backend
- ✅ **Dynamic Market Selection** - Markets loaded from backend
- ✅ **Form Validation** - Real-time validation with helpful error messages
- ✅ **Price Input** - Decimal input with currency formatting
- ✅ **Unit Selection** - Multiple unit options (kg, lb, piece, etc.)
- ✅ **Date Picker** - With future date prevention
- ✅ **Notes Field** - Optional notes with character counter (500 max)
- ✅ **Success Feedback** - Clear confirmation messages
- ✅ **Auto Reset** - Form resets after successful submission

### Role-Based UI & Data Management

- ✅ **Admin Controls** - Edit/delete buttons shown only to admin users
- ✅ **Edit Modal** - In-place editing of price submissions
- ✅ **Delete Confirmation** - Secure deletion with confirmation dialog
- ✅ **Approve/Reject** - Admin can approve or reject pending submissions
- ✅ **View Details** - Detailed submission information in modal
- ✅ **Real-time Updates** - Dashboard refreshes after actions
- ✅ **Action Buttons** - Icon-based actions (edit, delete, view, approve, reject)
- ✅ **Modal System** - Reusable modal component for forms and dialogs

### Responsive Design

- ✅ **Mobile First** - Optimized for mobile devices (320px+)
- ✅ **Tablet Support** - Adaptive layouts for tablets (768px - 1023px)
- ✅ **Desktop Optimized** - Full-featured desktop experience (1024px+)
- ✅ **Touch Friendly** - 44px minimum touch targets on mobile
- ✅ **Responsive Navigation** - Stacked menu on mobile, horizontal on desktop
- ✅ **Responsive Tables** - Horizontal scroll with hidden columns on small screens
- ✅ **Responsive Modals** - Full-width on mobile, centered on desktop
- ✅ **Responsive Forms** - Single column on mobile, multi-column on desktop
- ✅ **Breakpoints** - 360px, 480px, 767px, 1023px, 1439px
- ✅ **Landscape Mode** - Optimized for landscape orientation
- ✅ **Print Styles** - Clean print layouts
- ✅ **Reduced Motion** - Respects user's motion preferences

### Technical Features

- ⚡️ Vite for fast development and optimized builds
- 📦 ES Modules support
- 🔧 Environment variable configuration
- 🎨 Modern CSS with normalize.css and design system
- 🔗 Centralized API configuration
- 📱 Fully responsive design
- 🔒 Secure authentication flow
- ⏱️ Token lifecycle management

## Project Structure

```
frontend/
├── public/             # Static assets
├── src/
│   ├── config/         # Configuration files
│   │   └── api.config.js      # API endpoints configuration
│   ├── services/       # Business logic services
│   │   ├── api.service.js     # HTTP request handling
│   │   └── auth.service.js    # Authentication & token management
│   ├── utils/          # Utility functions
│   │   ├── validation.js      # Form validation utilities
│   │   └── auth-init.js       # Auth state initialization & token expiration
│   ├── components/     # Reusable components
│   │   ├── navbar.js          # Navigation bar with user info & logout
│   │   └── modal.js           # Modal dialog component for forms/confirmations
│   ├── pages/          # Page-specific JavaScript
│   │   ├── login.js           # Login page functionality
│   │   ├── register.js        # Registration page functionality
│   │   ├── dashboard.js       # Dashboard with role-based UI & CRUD operations
│   │   └── price-submission.js # Price submission form with auth
│   └── style.css       # Global styles with design system
├── login.html          # Login page
├── register.html       # Registration page
├── dashboard.html      # Dashboard (auth required)
├── price-submission.html # Price submission form
├── index.html          # Landing page
├── vite.config.js      # Vite configuration
├── .env                # Environment variables (not in git)
└── package.json        # Dependencies and scripts
```

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` file from `.env.example`:

   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your API URL:
   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

## Development

Start the development server with hot module replacement (HMR):

```bash
npm run dev
```

The app will open at `http://localhost:3000`

## Build

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Environment Variables

Environment variables must be prefixed with `VITE_` to be exposed to the app.

Access them using:

```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

Available variables:

- `VITE_API_BASE_URL` - Backend API base URL

## API Configuration

The `src/config/api.config.js` file provides:

- Centralized API endpoint definitions
- Helper functions for building URLs
- Authentication header utilities

Example usage:

```javascript
import { apiConfig, buildURL, getAuthHeader } from "./config/api.config.js";

// Get full URL
const loginURL = buildURL(apiConfig.endpoints.auth.login);

// Make authenticated request
fetch(loginURL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    ...getAuthHeader(),
  },
  body: JSON.stringify({ email, password }),
});
```

## Authentication

### How It Works

1. **Registration** ([register.html](register.html))

   - User fills in registration form
   - Frontend validates inputs client-side
   - POST request to `/api/auth/register`
   - JWT token and user data stored in localStorage
   - Automatic redirect to dashboard

2. **Login** ([login.html](login.html))

   - User enters email and password
   - Auth State Persistence\*\*
   - On every page load, auth state is validated
   - Token expiration checked via JWT decode
   - If expired, user is logged out automatically
   - User data refreshed from server
   - Navigation updated with user info

3. **Protected Routes**

   - Dashboard and price submission require authentication
   - Token validated before page content loads
   - Invalid/expired tokens trigger redirect to login
   - Token automatically included in API requests

4. **Token Lifecycle**

   - Token stored in localStorage on login/register
   - Decoded on every page load to check expiration
   - Warning shown 5 minutes before expiration
   - Auto-logout when token expires
   - Cleared on manual logout

5. **Protected Routes**
   - Dashboard and other protected pages check authentication
   - If no valid token, redirect to login page
   - Token automatically included in API requests

### Using the Auth Service

```javascript
import {
  login,
  register,
  logout,
  isAuthenticated,
  getUser,
  requireAuth,
} from "./services/auth.service.js";

// Login
await login({ email: "user@example.com", password: "password123" });

// Register
await register({
  name: "John Doe",
  email: "john@example.com",
  password: "password123",
  role: "collector",
});

// Check if logged in
if (isAuthenticated()) {
  const user = getUser();
  console.log(`Welcome ${user.name}`);
}

// Logout
logout(); // Clears tokens and redirects to login

// Protect a page (add to top of page script)
requireAuth(); // Redirects to login if not authenticated
```

### Form Validation

The validation utility provides:

```javascript
import {
  isValidEmail,
  validatePassword,
  showFieldError,
  clearFieldError,
  showFormMessage,
} from "./utils/validation.js";

// Validate email
if (!isValidEmail(email)) {
  showFieldError("email", "Invalid email format");
}

// Validate password
const result = validatePassword(password);
if (!result.valid) {
  showFieldError("password", result.message);
}

// Show success/error message
showFormMessage("form-message", "Login successful!", "success");
showFormMessage("form-message", "Invalid credentials", "error");
```

## ES Modules

This project uses ES modules (`type: "module"` in package.json).

Import syntax:

```javascript
import { something } from "./module.js";
export { something };
```

## Hot Module Replacement (HMR)

Vite provides instant HMR. Changes to `.js` and `.css` files will be reflected immediately without full page reload.

## Browser Support

- Modern browsers with ES modules support
- No IE11 support

## Technologies

- **Vite** - Build tool and dev server
- **Vanilla JavaScript** - No framework, pure JS
- **CSS3** - Modern styling with custom properties
- **ES Modules** - Native module system

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
