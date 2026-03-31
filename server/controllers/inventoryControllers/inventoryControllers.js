const { default: mongoose } = require("mongoose");
const Inventory = require("../../models/inventory/Inventory");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");
const { Readable } = require("stream");
const csvParser = require("csv-parser");
const Category = require("../../models/category/Category");
const Item = require("../../models/Item");

// Create Inventory Item

// const createInventory = async (req, res, next) => {
//   const logPath = "inventory/InventoryLog";
//   const logAction = "Add inventory";
//   const logSourceKey = "inventory";
//   const { user, ip, company } = req;

//   try {
//     const {
//       department,
//       itemName,
//       openingInventoryUnits = 0,
//       openingPerUnitPrice = 0,
//       openingInventoryValue,
//       newPurchaseUnits = 0,
//       newPurchasePerUnitPrice = 0,
//       newPurchaseInventoryValue,
//       closingInventoryUnits,
//       category,
//     } = req.body;

//     /* ------------------ Basic validations ------------------ */

//     if (!itemName?.trim()) {
//       throw new CustomError(
//         "Item name is required",
//         logPath,
//         logAction,
//         logSourceKey,
//         400,
//       );
//     }

//     if (!mongoose.Types.ObjectId.isValid(department)) {
//       throw new CustomError(
//         "Invalid department Id provided",
//         logPath,
//         logAction,
//         logSourceKey,
//         400,
//       );
//     }

//     if (!mongoose.Types.ObjectId.isValid(category)) {
//       throw new CustomError(
//         "Invalid category Id provided",
//         logPath,
//         logAction,
//         logSourceKey,
//         400,
//       );
//     }

//     /* ------------------ Category validation ------------------ */

//     const validCategory = await Category.findOne({
//       _id: category,
//       company,
//       appliesTo: "inventory",
//       isActive: true,
//     }).lean();

//     if (!validCategory) {
//       throw new CustomError(
//         "Category is not valid for inventory",
//         logPath,
//         logAction,
//         logSourceKey,
//         400,
//       );
//     }

//     /* ------------------ Numeric sanity checks ------------------ */

//     const numbers = [
//       Number(openingInventoryUnits),
//       Number(openingPerUnitPrice),
//       Number(newPurchaseUnits),
//       Number(newPurchasePerUnitPrice),
//     ];

//     if (numbers.some((n) => typeof n !== "number" || n < 0)) {
//       throw new CustomError(
//         "Inventory values must be non-negative numbers",
//         logPath,
//         logAction,
//         logSourceKey,
//         400,
//       );
//     }

//     /* ------------------ Create inventory ------------------ */

//     const inventory = await Inventory.create({
//       company,
//       department,
//       itemName: itemName.trim(),
//       category,
//       addedBy: user,
//       openingInventoryUnits,
//       openingPerUnitPrice,
//       openingInventoryValue,
//       newPurchaseUnits,
//       newPurchasePerUnitPrice,
//       newPurchaseInventoryValue,
//       closingInventoryUnits,
//       date: new Date(),
//     });

//     /* ------------------ Logging ------------------ */

//     await createLog({
//       path: logPath,
//       action: logAction,
//       remarks: "Inventory added successfully",
//       status: "Success",
//       user,
//       ip,
//       company,
//       sourceKey: logSourceKey,
//       sourceId: inventory._id,
//       changes: inventory,
//     });

//     return res.status(201).json(inventory);
//   } catch (error) {
//     return next(
//       error instanceof CustomError
//         ? error
//         : new CustomError(error.message, logPath, logAction, logSourceKey, 500),
//     );
//   }
// };

// const createInventory = async (req, res, next) => {
//   const logPath = "inventory/InventoryLog";
//   const logAction = "Add inventory";
//   const logSourceKey = "inventory";
//   const { user, ip, company } = req;

//   try {
//     const {
//       department,
//       itemName, // now ObjectId
//       openingInventoryUnits = 0,
//       openingPerUnitPrice = 0,
//       openingInventoryValue,
//       newPurchaseUnits = 0,
//       newPurchasePerUnitPrice = 0,
//       newPurchaseInventoryValue,
//       consumedOpenInventoryUnits,
//       consumedNewPurchaseInventoryUnits = 0,
//       category,
//       unit,
//     } = req.body;

//     /* ------------------ Basic validations ------------------ */

