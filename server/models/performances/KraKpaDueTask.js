const mongoose = require("mongoose");

const dueTaskSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      required: true,
    },
    dueTaskName: { type: String, required: true, trim: true },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      required: true,
    },
    identificationDate: { type: Date, required: true },
    taskIdentifier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      required: true,
    },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Pending", "Closed"],
      default: "Pending",
      required: true,
    },
    closureDate: { type: Date, default: null },
    delayedDays: { type: Number, min: 0, default: 0 },
    comments: { type: String, trim: true, default: "" },
    isDeleted: { type: Boolean, default: false },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "UserData" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "UserData" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "UserData" },
  },
  { timestamps: true },
);

dueTaskSchema.index({ company: 1, department: 1, employee: 1, deadline: 1 });

module.exports = mongoose.model("KraKpaDueTask", dueTaskSchema);
