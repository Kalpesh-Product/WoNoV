// workers/report.worker.js
const { Worker } = require("bullmq");
const { connection } = require("../config/redis");
require("../models/registerModels"); // ensure all models are registered
require("../models/reports/Report");
const ReportJob = require("../models/reports/ReportJob");
const { fetchBudgetService } = require("../services/reports/finance");

const worker = new Worker(
  "report-generation",
  async (job) => {
    const { reportJobId } = job.data;

    const reportJob = await ReportJob.findById(reportJobId).populate(
      "report",
      "reportName",
    );
    if (!reportJob) throw new Error("ReportJob not found");

    reportJob.status = "processing";
    await reportJob.save();

    try {
      let data;

      console.log(`Received job: ${job.data}`);
      console.log("Report Data:", reportJob);
      console.log(
        `Processing report job ${reportJobId} for template: ${reportJob.report.reportName}`,
      );
      switch (reportJob.report.reportName) {
        case "Expense And Budget":
          data = await fetchBudgetService({
            ...reportJob.filters,
            departmentId: reportJob.department,
          });
          break;
        case "sales":
          data = await getSalesReport(reportJob.filters);
          break;
        default:
          throw new Error(
            `Unsupported template: ${reportJob.report.reportName}`,
          );
      }

      // reportJob.data = data;
      reportJob.status = "completed";
      reportJob.completedAt = new Date();
      reportJob.error = undefined;
      await reportJob.save();

      return { ok: true, reportJobId };
    } catch (err) {
      reportJob.status = "failed";
      reportJob.error = {
        message: err.message,
        stack: err.stack,
      };
      await reportJob.save();
      throw err; // important so BullMQ marks failed/retry
    }
  },
  {
    connection,
    concurrency: 2,
    removeOnComplete: {
      age: 24 * 3600 * 7,
      count: 100,
      limit: 10,
    },

    removeOnFail: {
      age: 24 * 3600 * 7,
      count: 500,
      limit: 10,
    },
  },
);

worker.on("completed", (job) => {
  console.log("Report Generation Successful:", job.id);
});

worker.on("ready", () => {
  console.log("Report worker is ready and listening for jobs");
});

worker.on("failed", (job, err) => {
  console.error("Report Generation Failed:", job?.id, err.message);
});

worker.on("error", (err) => {
  console.error("Report worker connection error:", err.message);
});

// Graceful shutdown on node process restart or deployment
const shutdown = async () => {
  console.log("Shutting down worker gracefully...");
  await worker.close();
  process.exit(0);
};

process.on("SIGTERM", shutdown); //Termination Signal
process.on("SIGINT", shutdown); //Interrupt Signal
