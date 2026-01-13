# Authentication Middleware Documentation

## Overview

The authentication middleware verifies JWT tokens and protects private routes. It includes both authentication (who you are) and authorization (what you can do) functionality.

## Middleware Functions

### 1. `authMiddleware`

Verifies JWT tokens and authenticates users.

**Features:**

- Extracts JWT token from `Authorization: Bearer <token>` header
- Verifies token signature and expiration
- Checks if user still exists in database
- Attaches user info to `req.user` object
- Handles token errors gracefully

**Usage:**

```javascript
import { authMiddleware } from "../middlewares/authMiddleware.js";

// Protect a single route
router.get("/profile", authMiddleware, getProfile);
```

### 2. `authorize(...roles)`

Role-based authorization middleware (use after `authMiddleware`).

**Features:**

- Checks if authenticated user has required role(s)
- Supports multiple roles (admin, collector)
- Returns 403 Forbidden if user lacks permission

**Usage:**

```javascript
import { authMiddleware, authorize } from "../middlewares/authMiddleware.js";

// Admin only route
router.delete("/users/:id", authMiddleware, authorize("admin"), deleteUser);

// Admin or collector
router.post(
  "/data",
  authMiddleware,
  authorize("admin", "collector"),
  createData
);
```

## Implementation Examples

### Protecting Routes

#### Example 1: Public Route (No Protection)

```javascript
router.get("/api/examples", getAllExamples);
```

#### Example 2: Protected Route (Authentication Required)

```javascript
router.post("/api/examples", authMiddleware, createExample);
```

#### Example 3: Admin Only Route (Authentication + Authorization)

```javascript
router.delete(
  "/api/examples/:id",
  authMiddleware,
  authorize("admin"),
  deleteExample
);
```

#### Example 4: Multiple Roles

```javascript
router.put(
  "/api/data/:id",
  authMiddleware,
  authorize("admin", "collector"),
  updateData
);
```

### Controller Usage

Access authenticated user info in controllers via `req.user`:

```javascript
export const getProfile = async (req, res) => {
  try {
    // req.user is populated by authMiddleware
    const { id, email, name, role } = req.user;

    const user = await User.findById(id);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

## Request Object

After successful authentication, `req.user` contains:

```javascript
{
  id: "user_mongodb_id",
  email: "user@example.com",
  name: "User Name",
  role: "admin" // or "collector"
}
```

## Error Responses

### 401 Unauthorized

```json
{
  "success": false,
  "error": "No token provided. Please login to access this resource."
}
```

```json
{
  "success": false,
  "error": "Invalid token. Please login again."
}
```

```json
{
  "success": false,
  "error": "Token expired. Please login again."
}
```

### 403 Forbidden

```json
{
  "success": false,
  "error": "Access denied. This resource requires admin role."
}
```

## Testing Protected Routes

### Step 1: Register/Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Step 2: Access Protected Route

```bash
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Current Protected Routes

### Auth Routes (`/api/auth`)

- `POST /register` - Public
- `POST /login` - Public
- `GET /me` - Protected (requires auth)

### User Routes (`/api/users`)

- `POST /login` - Public
- `GET /` - Protected (admin only)
- `GET /:id` - Protected (authenticated users)
- `POST /` - Protected (admin only)
- `PUT /:id` - Protected (authenticated users)
- `DELETE /:id` - Protected (admin only)

### Example Routes (`/api/examples`)

- `GET /examples` - Public
- `GET /examples/:id` - Public
- `POST /examples` - Protected (authenticated users)
- `PUT /examples/:id` - Protected (authenticated users)
- `DELETE /examples/:id` - Protected (admin only)

## Security Best Practices

1. **Always use HTTPS in production** - JWT tokens can be intercepted over HTTP
2. **Set strong JWT_SECRET** - Use a long, random string
3. **Keep tokens short-lived** - Default is 7 days, consider shorter for high-security apps
4. **Store tokens securely** - Use httpOnly cookies or secure storage in frontend
5. **Implement token refresh** - Consider adding refresh token mechanism for better UX
6. **Validate user existence** - Middleware checks if user still exists before granting access
7. **Handle token expiration gracefully** - Frontend should redirect to login on 401 errors

## Environment Variables

Required in `.env`:

```
JWT_SECRET=your_very_secret_key_here_min_32_characters
JWT_EXPIRES_IN=7d
```
