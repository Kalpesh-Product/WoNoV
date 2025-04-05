const mongoose = require("mongoose");

const WeeklyUnitSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    month: {
      type: String, // e.g., "April 2025"
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
    weeklyAssignments: [
      {
        week: { type: Number, required: true },
        employee: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "UserData",
          required: true,
        },
        substitutions: [
          {
            substitute: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "UserData",
              required: true,
            },
            fromDate: {
              type: Date,
              required: true,
            },
            toDate: {
              type: Date,
              required: true,
            },
          },
        ],
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WeeklyUnit", WeeklyUnitSchema);
