const { sendError } = require('../utils/response');

/**
 * Role-based access control middleware.
 * Usage: requireRole('admin') or requireRole('admin', 'staff')
 */
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return sendError(res, 401, 'Not authenticated.');
        }

        const flatRoles = roles.flat();
        if (!flatRoles.includes(req.user.role)) {
            return sendError(
                res,
                403,
                `Access denied. Required role: [${flatRoles.join(' | ')}]. Your role: ${req.user.role}`
            );
        }

        next();
    };
};

module.exports = { requireRole };
