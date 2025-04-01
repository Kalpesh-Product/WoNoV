const mongoose = require("mongoose");

const buildingSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    buildingName: {
      type: String,
      required: true,
    },
    fullAddress: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Building = mongoose.model("Building", buildingSchema);
module.exports = Building;
