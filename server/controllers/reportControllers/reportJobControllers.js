// POST /reports/generate
const ReportJob = require("../../models/reports/ReportJob");
const { default: mongoose } = require("mongoose");
const Report = require("../../models/reports/Report");
const UserData = require("../../models/hr/UserData");
const { executeReport } = require("../../services/reports/reportExecutor");

const isQueueEnabled = () => process.env.USE_QUEUE === "true";

function getReportQueue() {
  if (!isQueueEnabled()) return null;
  const { reportQueue } = require("../../queues/report.queue");
  return reportQueue;
}

const normalizeReportKey = (value = "") =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-report$/, "");

const MAX_RETRIES = 3;
const RETRY_COOLDOWN_MS = 15 * 60 * 1000;
const REPORT_GENERATION_START_DELAY_MS = 5 * 1000; // 5 seconds delay before starting report generation to allow for cancellation simulation in tests

async function queueReportJob({
  userId,
  report,
  department,
  departments = [],
  filters,
  requestKey,
  isManualRetry = false,
}) {
  const reportJob = await ReportJob.create({
    userId,
    report,
    department: department || undefined,
    departments,
    filters,
    requestKey,
    status: "pending",
    isManualRetry,
  });
  const reportQueue = getReportQueue();

  if (!reportQueue) {
    throw new Error("Queue mode is disabled (USE_QUEUE=false)");
  }

  const queueJob = await reportQueue.add(
    "generate-report",
    { reportJobId: reportJob._id.toString() },
    {
      attempts: 2,
      backoff: { type: "exponential", delay: 2000 },
      // delay: REPORT_GENERATION_START_DELAY_MS,
    },
  );

  reportJob.bullJobId = queueJob.id?.toString();
  await reportJob.save();

  return reportJob;
}

async function generateReport(req, res) {
  const { report, department, filters } = req.body;
  const userId = req.user;

  if (!report) {
    return res.status(400).json({ message: "report id is required" });
  }

  if (!mongoose.Types.ObjectId.isValid(report)) {
    return res.status(400).json({ message: "Invalid report id" });
  }

  if (department && !mongoose.Types.ObjectId.isValid(department)) {
    return res.status(400).json({ message: "Invalid department id" });
  }

  const foundReport = await Report.findById(report);
  if (!foundReport) {
    return res.status(404).json({ message: "Report not found" });
  }

  if (!foundReport.reportKey) {
    foundReport.reportKey = normalizeReportKey(foundReport.reportName || "");
  }

  const foundUser = await UserData.findById(userId)
    .select("departments")
    .lean();
  const userDepartments = Array.isArray(foundUser?.departments)
    ? foundUser.departments
    : [];

  if (!isQueueEnabled()) {
    try {
      const data = await executeReport({
        report: foundReport,
        filters,
        department,
        departments: userDepartments,
        userId,
      });

      const latestDatefilter = {
        startDate: filters?.startDate,
        endDate: filters?.endDate,
      };

      foundReport.latestDatefilter = latestDatefilter;
      foundReport.lastGeneratedAt = new Date();
      await foundReport.save();

      return res.status(200).json({
        status: "completed",
        data,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Report generation failed",
        error: error.message,
      });
    }
  }

  // Check for existing active jobs for the user and enforce limits
  const activeJobsCount = await ReportJob.countDocuments({
    userId,
    status: { $in: ["pending", "processing"] },
  });

  if (activeJobsCount >= 5) {
    return res.status(429).json({
      message: "Maximum 5 active reports allowed",
    });
  }

  //Avoid multiple duplicate report jobs
  // new request supersedes older ones with same parameters that are still pending/processing/retrying
  const normalizedDepartment = department ? department.toString() : "all";
  const requestKey = `${userId.toString()}:${report}:${normalizedDepartment}`;

  await ReportJob.updateMany(
    {
      userId,
      requestKey,
      status: { $in: ["pending", "processing", "retrying"] },
    },
    {
      $set: {
        status: "canceled",
        cancelReason: "superseded_by_new_request",
        canceledAt: new Date(),
      },
    },
  );

  const reportJob = await queueReportJob({
    userId,
    report,
    department,
    departments: userDepartments,
    filters,
    requestKey,
  });
  console.log("queue|generate-report");
  const latestDatefilter = {
    startDate: filters.startDate,
    endDate: filters.endDate,
  };

  foundReport.latestDatefilter = latestDatefilter;
  foundReport.lastGeneratedAt = new Date();
  await foundReport.save();

  return res.status(202).json({
    jobId: reportJob._id,
    status: "pending",
  });
}

