const mongoose = require("mongoose");

const kraCategorySchema = new mongoose.Schema(
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
      index: true,
    },
    categoryName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    normalizedName: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      default: null,
    },
  },
  { timestamps: true },
);

kraCategorySchema.index(
  { company: 1, department: 1, normalizedName: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);

module.exports = mongoose.model("KraCategory", kraCategorySchema);
