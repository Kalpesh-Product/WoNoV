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
    const { module, reportName, crossDepartment, reportType } = req.body;

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

    if (crossDepartment && reportType && reportType !== "dashboard") {
      return res.status(400).json({
        message: "crossDepartment can only be true for dashboard reportType",
      });
    }

    const report = await Report.create({
      module,
      reportName,
      reportKey: normalizedReportKey,
      crossDepartment,
      reportType,
    });

    return res.status(201).json({
      message: "Report created successfully",
      report,
    });
  } catch (err) {
    next(err);
  }
};

// const getReports = async (req, res, next) => {
//   try {
//     const {
//       module,
//       departmentId,
//       reportType,
//       includeCrossDepartment,
//       departments,
//     } = req.query;

//     const query = {
//       status: true,
//     };

//     if (module) {
//       query.module = module;
//     }

//     if (reportType) {
//       query.reportType = reportType;
//     }

//     // if (includeCrossDepartment === "true") {
//     //   query.$or = [
//     //     { module },
//     //     { crossDepartment: true, reportType: "dashboard" },
//     //   ];
//     // }

//     // if (departments) {
//     //   const departmentList = String(departments)
//     //     .split(",")
//     //     .map((item) => item.trim())
//     //     .filter(Boolean);

//     //   if (departmentList.length) {
//     //     const moduleMatch = { module: { $in: departmentList } };
//     //     const crossDepartmentMatch = {
//     //       crossDepartment: true,
//     //       reportType: "dashboard",
//     //     };

//     //     query.$or = query.$or
//     //       ? [...query.$or, moduleMatch, crossDepartmentMatch]
//     //       : [moduleMatch, crossDepartmentMatch];
//     //   }
//     // }

//     const reports = await Report.find(query)
//       .populate("departmentId", "name")
//       .sort({ createdAt: -1 });

//     return res.status(200).json({
//       count: reports.length,
//       reports,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

const getReports = async (req, res, next) => {
  try {
    const { module, reportType } = req.query;

    const query = {
      status: true,
    };

    if (!reportType || !module) {
      return res
        .status(404)
        .json({ message: "report type and module is required" });
    }

    if (reportType == "dashboard") {
      query.$or = [{ module }, { module: "cross-department" }];
    } else {
      query.module = module;
    }

    console.log("report type query", query);
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
    const reports = req.body;

    /*
    Payload : [
  {
    "module": "Task",
    "reportKey": "task",
    "reportName": "Task Report",
    "description": "Task report",
    "crossDepartment":true
  },
]*/

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
