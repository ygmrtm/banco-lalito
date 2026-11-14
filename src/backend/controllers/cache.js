const redis = require('redis');
const dotenv = require('dotenv');

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

let client;
let connectionPromise;

async function resetRedisClient() {
    const stale = client;
    client = null;
    connectionPromise = null;
    if (!stale) return;
    stale.removeAllListeners();
    try {
        await stale.disconnect();
    } catch {
        // Ignore teardown errors from a client that never connected.
    }
}

async function initializeRedis() {
    if (client?.isOpen) {
        return client;
    }

    if (!client) {
        client = redis.createClient({
            url: redisUrl,
            socket: {
                reconnectStrategy(retries) {
                    if (retries >= 3) {
                        return new Error(`Redis unavailable at ${redisUrl}`);
                    }
                    return Math.min(retries * 200, 1000);
                },
            },
        });
        client.on('error', (err) => {
            console.error(`Redis error (${redisUrl}):`, err.message || err);
        });
    }

    if (!connectionPromise) {
        connectionPromise = client
            .connect()
            .then(() => {
                console.log(`Connected to Redis ☁️ ${redisUrl}`);
                return client;
            })
            .catch(async (err) => {
                console.error('Failed to connect to Redis ☁️', err.message || err);
                await resetRedisClient();
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

async function deleteFromCache(key) {
    await initializeRedis();
    await client.del(key);
}

async function getCacheVersion(namespace) {
    await initializeRedis();
    const version = await client.get(`bnc:${namespace}:v`);
    return version || '0';
}

async function bumpCacheVersion(namespace) {
    await initializeRedis();
    const key = `bnc:${namespace}:v`;
    const version = await client.incr(key);
    await client.expire(key, 3600 * 24 * 30);
    return version;
}

module.exports = {
    initializeRedis,
    getFromCache,
    setToCache,
    deleteFromCache,
    getCacheVersion,
    bumpCacheVersion,
};