const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { sendSuccess, sendError, createPaginationMeta } = require('../utils/response');
const { generateOrderQR } = require('../utils/qrcode');
const { notifyNewOrder, notifyOrderStatusChange, notifyOrderCancelled } = require('../utils/socket');

// ─── POST /api/orders ─────────────────────────────────────────────
const placeOrder = async (req, res, next) => {
    try {
        const { items, dineOption, pickupType, specialNote, idempotencyKey } = req.body;

        // ── Idempotency: prevent duplicate orders on double-click ──
        if (idempotencyKey) {
            const existing = await Order.findOne({ idempotencyKey });
            if (existing) {
                // Return the existing order instead of creating a duplicate
                return sendSuccess(res, 200, 'Order already placed (idempotent).', {
                    orderId: existing.orderId,
                    _id: existing._id,
                    status: existing.status,
                    pin: existing.pin,
                    total: existing.total,
                    qrCode: existing.qrCode,
                    dineOption: existing.dineOption,
                    createdAt: existing.createdAt,
                });
            }
        }

        // 1. Validate all menu items exist and have sufficient stock
        const menuItems = [];
        let totalCost = 0;

        for (const item of items) {
            const menuItem = await MenuItem.findById(item.menuItemId);
            if (!menuItem) {
                return sendError(res, 404, `Menu item not found: ${item.menuItemId}`);
            }
            if (menuItem.stock < item.quantity) {
                return sendError(res, 400,
                    `Insufficient stock for "${menuItem.name}". Available: ${menuItem.stock}, Requested: ${item.quantity}`
                );
            }
            if (!menuItem.isAvailableForOrder) {
                return sendError(res, 400, `"${menuItem.name}" is currently unavailable.`);
            }

            menuItems.push({ menuItem, quantity: item.quantity });
            totalCost += menuItem.price * item.quantity;
        }

        // 2. Check user's wallet balance
        const student = await User.findById(req.user._id);
        if (student.balance < totalCost) {
            return sendError(res, 402,
                `Insufficient wallet balance. Required: ৳${totalCost.toFixed(2)}, Available: ৳${student.balance.toFixed(2)}`
            );
        }

        // 3. Deduct balance and update stock
        student.balance -= totalCost;
        await student.save({ validateBeforeSave: false });

        for (const { menuItem, quantity } of menuItems) {
            menuItem.stock -= quantity;
            await menuItem.save();
        }

        // 4. Build order items with price snapshot
        const orderItems = menuItems.map(({ menuItem, quantity }) => ({
            menuItem: menuItem._id,
            name: menuItem.name,
            price: menuItem.price,
            quantity,
            subtotal: menuItem.price * quantity,
        }));

        // 5. Generate QR code
        const pin = `MIST-${Math.floor(1000 + Math.random() * 9000)}`;
        const tempOrder = {
            studentId: student.userId,
            total: totalCost,
            items: orderItems.map(i => `${i.quantity}x ${i.name}`),
            pin,
            timestamp: new Date().toISOString(),
        };
        const qrCode = await generateOrderQR(tempOrder);

        // 6. Create order — status MUST start as Pending, never auto-advance
        const order = await Order.create({
            student: student._id,
            items: orderItems,
            total: totalCost,
            dineOption: dineOption || 'Dine In',
            pickupType: pickupType || 'Counter Pickup',
            specialNote: specialNote || '',
            pin,
            qrCode,
            status: 'Pending',  // ← Always Pending on creation
            idempotencyKey: idempotencyKey || null,
        });

        // 7. Record transaction
        const tx = await Transaction.create({
            user: student._id,
            type: 'Checkout',
            description: `Purchase: ${orderItems.map(i => `${i.name} (${i.quantity})`).join(', ')}`,
            amount: totalCost,
            postBalance: student.balance,
            order: order._id,
        });

        // 8. Create notification for student
        await Notification.create({
            user: student._id,
            title: 'Order Placed',
            message: `Order #${order.orderId} placed for ৳${totalCost.toFixed(2)}. ${dineOption || 'Dine In'}. Waiting for kitchen confirmation.`,
            type: 'order',
            relatedOrder: order._id,
        });

        // 9. Populate and emit to kitchen + admin via Socket.IO
        const populatedOrder = await Order.findById(order._id)
            .populate('student', 'name userId')
            .populate('items.menuItem', 'name category');

        notifyNewOrder(populatedOrder);

        return sendSuccess(res, 201, 'Order placed successfully!', {
            orderId: order.orderId,
            _id: order._id,
            status: order.status,
            pin: order.pin,
            total: order.total,
            qrCode: order.qrCode,
            dineOption: order.dineOption,
            newBalance: student.balance,
            items: orderItems,
            createdAt: order.createdAt,
        });

    } catch (err) {
        next(err);
    }
};


