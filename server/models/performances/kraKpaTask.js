const mongoose = require("mongoose");

const kraKpaTasksSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "kraKpaRole",
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
    status: {
      type: String,
      required: true,
      enum: ["InProgress", "Completed", "Pending"],
    },
    completionDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const kraKpaTask = mongoose.model("kraKpaTask", kraKpaTasksSchema);
module.exports = kraKpaTask;
