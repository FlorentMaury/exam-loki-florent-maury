// Stock management service.
const express = require('express');
const validator = require('validator');
const app = express();
const PORT = process.env.STOCK_PORT || 4003;

app.use(express.json());

// Update product stock.
app.post('/update-stock', (req, res) => {
  const { productId, quantity } = req.body;

  // Validate product ID.
  if (!productId || !validator.isMongoId(productId)) {
    return res.status(400).json({ message: 'Invalid product ID.' });
  }

  // Validate quantity.
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ message: 'Quantity must be a positive integer.' });
  }

  res.json({ message: 'Stock updated successfully.', productId, quantity });
});

// Start stock management service.
app.listen(PORT, () => {
  console.log(`Stock management service listening on port ${PORT}`);
});
