const MenuItem = require('../models/MenuItem');
const { sendSuccess, sendError, createPaginationMeta } = require('../utils/response');

// ─── GET /api/menu ────────────────────────────────────────────────
const getAllMenuItems = async (req, res, next) => {
    try {
        const { category, search, status, page = 1, limit = 50 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = {};
        if (category && category !== 'All Items') {
            filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
        }
        if (status) filter.status = status;

        // Full-text search
        let query;
        if (search && search.trim()) {
            query = MenuItem.find({
                ...filter,
                $or: [
                    { name: { $regex: new RegExp(search, 'i') } },
                    { tagline: { $regex: new RegExp(search, 'i') } },
                    { category: { $regex: new RegExp(search, 'i') } },
                    { description: { $regex: new RegExp(search, 'i') } },
                ]
            });
        } else {
            query = MenuItem.find(filter);
        }

        const [items, total] = await Promise.all([
            query.sort({ category: 1, name: 1 }).skip(skip).limit(parseInt(limit)).lean(),
            MenuItem.countDocuments(filter),
        ]);

        // Add stockText to each item
        const enriched = items.map(item => ({
            ...item,
            stockText: item.stock <= 0 ? 'Out of Stock'
                : item.stock <= 3 ? `Only ${item.stock} left!`
                    : `${item.stock} left in stock`,
        }));

        return sendSuccess(res, 200, 'Menu items retrieved.', enriched,
            createPaginationMeta(total, page, limit));
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/menu/:id ────────────────────────────────────────────
const getMenuItemById = async (req, res, next) => {
    try {
        const item = await MenuItem.findById(req.params.id);
        if (!item) return sendError(res, 404, 'Menu item not found.');
        return sendSuccess(res, 200, 'Menu item retrieved.', item);
    } catch (err) {
        next(err);
    }
};

// ─── POST /api/menu ───────────────────────────────────────────────
const createMenuItem = async (req, res, next) => {
    try {
        const itemData = { ...req.body };
        if (req.file) {
            itemData.image = `/uploads/menu/${req.file.filename}`;
        }

        const item = await MenuItem.create(itemData);
        return sendSuccess(res, 201, 'Menu item created successfully.', item);
    } catch (err) {
        next(err);
    }
};

// ─── PUT /api/menu/:id ────────────────────────────────────────────
const updateMenuItem = async (req, res, next) => {
    try {
        const updates = { ...req.body };
        if (req.file) {
            updates.image = `/uploads/menu/${req.file.filename}`;
        }

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

// ─── DELETE /api/menu/:id ─────────────────────────────────────────
const deleteMenuItem = async (req, res, next) => {
    try {
        const item = await MenuItem.findByIdAndDelete(req.params.id);
        if (!item) return sendError(res, 404, 'Menu item not found.');
        return sendSuccess(res, 200, `Menu item "${item.name}" deleted.`);
    } catch (err) {
        next(err);
    }
};

// ─── PUT /api/menu/:id/stock ──────────────────────────────────────
const updateStock = async (req, res, next) => {
    try {
        const { stock, operation } = req.body; // operation: 'set' | 'increment' | 'decrement'

        const item = await MenuItem.findById(req.params.id);
        if (!item) return sendError(res, 404, 'Menu item not found.');

        if (operation === 'increment') {
            item.stock = Math.max(0, item.stock + parseInt(stock || 1));
        } else if (operation === 'decrement') {
            item.stock = Math.max(0, item.stock - parseInt(stock || 1));
        } else {
            item.stock = Math.max(0, parseInt(stock));
        }

        await item.save();
        return sendSuccess(res, 200, 'Stock updated.', { stock: item.stock, status: item.status });
    } catch (err) {
        next(err);
    }
};

// ─── GET /api/menu/categories ─────────────────────────────────────
const getCategories = async (req, res, next) => {
    try {
        const categories = await MenuItem.distinct('category');
        return sendSuccess(res, 200, 'Categories retrieved.', ['All Items', ...categories]);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllMenuItems,
    getMenuItemById,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    updateStock,
    getCategories,
};
