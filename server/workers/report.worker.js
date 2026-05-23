// workers/report.worker.js
const { Worker } = require("bullmq");
const { connection } = require("../config/redis");
require("../models/registerModels"); // ensure all models are registered
require("../models/reports/Report");
const ReportJob = require("../models/reports/ReportJob");
const { resolveReportService } = require("../services/reports");
const UserData = require("../models/hr/UserData");

const worker = new Worker(
  "report-generation",
  async (job) => {
    const { reportJobId } = job.data;

    const reportJob = await ReportJob.findById(reportJobId).populate(
      "report",
      "reportName reportKey",
    );
    if (!reportJob) throw new Error("ReportJob not found");

    console.log("Attempts made:", job.attemptsMade);

    if (reportJob.status === "canceled") {
      await job.log("Job canceled");

      return {
        status: "canceled",
      };
    }

    reportJob.status = "processing";
    reportJob.startedAt = new Date();

    console.log("report job", reportJob);
    await reportJob.save();

    //delay added to simulate long processing time and test retry/cancellation flows. Remove in production.
    // await new Promise((resolve) => setTimeout(resolve, 5000));
    try {
      let data;

      console.log(`Received job: ${job.data}`);
      console.log("Report Data:", reportJob);
      console.log(
        `Processing report job ${reportJobId} for template: ${reportJob.report.reportName}`,
      );
      console.log("ReportJob report:", reportJob.report);
      const reportService = resolveReportService(reportJob.report);

      if (!reportService) {
        throw new Error(
          `Unsupported report: ${reportJob.report.reportName}, ensure the reportKey is registered in reportServiceRegistry`,
        );
      }

      const foundUser = await UserData.findById(reportJob.userId)
        .populate("role", "roleTitle")
        .select("role company departments")
        .lean();
      const roles = (foundUser?.role || []).map((role) => role.roleTitle);
      const company = foundUser.company;
      const user = foundUser._id;

      // throw new Error("Retry Error For Test");

      data = await reportService({
        dateFilter: reportJob.filters,
        departmentId: reportJob.department,
        departments: reportJob.departments || [],
        roles,
        company,
        user,
      });

      const latestState =
        await ReportJob.findById(reportJobId).select("status");
      if (latestState?.status === "canceled") {
        await job.log("Job canceled");

        return {
          status: "canceled",
        };
      }

      reportJob.data = data;
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
