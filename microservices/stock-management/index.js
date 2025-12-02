// Stock management service that triggers notifications.
const express = require('express');
const axios = require('axios');
const validator = require('validator');
const app = express();
const PORT = process.env.STOCK_PORT || 4003;

app.use(express.json());

// Update product stock and send notification.
app.post('/update-stock', async (req, res) => {
  const { productId, quantity, productName } = req.body;

  // Validate product ID.
  if (!productId || !validator.isMongoId(productId)) {
    return res.status(400).json({ message: 'Invalid product ID.' });
  }

  // Validate quantity.
  if (!Number.isInteger(quantity) || quantity < 0) {
    return res.status(400).json({ message: 'Quantity must be a positive integer.' });
  }

  try {
    // Send notification about stock update.
    await axios.post('http://localhost:8000/notify', {
      to: 'syaob@yahoo.fr',
      subject: 'Stock Update Notification',
      text: `Product ${productName} stock has been updated to ${quantity} units.`,
    });

    res.json({ message: 'Stock updated and notification sent.', productId, quantity });
  } catch (error) {
    console.error('Error updating stock.', error);
    res.status(500).json({ message: 'An error occurred.' });
  }
});

// Health check endpoint.
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'stock-management' });
});

// Start stock management service.
app.listen(PORT, () => {
  console.log(`Stock management service listening on port ${PORT}`);
});
