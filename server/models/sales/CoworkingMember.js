const mongoose = require("mongoose");

const coworkingClientMember = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    designation: {
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
    bloodGroup: {
      type: String,
    },
    dob: {
      type: Date,
      required: true,
    },
    emergencyName: {
      type: String,
      trim: true,
      minlength: 2,
    },
    emergencyNo: {
      type: String,
      minlength: 7,
      maxlength: 20,
      match: [/^\+?[0-9]+$/, "Invalid phone number format"],
    },
    biznestDoj: {
      type: Date,
    },
    biometricStatus: {
      type: Boolean,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoworkingClient",
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
  },
  { timestamps: true }
);

const CoworkingClientMember = mongoose.model(
  "CoworkingClientMember",
  coworkingClientMember
);
module.exports = CoworkingClientMember;
