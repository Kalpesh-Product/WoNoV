const mongoose = require("mongoose");
const attendanceImageSchema = new mongoose.Schema(
  {
    url: String,
    publicId: String,
  },
  { _id: false },
);

const breakCorrectionSchema = new mongoose.Schema(
  {
    startBreak: Date,
    endBreak: Date,
    startImage: attendanceImageSchema,
    endImage: attendanceImageSchema,
  },
  { _id: false },
);

const attendanceCorrectionSchema = new mongoose.Schema(
  {
    inTime: {
      type: Date,
    },
    outTime: {
      type: Date,
    },
    correctedBreaks: [breakCorrectionSchema],
    //original times
    originalInTime: {
      type: Date,
    },
    originalOutTime: {
      type: Date,
    },
    originalBreaks: [breakCorrectionSchema],
    reason: {
      type: String,
    },
    // Requested on behalf of someone
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      required: true,
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
