const mongoose = require("mongoose");

const executiveScheduleSchema = new mongoose.Schema(
  {
    admin: [
      {
        adminName: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "UserData",
        },
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
          required: true,
        },
        isActive: {
          type: Boolean,
        },
      },
    ],
    channel: {
      type: String,
      required: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  { timestamps: true }
);

const executiveSchedule = mongoose.model(
  "executiveSchedule",
  executiveScheduleSchema
);
module.exports = executiveSchedule;
