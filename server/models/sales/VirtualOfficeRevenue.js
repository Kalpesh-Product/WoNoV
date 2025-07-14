const mongoose = require("mongoose");

const virtualOfficeRevenueSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VirtualOfficeClient",
      required: true,
    },
    location: {
      type: String,
      required: true,
    },

    channel: {
      type: String,
      enum: ["Direct", "SPV"],
      required: true,
    },
    taxableAmount: {
      type: Number,
      required: true,
    },
    revenue: {
      type: Number,
      required: true,
    },
    totalTerm: {
      type: Number, // Assuming in months
      required: true,
    },
    dueTerm: {
      type: Number, // Assuming in months
      required: true,
    },
    rentDate: {
      type: Date,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    rentStatus: {
      type: String,
      enum: ["Paid", "Unpaid", "Partial"],
      required: true,
    },
    pastDueDate: {
      type: Date,
    },
    annualIncrement: {
      type: Number, // Represented in percentage or amount depending on use-case
    },
    nextIncrementDate: {
      type: Date,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClientService",
    },
  },
  { timestamps: true }
);

const VirtualOfficeRevenue = mongoose.model(
  "VirtualOfficeRevenue",
  virtualOfficeRevenueSchema
);

module.exports = VirtualOfficeRevenue;
