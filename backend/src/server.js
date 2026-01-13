import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import database connection
import connectDB from './config/database.js';

// Import routes
import indexRoutes from './routes/index.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import priceSubmissionRoutes from './routes/priceSubmissionRoutes.js';

// Import error handling middleware
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());

// Morgan configuration - different formats for dev vs production
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined')); // Apache style for production
} else {
  app.use(morgan('dev')); // Concise colored output for development
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware - log all incoming requests
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] 📨 ${req.method} ${req.originalUrl}`);

  // Log query parameters if present
  if (Object.keys(req.query).length > 0) {
    console.log(`   Query:`, req.query);
  }

  // Log request body if present (sanitized)
  if (req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
    if (sanitizedBody.token) sanitizedBody.token = '[REDACTED]';
    console.log(`   Body:`, sanitizedBody);
  }

  // Capture the original res.json to log responses
  const originalJson = res.json;
  res.json = function (data) {
    // Log error responses
    if (data && data.success === false) {
      console.error(`\n❌ ERROR RESPONSE [${req.method} ${req.originalUrl}]:`);
      console.error(`   Status: ${res.statusCode}`);
      console.error(`   Error:`, data.error || data.message || 'Unknown error');
      if (data.errors) {
        console.error(`   Validation Errors:`, data.errors);
      }
    }
    return originalJson.call(this, data);
  };

  next();
});

// Routes
app.use('/api', indexRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/price-submissions', priceSubmissionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handling middleware - must be last
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('\n' + '='.repeat(80));
  console.error('🔴 UNHANDLED PROMISE REJECTION! Shutting down...');
  console.error('='.repeat(80));
  console.error(err);
  console.error('='.repeat(80) + '\n');

  // Close server gracefully
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('\n' + '='.repeat(80));
  console.error('🔴 UNCAUGHT EXCEPTION! Shutting down...');
  console.error('='.repeat(80));
  console.error(err);
  console.error('='.repeat(80) + '\n');

  // Exit immediately for uncaught exceptions
  process.exit(1);
});

// Handle process termination signals
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated!');
  });
});

process.on('SIGINT', () => {
  console.log('\n👋 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated!');
    process.exit(0);
  });
});

export default app;
