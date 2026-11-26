const mongoose = require("mongoose");

const alternateClientSchema = new mongoose.Schema(
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
    startDate: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AlternateClient", alternateClientSchema);
