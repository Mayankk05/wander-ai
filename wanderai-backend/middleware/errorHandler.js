import appLogger from '../lib/logger.js';

const errorHandler = (err, req, res, next) => {
  const logger = req.log || appLogger;

  if (process.env.NODE_ENV !== 'production') {
    logger.error({ err }, "Unhandled error");
  }

  if (err.code && err.code.startsWith('P')) {
    return res.status(500).json({ error: "Database error" });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: "Invalid token" });
  }

  if (err.name === 'ZodError') {
    const message = err.errors?.map(e => e.message).join('. ') || "Validation failed";
    return res.status(400).json({ error: message, details: err.errors });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  if (res.headersSent) {
    const isSSE = res.getHeader('Content-Type') === 'text/event-stream';
    if (isSSE) {
      res.write("data: " + JSON.stringify({ type: "error", error: message }) + "\n\n");
      return res.end();
    }
    if (logger) logger.error(`[ErrorHandler] Headers already sent. Cannot send JSON error for: ${message}`);
    return;
  }

  res.status(statusCode).json({ error: message, details: err.details });
};

export default errorHandler;
