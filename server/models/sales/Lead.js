const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    dateOfContact: {
      type: Date,
    },
    companyName: {
      type: String,
    },
    serviceCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClientService",
    },
    leadStatus: {
      type: String,
    },
    proposedLocations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Unit",
      },
    ],
    sector: {
      type: String,
    },
    headOfficeLocation: {
      type: String,
    },
    officeInGoa: {
      type: Boolean,
    },
    pocName: {
      type: String,
    },
    designation: {
      type: String,
    },
    contactNumber: {
      type: String,
    },
    emailAddress: {
      type: String,
    },
    leadSource: {
      type: String,
    },
    period: {
      type: String,
      required: true,
    },
    openDesks: {
      type: Number,
    },
    cabinDesks: {
      type: Number,
    },
    totalDesks: {
      type: Number,
    },
    clientBudget: {
      type: Number,
    },
    startDate: {
      type: Date,
    },
    remarksComments: {
      type: String,
    },
    lastFollowUpDate: {
      type: Date
    },
  },
  { timestamps: true }
);

const Lead = mongoose.model("Lead", LeadSchema);
module.exports = Lead;
