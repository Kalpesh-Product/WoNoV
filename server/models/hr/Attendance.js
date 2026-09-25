const mongoose = require("mongoose");
const attendanceImageSchema = new mongoose.Schema(
  { url: { type: String, required: true }, publicId: { type: String, required: true } },
  { _id: false },
);

const shiftSnapshotSchema = new mongoose.Schema(
  {
    shiftId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    shiftName: {
      type: String,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    checkInGraceMinutes: {
      type: Number,
      default: 15,
    },
  },
  { _id: false },
);

const attendanceSchema = new mongoose.Schema(
  {
    inTime: {
      type: Date,
    },
    outTime: {
      type: Date,
    },
    inImage: attendanceImageSchema,
    outImage: attendanceImageSchema,
    breaks: [
      {
        startBreak: {
          type: Date,
        },
        endBreak: {
          type: Date,
        },
        startImage: attendanceImageSchema,
        endImage: attendanceImageSchema,
      },
    ],
    breakDuration: {
      type: Number,
      default: 0,
    },
    entryType: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    shiftSnapshot: {
      type: shiftSnapshotSchema,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Approved",
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
  },
);

const Attendance = mongoose.model("Attendance", attendanceSchema);
module.exports = Attendance;
