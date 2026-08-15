const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Transaction must have a user'],
    },

    type: {
        type: String,
        enum: ['Checkout', 'Recharge', 'Refund', 'Adjustment', 'Initial'],
        required: [true, 'Transaction type is required'],
    },

    description: {
        type: String,
        trim: true,
        default: '',
    },

    amount: {
        type: Number,
        required: [true, 'Transaction amount is required'],
    },

    // Balance after this transaction
    postBalance: {
        type: Number,
        required: [true, 'Post-transaction balance is required'],
    },

    // Related order (if checkout)
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        default: null,
    },

    // Related recharge request (if recharge)
    rechargeRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RechargeRequest',
        default: null,
    },

    // Admin who performed adjustment (if type is Adjustment)
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },

}, {
    timestamps: true,
});

// ─── Indexes ──────────────────────────────────────────────────────
TransactionSchema.index({ user: 1, createdAt: -1 });
TransactionSchema.index({ type: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
