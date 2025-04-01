const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserData",
  },
  assignedTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
  ],
  description: {
    type: String,
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
  status: {
    type: String,
    enum: ["Upcoming", "In progress", "Pending", "Completed"],
    required: true,
  },
  priority: {
    type: String,
    enum: ["High", "Medium", "Low"],
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  extension: {
    isExtended: {
      type: Boolean,
    },
    extendedDate: {
      type: Date,
    },
    extendedTime: {
      type: String,
      match: /^([0-1]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/,
    },
    reason: {
      type: String,
    },
  },
});

const Project = mongoose.model("Project", projectSchema);
module.exports = Project;
