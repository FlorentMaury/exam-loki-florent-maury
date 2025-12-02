// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const promClient = require('prom-client');
require('dotenv').config();
const connectDB = require('./config/db');
const logger = require('./config/logger');

const app = express();
connectDB();

// Create logs directory if it does not exist.
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Initialize Prometheus default collectors.
promClient.collectDefaultMetrics({ timeout: 5000 });

// Create custom Prometheus metrics for HTTP requests.
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds.',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests.',
  labelNames: ['method', 'route', 'status_code'],
});

// Middleware to record HTTP request metrics.
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
    httpRequestTotal
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .inc();
  });
  
  next();
});

// Endpoint to export Prometheus metrics.
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

// Logging configuration with Morgan.
const accessLogStream = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev'));

// Security headers with Helmet.
app.use(helmet());

// CORS configuration.
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://frontend:3000',
      'https://exam-loki-florent-maury.vercel.app',
      'https://exam-loki-florent-maury-eiuv5qnn7-florentmaurys-projects.vercel.app',
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    if (!origin || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed for this origin.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Parse JSON requests with size limit.
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// Rate limiting for API routes.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
});
app.use('/api/', limiter);

// Strict rate limiting for login endpoint.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.',
});
app.use('/api/auth/login', loginLimiter);

// Health check endpoint.
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running', status: 'OK' });
});

// API routes.
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

// Start server.
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));