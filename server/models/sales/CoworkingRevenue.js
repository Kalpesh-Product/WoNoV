const mongoose = require("mongoose");

const coworkingClientRevenue = new mongoose.Schema(
  {
    actualRevenue: {
      type: String,
    },
    projectedRevenue: {
      type: String,
      required: true,
    },
    month: {
      type: Date,
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VirtualOfficeClient",
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

const Revenue = mongoose.model("CoworkingClientRevenue", coworkingClientRevenue);
module.exports = Revenue;
