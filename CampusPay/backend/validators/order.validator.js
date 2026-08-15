const Joi = require('joi');

// Status values matching the Order model lifecycle exactly
const ORDER_STATUSES = ['Pending', 'Accepted', 'Preparing', 'Ready for Pickup', 'Delivered', 'Cancelled'];

const placeOrderSchema = Joi.object({
    items: Joi.array().items(
        Joi.object({
            menuItemId: Joi.string().hex().length(24).required()
                .messages({ 'string.length': 'Invalid menu item ID' }),
            quantity: Joi.number().integer().min(1).max(20).required()
                .messages({ 'number.min': 'Quantity must be at least 1' }),
        })
    ).min(1).required()
        .messages({ 'array.min': 'Order must have at least one item' }),

    dineOption: Joi.string().valid('Dine In', 'Parcel').default('Dine In'),
    pickupType: Joi.string().valid('Counter Pickup', 'Table Service').default('Counter Pickup'),
    specialNote: Joi.string().trim().max(300).optional().allow(''),

    // Optional idempotency key to prevent duplicate orders on double-click
    idempotencyKey: Joi.string().uuid().optional(),
});

const updateOrderStatusSchema = Joi.object({
    // Staff can set any status except Pending (orders start as Pending from backend)
    // Transition validity is enforced in the controller
    status: Joi.string()
        .valid(...ORDER_STATUSES)
        .required()
        .messages({ 'any.only': `Invalid order status. Must be one of: ${ORDER_STATUSES.join(', ')}` }),
    note: Joi.string().trim().max(200).optional().allow(''),
});

const addStaffNoteSchema = Joi.object({
    note: Joi.string().trim().min(1).max(300).required()
        .messages({ 'string.empty': 'Staff note cannot be empty' }),
});

module.exports = { placeOrderSchema, updateOrderStatusSchema, addStaffNoteSchema };
