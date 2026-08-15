const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Notification = require('../models/Notification');
const { sendSuccess, sendError, createPaginationMeta } = require('../utils/response');
const { notifyOrderStatusChange, notifyOrderCancelled, notifyKitchenStatus } = require('../utils/socket');

// In-memory kitchen status (persisted via DB in production, fine for this use case)
let kitchenStatus = { isOpen: true, message: 'Kitchen is open.' };

// ─── GET /api/staff/orders ────────────────────────────────────────
const getOrderQueue = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 50 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = {};
        if (status === 'active') {
            filter.status = { $in: ['Pending', 'Accepted', 'Preparing', 'Ready for Pickup'] };
        } else if (status && status !== 'all') {
            // Allow querying a specific status (e.g. ?status=Pending)
            filter.status = status;
        }
        // Default (no status param) → return active orders only for kitchen queue
        if (!status) {
            filter.status = { $in: ['Pending', 'Accepted', 'Preparing', 'Ready for Pickup'] };
        }

        const [orders, total] = await Promise.all([
            Order.find(filter)
                .sort({ isPinned: -1, createdAt: 1 }) // Pinned first, then oldest first
                .skip(skip)
                .limit(parseInt(limit))
                .populate('student', 'name userId department phone')
                .lean(),
            Order.countDocuments(filter),
        ]);

        // Add time-elapsed for each order (display only — never changes status)
        const enriched = orders.map(order => ({
            ...order,
            orderTimeAgo: getTimeAgo(order.createdAt),
            orderMinutesAgo: Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000),
        }));

        // Badge counts by status
        const badges = await Order.aggregate([
            {
                $match: { status: { $in: ['Pending', 'Accepted', 'Preparing', 'Ready for Pickup'] } }
            },
            {
                $group: { _id: '$status', count: { $sum: 1 } }
            }
        ]);

        const badgeMap = {};
        badges.forEach(b => { badgeMap[b._id] = b.count; });

        return sendSuccess(res, 200, 'Order queue retrieved.', {
            orders: enriched,
            badges: {
                pending: badgeMap['Pending'] || 0,
                accepted: badgeMap['Accepted'] || 0,
                preparing: badgeMap['Preparing'] || 0,
                readyForPickup: badgeMap['Ready for Pickup'] || 0,
                total: Object.values(badgeMap).reduce((a, b) => a + b, 0),
            },
        }, createPaginationMeta(total, page, limit));
    } catch (err) {
        next(err);
    }
};

// ─── PUT /api/staff/orders/:id/status ─────────────────────────────
const updateOrderStatus = async (req, res, next) => {
    try {
        const { status: newStatus, note } = req.body;

        // ── Atomic fetch ──────────────────────────────────────────
        const order = await Order.findById(req.params.id)
            .populate('student', 'name userId _id');

        if (!order) return sendError(res, 404, 'Order not found.');

        const currentStatus = order.status;

        // ── Terminal state guard ──────────────────────────────────
        if (currentStatus === 'Delivered' || currentStatus === 'Cancelled') {
            return sendError(res, 400, `Cannot update an order that is already "${currentStatus}".`);
        }

        // ── Transition validation matrix ──────────────────────────
        const validNext = Order.VALID_TRANSITIONS[currentStatus] || [];
        if (!validNext.includes(newStatus)) {
            return sendError(res, 400,
                `Invalid status transition: "${currentStatus}" → "${newStatus}". ` +
                `Allowed next states: ${validNext.join(', ') || 'none'}.`
            );
        }

        // ── Special: Delivered must be atomic to prevent double-delivery ──
        if (newStatus === 'Delivered') {
            const result = await Order.findOneAndUpdate(
                { _id: order._id, status: 'Ready for Pickup' },  // WHERE clause prevents race condition
                {
                    $set: {
                        status: 'Delivered',
                        deliveredAt: new Date(),
                        deliveredBy: req.user._id,
                    },
                    $push: {
                        statusHistory: {
                            status: 'Delivered',
                            time: new Date(),
                            note: note || '',
                            by: req.user._id,
                        }
                    }
                },
                { new: true }
            ).populate('student', 'name userId _id');

            if (!result) {
                return sendError(res, 409,
                    'Order has already been delivered or is no longer in "Ready for Pickup" state.'
                );
            }

            // Notify all parties
            notifyOrderStatusChange(result);
            await Notification.create({
                user: result.student._id,
                title: 'Order Delivered',
                message: `Order #${result.orderId} has been delivered. Enjoy your meal!`,
                type: 'order',
                relatedOrder: result._id,
            });

            return sendSuccess(res, 200, `Order #${result.orderId} marked as Delivered.`, {
                orderId: result.orderId,
                status: result.status,
                deliveredAt: result.deliveredAt,
            });
        }

        // ── Standard transition ───────────────────────────────────
        order.status = newStatus;
        order.statusHistory.push({
            status: newStatus,
            time: new Date(),
            note: note || '',
            by: req.user._id,
        });

        if (note) order.staffNote = note;

        // Set lifecycle timestamps
        const now = new Date();
        if (newStatus === 'Accepted')         { order.acceptedAt  = now; order.acceptedBy  = req.user._id; }
        if (newStatus === 'Preparing')        { order.preparingAt = now; order.preparedBy  = req.user._id; }
        if (newStatus === 'Ready for Pickup') { order.readyAt     = now; }
        if (newStatus === 'Cancelled')        { order.cancelledAt = now; }

        await order.save();

        // Notify student + kitchen peers + admin
        notifyOrderStatusChange(order);

        // Persist notification for student
        const notificationMessages = {
            'Accepted':         `Order #${order.orderId} has been accepted by the kitchen!`,
            'Preparing':        `Order #${order.orderId} is now being prepared. 🍳`,
            'Ready for Pickup': `Order #${order.orderId} is ready! Show your QR code at the counter. PIN: ${order.pin}`,
            'Cancelled':        `Order #${order.orderId} has been cancelled by kitchen staff.`,
        };

        await Notification.create({
            user: order.student._id,
            title: `Order ${newStatus}`,
            message: notificationMessages[newStatus] || `Order #${order.orderId} is now "${newStatus}".`,
            type: 'order',
            relatedOrder: order._id,
        });

        return sendSuccess(res, 200, `Order #${order.orderId} status updated to "${newStatus}".`, {
            orderId: order.orderId,
            _id: order._id,
            status: order.status,
            statusHistory: order.statusHistory,
        });
    } catch (err) {
        next(err);
    }
};

