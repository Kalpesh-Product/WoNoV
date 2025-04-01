const mongoose = require("mongoose");

const eventLogSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
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

const EventLog = mongoose.model("EventLog", eventLogSchema);
module.exports = EventLog;
