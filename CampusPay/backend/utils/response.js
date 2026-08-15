/**
 * Standardized JSON response helpers for consistent API responses.
 */

/**
 * Send a success response.
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (default 200)
 * @param {string} message - Human-readable success message
 * @param {*} data - Payload data (optional)
 * @param {object} meta - Pagination or extra metadata (optional)
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
    const response = {
        success: true,
        message,
    };

    if (data !== null && data !== undefined) {
        response.data = data;
    }

    if (meta !== null && meta !== undefined) {
        response.meta = meta;
    }

    return res.status(statusCode).json(response);
};

/**
 * Send an error response.
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (default 500)
 * @param {string} message - Human-readable error message
 * @param {Array} errors - Detailed validation errors (optional)
 */
const sendError = (res, statusCode = 500, message = 'An error occurred.', errors = null) => {
    const response = {
        success: false,
        message,
    };

    if (errors && Array.isArray(errors) && errors.length > 0) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response);
};

/**
 * Create a paginated meta object.
 */
const createPaginationMeta = (total, page, limit) => ({
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    pages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
});

module.exports = { sendSuccess, sendError, createPaginationMeta };
