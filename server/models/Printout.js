const mongoose = require("mongoose");

const printoutSchema = new mongoose.Schema(
  {
    takenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      required: true,
    },
    takenAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },
    clientModel: {
      type: String,
      enum: ["CoworkingClient", "Company"],
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "clientModel",
      required: true,
    },
    requestedByModel: {
      type: String,
      enum: ["CoworkingMember", "UserData"],
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "requestedByModel",
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    printoutCount: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true },
);

printoutSchema.index({ timeTakenAt: -1 });
printoutSchema.index({ unit: 1, timeTakenAt: -1 });
printoutSchema.index({ client: 1, timeTakenAt: -1 });
printoutSchema.index({ requestedBy: 1, timeTakenAt: -1 });

const Printout = mongoose.model("Printout", printoutSchema);

module.exports = Printout;
