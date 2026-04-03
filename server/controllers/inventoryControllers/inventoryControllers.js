const { default: mongoose } = require("mongoose");
const Inventory = require("../../models/inventory/Inventory");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");
const { Readable } = require("stream");
const csvParser = require("csv-parser");
const Category = require("../../models/category/Category");
const Item = require("../../models/Item");

const createInventory = async (req, res, next) => {
  const { user, company } = req;

  try {
    const {
      department,
      itemName,
      newPurchaseUnits = 0,
      newPurchasePerUnitPrice = 0,
      unit,
    } = req.body;

    /* ------------------ Validations ------------------ */

    if (!itemName) {
      return res.status(400).json({ message: "Item is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(itemName)) {
      return res.status(400).json({ message: "Invalid item id" });
    }

    if (!mongoose.Types.ObjectId.isValid(unit)) {
      return res.status(400).json({ message: "Invalid unit id" });
    }

    if (!mongoose.Types.ObjectId.isValid(department)) {
      return res.status(400).json({ message: "Invalid department id" });
    }

    const itemExists = await Item.exists({ _id: itemName, isActive: true });
    if (!itemExists) {
      return res.status(400).json({ message: "Item not found or inactive" });
    }

    if (Number(newPurchaseUnits) < 0 || Number(newPurchasePerUnitPrice) < 0) {
      return res.status(400).json({
        message: "Purchase values must be non-negative",
      });
    }

    const lastInventory = await Inventory.findOne({
      company,
      department: department,
      itemName: itemName,
      unit: unit,
    }).sort({ createdAt: -1 });

    const previousRemaining = lastInventory?.remainingUnits || 0;

    /* ------------------ Create ------------------ */

    const inventory = await Inventory.create({
      company,
      department,
      itemName,
      unit,
      addedBy: user,
      newPurchaseUnits,
      newPurchasePerUnitPrice,
      newPurchaseInventoryValue:
        Number(newPurchaseUnits) * Number(newPurchasePerUnitPrice),
      remainingUnits: previousRemaining + Number(newPurchaseUnits),
    });

    return res.status(201).json(inventory);
  } catch (error) {
    next(error);
  }
};

// GET Inventories with Aggregation (for complex derived fields and optimized lookups)

const getInventories = async (req, res, next) => {
  try {
    const { department } = req.query;
    const { company } = req;

    const match = {
      company: new mongoose.Types.ObjectId(company),
      ...(department && {
        department: new mongoose.Types.ObjectId(department),
      }),
    };

    // const inventories = await Inventory.aggregate([
    //   {
    //     $match: match,
    //   },

    //   {
    //     $sort: { createdAt: 1 },
    //   },

    //   /* ------------------ Window: Get Previous Entry ------------------ */

    //   {
    //     $setWindowFields: {
    //       partitionBy: {
    //         itemName: "$itemName",
    //         unit: "$unit",
    //         department: "$department",
    //       },
    //       sortBy: { createdAt: 1 },
    //       output: {
    //         prevUnits: {
    //           $shift: {
    //             output: "$newPurchaseUnits",
    //             by: -1,
    //           },
    //         },
    //         prevPrice: {
    //           $shift: {
    //             output: "$newPurchasePerUnitPrice",
    //             by: -1,
    //           },
    //         },
    //         prevValue: {
    //           $shift: {
    //             output: "$newPurchaseInventoryValue",
    //             by: -1,
    //           },
    //         },
    //         prevRemaining: {
    //           $shift: {
    //             output: "$remainingUnits",
    //             by: -1,
    //           },
    //         },
    //       },
    //     },
    //   },

    //   /* ------------------ Opening Values ------------------ */

    //   {
    //     $addFields: {
    //       openingInventoryUnits: { $ifNull: ["$prevUnits", 0] },
    //       openingPerUnitPrice: { $ifNull: ["$prevPrice", 0] },
    //       openingInventoryValue: { $ifNull: ["$prevValue", 0] },
    //       remainingOpeningInventoryUnits: { $ifNull: ["$prevRemaining", 0] },
    //     },
    //   },

    //   /* ------------------ Consumption Sum ------------------ */

    //   {
    //     $addFields: {
    //       totalConsumed: {
    //         $sum: "$consumptions.quantity",
    //       },
    //     },
    //   },
    //   /* ------------------ Remaining Inventory Sum ------------------ */

    //   {
    //     $addFields: {
    //       remainingNewPurchaseInventoryUnits: "$remainingUnits",
    //     },
    //   },

    //   /* ------------------ Lookups ------------------ */

    //   {
    //     $lookup: {
    //       from: "items",
    //       localField: "itemName",
    //       foreignField: "_id",
    //       as: "itemName",
    //     },
    //   },
    //   { $unwind: { path: "$itemName", preserveNullAndEmptyArrays: true } },

    //   {
    //     $lookup: {
    //       from: "units",
    //       localField: "unit",
    //       foreignField: "_id",
    //       as: "unit",
    //     },
    //   },
    //   { $unwind: { path: "$unit", preserveNullAndEmptyArrays: true } },

    //   {
    //     $lookup: {
    //       from: "categories",
    //       localField: "itemName.category",
    //       foreignField: "_id",
    //       as: "category",
    //     },
    //   },
    //   { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },

    //   {
    //     $lookup: {
    //       from: "departments",
    //       localField: "department",
    //       foreignField: "_id",
    //       as: "department",
    //     },
    //   },
    //   { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },

    //   {
    //     $lookup: {
    //       from: "userdatas",
    //       localField: "addedBy",
    //       foreignField: "_id",
    //       as: "addedBy",
    //     },
    //   },
    //   { $unwind: { path: "$addedBy", preserveNullAndEmptyArrays: true } },

    //   {
    //     $lookup: {
    //       from: "userdatas",
    //       localField: "consumptions.addedBy",
    //       foreignField: "_id",
    //       as: "consumptionUsers",
    //     },
    //   },

    //   /* ------------------ Map consumption users ------------------ */

    //   {
    //     $addFields: {
    //       consumptions: {
    //         $map: {
    //           input: "$consumptions",
    //           as: "c",
    //           in: {
    //             quantity: "$$c.quantity",
    //             date: "$$c.date",
    //             source: "$$c.source",
    //             addedBy: {
    //               $let: {
    //                 vars: {
    //                   user: {
    //                     $arrayElemAt: [
    //                       {
    //                         $filter: {
    //                           input: "$consumptionUsers",
    //                           cond: {
    //                             $eq: ["$$this._id", "$$c.addedBy"],
    //                           },
    //                         },
    //                       },
    //                       0,
    //                     ],
    //                   },
    //                 },
    //                 in: {
    //                   firstName: "$$user.firstName",
    //                   lastName: "$$user.lastName",
    //                 },
    //               },
    //             },
    //           },
    //         },
    //       },
    //     },
    //   },

    //   /* ------------------ Final Output ------------------ */

    //   {
    //     $project: {
    //       itemName: "$itemName.name",

    //       department: {
    //         _id: "$department._id",
    //         name: "$department.name",
    //       },

    //       unit: {
    //         unitNo: "$unit.unitNo",
    //         unitName: "$unit.unitName",
    //       },

    //       category: "$category.categoryName",

    //       addedBy: {
    //         firstName: "$addedBy.firstName",
    //         lastName: "$addedBy.lastName",
    //       },

    //       // remainingNewPurchaseInventoryUnits
    //       // remainingOpeningInventoryUnits
    //       /* 🔥 Opening */
    //       openingInventoryUnits: 1,
    //       openingPerUnitPrice: 1,
    //       openingInventoryValue: 1,
    //       remainingOpeningInventoryUnits: 1,

    //       /* 🔥 Current */
    //       newPurchaseUnits: 1,
    //       newPurchasePerUnitPrice: 1,
    //       newPurchaseInventoryValue: 1,
    //       remainingNewPurchaseInventoryUnits: 1,

    //       totalConsumed: 1,
    //       consumptions: 1,
    //       createdAt: 1,
    //     },
    //   },

    //   {
    //     $sort: { createdAt: -1 },
    //   },
    // ]);

    const inventories = await Inventory.aggregate([
      /* ------------------ Match ------------------ */
      {
        $match: {
          company: new mongoose.Types.ObjectId(company),
          ...(department && {
            department: new mongoose.Types.ObjectId(department),
          }),
        },
      },

      /* ------------------ Sort ASC (required for window) ------------------ */
      {
        $sort: { createdAt: 1 },
      },

      /* ------------------ Current Consumption ------------------ */
      {
        $addFields: {
          totalConsumed: {
            $sum: "$consumptions.quantity",
          },
        },
      },

      /* ------------------ Window: Previous Entry ------------------ */
      {
        $setWindowFields: {
          partitionBy: {
            itemName: "$itemName",
            unit: "$unit",
            department: "$department",
          },
          sortBy: { createdAt: 1 },
          output: {
            prevUnits: {
              $shift: { output: "$newPurchaseUnits", by: -1 },
            },
            prevPrice: {
              $shift: { output: "$newPurchasePerUnitPrice", by: -1 },
            },
            prevValue: {
              $shift: { output: "$newPurchaseInventoryValue", by: -1 },
            },
            prevRemaining: {
              $shift: { output: "$remainingUnits", by: -1 },
            },
            prevConsumed: {
              $shift: { output: "$totalConsumed", by: -1 },
            },
          },
        },
      },

      /* ------------------ Opening + LastConsumed ------------------ */
      {
        $addFields: {
          openingInventoryUnits: { $ifNull: ["$prevUnits", 0] },
          openingPerUnitPrice: { $ifNull: ["$prevPrice", 0] },
          openingInventoryValue: { $ifNull: ["$prevValue", 0] },
          remainingOpeningInventoryUnits: {
            $ifNull: ["$prevRemaining", 0],
          },

          /* 🔥 Your new field */
          lastConsumed: { $ifNull: ["$prevConsumed", 0] },

          /* Current Remaining */
          remainingNewPurchaseInventoryUnits: "$remainingUnits",
        },
      },

      /* ------------------ Lookups ------------------ */
      {
        $lookup: {
          from: "items",
          localField: "itemName",
          foreignField: "_id",
          as: "itemName",
        },
      },
      { $unwind: { path: "$itemName", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "units",
          localField: "unit",
          foreignField: "_id",
          as: "unit",
        },
      },
      { $unwind: { path: "$unit", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "categories",
          localField: "itemName.category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "departments",
          localField: "department",
          foreignField: "_id",
          as: "department",
        },
      },
      { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "userdatas",
          localField: "addedBy",
          foreignField: "_id",
          as: "addedBy",
        },
      },
      { $unwind: { path: "$addedBy", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "userdatas",
          localField: "consumptions.addedBy",
          foreignField: "_id",
          as: "consumptionUsers",
        },
      },

      /* ------------------ Map Consumption Users ------------------ */
      {
        $addFields: {
          consumptions: {
            $map: {
              input: "$consumptions",
              as: "c",
              in: {
                quantity: "$$c.quantity",
                date: "$$c.date",
                source: "$$c.source",
                addedBy: {
                  $let: {
                    vars: {
                      user: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$consumptionUsers",
                              cond: {
                                $eq: ["$$this._id", "$$c.addedBy"],
                              },
                            },
                          },
                          0,
                        ],
                      },
                    },
                    in: {
                      firstName: "$$user.firstName",
                      lastName: "$$user.lastName",
                    },
                  },
                },
              },
            },
          },
        },
      },

      /* ------------------ Final Projection ------------------ */
      {
        $project: {
          itemName: "$itemName.name",

          department: {
            _id: "$department._id",
            name: "$department.name",
          },

          unit: {
            unitNo: "$unit.unitNo",
            unitName: "$unit.unitName",
          },

          category: "$category.categoryName",

          addedBy: {
            firstName: "$addedBy.firstName",
            lastName: "$addedBy.lastName",
          },

          /* 🔥 Opening */
          openingInventoryUnits: 1,
          openingPerUnitPrice: 1,
          openingInventoryValue: 1,
          remainingOpeningInventoryUnits: 1,

          /* 🔥 Current */
          newPurchaseUnits: 1,
          newPurchasePerUnitPrice: 1,
          newPurchaseInventoryValue: 1,
          remainingNewPurchaseInventoryUnits: 1,

          /* 🔥 Consumption */
          totalConsumed: 1,
          lastConsumed: 1,

          consumptions: 1,
          createdAt: 1,
        },
      },

      /* ------------------ Final Sort (latest first) ------------------ */
      {
        $sort: { createdAt: -1 },
      },
    ]);

    return res.status(200).json(inventories);
  } catch (error) {
    console.error("Fetch Inventory Error:", error);
    next(error);
  }
};

