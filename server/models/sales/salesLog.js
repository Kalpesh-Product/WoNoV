const mongoose = require("mongoose");

const salesLogSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
    },
    revenue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Revenue",
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
    },
    deskData: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeskData",
    },
    deskBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeskBooking",
    },
    action: {
      type: String,
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      required: true,
    },
    changes: {
      type: Object,
      default: {},
    },
    remarks: {
      type: String,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    status: {
      type: String,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  { timestamps: true }
);

const SalesLog = mongoose.model("SalesLog", salesLogSchema);
module.exports = SalesLog;
