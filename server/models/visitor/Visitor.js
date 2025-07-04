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
      // required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    sector: {
      type: String,
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
      },
      idNumber: {
        type: String,
      },
    },
    meeting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting",
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
      default: null,
    },
    scheduledDate: {
      type: Date,
    },
    scheduledStartTime: {
      type: Date,
    },
    scheduledEndTime: {
      type: Date,
    },
    toMeet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData", //Add Visitor form
    },
    clientToMeet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoworkingMember", //Add Visitor form
    },
    visitorFlag: {
      type: String,
      enum: ["Visitor", "Client"],
    },
    clientCompany: {
      type: String, //Add Client form
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
      type: String, //Add Visitor form
    },
    toMeetCompany: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoworkingClient", //Add Visitor form
    },
    building: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Building",
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
    },
  },
  { timestamps: true }
);

const Visitor = mongoose.model("Visitor", visitorSchema);

module.exports = Visitor;
