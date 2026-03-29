const Razorpay = require('razorpay');
const crypto = require('crypto');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const logger = require('../utils/logger');

const getRazorpayInstance = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_replaceMeInEnv',
        key_secret: process.env.RAZORPAY_KEY_SECRET || 'replaceMeInEnvSecret'
    });
};

exports.createOrder = async (req, res) => {
    try {
        const { auctionId } = req.body;
        const requesterId = req.user._id.toString();

        const auction = await Auction.findById(auctionId);
        if (!auction) {
            return res.status(404).json({ message: 'Auction not found' });
        }

        // Auction must be closed before payment
        const payableStatuses = ['closed', 'force_closed'];
        if (!payableStatuses.includes(auction.status)) {
            return res.status(400).json({ 
                message: `Payment not allowed: auction status is '${auction.status}'. Auction must be closed first.` 
            });
        }

        // Find the L1 (rank=1 = lowest bid = winner) bid for this auction
        const l1Bid = await Bid.findOne({ auctionId, rank: 1 }).populate('bidderId', 'name email');
        
        logger.info(`[PAYMENT] Request from user ${requesterId} for auction ${auctionId}`);

        if (!l1Bid) {
            // No bids placed — fall back to auction.l1Bidder check
            const l1BidderIdRaw = auction.l1Bidder ? auction.l1Bidder.toString() : null;
            const winnerIdRaw = auction.winner ? auction.winner.toString() : null;
            logger.info(`[PAYMENT] No ranked bids found. Falling back — l1Bidder: ${l1BidderIdRaw}, winner: ${winnerIdRaw}`);
            
            if (requesterId !== l1BidderIdRaw && requesterId !== winnerIdRaw) {
                return res.status(403).json({ message: 'Access denied: Only the auction winner can process payment.' });
            }
        } else {
            // Primary authoritative check: rank=1 bid's bidder = winner
            const l1BidderIdStr = l1Bid.bidderId?._id?.toString() || l1Bid.bidderId?.toString();
            logger.info(`[PAYMENT] L1 bid found — bidderId: ${l1BidderIdStr}, requester: ${requesterId}`);
            
            if (requesterId !== l1BidderIdStr) {
                return res.status(403).json({ message: 'Access denied: Only the L1 winner can process this payment.' });
            }
        }

        // Persist winner if not already set (self-healing)
        if (!auction.winner && auction.l1Bidder) {
            auction.winner = auction.l1Bidder;
            await auction.save();
        }

        // Settlement amount = the actual winning bid price (rank=1 bid's price)
        // Fall back to auction.currentL1 if no ranked bid found
        const winningAmount = l1Bid ? l1Bid.price : (auction.currentL1 || auction.basePrice);
        
        if (!winningAmount || winningAmount <= 0) {
            return res.status(400).json({ message: 'Invalid settlement amount: winning bid price is zero.' });
        }

        const options = {
            amount: Math.round(winningAmount * 100), // Razorpay uses smallest currency unit
            currency: auction.currency || 'INR',
            receipt: `rcpt_${auctionId.toString().slice(-8)}_${Date.now()}`.slice(0, 40),
            notes: {
                auctionId: auctionId.toString(),
                userId: requesterId,
                auctionTitle: auction.title,
                winningBid: winningAmount.toString()
            }
        };

        const rzp = getRazorpayInstance();
        const order = await rzp.orders.create(options);

        logger.info(`[PAYMENT] ✅ Razorpay order ${order.id} created for ₹${winningAmount} — auction ${auctionId}`);
        res.status(200).json(order);

    } catch (err) {
        logger.error(`[PAYMENT] Error creating Razorpay order: ${err.message}`);
        res.status(500).json({ message: 'Failed to create payment order', error: err.message });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const {
            orderId,
            paymentId,
            signature,
            auctionId
        } = req.body;

        const body = orderId + "|" + paymentId;

        const secret = process.env.RAZORPAY_KEY_SECRET || 'replaceMeInEnvSecret';
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body.toString())
            .digest('hex');

        // Note: checking signature or skipping if signature is missing because of local testing
        if (expectedSignature === signature || (process.env.NODE_ENV === 'development' && !signature)) {
            // Update the auction status
            const auction = await Auction.findById(auctionId);
            if (!auction) {
                return res.status(404).json({ message: 'Auction not found during verification' });
            }

            auction.status = 'paid';
            await auction.save();

            logger.info(`Auction ${auctionId} marked as PAID via Razorpay Payment: ${paymentId}`);

            res.status(200).json({ success: true, message: 'Payment verified successfully.' });
        } else {
            logger.warn(`Signature verification failed for auction ${auctionId}`);
            res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (err) {
        logger.error(`Error verifying Razorpay payment: ${err.message}`);
        res.status(500).json({ message: 'Failed to verify payment', error: err.message });
    }
};
