let io = null;

/**
 * Initialize socket utility with the Socket.IO instance.
 * Call this once from server.js after io is created.
 */
const initSocket = (socketIO) => {
    io = socketIO;
};

/**
 * Get raw io instance (for advanced use).
 */
const getIo = () => io;

/**
 * Emit to all connected kitchen staff clients.
 */
const emitToStaff = (event, data) => {
    if (!io) return;
    io.to('kitchen-room').emit(event, data);
};

/**
 * Emit to all connected admin clients.
 */
const emitToAdmin = (event, data) => {
    if (!io) return;
    io.to('admin-room').emit(event, data);
};

/**
 * Emit to a specific user's room (user-<userId>).
 */
const emitToUser = (userId, event, data) => {
    if (!io) return;
    io.to(`user-${userId}`).emit(event, data);
};

/**
 * Broadcast to all connected clients.
 */
const broadcast = (event, data) => {
    if (!io) return;
    io.emit(event, data);
};

// ─── Semantic Event Emitters ──────────────────────────────────────

/** New order placed — notify kitchen staff AND admin */
const notifyNewOrder = (order) => {
    const studentId = order.student?._id || order.student;
    const payload = {
        _id: order._id,
        orderId: order.orderId,            // Human-readable number (e.g. 3024)
        studentName: order.student?.name,
        studentId: order.student?.userId,
        items: order.items,
        total: order.total,
        dineOption: order.dineOption,
        pickupType: order.pickupType,
        specialNote: order.specialNote,
        status: order.status,             // Always "Pending"
        createdAt: order.createdAt,
    };

    emitToStaff('order:new', payload);
    emitToAdmin('order:new', payload);
};

/** Order status changed — notify student, kitchen, and admin */
const notifyOrderStatusChange = (order) => {
    const studentId = order.student?._id || order.student;
    const payload = {
        _id: order._id,
        orderId: order.orderId,
        status: order.status,
        pin: order.pin,
        message: getStatusMessage(order.status),
        updatedAt: order.updatedAt || new Date(),
    };

    // Notify the individual student
    emitToUser(studentId.toString(), 'order:status-changed', payload);

    // Notify all kitchen staff (for cross-staff sync)
    emitToStaff('order:status-updated', {
        _id: order._id,
        orderId: order.orderId,
        status: order.status,
        updatedAt: payload.updatedAt,
    });

    // Notify admin dashboard
    emitToAdmin('order:status-updated', {
        _id: order._id,
        orderId: order.orderId,
        status: order.status,
        updatedAt: payload.updatedAt,
    });
};

/** Order cancelled */
const notifyOrderCancelled = (order) => {
    const studentId = order.student?._id || order.student;
    emitToUser(studentId.toString(), 'order:cancelled', {
        _id: order._id,
        orderId: order.orderId,
        message: 'Your order has been cancelled.',
    });
    emitToStaff('order:cancelled', { _id: order._id, orderId: order.orderId });
    emitToAdmin('order:cancelled', { _id: order._id, orderId: order.orderId });
};

/** Recharge approved — notify student */
const notifyRechargeApproved = (userId, amount, newBalance) => {
    emitToUser(userId.toString(), 'recharge:approved', {
        amount,
        newBalance,
        message: `৳${amount} has been credited to your wallet.`
    });
};

/** Recharge declined — notify student */
const notifyRechargeDeclined = (userId, amount) => {
    emitToUser(userId.toString(), 'recharge:declined', {
        amount,
        message: `Your recharge request of ৳${amount} was declined.`
    });
};

/** Kitchen open/closed status change */
const notifyKitchenStatus = (isOpen) => {
    broadcast('kitchen:status-changed', {
        isOpen,
        message: isOpen ? 'Kitchen is now open for orders.' : 'Kitchen is currently closed.'
    });
};

/** New recharge request submitted — notify admins */
const notifyNewRechargeRequest = (request) => {
    emitToAdmin('recharge:new-request', {
        id: request._id,
        studentName: request.user?.name,
        amount: request.amount,
        method: request.method,
        txid: request.txid
    });
};

/** New user verification request — notify admins */
const notifyNewVerificationRequest = (verification) => {
    emitToAdmin('verification:new-request', {
        id: verification._id,
        name: verification.name,
        userId: verification.userId,
        role: verification.role
    });
};

// ─── Helper ──────────────────────────────────────────────────────

const getStatusMessage = (status) => {
    const messages = {
        'Pending':          '⏳ Your order has been received and is waiting for kitchen confirmation.',
        'Accepted':         '✅ Your order has been accepted by the kitchen!',
        'Preparing':        '🍳 Your order is now being prepared.',
        'Ready for Pickup': '🎉 Your order is ready! Please collect from the counter and show your QR code.',
        'Delivered':        '🍽️ Order delivered. Thank you for dining with us!',
        'Cancelled':        '❌ Your order has been cancelled.',
    };
    return messages[status] || `Order status updated to: ${status}`;
};

module.exports = {
    initSocket,
    getIo,
    emitToStaff,
    emitToAdmin,
    emitToUser,
    broadcast,
    notifyNewOrder,
    notifyOrderStatusChange,
    notifyOrderCancelled,
    notifyRechargeApproved,
    notifyRechargeDeclined,
    notifyKitchenStatus,
    notifyNewRechargeRequest,
    notifyNewVerificationRequest,
};
