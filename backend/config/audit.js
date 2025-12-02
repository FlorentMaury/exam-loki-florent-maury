// backend/config/audit.js
const logger = require('./logger');

// Logger les actions audit importantes.
const auditLog = (action, userId, details, status = 'success') => {
  logger.info(`[AUDIT] Action: ${action} | User: ${userId} | Status: ${status}`, {
    action,
    userId,
    details,
    status,
    timestamp: new Date().toISOString(),
  });
};

// Logger les erreurs de sécurité.
const securityLog = (event, userId, message) => {
  logger.warn(`[SECURITY] Event: ${event} | User: ${userId}`, {
    event,
    userId,
    message,
    timestamp: new Date().toISOString(),
  });
};

// Logger les accès non autorisés.
const unauthorizedLog = (userId, resource, reason) => {
  logger.warn(`[UNAUTHORIZED] User: ${userId} | Resource: ${resource} | Reason: ${reason}`, {
    userId,
    resource,
    reason,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  auditLog,
  securityLog,
  unauthorizedLog,
};
