const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    module: String,
    reportKey: {
      type: String,
      unique: true,
    },
    reportName: String,
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    // description: String,
    // when report was last generated
    lastGeneratedAt: Date,
    // to track the latest date range for which report was generated
    latestDatefilter: {
      startDate: Date,
      endDate: Date,
    },
    latestReportJobStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "canceled"],
    },
    status: {
      type: Boolean,
      default: true,
    },
    crossDepartment: {
      type: Boolean,
      default: false,
    },
    reportType: {
      type: String,
      enum: ["dashboard", "app"],
      default: "app",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Report", ReportSchema);
