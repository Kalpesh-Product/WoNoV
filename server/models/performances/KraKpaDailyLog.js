const mongoose = require("mongoose");

const dailyLogSchema = new mongoose.Schema(
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
    sourceDueTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KraKpaDueTask",
      default: null,
    },
    date: { type: Date, required: true },
    dayTaskName: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["KRA", "KPA"],
      required: true,
    },
    kpaSlot: {
      type: String,
      enum: ["", "11:00 AM - 12:30 PM", "03:00 PM - 04:30 PM"],
      default: "",
    },
    status: {
      type: String,
      enum: ["Due", "Done"],
      default: "Due",
      required: true,
    },
    reasonForCarryForward: { type: String, trim: true, default: "" },
    resourceComment: { type: String, trim: true, default: "" },
    managerComments: { type: String, trim: true, default: "" },
    hrComments: { type: String, trim: true, default: "" },
    reviewerComments: { type: String, trim: true, default: "" },
    completedAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "UserData" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "UserData" },
  },
  { timestamps: true },
);

dailyLogSchema.index({ company: 1, department: 1, employee: 1, date: -1 });
dailyLogSchema.index(
  { company: 1, sourceDueTask: 1, date: 1 },
  {
    unique: true,
    partialFilterExpression: {
      sourceDueTask: { $type: "objectId" },
      isDeleted: false,
    },
  },
);

module.exports = mongoose.model("KraKpaDailyLog", dailyLogSchema);
