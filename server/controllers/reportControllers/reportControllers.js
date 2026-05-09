const Department = require("../../models/Departments");
const Report = require("../../models/reports/Report");
const mongoose = require("mongoose");

const addReport = async (req, res, next) => {
  try {
    const { module, reportName, departmentId } = req.body;

    const existingReport = await Report.findOne({ reportName, departmentId });

    if (existingReport) {
      return res.status(400).json({
        message: "Report already exists",
      });
    }

    const report = await Report.create({
      module,
      reportName,
      departmentId,
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
    // Find Finance Department
    const financeDepartment = await Department.findOne({
      name: "Finance",
    });

    if (!financeDepartment) {
      return res.status(404).json({
        message: "Finance department not found",
      });
    }

    const reports = [
      {
        module: "Finance",
        reportKey: "alternate-revenue",
        reportName: "Alternate Revenue",
        description: "Finance alternate revenue report",
      },
      {
        module: "Finance",
        reportKey: "coworking-revenue",
        reportName: "Coworking Revenue",
        description: "Coworking revenue report",
      },
      {
        module: "Finance",
        reportKey: "kra-kpa",
        reportName: "KRA And KPA",
        description: "KRA and KPA report",
      },
      {
        module: "Finance",
        reportKey: "virtual-office-revenue",
        reportName: "Virtual Office Revenue",
        description: "Virtual office revenue report",
      },
      {
        module: "Finance",
        reportKey: "workation-revenues",
        reportName: "Workation Revenues",
        description: "Workation revenue report",
      },
      {
        module: "Finance",
        reportKey: "vendors",
        reportName: "Vendors",
        description: "Vendor report",
      },
      {
        module: "Finance",
        reportKey: "expense-and-budget",
        reportName: "Expense And Budget",
        description: "Expense and budget report",
      },
    ];

    // Attach departmentId
    const formattedReports = reports.map((report) => ({
      ...report,
      departmentId: financeDepartment._id,
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
        message: "All finance reports already exist",
      });
    }

    const createdReports = await Report.insertMany(newReports);

    return res.status(201).json({
      message: "Finance reports created successfully",
      count: createdReports.length,
      reports: createdReports,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { addReport, getReports, getSingleReport, seedReports };
