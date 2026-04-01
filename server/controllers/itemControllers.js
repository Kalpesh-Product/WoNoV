const { default: mongoose } = require("mongoose");
const Item = require("../models/Item");
const Inventory = require("../models/inventory/Inventory");
const Category = require("../models/category/Category");

const addItem = async (req, res) => {
  try {
    const { name, department, category } = req.body;
    const { company, user } = req;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Item name is required",
      });
    }

    // ✅ Validate ObjectIds
    if (department && !mongoose.Types.ObjectId.isValid(department)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department id",
      });
    }

    if (category && !mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category id",
      });
    }

    // Normalize name (important)
    const normalizedName = name.trim().toLowerCase();

    // Check duplicate
    const existingItem = await Item.findOne({
      name: { $regex: new RegExp(`^${normalizedName}$`, "i") },
      department: department || null,
      category: category || null,
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "Item already exists",
      });
    }

    const newItem = await Item.create({
      name: name.trim(),
      department: department || null,
      category: category || null,
      addedBy: user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "Item added successfully",
      data: newItem,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

const getItems = async (req, res) => {
  try {
    const { department, category } = req.query;

    let filter = {};

    // ✅ Validate before using in query
    if (department) {
      if (!mongoose.Types.ObjectId.isValid(department)) {
        return res.status(400).json({
          success: false,
          message: "Invalid department id",
        });
      }
      filter.department = department;
    }

    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category id",
        });
      }
      filter.category = category;
    }

    const items = await Item.find(filter)
      .select("name department category")
      .populate("department", "name")
      .populate("category", "categoryName")
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isActive, department, category } = req.body;

    /* ------------------ Validate ID ------------------ */

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item id",
      });
    }

    /* ------------------ Fetch existing ------------------ */

    const existingItem = await Item.findById(id);

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    /* ------------------ Validate name ------------------ */

    if (name && !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Item name cannot be empty",
      });
    }

    /* ------------------ Validate ObjectIds ------------------ */

    if (department && !mongoose.Types.ObjectId.isValid(department)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department id",
      });
    }

    if (category && !mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category id",
      });
    }

    /* ------------------ Duplicate check ------------------ */

    if (name) {
      const normalizedName = name.trim().toLowerCase();

      const duplicate = await Item.findOne({
        _id: { $ne: id }, // exclude current item
        name: { $regex: new RegExp(`^${normalizedName}$`, "i") },
        department: department ?? existingItem.department ?? null,
        category: category ?? existingItem.category ?? null,
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: "Item with same name already exists",
        });
      }
    }

    /* ------------------ Update ------------------ */

    const updated = await Item.findByIdAndUpdate(
      id,
      {
        ...(name && { name: name.trim() }),
        ...(typeof isActive === "boolean" && { isActive }),
      },
      { new: true, runValidators: true },
    );

    return res.status(200).json({
      success: true,
      message: "Item updated successfully",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

module.exports = { addItem, getItems, updateItem };
