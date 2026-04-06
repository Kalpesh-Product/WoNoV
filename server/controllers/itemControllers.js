const { default: mongoose } = require("mongoose");
const Item = require("../models/Item");
const Inventory = require("../models/inventory/Inventory");
const Category = require("../models/category/Category");
const csv = require("csv-parser");
const { Readable } = require("stream");
const Role = require("../models/roles/Roles");
const UserData = require("../models/hr/UserData");
const Department = require("../models/Departments");

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
      addedBy: user,
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
      .select("name department category isActive createdAt updatedAt")
      .populate("department", "name")
      .populate("category", "categoryName")
      .populate("addedBy", "firstName lastName")
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

const bulkUploadItems = async (req, res) => {
  try {
    const { department } = req.params;
    const { company } = req;

    if (!req.file) {
      return res.status(400).json({ message: "CSV file is required" });
    }

    /* ------------------ Validate department ------------------ */

    if (!mongoose.Types.ObjectId.isValid(department)) {
      return res.status(400).json({
        message: "Invalid department id",
      });
    }

    console.log("department", department);
    const dept = await Department.findOne({
      _id: new mongoose.Types.ObjectId(department),
    });

    if (!dept) {
      return res.status(400).json({
        message: "Department not found",
      });
    }

    /* ------------------ GET ADMIN USER ------------------ */

    const roleName = `${dept.name.toUpperCase()}_Admin`;
    // Find admin role for this department
    const adminRole = await Role.findOne({
      roleID: { $regex: roleName.toUpperCase(), $options: "i" },
    });

    if (!adminRole) {
      return res.status(400).json({
        message: "Admin role not found for department",
      });
    }

    // Find user with this role
    const adminUser = await UserData.findOne({
      role: { $in: [adminRole._id] },
      isActive: true,
    });

    if (!adminUser) {
      return res.status(400).json({
        message: "Admin user not found for department",
      });
    }

    /* ------------------ PARSE CSV ------------------ */

    const results = [];

    const stream = Readable.from(req.file.buffer.toString("utf-8").trim());

    stream
      .pipe(csv())
      .on("data", (row) => {
        const name = row["Item Name"]?.trim();
        const categoryName = row["Category"]?.trim()?.toLowerCase();

        if (name && categoryName) {
          results.push({
            name: name.trim().toLowerCase(),
            categoryName,
          });
        }
      })
      .on("end", async () => {
        try {
          if (!results.length) {
            return res
              .status(400)
              .json({ message: "No valid items found in CSV" });
          }

          /* ------------------ FETCH CATEGORIES ------------------ */

          const categoryNames = [
            ...new Set(results.map((r) => r.categoryName)),
          ];

          const categories = await Category.find({
            categoryName: { $in: categoryNames },
            department,
            company,
          });

          const categoryMap = new Map();
          categories.forEach((c) => {
            categoryMap.set(c.categoryName, c._id);
          });

          /* ------------------ PREPARE ITEMS ------------------ */

          const itemsToInsert = [];

          results.forEach((r) => {
            const categoryId = categoryMap.get(r.categoryName);

            if (categoryId) {
              itemsToInsert.push({
                name: r.name,
                department,
                category: categoryId,
                addedBy: adminUser._id,
                isActive: true,
              });
            }
          });

          if (!itemsToInsert.length) {
            return res.status(400).json({
              message:
                "No items inserted. Categories not found or invalid data.",
            });
          }

          /* ------------------ DEDUP (CSV LEVEL) ------------------ */

          const uniqueMap = new Map();

          itemsToInsert.forEach((item) => {
            const key = `${item.name}-${item.department}-${item.category}`;
            if (!uniqueMap.has(key)) {
              uniqueMap.set(key, item);
            }
          });

          const uniqueItems = Array.from(uniqueMap.values());

          /* ------------------ REMOVE EXISTING ------------------ */

          const existing = await Item.find({
            department,
            category: { $in: uniqueItems.map((i) => i.category) },
            name: { $in: uniqueItems.map((i) => i.name) },
          }).select("name category");

          const existingSet = new Set(
            existing.map((e) => `${e.name}-${e.department}-${e.category}`),
          );

          const finalItems = uniqueItems.filter(
            (i) => !existingSet.has(`${i.name}-${i.department}-${i.category}`),
          );

          if (!finalItems.length) {
            return res.status(200).json({
              message: "All items already exist",
              inserted: 0,
            });
          }

          /* ------------------ INSERT ------------------ */

          await Item.insertMany(finalItems, { ordered: false });

          return res.status(200).json({
            message: "Items uploaded successfully",
            inserted: finalItems.length,
          });
        } catch (err) {
          console.error(err);
          return res.status(500).json({
            message: "Error processing items",
            error: err.message,
          });
        }
      });
  } catch (error) {
    return res.status(500).json({
      message: "Bulk upload failed",
      error: error.message,
    });
  }
};

module.exports = { addItem, getItems, updateItem, bulkUploadItems };
