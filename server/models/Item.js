const { default: mongoose } = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

itemSchema.index({ name: 1, department: 1, category: 1 }, { unique: true });
const Item = mongoose.model("Item", itemSchema);

module.exports = Item;
