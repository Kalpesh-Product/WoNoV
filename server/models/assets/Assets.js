const mongoose = require("mongoose");

const assetsSchema = new mongoose.Schema(
  {
    assetType: {
      type: String,
      enum: ["Physical", "Digital"],
    },
    assetId: {
      type: String,
      required: true,
    },
    rentedMonths: {
      type: Number,
    },
    tangable: {
      type: Boolean,
    },
    ownershipType: {
      type: String,
      enum: ["Owned", "Rental"],
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
    price: {
      type: Number,
      required: true,
    },
    warranty: {
      type: Number,
      required: true,
    },
    warrantyDocument: {
      link: String,
      documentId: String,
    },
    brand: {
      type: String,
      required: true,
    },
    isDamaged: {
      type: Boolean,
      default: false,
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
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
    },
    isUnderMaintenance: {
      type: Boolean,
      default: false,
    },
    isAssigned: {
      type: Boolean,
      default: false,
    },
    assignedAsset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssignAsset",
    },
    image: {
      id: String,
      url: String,
    },
  },
  { timestamps: true }
);

const Asset = mongoose.model("Asset", assetsSchema);
module.exports = Asset;
