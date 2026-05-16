const Department = require("../../models/Departments");
const Report = require("../../models/reports/Report");
const mongoose = require("mongoose");

const normalizeReportKey = (value = "") =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-report$/, "");

const addReport = async (req, res, next) => {
  try {
    const { module, reportName } = req.body;

    const normalizedReportKey = normalizeReportKey(reportName || "");

    if (!reportName || !normalizedReportKey) {
      return res.status(400).json({
        message: "reportName is required",
      });
    }

    const existingReport = await Report.findOne({
      $or: [{ module, reportName }, { reportKey: normalizedReportKey }],
    });

    if (existingReport) {
      return res.status(400).json({
        message: "Report already exists",
      });
    }

    const report = await Report.create({
      module,
      reportName,
      reportKey: normalizedReportKey,
    });

    return res.status(201).json({
      message: "Report created successfully",
      report,
    });
  } catch (err) {
    next(err);
  }
};

const getReports = async (req, res, next) => {
  try {
    const { module, departmentId } = req.query;

    const query = {
      status: true,
    };

    if (module) {
      query.module = module;
    }

    if (departmentId) {
      query.departmentId = departmentId;
    }

    const reports = await Report.find(query)
      .populate("departmentId", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: reports.length,
      reports,
    });
  } catch (err) {
    next(err);
  }
};

const getSingleReport = async (req, res, next) => {
  try {
    const { reportId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({
        message: "Invalid report id",
      });
    }

    const report = await Report.findById(reportId).populate(
      "departmentId",
      "name",
    );

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    return res.status(200).json(report);
  } catch (err) {
    next(err);
  }
};

const seedReports = async (req, res, next) => {
  try {
    const reports = [
      {
        module: "Ticket",
        reportKey: "ticket",
        reportName: "Ticket Report",
        description: "Ticket report",
      },
      {
        module: "Visitor",
        reportKey: "visitor",
        reportName: "Visitor Report",
        description: "Visitor report",
      },
      {
        module: "Meeting",
        reportKey: "meeting",
        reportName: "Meeting Report",
        description: "Meeting report",
      },
    ];

    // Attach departmentId
    const formattedReports = reports.map((report) => ({
      ...report,
      status: true,
    }));

    // Avoid duplicate reportKeys
    const existingReports = await Report.find({
      reportKey: {
        $in: formattedReports.map((r) => r.reportKey),
      },
    }).select("reportKey");

    const existingKeys = existingReports.map((r) => r.reportKey);

    const newReports = formattedReports.filter(
      (r) => !existingKeys.includes(r.reportKey),
    );

    if (!newReports.length) {
      return res.status(400).json({
        message: "All reports already exist",
      });
    }

    const createdReports = await Report.insertMany(newReports);

    return res.status(201).json({
      message: "Reports created successfully",
      count: createdReports.length,
      reports: createdReports,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { addReport, getReports, getSingleReport, seedReports };
