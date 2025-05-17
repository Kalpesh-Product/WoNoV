const mongoose = require("mongoose");

const coworkingMemberSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoworkingClient",
    },
    employeeName: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
    },
    mobileNo: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    bloodGroup: {
      type: String,
    },
    dob: {
      type: Date,
    },
    emergencyName: {
      type: String,
    },
    emergencyNo: {
      type: String,
    },
    dateOfJoining: {
      type: Date,
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
    },
    biometricStatus: {
      type: String,
      enum: ["Active", "Inactive", "Pending"], // customize if needed
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const CoworkingMember = mongoose.model(
  "CoworkingMember",
  coworkingMemberSchema
);
module.exports = CoworkingMember;
