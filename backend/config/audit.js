// Audit logging configuration.
const logger = require('./logger');

// Log important audit actions.
const auditLog = (action, userId, details, status = 'success') => {
  logger.info(`[AUDIT] Action: ${action} | User: ${userId} | Status: ${status}`, {
    action,
    userId,
    details,
    status,
    timestamp: new Date().toISOString(),
  });
};

// Log security events.
const securityLog = (event, userId, message) => {
  logger.warn(`[SECURITY] Event: ${event} | User: ${userId}`, {
    event,
    userId,
    message,
    timestamp: new Date().toISOString(),
  });
};

// Log unauthorized access attempts.
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
