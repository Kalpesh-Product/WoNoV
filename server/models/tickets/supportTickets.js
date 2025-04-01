const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
  },
  { timestamps: true }
);

const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);
module.exports = SupportTicket;
