const RechargeRequest = require('../models/RechargeRequest');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { sendSuccess, sendError, createPaginationMeta } = require('../utils/response');
const { notifyNewRechargeRequest, notifyRechargeApproved, notifyRechargeDeclined } = require('../utils/socket');

// ─── POST /api/recharge ───────────────────────────────────────────
const submitRecharge = async (req, res, next) => {
    try {
        const { method, amount, txid } = req.body;

        // Check for duplicate transaction ID
        const existing = await RechargeRequest.findOne({ txid: txid.toUpperCase() });
        if (existing) {
            return sendError(res, 409, `Transaction ID "${txid}" has already been submitted. Duplicate requests are not allowed.`);
        }

        // Check for pending requests (prevent spam)
        const pendingCount = await RechargeRequest.countDocuments({
            user: req.user._id,
            status: 'Pending',
        });
        if (pendingCount >= 3) {
            return sendError(res, 429, 'You have 3 pending recharge requests. Please wait for them to be reviewed.');
        }

        const request = await RechargeRequest.create({
            user: req.user._id,
            method,
            amount: parseInt(amount),
            txid: txid.toUpperCase(),
            status: 'Pending',
        });

        // Notify admin via Socket.IO
        const populated = await request.populate('user', 'name userId');
        notifyNewRechargeRequest(populated);

        return sendSuccess(res, 201, `Recharge request of ৳${amount} submitted for verification!`, {
            id: request._id,
            method: request.method,
            amount: request.amount,
            txid: request.txid,
            status: request.status,
            createdAt: request.createdAt,
        });
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/recharge ────────────────────────────────────────────
const getMyRecharges = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [requests, total] = await Promise.all([
            RechargeRequest.find({ user: req.user._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            RechargeRequest.countDocuments({ user: req.user._id }),
        ]);

        return sendSuccess(res, 200, 'Recharge history retrieved.', requests,
            createPaginationMeta(total, page, limit));
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/recharge/admin ──────────────────────────────────────
const getAllRecharges = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = {};
        if (status && status !== 'all') filter.status = status;

        const [requests, total] = await Promise.all([
            RechargeRequest.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('user', 'name userId role')
                .lean(),
            RechargeRequest.countDocuments(filter),
        ]);

        // Client-side search filter
        let filtered = requests;
        if (search && search.trim()) {
            const q = search.toLowerCase();
            filtered = requests.filter(r =>
                r.txid?.toLowerCase().includes(q) ||
                r.user?.name?.toLowerCase().includes(q) ||
                r.user?.userId?.toLowerCase().includes(q)
            );
        }

        return sendSuccess(res, 200, 'All recharge requests retrieved.', filtered,
            createPaginationMeta(total, page, limit));
    } catch (err) {
        next(err);
    }
};

// ─── PUT /api/recharge/admin/:id/approve ─────────────────────────
const approveRecharge = async (req, res, next) => {
    try {
        const request = await RechargeRequest.findById(req.params.id).populate('user');
        if (!request) return sendError(res, 404, 'Recharge request not found.');
        if (request.status !== 'Pending') {
            return sendError(res, 400, `This request is already "${request.status}".`);
        }

        // Credit user wallet
        const user = await User.findById(request.user._id);
        user.balance += request.amount;
        await user.save({ validateBeforeSave: false });

        // Create transaction
        const tx = await Transaction.create({
            user: user._id,
            type: 'Recharge',
            description: `${request.method} recharge approved. TxID: ${request.txid}`,
            amount: request.amount,
            postBalance: user.balance,
            rechargeRequest: request._id,
            performedBy: req.user._id,
        });

        // Update request
        request.status = 'Approved';
        request.reviewedBy = req.user._id;
        request.reviewedAt = new Date();
        request.adminNote = req.body.adminNote || '';
        request.transaction = tx._id;
        await request.save();

        // Notify user
        await Notification.create({
            user: user._id,
            title: 'Recharge Approved!',
            message: `৳${request.amount} has been credited to your wallet via ${request.method}. New balance: ৳${user.balance.toFixed(2)}`,
            type: 'recharge',
        });

        notifyRechargeApproved(user._id, request.amount, user.balance);

        return sendSuccess(res, 200, `Recharge of ৳${request.amount} approved for ${user.name}.`, {
            newBalance: user.balance,
        });
    } catch (err) {
        next(err);
    }
};

// ─── PUT /api/recharge/admin/:id/decline ─────────────────────────
const declineRecharge = async (req, res, next) => {
    try {
        const request = await RechargeRequest.findById(req.params.id).populate('user');
        if (!request) return sendError(res, 404, 'Recharge request not found.');
        if (request.status !== 'Pending') {
            return sendError(res, 400, `This request is already "${request.status}".`);
        }

        request.status = 'Declined';
        request.reviewedBy = req.user._id;
        request.reviewedAt = new Date();
        request.adminNote = req.body.adminNote || 'Request declined by administrator.';
        await request.save();

        // Notify user
        await Notification.create({
            user: request.user._id,
            title: 'Recharge Declined',
            message: `Your ${request.method} recharge request of ৳${request.amount} (TxID: ${request.txid}) was declined. ${request.adminNote}`,
            type: 'recharge',
        });

        notifyRechargeDeclined(request.user._id, request.amount);

        return sendSuccess(res, 200, `Recharge request declined.`);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    submitRecharge,
    getMyRecharges,
    getAllRecharges,
    approveRecharge,
    declineRecharge,
};
