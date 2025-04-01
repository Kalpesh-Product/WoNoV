const Category = require("../../models/assets/AssetCategory");
const Department = require("../../models/Departments");
const Company = require("../../models/hr/Company");
const { createLog } = require("../../utils/moduleLogs");
const mongoose = require("mongoose");
const Asset = require("../../models/assets/Assets");
const assetCategory = require("../../models/assets/AssetCategory");
const AssetCategory = require("../../models/assets/AssetCategory");
const CustomError = require("../../utils/customErrorlogs");

const addAssetCategory = async (req, res, next) => {
  const { assetCategoryName, departmentId } = req.body;
  const { company, user, ip } = req;
  const logPath = "assets/AssetLog";
  const logAction = "Add Asset Category";
  const logSourceKey = "category";

  try {
    if (!assetCategoryName || !departmentId) {
      throw new CustomError(
        "Missing required fields",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      throw new CustomError(
        "Invalid department ID",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const departmentExists = await Department.findById(departmentId);
    if (!departmentExists) {
      throw new CustomError(
        "Department doesn't exist",
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

    const companyExists = await Company.findById(company);
    if (!companyExists) {
      throw new CustomError(
        "Company doesn't exist",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const newAssetCategory = new AssetCategory({
      categoryName: assetCategoryName,
      department: departmentId,
      company,
    });

    const savedAssetCategory = await newAssetCategory.save();

    const addCompanyAssetCategory = await Company.findByIdAndUpdate(
      { _id: company },
      {
        $push: {
          "selectedDepartments.$[elem].assetCategories": savedAssetCategory._id,
        },
      },
      {
        new: true,
        arrayFilters: [{ "elem.department": departmentId }],
      }
    );

    if (!addCompanyAssetCategory) {
      throw new CustomError(
        "Failed to add asset category",
        logPath,
        logAction,
        logSourceKey
      );
    }

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Category added successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: savedAssetCategory._id,
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
  const logSourceKey = "category";

  try {
    if (!assetSubCategoryName || !assetCategoryId) {
      throw new CustomError(
        "Missing required fields",
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

    const categoryExists = await AssetCategory.findById(assetCategoryId);
    if (!categoryExists) {
      throw new CustomError(
        "Category doesn't exist",
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

    const companyExists = await Company.findById(company);
    if (!companyExists) {
      throw new CustomError(
        "Company doesn't exist",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const subcategory = await AssetCategory.findByIdAndUpdate(
      { _id: assetCategoryId },
      { $push: { subCategories: { name: assetSubCategoryName } } },
      { new: true }
    );

    if (!subcategory) {
      throw new CustomError(
        "Failed to add subcategory",
        logPath,
        logAction,
        logSourceKey
      );
    }

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Subcategory added successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: subcategory._id,
      changes: {
        subCategoryName: assetSubCategoryName,
      },
    });

    return res.status(200).json({ message: "Sub category added successfully" });
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
    if (!assetCategoryId) {
      throw new CustomError(
        "Missing required fields",
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

    const companyExists = await Company.findById(company);
    if (!companyExists) {
      throw new CustomError(
        "Company doesn't exist",
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

    const categoryExists = await AssetCategory.findById(assetCategoryId);
    if (!categoryExists) {
      throw new CustomError(
        "Category doesn't exist",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const disabledCategory = await AssetCategory.findByIdAndUpdate(
      { _id: assetCategoryId },
      { isActive: false },
      { new: true }
    );

    if (!disabledCategory) {
      throw new CustomError(
        "Failed to disable category",
        logPath,
        logAction,
        logSourceKey
      );
    }

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Category disabled successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
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
  const logSourceKey = "category";

  try {
    if (!assetSubCategoryId) {
      throw new CustomError(
        "Missing required fields",
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

    const companyExists = await Company.findById(company);
    if (!companyExists) {
      throw new CustomError(
        "Company doesn't exist",
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

    const disabledSubCategory = await AssetCategory.findOneAndUpdate(
      { "subCategories._id": assetSubCategoryId },
      { $set: { "subCategories.$.isActive": false } },
      { new: true }
    );

    if (!disabledSubCategory) {
      throw new CustomError(
        "Failed to disable subcategory",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const updatedSubCategory = disabledSubCategory.subCategories.find(
      (sub) => sub._id.toString() === assetSubCategoryId
    );

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Sub Category disabled successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: disabledSubCategory._id,
      changes: {
        subCategoryName: updatedSubCategory.name,
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
      return res.status(400).json({ message: "Company doesn't exists" });
    }

    const assetCategories = await AssetCategory.find({
      company,
      isActive: { $ne: false },
    });

    if (!assetCategories) {
      res.status(400).json({ message: "Failed to fetch categories" });
    }

    res.status(200).json(assetCategories);
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
      return res.status(400).json({ message: "Company doesn't exists" });
    }

    const assetSubCategories = await AssetCategory.find({
      company,
      isActive: { $ne: false },
    });

    if (!assetSubCategories) {
      res.status(400).json({ message: "Failed to fetch categories" });
    }

    res.status(200).json(assetSubCategories);
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
