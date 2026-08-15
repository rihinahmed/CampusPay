const express = require('express');
const router = express.Router();
const {
    placeOrder, getMyOrders, getActiveOrder,
    getOrderById, cancelOrder, getOrderQR,
} = require('../controllers/order.controller');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const { placeOrderSchema } = require('../validators/order.validator');

// All order routes require authentication
router.use(protect);

// @route   POST /api/orders
router.post('/', requireRole('student', 'faculty'), validate(placeOrderSchema), placeOrder);

// @route   GET /api/orders/active
router.get('/active', getActiveOrder);

// @route   GET /api/orders
router.get('/', getMyOrders);

// @route   GET /api/orders/:orderId
router.get('/:orderId', getOrderById);

// @route   POST /api/orders/:orderId/cancel
router.post('/:orderId/cancel', requireRole('student', 'faculty'), cancelOrder);

// @route   GET /api/orders/:orderId/qr
router.get('/:orderId/qr', getOrderQR);

module.exports = router;