//     if (!itemName) {
//       throw new CustomError(
//         "Item is required",
//         logPath,
//         logAction,
//         logSourceKey,
//         400,
//       );
//     }

//     if (!mongoose.Types.ObjectId.isValid(itemName)) {
//       throw new CustomError(
//         "Invalid item id provided",
//         logPath,
//         logAction,
//         logSourceKey,
//         400,
//       );
//     }

//     if (!mongoose.Types.ObjectId.isValid(unit)) {
//       throw new CustomError(
//         "Invalid unit Id provided",
//         logPath,
//         logAction,
//         logSourceKey,
//         400,
//       );
//     }

//     if (!mongoose.Types.ObjectId.isValid(department)) {
//       throw new CustomError(
//         "Invalid department Id provided",
//         logPath,
//         logAction,
//         logSourceKey,
//         400,
//       );
//     }

//     if (!mongoose.Types.ObjectId.isValid(category)) {
//       throw new CustomError(
//         "Invalid category Id provided",
//         logPath,
//         logAction,
//         logSourceKey,
//         400,
//       );
//     }

//     /* ------------------ Existence validation ------------------ */

//     const itemExists = await Item.exists({ _id: itemName, isActive: true });
//     if (!itemExists) {
//       throw new CustomError(
//         "Item not found or inactive",
//         logPath,
//         logAction,
//         logSourceKey,
//         400,
//       );
//     }

//     const validCategory = await Category.findOne({
//       _id: category,
//       company,
//       appliesTo: "inventory",
//       isActive: true,
//     }).lean();

//     if (!validCategory) {
//       throw new CustomError(
//         "Category is not valid for inventory",
//         logPath,
//         logAction,
//         logSourceKey,
//         400,
//       );
//     }

//     /* ------------------ Numeric sanity checks ------------------ */

//     const numbers = [
//       Number(openingInventoryUnits),
//       Number(openingPerUnitPrice),
//       Number(newPurchaseUnits),
//       Number(newPurchasePerUnitPrice),
//       Number(consumedOpenInventoryUnits),
//       Number(consumedNewPurchaseInventoryUnits),
//     ];

//     const remainingInventoryUnits =
//       openingInventoryUnits - consumedOpenInventoryUnits;
//     const closingInventoryUnits =
//       newPurchaseUnits +
//       remainingInventoryUnits -
//       consumedNewPurchaseInventoryUnits;

//     if (numbers.some((n) => typeof n !== "number" || n < 0)) {
//       throw new CustomError(
//         "Inventory values must be non-negative numbers",
//         logPath,
//         logAction,
//         logSourceKey,
//         400,
//       );
//     }

//     /* ------------------ Create inventory ------------------ */

//     const inventory = await Inventory.create({
//       company,
//       department,
//       itemName, // ✅ ObjectId directly
//       category,
//       addedBy: user,
//       openingInventoryUnits,
//       openingPerUnitPrice,
//       openingInventoryValue,
//       consumedOpenInventoryUnits,
//       remainingInventoryUnits,
//       newPurchaseUnits,
//       newPurchasePerUnitPrice,
//       newPurchaseInventoryValue,
//       consumedNewPurchaseInventoryUnits,
//       closingInventoryUnits,
//       unit,
//       date: new Date(),
//     });

//     /* ------------------ Logging ------------------ */

//     return res.status(201).json(inventory);
//   } catch (error) {
//     next(error);
//   }
// };

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

    // if (!mongoose.Types.ObjectId.isValid(category)) {
    //   return res.status(400).json({ message: "Invalid category id" });
    // }

    const itemExists = await Item.exists({ _id: itemName, isActive: true });
    if (!itemExists) {
      return res.status(400).json({ message: "Item not found or inactive" });
    }

    // if (category) {
    //   const validCategory = await Category.findOne({
    //     _id: category,
    //     company,
    //     appliesTo: "inventory",
    //     isActive: true,
    //   });

    //   if (!validCategory) {
    //     return res.status(400).json({ message: "Invalid inventory category" });
    //   }
    // }

    if (Number(newPurchaseUnits) < 0 || Number(newPurchasePerUnitPrice) < 0) {
      return res.status(400).json({
        message: "Purchase values must be non-negative",
      });
    }

    /* ------------------ Create inventory ------------------ */
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
    });

    return res.status(201).json(inventory);
  } catch (error) {
    next(error);
  }
};

// const getInventories = async (req, res) => {
//   try {
//     const { department, category, id } = req.query;

