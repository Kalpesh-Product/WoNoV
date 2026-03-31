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
    // itemName: {
    //   type: String,
    //   required: true,
    // },
    itemName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },
    // Opening inventory
    // openingInventoryUnits: {
    //   type: Number,
    //   // required: true,
    // },
    // openingPerUnitPrice: {
    //   type: Number,
    //   // required: true,
    // },
    // openingInventoryValue: {
    //   type: Number,
    //   // required: true,
    // },

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

    // Closing inventory
    remainingNewPurchaseInventoryUnits: {
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

    consumptions: [
      {
        quantity: Number,
        source: { type: String, enum: ["opening", "newPurchase"] },
        date: { type: Date, default: Date.now },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "UserData" },
      },
    ],
    remainingOpeningInventoryUnits: {
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

// const inventorySchema = new mongoose.Schema({
//   company: { type: ObjectId, ref: "Company", required: true },
//   department: { type: ObjectId, ref: "Department" },
//   itemName: { type: ObjectId, ref: "Item", required: true },

//   unit: { type: ObjectId, ref: "Unit" },
//   category: { type: ObjectId, ref: "Category" },

//   // Purchase for that period
//   newPurchaseUnits: { type: Number, default: 0 },
//   newPurchasePerUnitPrice: { type: Number, default: 0 },

//   // Transactions
//   consumptions: [
//     {
//       quantity: Number,
//       source: { type: String, enum: ["opening", "newPurchase"] },
//       date: { type: Date, default: Date.now },
//       addedBy: { type: ObjectId, ref: "UserData" },
//     },
//   ],

//   date: { type: Date, default: Date.now },
//   addedBy: { type: ObjectId, ref: "UserData" },
// }, { timestamps: true });

const Inventory = mongoose.model("Inventory", inventorySchema);
module.exports = Inventory;
