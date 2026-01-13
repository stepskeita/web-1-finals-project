import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  updateProductStock,
} from '../controllers/productController.js';
import { authMiddleware, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes - anyone can view products
router.get('/', getAllProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProductById);

// Protected routes - require authentication
// Any authenticated user can create products
router.post('/', authMiddleware, createProduct);

// Update and delete require user to be creator or admin
router.put('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

// Update stock - admin or creator only
router.patch('/:id/stock', authMiddleware, updateProductStock);

export default router;
