# Error Handling Documentation

## Overview

The backend uses a centralized error-handling system that provides consistent API error responses across all endpoints.

## Custom Error Classes

### AppError (Base Class)

General purpose error for operational errors.

```javascript
import { AppError } from "../middlewares/errorHandler.js";

throw new AppError("Something went wrong", 400);
```

### ValidationError

For validation errors (400 Bad Request).

```javascript
import { ValidationError } from "../middlewares/errorHandler.js";

throw new ValidationError("Invalid input data");
```

### NotFoundError

For resource not found errors (404).

```javascript
import { NotFoundError } from "../middlewares/errorHandler.js";

throw new NotFoundError("User not found");
```

### UnauthorizedError

For authentication errors (401).

```javascript
import { UnauthorizedError } from "../middlewares/errorHandler.js";

throw new UnauthorizedError("Invalid credentials");
```

### ForbiddenError

For authorization errors (403).

```javascript
import { ForbiddenError } from "../middlewares/errorHandler.js";

throw new ForbiddenError("Access denied");
```

## Error Handler Middleware

The global error handler automatically handles:

### 1. Mongoose Validation Errors

**Triggered by:** Schema validation failures
**Status:** 400
**Response:**

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "status": 400,
    "errors": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### 2. Mongoose CastError (Invalid ObjectId)

**Triggered by:** Invalid MongoDB ObjectId
**Status:** 400
**Response:**

```json
{
  "success": false,
  "error": {
    "message": "Invalid _id: abc123",
    "status": 400
  }
}
```

### 3. Duplicate Key Error

**Triggered by:** Unique constraint violation
**Status:** 400
**Response:**

```json
{
  "success": false,
  "error": {
    "message": "email already exists",
    "status": 400
  }
}
```

### 4. JWT Errors

**JsonWebTokenError** (Invalid token)
**Status:** 401

```json
{
  "success": false,
  "error": {
    "message": "Invalid token. Please login again.",
    "status": 401
  }
}
```

**TokenExpiredError** (Expired token)
**Status:** 401

```json
{
  "success": false,
  "error": {
    "message": "Token expired. Please login again.",
    "status": 401
  }
}
```

### 5. 404 Not Found

**Triggered by:** Accessing undefined routes
**Response:**

```json
{
  "success": false,
  "error": {
    "message": "Route /api/invalid not found",
    "status": 404
  }
}
```

### 6. Generic Server Errors

**Status:** 500
**Response:**

```json
{
  "success": false,
  "error": {
    "message": "Internal Server Error",
    "status": 500
  }
}
```

## Async Handler Wrapper

Use `asyncHandler` to automatically catch errors in async route handlers:

```javascript
import { asyncHandler } from "../middlewares/errorHandler.js";

// Without asyncHandler (need try-catch)
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// With asyncHandler (no try-catch needed)
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError("User not found");
  res.json({ success: true, data: user });
});
```

## Usage Examples

### In Controllers

```javascript
import { NotFoundError, ValidationError } from "../middlewares/errorHandler.js";

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error); // Pass to error handler
  }
};
```

### In Middleware

```javascript
import { UnauthorizedError } from "../middlewares/errorHandler.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new UnauthorizedError("No token provided");
    }

    // Verify token...
    next();
  } catch (error) {
    next(error);
  }
};
```

## Development vs Production

### Development Mode

- Includes full stack traces in error responses
- Detailed console logging

### Production Mode

- No stack traces exposed
- Minimal error details to prevent information leakage

Set environment:

```bash
NODE_ENV=production  # Production
NODE_ENV=development # Development
```

## Error Response Structure

All errors follow this consistent structure:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "status": 400,
    "errors": [
      // Optional: validation errors array
    ],
    "stack": "..." // Only in development
  }
}
```

## Best Practices

1. **Always pass errors to next()** in async route handlers
2. **Use appropriate error classes** for different scenarios
3. **Don't expose sensitive information** in error messages
4. **Log errors** for debugging but sanitize responses
5. **Use asyncHandler wrapper** to reduce boilerplate
6. **Test error scenarios** to ensure proper handling
