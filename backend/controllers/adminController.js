// backend/controllers/adminController.js
const axios = require('axios');
const Order = require('../models/Order');
const Product = require('../models/Product');
const validator = require('validator');
const logger = require('../config/logger');

// Get all orders.
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    logger.error('Error retrieving orders.', error);
    res.status(500).json({ message: 'An error occurred.' });
  }
};

// Update order status.
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate order ID.
  if (!id || !validator.isMongoId(id)) {
    return res.status(400).json({ message: 'Invalid order ID.' });
  }

  // Validate status.
  const validStatuses = ['En attente', 'Confirmée', 'Expédiée', 'Livrée', 'Annulée'];
  if (!status || typeof status !== 'string' || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' });
  }

  try {
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    try {
      await axios.post('http://localhost:8000/notify', {
        message: `Order status ${id} has been updated to "${status}".`,
      });
    } catch (error) {
      logger.warn('Notification failed.', error);
    }

    res.json({ message: 'Order status updated successfully.', order });
  } catch (error) {
    logger.error('Error updating order status.', error);
    res.status(500).json({ message: 'An error occurred.' });
  }
};

// Validate order.
exports.validateOrder = async (req, res) => {
  const { id } = req.params;

  if (!id || !validator.isMongoId(id)) {
    return res.status(400).json({ message: 'Invalid order ID.' });
  }

  try {
    const order = await Order.findByIdAndUpdate(id, { status: 'Confirmée' }, { new: true });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    try {
      await axios.post('http://localhost:8000/notify', {
        message: `Order ${id} has been validated.`,
      });
    } catch (error) {
      logger.warn('Notification failed.', error);
    }

    res.json({ message: 'Order validated successfully.', order });
  } catch (error) {
    logger.error('Error validating order.', error);
    res.status(500).json({ message: 'An error occurred.' });
  }
};

// Get all products.
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    logger.error('Error retrieving products.', error);
    res.status(500).json({ message: 'An error occurred.' });
  }
};

// Update product stock.
exports.updateProductStock = async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;

  if (!id || !validator.isMongoId(id)) {
    return res.status(400).json({ message: 'Invalid product ID.' });
  }

  if (stock === undefined || stock === null) {
    return res.status(400).json({ message: 'Stock is required.' });
  }

  if (!Number.isInteger(stock)) {
    return res.status(400).json({ message: 'Stock must be an integer.' });
  }

  if (stock < 0 || stock > 1000000) {
    return res.status(400).json({ message: 'Stock must be between 0 and 1000000.' });
  }

  try {
    const product = await Product.findByIdAndUpdate(id, { stock }, { new: true });

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    try {
      await axios.post('http://localhost:8000/notify', {
        message: `Product ${id} stock has been updated to ${stock}.`,
      });
    } catch (error) {
      logger.warn('Notification failed.', error);
    }

    res.json({ message: 'Product stock updated successfully.', product });
  } catch (error) {
    logger.error('Error updating product stock.', error);
    res.status(500).json({ message: 'An error occurred.' });
  }
};
