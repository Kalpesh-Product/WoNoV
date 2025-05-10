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
    clientName: {
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

const VirtualOfficeRevenue = mongoose.model(
  "VirtualOfficeRevenue",
  virtualOfficeRevenue
);
module.exports = VirtualOfficeRevenue;
