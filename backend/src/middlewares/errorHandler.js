// Custom error classes
export class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

// Centralized error handler middleware
export const errorHandler = (err, req, res, next) => {
  // Comprehensive error logging
  const timestamp = new Date().toISOString();
  const isDevelopment = process.env.NODE_ENV === 'development';

  console.error('\n' + '='.repeat(80));
  console.error(`[${timestamp}] ERROR OCCURRED`);
  console.error('='.repeat(80));

  // Request details
  console.error('\n📍 REQUEST DETAILS:');
  console.error(`   Method: ${req.method}`);
  console.error(`   URL: ${req.originalUrl}`);
  console.error(`   IP: ${req.ip || req.connection.remoteAddress}`);
  console.error(`   User Agent: ${req.get('user-agent') || 'N/A'}`);

  // User information (if authenticated)
  if (req.user) {
    console.error(`   User ID: ${req.user._id || req.user.id}`);
    console.error(`   User Email: ${req.user.email || 'N/A'}`);
    console.error(`   User Role: ${req.user.role || 'N/A'}`);
  } else {
    console.error(`   User: Not authenticated`);
  }

  // Request body (sanitized)
  if (req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    // Remove sensitive fields from logs
    if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
    if (sanitizedBody.token) sanitizedBody.token = '[REDACTED]';
    console.error(`   Request Body:`, JSON.stringify(sanitizedBody, null, 2));
  }

  // Error details
  console.error('\n🚨 ERROR DETAILS:');
  console.error(err);

  console.error('\n' + '='.repeat(80) + '\n');

  // Default error status and message
  let status = err.status || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Handle specific error types

  // Mongoose Validation Error
  if (err.name === 'ValidationError' && err.errors) {
    status = 400;
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    message = 'Validation failed';
  }

  // Mongoose CastError (Invalid ObjectId)
  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    status = 400;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists`;
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid token. Please login again.';
  }

  if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token expired. Please login again.';
  }

  // Multer File Upload Errors (if using file uploads)
  if (err.name === 'MulterError') {
    status = 400;
    message = `File upload error: ${err.message}`;
  }

  // Build error response
  const errorResponse = {
    success: false,
    error: {
      message,
      status,
    },
  };

  // Add validation errors if present
  if (errors) {
    errorResponse.error.errors = errors;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  // Send error response
  res.status(status).json(errorResponse);
};

// 404 Not Found Handler
export const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};

// Async handler wrapper to catch errors in async route handlers
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
