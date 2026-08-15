const User = require('../models/User');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const RechargeRequest = require('../models/RechargeRequest');
const Verification = require('../models/Verification');
const MenuItem = require('../models/MenuItem');
const Notification = require('../models/Notification');
const { sendSuccess, sendError, createPaginationMeta } = require('../utils/response');

// ─── GET /api/admin/dashboard ─────────────────────────────────────
const getDashboard = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalUsers,
            activeUsers,
            pendingVerifications,
            pendingRecharges,
            totalOrders,
            todayOrders,
            totalRevenue,
            todayRevenue,
            recentOrders,
            recentVerifications,
            recentRecharges,
        ] = await Promise.all([
            User.countDocuments({ role: { $ne: 'admin' } }),
            User.countDocuments({ status: 'Active' }),
            Verification.countDocuments({ status: 'Pending' }),
            RechargeRequest.countDocuments({ status: 'Pending' }),
            Order.countDocuments(),
            Order.countDocuments({ createdAt: { $gte: today } }),
            Transaction.aggregate([
                { $match: { type: 'Checkout' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Transaction.aggregate([
                { $match: { type: 'Checkout', createdAt: { $gte: today } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Order.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('student', 'name userId')
                .lean(),
            Verification.find({ status: 'Pending' })
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
            RechargeRequest.find({ status: 'Pending' })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('user', 'name userId')
                .lean(),
        ]);

        return sendSuccess(res, 200, 'Dashboard data retrieved.', {
            stats: {
                totalUsers,
                activeUsers,
                pendingVerifications,
                pendingRecharges,
                totalOrders,
                todayOrders,
                totalRevenue: totalRevenue[0]?.total || 0,
                todayRevenue: todayRevenue[0]?.total || 0,
            },
            recentOrders,
            recentVerifications,
            recentRecharges,
        });
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/admin/users ─────────────────────────────────────────
const getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, role, status, search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = {};
        if (role && role !== 'all') filter.role = role;
        if (status && status !== 'all') filter.status = status;
        if (search && search.trim()) {
            const q = search.trim();
            filter.$or = [
                { name: { $regex: new RegExp(q, 'i') } },
                { userId: { $regex: new RegExp(q, 'i') } },
                { email: { $regex: new RegExp(q, 'i') } },
            ];
        }

        const [users, total] = await Promise.all([
            User.find(filter)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            User.countDocuments(filter),
        ]);

        return sendSuccess(res, 200, 'Users retrieved.', users,
            createPaginationMeta(total, page, limit));
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/admin/users/:id ─────────────────────────────────────
const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return sendError(res, 404, 'User not found.');

        const [txCount, orderCount] = await Promise.all([
            Transaction.countDocuments({ user: user._id }),
            Order.countDocuments({ student: user._id }),
        ]);

        return sendSuccess(res, 200, 'User retrieved.', { ...user.toObject(), txCount, orderCount });
    } catch (err) {
        next(err);
    }
};

// ─── PUT /api/admin/users/:id/balance ─────────────────────────────
const editUserBalance = async (req, res, next) => {
    try {
        const { amount, reason } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return sendError(res, 404, 'User not found.');

        const adjustment = parseFloat(amount);
        const prevBalance = user.balance;
        user.balance = Math.max(0, user.balance + adjustment);
        await user.save({ validateBeforeSave: false });

        // Record transaction
        await Transaction.create({
            user: user._id,
            type: 'Adjustment',
            description: reason || `Balance adjusted by admin. Change: ${adjustment >= 0 ? '+' : ''}${adjustment.toFixed(2)}`,
            amount: adjustment,
            postBalance: user.balance,
            performedBy: req.user._id,
        });

        return sendSuccess(res, 200, `Balance updated for ${user.name}.`, {
            previousBalance: prevBalance,
            adjustment,
            newBalance: user.balance,
        });
    } catch (err) {
        next(err);
    }
};

// ─── PUT /api/admin/users/:id/status ──────────────────────────────
const updateUserStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).select('-password');

        if (!user) return sendError(res, 404, 'User not found.');
        return sendSuccess(res, 200, `User status updated to "${status}".`, { status: user.status });
    } catch (err) {
        next(err);
    }
};

// ─── DELETE /api/admin/users/:id ──────────────────────────────────
const deleteUser = async (req, res, next) => {
    try {
        // Prevent self-deletion
        if (req.params.id === req.user._id.toString()) {
            return sendError(res, 400, 'You cannot delete your own account.');
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return sendError(res, 404, 'User not found.');

        return sendSuccess(res, 200, `User "${user.name}" deleted successfully.`);
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/admin/verifications ─────────────────────────────────
const getVerifications = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = {};
        if (status && status !== 'all') filter.status = status;
        if (search) {
            const q = search.trim();
            filter.$or = [
                { name: { $regex: new RegExp(q, 'i') } },
                { userId: { $regex: new RegExp(q, 'i') } },
            ];
        }

        const [verifications, total] = await Promise.all([
            Verification.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('reviewedBy', 'name')
                .lean(),
            Verification.countDocuments(filter),
        ]);

        // Add time-ago string
        const enriched = verifications.map(v => ({
            ...v,
            submittedAgo: getTimeAgo(v.submittedAt || v.createdAt),
        }));

        return sendSuccess(res, 200, 'Verifications retrieved.', enriched,
            createPaginationMeta(total, page, limit));
    } catch (err) {
        next(err);
    }
};

// ─── PUT /api/admin/verifications/:id/approve ─────────────────────
const approveVerification = async (req, res, next) => {
    try {
        const verification = await Verification.findById(req.params.id).populate('user');
        if (!verification) return sendError(res, 404, 'Verification request not found.');

        if (verification.status !== 'Pending') {
            return sendError(res, 400, `Already "${verification.status}".`);
        }

        // Activate user account
        const user = await User.findById(verification.user._id);
        if (!user) return sendError(res, 404, 'Associated user not found.');
        user.status = 'Active';
        await user.save({ validateBeforeSave: false });

        verification.status = 'Approved';
        verification.reviewedBy = req.user._id;
        verification.reviewedAt = new Date();
        verification.adminNote = req.body.adminNote || '';
        await verification.save();

        // Notify user
        await Notification.create({
            user: user._id,
            title: 'Account Approved!',
            message: `Welcome to CampusPay, ${user.name}! Your account has been verified. You can now log in.`,
            type: 'system',
        });

        return sendSuccess(res, 200, `User "${user.name}" verified and activated.`);
    } catch (err) {
        next(err);
    }
};

// ─── PUT /api/admin/verifications/:id/reject ──────────────────────
const rejectVerification = async (req, res, next) => {
    try {
        const verification = await Verification.findById(req.params.id).populate('user');
        if (!verification) return sendError(res, 404, 'Verification request not found.');
        if (verification.status !== 'Pending') {
            return sendError(res, 400, `Already "${verification.status}".`);
        }

        verification.status = 'Rejected';
        verification.reviewedBy = req.user._id;
        verification.reviewedAt = new Date();
        verification.adminNote = req.body.adminNote || 'Verification rejected.';
        await verification.save();

        return sendSuccess(res, 200, 'Verification rejected.');
    } catch (err) {
        next(err);
    }
};

// ─── Helpers ──────────────────────────────────────────────────────
function getTimeAgo(date) {
    const diffMs = Date.now() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
}

module.exports = {
    getDashboard,
    getAllUsers,
    getUserById,
    editUserBalance,
    updateUserStatus,
    deleteUser,
    getVerifications,
    approveVerification,
    rejectVerification,
};
