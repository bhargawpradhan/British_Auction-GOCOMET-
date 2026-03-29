const Redis = require('ioredis');
const logger = require('./logger');

const redisConfig = process.env.REDIS_URL 
    ? process.env.REDIS_URL 
    : {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
        maxRetriesPerRequest: null,
        enableOfflineQueue: false
    };

const redis = new Redis(redisConfig);

redis.on('error', (err) => {
    logger.warn(`Redis Error: ${err.message}. System will fallback to Database.`, { stack: err.stack });
});

module.exports = redis;
