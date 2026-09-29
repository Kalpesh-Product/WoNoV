const Department = require("../../models/Departments");
const Company = require("../../models/hr/Company");
const { createLog } = require("../../utils/moduleLogs");
const mongoose = require("mongoose");
const AssetCategory = require("../../models/category/Category");
const CustomError = require("../../utils/customErrorlogs");
const AssetSubCategory = require("../../models/category/SubCategories");
const Category = require("../../models/category/Category");
const csv = require("csv-parser");
const { Readable } = require("stream");
const SubCategory = require("../../models/category/SubCategories");
const Asset = require("../../models/assets/Assets");
const User = require("../../models/hr/UserData");
const Item = require("../../models/Item");

const canManageDeletedCategories = async (userId) => {
  const user = await User.findById(userId)
    .populate("departments", "name")
    .select("departments")
    .lean();

  return (user?.departments || []).some(
    (department) =>
      ["67b2cf85b9b6ed5cedeb9a2e", "6798ba9de469e809084e2494"].includes(
        String(department?._id || department),
      ) ||
      ["Top Management", "Tech Department"].includes(department?.name),
  );
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await AssetCategory.findOne({
      _id: req.params.categoryId,
      company: req.company,
    });
    if (!category) return res.status(404).json({ message: "Category not found" });
    if (!category.isActive) {
      return res.status(400).json({ message: "Only active categories can be deleted" });
    }

    const hasSubCategories = await AssetSubCategory.exists({
      category: category._id,
      isDeleted: { $ne: true },
    });
    if (hasSubCategories) {
      return res.status(400).json({
        message: "Please delete all sub-categories linked to this category before deleting the category.",
      });
    }

    const hasItems = await Item.exists({
      category: category._id,
      isDeleted: { $ne: true },
    });
    if (hasItems) {
      return res.status(400).json({
        message: "Please delete all items linked to this category before deleting the category.",
      });
    }

    if (await canManageDeletedCategories(req.user)) {
      await category.deleteOne();
      return res.status(200).json({ message: "Category permanently deleted" });
    }

    category.isDeleted = true;
    category.deletedAt = new Date();
    category.deletedBy = req.user;
    await category.save();
    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const restoreCategory = async (req, res, next) => {
  try {
    if (!(await canManageDeletedCategories(req.user))) {
      return res.status(403).json({ message: "You cannot restore this category" });
    }
    const category = await AssetCategory.findOneAndUpdate(
      { _id: req.params.categoryId, company: req.company, isDeleted: true },
      { $set: { isDeleted: false }, $unset: { deletedAt: 1, deletedBy: 1 } },
    );
    if (!category) return res.status(404).json({ message: "Category not found" });
    return res.status(200).json({ message: "Category restored successfully" });
  } catch (error) {
    next(error);
  }
};

const deleteSubCategory = async (req, res, next) => {
  try {
    const subCategory = await AssetSubCategory.findById(req.params.subCategoryId)
      .populate("category", "company isActive isDeleted");
    if (!subCategory) {
      return res.status(404).json({ message: "Sub-category not found" });
    }
    if (!subCategory.isActive) {
      return res
        .status(400)
        .json({ message: "Only active sub-categories can be deleted" });
    }
    if (
      !subCategory.isDeleted &&
      subCategory.category &&
      (!subCategory.category.isActive || subCategory.category.isDeleted)
    ) {
      return res.status(400).json({
        message: "Please activate this sub-category's category before deleting the sub-category",
      });
    }

    const categoryCompanyId =
      subCategory.category?.company?._id || subCategory.category?.company;
    const requestCompanyId = req.company?._id || req.company;
    if (String(categoryCompanyId) !== String(requestCompanyId)) {
      return res.status(404).json({ message: "Sub-category not found" });
    }

    if (await canManageDeletedCategories(req.user)) {
      await subCategory.deleteOne();
      return res.status(200).json({ message: "Sub-category permanently deleted" });
    }

    subCategory.isDeleted = true;
    subCategory.deletedAt = new Date();
    subCategory.deletedBy = req.user;
    await subCategory.save();
    return res.status(200).json({ message: "Sub-category deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const restoreSubCategory = async (req, res, next) => {
  try {
    if (!(await canManageDeletedCategories(req.user))) {
      return res.status(403).json({ message: "You cannot restore this sub-category" });
    }
    const subCategory = await AssetSubCategory.findById(req.params.subCategoryId)
      .populate("category", "company");
    if (
      !subCategory ||
      String(subCategory.category?.company) !== String(req.company) ||
      !subCategory.isDeleted
    ) {
      return res.status(404).json({ message: "Sub-category not found" });
    }
    subCategory.isDeleted = false;
    subCategory.deletedAt = undefined;
    subCategory.deletedBy = undefined;
    await subCategory.save();
    return res.status(200).json({ message: "Sub-category restored successfully" });
  } catch (error) {
    next(error);
  }
};

const addAssetCategory = async (req, res, next) => {
  const { assetCategoryName, departmentId, appliesTo = "asset" } = req.body;
  const { company, user, ip } = req;
  const logPath = "assets/AssetLog";
  const logAction = "Add Asset Category";
  const logSourceKey = "category";
  const isValidType = ["asset", "inventory"].includes(appliesTo);

  if (!isValidType) {
    return res
      .status(400)
      .json({ message: "Category can be applied to asset or inventory only" });
  }

  try {
    // Validation
    if (!assetCategoryName || !departmentId) {
      throw new CustomError(
        "Missing required fields",
        logPath,
        logAction,
        logSourceKey,
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
        logSourceKey,
      );
    }

    // Check Department & Company
    const department = await Department.findById(departmentId);
    if (!department) {
      throw new CustomError(
        "Department doesn't exist",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const companyExists = await Company.findById(company);
    if (!companyExists) {
      throw new CustomError(
        "Company doesn't exist",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    // Check for duplicate category in same company & department
    const existingCategory = await Category.findOne({
      categoryName: assetCategoryName,
      department: departmentId,
      company: company,
    });

    if (existingCategory) {
      throw new CustomError(
        "Category already exists in this department",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    // Create Asset Category
    const newAssetCategory = new AssetCategory({
      categoryName: assetCategoryName,
      department: departmentId,
      company,
      appliesTo,
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
        new CustomError(error.message, logPath, logAction, logSourceKey, 500),
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
        logSourceKey,
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
        logSourceKey,
      );
    }

    // Check if parent category exists
    const category = await AssetCategory.findById(assetCategoryId);
    if (!category) {
      throw new CustomError(
        "Category doesn't exist",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    // Check if company exists
    const companyExists = await Company.findById(company);
    if (!companyExists) {
      throw new CustomError(
        "Company doesn't exist",
        logPath,
        logAction,
        logSourceKey,
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
        logSourceKey,
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
        new CustomError(error.message, logPath, logAction, logSourceKey, 500),
      );
    }
  }
};

const updateCategory = async (req, res, next) => {
  const { assetCategoryId, categoryName, status } = req.body;
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
        logSourceKey,
      );
    }

    if (!mongoose.Types.ObjectId.isValid(assetCategoryId)) {
      throw new CustomError(
        "Invalid category ID",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    // Check category
    const category = await AssetCategory.findById(assetCategoryId);
    if (!category) {
      throw new CustomError(
        "Category doesn't exist",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    // Edit the category
    const updatedCategory = await AssetCategory.findByIdAndUpdate(
      { _id: assetCategoryId },
      {
        categoryName: categoryName ? categoryName : category.categoryName,
        isActive: typeof status === "boolean" ? status : category.isActive,
      },
    );

    if (!updatedCategory) {
      return res.status(400).json({ message: "Failed to update category" });
    }

    return res.status(200).json({ message: "Category updated successfully" });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500),
      );
    }
  }
};

const updateSubCategory = async (req, res, next) => {
  const { assetSubCategoryId, subCategoryName, status } = req.body;
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
        logSourceKey,
      );
    }

    if (!mongoose.Types.ObjectId.isValid(assetSubCategoryId)) {
      throw new CustomError(
        "Invalid subcategory ID",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    // Find subcategory
    const subcategory = await AssetSubCategory.findById(assetSubCategoryId);
    if (!subcategory) {
      throw new CustomError(
        "Subcategory doesn't exist",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    // Edit the subcategory
    const updatedSubCategory = await AssetSubCategory.findByIdAndUpdate(
      { _id: assetSubCategoryId },
      {
        subCategoryName: subCategoryName
          ? subCategoryName
          : subcategory.subCategoryName,
        isActive: typeof status === "boolean" ? status : subcategory.isActive,
      },
    );

    if (!updatedSubCategory) {
      return res.status(400).json({ message: "Failed to update sub category" });
    }

    return res
      .status(200)
      .json({ message: "Subcategory updated successfully" });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500),
      );
    }
  }
};

const getCategory = async (req, res, next) => {
  const { company, departments, roles } = req;
  const { departmentId, appliesTo = "asset" } = req.query;
  const isValidType = ["asset", "inventory"].includes(appliesTo);

  if (!isValidType) {
    return res
      .status(400)
      .json({ message: "Category can be applied to asset or inventory only" });
  }

  try {
    const includeDeleted =
      req.query.includeDeleted === "true" &&
      (await canManageDeletedCategories(req.user));
    let query = { company, appliesTo };

    if (departmentId) {
      if (!mongoose.Types.ObjectId.isValid(departmentId)) {
        return res.status(400).json({ message: "Invalid department ID" });
      }

      query.department = departmentId;
    } else if (
      !roles.includes("Master Admin") &&
      !roles.includes("Super Admin")
    ) {
      const deptIds = departments.map((dept) => dept._id);
      query = { ...query, department: { $in: deptIds } };
    }

    if (!includeDeleted) query.isDeleted = { $ne: true };

    const assetCategories = await AssetCategory.find(query)
      .populate("department", "_id name")
      .populate("deletedBy", "firstName lastName");

    const categoryIds = assetCategories.map((cat) => cat._id);

    const assetSubCategories = await AssetSubCategory.find({
      category: { $in: categoryIds },
      ...(!includeDeleted && { isDeleted: { $ne: true } }),
    }).select("_id subCategoryName category");

     const subCategoryIds = assetSubCategories.map((sub) => sub._id);
    const assetQuantityCounts = subCategoryIds.length
      ? await Asset.aggregate([
          {
            $match: {
              company: new mongoose.Types.ObjectId(company),
              subCategory: { $in: subCategoryIds },
              isDeleted: { $ne: true },
            },
          },
          {
            $group: {
              _id: "$subCategory",
              quantity: { $sum: 1 },
            },
          },
        ])
      : [];

    const quantityBySubCategory = new Map(
      assetQuantityCounts.map((item) => [item._id.toString(), item.quantity]),
    );
    const quantityByCategory = new Map();

    const subCategoryMap = new Map();

     assetSubCategories.forEach((sub) => {
      const catId = sub.category.toString();
      const assetQuantity = quantityBySubCategory.get(sub._id.toString()) || 0;

      if (!subCategoryMap.has(catId)) {
        subCategoryMap.set(catId, []);
      }

      subCategoryMap.get(catId).push({
        _id: sub._id,
        subCategoryName: sub.subCategoryName,
        assetQuantity,
      });
      quantityByCategory.set(
        catId,
        (quantityByCategory.get(catId) || 0) + assetQuantity,
      );
    });

    const enrichedCategories = assetCategories.map((cat) => {
      const catObj = cat.toObject();
      const subCategories = subCategoryMap.get(cat._id.toString()) || [];
      catObj.subCategories = subCategories;
      catObj.subCategoriesCount = subCategories.length;
      catObj.assetQuantity = quantityByCategory.get(cat._id.toString()) || 0;
      return catObj;
    });

    return res.status(200).json(enrichedCategories);
  } catch (error) {
    next(error);
  }
};

//     assetSubCategories.forEach((sub) => {
//       const catId = sub.category.toString();
//       if (!subCategoryMap.has(catId)) {
//         subCategoryMap.set(catId, []);
//       }
//       subCategoryMap.get(catId).push({
//         _id: sub._id,
//         subCategoryName: sub.subCategoryName,
//       });
//     });

//     const enrichedCategories = assetCategories.map((cat) => {
//       const catObj = cat.toObject();
//       catObj.subCategories = subCategoryMap.get(cat._id.toString()) || [];
//       return catObj;
//     });

//     return res.status(200).json(enrichedCategories);
//   } catch (error) {
//     next(error);
//   }
// };

const getSubCategory = async (req, res, next) => {
  const company = req.company;
  const { departmentId, appliesTo = "asset" } = req.query;
  const isValidType = ["asset", "inventory"].includes(appliesTo);

  if (!isValidType) {
    return res
      .status(400)
      .json({ message: "Category can be applied to asset or inventory only" });
  }

  try {
    const includeDeleted =
      req.query.includeDeleted === "true" &&
      (await canManageDeletedCategories(req.user));
    let query = { company, appliesTo };
    if (departmentId) {
      if (!mongoose.Types.ObjectId.isValid(departmentId)) {
        return res.status(400).json({ message: "Invalid department ID" });
      }

      query = { ...query, department: departmentId };
    }

    if (!includeDeleted) query.isDeleted = { $ne: true };

    if (!mongoose.Types.ObjectId.isValid(company)) {
      return res.status(400).json({ message: "Invalid company ID" });
    }

    // Get all categories for this company
    const categories = await AssetCategory.find(query).select("_id");
    const categoryIds = categories.map((cat) => cat._id);

    const assetSubCategories = await AssetSubCategory.find({
      category: { $in: categoryIds },
      ...(!includeDeleted && { isDeleted: { $ne: true } }),
    }).populate([
      {
        path: "category",
        select: "categoryName isActive isDeleted",
        populate: { path: "department", select: "name" },
      },
      { path: "deletedBy", select: "firstName lastName" },
    ]);
   const subCategoryIds = assetSubCategories.map((subCategory) => subCategory._id);
    const assetQuantityCounts = subCategoryIds.length
      ? await Asset.aggregate([
          {
            $match: {
              company: new mongoose.Types.ObjectId(company),
              subCategory: { $in: subCategoryIds },
              isDeleted: { $ne: true },
            },
          },
          {
            $group: {
              _id: "$subCategory",
              quantity: { $sum: 1 },
            },
          },
        ])
      : [];

    const quantityBySubCategory = new Map(
      assetQuantityCounts.map((item) => [item._id.toString(), item.quantity]),
    );

    const subCategoriesWithQuantity = assetSubCategories.map((subCategory) => {
      const parsedSubCategory = subCategory.toObject();
      parsedSubCategory.assetQuantity =
        quantityBySubCategory.get(subCategory._id.toString()) || 0;
      return parsedSubCategory;
    });

    return res.status(200).json(subCategoriesWithQuantity);
  } catch (error) {
    next(error);
  }
};

// const bulkUploadCategory = async (req, res) => {
//   try {
//     const { department } = req.params;
//     const { company } = req;

//     if (!req.file) {
//       return res.status(400).json({ message: "CSV file is required" });
//     }

//     const results = [];

//     // Convert buffer → stream
//     const stream = Readable.from(req.file.buffer.toString("utf-8").trim());

//     stream
//       .pipe(csv())
//       .on("data", (row) => {
//         if (row["Category"] || row["Category Name"]) {
//           results.push({
//             categoryName: (row["Category"] || row["Category Name"])
//               .trim()
//               .toLowerCase(), // normalize to avoid duplicates
//             department,
//             company,
//             appliesTo: ["inventory"],
//             isActive: true,
//           });
//         }
//       })
//       .on("end", async () => {
//         try {
//           if (!results.length) {
//             return res
//               .status(400)
//               .json({ message: "No valid categories found in CSV" });
//           }

//           // 🔥 Deduplicate in-memory first (case insensitive)
//           const uniqueMap = new Map();

//           results.forEach((item) => {
//             const key = `${item.categoryName}-${item.department}-${item.company}`;
//             if (!uniqueMap.has(key)) {
//               uniqueMap.set(key, item);
//             }
//           });

//           const uniqueCategories = Array.from(uniqueMap.values());

//           // 🔥 Fetch existing categories to avoid duplicate insert
//           const existing = await Category.find({
//             company,
//             department,
//             categoryName: {
//               $in: uniqueCategories.map((c) => c.categoryName),
//             },
//           }).select("categoryName");

//           const existingNames = new Set(existing.map((e) => e.categoryName));

//           const finalToInsert = uniqueCategories.filter(
//             (c) => !existingNames.has(c.categoryName),
//           );

//           if (!finalToInsert.length) {
//             return res.status(200).json({
//               message: "All categories already exist",
//               inserted: 0,
//             });
//           }

//           // 🔥 Bulk insert
//           await Category.insertMany(finalToInsert, {
//             ordered: false,
//           });

//           return res.status(200).json({
//             message: "Categories uploaded successfully",
//             inserted: finalToInsert.length,
//           });
//         } catch (err) {
//           console.error(err);
//           return res.status(500).json({
//             message: "Error processing categories",
//             error: err.message,
//           });
//         }
//       });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Bulk upload failed",
//       error: error.message,
//     });
//   }
// };

const bulkUploadCategory = async (req, res) => {
  try {
    // appliesTo = asset or inventory
    const { department, appliesTo } = req.params;
    const { company } = req;

    if (!req.file) {
      return res.status(400).json({ message: "CSV file is required" });
    }

    const stream = Readable.from(req.file.buffer.toString("utf-8").trim());

    const categoryResults = [];
    const subCategoryResults = [];

    stream
      .pipe(csv())
      .on("data", (row) => {
        const categoryNameRaw = row["Category"] || row["Category Name"];
        const subCategoryNameRaw = row["Sub Category"] || row["SubCategory"];

        if (categoryNameRaw) {
          const categoryName = categoryNameRaw.trim().toLowerCase();

          categoryResults.push({
            categoryName,
            department,
            company,
            appliesTo: [appliesTo],
            isActive: true,
          });

          if (subCategoryNameRaw) {
            const subCategoryName = subCategoryNameRaw.trim().toLowerCase();

            subCategoryResults.push({
              subCategoryName,
              categoryName, // temporary reference
              department,
            });
          }
        }
      })
      .on("end", async () => {
        try {
          if (!categoryResults.length) {
            return res
              .status(400)
              .json({ message: "No valid categories found in CSV" });
          }

          /* ------------------ CATEGORY DEDUP ------------------ */

          const categoryMap = new Map();

          categoryResults.forEach((c) => {
            const key = `${c.categoryName}-${c.department}-${c.company}`;
            if (!categoryMap.has(key)) {
              categoryMap.set(key, c);
            }
          });

          const uniqueCategories = Array.from(categoryMap.values());

          /* ------------------ FETCH EXISTING CATEGORIES ------------------ */

          const existingCategories = await Category.find({
            company,
            department,
            categoryName: {
              $in: uniqueCategories.map((c) => c.categoryName),
            },
          });

          const existingCategoryMap = new Map(
            existingCategories.map((c) => [c.categoryName, c]),
          );

          /* ------------------ INSERT NEW CATEGORIES ------------------ */

          const categoriesToInsert = uniqueCategories.filter(
            (c) => !existingCategoryMap.has(c.categoryName),
          );

          let insertedCategories = [];

          if (categoriesToInsert.length) {
            insertedCategories = await Category.insertMany(categoriesToInsert, {
              ordered: false,
            });
          }

          /* ------------------ FINAL CATEGORY MAP ------------------ */

          const finalCategoryMap = new Map();

          [...existingCategories, ...insertedCategories].forEach((c) => {
            finalCategoryMap.set(c.categoryName, c._id);
          });

          /* ------------------ SUBCATEGORY PROCESS ------------------ */

          if (!subCategoryResults.length) {
            return res.status(200).json({
              message: "Categories uploaded successfully",
              insertedCategories: categoriesToInsert.length,
              insertedSubCategories: 0,
            });
          }

          /* 🔥 Deduplicate subcategories */

          const subCatMap = new Map();

          subCategoryResults.forEach((s) => {
            const key = `${s.subCategoryName}-${s.categoryName}-${s.department}`;
            if (!subCatMap.has(key)) {
              subCatMap.set(key, s);
            }
          });

          const uniqueSubCategories = Array.from(subCatMap.values());

          /* 🔥 Map categoryId */

          const subCategoriesWithIds = uniqueSubCategories
            .map((s) => {
              const categoryId = finalCategoryMap.get(s.categoryName);

              if (!categoryId) return null;

              return {
                subCategoryName: s.subCategoryName,
                category: categoryId,
                department: s.department,
                isActive: true,
              };
            })
            .filter(Boolean);

          /* 🔥 Fetch existing subcategories */

          const existingSubCategories = await SubCategory.find({
            department,
            subCategoryName: {
              $in: subCategoriesWithIds.map((s) => s.subCategoryName),
            },
          });

          const existingSubCatSet = new Set(
            existingSubCategories.map((s) => s.subCategoryName),
          );

          const finalSubCategories = subCategoriesWithIds.filter(
            (s) => !existingSubCatSet.has(s.subCategoryName),
          );

          if (finalSubCategories.length) {
            await SubCategory.insertMany(finalSubCategories, {
              ordered: false,
            });
          }

          return res.status(200).json({
            message: "Categories & SubCategories uploaded successfully",
            insertedCategories: categoriesToInsert.length,
            insertedSubCategories: finalSubCategories.length,
          });
        } catch (err) {
          return res.status(500).json({
            message: "Error processing categories/subcategories",
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

module.exports = {
  addAssetCategory,
  addSubCategory,
  updateCategory,
  updateSubCategory,
  getCategory,
  getSubCategory,
  bulkUploadCategory,
  deleteCategory,
  restoreCategory,
  deleteSubCategory,
  restoreSubCategory,
};
