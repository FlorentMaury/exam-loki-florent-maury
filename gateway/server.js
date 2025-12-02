// API Gateway service.
const express = require('express');
const dotenv = require('dotenv');
const notifiProxy = require('./routes/notifi');
const stockProxy = require('./routes/stock');

dotenv.config();

const app = express();

// Parse JSON requests.
app.use(express.json());

// Proxy routes to microservices.
app.use('/notify', notifiProxy);
app.use('/update-stock', stockProxy);

// Start gateway.
const PORT = process.env.GATEWAY_PORT || 8000;
app.listen(PORT, () => {
  console.log(`Gateway listening on port ${PORT}`);
});