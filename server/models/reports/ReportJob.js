const mongoose = require("mongoose");

const ReportJobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    filters: {
      startDate: Date,
      endDate: Date,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    data: D, // report payload
    error: {
      message: String,
      stack: String,
    },
    completedAt: Date,
    retryCount: Number,
    startedAt: Date,
    failedAt: Date,
    bullJobId: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("ReportJob", ReportJobSchema);
