const mongoose = require("mongoose");

const housekeepingSchema = new mongoose.Schema({
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
});

const HouseKeepingSchedule = mongoose.model("HouseKeeping", housekeepingSchema);
module.exports = HouseKeepingSchedule;
