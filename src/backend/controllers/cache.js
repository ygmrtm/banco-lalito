const redis = require('redis');
const dotenv = require('dotenv');

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

let client;
let connectionPromise;

async function initializeRedis() {
    if (client?.isOpen) {
        return client;
    }

    if (!client) {
        client = redis.createClient({
            url: redisUrl,
        });
        client.on('error', (err) => {
            console.error(`Redis error (${redisUrl}):`, err);
        });
    }

    if (!connectionPromise) {
        connectionPromise = client
            .connect()
            .then(() => {
                console.log('Connected to Redis ☁️');
                return client;
            })
            .catch((err) => {
                console.error('Failed to connect to Redis ☁️', err);
                throw err;
            })
            .finally(() => {
                connectionPromise = null;
            });
    }

    await connectionPromise;
    return client;
}

async function getFromCache(key) {
    await initializeRedis();
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
}

async function setToCache(key, value, expiration = 3600) {
    await initializeRedis();
    await client.set(key, JSON.stringify(value), { EX: expiration });
}

module.exports = { initializeRedis, getFromCache, setToCache };