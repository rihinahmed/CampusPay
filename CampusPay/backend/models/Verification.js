const mongoose = require('mongoose');

const VerificationSchema = new mongoose.Schema({
    // The user account awaiting approval
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    // Snapshot fields (for displaying in admin panel without joining)
    name: { type: String },
    userId: { type: String },  // Human-readable ID (e.g. 202314033)
    role: { type: String },
    email: { type: String },
    department: { type: String },

    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    },

    submittedAt: {
        type: Date,
        default: Date.now,
    },

    reviewedAt: {
        type: Date,
        default: null,
    },

    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },

    adminNote: {
        type: String,
        trim: true,
        default: '',
    },

}, {
    timestamps: true,
});

// Virtual: time since submission (human-readable)
VerificationSchema.virtual('submittedAgo').get(function () {
    const diffMs = Date.now() - this.submittedAt.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
});

// ─── Indexes ──────────────────────────────────────────────────────
VerificationSchema.index({ status: 1 });
VerificationSchema.index({ user: 1 });

module.exports = mongoose.model('Verification', VerificationSchema);
