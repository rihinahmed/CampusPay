const mongoose = require('mongoose');

// Auto-increment counter for human-readable order IDs
const CounterSchema = new mongoose.Schema({
    _id: String,
    seq: { type: Number, default: 3000 }
});
const Counter = mongoose.model('Counter', CounterSchema);

const OrderItemSchema = new mongoose.Schema({
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true,
    },
    name: { type: String }, // Snapshot of name at order time
    price: { type: Number }, // Snapshot of price at order time
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
    },
    subtotal: { type: Number },
}, { _id: false });

const StatusHistorySchema = new mongoose.Schema({
    status: { type: String },
    time: { type: Date, default: Date.now },
    note: { type: String },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { _id: false });

// ─── Valid status transitions ─────────────────────────────────────
// This is enforced in the controller, defined here for reference
const VALID_TRANSITIONS = {
    'Pending':          ['Accepted', 'Cancelled'],
    'Accepted':         ['Preparing', 'Cancelled'],
    'Preparing':        ['Ready for Pickup', 'Cancelled'],
    'Ready for Pickup': ['Delivered'],
    'Delivered':        [],
    'Cancelled':        [],
};

const OrderSchema = new mongoose.Schema({
    // Human-readable sequential order ID (e.g. 3024)
    orderId: {
        type: Number,
        unique: true,
    },

    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Order must have a student'],
    },

    items: {
        type: [OrderItemSchema],
        validate: {
            validator: (v) => v.length > 0,
            message: 'Order must have at least one item',
        },
    },

    total: {
        type: Number,
        required: true,
        min: 0,
    },

    dineOption: {
        type: String,
        enum: ['Dine In', 'Parcel'],
        default: 'Dine In',
    },

    pickupType: {
        type: String,
        enum: ['Counter Pickup', 'Table Service'],
        default: 'Counter Pickup',
    },

    specialNote: {
        type: String,
        trim: true,
        default: '',
        maxlength: [300, 'Special note too long'],
    },

    // ─── Order Status (canonical lifecycle) ──────────────────────
    // Pending → Accepted → Preparing → Ready for Pickup → Delivered
    // Any active status → Cancelled
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Preparing', 'Ready for Pickup', 'Delivered', 'Cancelled'],
        default: 'Pending',
    },

    // ─── Lifecycle Timestamps ─────────────────────────────────────
    acceptedAt:  { type: Date, default: null },
    preparingAt: { type: Date, default: null },
    readyAt:     { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },

    // ─── Staff Attribution ────────────────────────────────────────
    acceptedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    preparedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    deliveredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // 4-digit pickup PIN (e.g. MIST-5432)
    pin: {
        type: String,
        default: () => `MIST-${Math.floor(1000 + Math.random() * 9000)}`,
    },

    // QR Code base64 string
    qrCode: {
        type: String,
        default: '',
    },

    statusHistory: [StatusHistorySchema],

    staffNote: {
        type: String,
        default: '',
    },

    isPinned: {
        type: Boolean,
        default: false,
    },

    isCancelledByStudent: {
        type: Boolean,
        default: false,
    },

    // Payment metadata
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Pending', 'Refunded'],
        default: 'Paid',
    },

    // Idempotency key — prevent duplicate orders on double-click
    idempotencyKey: {
        type: String,
        default: null,
        index: { sparse: true },
    },

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// ─── Auto-increment orderId ───────────────────────────────────────
OrderSchema.pre('save', async function (next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findByIdAndUpdate(
                'orderId',
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            this.orderId = counter.seq;

            // Add initial status to history
            this.statusHistory = [{ status: 'Pending', time: new Date() }];
        } catch (err) {
            return next(err);
        }
    }
    next();
});

// ─── Indexes ──────────────────────────────────────────────────────
OrderSchema.index({ student: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: 1 });
OrderSchema.index({ orderId: 1 });

// ─── Export valid transitions map ────────────────────────────────
OrderSchema.statics.VALID_TRANSITIONS = VALID_TRANSITIONS;

module.exports = mongoose.model('Order', OrderSchema);
