const mongoose = require("mongoose");

const partnerSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    kind: { type: String, default: "partnership" },
    source: { type: String, default: "local", trim: true },
    status: { type: String, default: "Pending", trim: true },
    pagename: { type: String, default: "Partner", trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    mobile: { type: String, trim: true },
    message: { type: String, trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Partner", partnerSchema);
