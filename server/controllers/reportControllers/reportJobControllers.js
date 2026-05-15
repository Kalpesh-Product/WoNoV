// POST /reports/generate
const { reportQueue } = require("../../queues/report.queue");
const ReportJob = require("../../models/reports/ReportJob");
const { default: mongoose } = require("mongoose");
const Report = require("../../models/reports/Report");

const MAX_RETRIES = 3;
// const RETRY_COOLDOWN_MS = 15 * 60 * 1000;
const RETRY_COOLDOWN_MS = 5 * 1000;

async function queueReportJob({
  userId,
  report,
  department,
  filters,
  requestKey,
  isManualRetry = false,
}) {
  const reportJob = await ReportJob.create({
    userId,
    report,
    department,
    filters,
    requestKey,
    status: "pending",
    isManualRetry,
  });

  const queueJob = await reportQueue.add(
    "generate-report",
    { reportJobId: reportJob._id.toString() },
    {
      attempts: 2,
      backoff: { type: "exponential", delay: 2000 },
    },
  );

  reportJob.bullJobId = queueJob.id?.toString();
  await reportJob.save();

  return reportJob;
}

async function generateReport(req, res) {
  const { report, department, filters } = req.body;
  const userId = req.user;

  if (!report || !department) {
    return res
      .status(400)
      .json({ message: "report and department are required" });
  }

  if (
    !mongoose.Types.ObjectId.isValid(report) ||
    !mongoose.Types.ObjectId.isValid(department)
  ) {
    return res.status(400).json({ message: "Invalid report or department id" });
  }

  const foundReport = await Report.findById(report);
  if (!foundReport) {
    return res.status(404).json({ message: "Report not found" });
  }

  //Avoid multiple duplicate report jobs
  // new request supersedes older ones with same parameters that are still pending/processing/retrying
  const requestKey = `${userId.toString()}:${report}:${department}`;

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
    filters,
    requestKey,
  });

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

  if (retriesInWindow > MAX_RETRIES) {
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

  const reportJob = await queueReportJob({
    userId,
    report: failedJob.report,
    department: failedJob.department,
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

  if (reportJob.bullJobId) {
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