// ─── PUT /api/staff/orders/:id/pin ────────────────────────────────
const toggleOrderPin = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return sendError(res, 404, 'Order not found.');

        order.isPinned = !order.isPinned;
        await order.save();

        return sendSuccess(res, 200,
            `Order #${order.orderId} ${order.isPinned ? 'pinned' : 'unpinned'}.`,
            { isPinned: order.isPinned }
        );
    } catch (err) {
        next(err);
    }
};

// ─── POST /api/staff/orders/:id/note ──────────────────────────────
const addStaffNote = async (req, res, next) => {
    try {
        const { note } = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { staffNote: note },
            { new: true }
        );

        if (!order) return sendError(res, 404, 'Order not found.');

        return sendSuccess(res, 200, 'Staff note added.', { staffNote: order.staffNote });
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/staff/menu ──────────────────────────────────────────
const getStaffMenu = async (req, res, next) => {
    try {
        const items = await MenuItem.find().sort({ category: 1, name: 1 }).lean();
        return sendSuccess(res, 200, 'Menu retrieved.', items);
    } catch (err) {
        next(err);
    }
};

// ─── PUT /api/staff/menu/:id ──────────────────────────────────────
const updateMenuItemStaff = async (req, res, next) => {
    try {
        const { stock, status } = req.body;

        const updates = {};
        if (stock !== undefined) updates.stock = Math.max(0, parseInt(stock));
        if (status) updates.status = status;

        const item = await MenuItem.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!item) return sendError(res, 404, 'Menu item not found.');
        return sendSuccess(res, 200, 'Menu item updated.', item);
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/staff/kitchen/status ────────────────────────────────
const getKitchenStatus = async (req, res, next) => {
    return sendSuccess(res, 200, 'Kitchen status retrieved.', kitchenStatus);
};

// ─── PUT /api/staff/kitchen/status ────────────────────────────────
const toggleKitchenStatus = async (req, res, next) => {
    try {
        kitchenStatus.isOpen = !kitchenStatus.isOpen;
        kitchenStatus.message = kitchenStatus.isOpen
            ? 'Kitchen is now open for orders.'
            : 'Kitchen is currently closed.';

        notifyKitchenStatus(kitchenStatus.isOpen);

        return sendSuccess(res, 200, kitchenStatus.message, kitchenStatus);
    } catch (err) {
        next(err);
    }
};

// ─── POST /api/staff/scan-qr ──────────────────────────────────────
const scanQR = async (req, res, next) => {
    try {
        const { qrData } = req.body;
        if (!qrData) return sendError(res, 400, 'QR data is required.');

        let parsed;
        try {
            parsed = JSON.parse(qrData);
        } catch {
            return sendError(res, 400, 'Invalid QR code format.');
        }

        if (!parsed.orderId || !parsed.pin) {
            return sendError(res, 400, 'QR code is missing required fields (orderId, pin).');
        }

        const order = await Order.findOne({ orderId: parseInt(parsed.orderId) })
            .populate('student', 'name userId')
            .lean();

        if (!order) {
            return sendError(res, 404, 'Order not found in system.');
        }

        if (order.pin !== parsed.pin) {
            return sendError(res, 401, 'PIN mismatch. QR code verification failed.');
        }

        if (order.status === 'Delivered') {
            return sendError(res, 409, 'This order has already been delivered.');
        }

        if (order.status === 'Cancelled') {
            return sendError(res, 400, 'This order has been cancelled.');
        }

        const isReadyForDelivery = order.status === 'Ready for Pickup';

        return sendSuccess(res, 200, 'QR code verified successfully.', {
            orderId: order.orderId,
            _id: order._id,
            status: order.status,
            isReadyForDelivery,
            studentName: order.student?.name,
            studentId: order.student?.userId,
            total: order.total,
            pin: order.pin,
            items: order.items,
            dineOption: order.dineOption,
        });
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
    getOrderQueue,
    updateOrderStatus,
    toggleOrderPin,
    addStaffNote,
    getStaffMenu,
    updateMenuItemStaff,
    getKitchenStatus,
    toggleKitchenStatus,
    scanQR,
};
