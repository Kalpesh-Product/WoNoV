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
    mobile: {
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
      required: true, //Vendor Company
    },
    onboardingDate: {
      type: Date,
    },
    state: { type: String },
    city: { type: String },
    country: { type: String },
    pinCode: { type: String, match: [/^[1-9][0-9]{5}$/] },
    panIdNo: { type: String, match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/] },
    gstIn: {
      type: String,
      match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/],
    },
    partyType: { type: String },
    ifscCode: { type: String },
    bankName: { type: String },
    branchName: { type: String },
    nameOnAccount: { type: String },
    accountNumber: {
      type: String,
      match: [/^[0-9]+$/, "Invalid account number"],
    },
  },

  { timestamps: true }
);

const Vendor = mongoose.model("Vendor", vendorSchema);

module.exports = Vendor;
