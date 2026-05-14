// POST /reports/generate
const { reportQueue } = require("../../queues/report.queue");
const ReportJob = require("../../models/reports/ReportJob");
const { default: mongoose } = require("mongoose");
const Report = require("../../models/reports/Report");

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

  const reportJob = await ReportJob.create({
    userId,
    report,
    department,
    filters,
    requestKey,
    status: "pending",
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

  return res.status(202).json({
    jobId: reportJob._id,
    status: "pending",
  });
}

async function cancelReport(req, res) {
  const { jobId } = req.params;
  const userId = req.user._id;

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
};
