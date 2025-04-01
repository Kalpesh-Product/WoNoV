const mongoose = require("mongoose");

const payslipSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    earnings: {
      basicPay: {
        type: Number,
        required: true,
      },
      month: {
        type: Date,
        required: true,
      },
      hra: {
        type: Number,
        required: true,
      },
      deductions: Number,
      netPay: {
        type: Number,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Payslip = mongoose.model("Payslip", payslipSchema);
module.exports = Payslip;
