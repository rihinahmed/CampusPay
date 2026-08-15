const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Menu item name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    tagline: {
        type: String,
        trim: true,
        default: '',
        maxlength: [200, 'Tagline cannot exceed 200 characters'],
    },

    description: {
        type: String,
        trim: true,
        default: '',
        maxlength: [500, 'Description cannot exceed 500 characters'],
    },

    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: {
            values: ['Rice', 'Fast Food', 'Traditional', 'Drinks', 'Snacks', 'Dessert', 'Main Course', 'Breakfast'],
            message: 'Invalid category'
        },
    },

    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative'],
    },

    stock: {
        type: Number,
        default: 0,
        min: [0, 'Stock cannot be negative'],
    },

    rating: {
        type: Number,
        default: 4.0,
        min: 0,
        max: 5,
    },

    ratingCount: {
        type: Number,
        default: 0,
    },

    image: {
        type: String, // URL or local path
        default: '',
    },

    status: {
        type: String,
        enum: ['Available', 'Unavailable', 'Out of Stock'],
        default: 'Available',
    },

    prepTime: {
        type: String,
        default: '10 mins',
    },

    tags: [{
        type: String,
        trim: true,
    }],

    isAvailableForOrder: {
        type: Boolean,
        default: true,
    },

    // Automatically set status based on stock
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Virtual: stockText
MenuItemSchema.virtual('stockText').get(function () {
    if (this.stock <= 0) return 'Out of Stock';
    if (this.stock <= 3) return `Only ${this.stock} left!`;
    return `${this.stock} left in stock`;
});

// Pre-save: Auto-update status based on stock
MenuItemSchema.pre('save', function (next) {
    if (this.stock <= 0) {
        this.status = 'Out of Stock';
        this.isAvailableForOrder = false;
    } else if (this.status === 'Out of Stock') {
        this.status = 'Available';
        this.isAvailableForOrder = true;
    }
    next();
});

// Indexes
MenuItemSchema.index({ category: 1 });
MenuItemSchema.index({ status: 1 });
MenuItemSchema.index({ name: 'text', tagline: 'text', description: 'text' });

module.exports = mongoose.model('MenuItem', MenuItemSchema);
