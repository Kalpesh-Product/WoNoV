const mongoose = require("mongoose");

const houseKeepingSchema = new mongoose.Schema({
  // Basic Information
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
  },
  dateOfBirth: { type: Date },
  mobilePhone: { type: String },
  email: { type: String },

  // Home Address Information
  addressLine1: { type: String },
  addressLine2: { type: String },
  country: { type: String },
  state: { type: String },
  city: { type: String },
  pinCode: { type: String },

  // Original fields
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Unit",
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  isDeleted: { type: Boolean, default: false },
});

const HouseKeepingStaff = mongoose.model(
  "HouseKeepingStaff",
  houseKeepingSchema
);
module.exports = HouseKeepingStaff;
