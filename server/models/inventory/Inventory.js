const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    itemName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },

    // New purchase
    newPurchaseUnits: {
      type: Number,
      required: false,
      default: 0,
    },
    newPurchasePerUnitPrice: {
      type: Number,
      required: false,
      default: 0,
    },
    newPurchaseInventoryValue: {
      type: Number,
      required: false,
      default: 0,
    },

    consumptions: [
      {
        quantity: Number,
        source: { type: String, enum: ["opening", "newPurchase"] },
        date: { type: Date, default: Date.now },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "UserData" },
      },
    ],
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserData",
    },
  },
  {
    timestamps: true,
  },
);

const Inventory = mongoose.model("Inventory", inventorySchema);
module.exports = Inventory;
