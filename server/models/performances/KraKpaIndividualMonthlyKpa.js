const mongoose = require("mongoose");

const individualMonthlyKpaSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      required: true,
    },
    month: {
      type: String,
      required: true,
      match: /^\d{4}-(0[1-9]|1[0-2])$/,
    },
    fiscalYear: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}$/,
    },
    target: { type: String, required: true, trim: true },
    deadline: { type: Date, default: null },
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
      required: true,
    },
    closingDate: { type: Date, default: null },
    resourceComment: { type: String, trim: true, default: "" },
    managerComments: { type: String, trim: true, default: "" },
    kpaRating: { type: Number, enum: [0, 1], default: null },
    hrRating: { type: Number, enum: [0, 1], default: null },
    verification: {
      type: String,
      enum: ["Pending", "Verified", "Changes Required", "Closed"],
      default: "Pending",
    },
    verificationDate: { type: Date, default: null },
    changesRequiredDate: { type: Date, default: null },
    verificationClosedDate: { type: Date, default: null },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "UserData", default: null },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "UserData" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "UserData" },
  },
  { timestamps: true },
);

individualMonthlyKpaSchema.index({ company: 1, department: 1, employee: 1, month: 1 });

module.exports = mongoose.model(
  "KraKpaIndividualMonthlyKpa",
  individualMonthlyKpaSchema,
);
