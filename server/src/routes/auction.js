const express = require('express');
const router = express.Router();
const { createAuction, getAuctions, getAuctionById, updateAuctionStatus } = require('../controllers/auctionController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/', protect, authorize('admin', 'maker'), createAuction);
router.get('/', protect, getAuctions);
router.get('/:id', protect, getAuctionById);
router.patch('/:id/status', protect, authorize('admin'), updateAuctionStatus);

module.exports = router;
