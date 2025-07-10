const mongoose = require("mongoose");

const payslipSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
    month: {
      type: Date,
    },

    // earnings
    basicPay: {
      type: Number,
      default: 0,
    },
    hra: {
      type: Number,
      default: 0,
    },
    netPay: {
      type: Number,
      default: 0,
    },
    specialAllowance: {
      type: Number,
      default: 0,
    },
    otherAllowance: {
      type: Number,
      default: 0,
    },
    bonus: {
      type: Number,
      default: 0,
    },

    // deductions
    employeePf: {
      type: Number,
      default: 0,
    },
    employeesStateInsurance: {
      type: Number,
      default: 0,
    },
    professionTax: {
      type: Number,
      default: 0,
    },
    otherDeduction: {
      type: Number,
      default: 0,
    },
    reduceIncomeTax: {
      type: Number,
      default: 0,
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
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
  },
  {
    timestamps: true,
  }
);

const Payslip = mongoose.model("Payslip", payslipSchema);
module.exports = Payslip;
