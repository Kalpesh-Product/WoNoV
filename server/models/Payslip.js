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
      required: true,
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

    //Additional Fields

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
    employerLwf: Number,

    // Allowances & Earnings
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
    otherDeduction: Number,
    reduceIncomeTax: Number,

    adjustments: Number,
    additionalIncomeTax: Number,
    voluntaryProvidentFund: Number,
    lwf: Number, //Employee LWF
    recovery: Number,

    // Reimbursements
    reimbursment: Number,

    // Bank Info (optional but useful for backend validation)
    ifscCode: String,
    accountNumber: String,
  },
  {
    timestamps: true,
  }
);

const Payslip = mongoose.model("Payslip", payslipSchema);
module.exports = Payslip;
