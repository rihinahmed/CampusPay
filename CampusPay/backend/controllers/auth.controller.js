const User = require('../models/User');
const Verification = require('../models/Verification');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/response');
const { notifyNewVerificationRequest } = require('../utils/socket');

// ─── POST /api/auth/login ─────────────────────────────────────────
const login = async (req, res, next) => {
    try {
        let { userId, password } = req.body;

        if (!userId || !password) {
            return sendError(res, 400, 'User ID and Password are required.');
        }

        // Friendly alias mapping (e.g. "student" -> "202314033")
        const aliases = {
            'student': '202314033',
            'faculty': 'FAC-0000',
            'staff': 'ST-0000',
            'kitchen': 'ST-0000',
            'kitchen stuff': 'ST-0000',
            'admin': 'ADM-0000',
        };

        const cleanId = userId.toString().trim();
        const searchId = aliases[cleanId.toLowerCase()] || cleanId;

        // Find user by userId or email (case-insensitive)
        const user = await User.findByCredentialId(searchId);

        if (!user) {
            return sendError(res, 401, 'Access Denied: Invalid ID or password.');
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return sendError(res, 401, 'Access Denied: Invalid ID or password.');
        }

        // Reject suspended accounts
        if (user.status === 'Suspended') {
            return sendError(res, 403, 'Your account has been suspended. Contact administration.');
        }

        // Reject pending accounts (must be approved by admin)
        if (user.status === 'Pending') {
            return sendError(res, 403, 'Your account is pending admin approval. Please wait for verification.');
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        // Generate JWT
        const token = user.generateToken();

        // Return user profile (no password)
        const userData = {
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
            initials: user.initials,
        };

        return sendSuccess(res, 200, `Welcome back, ${user.name}!`, { token, user: userData });

    } catch (err) {
        next(err);
    }
};

// ─── POST /api/auth/signup ────────────────────────────────────────
const signup = async (req, res, next) => {
    try {
        const { name, userId, email, password, role, department, phone } = req.body;

        // Check uniqueness
        const existingUser = await User.findOne({
            $or: [
                { userId: { $regex: new RegExp(`^${userId}$`, 'i') } },
                { email: email.toLowerCase() }
            ]
        });

        if (existingUser) {
            if (existingUser.userId.toLowerCase() === userId.toLowerCase()) {
                return sendError(res, 409, 'A user with this ID already exists.');
            }
            return sendError(res, 409, 'An account with this email already exists.');
        }

        // Create user (status: Pending — awaiting admin approval)
        const user = await User.create({
            userId,
            name,
            email: email.toLowerCase(),
            password,
            role: role || 'student',
            department: department || '',
            phone: phone || '',
            status: 'Pending',
            balance: 0,
        });

        // Create verification request for admin
        const verification = await Verification.create({
            user: user._id,
            name: user.name,
            userId: user.userId,
            role: user.role,
            email: user.email,
            department: user.department,
            status: 'Pending',
        });

        // Notify admins via Socket.IO
        notifyNewVerificationRequest(verification);

        return sendSuccess(res, 201,
            'Registration successful! Your account is pending admin approval. You will be notified upon activation.',
            { userId: user.userId, email: user.email, status: user.status }
        );

    } catch (err) {
        next(err);
    }
};

// ─── POST /api/auth/logout ────────────────────────────────────────
// JWT is stateless — client simply discards the token.
// This endpoint exists for logging/audit purposes.
const logout = async (req, res, next) => {
    try {
        return sendSuccess(res, 200, 'Logged out successfully. Please clear your local session.');
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/auth/me ─────────────────────────────────────────────
// Verify token and return current user
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('favorites', 'name price image category');

        if (!user) {
            return sendError(res, 404, 'User not found.');
        }

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

module.exports = { login, signup, logout, getMe };
