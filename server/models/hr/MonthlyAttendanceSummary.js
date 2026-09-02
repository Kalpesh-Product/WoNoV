const mongoose = require("mongoose");

const monthlyAttendanceSummarySchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      required: true,
      index: true,
    },
    month: {
      type: String,
      required: true,
      match: /^\d{4}-(0[1-9]|1[0-2])$/,
      index: true,
    },
    workingDays: { type: Number, default: 0, min: 0 },
    workingDaysAdjusted: { type: Boolean, default: false },
    attendanceDays: { type: Number, default: 0, min: 0 },
    weeklyOffs: { type: Number, default: 0, min: 0 },
    holidays: { type: Number, default: 0, min: 0 },
    timeOff: { type: Number, default: 0, min: 0 },
    overtime: { type: Number, default: 0, min: 0 },
    lop: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["Draft", "Finalized"],
      default: "Draft",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
    finalizedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

monthlyAttendanceSummarySchema.index(
  { company: 1, employee: 1, month: 1 },
  { unique: true },
);

module.exports = mongoose.model(
  "MonthlyAttendanceSummary",
  monthlyAttendanceSummarySchema,
);
