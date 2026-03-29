/**
 * AEON Role Seeder
 * Seeds all test accounts for all roles:
 *   - Admin:    bhargawpradhan@gmail.com / Vicky@1234
 *   - Bidder:   bidder@test.com / Test@1234
 *   - Maker:    maker@test.com  / Test@1234
 * Run: node server/scripts/seedRoles.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');

const accounts = [
    { name: 'Bhargaw Pradhan', email: 'bhargawpradhan@gmail.com', password: 'Vicky@1234', role: 'admin' },
    { name: 'Test Bidder',     email: 'bidder@test.com',          password: 'Test@1234',  role: 'bidder' },
    { name: 'Test Maker',      email: 'maker@test.com',           password: 'Test@1234',  role: 'maker' },
];

const seed = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI not found in .env');
        await mongoose.connect(uri);
        console.log('[SEED] Connected to MongoDB Atlas...\n');

        for (const acc of accounts) {
            const existing = await User.findOne({ email: acc.email });
            if (existing) {
                existing.role = acc.role;
                // Only update password if it's a bcrypt hash (not already hashed)
                await existing.save();
                console.log(`[SEED] ✓ ${acc.role.toUpperCase().padEnd(7)} → ${acc.email} (already exists, role confirmed)`);
            } else {
                await User.create(acc);
                console.log(`[SEED] ✅ ${acc.role.toUpperCase().padEnd(7)} → ${acc.email} created`);
            }
        }

        console.log('\n[SEED] All accounts ready.');
        console.log('[SEED] ─────────────────────────────────────────');
        console.log('[SEED] Admin:   bhargawpradhan@gmail.com / Vicky@1234');
        console.log('[SEED] Bidder:  bidder@test.com          / Test@1234');
        console.log('[SEED] Maker:   maker@test.com           / Test@1234');
        console.log('[SEED] ─────────────────────────────────────────');
        process.exit(0);
    } catch (err) {
        console.error('[SEED] Error:', err.message);
        process.exit(1);
    }
};

seed();
