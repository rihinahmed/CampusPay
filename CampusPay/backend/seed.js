/**
 * CampusPay Database Seeder
 * Run: npm run seed
 * Seeds the database with demo users, menu items, orders, and transactions.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');
const Transaction = require('./models/Transaction');
const RechargeRequest = require('./models/RechargeRequest');
const Verification = require('./models/Verification');
const Notification = require('./models/Notification');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/campuspay';

// ─── Demo Data ────────────────────────────────────────────────────

const users = [
    {
        userId: '202314033',
        name: 'Ajmain Taki',
        email: 'ajmain@mist.ac.bd',
        password: '1234',
        role: 'student',
        department: 'CSE Department',
        phone: '01700000001',
        balance: 500.00,
        status: 'Active',
    },
    {
        userId: '202114042',
        name: 'Abdullah Safwan',
        email: 'safwan@mist.ac.bd',
        password: '1234',
        role: 'student',
        department: 'EEE Department',
        phone: '01700000002',
        balance: 750.00,
        status: 'Active',
    },
    {
        userId: '202214109',
        name: 'Raisa Mahfuz',
        email: 'raisa@mist.ac.bd',
        password: '1234',
        role: 'student',
        department: 'ME Department',
        phone: '01700000003',
        balance: 350.00,
        status: 'Active',
    },
    {
        userId: '202114001',
        name: 'Tanvir Rahman',
        email: 'tanvir@mist.ac.bd',
        password: '1234',
        role: 'student',
        department: 'CE Department',
        phone: '01700000004',
        balance: 670.00,
        status: 'Suspended',
    },
    {
        userId: 'FAC-0000',
        name: 'Dr. Khulna Habib',
        email: 'habib@mist.ac.bd',
        password: '1234',
        role: 'faculty',
        department: 'CSE Department',
        phone: '01800000001',
        balance: 2450.00,
        status: 'Active',
    },
    {
        userId: 'ST-0000',
        name: 'Counter Staff #1',
        email: 'staff@mist.ac.bd',
        password: '1234',
        role: 'staff',
        department: 'Cafeteria',
        phone: '01900000001',
        balance: 0.00,
        status: 'Active',
    },
    {
        userId: 'ADM-0000',
        name: 'System Administrator',
        email: 'admin@mist.ac.bd',
        password: '1234',
        role: 'admin',
        department: 'IT Department',
        phone: '01900000000',
        balance: 0.00,
        status: 'Active',
    },
];

const menuItems = [
    {
        name: 'Fried Rice',
        tagline: 'Classic MIST special fried rice recipe',
        category: 'Rice',
        price: 110.00,
        rating: 4.6,
        stock: 15,
        image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=60',
        prepTime: '12 mins',
        tags: ['Popular'],
        status: 'Available',
    },
    {
        name: 'Crispy Chicken',
        tagline: '2 pieces with wedges',
        category: 'Fast Food',
        price: 85.00,
        rating: 4.5,
        stock: 3,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60',
        prepTime: '8 mins',
        tags: ['Bestseller', 'Crispy'],
        status: 'Available',
    },
    {
        name: 'Fresh Greek Salad',
        tagline: 'Organic veggies & feta',
        category: 'Fast Food',
        price: 60.00,
        rating: 4.9,
        stock: 25,
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60',
        prepTime: '5 mins',
        tags: ['Healthy', 'Vegetarian'],
        status: 'Available',
    },
    {
        name: 'Paratha & Bhaji',
        tagline: 'Daily morning combo',
        category: 'Traditional',
        price: 35.00,
        rating: 4.3,
        stock: 0,
        image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=60',
        prepTime: '6 mins',
        tags: ['Breakfast'],
        status: 'Out of Stock',
    },
    {
        name: 'MIST Cold Coffee',
        tagline: 'Creamy iced blend with chocolate drizzle',
        category: 'Drinks',
        price: 50.00,
        rating: 4.7,
        stock: 15,
        image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&auto=format&fit=crop&q=60',
        prepTime: '3 mins',
        tags: ['Refreshing', 'Popular'],
        status: 'Available',
    },
    {
        name: 'Chicken Khichuri',
        tagline: 'Steaming hot chicken khichuri',
        category: 'Rice',
        price: 70.00,
        rating: 4.7,
        stock: 18,
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60',
        prepTime: '15 mins',
        tags: ['Comfort Food', 'Hot'],
        status: 'Available',
    },
    {
        name: 'Dim Khichuri',
        tagline: 'Khichuri served with boiled egg',
        category: 'Rice',
        price: 40.00,
        rating: 4.4,
        stock: 20,
        image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500&auto=format&fit=crop&q=60',
        prepTime: '12 mins',
        tags: ['Egg'],
        status: 'Available',
    },
    {
        name: 'Beef Kacchi Biryani',
        tagline: 'Aromatic Basmati rice with tender marinated beef, served with Borhani',
        category: 'Main Course',
        price: 180.00,
        rating: 4.9,
        stock: 45,
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
        prepTime: '20 mins',
        tags: ['Chef Special', 'Popular'],
        status: 'Available',
    },
    {
        name: 'Crispy Chicken Burger',
        tagline: 'Double crisp fried chicken patty with melted cheddar & fresh lettuce',
        category: 'Fast Food',
        price: 120.00,
        rating: 4.8,
        stock: 32,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
        prepTime: '8 mins',
        tags: ['Bestseller'],
        status: 'Available',
    },
    {
        name: 'Double Egg Toast Sandwich',
        tagline: 'Crispy toast with fried eggs, cheese & tomato',
        category: 'Breakfast',
        price: 45.00,
        rating: 4.3,
        stock: 50,
        image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80',
        prepTime: '6 mins',
        tags: ['Quick Snack'],
        status: 'Available',
    },
];

// ─── Seed Function ────────────────────────────────────────────────
async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB for seeding...\n');

        // ── Clear existing data ───────────────────────────────────
        console.log('🗑️  Clearing existing data...');
        await Promise.all([
            User.deleteMany({}),
            MenuItem.deleteMany({}),
            Order.deleteMany({}),
            Transaction.deleteMany({}),
            RechargeRequest.deleteMany({}),
            Verification.deleteMany({}),
            Notification.deleteMany({}),
            // Reset order counter
            mongoose.connection.db.collection('counters').deleteMany({}),
        ]);
        console.log('✅ Collections cleared.\n');

        // ── Create Users ──────────────────────────────────────────
        console.log('👤 Seeding users...');
        const createdUsers = [];
        for (const userData of users) {
            const user = await User.create(userData);
            createdUsers.push(user);
            console.log(`   ✓ ${user.role.toUpperCase()}: ${user.userId} — ${user.name}`);
        }

        // ── Create Menu Items ─────────────────────────────────────
        console.log('\n🍽️  Seeding menu items...');
        const createdMenuItems = await MenuItem.insertMany(menuItems);
        createdMenuItems.forEach(m => console.log(`   ✓ ${m.category}: ${m.name} — ৳${m.price}`));

        // ── Create Sample Orders ──────────────────────────────────
        console.log('\n📦 Seeding sample orders...');

        const student1 = createdUsers.find(u => u.userId === '202314033');
        const student2 = createdUsers.find(u => u.userId === '202114042');
        const item1 = createdMenuItems.find(m => m.name === 'Fried Rice');
        const item2 = createdMenuItems.find(m => m.name === 'MIST Cold Coffee');
        const item3 = createdMenuItems.find(m => m.name === 'Crispy Chicken');
        const item4 = createdMenuItems.find(m => m.name === 'Beef Kacchi Biryani');

        // Past completed orders
        const pastOrders = [
            {
                student: student1._id,
                items: [
                    { menuItem: item1._id, name: item1.name, price: item1.price, quantity: 1, subtotal: item1.price },
                    { menuItem: item2._id, name: item2.name, price: item2.price, quantity: 1, subtotal: item2.price },
                ],
                total: item1.price + item2.price,
                dineOption: 'Dine In',
                status: 'Completed',
                pin: 'MIST-5432',
                statusHistory: [
                    { status: 'Pending', time: new Date(Date.now() - 3 * 24 * 60 * 60000) },
                    { status: 'Accepted', time: new Date(Date.now() - 3 * 24 * 60 * 60000 + 60000) },
                    { status: 'Preparing', time: new Date(Date.now() - 3 * 24 * 60 * 60000 + 120000) },
                    { status: 'Ready for Pickup', time: new Date(Date.now() - 3 * 24 * 60 * 60000 + 600000) },
                    { status: 'Completed', time: new Date(Date.now() - 3 * 24 * 60 * 60000 + 700000) },
                ],
            },
            {
                student: student2._id,
                items: [
                    { menuItem: item3._id, name: item3.name, price: item3.price, quantity: 2, subtotal: item3.price * 2 },
                ],
                total: item3.price * 2,
                dineOption: 'Parcel',
                status: 'Completed',
                pin: 'MIST-7721',
                statusHistory: [
                    { status: 'Pending', time: new Date(Date.now() - 2 * 24 * 60 * 60000) },
                    { status: 'Completed', time: new Date(Date.now() - 2 * 24 * 60 * 60000 + 600000) },
                ],
            },
        ];

        for (const orderData of pastOrders) {
            const order = await Order.create(orderData);
            console.log(`   ✓ Order #${order.orderId} — ${order.status} — ৳${order.total}`);
        }

        // Active order for student1
        const activeOrder = await Order.create({
            student: student1._id,
            items: [
                { menuItem: item4._id, name: item4.name, price: item4.price, quantity: 1, subtotal: item4.price },
            ],
            total: item4.price,
            dineOption: 'Dine In',
            status: 'Preparing',
            pin: 'MIST-3366',
            statusHistory: [
                { status: 'Pending', time: new Date(Date.now() - 10 * 60000) },
                { status: 'Accepted', time: new Date(Date.now() - 8 * 60000) },
                { status: 'Preparing', time: new Date(Date.now() - 6 * 60000) },
            ],
        });
        console.log(`   ✓ Active Order #${activeOrder.orderId} — Preparing — ৳${activeOrder.total}`);

        // ── Create Sample Transactions ────────────────────────────
        console.log('\n💰 Seeding transactions...');
        await Transaction.create([
            {
                user: student1._id,
                type: 'Initial',
                description: 'Initial card balance set',
                amount: 500.00,
                postBalance: 500.00,
            },
            {
                user: student2._id,
                type: 'Initial',
                description: 'Initial card balance set',
                amount: 750.00,
                postBalance: 750.00,
            },
        ]);
        console.log('   ✓ Initial transactions created');

        // ── Create Sample Recharge Requests ───────────────────────
        console.log('\n💳 Seeding recharge requests...');
        const admin = createdUsers.find(u => u.userId === 'ADM-0000');

        await RechargeRequest.create([
            {
                user: student1._id,
                method: 'bKash',
                amount: 1000,
                txid: '99M8N2XQ1',
                status: 'Approved',
                reviewedBy: admin._id,
                reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60000),
            },
            {
                user: student2._id,
                method: 'Nagad',
                amount: 500,
                txid: 'AH87B9JK2',
                status: 'Pending',
            },
            {
                user: createdUsers.find(u => u.userId === 'FAC-0000')._id,
                method: 'bKash',
                amount: 2500,
                txid: 'BK772L1X0Y',
                status: 'Pending',
            },
            {
                user: student1._id,
                method: 'bKash',
                amount: 200,
                txid: '76ZZ2LP45',
                status: 'Declined',
                reviewedBy: admin._id,
                reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60000),
                adminNote: 'Transaction ID could not be verified.',
            },
        ]);
        console.log('   ✓ Recharge requests created (1 Approved, 2 Pending, 1 Declined)');

        // ── Create Sample Verifications ───────────────────────────
        console.log('\n✅ Seeding verifications...');
        const pendingUser = createdUsers.find(u => u.userId === '202114001');
        await Verification.create([
            {
                user: student1._id,
                name: student1.name,
                userId: student1.userId,
                role: student1.role,
                email: student1.email,
                department: student1.department,
                status: 'Approved',
                reviewedBy: admin._id,
                reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60000),
            },
            {
                user: pendingUser._id,
                name: pendingUser.name,
                userId: pendingUser.userId,
                role: pendingUser.role,
                email: pendingUser.email,
                department: pendingUser.department,
                status: 'Pending',
            },
        ]);
        console.log('   ✓ Verifications created');

        // ── Create Welcome Notifications ──────────────────────────
        console.log('\n🔔 Seeding notifications...');
        const studentUsers = createdUsers.filter(u => ['student', 'faculty'].includes(u.role));
        for (const u of studentUsers) {
            await Notification.create({
                user: u._id,
                title: 'Welcome to CampusPay!',
                message: 'Enjoy digital cashless dining at MIST Cafeteria. Browse the menu and place your first order!',
                type: 'system',
                isRead: false,
            });
        }
        console.log('   ✓ Welcome notifications created');

        // ── Set favorites for student1 ────────────────────────────
        const favItems = createdMenuItems.filter(m => ['Fried Rice', 'MIST Cold Coffee'].includes(m.name));
        await User.findByIdAndUpdate(student1._id, {
            favorites: favItems.map(m => m._id),
        });

        // ── Summary ───────────────────────────────────────────────
        console.log('\n╔══════════════════════════════════════════════╗');
        console.log('║          🌱 SEED COMPLETE!                    ║');
        console.log('╠══════════════════════════════════════════════╣');
        console.log(`║  Users      : ${createdUsers.length} accounts created               ║`);
        console.log(`║  Menu Items : ${createdMenuItems.length} items created              ║`);
        console.log(`║  Orders     : 3 sample orders                  ║`);
        console.log(`║  Recharges  : 4 requests seeded                ║`);
        console.log('╠══════════════════════════════════════════════╣');
        console.log('║  DEMO CREDENTIALS (all passwords: 1234)       ║');
        console.log('║  Student  : 202314033  /  ajmain@mist.ac.bd   ║');
        console.log('║  Faculty  : FAC-0000   /  habib@mist.ac.bd    ║');
        console.log('║  Staff    : ST-0000    /  staff@mist.ac.bd    ║');
        console.log('║  Admin    : ADM-0000   /  admin@mist.ac.bd    ║');
        console.log('╚══════════════════════════════════════════════╝\n');

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Seeding failed:', err.message);
        console.error(err.stack);
        await mongoose.connection.close();
        process.exit(1);
    }
}

seed();
