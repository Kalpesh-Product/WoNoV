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
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
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

    // Core Salary Breakdown
    basic: Number,
    earnedBasic: Number,
    calculatedBasic: Number,
    pfApplicableAllowances: Number,
    actualGross: Number,
    gross: Number,
    netAmount: Number,

    // TDS & Taxes
    incomeTax: Number,
    surcharge: Number,
    cess: Number,
    totalTds: Number,

    // Attendance
    paidDays: Number,
    lopDays: Number,
    lopAmount: Number,

    // ESI/PT Grosses
    earnedGrossOfEsi: Number,
    earnedGrossOfPt: Number,

    // Employer Contributions
    employerPf: Number,
    employerEsi: Number,
    employerLwf: Number,

    // Allowances & Earnings
    hra: Number,
    specialAllowance: Number,
    bonus: Number,
    otherAllowance: Number,

    childrenEducationAllowance: Number,
    commissions: Number,
    overTime: Number,
    leaveEncashment: Number,
    expenses: Number,
    dearnessAllowance: Number,
    gratuity: Number,
    medicalAllowance: Number,
    conveyanceAllowance: Number,
    arrears: Number,

    // Deductions
    employeePf: Number,
    employeesStateInsurance: Number,
    professionTax: Number,
    adjustments: Number,
    additionalIncomeTax: Number,
    reduceIncomeTax: Number,
    otherDeduction: Number,
    voluntaryProvidentFund: Number,
    lwf: Number, // Employee LWF
    recovery: Number,

    // Reimbursements
    reimbursment: Number,

    // Bank Info (optional but useful for backend validation)
    ifscCode: String,
    accountNumber: String,
  },
  { timestamps: true }
);

const Payroll = mongoose.model("Payroll", payrollSchema);
module.exports = Payroll;
