const Bid = require('../models/Bid');
const Auction = require('../models/Auction');
const { getIO } = require('../config/socket');
const logger = require('../utils/logger');
const { auctionQueue } = require('../config/bullmq');

const redis = require('../utils/redis');

exports.placeBid = async (req, res) => {
    const {
        auctionId,
        carrierName = '',
        freightCharges = 0,
        originCharges = 0,
        destinationCharges = 0,
        transitTime = '',
        validity = ''
    } = req.body;

    const bidderId = req.user._id;

    // Only bidders can place bids
    if (req.user.role !== 'bidder') {
        return res.status(403).json({ message: 'Access denied: Only bidders can place bids.' });
    }

    // Compute totalPrice from charge breakdown
    const totalPrice = Number(freightCharges) + Number(originCharges) + Number(destinationCharges);

    if (totalPrice <= 0) {
        return res.status(400).json({ message: 'Quote rejected: Total price must be greater than zero.' });
    }

    try {
        const auction = await Auction.findById(auctionId);
        if (!auction) return res.status(404).json({ message: 'Protocol not found' });

        if (auction.status !== 'active') {
            return res.status(400).json({ message: 'Auction is not active.' });
        }

        // Forced close time enforcement
        if (auction.forcedCloseTime && new Date() >= new Date(auction.forcedCloseTime)) {
            auction.status = 'force_closed';
            await auction.save();
            return res.status(400).json({ message: 'FORCED_CLOSE: Auction has passed its hard deadline.' });
        }

        // Fetch current L1 from cache or DB
        const cacheKey = `auction:${auctionId}:l1`;
        let currentL1 = null;
        try {
            currentL1 = await redis.get(cacheKey);
        } catch (_) {}

        if (!currentL1) currentL1 = auction.currentL1;
        currentL1 = Number(currentL1);

        // Check if any bids exist already
        const existingBidCount = await Bid.countDocuments({ auctionId });
        const hasPriorBids = existingBidCount > 0;

        // Reverse auction: lower price wins.
        // First bid: must be <= basePrice.
        // Subsequent bids: must strictly beat (be lower than) current L1.
        if (hasPriorBids) {
            if (totalPrice >= currentL1) {
                return res.status(400).json({ message: `Quote rejected: Your total (₹${totalPrice.toLocaleString()}) must be LOWER than current L1 (₹${currentL1.toLocaleString()}).` });
            }
            if ((currentL1 - totalPrice) < auction.minIncrement) {
                return res.status(400).json({ message: `Min undercut step not met. Must undercut by at least ₹${auction.minIncrement.toLocaleString()}.` });
            }
        } else {
            // First bid: must be at or below base price
            if (totalPrice > auction.basePrice) {
                return res.status(400).json({ message: `First quote must be at or below base valuation (₹${auction.basePrice.toLocaleString()}).` });
            }
        }

        // Get all existing bids to compute ranking
        const previousBids = await Bid.find({ auctionId }).sort({ price: 1 });
        const previousL1BidderId = auction.l1Bidder?.toString();

        // Create the bid
        const bid = await Bid.create({
            auctionId,
            bidderId,
            price: totalPrice,
            carrierName,
            freightCharges: Number(freightCharges),
            originCharges: Number(originCharges),
            destinationCharges: Number(destinationCharges),
            transitTime,
            validity,
            timestamp: new Date()
        });

        // Recalculate all ranks – sort ascending (lowest total price = L1)
        const allBids = await Bid.find({ auctionId }).sort({ price: 1 });
        const updateOps = allBids.map((b, idx) =>
            Bid.findByIdAndUpdate(b._id, { rank: idx + 1 })
        );
        await Promise.all(updateOps);

        // Update auction's L1 tracking
        auction.currentL1 = totalPrice;
        auction.l1Bidder = bidderId;

        // Cache update (fire-and-forget)
        redis.set(cacheKey, totalPrice, 'EX', 3600).catch(() => {});

        // ── British Auction Extension Logic ──────────────────────────────────────
        const cfg = auction.britishConfig || {};
        const triggerWindowMs = (cfg.triggerWindow || 10) * 60 * 1000;
        const extensionMs = (cfg.extensionDuration || 5) * 60 * 1000;
        const trigger = cfg.extensionTrigger || 'bid_received';

        const timeToClose = new Date(auction.endTime).getTime() - Date.now();
        const withinWindow = timeToClose > 0 && timeToClose <= triggerWindowMs;

        let shouldExtend = false;
        let extensionReason = '';

        if (withinWindow) {
            if (trigger === 'bid_received') {
                shouldExtend = true;
                extensionReason = `BID_RECEIVED in trigger window (${cfg.triggerWindow}m)`;
            } else if (trigger === 'rank_change') {
                // Any rank shift counts — new bid always causes a shift
                shouldExtend = true;
                extensionReason = `RANK_CHANGE detected in trigger window`;
            } else if (trigger === 'l1_rank_change') {
                const l1Changed = previousL1BidderId !== bidderId.toString();
                if (l1Changed) {
                    shouldExtend = true;
                    extensionReason = `L1_RANK_CHANGE: New leader ${req.user.name}`;
                }
            }
        }

        if (shouldExtend) {
            const currentEndTime = new Date(auction.endTime).getTime();
            const newEndTime = new Date(currentEndTime + extensionMs);
            
            // Hard cap: never extend past forcedCloseTime
            let cappedEndTime = newEndTime;
            let isAtHardCap = false;

            if (auction.forcedCloseTime && newEndTime >= new Date(auction.forcedCloseTime)) {
                cappedEndTime = new Date(auction.forcedCloseTime);
                isAtHardCap = true;
                extensionReason = `HARD_CAP_REACHED: Final extension to forced close time.`;
            }

            if (cappedEndTime > new Date(auction.endTime)) {
                auction.endTime = cappedEndTime;
                auction.extensionCount = (auction.extensionCount || 0) + 1;
                
                // If we reached the hard cap via an extension, mark it for the worker
                if (isAtHardCap) {
                    auction.status = 'force_closed';
                }

                auction.extensionLog.push({
                    extendedAt: new Date(),
                    newEndTime: cappedEndTime,
                    reason: extensionReason,
                    triggeredBy: req.user.name
                });

                // Re-schedule BullMQ job for the new close time
                try {
                    // Try removing by jobId
                    await auctionQueue.remove(auctionId.toString()).catch(() => {});
                } catch (_) {}

                const delay = cappedEndTime.getTime() - Date.now();
                if (delay > 0) {
                    await auctionQueue.add('closeAuction', { auctionId }, { 
                        delay, 
                        jobId: auctionId.toString(), 
                        removeOnComplete: true,
                        removeOnFail: false
                    }).catch(err => logger.error(`[BullMQ] Extension rescheduling failed: ${err.message}`));
                }

                logger.info(`[PROTOCOL] Auction ${auctionId} extended to ${cappedEndTime.toISOString()} — ${extensionReason}`);
            }
        }

        await auction.save();

        const io = getIO();
        const room = auctionId.toString();

        // Emit new bid
        io.to(room).emit('new_bid', {
            auctionId,
            bidder: req.user.name,
            bidderId: req.user._id,
            price: totalPrice,
            carrierName,
            freightCharges,
            originCharges,
            destinationCharges,
            transitTime,
            validity,
            endTime: auction.endTime,
        });

        // Emit time extension if it happened
        if (shouldExtend) {
            io.to(room).emit('time_extension', {
                auctionId,
                newEndTime: auction.endTime,
                reason: extensionReason,
                triggeredBy: req.user.name,
                extensionCount: auction.extensionCount
            });
        }

        logger.info(`✅ Quote accepted for auction ${room} by ${req.user.name} [₹${totalPrice}]`);
        res.status(201).json({ message: 'Quote submitted successfully', bid, endTime: auction.endTime });
    } catch (error) {
        logger.error(`Error placing bid: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

exports.getBidsByAuction = async (req, res) => {
    const { auctionId } = req.params;
    try {
        const bids = await Bid.find({ auctionId })
            .populate('bidderId', 'name email')
            .sort({ price: 1, timestamp: 1 })   // sorted by lowest price first (L1 first)
            .limit(50);
        res.json(bids);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
