const mongoose = require("mongoose");

const selfKraSchema = new mongoose.Schema(
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
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
      required: true,
    },
    closingDate: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "UserData" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "UserData" },
  },
  { timestamps: true },
);

selfKraSchema.index({ company: 1, department: 1, employee: 1, createdAt: -1 });

module.exports = mongoose.model("KraKpaSelfKra", selfKraSchema);
