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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Unit = mongoose.model("Unit", unitSchema);
module.exports = Unit;
