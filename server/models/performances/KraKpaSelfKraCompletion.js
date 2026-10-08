const mongoose = require("mongoose");

const selfKraCompletionSchema = new mongoose.Schema(
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
    kraTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KraKpaSelfKra",
      required: true,
    },
    occurrenceDate: {
      type: String,
      required: true,
      match: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      required: true,
    },
    status: {
      type: String,
      enum: ["Completed"],
      default: "Completed",
      required: true,
    },
    completedAt: { type: Date, required: true, default: Date.now },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      required: true,
    },
  },
  { timestamps: true },
);

selfKraCompletionSchema.index(
  { kraTemplate: 1, occurrenceDate: 1 },
  { unique: true },
);
selfKraCompletionSchema.index({
  company: 1,
  department: 1,
  employee: 1,
  occurrenceDate: 1,
});

module.exports = mongoose.model(
  "KraKpaSelfKraCompletion",
  selfKraCompletionSchema,
);
