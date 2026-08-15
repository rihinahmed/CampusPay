const Joi = require('joi');

const submitRechargeSchema = Joi.object({
    method: Joi.string().valid('bKash', 'Nagad', 'Rocket').required()
        .messages({ 'any.only': 'Payment method must be bKash, Nagad, or Rocket' }),
    amount: Joi.number().integer().min(50).max(10000).required()
        .messages({
            'number.min': 'Minimum recharge amount is ৳50',
            'number.max': 'Maximum recharge per request is ৳10,000',
        }),
    txid: Joi.string().trim().uppercase().min(6).max(20).required()
        .messages({
            'string.empty': 'Transaction ID is required',
            'string.min': 'Transaction ID must be at least 6 characters',
        }),
});

const reviewRechargeSchema = Joi.object({
    adminNote: Joi.string().trim().max(300).optional().allow(''),
});

module.exports = { submitRechargeSchema, reviewRechargeSchema };
