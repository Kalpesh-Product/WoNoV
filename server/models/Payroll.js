const mongoose = require("mongoose");
const payrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      required: true,
    },
    month: {
      type: Date,
      required: true,
    },
    //calculated salary
    salary: {
      type: Number,
      required: true,
    },
    deductions: [
      {
        name: {
          type: String,
        },
        amount: {
          type: Number,
        },
      },
    ],
    reimbursment: Number,
    payslip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payslip",
      required: true,
    },
    status: {
      type: String,
      enum: ["Completed", "Pending", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Payroll = mongoose.model("Payroll", payrollSchema);
module.exports = Payroll;
