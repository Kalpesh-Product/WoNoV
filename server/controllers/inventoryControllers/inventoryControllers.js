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

// GET Inventories with Aggregation (for complex derived fields and optimized lookups)
const getInventories = async (req, res, next) => {
  try {
    const { department, category } = req.query;
    const { company } = req;

    const query = { company };
    if (department) query.department = department;
    if (category) query.category = category;

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
          newPurchaseInventoryValue: 1,
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
