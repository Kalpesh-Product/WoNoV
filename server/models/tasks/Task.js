const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    taskName: {
      type: String,
      required: true,
    },
    taskType: {
      type: String,
      enum: ["Self", "Department"],
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
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
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
    completedDate: {
      type: Date,
    },
    dueTime: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      default: "Pending",
      enum: ["InProgress", "Completed", "Pending"],
    },
    // priority: {
    //   type: String,
    //   default: "High",
    //   enum: ["High", "Medium", "Low"],
    // },
    //workCategory and location are maintenance related fields
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
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
