# Authentication UI - Testing Guide

## ✅ Completed Features

### Frontend Prompt 4 - Authentication UI

Built complete login and registration forms with Fetch API integration to backend.

## What Was Implemented

### 1. **API Service** ([src/services/api.service.js](src/services/api.service.js))

- Generic HTTP request wrapper using Fetch API
- Methods: `get()`, `post()`, `put()`, `patch()`, `delete()`
- Centralized error handling
- Network error detection
- Authenticated request support

### 2. **Auth Service** ([src/services/auth.service.js](src/services/auth.service.js))

- `register()` - Create new user account
- `login()` - Authenticate user
- `logout()` - Clear session and redirect
- `getCurrentUser()` - Fetch current user data
- `isAuthenticated()` - Check login status
- Token management (get/set/remove)
- User data management (get/set/remove)
- Role checking (`hasRole()`, `isAdmin()`)
- Route protection (`requireAuth()`, `redirectIfAuthenticated()`)

### 3. **Validation Utilities** ([src/utils/validation.js](src/utils/validation.js))

- Email format validation
- Password strength validation
- Field error display/clearing
- Form message display (success/error)
- Submit button loading states
- Form data extraction

### 4. **Login Page** ([src/pages/login.js](src/pages/login.js))

- Form submission handler
- Real-time validation on blur
- Email and password validation
- Remember me functionality
- API integration
- Error message display
- Automatic redirect on success
- Loading states during submission

### 5. **Registration Page** ([src/pages/register.js](src/pages/register.js))

- Comprehensive form validation:
  - Name (min 2 characters)
  - Email format
  - Password strength (min 6 characters)
  - Password confirmation matching
  - Role selection
  - Terms acceptance
- Real-time field validation
- API integration
- Error handling
- Auto-login after registration
- Redirect to dashboard

### 6. **Updated CSS** ([src/style.css](src/style.css))

- Error state styling for form fields
- Error message display styles
- Form message banner (success/error variants)
- Proper spacing and colors
- Responsive design

## How to Test

### Prerequisites

✅ Backend server running on http://localhost:5000
✅ Frontend dev server running on http://localhost:3002
✅ MongoDB connected

### Test Registration Flow

1. **Open Registration Page**

   - Navigate to: http://localhost:3002/register.html
   - Should see "Create Account" form

2. **Test Field Validation**

   - Leave name empty, click outside → See "Name is required" error
   - Enter "A" in name → See "Name must be at least 2 characters"
   - Enter invalid email "test@" → See "Please enter a valid email address"
   - Enter password "123" → See "Password must be at least 6 characters"
   - Enter different password in confirm field → See "Passwords do not match"
   - Don't select role → See "Please select an account type"
   - Don't check terms → See "You must agree to the terms and conditions"

3. **Create Test Account**

   ```
   Full Name: John Doe
   Email: john.doe@example.com
   Password: password123
   Confirm Password: password123
   Account Type: Collector
   ✓ Terms checkbox
   ```

4. **Submit Form**

   - Click "Create Account"
   - Button shows "Creating account..." (disabled)
   - On success:
     - Green success message: "Registration successful! Redirecting..."
     - Auto-redirect to dashboard after 1 second
     - Token stored in localStorage

5. **Verify Storage**
   - Open DevTools → Application → Local Storage
   - Should see:
     - `token`: JWT token string
     - `user`: JSON object with user data

### Test Login Flow

1. **Open Login Page**

   - Navigate to: http://localhost:3002/login.html
   - Should see "Login" form

2. **Test Field Validation**

   - Leave email empty → See "Email is required" error
   - Enter invalid email → See "Please enter a valid email address"
   - Leave password empty → See "Password is required"

3. **Test Invalid Credentials**

   ```
   Email: wrong@example.com
   Password: wrongpassword
   ```

   - Submit form
   - See error message: "Invalid email or password"

4. **Test Valid Login**
   ```
   Email: john.doe@example.com
   Password: password123
   ✓ Remember me (optional)
   ```
   - Submit form
   - Button shows "Logging in..." (disabled)
   - On success:
     - Green success message: "Login successful! Redirecting..."
     - Auto-redirect to dashboard after 1 second
     - Token stored in localStorage

