const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/response');

/**
 * Protect routes — verifies JWT Bearer token.
 * Attaches req.user to the request if valid.
 */
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return sendError(res, 401, 'Access denied. No authentication token provided.');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return sendError(res, 401, 'Token is valid but user no longer exists.');
        }

        if (user.status === 'Suspended') {
            return sendError(res, 403, 'Your account has been suspended. Contact administration.');
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return sendError(res, 401, 'Session expired. Please log in again.');
        }
        return sendError(res, 401, 'Invalid authentication token.');
    }
};

module.exports = { protect };
