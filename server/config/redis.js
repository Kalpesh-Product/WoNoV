const IORedis = require("ioredis");

console.log("Connecting to Redis at:", process.env.REDIS_URL);
const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null, // recommended for BullMQ
});

module.exports = { connection };
