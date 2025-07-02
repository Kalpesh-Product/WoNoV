const mongoose = require("mongoose");

const assignAssetSchema = new mongoose.Schema({
  asset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Asset",
  },
  assignee: {
    person: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
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
  assignType: {
    type: String,
    enum: ["Rental", "Company owned"],
  },
  dateOfAssigning: {
    type: Date,
    required: true,
  },
});

const AssignAsset = mongoose.model("AssignAsset", assignAssetSchema);
module.exports = AssignAsset;
