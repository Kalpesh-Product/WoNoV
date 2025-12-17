const mongoose = require("mongoose");
const agreementsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
    url: {
      type: String,
    },
    id: {
      type: String,
    },
    type: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
const Agreements = mongoose.model("agreements", agreementsSchema);
module.exports = Agreements;
