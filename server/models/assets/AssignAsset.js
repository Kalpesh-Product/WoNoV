const mongoose = require("mongoose");

const assignAssetSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
    },
    status: {
      type: String,
      enum: ["Approved", "Rejected", "Pending"],
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const AssignAsset = mongoose.model("AssignAsset", assignAssetSchema);
module.exports = AssignAsset;
