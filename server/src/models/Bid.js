const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
    auctionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction', required: true, index: true },
    bidderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Core price – used for ranking (sum of all charges)
    price: { type: Number, required: true, index: true },

    // RFQ Quote breakdown
    carrierName: { type: String, default: '' },
    freightCharges: { type: Number, default: 0 },
    originCharges: { type: Number, default: 0 },
    destinationCharges: { type: Number, default: 0 },
    transitTime: { type: String, default: '' },       // e.g. "3-5 days"
    validity: { type: String, default: '' },           // e.g. "30 days"

    rank: { type: Number },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Bid', bidSchema);
