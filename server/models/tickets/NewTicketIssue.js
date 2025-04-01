const mongoose = require("mongoose");
const newTicketIssueSchema = new mongoose.Schema(
  {
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    issueTitle: {
      type: String,
      required: true,
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
    status: {
      type: String,
      enum: ["Approve", "Reject", "Pending"],
    },
  },
  { timestamps: true }
);

const NewTicketIssue = mongoose.model("NewTicketIssue", newTicketIssueSchema);
module.exports = NewTicketIssue;
