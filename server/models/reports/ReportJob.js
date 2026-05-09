const mongoose = require("mongoose");

const ReportJobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
    module: String,
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
    data: Object, // report payload
    error: String,
    completedAt: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("ReportJob", ReportJobSchema);
