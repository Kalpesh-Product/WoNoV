const mongoose = require("mongoose");
const testAgreementsSchema = new mongoose.Schema(
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
const TestAgreements = mongoose.model("Testagreements", testAgreementsSchema);
module.exports = TestAgreements;