// const updateInventory = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { consumptions = [] } = req.body;
//     const { user, company } = req;

//     const inventory = await Inventory.findOne({ _id: id, company });

//     if (!inventory) {
//       return res
//         .status(404)
//         .json({ message: "Inventory not found or unauthorized" });
//     }

//     /* ------------------ Format consumptions ------------------ */

//     let formattedConsumptions = [];

//     if (Array.isArray(consumptions) && consumptions.length > 0) {
//       formattedConsumptions = consumptions.map((c) => {
//         if (!c.quantity || c.quantity < 0) {
//           throw new Error("Invalid consumption quantity");
//         }

//         return {
//           quantity: Number(c.quantity),
//           source: c.source || "newPurchase",
//           date: new Date(),
//           addedBy: user,
//         };
//       });
//     }

//     /* ------------------ STOCK VALIDATION ------------------ */

//     // const totalPurchase = inventory.newPurchaseUnits;

//     // const totalConsumed = inventory.consumptions.reduce(
//     //   (sum, c) => sum + c.quantity,
//     //   0,
//     // );

//     // const incomingConsumption = formattedConsumptions.reduce(
//     //   (sum, c) => sum + c.quantity,
//     //   0,
//     // );

//     // if (totalConsumed + incomingConsumption > totalPurchase) {
//     //   return res.status(400).json({
//     //     message: "Consumption exceeds available stock",
//     //   });
//     // }

