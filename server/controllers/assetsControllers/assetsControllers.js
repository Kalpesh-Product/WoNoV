const Asset = require("../../models/assets/Assets");
const User = require("../../models/hr/UserData");
const Company = require("../../models/hr/Company");
const Category = require("../../models/assets/AssetCategory");
const Vendor = require("../../models/hr/Vendor");
const sharp = require("sharp");
const {
  handleFileUpload,
  handleFileDelete,
} = require("../../config/cloudinaryConfig");
const AssetCategory = require("../../models/assets/AssetCategory");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");

const getAssets = async (req, res, next) => {
  try {
    // Get logged-in user
    const userId = req.user;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const companyId = user.company; // Fetch only assets for the user's company

    // Extract query parameters
    let { assigned, departmentId, vendorId, sortBy, order } = req.query;

    const filter = { company: companyId }; // Always filter by the user's company

    // Filter by assignment status
    if (assigned === "true") {
      filter.assignedTo = { $ne: null }; // Fetch only assigned assets
    } else if (assigned === "false") {
      filter.assignedTo = null; // Fetch only unassigned assets
    }

    // Filter by department (optional)
    if (departmentId) {
      filter.department = departmentId;
    }

    // Filter by vendor (optional)
    if (vendorId) {
      filter.vendor = vendorId;
    }

    // Sorting
    const sortField = sortBy || "purchaseDate"; // Default sort by purchase date
    const sortOrder = order === "desc" ? -1 : 1;

    // Fetch assets (without pagination)
    const assets = await Asset.find(filter)
      .populate("department assignedTo category")
      .select("-company") // Populate references
      .sort({ [sortField]: sortOrder });

    res.status(200).json(assets);
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
    } = req.body;

    // Get the user details along with the company, departments, and role
    const foundUser = await User.findOne({ _id: user })
      .select("company departments role")
      .populate([{ path: "role", select: "roleTitle" }])
      .lean()
      .exec();

    if (!foundUser) {
      throw new CustomError("No user found", logPath, logAction, logSourceKey);
    }

    const company = foundUser.company;

    // Get the company details for validation
    const foundCompany = await Company.findOne({ _id: company })
      .select("selectedDepartments companyName")
      .lean()
      .exec();

    if (!foundCompany) {
      throw new CustomError(
        "Company not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Validate that the department is selected by the company
    const doesDepartmentExist = foundCompany.selectedDepartments.find(
      (dept) => dept.department.toString() === departmentId
    );

    if (!doesDepartmentExist) {
      throw new CustomError(
        "Department not selected by your company",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Validate category existence
    const foundCategory = await Category.findOne({ _id: categoryId })
      .lean()
      .exec();
    if (!foundCategory) {
      throw new CustomError(
        "No category found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Validate that the category exists within the department's asset categories
    const categoryExistsInDepartment = doesDepartmentExist.assetCategories.find(
      (ct) => ct._id.toString() === categoryId
    );

    if (!categoryExistsInDepartment) {
      throw new CustomError(
        "No such category exists in the department",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // If vendorId is provided, validate vendor existence
    if (vendorId) {
      const foundVendor = await Vendor.findOne({ _id: vendorId }).lean().exec();
      if (!foundVendor) {
        throw new CustomError(
          "Vendor not found",
          logPath,
          logAction,
          logSourceKey
        );
      }
    }

    let imageId;
    let imageUrl;

    if (req.file) {
      const file = req.file;

      // Re-fetch category details to get sub-category information
      const foundCategoryAgain = await Category.findOne({ _id: categoryId })
        .lean()
        .exec();
      if (!foundCategoryAgain) {
        throw new CustomError(
          "Category not found",
          logPath,
          logAction,
          logSourceKey
        );
      }

      // Find the sub-category by ID
      const subCategory = foundCategoryAgain.subCategories.find(
        (subCat) => subCat._id.toString() === subCategoryId
      );
      if (!subCategory) {
        throw new CustomError(
          "Sub-category not found",
          logPath,
          logAction,
          logSourceKey
        );
      }

      // Build the dynamic upload path using the company name, category, and sub-category names
      const uploadPath = `${foundCompany.companyName}/assets/${foundCategoryAgain.categoryName}/${subCategory.name}`;

      // Process the image using Sharp
      const buffer = await sharp(file.buffer)
        .resize(800, 800, { fit: "cover" })
        .webp({ quality: 80 })
        .toBuffer();

      const base64Image = `data:image/webp;base64,${buffer.toString("base64")}`;
      const uploadResult = await handleFileUpload(base64Image, uploadPath);

      imageId = uploadResult.public_id;
      imageUrl = uploadResult.secure_url;
    }

    // Create a new asset document
    const newAsset = new Asset({
      assetType,
      vendor: vendorId || null,
      company: company,
      name,
      purchaseDate,
      quantity,
      price,
      warranty,
      brand,
      department: departmentId,
      image: {
        id: imageId,
        url: imageUrl,
      },
    });

    const savedAsset = await newAsset.save();

    // Update the asset sub-category by pushing the new asset's ID
    const updateSubcategory = await AssetCategory.findOneAndUpdate(
      { "subCategories._id": subCategoryId },
      { $push: { "subCategories.$.assets": savedAsset._id } },
      { new: true }
    );

    if (!updateSubcategory) {
      throw new CustomError(
        "Something went wrong while adding asset",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Log the successful asset addition
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Asset added successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: savedAsset._id,
      changes: {
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
        image: { id: imageId, url: imageUrl },
      },
    });

    return res.status(201).json({
      message: "Asset added successfully",
      asset: newAsset,
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
      purchaseDate,
      quantity,
      price,
      brand,
      status,
      assetType,
      warranty,
    } = req.body;

    if (!assetId) {
      throw new CustomError(
        "Asset ID must be provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const foundAsset = await Asset.findOne({ _id: assetId }).lean().exec();
    if (!foundAsset) {
      throw new CustomError(
        "Asset not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const foundUser = await User.findOne({ _id: user })
      .select("company departments role")
      .populate([{ path: "role", select: "roleTitle" }])
      .lean()
      .exec();
    if (!foundUser) {
      throw new CustomError("No user found", logPath, logAction, logSourceKey);
    }

    // Fetch company details
    const foundCompany = await Company.findOne({ _id: foundUser.company })
      .select("selectedDepartments companyName")
      .lean()
      .exec();
    if (!foundCompany) {
      throw new CustomError(
        "Company not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Validate that the department is selected by the company
    const doesDepartmentExist = foundCompany.selectedDepartments.find(
      (dept) => dept.department.toString() === departmentId
    );
    if (!doesDepartmentExist) {
      throw new CustomError(
        "Department not selected by your company",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Validate category
    const foundCategory = await Category.findOne({ _id: categoryId })
      .lean()
      .exec();
    if (!foundCategory) {
      throw new CustomError(
        "No category found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Check if category exists in department
    const categoryExistsInDepartment = doesDepartmentExist.assetCategories.find(
      (ct) => ct._id.toString() === categoryId
    );
    if (!categoryExistsInDepartment) {
      throw new CustomError(
        "No such category exists in the department",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Validate vendor if provided
    if (vendorId) {
      const foundVendor = await Vendor.findOne({ _id: vendorId }).lean().exec();
      if (!foundVendor) {
        throw new CustomError(
          "Vendor not found",
          logPath,
          logAction,
          logSourceKey
        );
      }
    }

    let imageId = foundAsset.image?.id;
    let imageUrl = foundAsset.image?.url;

    if (req.file) {
      const file = req.file;

      // Delete old image if it exists
      if (imageId) {
        await handleFileDelete(imageId);
      }

      // Extract sub-category from the fetched category
      const subCategory = foundCategory.subCategories.find(
        (subCat) => subCat._id.toString() === subCategoryId
      );
      if (!subCategory) {
        throw new CustomError(
          "Sub-category not found",
          logPath,
          logAction,
          logSourceKey
        );
      }

      // Construct the upload path dynamically using company and category details
      const uploadPath = `${foundCompany.companyName}/assets/${foundCategory.categoryName}/${subCategory.name}`;

      // Process and upload the image using Sharp
      const buffer = await sharp(file.buffer)
        .resize(800, 800, { fit: "cover" })
        .webp({ quality: 80 })
        .toBuffer();

      const base64Image = `data:image/webp;base64,${buffer.toString("base64")}`;
      const uploadResult = await handleFileUpload(base64Image, uploadPath);
      imageId = uploadResult.public_id;
      imageUrl = uploadResult.secure_url;
    }

    // Update asset fields
    const updatedAsset = await Asset.findByIdAndUpdate(
      assetId,
      {
        assetType,
        vendor: vendorId || foundAsset.vendor,
        name,
        purchaseDate,
        quantity,
        price,
        warranty,
        brand,
        department: departmentId,
        status: status || "Active",
        image: {
          id: imageId,
          url: imageUrl,
        },
      },
      { new: true }
    );

    if (!updatedAsset) {
      throw new CustomError(
        "Failed to update asset",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Log successful update
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Asset updated successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: foundUser.company,
      sourceKey: logSourceKey,
      sourceId: updatedAsset._id,
      changes: {
        assetType,
        vendor: vendorId || foundAsset.vendor,
        name,
        purchaseDate,
        quantity,
        price,
        warranty,
        brand,
        department: departmentId,
        status: status || "Active",
        image: { id: imageId, url: imageUrl },
      },
    });

    return res
      .status(200)
      .json({ message: "Asset updated successfully", asset: updatedAsset });
  } catch (error) {
    next(
      new CustomError(error.message, 500, "AssetLogs", "Edit Asset", "asset")
    );
  }
};

module.exports = { addAsset, editAsset, getAssets };
