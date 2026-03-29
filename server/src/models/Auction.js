const mongoose = require('mongoose');

const britishConfigSchema = new mongoose.Schema({
    triggerWindow: { type: Number, default: 10 },       // minutes before close to watch
    extensionDuration: { type: Number, default: 5 },    // minutes to extend if triggered
    extensionTrigger: {
        type: String,
        enum: ['bid_received', 'rank_change', 'l1_rank_change'],
        default: 'bid_received'
    }
}, { _id: false });

const extensionLogSchema = new mongoose.Schema({
    extendedAt: { type: Date, default: Date.now },
    newEndTime: { type: Date },
    reason: { type: String },
    triggeredBy: { type: String }   // bidder name or ID
}, { _id: false });

const auctionSchema = new mongoose.Schema({
    // Core RFQ fields
    title: { type: String, required: true },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true },
    currentL1: { type: Number, default: 0 },
    l1Bidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    minIncrement: { type: Number, required: true },

    // Scheduling
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    forcedCloseTime: { type: Date },       // Hard cap – auction NEVER extends past this
    serviceDate: { type: Date },           // Pickup / Service Date

    // British Auction configuration
    britishConfig: { type: britishConfigSchema, default: () => ({}) },
    extensionCount: { type: Number, default: 0 },
    extensionLog: { type: [extensionLogSchema], default: [] },

    // Status
    status: {
        type: String,
        enum: ['pending', 'active', 'closed', 'force_closed', 'paid'],
        default: 'pending'
    },
    currency: {
        type: String,
        enum: ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AED'],
        default: 'INR'
    },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Auction', auctionSchema);