//     const allInventories = await Inventory.find({
//       company,
//       department: inventory.department,
//       itemName: inventory.itemName,
//       unit: inventory.unit,
//     });

//     let totalPurchase = 0;
//     let totalConsumed = 0;

//     allInventories.forEach((inv) => {
//       totalPurchase += inv.newPurchaseUnits || 0;
//       totalConsumed += (inv.consumptions || []).reduce(
//         (sum, c) => sum + c.quantity,
//         0,
//       );
//     });

//     const incomingConsumption = formattedConsumptions.reduce(
//       (sum, c) => sum + c.quantity,
//       0,
//     );

//     if (totalConsumed + incomingConsumption > totalPurchase) {
//       return res.status(400).json({
//         message: "Consumption exceeds available stock",
//       });
//     }

//     /* ------------------ Update ------------------ */

//     const updated = await Inventory.findOneAndUpdate(
//       { _id: id, company },
//       {
//         ...(formattedConsumptions.length > 0 && {
//           $push: { consumptions: { $each: formattedConsumptions } },
//         }),
//       },
//       { new: true, runValidators: true },
//     )
//       .populate("itemName", "name")
//       .populate("department", "name");

//     return res.status(200).json(updated);
//   } catch (error) {
//     console.error("Update Inventory Error:", error);
//     return res.status(500).json({
//       message: "Failed to update inventory",
//       error: error.message,
//     });
//   }
// };

