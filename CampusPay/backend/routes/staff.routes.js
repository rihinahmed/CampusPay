const express = require('express');
const router = express.Router();
const {
    getOrderQueue, updateOrderStatus, toggleOrderPin, addStaffNote,
    getStaffMenu, updateMenuItemStaff, getKitchenStatus,
    toggleKitchenStatus, scanQR,
} = require('../controllers/staff.controller');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const { updateOrderStatusSchema, addStaffNoteSchema } = require('../validators/order.validator');

// All staff routes require authentication
router.use(protect);
router.use(requireRole('staff', 'admin')); // Admin can also access staff view

// Orders Queue
router.get('/orders', getOrderQueue);
router.put('/orders/:id/status', validate(updateOrderStatusSchema), updateOrderStatus);
router.put('/orders/:id/pin', toggleOrderPin);
router.post('/orders/:id/note', validate(addStaffNoteSchema), addStaffNote);

// Staff Menu View
router.get('/menu', getStaffMenu);
router.put('/menu/:id', updateMenuItemStaff);

// Kitchen Status
router.get('/kitchen/status', getKitchenStatus);
router.put('/kitchen/status', toggleKitchenStatus);

// QR Scan
router.post('/scan-qr', scanQR);

module.exports = router;
