import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
} from '../controllers/userController.js';
import { authMiddleware, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// User authentication routes (public)
router.post('/login', loginUser);

// User CRUD routes (protected - require authentication)
// Only admins can view all users
router.get('/', authMiddleware, authorize('admin'), getAllUsers);

// Authenticated users can view specific user details
router.get('/:id', authMiddleware, getUserById);

// Only admins can create users
router.post('/', authMiddleware, authorize('admin'), createUser);

// Users can update their own profile, admins can update any
router.put('/:id', authMiddleware, updateUser);

// Only admins can delete users
router.delete('/:id', authMiddleware, authorize('admin'), deleteUser);

export default router;
