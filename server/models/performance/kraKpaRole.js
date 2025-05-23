const mongoose = require("mongoose");

const kraKpaRolesSchema = new mongoose.Schema(
  {
    task: {
      type: String,
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
    description: {
      type: String,
      // required: true,
    },
    taskType: {
      type: String,
      enum: ["KPA", "KRA"],
      required: true,
    },
    kpaDuration: {
      type: String,
      enum: ["Monthly", "Annually"],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    assignedDate: {
      type: Date,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    dueTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending"],
      default: "Pending",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const kraKpaRole = mongoose.model("kraKpaRole", kraKpaRolesSchema);
module.exports = kraKpaRole;
