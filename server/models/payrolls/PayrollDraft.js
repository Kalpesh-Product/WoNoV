const mongoose = require("mongoose");

const payrollDraftSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    payrollType: { type: String, default: "Monthly" },
    payPeriod: { type: Date, required: true },
    batchName: { type: String, required: true },
    status: {
      type: String,
      enum: ["Draft", "Completed"],
      default: "Draft",
    },
    directDepositStatus: { type: String, default: "-" },
    employeeCount: { type: Number, min: 0, default: 0 },
    grossAmount: { type: Number, min: 0, default: 0 },
    incomeTax: { type: Number, min: 0, default: 0 },
    surcharge: { type: Number, min: 0, default: 0 },
    cess: { type: Number, min: 0, default: 0 },
    netAmount: { type: Number, min: 0, default: 0 },
    lossOfPay: { type: Number, min: 0, default: 0 },
    employeePf: { type: Number, min: 0, default: 0 },
    employerPf: { type: Number, min: 0, default: 0 },
    voluntaryProvidentFund: { type: Number, min: 0, default: 0 },
    pfEmployeeCount: { type: Number, min: 0, default: 0 },
    employeeEsi: { type: Number, min: 0, default: 0 },
    employerEsi: { type: Number, min: 0, default: 0 },
    esiEmployeeCount: { type: Number, min: 0, default: 0 },
    employeeSummaries: [
      {
        _id: false,
        employee: { type: mongoose.Schema.Types.ObjectId, ref: "UserData" },
        employeeName: { type: String, default: "" },
        employeeId: { type: String, default: "" },
        gross: { type: Number, min: 0, default: 0 },
        actualGross: { type: Number, min: 0, default: 0 },
        basic: { type: Number, min: 0, default: 0 },
        allowances: { type: Number, min: 0, default: 0 },
        deductions: { type: Number, min: 0, default: 0 },
        lossOfPay: { type: Number, min: 0, default: 0 },
        incomeTax: { type: Number, min: 0, default: 0 },
        surcharge: { type: Number, min: 0, default: 0 },
        cess: { type: Number, min: 0, default: 0 },
        netAmount: { type: Number, min: 0, default: 0 },
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "UserData" },
    runDate: { type: Date, default: null },
  },
  { timestamps: true }
);

payrollDraftSchema.index(
  { company: 1, payPeriod: 1, batchName: 1 },
  { unique: true }
);

module.exports = mongoose.model("PayrollDraft", payrollDraftSchema);
