const mongoose = require("mongoose");

const electricityConsumptionSchema = new mongoose.Schema({
    meterNo: {
        type: Number,
        required: true,
    },
    readings: [
  {
    value: Number,
    readingAt: Date,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
  }
],
    consumption: {
        type: Number,
        required: true,
    },
}, { timestamps: true });
const ElectricityConsumption = mongoose.model("ElectricityConsumption", electricityConsumptionSchema);
module.exports = ElectricityConsumption;