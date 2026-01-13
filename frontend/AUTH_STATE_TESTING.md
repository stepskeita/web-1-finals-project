# Frontend Prompt 5 – Auth State Handling

## ✅ Implementation Complete

Successfully implemented JWT storage in localStorage and authentication state management across page reloads.

## What Was Implemented

### 1. **Auth Initialization Utility** ([src/utils/auth-init.js](src/utils/auth-init.js))

#### Token Expiration Management

- `isTokenExpired(token)` - Decodes JWT and checks expiration timestamp
- `getTokenExpirationTime(token)` - Returns milliseconds until token expires
- `setupTokenExpirationWarning()` - Warns user 5 minutes before expiration
- Auto-logout when token expires

#### Auth State Initialization

- `initializeAuth()` - Validates token and refreshes user data on page load
- Checks token expiration before making API calls
- Automatically logs out if token is invalid or expired
- Refreshes user data from server to ensure sync

#### User Info Display

- `displayUserInfo(elementId)` - Displays user name and role in navigation

### 2. **Navigation Component** ([src/components/navbar.js](src/components/navbar.js))

#### Features

- `initNavbar()` - Initializes navigation bar on protected pages
- Displays user name and role badge (Admin/Collector)
- Logout button with confirmation dialog
- Hides admin-only links for non-admin users
- Highlights active page in navigation
- `updateNotificationBadge(count)` - Updates notification badge (future feature)

### 3. **Updated Dashboard Page** ([src/pages/dashboard.js](src/pages/dashboard.js))

#### Protection & Initialization

- Calls `requireAuth()` to redirect unauthenticated users
- Initializes auth state with `initializeAuth()`
- Sets up token expiration warning
- Initializes navigation bar with user info
- Loads dashboard data after auth verification

#### User Welcome

- Displays personalized welcome message
- Shows user role information
- Placeholder for loading statistics from API

### 4. **Updated Price Submission Page** ([src/pages/price-submission.js](src/pages/price-submission.js))

#### Protection & Initialization

- Requires authentication to access
- Initializes auth state on page load
- Sets up token expiration warning
- Initializes navigation with logout functionality
- Maintains existing character counter functionality

### 5. **Enhanced Login Page** ([src/pages/login.js](src/pages/login.js))

#### Expired Token Handling

- Checks for expired token in localStorage on page load
- Cleans up expired tokens automatically
- Shows user-friendly message if session expired
- Existing login functionality maintained

### 6. **Updated HTML Pages**

#### Dashboard & Price Submission Navigation

- Added `user-info` div for displaying user details
- Added `nav-link` class to navigation links
- Added `admin-only` class for admin-specific menu items
- Consistent navigation structure across pages

### 7. **Enhanced CSS** ([src/style.css](src/style.css))

#### New Styles

- `#user-info` - Container for user information in navbar
- `.user-details` - Flex layout for user name and role
- `.user-name` - Styling for user's name
- `.user-role` - Badge styling for user role
- `.badge-admin` - Red badge for admin users
- `.badge-collector` - Blue badge for collector users
- `.admin-only` - Display control for admin-only elements

## How It Works

### Page Load Flow

```
1. User visits protected page (dashboard, price-submission)
   ↓
2. requireAuth() checks for token
   ↓
3. If no token → Redirect to login
   ↓
4. If token exists → Check expiration
   ↓
5. If expired → Clear storage, redirect to login
   ↓
6. If valid → Initialize auth state
   ↓
7. Fetch fresh user data from server
   ↓
8. Display user info in navigation
   ↓
9. Setup token expiration warning
   ↓
10. Load page-specific data
```

### Token Lifecycle

```
Login/Register
   ↓
Token stored in localStorage
   ↓
Every page load:
   - Check token exists
   - Decode and validate expiration
   - Refresh user data from API
   ↓
During session:
   - 5-minute warning before expiration
   - Auto-logout on expiration
   ↓
Logout:
   - Clear token and user data
   - Redirect to login
```

## Testing Guide

### Test 1: Auth State Persistence

1. **Login to application**

   ```
   http://localhost:3002/login.html
   Email: test@example.com
   Password: password123
   ```

2. **Verify redirect to dashboard**

   - Should see welcome message with user's name
   - Navigation shows user name and role badge
   - Admin-only links visible/hidden based on role

3. **Refresh the page (⌘+R or Ctrl+R)**

   - Should stay logged in
   - User info still displayed
   - No redirect to login

4. **Open new tab and navigate to dashboard**

   ```
   http://localhost:3002/dashboard.html
   ```

   - Should load immediately (already authenticated)
   - User info displayed correctly

5. **Try to access login page while logged in**
   ```
   http://localhost:3002/login.html
   ```
   - Should auto-redirect to dashboard

### Test 2: Token Expiration

1. **Login to application**

2. **Open browser DevTools → Console**

3. **Manually expire token**

   ```javascript
   // Get current token
   const token = localStorage.getItem("token");

   // Decode payload
   const payload = JSON.parse(atob(token.split(".")[1]));

   // Check expiration
   console.log("Expires:", new Date(payload.exp * 1000));

   // Manually set expired token (modify payload)
   const header = token.split(".")[0];
   const signature = token.split(".")[2];
   payload.exp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
   const expiredToken = `${header}.${btoa(
     JSON.stringify(payload)
   )}.${signature}`;
   localStorage.setItem("token", expiredToken);
   ```

4. **Refresh the page**
   - Should show "Session expired" message
   - Should redirect to login page
   - Token and user data cleared from localStorage

### Test 3: Navigation & Logout

1. **Login as collector user**

   - Check navigation bar
   - Should see blue "collector" badge
   - "Manage Products" and "Manage Markets" links hidden

