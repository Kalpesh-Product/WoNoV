const { default: mongoose } = require("mongoose");
const Inventory = require("../../models/inventory/Inventory");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");

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
      openingInventoryUnits,
      openingPerUnitPrice,
      openingInventoryValue,
      newPurchaseUnits,
      newPurchasePerUnitPrice,
      newPurchaseInventoryValue,
      closingInventoryUnits,
      category,
    } = req.body;
    console.log(req.body);

    if (!mongoose.Types.ObjectId.isValid) {
      throw new CustomError(
        "Invalid department Id provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const inventory = new Inventory({
      company: req.company,
      department,
      itemName,
      openingInventoryUnits,
      openingPerUnitPrice,
      openingInventoryValue,
      newPurchaseUnits,
      newPurchasePerUnitPrice,
      newPurchaseInventoryValue,
      closingInventoryUnits,
      category,
    });

    const saved = await inventory.save();

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Meeting added successfully and updated room status",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: saved._id,
      changes: inventory,
    });

    return res.status(201).json(saved);
  } catch (error) {
    error instanceof CustomError
      ? next(error)
      : next(
          new CustomError(error.message, logPath, logAction, logSourceKey, 500)
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

    const inventories = await Inventory.find(query).populate("department");
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
      { new: true, runValidators: true }
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

module.exports = {
  createInventory,
  getInventories,
  updateInventory,
};
