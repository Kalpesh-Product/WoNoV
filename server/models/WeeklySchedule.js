const mongoose = require("mongoose");

const WeeklyScheduleSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },
    employee: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserData",
        required: true,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      isReassigned: {
        type: Boolean,
        default: false,
      },
    },
    substitutions: [
      {
        substitute: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "UserData",
        },
        fromDate: {
          type: Date,
        },
        toDate: {
          type: Date,
        },
        startTime: {
          type: Date,
        },
        endTime: {
          type: Date,
        },
        isActive: {
          type: Boolean,
        },
      },
    ],
  },
  { timestamps: true }
);

const WeeklySchedule = mongoose.model("WeeklySchedule", WeeklyScheduleSchema);
module.exports = WeeklySchedule;
