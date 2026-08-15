const express = require('express');
const router = express.Router();
const {
    getDashboard, getAllUsers, getUserById, editUserBalance,
    updateUserStatus, deleteUser, getVerifications,
    approveVerification, rejectVerification,
} = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const { editBalanceSchema, updateUserStatusSchema, verificationReviewSchema } = require('../validators/admin.validator');

// All admin routes require authentication + admin role
router.use(protect);
router.use(requireRole('admin'));

// @route   GET /api/admin/dashboard
router.get('/dashboard', getDashboard);

// @route   GET /api/admin/users
router.get('/users', getAllUsers);

// @route   GET /api/admin/users/:id
router.get('/users/:id', getUserById);

// @route   PUT /api/admin/users/:id/balance
router.put('/users/:id/balance', validate(editBalanceSchema), editUserBalance);

// @route   PUT /api/admin/users/:id/status
router.put('/users/:id/status', validate(updateUserStatusSchema), updateUserStatus);

// @route   DELETE /api/admin/users/:id
router.delete('/users/:id', deleteUser);

// @route   GET /api/admin/verifications
router.get('/verifications', getVerifications);

// @route   PUT /api/admin/verifications/:id/approve
router.put('/verifications/:id/approve', validate(verificationReviewSchema), approveVerification);

// @route   PUT /api/admin/verifications/:id/reject
router.put('/verifications/:id/reject', validate(verificationReviewSchema), rejectVerification);

module.exports = router;
