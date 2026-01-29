const { default: mongoose } = require("mongoose");
const Inventory = require("../../models/inventory/Inventory");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");
const { Readable } = require("stream");
const csvParser = require("csv-parser");
const Category = require("../../models/category/Category");

// Create Inventory Item

const createInventory = async (req, res, next) => {
  const logPath = "inventory/InventoryLog";
  const logAction = "Add inventory";
  const logSourceKey = "inventory";
  const { user, ip, company } = req;

  try {
    const {
      department,
      itemName,
      openingInventoryUnits = 0,
      openingPerUnitPrice = 0,
      openingInventoryValue,
      newPurchaseUnits = 0,
      newPurchasePerUnitPrice = 0,
      newPurchaseInventoryValue,
      closingInventoryUnits,
      category,
    } = req.body;

    /* ------------------ Basic validations ------------------ */

    if (!itemName?.trim()) {
      throw new CustomError(
        "Item name is required",
        logPath,
        logAction,
        logSourceKey,
        400,
      );
    }

    if (!mongoose.Types.ObjectId.isValid(department)) {
      throw new CustomError(
        "Invalid department Id provided",
        logPath,
        logAction,
        logSourceKey,
        400,
      );
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      throw new CustomError(
        "Invalid category Id provided",
        logPath,
        logAction,
        logSourceKey,
        400,
      );
    }

    /* ------------------ Category validation ------------------ */

    const validCategory = await Category.findOne({
      _id: category,
      company,
      appliesTo: "inventory",
      isActive: true,
    }).lean();

    if (!validCategory) {
      throw new CustomError(
        "Category is not valid for inventory",
        logPath,
        logAction,
        logSourceKey,
        400,
      );
    }

    /* ------------------ Numeric sanity checks ------------------ */

    const numbers = [
      Number(openingInventoryUnits),
      Number(openingPerUnitPrice),
      Number(newPurchaseUnits),
      Number(newPurchasePerUnitPrice),
    ];

    if (numbers.some((n) => typeof n !== "number" || n < 0)) {
      throw new CustomError(
        "Inventory values must be non-negative numbers",
        logPath,
        logAction,
        logSourceKey,
        400,
      );
    }

    /* ------------------ Create inventory ------------------ */

    const inventory = await Inventory.create({
      company,
      department,
      itemName: itemName.trim(),
      category,
      openingInventoryUnits,
      openingPerUnitPrice,
      openingInventoryValue,
      newPurchaseUnits,
      newPurchasePerUnitPrice,
      newPurchaseInventoryValue,
      closingInventoryUnits,
      date: new Date(),
    });

    /* ------------------ Logging ------------------ */

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Inventory added successfully",
      status: "Success",
      user,
      ip,
      company,
      sourceKey: logSourceKey,
      sourceId: inventory._id,
      changes: inventory,
    });

    return res.status(201).json(inventory);
  } catch (error) {
    return next(
      error instanceof CustomError
        ? error
        : new CustomError(error.message, logPath, logAction, logSourceKey, 500),
    );
  }
};

const getInventories = async (req, res) => {
  try {
    const { department, category, id } = req.query;

    if (id) {
      // Fetch a single inventory item by ID
      const inventory = await Inventory.findOne({
        _id: id,
        company: req.company,
      }).populate("department");

      if (!inventory) {
        return res.status(404).json({ message: "Inventory not found" });
      }

      return res.status(200).json(inventory);
    }

    // Build dynamic query for filtering
    const query = { company: req.company };

    if (department) query.department = department;
    if (category) query.category = category;

    const inventories = await Inventory.find(query).populate(
      "department category",
    );
    return res.status(200).json(inventories);
  } catch (error) {
    console.error("Fetch Inventory Error:", error);
    res.status(500).json({ message: "Failed to fetch inventory", error });
  }
};

// Update Inventory
const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Inventory.findOneAndUpdate(
      { _id: id, company: req.company },
      req.body,
      { new: true, runValidators: true },
    );

    if (!updated) {
      return res
        .status(404)
        .json({ message: "Inventory not found or unauthorized" });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("Update Inventory Error:", error);
    res.status(500).json({ message: "Failed to update inventory", error });
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
