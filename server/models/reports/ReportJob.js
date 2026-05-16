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
    departments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
      },
    ],
    filters: {
      startDate: Date,
      endDate: Date,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "completed",
        "failed",
        "canceled",
        "retrying",
      ],
      default: "pending",
    },
    data: Object, // report payload
    error: {
      message: String,
      stack: String,
    },
    completedAt: Date,
    retryCount: Number,
    startedAt: Date,
    failedAt: Date,
    bullJobId: String,
    cancelReason: String,
    canceledAt: Date,
    requestKey: String, //unique key to avoid multiple duplicate report jobs
    isManualRetry: {
      type: Boolean,
      default: false,
    },
    retryWindowStartedAt: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("ReportJob", ReportJobSchema);
