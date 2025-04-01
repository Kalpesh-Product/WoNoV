const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    clientName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    phone: {
      type: String,
      minlength: 7,
      maxlength: 20,
      match: [/^\+?[0-9]+$/, "Invalid phone number format"],
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClientService",
    },
    sector: {
      type: String,
    },
    hoCity: {
      type: String,
    },
    hoState: {
      type: String,
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
    },
    cabinDesks: {
      type: Number,
      default: 0,
    },
    openDesks: {
      type: Number,
      default: 0,
    },
    totalDesks: {
      type: Number,
    },
    ratePerOpenDesk: {
      type: Number,
    },
    ratePerOpenDesk: {
      type: Number,
    },
    annualIncrement: {
      type: Number,
    },
    perDeskMeetingCredits: {
      type: Number,
      default: 0,
    },
    totalMeetingCredits: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    lockinPeriod: {
      type: Number,
    },
    occupiedImage: {
      imageId: String,
      imageUrl: String,
    },
    rentDate: { type: Date },
    nextIncrement: {
      type: Date,
    },
    goaLead: {
      name: {
        type: String,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
      },
      phone: {
        type: String,
        minlength: 7,
        maxlength: 20,
        match: [/^\+?[0-9]+$/, "Invalid phone number format"],
      },
    },
    localPoc: {
      name: {
        type: String,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
      },
      phone: {
        type: String,
        minlength: 7,
        maxlength: 20,
        match: [/^\+?[0-9]+$/, "Invalid phone number format"],
      },
    },
    hOPoc: {
      name: {
        type: String,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
      },
      phone: {
        type: String,
        minlength: 7,
        maxlength: 20,
        match: [/^\+?[0-9]+$/, "Invalid phone number format"],
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const CoworkingClient = mongoose.model("CoworkingClient", clientSchema);

module.exports = CoworkingClient;
