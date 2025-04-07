const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  adminEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AdminEvent",
  },
  weeklyUnit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WeeklyUnit",
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
  ipAddress: {
    type: String,
  },
  remarks: {
    type: String,
  },
  status: {
    type: String,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
});

const AdminLog = mongoose.model("AdminLog", adminSchema);
module.exports = AdminLog;
