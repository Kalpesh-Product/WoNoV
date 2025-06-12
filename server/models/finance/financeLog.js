const mongoose = require("mongoose");

const financeLogSchema = new mongoose.Schema(
  {
    finance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Finance",
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

const FinanceLog = mongoose.model("FinanceLog", financeLogSchema);
module.exports = FinanceLog;
