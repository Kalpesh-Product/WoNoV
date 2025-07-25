const mongoose = require("mongoose");
const subCategorySchema = new mongoose.Schema(
  {
    subCategoryName: {
      type: String,
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssetCategory",
    },
    description: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const AssetSubCategory = mongoose.model("SubCategory", subCategorySchema);
module.exports = AssetSubCategory;
