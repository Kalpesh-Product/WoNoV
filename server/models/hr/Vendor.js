const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    category: {
      type: String,
    },
    subCategory: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    phone: {
      type: String,
      minlength: 7,
      maxlength: 20,
      match: [/^\+?[0-9]+$/, "Invalid phone number format"],
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    companyName: {
      type: String,
      required: true,
    },
    state: { type: String },
    country: { type: String },
    panIdNo: { type: String },
    gstUin: { type: String },
    registrationType: { type: String },
    assesseeOfOtherTerritory: { type: Boolean, default: false },
    isEcommerceOperator: { type: Boolean, default: false },
    isDeemedExporter: { type: Boolean, default: false },
    partyType: { type: String },
    gstinUin: { type: String },
    isTransporter: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Vendor = mongoose.model("Vendor", vendorSchema);

module.exports = Vendor;
