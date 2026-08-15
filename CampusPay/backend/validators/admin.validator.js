const Joi = require('joi');

const editBalanceSchema = Joi.object({
    amount: Joi.number().required()
        .messages({ 'number.base': 'Amount must be a number' }),
    reason: Joi.string().trim().max(200).optional().allow(''),
});

const updateUserStatusSchema = Joi.object({
    status: Joi.string().valid('Active', 'Suspended', 'Pending').required(),
    reason: Joi.string().trim().max(200).optional().allow(''),
});

const verificationReviewSchema = Joi.object({
    adminNote: Joi.string().trim().max(300).optional().allow(''),
});

const createMenuItemSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    tagline: Joi.string().trim().max(200).optional().allow(''),
    description: Joi.string().trim().max(500).optional().allow(''),
    category: Joi.string().valid('Rice', 'Fast Food', 'Traditional', 'Drinks', 'Snacks', 'Dessert', 'Main Course', 'Breakfast').required(),
    price: Joi.number().min(0).required(),
    stock: Joi.number().integer().min(0).default(0),
    prepTime: Joi.string().trim().max(30).optional().allow(''),
    tags: Joi.array().items(Joi.string().trim()).optional(),
    image: Joi.string().trim().uri({ allowRelative: true }).optional().allow(''),
});

const updateMenuItemSchema = createMenuItemSchema.fork(
    ['name', 'category', 'price'],
    (schema) => schema.optional()
);

module.exports = {
    editBalanceSchema,
    updateUserStatusSchema,
    verificationReviewSchema,
    createMenuItemSchema,
    updateMenuItemSchema,
};
