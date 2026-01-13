import express from 'express';
import {
  getAllExamples,
  getExampleById,
  createExample,
  updateExample,
  deleteExample,
} from '../controllers/exampleController.js';
import { authMiddleware, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Welcome route (public)
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Example CRUD routes
// Public routes - anyone can view
router.get('/examples', getAllExamples);
router.get('/examples/:id', getExampleById);

// Protected routes - require authentication
router.post('/examples', authMiddleware, createExample);
router.put('/examples/:id', authMiddleware, updateExample);

// Admin only - delete examples
router.delete('/examples/:id', authMiddleware, authorize('admin'), deleteExample);

export default router;