2. **Login as admin user**

   - Check navigation bar
   - Should see red "admin" badge
   - All navigation links visible including admin-only items

3. **Click navigation links**

   - Dashboard link works
   - Submit Price link works
   - Active page highlighted in navigation

4. **Click Logout button**
   - Confirmation dialog appears
   - Click "OK"
   - Redirected to login page
   - Token and user data cleared
   - Cannot access protected pages without login

### Test 4: Unauthorized Access

1. **Clear localStorage**

   ```javascript
   localStorage.clear();
   ```

2. **Try to access dashboard**

   ```
   http://localhost:3002/dashboard.html
   ```

   - Should immediately redirect to login page

3. **Try to access price submission**
   ```
   http://localhost:3002/price-submission.html
   ```
   - Should immediately redirect to login page

### Test 5: Token Validation on Page Load

1. **Login successfully**

2. **Open DevTools → Application → Local Storage**

   - Verify `token` exists
   - Verify `user` exists with correct data

3. **Manually corrupt the token**

   ```javascript
   localStorage.setItem("token", "invalid.token.data");
   ```

4. **Refresh dashboard**
   - Should attempt to validate with backend
   - Backend returns 401 Unauthorized
   - Auto-logout triggered
   - Redirected to login page

### Test 6: User Info Display

1. **Login successfully**

2. **Check navigation bar on dashboard**

   - User name displayed correctly
   - Role badge shows correct role with proper color
   - Badge says "ADMIN" (red) or "COLLECTOR" (blue)

3. **Navigate between pages**
   - User info persists across navigation
   - Role badge visible on all protected pages

## localStorage Structure

### Token Storage

```javascript
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ODkuLi4ifQ.abc123",
  "user": {
    "_id": "67891234567890abcdef1234",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "collector"
  }
}
```

### Token Structure (JWT)

```
Header.Payload.Signature

Decoded Payload:
{
  "id": "user_id",
  "iat": 1704988800,  // Issued at timestamp
  "exp": 1705593600   // Expiration timestamp
}
```

## Browser DevTools Testing

### Check Auth State

```javascript
// Check if authenticated
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));
console.log("Authenticated:", !!token);
console.log("User:", user);

// Check token expiration
if (token) {
  const payload = JSON.parse(atob(token.split(".")[1]));
  const expiresAt = new Date(payload.exp * 1000);
  const now = new Date();
  console.log("Token expires:", expiresAt);
  console.log("Time remaining:", expiresAt - now, "ms");
  console.log("Is expired:", now >= expiresAt);
}
```

### Manual Logout

```javascript
localStorage.removeItem("token");
localStorage.removeItem("user");
location.reload();
```

### Simulate Different Roles

```javascript
// Change user role in localStorage
const user = JSON.parse(localStorage.getItem("user"));
user.role = "admin"; // or 'collector'
localStorage.setItem("user", JSON.stringify(user));
location.reload();
```

## Security Features

### ✅ Implemented

- JWT tokens stored securely in localStorage
- Token expiration validation on every page load
- Automatic cleanup of expired tokens
- Server-side token verification via getCurrentUser()
- Protected routes redirect unauthenticated users
- Logout clears all authentication data
- Role-based UI hiding (admin-only links)

### ⚠️ Considerations

- LocalStorage is vulnerable to XSS attacks
- No HTTP-only cookies (would be more secure)
- No automatic token refresh
- No CSRF protection (add for production)

### 🔒 Production Recommendations

1. Use HTTP-only cookies for tokens
2. Implement token refresh mechanism
3. Add CSRF tokens
4. Use HTTPS only
5. Implement rate limiting
6. Add security headers
7. Consider session timeout

## API Endpoints Used

### GET /api/auth/me

```javascript
// Called by initializeAuth() to refresh user data
Headers: {
  'Authorization': 'Bearer <token>'
}

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "collector"
  }
}
```

## Known Behaviors

### Token Expiration Warning

- Shows confirmation dialog 5 minutes before expiration
- User can choose to stay logged in (refreshes data)
- Automatically logs out when token expires

### Multi-Tab Behavior

- Auth state shared across tabs (same localStorage)
- Logout in one tab doesn't immediately affect others
- Other tabs log out on next action/refresh

### Page Refresh

- Auth state persists across refreshes
- User data refreshed from server on each page load
- Expired tokens detected and cleaned up immediately

## Next Steps

After auth state handling:

- [ ] Implement dashboard data loading from API
- [ ] Add price submission form functionality
- [ ] Implement product and market management
- [ ] Add real-time notifications
- [ ] Implement token refresh mechanism
- [ ] Add remember me functionality (longer token expiration)

## Troubleshooting

### "Session expired" message on login page

- **Cause**: Had expired token in localStorage
- **Fix**: Token automatically cleaned up, just login again

### User info not showing in navigation

- **Cause**: Navigation not initialized or user data not in localStorage
- **Fix**: Check console for errors, verify token exists

### Redirected to login immediately after login

- **Cause**: Token being marked as expired immediately
- **Fix**: Check server time vs client time, verify JWT_EXPIRES_IN in backend

### Admin links still showing for collectors

- **Cause**: navbar.js not hiding admin-only elements
- **Fix**: Verify initNavbar() is being called, check console for errors

## Success Criteria

✅ **JWT tokens stored in localStorage**
✅ **Auth state persists across page reloads**
✅ **Token expiration checked on page load**
✅ **Expired tokens automatically cleaned up**
✅ **User data refreshed from server**
✅ **Navigation shows user info and role**
✅ **Logout clears all auth data**
✅ **Protected routes require authentication**
✅ **Token expiration warning implemented**
✅ **Role-based UI visibility**

---

**Status**: ✅ **Frontend Prompt 5 - COMPLETE**

Authentication state is fully managed across page reloads with JWT storage in localStorage!