//     if (id) {
//       // Fetch a single inventory item by ID
//       const inventory = await Inventory.findOne({
//         _id: id,
//         company: req.company,
//       })
//         .populate("department category")
//         .populate("addedBy", "firstName middleName lastName");

//       if (!inventory) {
//         return res.status(404).json({ message: "Inventory not found" });
//       }

//       return res.status(200).json(inventory);
//     }

//     // Build dynamic query for filtering
//     const query = { company: req.company };

//     if (department) query.department = department;
//     if (category) query.category = category;

//     const inventories = await Inventory.find(query)
//       .populate("department category")
//       .populate("addedBy", "firstName middleName lastName");
//     return res.status(200).json(inventories);
//   } catch (error) {
//     console.error("Fetch Inventory Error:", error);
//     next(error);
//   }
// };

// Update Inventory

// const getInventories = async (req, res) => {
//   try {
//     const { department, category, id } = req.query;

//     if (id) {
//       const inventory = await Inventory.findOne({
//         _id: id,
//         company: req.company,
//       })
//         .populate("itemName", "name") // ✅ important
//         .populate("department category")
//         .populate("addedBy", "firstName middleName lastName");

//       if (!inventory) {
//         return res.status(404).json({ message: "Inventory not found" });
//       }

//       return res.status(200).json(inventory);
//     }

//     const query = { company: req.company };

//     if (department) query.department = department;
//     if (category) query.category = category;

//     const inventories = await Inventory.find(query)
//       .populate("itemName", "name") // ✅ important
//       .populate("department category")
//       .populate("addedBy", "firstName middleName lastName");

//     return res.status(200).json(inventories);
//   } catch (error) {
//     console.error("Fetch Inventory Error:", error);
//     next(error);
//   }
// };

