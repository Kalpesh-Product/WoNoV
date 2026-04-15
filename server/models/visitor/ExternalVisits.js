const mongoose = require("mongoose");

const externalVisitSchema = new mongoose.Schema(
  {
    visitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visitor",
      required: true,
      index: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    legacyVisitorEntryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visitor",
      default: null,
      index: true,
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
      index: true,
    },
    dateOfVisit: {
      type: Date,
      default: Date.now,
      index: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      default: null,
    },
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      default: null,
    },
    checkedOutBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      default: null,
    },
    amount: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    gstAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
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
      default: null,
    },
    paymentProof: {
      url: {
        type: String,
      },
      id: {
        type: String,
      },
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

externalVisitSchema.index({ visitorId: 1, checkIn: -1 });
externalVisitSchema.index({ company: 1, checkIn: -1, visitorType: 1 });

const ExternalVisits = mongoose.model("ExternalVisits", externalVisitSchema);

module.exports = ExternalVisits;
