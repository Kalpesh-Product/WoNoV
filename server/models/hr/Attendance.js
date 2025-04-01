const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
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
    breakDuration: {
      type: Number,
      default: 0,
    },
    breakCount: {
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
  },
  {
    timestamps: true,
  }
);

const Attendance = mongoose.model("Attendance", attendanceSchema);
module.exports = Attendance;
