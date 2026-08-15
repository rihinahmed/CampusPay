const express = require('express');
const router = express.Router();
const { login, signup, logout, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { loginSchema, signupSchema } = require('../validators/auth.validator');

// @route   POST /api/auth/login
// @desc    Authenticate user and return JWT
// @access  Public
router.post('/login', validate(loginSchema), login);

// @route   POST /api/auth/signup
// @desc    Register a new user (pending admin approval)
// @access  Public
router.post('/signup', validate(signupSchema), signup);

// @route   POST /api/auth/logout
// @desc    Logout (client-side token discard, server-side audit)
// @access  Protected
router.post('/logout', protect, logout);

// @route   GET /api/auth/me
// @desc    Get current authenticated user profile
// @access  Protected
router.get('/me', protect, getMe);

module.exports = router;
