const mongoose = require("mongoose");

const attendanceCorrectionSchema = new mongoose.Schema(
  {
    inTime: {
      type: Date,
    },
    outTime: {
      type: Date,
    },
    startBreak: {
      type: Date,
    },
    endBreak: {
      type: Date,
    },
    //original times
    originalInTime: {
      type: Date,
    },
    originalOutTime: {
      type: Date,
    },
    originalStartBreak: {
      type: Date,
    },
    originalEndBreak: {
      type: Date,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    //correction request status
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
  },
  {
    timestamps: true,
  }
);

const AttendanceCorrection = mongoose.model(
  "AttendanceCorrection",
  attendanceCorrectionSchema
);
module.exports = AttendanceCorrection;
