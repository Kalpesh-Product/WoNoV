const mongoose = require("mongoose");

const readingEditSchema = new mongoose.Schema({
  meterNo: {
    type: String,
    required: true,
    trim: true,
  },

  previousReading: {
    type: Number,
    required: true,
    min: 0,
  },

  value: {
    type: Number,
    required: true,
    min: 0,
  },

  editedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserData",
    required: true,
  },

  editedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

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
  originalMeterNo: { type: String, trim: true },
  originalValue: { type: Number, min: 0 },
  originalPreviousReading: { type: Number, min: 0 },
  consumption: {
    type: Number,
    min: 0,
    default: 0,
  },
  editHistory: { type: [readingEditSchema], default: [] },
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
  originalMeterNo: {
  type: String,
  trim: true,
},

originalTotalConsumption: {
  type: Number,
  min: 0,
},

originalTotalBillAmount: {
  type: Number,
  min: 0,
},

editHistory: {
  type: [
    new mongoose.Schema({
      meterNo: {
        type: String,
        required: true,
        trim: true,
      },

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

      editedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserData",
        required: true,
      },

      editedAt: {
        type: Date,
        default: Date.now,
        required: true,
      },
    }),
  ],
  default: [],
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
