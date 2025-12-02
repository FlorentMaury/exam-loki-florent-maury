// Order routes.
const express = require('express');
const { createOrder, deleteOrder, getOrders, validateOrder, updateOrderStatus } = require('../controllers/orderController');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Get all orders (admin only).
router.get('/', authenticateToken, isAdmin, getOrders);

// Create new order (authenticated users).
router.post('/', authenticateToken, createOrder);

// Delete order (admin only).
router.delete('/:id', authenticateToken, deleteOrder);

// Validate order (admin only).
router.put('/:id/validate', authenticateToken, isAdmin, validateOrder);

// Update order status (admin only).
router.put('/:orderId/status', authenticateToken, isAdmin, updateOrderStatus);

module.exports = router;