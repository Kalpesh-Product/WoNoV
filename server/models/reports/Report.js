const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    module: String,
    // reportKey: {
    //   type: String,
    //   unique: true,
    // },
    reportName: String,
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    // description: String,
    lastGeneratedAt: Date,
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Report", ReportSchema);
