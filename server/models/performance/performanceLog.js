const mongoose = require("mongoose");

const performanceLogSchema = new mongoose.Schema(
  {
    kraKpaRoles: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "kraKpaRole",
    },
    kraKpaTasks: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "kraKpaTask",
    },
    action: {
      type: String,
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      required: true,
    },
    changes: {
      type: Object,
      default: {},
    },
    remarks: {
      type: String,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    status: {
      type: String,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  { timestamps: true }
);

const PerformanceLog = mongoose.model("PerformanceLog", performanceLogSchema);
module.exports = PerformanceLog;