### Test Protected Routes

1. **Access Dashboard While Logged In**

   - Navigate to: http://localhost:3002/dashboard.html
   - Should load successfully (page exists but may be empty for now)

2. **Test Logout**

   - Open browser console
   - Run: `localStorage.clear()`
   - Refresh page
   - Should redirect to login page

3. **Access Auth Pages While Logged In**
   - Login first
   - Try to access http://localhost:3002/login.html
   - Should auto-redirect to dashboard
   - Same for register.html

### Test Error Handling

1. **Network Error**

   - Stop backend server
   - Try to login or register
   - Should see: "Network error. Please check your connection."

2. **Duplicate Email**

   - Register with same email twice
   - Should see: "Email is already registered"
   - Error also shown below email field

3. **Server Errors**
   - Backend should return appropriate error messages
   - Frontend displays them in form message banner

## Browser DevTools Inspection

### Network Tab

Check API requests:

```
POST http://localhost:5000/api/auth/register
POST http://localhost:5000/api/auth/login
```

Request payload:

```json
{
  "email": "john.doe@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "collector"
}
```

Response (success):

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "collector"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Console Tab

Should see:

- "Register page initialized" on register.html
- "Login page initialized" on login.html
- Any API errors for debugging

### Local Storage

Inspect stored data:

```javascript
// View token
localStorage.getItem("token");

// View user
JSON.parse(localStorage.getItem("user"));

// Clear all
localStorage.clear();
```

## Expected Behavior Summary

### ✅ Registration

- [x] Form validation on blur
- [x] Real-time error messages
- [x] Password confirmation check
- [x] API call to backend
- [x] Token storage
- [x] Auto-redirect to dashboard
- [x] Error handling for duplicate email
- [x] Loading state on submit

### ✅ Login

- [x] Form validation on blur
- [x] Email format validation
- [x] API call to backend
- [x] Token storage
- [x] Remember me option
- [x] Auto-redirect to dashboard
- [x] Error handling for invalid credentials
- [x] Loading state on submit

### ✅ Security

- [x] JWT token stored in localStorage
- [x] Tokens included in API requests
- [x] Protected route redirects
- [x] Logout clears session
- [x] Auto-redirect if already authenticated

### ✅ User Experience

- [x] Clear error messages
- [x] Success feedback
- [x] Loading states
- [x] Smooth redirects
- [x] Responsive design
- [x] Professional styling

## Known Limitations

1. **Dashboard Page**: Currently empty, will be implemented in next prompt
2. **Token Refresh**: No automatic token refresh implemented
3. **Password Reset**: Not implemented yet
4. **Email Verification**: Not implemented yet

## Next Steps

After authentication is working:

- [ ] Implement dashboard with user statistics
- [ ] Add price submission form functionality
- [ ] Implement product and market management
- [ ] Add user profile page
- [ ] Implement logout button in navigation
- [ ] Add token expiration handling
- [ ] Implement password reset flow

## Troubleshooting

### "Network error. Please check your connection."

- **Cause**: Backend server not running
- **Fix**: Start backend with `npm start` in backend folder

### CORS Errors

- **Cause**: Backend CORS not configured for frontend URL
- **Fix**: Update backend CORS settings to allow http://localhost:3002

### Token not persisting

- **Cause**: LocalStorage disabled or browser in private mode
- **Fix**: Use regular browser window, enable LocalStorage

### Registration succeeds but no redirect

- **Cause**: JavaScript console errors
- **Fix**: Check browser console for errors, verify dashboard.html exists

## Success Criteria

✅ **All tests pass**
✅ **Users can register new accounts**
✅ **Users can login with credentials**
✅ **Tokens stored correctly**
✅ **Protected routes redirect properly**
✅ **Error messages display correctly**
✅ **Form validation works**
✅ **Loading states show during API calls**

---

**Status**: ✅ **Frontend Prompt 4 - COMPLETE**

The authentication UI is fully functional and ready for use!
