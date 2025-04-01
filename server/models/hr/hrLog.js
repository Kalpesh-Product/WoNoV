const mongoose = require("mongoose");

const hrLogSchema = new mongoose.Schema(
  {
    companyData: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    building: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Building",
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    },
    attendance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attendance",
    },
    companyLeave: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Leave",
    },
    employeeLeave: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
    budget: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Budget",
    },
    payroll: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payroll",
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

const HrLog = mongoose.model("HrLog", hrLogSchema);
module.exports = HrLog;
