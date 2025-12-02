// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/db');
const logger = require('./config/logger');

const app = express();
connectDB();

// Créer le répertoire des logs s'il n'existe pas.
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Logging: Morgan pour les requêtes HTTP.
const accessLogStream = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev')); // Affichage en console.

// Sécurité: Headers HTTP avec Helmet.
app.use(helmet());

// Sécurité: CORS flexible pour production et développement.
const corsOptions = {
  origin: function (origin, callback) {
    // Liste des origines autorisées.
    const allowedOrigins = [
      'http://localhost:3000',
      'http://frontend:3000',
      'https://exam-loki-florent-maury.vercel.app',
      'https://exam-loki-florent-maury-eiuv5qnn7-florentmaurys-projects.vercel.app',
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    // En développement, accepter les requêtes sans origine.
    if (!origin || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // En production, vérifier l'origine.
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS non autorisé pour cette origine.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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