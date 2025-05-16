const mongoose = require("mongoose");

const alternateRevenueSchema = new mongoose.Schema(
  {
    particulars: {
      type: String,
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    name: {
      type: String,
      required: true,
    },
    taxableAmount: {
      type: Number,
      required: true,
    },
    gst: {
      type: Number,
      required: true,
    },
    invoiceAmount: {
      type: Number,
      required: true,
    },
    invoiceCreationDate: {
      type: Date,
      required: true,
    },
    invoicePaidDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true, // Optional: Adds createdAt and updatedAt fields
  }
);

const AlternateRevenue = mongoose.model(
  "AlternateRevenue",
  alternateRevenueSchema
);
module.exports = AlternateRevenue;
