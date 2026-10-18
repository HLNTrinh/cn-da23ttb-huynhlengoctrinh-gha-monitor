import logger from '../utils/logger.js';

export function notFoundMiddleware(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` });
}

export function errorMiddleware(error, req, res, next) {
  if (res.headersSent) return next(error);
  logger.error(error);
  const status = error.status ?? (error.name === 'CastError' ? 400 : 500);
  res.status(status).json({
    success: false,
    message: status === 500 ? 'Internal server error' : error.message
  });
}
