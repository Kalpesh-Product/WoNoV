const mongoose = require("mongoose");

const visitorLogSchema = new mongoose.Schema(
  {
    visitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visitor",
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

const VisitorLog = mongoose.model("VisitorLog", visitorLogSchema);
module.exports = VisitorLog;
