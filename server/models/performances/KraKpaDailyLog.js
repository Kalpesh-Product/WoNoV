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
    sourceSelfKra: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KraKpaSelfKra",
      default: null,
    },
    sourceSelfKpa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KraKpaSelfKpa",
      default: null,
    },
    carriedFromDailyLog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KraKpaDailyLog",
      default: null,
    },
    date: { type: Date, required: true },
    isCarryForward: { type: Boolean, default: false },
    deadline: { type: Date, default: null },
    dayTaskName: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["KRA", "KPA", "GENERAL"],
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
    resourceCommentBy: { type: mongoose.Schema.Types.ObjectId, ref: "UserData", default: null },
    managerComments: { type: String, trim: true, default: "" },
    managerCommentsBy: { type: mongoose.Schema.Types.ObjectId, ref: "UserData", default: null },
    hrComments: { type: String, trim: true, default: "" },
    hrCommentsBy: { type: mongoose.Schema.Types.ObjectId, ref: "UserData", default: null },
    reviewerComments: { type: String, trim: true, default: "" },
    startTime: { type: Date, default: null },
    endTime: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    editHistory: {
      type: [{
        editedBy: { type: mongoose.Schema.Types.ObjectId, ref: "UserData", required: true },
        editedAt: { type: Date, required: true },
        changes: [{
          field: { type: String, required: true },
          label: { type: String, required: true },
          oldValue: { type: mongoose.Schema.Types.Mixed, default: null },
          newValue: { type: mongoose.Schema.Types.Mixed, default: null },
        }],
      }],
      default: [],
    },
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
dailyLogSchema.index(
  { company: 1, sourceSelfKra: 1, date: 1 },
  {
    unique: true,
    partialFilterExpression: {
      sourceSelfKra: { $type: "objectId" },
      isDeleted: false,
    },
  },
);
dailyLogSchema.index(
  { company: 1, sourceSelfKpa: 1, date: 1 },
  {
    unique: true,
    partialFilterExpression: {
      sourceSelfKpa: { $type: "objectId" },
      isDeleted: false,
    },
  },
);
dailyLogSchema.index(
  { company: 1, carriedFromDailyLog: 1, date: 1 },
  {
    unique: true,
    partialFilterExpression: {
      carriedFromDailyLog: { $type: "objectId" },
      isDeleted: false,
    },
  },
);

module.exports = mongoose.model("KraKpaDailyLog", dailyLogSchema);
