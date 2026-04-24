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
      // required: true,
    },
    email: {
      type: String,
      // required: true,
    },
    gender: {
      type: String,
      // required: true,
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
      // required: true,
    },
    purposeOfVisit: {
      type: String,
      // required: true,
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
      // required: true,
    },
    checkIn: {
      type: Date,
    },
    checkOut: {
      type: Date,
    },
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
    checkedOutBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
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
    //previously added field, should now be substituted with visitorRoles
    visitorFlag: {
      type: String,
      enum: ["Visitor", "Client"],
    },
    visitorRoles: {
      type: [String],
      enum: ["Visitor", "Client"],
      default: ["Visitor"],
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
      enum: [
        "Walk In",
        "Scheduled",
        "Meeting",
        "Full-Day Pass",
        "Half-Day Pass",
      ],
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
    amount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    gstAmount: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: Boolean,
      default: false,
    },
    paymentMode: {
      type: String,
      enum: [
        "UPI",
        "Cash",
        "Cheque",
        "NEFT",
        "RTGS",
        "IMPS",
        "Credit Card",
        "ETC",
      ],
    },
    paymentVerification: {
      type: String,
      enum: ["Pending", "Under Review", "Verified"],
      default: "Pending",
    },
    paymentVerifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },

    paymentProof: {
      url: {
        type: String,
      },
      id: {
        type: String,
      },
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true },
);
visitorSchema.index({ email: 1, company: 1 }, { unique: true });

const Visitor = mongoose.model("Visitor", visitorSchema);

module.exports = Visitor;
