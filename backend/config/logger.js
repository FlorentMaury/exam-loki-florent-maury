// Logger configuration.
const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory.
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Configure logger.
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'exam-backend' },
  transports: [
    // Error logs.
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
    }),
    // All logs.
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
    }),
  ],
});

// Console logs in development.
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp }) => {
          return `${timestamp} [${level}]: ${message}`;
        })
      ),
    })
  );
}

module.exports = logger;
