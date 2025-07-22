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
  },
  {
    timestamps: true,
  }
);

const AssetCategory = mongoose.model("AssetCategory", categorySchema);
module.exports = AssetCategory;
