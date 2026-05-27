const { createBullBoard } = require("@bull-board/api");
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");
const { ExpressAdapter } = require("@bull-board/express");

const { reportQueue } = require("./report.queue");

const serverAdapter = new ExpressAdapter();

serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: reportQueue ? [new BullMQAdapter(reportQueue)] : [],
  serverAdapter,
});

module.exports = serverAdapter;
