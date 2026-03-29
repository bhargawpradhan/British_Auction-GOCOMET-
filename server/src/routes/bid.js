const express = require('express');
const router = express.Router();
const { placeBid, getBidsByAuction } = require('../controllers/bidController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/', protect, authorize('bidder'), placeBid);
router.get('/:auctionId', protect, getBidsByAuction);

module.exports = router;
