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
    },
    mobile: {
      type: String,
      minlength: 7,
      maxlength: 20,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    companyName: {
      type: String,
      required: true, //Vendor Company
    },
    onboardingDate: {
      type: Date,
    },
    state: { type: String },
    city: { type: String },
    country: { type: String },
    pinCode: { type: String },
    panIdNo: { type: String },
    gstIn: {
      type: String,
    },
    partyType: { type: String },
    ifscCode: { type: String },
    bankName: { type: String },
    branchName: { type: String },
    nameOnAccount: { type: String },
    accountNumber: {
      type: String,
    },
  },

  { timestamps: true }
);

const Vendor = mongoose.model("Vendor", vendorSchema);

module.exports = Vendor;
