let reportQueue = null;

if (process.env.USE_QUEUE === "true") {
  const { Queue } = require("bullmq");
  const { connection } = require("../config/redis");

  reportQueue = new Queue("report-generation", { connection });
}

module.exports = { reportQueue };
