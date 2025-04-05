const Inventory = require("../../models/inventory/Inventory");

// Create Inventory Item
const createInventory = async (req, res) => {
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

    const inventory = new Inventory({
      company: req.company, // coming from token
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
    res.status(201).json(saved);
  } catch (error) {
    console.error("Create Inventory Error:", error);
    res.status(500).json({ message: "Failed to create inventory", error });
  }
};

const getInventories = async (req, res) => {
  try {
    const { id } = req.params;
    const { department, category } = req.query;

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
    res.status(200).json(inventories);
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
