const mongoose = require("mongoose");

const partnershipSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    kind: { type: String, default: "partnership" },
    source: { type: String, default: "local", trim: true },
    sourceCompany: { type: String, default: "Local", trim: true },
    status: { type: String, default: "Pending", trim: true },
    pagename: { type: String, default: "Partnership", trim: true },
    name: { type: String, required: function () { return this.kind !== "subscription"; }, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    emailNormalized: { type: String, lowercase: true, trim: true },
    mobile: { type: String, required: function () { return this.kind === "partnership"; }, trim: true },
    phoneNormalized: { type: String, trim: true },
    message: { type: String, required: function () { return this.kind !== "subscription"; }, trim: true, maxlength: 500 },
    phone: { type: String, trim: true },
    subject: { type: String, trim: true },
    startupName: { type: String, trim: true },
    websiteUrl: { type: String, trim: true },
    linkedinProfileUrl: { type: String, trim: true },
    presentation: {
      filename: String,
      mimeType: String,
      size: Number,
      url: String,
      key: String,
    },
  },
  { timestamps: true, collection: "partnership" },
);

partnershipSchema.index(
  { company: 1, kind: 1, emailNormalized: 1 },
  { unique: true, partialFilterExpression: { emailNormalized: { $type: "string" } } },
);
partnershipSchema.index(
  { company: 1, kind: 1, phoneNormalized: 1 },
  { unique: true, partialFilterExpression: { phoneNormalized: { $type: "string" } } },
);

module.exports = mongoose.model("Partnership", partnershipSchema);
