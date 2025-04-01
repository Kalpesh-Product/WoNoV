const mongoose = require("mongoose");

const roleLogSchema = new mongoose.Schema(
  {
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
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

const RoleLog = mongoose.model("RoleLog", roleLogSchema);
module.exports = RoleLog;
