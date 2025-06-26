const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    building: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Building",
      required: true,
    },
    unitName: {
      type: String,
      required: true,
    },
    unitNo: {
      type: String,
      required: true,
    },
    sqft: {
      type: Number,
      // required: true,
    },
    clearImage: {
      imageId: String,
      url: String,
    },
    occupiedImage: {
      imageId: String,
      url: String,
    },
    cabinDesks: {
      type: Number,
      required: true,
    },
    openDesks: {
      type: Number,
      required: true,
    },
    isOnlyBudget: {
      type: Boolean,
      default: false,
    },
    includesBudget: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    adminLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
    itLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
    maintenanceLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
  },
  { timestamps: true }
);

const Unit = mongoose.model("Unit", unitSchema);
module.exports = Unit;
