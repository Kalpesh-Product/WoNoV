const mongoose = require("mongoose");

const workationRevenueSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    nameOfClient: {
      type: String,
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkationClient",
    },
    particulars: {
      type: String,
      required: true,
    },
    taxableAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Paid", "UnPaid", "Partially Paid"],
      default: "UnPaid",
    },
    gst: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

const WorkationRevenue = mongoose.model(
  "WorkationRevenue",
  workationRevenueSchema,
);

module.exports = WorkationRevenue;
