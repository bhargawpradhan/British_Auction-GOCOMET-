const socketio = require('socket.io');
const logger = require('../utils/logger');

let io;

const initSocket = (server) => {
    io = socketio(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        logger.info(`New client joined: ${socket.id}`);

        socket.on('join_auction', (auctionId, callback) => {
            socket.join(auctionId);
            logger.info(`Client ${socket.id} joined auction: ${auctionId}`);
            if (callback) callback({ status: 'PROTOCOL_SYNCED', room: auctionId });
        });

        socket.on('disconnect', () => {
            logger.info('Client disconnected');
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

module.exports = { initSocket, getIO };