// const updateInventory = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { consumptions = [] } = req.body;
//     const { user, company } = req;

//     const inventory = await Inventory.findOne({ _id: id, company });

//     if (!inventory) {
//       return res
//         .status(404)
//         .json({ message: "Inventory not found or unauthorized" });
//     }

//     /* ------------------ Format consumptions ------------------ */

//     let formattedConsumptions = [];

//     if (Array.isArray(consumptions) && consumptions.length > 0) {
//       formattedConsumptions = consumptions.map((c) => {
//         if (!c.quantity || c.quantity < 0) {
//           throw new Error("Invalid consumption quantity");
//         }

//         return {
//           quantity: Number(c.quantity),
//           source: c.source || "newPurchase",
//           date: new Date(),
//           addedBy: user,
//         };
//       });
//     }

//     /* ------------------ Get Last Inventory State ------------------ */

//     const lastInventory = await Inventory.findOne({
//       company,
//       department: inventory.department,
//       itemName: inventory.itemName,
//       unit: inventory.unit,
//       _id: { $ne: id }, // 🔥 THIS IS THE FIX
//     }).sort({ createdAt: -1 });

//     const previousRemaining = lastInventory?.remainingUnits || 0;

//     /* ------------------ Calculate Incoming Consumption ------------------ */

//     const incomingConsumption = formattedConsumptions.reduce(
//       (sum, c) => sum + c.quantity,
//       0,
//     );

//     console.log("Previous Remaining:", previousRemaining);
//     console.log("Incoming Consumption:", incomingConsumption);

//     /* ------------------ Calculate New Remaining ------------------ */

//     const newRemaining =
//       previousRemaining +
//       (inventory.newPurchaseUnits || 0) -
//       incomingConsumption;

//     /* ------------------ Validation ------------------ */

//     if (newRemaining < 0) {
//       return res.status(400).json({
//         message: "Consumption exceeds available stock",
//       });
//     }

//     /* ------------------ Update ------------------ */

