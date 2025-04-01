const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    middleName: {
      type: String,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    purposeOfVisit: {
      type: String,
      required: true,
    },
    idProof: {
      idType: {
        type: String,
        required: true,
      },
      idNumber: {
        type: String,
        required: true,
        unique: true,
      },
    },
    dateOfVisit: {
      type: Date,
      required: true,
    },
    checkIn: {
      type: Date,
    },
    checkOut: {
      type: Date,
    },
    scheduledTime: {
      type: Date,
    },
    toMeet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    visitorType: {
      type: String,
      enum: ["Walk In", "Scheduled", "Meeting"],
      default: "Walk In",
    },
    visitorCompany: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExternalClient",
    },
  },
  { timestamps: true }
);

const Visitor = mongoose.model("Visitor", visitorSchema);

module.exports = Visitor;
