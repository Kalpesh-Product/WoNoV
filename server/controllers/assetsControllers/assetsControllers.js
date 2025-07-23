const Asset = require("../../models/assets/Assets");
const User = require("../../models/hr/UserData");
const Company = require("../../models/hr/Company");
const Category = require("../../models/assets/AssetCategory");
const Vendor = require("../../models/hr/Vendor");
const sharp = require("sharp");
const {
  handleFileUpload,
  handleFileDelete,
  handleDocumentUpload,
} = require("../../config/cloudinaryConfig");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");
const Department = require("../../models/Departments");
const AssetSubCategory = require("../../models/assets/AssetSubCategories");

const getAssetsWithDepartments = async (req, res, next) => {
  try {
    const user = req.user;

    const foundUser = await User.findOne({ _id: user })
      .populate([{ path: "departments", select: "name" }])
      .lean()
      .exec();

    const userDepartments = foundUser.departments || [];

    const isTopManagement = userDepartments.some(
      (dept) => dept.name === "Top Management"
    );

    const departmentMatch = {
      isActive: true,
    };

    // If not Top Management, restrict to user department IDs
    if (!isTopManagement) {
      const userDeptIds = userDepartments.map((dept) => dept._id);
      departmentMatch._id = { $in: userDeptIds };
    }

    const departmentsWithAssets = await Department.aggregate([
      {
        $match: departmentMatch,
      },
      {
        $lookup: {
          from: "assets",
          localField: "_id",
          foreignField: "department",
          as: "assets",
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: departmentsWithAssets,
    });
  } catch (error) {
    next(error);
  }
};

const getAssets = async (req, res, next) => {
  try {
    const userId = req.user;
    const userDepartments = req.departments;
    const user = await User.findById(userId).lean().exec();

    const isTopManagement = userDepartments.some(
      (dept) => dept.name === "Top Management"
    );
    const userDepartmentIds = userDepartments.map((dept) => dept._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const companyId = user.company;
    let { assigned, departmentId, vendorId, sortBy, order } = req.query;

    const departments = await Department.find({ isActive: true }).lean().exec();

    const assetFilter = {
      company: companyId,
    };

    if (!isTopManagement) assetFilter.department = { $in: userDepartmentIds };

    if (departmentId) assetFilter.department = departmentId;

    if (vendorId) assetFilter.vendor = vendorId;
    if (assigned === "true") assetFilter.assignedTo = { $ne: null };
    else if (assigned === "false") assetFilter.assignedTo = null;

    const sortField = sortBy || "purchaseDate";
    const sortOrder = order === "desc" ? -1 : 1;

    const assets = await Asset.find(assetFilter)
      .populate([
        { path: "department", select: "name" },
        { path: "vendor", populate: { path: "departmentId", select: "name" } },
        {
          path: "subCategory",
          select: "subCategoryName",
          populate: { path: "category", select: "categoryName" },
        },
        {
          path: "location",
          select: "unitNo unitName",
          populate: { path: "building", select: "buildingName" },
        },
      ])

      .select("-company")
      .sort({ [sortField]: sortOrder });

    // Group assets by department ID
    const assetMap = {};
    for (const asset of assets) {
      const deptId = asset.department?._id?.toString();
      if (!assetMap[deptId]) assetMap[deptId] = [];
      assetMap[deptId].push(asset);
    }

    // Combine with departments, include empty ones
    const result = (
      departmentId
        ? departments.filter((dept) => dept._id.toString() === departmentId)
        : departments
    ).map((dept) => ({
      departmentId: dept._id.toString(),
      departmentName: dept.name,
      assets: assetMap[dept._id.toString()] || [],
    }));

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const addAsset = async (req, res, next) => {
  const logPath = "assets/AssetLog";
  const logAction = "Add Asset";
  const logSourceKey = "asset";
  const { user, ip } = req;

  try {
    const {
      departmentId,
      categoryId,
      subCategoryId,
      vendorId,
      name,
      purchaseDate,
      quantity,
      price,
      brand,
      assetType,
      warranty,
      ownershipType,
      rentedMonths,
      tangable,
      locationId,
    } = req.body;

    const foundUser = await User.findOne({ _id: user })
      .select("company departments role")
      .populate([{ path: "role", select: "roleTitle" }])
      .lean()
      .exec();

    if (!foundUser)
      throw new CustomError("No user found", logPath, logAction, logSourceKey);
    const company = foundUser.company;

    const foundCompany = await Company.findOne({ _id: company })
      .select("selectedDepartments companyName")
      .lean()
      .exec();

    if (!foundCompany)
      throw new CustomError(
        "Company not found",
        logPath,
        logAction,
        logSourceKey
      );

    const doesDepartmentExist = await Department.findOne({ _id: departmentId })
      .lean()
      .exec();
    if (!doesDepartmentExist)
      throw new CustomError(
        "Department not selected by your company",
        logPath,
        logAction,
        logSourceKey
      );

    const foundCategory = await Category.findOne({ _id: categoryId })
      .lean()
      .exec();
    if (!foundCategory)
      throw new CustomError(
        "No category found",
        logPath,
        logAction,
        logSourceKey
      );

    const categoryExistsInDepartment = doesDepartmentExist.assetCategories.find(
      (ct) => ct._id.toString() === categoryId
    );
    if (!categoryExistsInDepartment)
      throw new CustomError(
        "No such category exists in the department",
        logPath,
        logAction,
        logSourceKey
      );

    if (vendorId) {
      const foundVendor = await Vendor.findOne({ _id: vendorId }).lean().exec();
      if (!foundVendor)
        throw new CustomError(
          "Vendor not found",
          logPath,
          logAction,
          logSourceKey
        );
    }

    const subcategory = await AssetSubCategory.findOne({ _id: subCategoryId })
      .populate([{ path: "category" }])
      .lean()
      .exec();

    if (!subcategory)
      throw new CustomError(
        "Sub-category not found",
        logPath,
        logAction,
        logSourceKey
      );

    const assetIds = [];

    let assetImage = null;

    if (req.file) {
      try {
        const buffer = await sharp(req.file.buffer)
          .resize(1262, 284, { fit: "contain" })
          .webp({ quality: 80 })
          .toBuffer();
        const uploadRes = await handleFileUpload(
          `data:image/webp;base64,${buffer.toString("base64")}`,
          `${foundUser?.company?.companyName}/departments/assets/${subcategory.category.categoryName}/${subcategory.subCategoryName}/${name}`
        );
        assetImage = {
          url: uploadRes.secure_url,
          id: uploadRes.public_id,
        };
      } catch (uploadErr) {
        throw new CustomError(
          "Asset image upload failed",
          logPath,
          logAction,
          logSourceKey
        );
      }
    }

    // Fetch required names
    const departmentName = doesDepartmentExist.name || "DE";
    const subCategoryName = subcategory.subCategoryName || "SC";

    // Get existing asset count in the department
    const existingAssetsCount = await Asset.countDocuments({
      department: departmentId,
    }).exec();

    // Prepare prefix
    const ownershipPrefix = ownershipType?.slice(0, 2).toUpperCase() || "XX";
    const deptPrefix = departmentName.slice(0, 2).toUpperCase();
    const subCatPrefix = subCategoryName.slice(0, 2).toUpperCase();

    const assetsToInsert = [];
    for (let i = 0; i < Number(quantity); i++) {
      const assetNumber = existingAssetsCount + i + 1; // incremental
      const uniqueAssetId = `${ownershipPrefix}-${deptPrefix}-${subCatPrefix}-${assetNumber}`;

      const assetData = {
        assetType,
        assetId: uniqueAssetId,
        rentedMonths: ownershipType === "Rental" ? rentedMonths : undefined,
        tangable,
        ownershipType,
        vendor: vendorId || null,
        company: company,
        name,
        purchaseDate,
        price,
        warranty,
        brand,
        department: departmentId,
        location: locationId || null,
        subCategory: subCategoryId,
        isUnderMaintenance: false,
        assetImage,
      };

      assetsToInsert.push(assetData);
    }

    const insertedAssets = await Asset.insertMany(assetsToInsert);

    return res.status(201).json({
      message: `${insertedAssets.length} Assets added successfully`,
      assets: insertedAssets,
    });
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

const editAsset = async (req, res, next) => {
  const logPath = "assets/AssetLog";
  const logAction = "Edit Asset";
  const logSourceKey = "asset";
  const { user, ip } = req;

  try {
    const { assetId } = req.params;
    const {
      departmentId,
      categoryId,
      subCategoryId,
      vendorId,
      name,
      isDamaged,
      isUnderMaintenance,
      purchaseDate,
      price,
      brand,
      assetType,
      warranty,
      ownershipType,
      rentedMonths,
      tangable,
      locationId,
      status,
    } = req.body;

    const assetImageFile = req.files?.assetImage?.[0];
    const warrantyDocumentFile = req.files?.warrantyDocument?.[0];

    if (!assetId)
      throw new CustomError(
        "Asset ID is required",
        logPath,
        logAction,
        logSourceKey
      );

    const foundAsset = await Asset.findById(assetId);
    if (!foundAsset)
      throw new CustomError(
        "Asset not found",
        logPath,
        logAction,
        logSourceKey
      );

    const foundUser = await User.findById(user)
      .select("company departments role")
      .populate("role", "roleTitle");

    if (!foundUser)
      throw new CustomError("No user found", logPath, logAction, logSourceKey);

    const company = foundUser.company;

    const foundCompany = await Company.findById(company).select(
      "selectedDepartments companyName"
    );
    if (!foundCompany)
      throw new CustomError(
        "Company not found",
        logPath,
        logAction,
        logSourceKey
      );

    const department = await Department.findById(departmentId);
    if (!department)
      throw new CustomError(
        "Invalid department",
        logPath,
        logAction,
        logSourceKey
      );

    const category = await Category.findById(categoryId);
    if (!category)
      throw new CustomError(
        "Category not found",
        logPath,
        logAction,
        logSourceKey
      );

    const categoryExists = department.assetCategories?.some(
      (cat) => cat._id.toString() === categoryId
    );
    if (!categoryExists)
      throw new CustomError(
        "Category not linked to department",
        logPath,
        logAction,
        logSourceKey
      );

    const subCategory = await AssetSubCategory.findById(subCategoryId).populate(
      "category"
    );
    if (!subCategory)
      throw new CustomError(
        "Sub-category not found",
        logPath,
        logAction,
        logSourceKey
      );

    if (vendorId) {
      const foundVendor = await Vendor.findById(vendorId);
      if (!foundVendor)
        throw new CustomError(
          "Vendor not found",
          logPath,
          logAction,
          logSourceKey
        );
    }

    // === Asset Image Upload ===
    let assetImage = foundAsset.assetImage || null;
    if (assetImageFile) {
      if (assetImage?.id) await handleFileDelete(assetImage.id);

      const buffer = await sharp(assetImageFile.buffer)
        .resize(1262, 284, { fit: "contain" })
        .webp({ quality: 80 })
        .toBuffer();

      const uploadRes = await handleFileUpload(
        `data:image/webp;base64,${buffer.toString("base64")}`,
        `${foundCompany.companyName}/departments/assets/${subCategory.category.categoryName}/${subCategory.subCategoryName}/${name}`
      );

      assetImage = {
        url: uploadRes.secure_url,
        id: uploadRes.public_id,
      };
    }

    // === Warranty Document Upload ===
    let warrantyDocInfo = foundAsset.warrantyDocument || null;
    if (warrantyDocumentFile) {
      const uploadResult = await handleDocumentUpload(
        warrantyDocumentFile.buffer,
        `${foundCompany.companyName}/departments/assets/warrantyDocuments/${name}`,
        warrantyDocumentFile.originalname
      );
      warrantyDocInfo = {
        link: uploadResult.secure_url,
        documentId: uploadResult.public_id,
      };
    }

    const assetStatus =
      isDamaged || isUnderMaintenance
        ? "Inactive"
        : status
        ? status
        : foundAsset.status;

    const updatePayload = {
      assetType,
      tangable,
      ownershipType,
      vendor: vendorId || null,
      company,
      name: name?.trim(),
      purchaseDate,
      price,
      isDamaged: isDamaged ? isDamaged : foundAsset.isDamaged,
      isUnderMaintenance: isUnderMaintenance
        ? isUnderMaintenance
        : foundAsset.isUnderMaintenance,
      warranty,
      warrantyDocument: warrantyDocInfo,
      brand: brand?.trim(),
      department: departmentId,
      location: locationId || null,
      subCategory: subCategoryId,
      assetImage,
      status: assetStatus,
    };

    // Handle rental logic
    if (ownershipType === "Rental") {
      updatePayload.rentedMonths = rentedMonths;
    } else {
      updatePayload.rentedMonths = null;
    }

    const updatedAsset = await Asset.findByIdAndUpdate(assetId, updatePayload, {
      new: true,
    });

    if (!updatedAsset)
      throw new CustomError(
        "Failed to update asset",
        logPath,
        logAction,
        logSourceKey
      );

    return res.status(200).json({
      message: "Asset updated successfully",
      asset: updatedAsset,
    });
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError(error.message, logPath, logAction, logSourceKey, 500)
    );
  }
};

module.exports = { addAsset, editAsset, getAssets, getAssetsWithDepartments };
