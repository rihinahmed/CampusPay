const Joi = require('joi');

const loginSchema = Joi.object({
    userId: Joi.string().trim().min(3).max(50).required()
        .messages({
            'string.empty': 'User ID is required',
            'string.min': 'User ID must be at least 3 characters',
        }),
    password: Joi.string().min(4).max(128).required()
        .messages({
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 4 characters',
        }),
    role: Joi.string().valid('student', 'faculty', 'staff', 'admin').optional(),
    rememberMe: Joi.boolean().optional(),
});

const signupSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required()
        .messages({ 'string.empty': 'Full name is required' }),
    userId: Joi.string().trim().min(3).max(30).required()
        .messages({ 'string.empty': 'Student/Faculty ID is required' }),
    email: Joi.string().email({ tlds: { allow: false } }).lowercase().required()
        .messages({
            'string.empty': 'Email is required',
            'string.email': 'Please provide a valid email address',
        }),
    password: Joi.string().min(4).max(128).required()
        .messages({
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 4 characters',
        }),
    role: Joi.string().valid('student', 'faculty').default('student'),
    department: Joi.string().trim().max(100).optional().allow(''),
    phone: Joi.string().trim().max(20).optional().allow(''),
});

const forgotPasswordSchema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).lowercase().required()
        .messages({ 'string.empty': 'Email is required' }),
});

const resetPasswordSchema = Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(4).max(128).required()
        .messages({ 'string.min': 'New password must be at least 4 characters' }),
});

module.exports = { loginSchema, signupSchema, forgotPasswordSchema, resetPasswordSchema };
