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
    completedDate: [{ type: Date }],
    kpaDuration: {
      type: String,
      enum: ["Monthly", "Annually"],
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
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
