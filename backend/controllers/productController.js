// controllers/productController.js
const axios = require('axios');
const Product = require('../models/Product');
const validator = require('validator');
const logger = require('../config/logger');

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
  const { stock } = req.body;
  const { productId } = req.params;

  // Validate product ID.
  if (!productId || !validator.isMongoId(productId)) {
    return res.status(400).json({ message: 'Invalid product ID.' });
  }

  // Validate stock is provided.
  if (stock === undefined || stock === null) {
    return res.status(400).json({ message: 'Stock is required.' });
  }

  // Validate stock is an integer.
  if (!Number.isInteger(stock)) {
    return res.status(400).json({ message: 'Stock must be an integer.' });
  }

  // Validate stock range.
  if (stock < 0 || stock > 1000000) {
    return res.status(400).json({ message: 'Stock must be between 0 and 1000000.' });
  }

  try {
    const product = await Product.findById(productId);

    // Check if product exists.
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Update stock.
    product.stock = stock;
    product.updatedAt = Date.now();

    await product.save();

    // Notify stock management service.
    try {
      await axios.post('http://localhost:8000/update-stock', {
        productId,
        quantity: stock,
        productName: product.name,
      });
    } catch (error) {
      logger.warn('Stock management notification failed.', error);
    }

    res.json({ message: 'Stock updated successfully.', product });
  } catch (error) {
    logger.error('Error updating stock.', error);
    res.status(500).json({ message: 'An error occurred.' });
  }
};