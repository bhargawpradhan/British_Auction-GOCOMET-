require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Auction = require('../models/Auction');
const logger = require('./logger');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aeon');
        logger.info('Database Connected for Seeding');

        // Clear existing data
        await User.deleteMany({});
        await Auction.deleteMany({});

        // Create Users
        const admin = await User.create({
            name: 'System Admin',
            email: 'admin@aeon.com',
            password: 'password123',
            role: 'admin'
        });

        const bidder1 = await User.create({
            name: 'Delta Trader',
            email: 'bidder1@aeon.com',
            password: 'password123',
            role: 'bidder'
        });

        const bidder2 = await User.create({
            name: 'Alpha Logistics',
            email: 'bidder2@aeon.com',
            password: 'password123',
            role: 'bidder'
        });

        logger.info('Users Seeded: admin@aeon.com, bidder1@aeon.com, bidder2@aeon.com (pwd: password123)');

        // Create an Auction
        const now = new Date();
        const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

        await Auction.create({
            title: 'High-Grade Steel Procurement RFQ',
            description: 'Tender for 500 tons of industrial grade structural steel. Grade-A quality certification required.',
            basePrice: 5000000,
            currentL1: 5000000,
            minIncrement: 5000,
            startTime: now,
            endTime: endTime,
            status: 'active'
        });

        logger.info('Sample Auction Seeded');
        process.exit(0);
    } catch (error) {
        logger.error(`Seeding error: ${error.message}`);
        process.exit(1);
    }
};

seedData();