//     const updated = await Inventory.findOneAndUpdate(
//       { _id: id, company },
//       {
//         ...(formattedConsumptions.length > 0 && {
//           $push: { consumptions: { $each: formattedConsumptions } },
//         }),
//         remainingUnits: newRemaining,
//       },
//       { new: true, runValidators: true },
//     )
//       .populate("itemName", "name")
//       .populate("department", "name");

//     return res.status(200).json(updated);
//   } catch (error) {
//     console.error("Update Inventory Error:", error);
//     return res.status(500).json({
//       message: "Failed to update inventory",
//       error: error.message,
//     });
//   }
// };

const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { consumptions = [] } = req.body;
    const { user, company } = req;

    const inventory = await Inventory.findOne({ _id: id, company });

    if (!inventory) {
      return res
        .status(404)
        .json({ message: "Inventory not found or unauthorized" });
    }

    /* ------------------ Format consumptions ------------------ */

    let formattedConsumptions = [];

    if (Array.isArray(consumptions) && consumptions.length > 0) {
      formattedConsumptions = consumptions.map((c) => {
        if (!c.quantity || Number(c.quantity) < 0) {
          throw new Error("Invalid consumption quantity");
        }

        return {
          quantity: Number(c.quantity),
          source: c.source || "newPurchase",
          date: new Date(),
          addedBy: user,
        };
      });
    }

    if (formattedConsumptions.length === 0) {
      return res.status(400).json({
        message: "At least one consumption entry is required",
      });
    }

    /* ------------------ Calculate Incoming Consumption ------------------ */

    const incomingConsumption = formattedConsumptions.reduce(
      (sum, c) => sum + c.quantity,
      0,
    );

    /* ------------------ Calculate New Remaining ------------------ */

    const currentRemaining = Number(inventory.remainingUnits || 0);
    const newRemaining = currentRemaining - incomingConsumption;

    /* ------------------ Validation ------------------ */

    if (newRemaining < 0) {
      return res.status(400).json({
        message: "Consumption exceeds available stock",
      });
    }

    /* ------------------ Update ------------------ */

    const updated = await Inventory.findOneAndUpdate(
      { _id: id, company },
      {
        $push: { consumptions: { $each: formattedConsumptions } },
        $set: { remainingUnits: newRemaining },
      },
      { new: true, runValidators: true },
    )
      .populate("itemName", "name")
      .populate("department", "name");

    return res.status(200).json(updated);
  } catch (error) {
    console.error("Update Inventory Error:", error);
    return res.status(500).json({
      message: "Failed to update inventory",
      error: error.message,
    });
  }
};

const bulkInsertInventory = async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    const companyId = req.company;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Please provide a CSV file" });
    }

    const csv = file.buffer.toString("utf8").trim();
    const results = [];

    Readable.from(csv)
      .pipe(csvParser())
      .on("data", (row) => {
        const mappedRow = {
          company: companyId,
          department: departmentId,
          itemName: row["itemName"],
          openingInventoryUnits: Number(row["Opening Inventory Units"]),
          openingPerUnitPrice: Number(row["Opening Per Unit Price"]),
          openingInventoryValue: Number(row["Opening Inventory Value"]),
          newPurchaseUnits: Number(row["New Purchase Units"] || 0),
          newPurchasePerUnitPrice: Number(
            row["New purchase per unit price"] || 0,
          ),
          newPurchaseInventoryValue: Number(
            row["New purchase inventory value"] || 0,
          ),
          closingInventoryUnits: Number(row["Closing inventory units"] || 0),
          category: row["Category"],
        };
        results.push(mappedRow);
      })
      .on("end", async () => {
        if (results.length === 0) {
          return res
            .status(400)
            .json({ message: "CSV file is empty or invalid" });
        }

        await Inventory.insertMany(results);
        res.status(200).json({
          message: "Inventory uploaded successfully",
          count: results.length,
        });
      })
      .on("error", (error) => {
        console.error("CSV Parsing Error:", error);
        res
          .status(500)
          .json({ message: "Failed to parse CSV", error: error.message });
      });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInventory,
  getInventories,
  updateInventory,
  bulkInsertInventory,
};

//BULK UPLOAD FLOW FOR INVENTORY

//1.The upload will add data in 3 collections - Inventory, Category and Item.

//2.The upload order will be as follows:
//Category -> Item -> Inventory

//This ensures that the necessary references are in place when creating inventory records. The backend will handle the logic to check for existing categories and items, and create new ones if they do not exist, before creating the inventory record with the correct references.
