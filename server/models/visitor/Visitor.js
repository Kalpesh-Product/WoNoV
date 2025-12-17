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
    panNumber: {
      type: String,
    },
    panFile: {
      link: {
        type: String,
      },
      id: {
        type: String,
      },
    },
    otherFile: {
      link: {
        type: String,
      },
      id: {
        type: String,
      },
    },
    gstFile: {
      link: {
        type: String,
      },
      id: {
        type: String,
      },
    },
    idProof: {
      idType: {
        type: String,
      },
      idNumber: {
        type: String,
      },
    },
    gstNumber: {
      type: String,
      match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/],
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
    // clientCompany: {
    //   type: String, //Add Client form
    // },
    registeredClientCompany: {
      type: String,
    },
    brandName: {
      type: String,
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
