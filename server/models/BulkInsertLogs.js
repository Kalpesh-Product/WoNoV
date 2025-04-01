const mongoose = require("mongoose");

const bulkInsertSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    action: {
      type: String,
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      required: true,
    },
    remarks: {
      type: String,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    status: {
      type: String,
    },
  },
  { timestamps: true }
);

const BulkInsertLog = mongoose.model("BulkInsertLog", bulkInsertSchema);
module.exports = BulkInsertLog;
