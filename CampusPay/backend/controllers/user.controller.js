const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const MenuItem = require('../models/MenuItem');
const { sendSuccess, sendError, createPaginationMeta } = require('../utils/response');

// ─── GET /api/users/me ────────────────────────────────────────────
const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('favorites', 'name price image category rating');
        if (!user) return sendError(res, 404, 'User not found.');

        return sendSuccess(res, 200, 'Profile retrieved.', {
            id: user._id,
            userId: user.userId,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            phone: user.phone,
            avatar: user.avatar,
            balance: user.balance,
            status: user.status,
            favorites: user.favorites,
            initials: user.initials,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
        });
    } catch (err) {
        next(err);
    }
};

// ─── PUT /api/users/me ────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
    try {
        const { name, department, phone } = req.body;

        const updates = {};
        if (name) updates.name = name.trim();
        if (department !== undefined) updates.department = department.trim();
        if (phone !== undefined) updates.phone = phone.trim();

        // Handle avatar upload
        if (req.file) {
            updates.avatar = `/uploads/avatars/${req.file.filename}`;
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        return sendSuccess(res, 200, 'Profile updated successfully.', {
            name: user.name,
            department: user.department,
            phone: user.phone,
            avatar: user.avatar,
        });
    } catch (err) {
        next(err);
    }
};

// ─── PUT /api/users/me/password ───────────────────────────────────
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return sendError(res, 400, 'Both current and new password are required.');
        }
        if (newPassword.length < 4) {
            return sendError(res, 400, 'New password must be at least 4 characters.');
        }

        const user = await User.findById(req.user._id).select('+password');
        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return sendError(res, 401, 'Current password is incorrect.');
        }

        user.password = newPassword;
        await user.save();

        return sendSuccess(res, 200, 'Password changed successfully. Please log in again.');
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/users/me/balance ────────────────────────────────────
const getBalance = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('balance');
        return sendSuccess(res, 200, 'Balance retrieved.', { balance: user.balance });
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/users/me/transactions ──────────────────────────────
const getTransactions = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, type } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = { user: req.user._id };
        if (type && type !== 'All') filter.type = type;

        const [transactions, total] = await Promise.all([
            Transaction.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('order', 'orderId')
                .lean(),
            Transaction.countDocuments(filter),
        ]);

        return sendSuccess(res, 200, 'Transactions retrieved.', transactions,
            createPaginationMeta(total, page, limit));
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/users/me/notifications ─────────────────────────────
const getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        const unreadCount = notifications.filter(n => !n.isRead).length;

        return sendSuccess(res, 200, 'Notifications retrieved.', {
            notifications,
            unreadCount,
        });
    } catch (err) {
        next(err);
    }
};

// ─── PUT /api/users/me/notifications/read ────────────────────────
const markNotificationsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );
        return sendSuccess(res, 200, 'All notifications marked as read.');
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/users/me/favorites ─────────────────────────────────
const getFavorites = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('favorites', 'name price image category rating stock status tagline');
        return sendSuccess(res, 200, 'Favorites retrieved.', user.favorites);
    } catch (err) {
        next(err);
    }
};

// ─── POST /api/users/me/favorites/:menuId ────────────────────────
const toggleFavorite = async (req, res, next) => {
    try {
        const { menuId } = req.params;

        const menuItem = await MenuItem.findById(menuId);
        if (!menuItem) return sendError(res, 404, 'Menu item not found.');

        const user = await User.findById(req.user._id);
        const idx = user.favorites.findIndex(f => f.toString() === menuId);

        let message;
        if (idx === -1) {
            user.favorites.push(menuId);
            message = `${menuItem.name} added to favorites.`;
        } else {
            user.favorites.splice(idx, 1);
            message = `${menuItem.name} removed from favorites.`;
        }

        await user.save({ validateBeforeSave: false });

        return sendSuccess(res, 200, message, { favorites: user.favorites });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword,
    getBalance,
    getTransactions,
    getNotifications,
    markNotificationsRead,
    getFavorites,
    toggleFavorite,
};
