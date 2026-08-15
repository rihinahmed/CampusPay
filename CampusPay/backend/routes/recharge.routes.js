const express = require('express');
const router = express.Router();
const {
    submitRecharge, getMyRecharges, getAllRecharges,
    approveRecharge, declineRecharge,
} = require('../controllers/recharge.controller');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const { submitRechargeSchema, reviewRechargeSchema } = require('../validators/recharge.validator');

router.use(protect);

// @route   POST /api/recharge
router.post('/', validate(submitRechargeSchema), submitRecharge);

// @route   GET /api/recharge
router.get('/', getMyRecharges);

// @route   GET /api/recharge/admin — Admin: all requests
router.get('/admin', requireRole('admin'), getAllRecharges);

// @route   PUT /api/recharge/admin/:id/approve
router.put('/admin/:id/approve', requireRole('admin'), validate(reviewRechargeSchema), approveRecharge);

// @route   PUT /api/recharge/admin/:id/decline
router.put('/admin/:id/decline', requireRole('admin'), validate(reviewRechargeSchema), declineRecharge);

module.exports = router;
