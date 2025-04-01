const mongoose = require("mongoose");

const virtualOfficeRevenue = new mongoose.Schema(
  {
    actualRevenue: {
      type: String,
    },
    projectedRevenue: {
      type: String,
      required: true,
    },
    channel: {
      type: String,
      enum: ["Direct", "SPV"],
    },
    rentDate: {
      type: Date,
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoworkingClient",
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

const Revenue = mongoose.model("VirtualOfficeRevenue", virtualOfficeRevenue);
module.exports = Revenue;
