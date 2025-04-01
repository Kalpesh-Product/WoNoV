const mongoose = require("mongoose");

const assetLogSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Asset",
  },
  assignAsset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AssignAsset",
  },
  action: {
    type: String,
    required: true,
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserData",
    required: true,
  },
  changes: {
    type: Object,
    default: {},
  },
  ipAddress: {
    type: String,
  },
  remarks: {
    type: String,
  },
  status: {
    type: String,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
});

const AssetLog = mongoose.model("AssetLog", assetLogSchema);
module.exports = AssetLog;
