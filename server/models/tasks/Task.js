const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  taskName: {
    type: String,
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
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
    // required: true,
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
    type: Date,
    default: null,
  },
  status: {
    type: String,
    required: true,
    enum: ["InProgress", "Completed", "Pending"],
  },
  priority: {
    type: String,
    default: "Medium",
    enum: ["High", "Medium", "Low"],
  },
  taskType: {
    type: String,
    enum: ["Daily", "Monthly", "Additional"],
    required: true,
  },
  //workCategory and location are maintenance related fileds
  workCategory: {
    type: String,
    enum: ["Internal", "External"],
    required: true,
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Unit",
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  taskTag: {
    type: String,
    enum: ["KRA", "KPI"],
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
