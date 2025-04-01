const mongoose = require("mongoose");

const budgetLogSchema = new mongoose.Schema(
  {
    budget: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Budget",
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

const BudgetLog = mongoose.model("BudgetLog", budgetLogSchema);
module.exports = BudgetLog;
