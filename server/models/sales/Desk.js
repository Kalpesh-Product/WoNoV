const mongoose = require("mongoose");

const deskSchema = new mongoose.Schema(
  {
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
    },
    month: {
      type: Date,
      required: true,
    },
    bookedDesks: {
      type: Number,
      required: true,
    },
    availableDesks: {
      type: Number,
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClientService",
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
  },
  { timestamps: true }
);

const Desk = mongoose.model("Desk", deskSchema);
module.exports = Desk;