// //// GET Inventories with Aggregation (for complex derived fields and optimized lookups)
const getInventories = async (req, res, next) => {
  try {
    const { department, category } = req.query;
    const { company } = req;

    const query = { company };
    if (department) query.department = department;
    if (category) query.category = category;
    console.log("query", query);

    const inventories = await Inventory.aggregate([
      {
        $match: {
          company: new mongoose.Types.ObjectId(req.company),
          ...(req.query.department && {
            department: new mongoose.Types.ObjectId(req.query.department),
          }),
          ...(req.query.category && {
            category: new mongoose.Types.ObjectId(req.query.category),
          }),
        },
      },

      {
        $sort: { createdAt: 1 },
      },

      /* ------------------ Add consumption sum ------------------ */

      {
        $addFields: {
          totalConsumed: {
            $sum: "$consumptions.quantity",
          },
        },
      },

      /* ------------------ Window function ------------------ */

      {
        $setWindowFields: {
          partitionBy: {
            itemName: "$itemName",
            unit: "$unit",
          },
          sortBy: { createdAt: 1 },
          output: {
            prevPurchaseUnits: {
              $shift: {
                output: "$newPurchaseUnits",
                by: -1,
              },
            },
            prevPurchasePrice: {
              $shift: {
                output: "$newPurchasePerUnitPrice",
                by: -1,
              },
            },
            prevConsumed: {
              $shift: {
                output: "$totalConsumed",
                by: -1,
              },
            },
          },
        },
      },

      /* ------------------ Derived fields ------------------ */

      {
        $addFields: {
          openingInventoryUnits: {
            $ifNull: ["$prevPurchaseUnits", 0],
          },
          openingPerUnitPrice: {
            $ifNull: ["$prevPurchasePrice", 0],
          },
          openingInventoryValue: {
            $multiply: [
              { $ifNull: ["$prevPurchaseUnits", 0] },
              { $ifNull: ["$prevPurchasePrice", 0] },
            ],
          },
          consumedOpenInventoryUnits: {
            $ifNull: ["$prevConsumed", 0],
          },
          remainingOpeningInventoryUnits: {
            $subtract: [
              { $ifNull: ["$prevPurchaseUnits", 0] },
              { $ifNull: ["$prevConsumed", 0] },
            ],
          },
          remainingNewPurchaseInventoryUnits: {
            $subtract: ["$newPurchaseUnits", "$totalConsumed"],
          },
        },
      },

      /* ------------------ Lookup (populate replacement) ------------------ */

      // {
      //   $addFields: {
      //     originalItemName: "$itemName",
      //   },
      // },

      // {
      //   $lookup: {
      //     from: "items",
      //     localField: "itemName",
      //     foreignField: "_id",
      //     as: "itemName",
      //   },
      // },
      // { $unwind: { path: "$itemName", preserveNullAndEmptyArrays: true } },
      // {
      //   $addFields: {
      //     itemName: {
      //       $ifNull: [
      //         "$itemName.name",
      //         "$originalItemName", // fallback for old string data
      //       ],
      //     },
      //   },
      // },

      // lookup first
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
      {
        $project: {
          itemName: "$itemName.name",

          department: { _id: "$department._id", name: "$department.name" },

          unit: {
            unitNo: "$unit.unitNo",
            unitName: "$unit.unitName",
          },
          category: "$category.categoryName",

          addedBy: {
            firstName: "$addedBy.firstName",
            lastName: "$addedBy.lastName",
          },

          newPurchaseUnits: 1,
          newPurchasePerUnitPrice: 1,
          consumedNewPurchaseInventoryUnits: 1,
          openingInventoryUnits: 1,
          openingPerUnitPrice: 1,
          openingInventoryValue: 1,
          consumedOpenInventoryUnits: 1,
          remainingOpeningInventoryUnits: 1,
          remainingNewPurchaseInventoryUnits: 1,
          consumptions: 1,
          createdAt: 1,
        },
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

//     const updated = await Inventory.findOneAndUpdate(
//       { _id: id, company: req.company },
//       req.body,
//       { new: true, runValidators: true },
//     );

//     if (!updated) {
//       return res
//         .status(404)
//         .json({ message: "Inventory not found or unauthorized" });
//     }

//     res.status(200).json(updated);
//   } catch (error) {
//     console.error("Update Inventory Error:", error);
//     res.status(500).json({ message: "Failed to update inventory", error });
//   }
// };

// const updateInventory = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { itemName } = req.body;

//     if (itemName && !mongoose.Types.ObjectId.isValid(itemName)) {
//       return res.status(400).json({
//         message: "Invalid item id",
//       });
//     }

//     if (itemName) {
//       const itemExists = await Item.exists({ _id: itemName, isActive: true });
//       if (!itemExists) {
//         return res.status(400).json({
//           message: "Item not found or inactive",
//         });
//       }
//     }

//     const updated = await Inventory.findOneAndUpdate(
//       { _id: id, company: req.company },
//       req.body,
//       { new: true, runValidators: true },
//     )
//       .populate("itemName", "name")
//       .populate("department category");

//     if (!updated) {
//       return res
//         .status(404)
//         .json({ message: "Inventory not found or unauthorized" });
//     }

//     res.status(200).json(updated);
//   } catch (error) {
//     console.error("Update Inventory Error:", error);
//     res.status(500).json({ message: "Failed to update inventory", error });
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

    /* ------------------ Validate category ------------------ */

    // if (category) {
    //   if (!mongoose.Types.ObjectId.isValid(category)) {
    //     return res.status(400).json({ message: "Invalid category id" });
    //   }

    //   const validCategory = await Category.findOne({
    //     _id: category,
    //     company,
    //     appliesTo: "inventory",
    //     isActive: true,
    //   });

    //   if (!validCategory) {
    //     return res.status(400).json({ message: "Invalid inventory category" });
    //   }
    // }

    /* ------------------ Format consumptions ------------------ */

    let formattedConsumptions = [];

    if (Array.isArray(consumptions) && consumptions.length > 0) {
      formattedConsumptions = consumptions.map((c) => {
        if (!c.quantity || c.quantity < 0) {
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

    /* ------------------ STOCK VALIDATION ------------------ */

    const totalPurchase = inventory.newPurchaseUnits;

    const totalConsumed = inventory.consumptions.reduce(
      (sum, c) => sum + c.quantity,
      0,
    );

    const incomingConsumption = formattedConsumptions.reduce(
      (sum, c) => sum + c.quantity,
      0,
    );

    if (totalConsumed + incomingConsumption > totalPurchase) {
      return res.status(400).json({
        message: "Consumption exceeds available stock",
      });
    }

    /* ------------------ Update ------------------ */

    const updated = await Inventory.findOneAndUpdate(
      { _id: id, company },
      {
        ...(formattedConsumptions.length > 0 && {
          $push: { consumptions: { $each: formattedConsumptions } },
        }),
      },
      { new: true, runValidators: true },
    )
      .populate("itemName", "name")
      .populate("department category");

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
