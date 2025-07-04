const mongoose = require("mongoose");

const assetsSchema = new mongoose.Schema({
  assetType: {
    type: String,
    enum: ["Physical", "Digital"],
  },
  assetId: {
    type: String,
    required: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
  },
  name: {
    type: String,
    required: true,
  },
  purchaseDate: {
    type: Date,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  warranty: {
    type: Number,
    required: true,
  },
  image: {
    url: String,
    id: String,
  },
  brand: {
    type: String,
    required: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Unit",
  },
  assignedTo: {
    person: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AssetCategory",
  },
  isUnderMaintenance: {
    type: Boolean,
    default: false,
  },
});

const Asset = mongoose.model("Asset", assetsSchema);
module.exports = Asset;
