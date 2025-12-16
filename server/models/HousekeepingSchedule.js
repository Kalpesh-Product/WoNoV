const mongoose = require("mongoose");

const housekeepingSchema = new mongoose.Schema(
  {
    housekeepingMember: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Housekeepingstaff",
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    substitutions: [
      {
        substitute: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Housekeepingstaff",
        },
        fromDate: {
          type: Date,
        },
        toDate: {
          type: Date,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const HouseKeepingSchedule = mongoose.model("HouseKeeping", housekeepingSchema);
module.exports = HouseKeepingSchedule;
