let connection = null;

if (process.env.USE_QUEUE === "true") {
  const IORedis = require("ioredis");

  connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
  });

  connection.on("connect", () => {
    console.log("Redis connected");
  });

  connection.on("error", (err) => {
    console.error("Redis error:", err.message);
  });
}

module.exports = { connection };
