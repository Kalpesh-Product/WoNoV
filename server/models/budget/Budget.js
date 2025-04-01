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
  expanseName: {
    type: String,
    required: true,
  },
  projectedAmount: {
    type: Number,
    required: true,
  },
  actualAmount: {
    type: Number,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
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
