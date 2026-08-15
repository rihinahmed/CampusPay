const express = require('express');
const router = express.Router();
const {
    getProfile, updateProfile, changePassword, getBalance,
    getTransactions, getNotifications, markNotificationsRead,
    getFavorites, toggleFavorite,
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All user routes require authentication
router.use(protect);

// @route   GET  /api/users/me
router.get('/me', getProfile);

// @route   PUT  /api/users/me
router.put('/me', upload.single('avatar'), updateProfile);

// @route   PUT  /api/users/me/password
router.put('/me/password', changePassword);

// @route   GET  /api/users/me/balance
router.get('/me/balance', getBalance);

// @route   GET  /api/users/me/transactions
router.get('/me/transactions', getTransactions);

// @route   GET  /api/users/me/notifications
router.get('/me/notifications', getNotifications);

// @route   PUT  /api/users/me/notifications/read
router.put('/me/notifications/read', markNotificationsRead);

// @route   GET  /api/users/me/favorites
router.get('/me/favorites', getFavorites);

// @route   POST /api/users/me/favorites/:menuId
router.post('/me/favorites/:menuId', toggleFavorite);

module.exports = router;
