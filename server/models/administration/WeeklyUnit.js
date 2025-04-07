const mongoose = require("mongoose");

const WeeklyUnitSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    month: {
      type: String,
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
      empID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserData",
        required: true,
      },
      isActive: {
        type: Boolean,
        default: true,
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
        isActive: {
          type: Boolean,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("WeeklyUnit", WeeklyUnitSchema);
