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
    },

    // Closing inventory
    closingInventoryUnits: {
      type: Number,
      required: false,
      default: 0,
    },
    consumedNewPurchaseInventoryUnits: {
      type: Number,
      required: false,
      default: 0,
    },
    consumedOpenInventoryUnits: {
      type: Number,
      required: false,
      default: 0,
    },
    remainingInventoryUnits: {
      type: Number,
      required: false,
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
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
