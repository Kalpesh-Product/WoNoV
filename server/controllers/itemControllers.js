const { default: mongoose } = require("mongoose");
const Item = require("../models/Item");

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

    let filter = {
      isActive: true,
    };

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
      .populate("category", "name")
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

// const items = await Inventory.find();

// for (const inv of items) {
//   let item = await Item.findOne({ name: inv.itemNameText });

//   if (!item) {
//     item = await Item.create({ name: inv.itemNameText });
//   }

//   inv.itemName = item._id;
//   await inv.save();
// }

module.exports = { addItem, getItems };
