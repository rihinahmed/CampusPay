const mongoose = require('mongoose');

const RechargeRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Recharge request must have a user'],
    },

    method: {
        type: String,
        enum: {
            values: ['bKash', 'Nagad', 'Rocket'],
            message: 'Payment method must be bKash, Nagad, or Rocket'
        },
        required: [true, 'Payment method is required'],
    },

    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [50, 'Minimum recharge amount is ৳50'],
        max: [10000, 'Maximum recharge amount is ৳10,000 per request'],
    },

    // Transaction ID from bKash/Nagad/Rocket
    txid: {
        type: String,
        required: [true, 'Transaction ID is required'],
        trim: true,
        uppercase: true,
        minlength: [6, 'Transaction ID must be at least 6 characters'],
        maxlength: [20, 'Transaction ID cannot exceed 20 characters'],
    },

    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Declined'],
        default: 'Pending',
    },

    adminNote: {
        type: String,
        trim: true,
        default: '',
    },

    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },

    reviewedAt: {
        type: Date,
        default: null,
    },

    // The transaction record created upon approval
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        default: null,
    },

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Virtual: formatted date
RechargeRequestSchema.virtual('formattedDate').get(function () {
    return this.createdAt.toLocaleString('en-US', {
        month: 'short', day: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
});

// ─── Indexes ──────────────────────────────────────────────────────
RechargeRequestSchema.index({ user: 1, createdAt: -1 });
RechargeRequestSchema.index({ status: 1 });
RechargeRequestSchema.index({ txid: 1 }); // Txid uniqueness enforced at API level

module.exports = mongoose.model('RechargeRequest', RechargeRequestSchema);
