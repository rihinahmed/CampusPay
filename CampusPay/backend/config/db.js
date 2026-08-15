const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host} — DB: ${conn.connection.name}`);

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️  MongoDB disconnected. Reconnecting...');
        });

        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB error:', err.message);
        });

    } catch (error) {
        console.error(`❌ MongoDB Connection Failed: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
