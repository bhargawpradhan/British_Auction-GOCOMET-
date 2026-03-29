const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../utils/payment');
const Auction = require('../models/Auction');
const { protect } = require('../middlewares/authMiddleware');

router.post('/create-order', protect, async (req, res) => {
    const { auctionId } = req.body;
    try {
        const auction = await Auction.findById(auctionId);
        if (!auction || auction.status !== 'closed') {
            return res.status(400).json({ message: 'Auction is not closed yet' });
        }
        if (auction.winner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the winner can pay' });
        }

        const order = await createOrder(auction.currentL1, 'INR', `receipt_${auctionId}`);
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/verify-payment', protect, async (req, res) => {
    const { orderId, paymentId, signature, auctionId } = req.body;
    try {
        const isValid = verifyPayment(orderId, paymentId, signature);
        if (isValid) {
            const auction = await Auction.findByIdAndUpdate(auctionId, { status: 'paid' }, { new: true });
            res.json({ success: true, auction });
        } else {
            res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
