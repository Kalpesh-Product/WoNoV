const { Queue } = require("bullmq");
const { connection } = require("../config/redis");

const reportQueue = new Queue("report-generation", { connection });

module.exports = { reportQueue };
