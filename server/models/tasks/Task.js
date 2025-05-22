const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  taskName: {
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
  assignedTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
  ],
  description: {
    type: String,
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
    default: "Pending",
    enum: ["InProgress", "Completed", "Pending"],
  },
  priority: {
    type: String,
    default: "High",
    enum: ["High", "Medium", "Low"],
  },
  taskDuration: {
    type: String,
    enum: ["Daily", "Monthly", "Annually"],
    required: true,
  },
  //workCategory and location are maintenance related fileds
  workCategory: {
    type: String,
    enum: ["Internal", "External"],
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Unit",
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
