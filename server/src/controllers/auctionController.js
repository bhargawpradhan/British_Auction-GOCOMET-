const Auction = require('../models/Auction');
const { scheduleAuctionClose } = require('../config/bullmq');
const logger = require('../utils/logger');

exports.createAuction = async (req, res) => {
    const {
        title, description, basePrice, minIncrement,
        startTime, endTime, forcedCloseTime, serviceDate,
        britishConfig
    } = req.body;

    try {
        // Validation: forced close must be strictly after bid close time
        if (forcedCloseTime && new Date(forcedCloseTime) <= new Date(endTime)) {
            return res.status(400).json({ message: 'Forced Close Time must be later than Bid Close Time.' });
        }
        if (new Date(endTime) <= new Date(startTime)) {
            return res.status(400).json({ message: 'Bid Close Time must be after Bid Start Time.' });
        }

        const now = new Date();
        const bidStart = new Date(startTime);
        
        // Auto-activate if start time is in the past or right now
        const initialStatus = bidStart <= now ? 'active' : 'pending';

        const auction = await Auction.create({
            title,
            description,
            basePrice: Number(basePrice),
            // L1 starts as null — no valid quote yet. First quote is always accepted if < basePrice.
            currentL1: Number(basePrice),
            minIncrement: Number(minIncrement),
            startTime: bidStart,
            endTime: new Date(endTime),
            forcedCloseTime: forcedCloseTime ? new Date(forcedCloseTime) : null,
            serviceDate: serviceDate ? new Date(serviceDate) : null,
            britishConfig: britishConfig || { triggerWindow: 10, extensionDuration: 5, extensionTrigger: 'bid_received' },
            status: initialStatus,
        });

        // Schedule auto-close via BullMQ (fire-and-forget, resilient to Redis absence)
        scheduleAuctionClose(auction._id.toString(), endTime).catch(err => {
            logger.error(`BullMQ dispatch failed silently: ${err.message}`);
        });

        logger.info(`Auction "${title}" created with status: ${initialStatus}`);
        res.status(201).json(auction);
    } catch (error) {
        logger.error(`Error creating auction: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

exports.getAuctions = async (req, res) => {
    try {
        const now = new Date();
        // Catch-up 1: Auto-activate pending auctions whose startTime has passed
        await Auction.updateMany(
            { status: 'pending', startTime: { $lte: now } },
            { $set: { status: 'active' } }
        );
        // Catch-up 2: Auto-close active auctions whose endTime has passed (safety net for BullMQ)
        // Also assign winner = l1Bidder on close
        const expiredAuctions = await Auction.find({ status: 'active', endTime: { $lte: now } });
        for (const a of expiredAuctions) {
            a.status = 'closed';
            if (a.l1Bidder && !a.winner) a.winner = a.l1Bidder;
            await a.save();
        }
        
        const auctions = await Auction.find()
            .populate('l1Bidder', 'name email')
            .sort({ createdAt: -1 });
        res.json(auctions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAuctionById = async (req, res) => {
    try {
        const auction = await Auction.findById(req.params.id)
            .populate('l1Bidder', 'name email')
            .populate('winner', 'name email');

        if (!auction) return res.status(404).json({ message: 'Auction not found' });

        // Auto-activate on fetch if startTime has passed
        const now = new Date();
        if (auction.status === 'pending' && new Date(auction.startTime) <= now) {
            auction.status = 'active';
            await auction.save();
        }
        
        // Auto-close on fetch if endTime has passed (safety net)
        if ((auction.status === 'active' || auction.status === 'pending') && new Date(auction.endTime) <= now) {
            auction.status = 'closed';
            if (auction.l1Bidder && !auction.winner) auction.winner = auction.l1Bidder;
            await auction.save();
        }

        res.json(auction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateAuctionStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const auction = await Auction.findByIdAndUpdate(id, { status }, { new: true });
        res.json(auction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
