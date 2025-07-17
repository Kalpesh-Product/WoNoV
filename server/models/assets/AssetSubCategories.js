const mongoose = require("mongoose");
const subCategorySchema = new mongoose.Schema({
  subCategoryName: {
    type: String,
    required: true,
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
});

const SubCategory = mongoose.model("SubCategory", subCategorySchema);
module.exports = SubCategory;
