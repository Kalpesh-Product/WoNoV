const mongoose = require("mongoose");
const Department = require("../../models/Departments");
const KraCategory = require("../../models/performances/KraCategory");

const normalizeName = (value) => value.trim().replace(/\s+/g, " ").toLowerCase();

const getAccess = async (req) => {
  const roles = (req.roles || []).map((role) => String(role).toLowerCase());
  const departmentIds = (req.departments || [])
    .map((department) => String(department?._id || department))
    .filter((id) => mongoose.isValidObjectId(id));
  const isHr = roles.some((role) => /^hr(?:\s|$)/.test(role));
  const isManager = roles.some((role) => role.includes("manager"));
  const isTopManagement =
    roles.includes("top management") ||
    Boolean(
      departmentIds.length &&
        (await Department.exists({
          _id: { $in: departmentIds },
          name: /^top management$/i,
        })),
    );
  const isAdmin = roles.some((role) =>
    ["master admin", "super admin"].includes(role),
  );
  return {
    departmentIds,
    canAccessAllDepartments: isHr || isTopManagement || isAdmin,
    canCreate: isManager || isHr || isTopManagement || isAdmin,
  };
};

const validateDepartmentAccess = (department, access) =>
  access.canAccessAllDepartments || access.departmentIds.includes(String(department));

const listKraCategories = async (req, res, next) => {
  try {
    const { department } = req.query;
    if (!mongoose.isValidObjectId(department)) {
      return res.status(400).json({ message: "A valid department ID is required" });
    }
    const access = await getAccess(req);
    if (!validateDepartmentAccess(department, access)) {
      return res.status(403).json({ message: "Department access denied" });
    }
    const categories = await KraCategory.find({
      company: req.company,
      department,
      isActive: true,
      isDeleted: { $ne: true },
    })
      .sort({ categoryName: 1 })
      .select("categoryName")
      .lean();
    return res.json(categories);
  } catch (error) {
    return next(error);
  }
};

const createKraCategory = async (req, res, next) => {
  try {
    const { department } = req.body;
    const categoryName =
      typeof req.body.categoryName === "string"
        ? req.body.categoryName.trim().replace(/\s+/g, " ")
        : "";
    if (!mongoose.isValidObjectId(department)) {
      return res.status(400).json({ message: "A valid department ID is required" });
    }
    if (!categoryName || categoryName.length > 200) {
      return res.status(400).json({
        message: "Category name must be between 1 and 200 characters",
      });
    }
    const access = await getAccess(req);
    if (!access.canCreate) {
      return res.status(403).json({
        message: "Only managers, HR, or Top Management can add KRA categories",
      });
    }
    if (!validateDepartmentAccess(department, access)) {
      return res.status(403).json({ message: "Department access denied" });
    }
    const category = await KraCategory.create({
      company: req.company,
      department,
      categoryName,
      normalizedName: normalizeName(categoryName),
      createdBy: req.user,
      updatedBy: req.user,
    });
    return res.status(201).json(category);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "This category already exists for the department",
      });
    }
    return next(error);
  }
};

module.exports = { listKraCategories, createKraCategory };
