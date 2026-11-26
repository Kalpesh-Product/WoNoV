const mongoose = require("mongoose");
const workationClientSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    particulars: {
      type: String,
      trim: true,
      default: "",
    },
    startDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const WorkationClient = mongoose.model(
  "WorkationClient",
  workationClientSchema,
);
module.exports = WorkationClient;
