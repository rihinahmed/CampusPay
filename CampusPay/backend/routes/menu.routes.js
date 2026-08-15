const express = require('express');
const router = express.Router();
const {
    getAllMenuItems, getMenuItemById, createMenuItem,
    updateMenuItem, deleteMenuItem, updateStock, getCategories,
} = require('../controllers/menu.controller');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const { createMenuItemSchema, updateMenuItemSchema } = require('../validators/admin.validator');
const upload = require('../middleware/upload');

// All menu routes require authentication
router.use(protect);

// @route   GET /api/menu/categories
router.get('/categories', getCategories);

// @route   GET /api/menu
router.get('/', getAllMenuItems);

// @route   GET /api/menu/:id
router.get('/:id', getMenuItemById);

// @route   POST /api/menu (Admin or Staff only)
router.post('/',
    requireRole('admin', 'staff'),
    upload.single('image'),
    validate(createMenuItemSchema),
    createMenuItem
);

// @route   PUT /api/menu/:id (Admin or Staff)
router.put('/:id',
    requireRole('admin', 'staff'),
    upload.single('image'),
    validate(updateMenuItemSchema),
    updateMenuItem
);

// @route   DELETE /api/menu/:id (Admin only)
router.delete('/:id', requireRole('admin'), deleteMenuItem);

// @route   PUT /api/menu/:id/stock (Admin or Staff)
router.put('/:id/stock', requireRole('admin', 'staff'), updateStock);

module.exports = router;
