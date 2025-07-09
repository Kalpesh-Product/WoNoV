const mongoose = require("mongoose");

const ticketsSchema = new mongoose.Schema(
  {
    ticket: {
      type: String,
      required: true,
    },
    raisedToDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Open",
        "In Progress",
        "Closed",
        "Pending",
        "Escalated",
        "Rejected",
      ],
      default: "Open",
    },
    specifiedReason: {
      type: String,
    },
    escalatedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket",
      },
    ],
    assignees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserData",
      },
    ],
    closedAt: Date,
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
    acceptedAt: Date,
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
    reject: {
      rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserData",
      },
      reason: {
        type: String,
      },
    },
    resolvedDate: Date,
    assignedAt: Date,
    escalatededAt: Date,
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    image: {
      id: String,
      url: String,
    },
  },
  { timestamps: true }
);

const Ticket = mongoose.model("Ticket", ticketsSchema);
module.exports = Ticket;