async function retryReport(req, res) {
  const { jobId } = req.params;
  const userId = req.user;

  const failedJob = await ReportJob.findOne({ _id: jobId, userId });
  if (!failedJob) return res.status(404).json({ message: "Job not found" });

  if (failedJob.status !== "failed") {
    return res.status(409).json({
      message: "Only failed jobs can be retried",
      status: failedJob.status,
    });
  }

  const now = new Date();
  const windowStart = new Date(now.getTime() - RETRY_COOLDOWN_MS);

  const retriesInWindow = await ReportJob.countDocuments({
    userId,
    requestKey: failedJob.requestKey,
    isManualRetry: true,
    createdAt: { $gte: windowStart },
  });

  if (retriesInWindow == MAX_RETRIES) {
    const latestRetry = await ReportJob.findOne({
      userId,
      requestKey: failedJob.requestKey,
      isManualRetry: true,
      createdAt: { $gte: windowStart },
    })
      .sort({ createdAt: -1 })
      .select("createdAt")
      .lean();

    const retryAvailableAt = latestRetry?.createdAt
      ? new Date(new Date(latestRetry.createdAt).getTime() + RETRY_COOLDOWN_MS)
      : new Date(now.getTime() + RETRY_COOLDOWN_MS);

    return res.status(429).json({
      message: "Report generation unavailable. Please try again later.",
      retryAvailableAt,
      maxRetries: MAX_RETRIES,
    });
  }

  if (!isQueueEnabled()) {
    try {
      const report = await Report.findById(failedJob.report);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      failedJob.status = "processing";
      failedJob.startedAt = new Date();
      failedJob.isManualRetry = true;
      await failedJob.save();

      const data = await executeReport({
        report,
        filters: failedJob.filters,
        department: failedJob.department,
        departments: failedJob.departments || [],
        userId,
      });

      failedJob.status = "completed";
      failedJob.data = data;
      failedJob.error = undefined;
      failedJob.completedAt = new Date();
      await failedJob.save();

      return res.status(200).json({
        status: "completed",
        data,
        retriesRemaining: Math.max(0, MAX_RETRIES - (retriesInWindow + 1)),
      });
    } catch (error) {
      failedJob.status = "failed";
      failedJob.error = {
        message: error.message,
        stack: error.stack,
      };
      failedJob.completedAt = new Date();
      await failedJob.save();

      return res.status(500).json({
        message: "Report retry failed",
        error: error.message,
      });
    }
  }

  const reportJob = await queueReportJob({
    userId,
    report: failedJob.report,
    department: failedJob.department,
    departments: failedJob.departments || [],
    filters: failedJob.filters,
    requestKey: failedJob.requestKey,
    isManualRetry: true,
  });

  return res.status(202).json({
    jobId: reportJob._id,
    status: "pending",
    retriesRemaining: Math.max(0, MAX_RETRIES - (retriesInWindow + 1)),
  });
}

async function cancelReport(req, res) {
  const { jobId } = req.params;
  const userId = req.user;

  const reportJob = await ReportJob.findOne({ _id: jobId, userId });

  if (!reportJob) return res.status(404).json({ message: "Job not found" });

  if (["completed", "failed", "canceled"].includes(reportJob.status)) {
    return res.status(409).json({
      message: `Job is already ${reportJob.status}`,
      status: reportJob.status,
    });
  }

  reportJob.status = "canceled";
  reportJob.cancelReason = "user_canceled";
  reportJob.canceledAt = new Date();
  await reportJob.save();

  const reportQueue = getReportQueue();

  if (reportQueue && reportJob.bullJobId) {
    const queueJob = await reportQueue.getJob(reportJob.bullJobId);

    if (queueJob) {
      const state = await queueJob.getState();

      if (["waiting", "delayed"].includes(state)) {
        await queueJob.remove();
      }
    }
  }

  return res.json({ status: "canceled", jobId: reportJob._id });
}

async function getReportStatus(req, res) {
  const { jobId } = req.params;

  const reportJob = await ReportJob.findById(jobId).lean();
  if (!reportJob) return res.status(404).json({ message: "Job not found" });

  return res.json({
    status: reportJob.status, // pending|processing|completed|failed
    data: reportJob.data || null,
    error: reportJob.error || null,
    completedAt: reportJob.completedAt || null,
  });
}

module.exports = {
  generateReport,
  getReportStatus,
  cancelReport,
  retryReport,
};
