const Razorpay = require('razorpay');
const crypto = require('crypto');
const logger = require('./logger');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'placeholder_key_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_key_secret',
});

const createOrder = async (amount, currency = 'INR', receipt) => {
    try {
        const options = {
            amount: amount * 100, // in paise
            currency,
            receipt,
        };
        const order = await razorpay.orders.create(options);
        return order;
    } catch (error) {
        logger.error(`Razorpay Error: ${error.message}`);
        throw error;
    }
};

const verifyPayment = (orderId, paymentId, signature) => {
    const text = orderId + '|' + paymentId;
    const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');
    return generated_signature === signature;
};

module.exports = { createOrder, verifyPayment };
