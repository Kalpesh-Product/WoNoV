const mongoose = require("mongoose");

const workationRevenueSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
  },
  nameOfClient: {
    type: String,
    required: true,
  },
  particulars: {
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
  totalAmount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

const WorkationRevenue = mongoose.model(
  "WorkationRevenue",
  workationRevenueSchema
);

module.exports = WorkationRevenue;
