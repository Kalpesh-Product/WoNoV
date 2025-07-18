const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  departmentId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
  },
  templates: [
    {
      name: {
        type: String,
        required: true,
      },
      documentLink: {
        type: String,
        required: true,
      },
      documentId: {
        type: String,
        required: true,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: null,
      },
    },
  ],
  assetCategories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssetCategory",
    },
  ],
});

const Department = mongoose.model("Department", departmentSchema);

module.exports = Department;
