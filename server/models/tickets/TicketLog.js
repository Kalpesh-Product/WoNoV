const mongoose = require("mongoose");

const ticketLogSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
    },
    newTicket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NewTicketIssue",
    },
    supportTicket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SupportTicket",
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

const TicketLog = mongoose.model("TicketLog", ticketLogSchema);
module.exports = TicketLog;
