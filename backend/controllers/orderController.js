// backend/controllers/orderController.js
const axios = require('axios');
const Order = require('../models/Order');
const Product = require('../models/Product');
const validator = require('validator');
const logger = require('../config/logger');
const { auditLog } = require('../config/audit');

// Create order.
exports.createOrder = async (req, res) => {
  const { items, shippingAddress, paymentMethod, shippingMethod } = req.body;
  const userId = req.user.userId;

  logger.info(`Creating order for user ${userId}`, { items: items?.length });

  // Validate user ID.
  if (!userId || !validator.isMongoId(userId)) {
    logger.warn('Invalid user ID for order creation');
    return res.status(400).json({ message: 'Invalid user data.' });
  }

  // Validate items array.
  if (!Array.isArray(items) || items.length === 0) {
    logger.warn(`Invalid items for order - got: ${JSON.stringify(items)}`);
    return res.status(400).json({ message: 'Order must contain at least one item.' });
  }

  // Validate items array length.
  if (items.length > 100) {
    return res.status(400).json({ message: 'Order cannot contain more than 100 items.' });
  }

  // Validate each item.
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (!item.productId || !validator.isMongoId(item.productId)) {
      logger.warn(`Invalid product ID in item: ${JSON.stringify(item)}`);
      return res.status(400).json({ message: 'Invalid product ID.' });
    }

    if (!Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 1000) {
      logger.warn(`Invalid quantity for item ${item.productId}: ${item.quantity}`);
      return res.status(400).json({ message: 'Quantity must be a positive integer less than 1000.' });
    }

    if (typeof item.price !== 'number' || item.price < 0 || item.price > 1000000) {
      logger.warn(`Invalid price for item ${item.productId}: ${item.price}`);
      return res.status(400).json({ message: 'Price must be a positive number less than 1000000.' });
    }
  }

  // Validate shipping address.
  if (!shippingAddress || typeof shippingAddress !== 'object') {
    logger.warn('Invalid shipping address');
    return res.status(400).json({ message: 'Invalid shipping address.' });
  }

  const { street, city, postalCode, country } = shippingAddress;

  if (!street || !city || !postalCode || !country) {
    logger.warn('Missing address fields');
    return res.status(400).json({ message: 'All address fields are required.' });
  }

  if (typeof street !== 'string' || typeof city !== 'string' || typeof postalCode !== 'string' || typeof country !== 'string') {
    logger.warn('Invalid address field types');
    return res.status(400).json({ message: 'Invalid address format.' });
  }

  if (street.trim().length === 0 || city.trim().length === 0 || postalCode.trim().length === 0 || country.trim().length === 0) {
    logger.warn('Empty address fields');
    return res.status(400).json({ message: 'Address fields cannot be empty.' });
  }

  // Validate payment method.
  const validPaymentMethods = ['Carte bancaire', 'PayPal', 'Virement bancaire', 'Crypto-monnaie'];
  if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
    logger.warn(`Invalid payment method: ${paymentMethod}`);
    return res.status(400).json({ message: 'Invalid payment method.' });
  }

  // Validate shipping method.
  const validShippingMethods = ['Express', 'Standard', 'Économique', 'Retrait'];
  if (!shippingMethod || !validShippingMethods.includes(shippingMethod)) {
    logger.warn(`Invalid shipping method: ${shippingMethod}`);
    return res.status(400).json({ message: 'Invalid shipping method.' });
  }

  try {
    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    logger.info(`Order total calculated: ${total}`);

    // Decrement stock for each item.
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const product = await Product.findById(item.productId);
      
      if (!product) {
        logger.warn(`Product not found: ${item.productId}`);
        return res.status(404).json({ message: `Product ${item.productId} not found.` });
      }

      if (product.stock < item.quantity) {
        logger.warn(`Insufficient stock for product ${product.name}: have ${product.stock}, need ${item.quantity}`);
        return res.status(400).json({ message: `Insufficient stock for product ${product.name}.` });
      }

      product.stock -= item.quantity;
      await product.save();
      logger.info(`Stock updated for product ${product.name}: new stock = ${product.stock}`);
    }

    const newOrder = new Order({
      userId,
      items,
      total,
      shippingAddress,
      paymentMethod,
      shippingMethod,
    });

    const savedOrder = await newOrder.save();
    logger.info(`Order created successfully: ${savedOrder._id}`);
    auditLog('ORDER_CREATED', userId, { orderId: savedOrder._id, total, items: items.length }, 'success');

    try {
      await axios.post('http://localhost:8000/notify', {
        to: 'syaob@yahoo.fr',
        subject: 'New Order Created',
        text: `An order has been successfully created for a total of ${total}.`,
      });
    } catch (error) {
      logger.warn(`Notification failed for order ${savedOrder._id}`, error);
    }

    res.status(201).json({ message: 'Order created successfully.', order: savedOrder });
  } catch (error) {
    logger.error('Error creating order.', error);
    auditLog('ORDER_CREATED', userId, { items: items.length }, 'failure');
    res.status(500).json({ message: 'An error occurred.' });
  }
};

// Delete order.
exports.deleteOrder = async (req, res) => {
  const { orderId } = req.body;

  if (!orderId || !validator.isMongoId(orderId)) {
    return res.status(400).json({ message: 'Invalid order ID.' });
  }

  try {
    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.status(200).json({ message: 'Order deleted successfully.' });
  } catch (error) {
    logger.error('Error deleting order.', error);
    res.status(500).json({ message: 'An error occurred.' });
  }
};

// Get all orders.
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    logger.error('Error retrieving orders.', error);
    res.status(500).json({ message: 'An error occurred.' });
  }
};

// Validate order.
exports.validateOrder = async (req, res) => {
  const { orderId } = req.body;

  if (!orderId || !validator.isMongoId(orderId)) {
    return res.status(400).json({ message: 'Invalid order ID.' });
  }

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.status(200).json({ message: 'Order validated successfully.', order });
  } catch (error) {
    logger.error('Error validating order.', error);
    res.status(500).json({ message: 'An error occurred.' });
  }
};

// Update order status.
exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!orderId || !validator.isMongoId(orderId)) {
    return res.status(400).json({ message: 'Invalid order ID.' });
  }

  const validStatuses = ['En attente', 'Confirmée', 'Expédiée', 'Livrée', 'Annulée'];
  if (!status || typeof status !== 'string' || !validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' });
  }

  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.status(200).json({ message: 'Status updated successfully.', order });
  } catch (error) {
    logger.error('Error updating order status.', error);
    res.status(500).json({ message: 'An error occurred.' });
  }
};
