const express = require('express');
const router = express.Router();
const { getAuctionAdvice } = require('../utils/aiAssistant');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const { protect } = require('../middlewares/authMiddleware');

router.get('/advice/:id', protect, async (req, res) => {
    try {
        const auction = await Auction.findById(req.params.id);
        const bids = await Bid.find({ auctionId: req.params.id }).sort({ price: 1 }).limit(10).populate('bidderId', 'name');
        const advice = await getAuctionAdvice(auction, bids);
        res.json({ advice });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
