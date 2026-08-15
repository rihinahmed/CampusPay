const QRCode = require('qrcode');

/**
 * Generate a QR code as a base64 data URL for order receipts.
 * @param {object} orderData - Order information to encode
 * @returns {Promise<string>} Base64 encoded QR code PNG data URL
 */
const generateOrderQR = async (orderData) => {
    const payload = JSON.stringify({
        orderId: orderData.orderId,
        pin: orderData.pin,
        studentId: orderData.studentId,
        total: orderData.total,
        items: orderData.items,
        timestamp: orderData.timestamp,
        system: 'CampusPay-MIST-v2'
    });

    const options = {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.92,
        margin: 2,
        color: {
            dark: '#004c4c',   // Primary teal
            light: '#FFFFFF'
        },
        width: 300
    };

    try {
        const qrDataURL = await QRCode.toDataURL(payload, options);
        return qrDataURL;
    } catch (err) {
        console.error('QR Code generation failed:', err);
        throw new Error('Failed to generate QR code.');
    }
};

/**
 * Generate a simple verification QR code (e.g. for staff scan).
 * @param {string} value - String to encode
 * @returns {Promise<string>} Base64 QR data URL
 */
const generateSimpleQR = async (value) => {
    return await QRCode.toDataURL(value, {
        errorCorrectionLevel: 'M',
        width: 200,
        margin: 1,
        color: { dark: '#004c4c', light: '#ffffff' }
    });
};

module.exports = { generateOrderQR, generateSimpleQR };
