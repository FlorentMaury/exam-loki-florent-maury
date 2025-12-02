// Admin routes.
const express = require('express');
const {
  getOrders,
  updateOrderStatus,
  validateOrder,
  getProducts,
  updateProductStock
} = require('../controllers/adminController');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Get all orders (admin only).
router.get('/orders', authenticateToken, isAdmin, getOrders);

// Update order status (admin only).
router.put('/orders/:id/status', authenticateToken, isAdmin, updateOrderStatus);

// Validate order (admin only).
router.put('/orders/:id/validate', authenticateToken, isAdmin, validateOrder);

// Get all products (admin only).
router.get('/products', authenticateToken, isAdmin, getProducts);

// Update product stock (admin only).
router.put('/products/:id/stock', authenticateToken, isAdmin, updateProductStock);

module.exports = router;
