const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  requestor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  expanseName: {
    type: String,
    required: true,
  },
  expanseType: {
    type: String,
    required: true,
    enum: ["Internal", "External"],
  },
  projectedAmount: {
    type: Number,
    required: true,
  },
  actualAmount: {
    type: Number,
  },
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Unit",
  },
  category: {
    type: String,
  },
  status: {
    type: String,
    default: "Pending",
    enum: ["Pending", "Approved", "Rejected"],
  },
  isPaid: {
    type: String,
    default: "Unpaid",
    enum: ["Paid", "Unpaid"],
  },
  isExtraBudget: {
    type: Boolean,
    default: false,
  },
  month: {
    type: Date,
    required: true,
  },
  typeOfBudget: {
    type: String,
    required: true,
  },
});

const Budget = mongoose.model("Budget", budgetSchema);
module.exports = Budget;
