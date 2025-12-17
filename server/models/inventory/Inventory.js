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
      type: String,
      required: true,
    },
    // Opening inventory
    openingInventoryUnits: {
      type: Number,
      required: true,
    },
    openingPerUnitPrice: {
      type: Number,
      required: true,
    },
    openingInventoryValue: {
      type: Number,
      required: true,
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
    date: {
      type: Date,
      default: new Date(),
    },

    // Closing inventory
    closingInventoryUnits: {
      type: Number,
      required: false,
      default: 0,
    },
    category: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Inventory = mongoose.model("Inventory", inventorySchema);
module.exports = Inventory;
