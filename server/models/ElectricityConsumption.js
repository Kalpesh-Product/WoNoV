const mongoose = require("mongoose");

const readingSchema = new mongoose.Schema({
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  readingAt: {
    type: Date,
    required: true,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserData",
    required: true,
  },
});

const monthlyBillSchema = new mongoose.Schema({
  totalConsumption: {
    type: Number,
    required: true,
    min: 0,
  },
  totalBillAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  billDate: {
    type: Date,
    required: true,
  },
  billTimestamp: {
    type: Date,
    default: Date.now,
  },
  monthKey: {
    type: String,
    required: true,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserData",
    required: true,
  },
});

const electricityConsumptionSchema = new mongoose.Schema(
  {
    meterNo: {
      type: String,
      required: true,
      trim: true,
    },
    readings: {
      type: [readingSchema],
      default: [],
    },
    consumption: {
      type: Number,
      min: 0,
      default: 0,
    },
    monthlyBills: {
      type: [monthlyBillSchema],
      default: [],
    },
  },
  { timestamps: true },
);

const ElectricityConsumption = mongoose.model(
  "ElectricityConsumption",
  electricityConsumptionSchema,
);

module.exports = ElectricityConsumption;


// const mongoose = require("mongoose");

// const electricityConsumptionSchema = new mongoose.Schema({
//     meterNo: {
//         type: Number,
//         required: true,
//     },
//     readings: [
//   {
//     value: Number,
//     readingAt: Date,
//     addedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "UserData",
//     },
//   }
// ],
//     consumption: {
//         type: Number,
//         required: true,
//     },
// }, { timestamps: true });
// const ElectricityConsumption = mongoose.model("ElectricityConsumption", electricityConsumptionSchema);
// module.exports = ElectricityConsumption;
