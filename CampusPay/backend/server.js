// ─── Environment Setup ────────────────────────────────────────────
require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// ─── Database ─────────────────────────────────────────────────────
const connectDB = require('./config/db');

// ─── Utilities ────────────────────────────────────────────────────
const { initSocket } = require('./utils/socket');

// ─── Middleware ───────────────────────────────────────────────────
const { errorHandler, notFound } = require('./middleware/errorHandler');

// ─── Routes ───────────────────────────────────────────────────────
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const menuRoutes = require('./routes/menu.routes');
const orderRoutes = require('./routes/order.routes');
const rechargeRoutes = require('./routes/recharge.routes');
const adminRoutes = require('./routes/admin.routes');
const staffRoutes = require('./routes/staff.routes');

// ─── App Init ─────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// ─── CORS Configuration ───────────────────────────────────────────
app.use(cors({
    origin: true, // Dynamically allow request origin (Live Server, file://, localhost)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Security Headers (Helmet) ────────────────────────────────────
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
}));

// ─── HTTP Logging ─────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// ─── Body Parser ──────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static File Serving (Uploads) ───────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API Health Check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'CampusPay API is running.',
        version: '2.4.0',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
    });
});

// ─── API Routes ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/recharge', rechargeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);

// ─── API Documentation Route ──────────────────────────────────────
app.get('/api', (req, res) => {
    res.json({
        success: true,
        name: 'CampusPay REST API',
        version: '2.4.0',
        description: 'MIST University Cafeteria Management System API',
        endpoints: {
            auth: {
                'POST /api/auth/login': 'Login with userId and password',
                'POST /api/auth/signup': 'Register new user',
                'POST /api/auth/logout': 'Logout (JWT)',
                'GET  /api/auth/me': 'Get current user profile',
            },
            users: {
                'GET  /api/users/me': 'Get own profile',
                'PUT  /api/users/me': 'Update profile',
                'PUT  /api/users/me/password': 'Change password',
                'GET  /api/users/me/balance': 'Get wallet balance',
                'GET  /api/users/me/transactions': 'Transaction history',
                'GET  /api/users/me/notifications': 'Notifications',
                'PUT  /api/users/me/notifications/read': 'Mark all read',
                'GET  /api/users/me/favorites': 'Favorites list',
                'POST /api/users/me/favorites/:menuId': 'Toggle favorite',
            },
            menu: {
                'GET  /api/menu': 'Get all menu items (filter/search)',
                'GET  /api/menu/categories': 'Get categories',
                'GET  /api/menu/:id': 'Get single item',
                'POST /api/menu': '[Staff/Admin] Create item',
                'PUT  /api/menu/:id': '[Staff/Admin] Update item',
                'DELETE /api/menu/:id': '[Admin] Delete item',
                'PUT  /api/menu/:id/stock': '[Staff/Admin] Update stock',
            },
            orders: {
                'POST /api/orders': 'Place new order',
                'GET  /api/orders': 'Order history',
                'GET  /api/orders/active': 'Active order status',
                'GET  /api/orders/:id': 'Order details',
                'POST /api/orders/:id/cancel': 'Cancel pending order',
                'GET  /api/orders/:id/qr': 'Get QR receipt',
            },
            recharge: {
                'POST /api/recharge': 'Submit recharge request',
                'GET  /api/recharge': 'Own recharge history',
                'GET  /api/recharge/admin': '[Admin] All requests',
                'PUT  /api/recharge/admin/:id/approve': '[Admin] Approve',
                'PUT  /api/recharge/admin/:id/decline': '[Admin] Decline',
            },
            admin: {
                'GET  /api/admin/dashboard': 'Dashboard stats',
                'GET  /api/admin/users': 'All users',
                'PUT  /api/admin/users/:id/balance': 'Edit balance',
                'PUT  /api/admin/users/:id/status': 'Suspend/Activate',
                'DELETE /api/admin/users/:id': 'Delete user',
                'GET  /api/admin/verifications': 'Verification queue',
                'PUT  /api/admin/verifications/:id/approve': 'Approve user',
                'PUT  /api/admin/verifications/:id/reject': 'Reject user',
            },
            staff: {
                'GET  /api/staff/orders': 'Kitchen order queue',
                'PUT  /api/staff/orders/:id/status': 'Update order status',
                'PUT  /api/staff/orders/:id/pin': 'Toggle pin',
                'POST /api/staff/orders/:id/note': 'Add staff note',
                'GET  /api/staff/menu': 'View menu',
                'PUT  /api/staff/menu/:id': 'Update stock/status',
                'GET  /api/staff/kitchen/status': 'Kitchen open/closed',
                'PUT  /api/staff/kitchen/status': 'Toggle kitchen',
                'POST /api/staff/scan-qr': 'Verify QR code',
            },
        },
        socketEvents: {
            'order:new': 'Staff: New order placed',
            'order:status-changed': 'Student: Order status updated',
            'order:cancelled': 'Both: Order cancelled',
            'recharge:approved': 'Student: Wallet credited',
            'recharge:declined': 'Student: Request declined',
            'kitchen:status-changed': 'All: Kitchen open/close',
            'recharge:new-request': 'Admin: New recharge request',
            'verification:new-request': 'Admin: New user registration',
        },
    });
});

// ─── 404 + Error Handler ──────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Socket.IO Setup ──────────────────────────────────────────────
const io = new Server(server, {
    cors: {
        origin: true,
        methods: ['GET', 'POST'],
        credentials: true,
    },
    pingTimeout: 60000,
});

// Initialize socket utility
initSocket(io);

io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Client joins their personal room and role-specific rooms
    // Data: { userId, role, mongoUserId }
    socket.on('join', (data) => {
        const { userId, role, mongoUserId } = data || {};

        // Personal user room (used to send order status updates to specific student)
        if (mongoUserId || userId) {
            const roomId = mongoUserId || userId;
            socket.join(`user-${roomId}`);
            console.log(`   👤 User ${userId} joined personal room user-${roomId}`);
        }

        // Kitchen staff room — receives all new orders and must-update events
        if (role === 'staff' || role === 'admin') {
            socket.join('kitchen-room');
            console.log(`   🍳 ${role} socket joined kitchen-room (${socket.id})`);
        }

        // Admin room — receives management events
        if (role === 'admin') {
            socket.join('admin-room');
            console.log(`   🔑 Admin socket joined admin-room`);
        }

        // Acknowledge join
        socket.emit('joined', {
            userId,
            role,
            rooms: socket.rooms ? [...socket.rooms] : [],
        });
    });

    socket.on('disconnect', (reason) => {
        console.log(`🔌 Socket disconnected: ${socket.id} — ${reason}`);
    });

    // Client can emit ping to test connection
    socket.on('ping-server', () => {
        socket.emit('pong-server', { time: new Date().toISOString() });
    });
});

// ─── Start Server ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    server.listen(PORT, () => {
        console.log('\n╔════════════════════════════════════════════╗');
        console.log(`║   🚀 CampusPay Backend Started             ║`);
        console.log(`║   Port    : ${PORT}                           ║`);
        console.log(`║   Mode    : ${process.env.NODE_ENV?.padEnd(12)} ║`);
        console.log(`║   API     : http://localhost:${PORT}/api       ║`);
        console.log(`║   Health  : http://localhost:${PORT}/api/health ║`);
        console.log('╚════════════════════════════════════════════╝\n');
    });
};

startServer();

// ─── Graceful Shutdown ────────────────────────────────────────────
process.on('SIGTERM', () => {
    console.log('📴 SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed.');
        process.exit(0);
    });
});

process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err.message);
    server.close(() => process.exit(1));
});
