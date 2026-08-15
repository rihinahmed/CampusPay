const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    title: {
        type: String,
        required: [true, 'Notification title is required'],
        trim: true,
        maxlength: 100,
    },

    message: {
        type: String,
        required: [true, 'Notification message is required'],
        trim: true,
        maxlength: 500,
    },

    type: {
        type: String,
        enum: ['order', 'recharge', 'system', 'announcement'],
        default: 'system',
    },

    isRead: {
        type: Boolean,
        default: false,
    },

    // Optional reference to related entity
    relatedOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        default: null,
    },

}, {
    timestamps: true,
});

// ─── Indexes ──────────────────────────────────────────────────────
NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
