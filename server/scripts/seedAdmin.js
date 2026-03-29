/**
 * AEON Admin Seeder
 * Creates the unique admin account: bhargawpradhan@gmail.com
 * Run: node server/scripts/seedAdmin.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');

const seed = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI not found in .env');
        await mongoose.connect(uri);
        console.log('[SEED] Connected to MongoDB Atlas...');

        const adminEmail = 'bhargawpradhan@gmail.com';
        const existing = await User.findOne({ email: adminEmail });

        if (existing) {
            // Update role to admin in case it was created differently
            existing.role = 'admin';
            await existing.save();
            console.log(`[SEED] Admin account already exists — role confirmed as 'admin'.`);
        } else {
            await User.create({
                name: 'Bhargaw Pradhan',
                email: adminEmail,
                password: 'Vicky@1234',
                role: 'admin',
            });
            console.log(`[SEED] ✅ Admin account created: ${adminEmail}`);
        }

        console.log('[SEED] Done.');
        process.exit(0);
    } catch (err) {
        console.error('[SEED] Error:', err.message);
        process.exit(1);
    }
};

seed();
