// const { QueueEvents } = require("bullmq");
// const connection = require("../config/redis");

// const queueEvents = new QueueEvents("report-generation", {
//   connection,
// });

// queueEvents.on("completed", ({ jobId }) => {
//   console.log(`✅ Job ${jobId} completed`);
// });

// queueEvents.on("failed", ({ jobId, failedReason }) => {
//   console.log(`❌ Job ${jobId} failed`);
//   console.log("Reason:", failedReason);
// });

// queueEvents.on("stalled", ({ jobId }) => {
//   console.log(`⚠️ Job ${jobId} stalled`);
// });

// module.exports = queueEvents;

let queueEvents = null;

if (process.env.USE_QUEUE === "true") {
  const { QueueEvents } = require("bullmq");
  const { connection } = require("../config/redis");

  queueEvents = new QueueEvents("report-generation", {
    connection,
  });

  queueEvents.on("completed", ({ jobId }) => {
    console.log(`✅ Job ${jobId} completed`);
  });

  queueEvents.on("failed", ({ jobId, failedReason }) => {
    console.log(`❌ Job ${jobId} failed`);
    console.log("Reason:", failedReason);
  });

  queueEvents.on("stalled", ({ jobId }) => {
    console.log(`⚠️ Job ${jobId} stalled`);
  });
}

module.exports = queueEvents;

/*
Redis connection
Bullboard
RedisInsight
queue connection
worker connection
Queuevents
report registry
service files
*/
