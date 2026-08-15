const { sendError } = require('../utils/response');

/**
 * Global error handler — must be last middleware in Express chain.
 */
const errorHandler = (err, req, res, next) => {
    console.error(`❌ [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return sendError(res, 400, 'Validation failed.', errors);
    }

    // Mongoose cast error (e.g. invalid ObjectId)
    if (err.name === 'CastError') {
        return sendError(res, 400, `Invalid value for field: ${err.path}`);
    }

    // MongoDB duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return sendError(res, 409, `Duplicate value: ${field} already exists.`);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return sendError(res, 401, 'Invalid token.');
    }
    if (err.name === 'TokenExpiredError') {
        return sendError(res, 401, 'Token expired. Please log in again.');
    }

    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return sendError(res, 400, 'File too large. Maximum size is 5MB.');
    }

    // Generic application error
    const statusCode = err.statusCode || err.status || 500;
    const message = statusCode < 500 ? err.message : 'Internal server error. Please try again later.';

    return sendError(res, statusCode, message);
};

/**
 * 404 Not Found handler — use before errorHandler.
 */
const notFound = (req, res, next) => {
    const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
    err.statusCode = 404;
    next(err);
};

module.exports = { errorHandler, notFound };
