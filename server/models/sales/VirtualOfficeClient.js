const mongoose = require("mongoose");

const pocSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" },
    phone: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const virtualOfficeSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    // Client Info
    clientName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },

    service: { type: String, required: true, trim: true },
    sector: { type: String, trim: true },
    state: { type: String, trim: true },
    city: { type: String, trim: true },

    // Space & Desks
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
    },

    cabinDesks: { type: Number, default: 0, min: 0 },
    cabinDeskRate: { type: Number, default: 0, min: 0 },
    cabinTotal: { type: Number, default: 0, min: 0 },

    openDesks: { type: Number, default: 0, min: 0 },
    openDeskRate: { type: Number, default: 0, min: 0 },
    openTotal: { type: Number, default: 0, min: 0 },

    annualIncrement: { type: Number, default: 0, min: 0 },

    perDeskMeetingCredits: { type: Number, default: 0, min: 0 },
    totalMeetingCredits: { type: Number, default: 0, min: 0 },

    // KYC / Dates
    termStartDate: { type: Date },
    termEnd: { type: Date },
    lockInPeriodMonths: { type: Number, min: 1 },

    rentDate: { type: Date },
    nextIncrementDate: { type: Date },

    rentStatus: {
      type: String,
      enum: ["Active", "Expired", "Terminated", "Not Active"],
      default: "Active",
    },

    clientStatus: {
      type: Boolean,
      default: true,
    },

    localPoc: { type: pocSchema, default: () => ({}) },
    hoPoc: { type: pocSchema, default: () => ({}) },
  },
  { timestamps: true },
);

module.exports = mongoose.model("VirtualOfficeClient", virtualOfficeSchema);
