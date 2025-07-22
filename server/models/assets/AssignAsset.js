const mongoose = require("mongoose");

const assignAssetSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
    },
    fromDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    toDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
    rejectededBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
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
      enum: ["Approved", "Rejected", "Pending", "Revoked"],
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
