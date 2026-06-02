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
    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: true, 
    },

    designation: {
      type: String,
    },
    mobileNo: {
      type: String,
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
    credits: {
      type: Number,
      default: 10,
    },
    biometricStatus: {
      type: String,
       enum: ["Active", "Inactive", "Pending", "Approved", "Revoke"],  // customize if needed
      default: "Pending",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const CoworkingMember = mongoose.model(
  "CoworkingMember",
  coworkingMemberSchema,
);
module.exports = CoworkingMember;
