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
    country: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    pincode: {
      type: Number,
      // required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Building = mongoose.model("Building", buildingSchema);
module.exports = Building;
