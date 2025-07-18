const Department = require("../../models/Departments");
const Company = require("../../models/hr/Company");
const { createLog } = require("../../utils/moduleLogs");
const mongoose = require("mongoose");
const AssetCategory = require("../../models/assets/AssetCategory");
const CustomError = require("../../utils/customErrorlogs");
const AssetSubCategory = require("../../models/assets/AssetSubCategories");

const addAssetCategory = async (req, res, next) => {
  const { assetCategoryName, departmentId } = req.body;
  const { company, user, ip } = req;
  const logPath = "assets/AssetLog";
  const logAction = "Add Asset Category";
  const logSourceKey = "category";

  try {
    // Validation
    if (!assetCategoryName || !departmentId) {
      throw new CustomError(
        "Missing required fields",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(departmentId) ||
      !mongoose.Types.ObjectId.isValid(company)
    ) {
      throw new CustomError(
        "Invalid ID(s) provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Check Department & Company
    const department = await Department.findById(departmentId);
    if (!department) {
      throw new CustomError(
        "Department doesn't exist",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const companyExists = await Company.findById(company);
    if (!companyExists) {
      throw new CustomError(
        "Company doesn't exist",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Check for duplicate category in same company & department
    const existingCategory = await AssetCategory.findOne({
      categoryName: assetCategoryName,
      department: departmentId,
      company: company,
    });

    if (existingCategory) {
      throw new CustomError(
        "Category already exists in this department",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Create Asset Category
    const newAssetCategory = new AssetCategory({
      categoryName: assetCategoryName,
      department: departmentId,
      company,
    });

    const savedCategory = await newAssetCategory.save();

    // Push category to department.assetCategories
    department.assetCategories.push(savedCategory._id);
    await department.save({ validateBeforeSave: false });

    // Logging
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Category added successfully",
      status: "Success",
      user,
      ip,
      company,
      sourceKey: logSourceKey,
      sourceId: savedCategory._id,
      changes: {
        categoryName: assetCategoryName,
        department: departmentId,
      },
    });

    return res.status(201).json({ message: "Category added successfully" });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500)
      );
    }
  }
};

const addSubCategory = async (req, res, next) => {
  const { assetCategoryId, assetSubCategoryName } = req.body;
  const { company, user, ip } = req;
  const logPath = "assets/AssetLog";
  const logAction = "Add Asset Sub Category";
  const logSourceKey = "subcategory";

  try {
    // Validate inputs
    if (!assetSubCategoryName || !assetCategoryId) {
      throw new CustomError(
        "Missing required fields",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(assetCategoryId) ||
      !mongoose.Types.ObjectId.isValid(company)
    ) {
      throw new CustomError(
        "Invalid ID(s) provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Check if parent category exists
    const category = await AssetCategory.findById(assetCategoryId);
    if (!category) {
      throw new CustomError(
        "Category doesn't exist",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Check if company exists
    const companyExists = await Company.findById(company);
    if (!companyExists) {
      throw new CustomError(
        "Company doesn't exist",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Optional: Check if subcategory already exists in this category
    const duplicate = await AssetSubCategory.findOne({
      subCategoryName: assetSubCategoryName,
      category: assetCategoryId,
    });

    if (duplicate) {
      throw new CustomError(
        "Subcategory already exists in this category",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Create new subcategory
    const newSubCategory = new AssetSubCategory({
      subCategoryName: assetSubCategoryName,
      category: assetCategoryId,
    });

    const savedSubCategory = await newSubCategory.save();

    // Log the operation
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Subcategory added successfully",
      status: "Success",
      user,
      ip,
      company,
      sourceKey: logSourceKey,
      sourceId: savedSubCategory._id,
      changes: {
        subCategoryName: assetSubCategoryName,
        category: assetCategoryId,
      },
    });

    return res.status(201).json({ message: "Subcategory added successfully" });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500)
      );
    }
  }
};

const disableCategory = async (req, res, next) => {
  const { assetCategoryId } = req.params;
  const { company, user, ip } = req;
  const logPath = "assets/AssetLog";
  const logAction = "Disable Asset Category";
  const logSourceKey = "category";

  try {
    // Validate required inputs
    if (!assetCategoryId) {
      throw new CustomError(
        "Missing assetCategoryId",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!mongoose.Types.ObjectId.isValid(assetCategoryId)) {
      throw new CustomError(
        "Invalid category ID",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!mongoose.Types.ObjectId.isValid(company)) {
      throw new CustomError(
        "Invalid company ID",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Check company
    const companyExists = await Company.findById(company);
    if (!companyExists) {
      throw new CustomError(
        "Company doesn't exist",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Check category
    const category = await AssetCategory.findById(assetCategoryId);
    if (!category) {
      throw new CustomError(
        "Category doesn't exist",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Optional: check if already disabled
    if (!category.isActive) {
      return res.status(200).json({ message: "Category is already disabled" });
    }

    // Disable the category
    category.isActive = false;
    const disabledCategory = await category.save({ validateBeforeSave: false });

    // Log the action
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Category disabled successfully",
      status: "Success",
      user,
      ip,
      company,
      sourceKey: logSourceKey,
      sourceId: disabledCategory._id,
      changes: {
        categoryName: disabledCategory.categoryName,
        isActive: false,
      },
    });

    return res.status(200).json({ message: "Category disabled successfully" });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500)
      );
    }
  }
};

const disableSubCategory = async (req, res, next) => {
  const { assetSubCategoryId } = req.params;
  const { company, user, ip } = req;
  const logPath = "assets/AssetLog";
  const logAction = "Disable Asset Sub Category";
  const logSourceKey = "subcategory";

  try {
    // Validation
    if (!assetSubCategoryId) {
      throw new CustomError(
        "Missing assetSubCategoryId",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!mongoose.Types.ObjectId.isValid(assetSubCategoryId)) {
      throw new CustomError(
        "Invalid subcategory ID",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!mongoose.Types.ObjectId.isValid(company)) {
      throw new CustomError(
        "Invalid company ID",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Check if company exists
    const companyExists = await Company.findById(company);
    if (!companyExists) {
      throw new CustomError(
        "Company doesn't exist",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Find subcategory
    const subcategory = await AssetSubCategory.findById(assetSubCategoryId);
    if (!subcategory) {
      throw new CustomError(
        "Subcategory doesn't exist",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Optional: handle already disabled
    if (!subcategory.isActive) {
      return res
        .status(200)
        .json({ message: "Subcategory is already disabled" });
    }

    // Disable subcategory
    subcategory.isActive = false;
    const updatedSubcategory = await subcategory.save();

    // Log action
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Subcategory disabled successfully",
      status: "Success",
      user,
      ip,
      company,
      sourceKey: logSourceKey,
      sourceId: updatedSubcategory._id,
      changes: {
        subCategoryName: updatedSubcategory.subCategoryName,
        isActive: false,
      },
    });

    return res
      .status(200)
      .json({ message: "Subcategory disabled successfully" });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500)
      );
    }
  }
};

const getCategory = async (req, res, next) => {
  const company = req.company;

  try {
    if (!mongoose.Types.ObjectId.isValid(company)) {
      return res.status(400).json({ message: "Invalid company ID" });
    }

    const companyExists = await Company.findById(company);
    if (!companyExists) {
      return res.status(400).json({ message: "Company doesn't exist" });
    }

    const assetCategories = await AssetCategory.find({
      isActive: { $ne: false },
    }).populate("department", "name"); // Optional: populate department name

    return res.status(200).json(assetCategories);
  } catch (error) {
    next(error);
  }
};

const getSubCategory = async (req, res, next) => {
  const company = req.company;

  try {
    if (!mongoose.Types.ObjectId.isValid(company)) {
      return res.status(400).json({ message: "Invalid company ID" });
    }

    const companyExists = await Company.findById(company);
    if (!companyExists) {
      return res.status(400).json({ message: "Company doesn't exist" });
    }

    // Get all categories for this company
    const categories = await AssetCategory.find().select("_id");

    const categoryIds = categories.map((cat) => cat._id);

    const assetSubCategories = await AssetSubCategory.find({
      category: { $in: categoryIds },
      isActive: { $ne: false },
    }).populate("category", "categoryName"); // Optional: populate category name

    return res.status(200).json(assetSubCategories);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addAssetCategory,
  addSubCategory,
  disableCategory,
  disableSubCategory,
  getCategory,
  getSubCategory,
};
