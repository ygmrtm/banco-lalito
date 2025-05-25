const redis = require('redis');
const { promisify } = require('util');
const dotenv = require('dotenv');
dotenv.config();

const client = redis.createClient({
    //host: process.env.REDIS_HOST || 'localhost',
    //port: process.env.REDIS_PORT || 6379,
    url: process.env.REDIS_URL || 'redis://localhost:6379',
});

// Handle connection events
client.connect().then(() => {
    console.log('Connected to Redis Cloud');
}).catch((err) => {
    console.error('Failed to connect to Redis Cloud', err);
});

client.on('error', (err) => {
    console.log(process.env.REDIS_HOST + ':' + process.env.REDIS_PORT)
    console.error('Redis error:', err);
});

async function getFromCache(key) {
    if (!client.isOpen) {
        await client.connect(); // Ensure the client is connected
    }
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
}

async function setToCache(key, value, expiration = 3600) { // Default expiration time is 1 hour
    if (!client.isOpen) {
        await client.connect(); // Ensure the client is connected
    }
    await client.set(key, JSON.stringify(value), 'EX', expiration);
    await client.expire(key, expiration);
}

module.exports = { getFromCache, setToCache };