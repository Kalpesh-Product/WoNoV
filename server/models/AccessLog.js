const mongoose = require("mongoose");

const accessLogSchema = new mongoose.Schema({
  permissions: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Permission",
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

const AccessLog = mongoose.model("AccessLog", accessLogSchema);
module.exports = AccessLog;
