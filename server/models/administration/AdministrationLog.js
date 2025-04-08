const mongoose = require("mongoose");

const administrationSchema = new mongoose.Schema({
  adminEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AdminEvent",
  },
  weeklySchedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WeeklySchedule",
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

const AdministrationLog = mongoose.model(
  "AdministrationLog",
  administrationSchema
);
module.exports = AdministrationLog;
