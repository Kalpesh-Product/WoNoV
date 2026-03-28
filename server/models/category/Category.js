const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      // unique: true,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    appliesTo: {
      type: [String],
      enum: ["asset", "inventory"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);

mongoose.models.AssetCategory ||
  mongoose.model("AssetCategory", categorySchema, "categories");
module.exports = Category;