// ─── GET /api/orders ──────────────────────────────────────────────
const getMyOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = { student: req.user._id };
        if (status) filter.status = status;

        const [orders, total] = await Promise.all([
            Order.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('items.menuItem', 'name image price')
                .lean(),
            Order.countDocuments(filter),
        ]);

        return sendSuccess(res, 200, 'Orders retrieved.', orders,
            createPaginationMeta(total, page, limit));
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/orders/active ───────────────────────────────────────
const getActiveOrder = async (req, res, next) => {
    try {
        const activeOrder = await Order.findOne({
            student: req.user._id,
            status: { $in: ['Pending', 'Accepted', 'Preparing', 'Ready for Pickup'] }
        })
            .sort({ createdAt: -1 })
            .populate('items.menuItem', 'name image price')
            .lean();

        if (!activeOrder) {
            return sendSuccess(res, 200, 'No active order.', null);
        }

        return sendSuccess(res, 200, 'Active order retrieved.', activeOrder);
    } catch (err) {
        next(err);
    }
};


// ─── GET /api/orders/:orderId ─────────────────────────────────────
const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findOne({
            $or: [
                { _id: req.params.orderId.match(/^[0-9a-fA-F]{24}$/) ? req.params.orderId : null },
                { orderId: isNaN(req.params.orderId) ? -1 : parseInt(req.params.orderId) }
            ]
        })
            .populate('student', 'name userId department')
            .populate('items.menuItem', 'name image price category')
            .lean();

        if (!order) return sendError(res, 404, 'Order not found.');

        // Restrict: students can only see own orders
        if (req.user.role === 'student' || req.user.role === 'faculty') {
            if (order.student._id.toString() !== req.user._id.toString()) {
                return sendError(res, 403, 'Not authorized to view this order.');
            }
        }

        return sendSuccess(res, 200, 'Order retrieved.', order);
    } catch (err) {
        next(err);
    }
};

// ─── POST /api/orders/:orderId/cancel ─────────────────────────────
const cancelOrder = async (req, res, next) => {
    try {
        const order = await Order.findOne({
            orderId: parseInt(req.params.orderId),
            student: req.user._id,
        }).populate('items.menuItem');

        if (!order) return sendError(res, 404, 'Order not found.');

        // Only Pending orders can be cancelled by student
        if (!['Pending'].includes(order.status)) {
            return sendError(res, 400,
                `Cannot cancel an order that is already "${order.status}". Contact kitchen staff.`
            );
        }

        order.status = 'Cancelled';
        order.isCancelledByStudent = true;
        order.statusHistory.push({ status: 'Cancelled', time: new Date(), note: 'Cancelled by student' });

        // Refund balance
        const student = await User.findById(req.user._id);
        student.balance += order.total;
        await student.save({ validateBeforeSave: false });

        // Restore stock
        for (const item of order.items) {
            await MenuItem.findByIdAndUpdate(item.menuItem._id, { $inc: { stock: item.quantity } });
        }

        await order.save();

        // Record refund transaction
        await Transaction.create({
            user: student._id,
            type: 'Refund',
            description: `Refund for cancelled Order #${order.orderId}`,
            amount: order.total,
            postBalance: student.balance,
            order: order._id,
        });

        // Create notification
        await Notification.create({
            user: student._id,
            title: 'Order Cancelled',
            message: `Order #${order.orderId} cancelled. ৳${order.total.toFixed(2)} refunded to your wallet.`,
            type: 'order',
            relatedOrder: order._id,
        });

        notifyOrderCancelled(order);

        return sendSuccess(res, 200, `Order #${order.orderId} cancelled. Refund: ৳${order.total.toFixed(2)}`, {
            newBalance: student.balance,
        });
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/orders/:orderId/qr ──────────────────────────────────
const getOrderQR = async (req, res, next) => {
    try {
        const order = await Order.findOne({
            orderId: parseInt(req.params.orderId),
        }).populate('student', 'name userId').lean();

        if (!order) return sendError(res, 404, 'Order not found.');

        // Authorization check
        if (['student', 'faculty'].includes(req.user.role)) {
            if (order.student._id.toString() !== req.user._id.toString()) {
                return sendError(res, 403, 'Not authorized.');
            }
        }

        let qrCode = order.qrCode;

        // Regenerate if missing
        if (!qrCode) {
            qrCode = await generateOrderQR({
                orderId: order.orderId,
                pin: order.pin,
                studentId: order.student.userId,
                total: order.total,
                items: order.items.map(i => `${i.quantity}x ${i.name}`),
                timestamp: order.createdAt,
            });
            await Order.findByIdAndUpdate(order._id, { qrCode });
        }

        return sendSuccess(res, 200, 'QR code retrieved.', {
            orderId: order.orderId,
            qrCode,
            pin: order.pin,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    placeOrder,
    getMyOrders,
    getActiveOrder,
    getOrderById,
    cancelOrder,
    getOrderQR,
};
