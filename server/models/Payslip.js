const mongoose = require("mongoose");

const payslipSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    month: {
      type: Date,
      // required: true,
    },
    earnings: {
      basicPay: {
        type: Number,
        // required: true,
      },
      hra: {
        type: Number,
        // required: true,
      },
      netPay: {
        type: Number,
        // required: true,
      },
    },
    payslipName: {
      type: String,
    },
    payslipLink: {
      type: String,
    },
    payslipId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Payslip = mongoose.model("Payslip", payslipSchema);
module.exports = Payslip;
