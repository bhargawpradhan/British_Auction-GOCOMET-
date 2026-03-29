const { Queue, Worker } = require('bullmq');
const redis = require('../utils/redis');
const logger = require('../utils/logger');
const Auction = require('../models/Auction');
const { getIO } = require('./socket');

const auctionQueue = new Queue('auctionQueue', { connection: redis });
auctionQueue.on('error', (err) => logger.warn(`BullMQ Queue Error: ${err.message}`));

const auctionWorker = new Worker('auctionQueue', async (job) => {
    const { auctionId } = job.data;
    logger.info(`[BullMQ] Processing close pulse for: ${auctionId}`);

    const auction = await Auction.findById(auctionId);
    if (!auction) return;
    
    // If already closed or paid, skip
    if (['closed', 'paid'].includes(auction.status)) return;

    // Check if it's already force_closed (by bidController), or if we should close it normally
    const isForced = auction.status === 'force_closed';
    
    if (!isForced) {
        auction.status = 'closed';
        auction.winner = auction.l1Bidder;
    }
    
    await auction.save();

    const io = getIO();
    io.to(auctionId).emit('auction_closed', {
        auctionId,
        status: auction.status,
        winner: auction.winner,
        finalPrice: auction.currentL1,
    });

    logger.info(`[BullMQ] Auction ${auctionId} finalized as ${auction.status}.`);
}, { connection: redis });
auctionWorker.on('error', (err) => logger.warn(`BullMQ Worker Error: ${err.message}`));

const scheduleAuctionClose = async (auctionId, endTime) => {
    const delay = new Date(endTime).getTime() - Date.now();
    if (delay > 0) {
        await auctionQueue.add('closeAuction', { auctionId }, { delay, jobId: auctionId, removeOnComplete: true });
        logger.info(`Scheduled auction close for ${auctionId} in ${delay}ms`);
    }
};

module.exports = { auctionQueue, scheduleAuctionClose };
