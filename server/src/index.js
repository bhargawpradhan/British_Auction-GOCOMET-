require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const logger = require('./utils/logger');
const rateLimit = require('express-rate-limit');

// Route Imports
const authRoutes = require('./routes/auth');
const auctionRoutes = require('./routes/auction');
const bidRoutes = require('./routes/bid');
const aiRoutes = require('./routes/ai');
const paymentRoutes = require('./routes/paymentRoutes');
const eventRoutes = require('./routes/eventRoutes');

const app = express();
const server = http.createServer(app);

// Connect to Database
connectDB();

// Initialize Middlewares
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'System alert: Rate limit exceeded. Protocol security engaged.',
});

app.use(limiter);
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize Socket.io
initSocket(server);

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/events', eventRoutes);

// Monitoring Route
app.get('/api/metrics', async (req, res) => {
    try {
        const Auction = require('./models/Auction');
        const count = await Auction.countDocuments();
        const activeCount = await Auction.countDocuments({ status: 'active' });
        const memory = process.memoryUsage();
        
        res.json({
            status: 'Operational',
            uptime: `${Math.floor(process.uptime())}s`,
            telemetry: {
                total_auctions: count,
                active_auctions: activeCount,
                heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
                heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)} MB`,
                rss: `${Math.round(memory.rss / 1024 / 1024)} MB`
            },
            system: {
                platform: process.platform,
                nodeVersion: process.version,
                cpuUsage: process.cpuUsage()
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Base Route
app.get('/', (req, res) => {
    res.send('AEON Auction API is running...');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});
