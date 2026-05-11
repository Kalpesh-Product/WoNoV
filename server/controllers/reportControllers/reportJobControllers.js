// POST /reports/generate
const { reportQueue } = require("../../queues/report.queue");
const ReportJob = require("../../models/reports/ReportJob");
const { default: mongoose } = require("mongoose");
const Report = require("../../models/reports/Report");

async function generateReport(req, res) {
  const { report, department, filters } = req.body;
  const userId = req.user._id;

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

  const reportJob = await ReportJob.create({
    userId,
    report,
    department,
    filters,
    status: "pending",
  });

  await reportQueue.add(
    "generate-report",
    { reportJobId: reportJob._id.toString() },
    {
      attempts: 2,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: true,
      removeOnFail: false,
    },
  );

  return res.status(202).json({
    jobId: reportJob._id,
    status: "pending",
  });
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
};
