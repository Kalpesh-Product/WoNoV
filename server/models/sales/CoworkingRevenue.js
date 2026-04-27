const mongoose = require("mongoose");

const coworkingClientRevenue = new mongoose.Schema(
  {
    clients: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoworkingClient",
    },
    clientName: {
      type: String,
    },
    clientInvoiceName: {
      type: String,
    },
    channel: {
      type: String,
    },
    noOfDesks: {
      type: Number,
      // required: true,
    },
    deskRate: {
      type: Number,
      // required: true,
    },
    occupation: {
      type: String,
    },
    revenue: {
      type: Number,
      // required: true,
    },
    totalTerm: {
      type: Number, // In months or as required
    },
    dueTerm: {
      type: Number, // In months or as required
    },
    rentDate: {
      type: Date,
    },
    rentStatus: {
      type: String,
      // enum: ["paid", "unpaid", "partial"], // Consider enum: ['paid', 'unpaid', 'partial'] if applicable
    },
    pastDueDate: {
      type: Date,
    },
    annualIncrement: {
      type: Number, // e.g. 10 for 10% increment
    },
    nextIncrementDate: {
      type: Date,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
  },
  { timestamps: true },
);

const CoworkingRevenue = mongoose.model(
  "CoworkingClientRevenue",
  coworkingClientRevenue,
);

module.exports = CoworkingRevenue;
