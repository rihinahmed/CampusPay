const { sendError } = require('../utils/response');

/**
 * Joi schema validation middleware factory.
 * Usage: validate(schema, 'body' | 'query' | 'params')
 */
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const data = req[source];
        const { error, value } = schema.validate(data, {
            abortEarly: false,
            stripUnknown: true,
            convert: true,
        });

        if (error) {
            const messages = error.details.map(d => d.message.replace(/['"]/g, ''));
            return sendError(res, 400, 'Validation failed.', messages);
        }

        // Replace request data with validated/sanitized value
        req[source] = value;
        next();
    };
};

module.exports = { validate };
