const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    // Unique human-readable ID (e.g. 202314033, FAC-0000, ST-0000, ADM-0000)
    userId: {
        type: String,
        required: [true, 'User ID is required'],
        unique: true,
        trim: true,
        uppercase: false,
    },

    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },

    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [4, 'Password must be at least 4 characters'],
        select: false, // Never return password in queries by default
    },

    role: {
        type: String,
        enum: {
            values: ['student', 'faculty', 'staff', 'admin'],
            message: 'Role must be: student, faculty, staff, or admin'
        },
        default: 'student',
    },

    department: {
        type: String,
        trim: true,
        default: '',
    },

    phone: {
        type: String,
        trim: true,
        default: '',
    },

    avatar: {
        type: String, // URL path to uploaded avatar image
        default: '',
    },

    // Wallet balance in BDT Taka
    balance: {
        type: Number,
        default: 0,
        min: [0, 'Balance cannot be negative'],
    },

    // Account lifecycle status
    status: {
        type: String,
        enum: ['Active', 'Suspended', 'Pending'],
        default: 'Pending', // Admin must approve newly registered users
    },

    // Menu item favorites list
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
    }],

    // Password reset token
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },

    lastLogin: { type: Date },

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// ─── Indexes ──────────────────────────────────────────────────────
UserSchema.index({ role: 1, status: 1 });

// ─── Virtual: initials for avatar fallback ────────────────────────
UserSchema.virtual('initials').get(function () {
    return this.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
});

// ─── Pre-save: Hash password if modified ─────────────────────────
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ─── Instance method: Compare password ───────────────────────────
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// ─── Instance method: Generate JWT ───────────────────────────────
UserSchema.methods.generateToken = function () {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
        { id: this._id, userId: this.userId, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// ─── Static: Find by userId or email ─────────────────────────────
UserSchema.statics.findByCredentialId = function (identifier) {
    return this.findOne({
        $or: [
            { userId: { $regex: new RegExp(`^${identifier}$`, 'i') } },
            { email: identifier.toLowerCase() }
        ]
    }).select('+password');
};

module.exports = mongoose.model('User', UserSchema);
