// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();
connectDB();

// Sécurité: Headers HTTP avec Helmet.
app.use(helmet());

// Sécurité: CORS restrictif.
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Sécurité: Limitation de la taille des requêtes.
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// Sécurité: Rate limiting global.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Trop de requêtes, veuillez réessayer plus tard.',
});
app.use('/api/', limiter);

// Sécurité: Rate limiting strict pour la connexion.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Trop de tentatives de connexion, réessayez plus tard.',
});
app.use('/api/auth/login', loginLimiter);

// Route de santé (health check).
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running', status: 'OK' });
});

app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur en écoute sur le port ${PORT}`));