const Asset = require("../../models/assets/Assets");
const User = require("../../models/hr/UserData");
const Company = require("../../models/hr/Company");
const Category = require("../../models/category/Category");
const Vendor = require("../../models/hr/Vendor");
const sharp = require("sharp");
const {
  handleFileUpload,
  handleFileDelete,
  handleDocumentUpload,
} = require("../../config/s3Config");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");
const Department = require("../../models/Departments");
const AssetSubCategory = require("../../models/category/SubCategories");
const AssignAsset = require("../../models/assets/AssignAsset");
const { Readable } = require("stream");
const csvParser = require("csv-parser");
const Unit = require("../../models/locations/Unit");

const calculateFutureDateByMonths = (baseDate, monthsToAdd) => {
  const parsedBaseDate = new Date(baseDate);
  const parsedMonths = Number(monthsToAdd);

  if (
    Number.isNaN(parsedBaseDate.getTime()) ||
    !Number.isFinite(parsedMonths) ||
    parsedMonths <= 0
  ) {
    return null;
  }

  const calculatedDate = new Date(parsedBaseDate);
  calculatedDate.setMonth(calculatedDate.getMonth() + parsedMonths);
  return calculatedDate;
};

const countWords = (value = "") =>
  String(value).trim().split(/\s+/).filter(Boolean).length;

const getAssetsWithDepartments = async (req, res, next) => {
  try {
    const user = req.user;

    const foundUser = await User.findOne({ _id: user })
      .populate([{ path: "departments", select: "name" }])
      .lean()
      .exec();

    const userDepartments = foundUser.departments || [];

    const isTopManagement = userDepartments.some(
      (dept) => dept.name === "Top Management",
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
    const user = await User.findById(userId)
      .populate("departments")
      .lean()
      .exec();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userDepartments = req.departments || user.departments || [];

    const isTopManagement = userDepartments.some(
      (dept) => dept.name === "Top Management",
    );
    const userDepartmentIds = userDepartments.map((dept) => dept._id);

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
          select: "subCategoryName category",
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

    const assetIds = assets.map((asset) => asset._id);
    const pendingRequests = await AssignAsset.find({
      asset: { $in: assetIds },
      status: "Pending",
    })
      .select("asset")
      .lean()
      .exec();

    const pendingAssetIds = new Set(
      pendingRequests.map((request) => request.asset?.toString()),
    );

    const assetsWithAssignmentState = assets.map((asset) => {
      const parsedAsset = asset.toObject();
      parsedAsset.assignmentState = pendingAssetIds.has(asset._id.toString())
        ? "Pending"
        : asset.isAssigned
          ? "Assigned"
          : "Available";
      return parsedAsset;
    });

    // Group assets by department ID
    const assetMap = {};
    for (const asset of assetsWithAssignmentState) {
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
      secondaryId,
      serialNumber,
      description,
    } = req.body;

    const normalizedSecondaryId = secondaryId?.trim() || undefined;
    const normalizedSerialNumber = serialNumber?.trim() || "";
    const normalizedDescription = description?.trim() || "";

    if (countWords(normalizedDescription) > 1000) {
      throw new CustomError(
        "Description must be 1000 words or less",
        logPath,
        logAction,
        logSourceKey,
      );
    }
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
        logSourceKey,
      );

    const doesDepartmentExist = await Department.findOne({ _id: departmentId })
      .lean()
      .exec();
    if (!doesDepartmentExist)
      throw new CustomError(
        "Department not selected by your company",
        logPath,
        logAction,
        logSourceKey,
      );

    const foundCategory = await Category.findOne({ _id: categoryId })
      .lean()
      .exec();
    if (!foundCategory)
      throw new CustomError(
        "No category found",
        logPath,
        logAction,
        logSourceKey,
      );

    const categoryExistsInDepartment = doesDepartmentExist.assetCategories.some(
      (ct) => (ct._id || ct).toString() === categoryId,
    );
    if (!categoryExistsInDepartment)
      throw new CustomError(
        "No such category exists in the department",
        logPath,
        logAction,
        logSourceKey,
      );

    if (vendorId) {
      const foundVendor = await Vendor.findOne({ _id: vendorId }).lean().exec();
      if (!foundVendor)
        throw new CustomError(
          "Vendor not found",
          logPath,
          logAction,
          logSourceKey,
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
        logSourceKey,
      );

    const assetIds = [];

    let assetImage = null;

    const imageFile =
      req?.files?.["asset-image"]?.[0] ||
      req?.files?.assetImage?.[0] ||
      req.file;

    if (imageFile) {
      try {
        const buffer = await sharp(imageFile.buffer)
          .resize(1262, 284, { fit: "contain" })
          .webp({ quality: 80 })
          .toBuffer();
        const uploadRes = await handleFileUpload(
          `data:image/webp;base64,${buffer.toString("base64")}`,
          `${foundCompany.companyName}/departments/assets/${subcategory.category.categoryName}/${subcategory.subCategoryName}/${name}`,
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
          logSourceKey,
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
    if (normalizedSecondaryId && Number(quantity) > 1) {
      throw new CustomError(
        "Secondary ID can only be set when quantity is 1",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    if (normalizedSecondaryId) {
      const existingSecondaryId = await Asset.findOne({
        secondaryId: normalizedSecondaryId,
      })
        .select("_id")
        .lean()
        .exec();

      if (existingSecondaryId) {
        throw new CustomError(
          "Secondary ID already exists",
          logPath,
          logAction,
          logSourceKey,
        );
      }
    }
    for (let i = 0; i < Number(quantity); i++) {
      const assetNumber = existingAssetsCount + i + 1; // incremental
      const uniqueAssetId = `${ownershipPrefix}-${deptPrefix}-${subCatPrefix}-${assetNumber}`;

      const warrantyExpiryDate = calculateFutureDateByMonths(
        purchaseDate,
        warranty,
      );
      const rentedExpirationDate =
        ownershipType === "Rental"
          ? calculateFutureDateByMonths(purchaseDate, rentedMonths)
          : null;

      const assetData = {
        assetType,
        assetId: uniqueAssetId,
        secondaryId:
          i === 0 && normalizedSecondaryId
            ? normalizedSecondaryId
            : uniqueAssetId,
        departmentAssetId: uniqueAssetId,
        rentedMonths: ownershipType === "Rental" ? rentedMonths : undefined,
        tangable,
        ownershipType,
        vendor: vendorId || null,
        company: company,
        name,
        serialNumber: normalizedSerialNumber,
        description: normalizedDescription,
        purchaseDate,
        price,
        warranty,
        warrantyExpiryDate,
        rentedExpirationDate,
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
        new CustomError(error.message, logPath, logAction, logSourceKey, 500),
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
      secondaryId,
      serialNumber,
      description,
    } = req.body;

    const normalizedSecondaryId = secondaryId?.trim() || undefined;
    const normalizedSerialNumber = serialNumber?.trim() || "";
    const normalizedDescription = description?.trim() || "";
    const normalizeBoolean = (value) => {
      if (typeof value === "boolean") return value;
      if (typeof value === "string") {
        const normalizedValue = value.trim().toLowerCase();
        if (normalizedValue === "true") return true;
        if (normalizedValue === "false") return false;
      }
      return undefined;
    };
    const normalizedIsDamaged = normalizeBoolean(isDamaged);
    const normalizedIsUnderMaintenance = normalizeBoolean(isUnderMaintenance);
    const assetImageFile = req.files?.assetImage?.[0];
    const warrantyDocumentFile = req.files?.warrantyDocument?.[0];

    if (countWords(normalizedDescription) > 1000) {
      throw new CustomError(
        "Description must be 1000 words or less",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    if (!assetId)
      throw new CustomError(
        "Asset ID is required",
        logPath,
        logAction,
        logSourceKey,
      );

    const foundAsset = await Asset.findById(assetId);
    if (!foundAsset)
      throw new CustomError(
        "Asset not found",
        logPath,
        logAction,
        logSourceKey,
      );

    const foundUser = await User.findById(user)
      .select("company departments role")
      .populate("role", "roleTitle");

    if (!foundUser)
      throw new CustomError("No user found", logPath, logAction, logSourceKey);

    const company = foundUser.company;

    const foundCompany = await Company.findById(company).select(
      "selectedDepartments companyName",
    );
    if (!foundCompany)
      throw new CustomError(
        "Company not found",
        logPath,
        logAction,
        logSourceKey,
      );

    const department = await Department.findById(departmentId);
    if (!department)
      throw new CustomError(
        "Invalid department",
        logPath,
        logAction,
        logSourceKey,
      );

    const subCategory =
      await AssetSubCategory.findById(subCategoryId).populate("category");
    if (!subCategory)
      throw new CustomError(
        "Sub-category not found",
        logPath,
        logAction,
        logSourceKey,
      );

    const resolvedCategoryId =
      categoryId ||
      subCategory?.category?._id?.toString() ||
      foundAsset?.subCategory?.category?.toString();

    const category = resolvedCategoryId
      ? await Category.findById(resolvedCategoryId)
      : null;

    if (!category)
      throw new CustomError(
        "Category not found",
        logPath,
        logAction,
        logSourceKey,
      );

    const categoryExists = department.assetCategories?.some(
      (cat) => (cat._id || cat).toString() === category._id.toString(),
    );
    if (!categoryExists)
      throw new CustomError(
        "Category not linked to department",
        logPath,
        logAction,
        logSourceKey,
      );

    if (vendorId) {
      const foundVendor = await Vendor.findById(vendorId);
      if (!foundVendor)
        throw new CustomError(
          "Vendor not found",
          logPath,
          logAction,
          logSourceKey,
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

      console.log("found company", foundCompany.companyName);
      const uploadRes = await handleFileUpload(
        `data:image/webp;base64,${buffer.toString("base64")}`,
        `${foundCompany.companyName}/departments/assets/${subCategory.category.categoryName}/${subCategory.subCategoryName}/${name}`,
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
        warrantyDocumentFile.originalname,
      );
      warrantyDocInfo = {
        link: uploadResult.secure_url,
        documentId: uploadResult.public_id,
      };
    }

    const assetStatus =
      normalizedIsDamaged === true || normalizedIsUnderMaintenance === true
        ? "Inactive"
        : status || foundAsset.status;

    const updatePayload = {
      assetType,
      tangable,
      ownershipType,
      vendor: vendorId || null,
      company,
      name: name?.trim(),
      serialNumber: normalizedSerialNumber,
      description: normalizedDescription,
      purchaseDate,
      price,
      isDamaged:
        normalizedIsDamaged !== undefined
          ? normalizedIsDamaged
          : foundAsset.isDamaged,
      isUnderMaintenance:
        normalizedIsUnderMaintenance !== undefined
          ? normalizedIsUnderMaintenance
          : foundAsset.isUnderMaintenance,
      warranty,
      warrantyDocument: warrantyDocInfo,
      brand: brand?.trim(),
      department: departmentId,
      location: locationId || null,
      subCategory: subCategoryId,
      assetImage,
      status: assetStatus,
      secondaryId: normalizedSecondaryId || foundAsset.assetId,
      warrantyExpiryDate: calculateFutureDateByMonths(purchaseDate, warranty),
    };

    if (normalizedSecondaryId) {
      const existingSecondaryId = await Asset.findOne({
        secondaryId: normalizedSecondaryId,
        _id: { $ne: assetId },
      })
        .select("_id")
        .lean()
        .exec();

      if (existingSecondaryId) {
        throw new CustomError(
          "Secondary ID already exists",
          logPath,
          logAction,
          logSourceKey,
        );
      }
    }

    // Handle rental logic
    if (ownershipType === "Rental") {
      updatePayload.rentedMonths = rentedMonths;
      updatePayload.rentedExpirationDate = calculateFutureDateByMonths(
        purchaseDate,
        warranty,
      );
    } else {
      updatePayload.rentedExpirationDate = null;
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
        logSourceKey,
      );

    return res.status(200).json({
      message: "Asset updated successfully",
      asset: updatedAsset,
    });
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError(error.message, logPath, logAction, logSourceKey, 500),
    );
  }
};

// const bulkInsertAssets = async (req, res, next) => {
//   try {
//     const { department } = req.params;
//     const file = req.file;

//     if (!file) {
//       return res
//         .status(400)
//         .json({ message: "Please provide a valid csv file" });
//     }

//     // Fetch reference data
//     const subCategories = await AssetSubCategory.find().lean();
//     const vendors = await Vendor.find({ departmentId: department }).lean();
//     const departmentDoc = await Department.findById(department).lean();

//     const subCategoryMap = new Map(
//       subCategories.map((cat) => [cat.subCategoryName, cat]),
//     );
//     const vendorsMap = new Map(vendors.map((v) => [v.name, v._id]));

//     const deptPrefix = departmentDoc.name.slice(0, 2).toUpperCase();
//     const company = req.user?.companyId;

//     const stream = Readable.from(file.buffer.toString("utf-8").trim());

//     const rows = [];

//     stream
//       .pipe(csvParser())
//       .on("data", (row) => {
//         rows.push(row); // Just store rows synchronously
//       })
//       .on("end", async () => {
//         const assets = [];
//         const assetCounters = {};

//         for (const row of rows) {
//           // Your async-compatible processing here
//           const assetName = row["Asset Name"]?.trim();
//           const assetType = row["Asset Type (Digital / Physical)"]?.trim();
//           const tangible =
//             row["Tangible / Intangible  Asset"]?.toLowerCase() === "tangible";
//           const ownershipType = row["Ownership Type (Owned / Rental)"]?.trim();
//           const vendorName = row["Vendor Name"]?.trim();
//           const subCategoryName = row["Sub Category"]?.trim();
//           const purchaseDate = new Date(row["Purchase Date"]);
//           const rentedExpirationDate = new Date(row["Rental Expiration Date"]);
//           const quantity = parseInt(row["Quantity"]);
//           const pricePerUnit = parseFloat(row["Price Per Unit"]);
//           const description = row["Description"]?.trim();
//           const serialNumber = row["Serial Number"]?.trim();
//           const rentedMonths = parseInt(row["Rented Months"]);
//           const warranty = parseInt(row["Warranty In Months"]);
//           const brand = row["Brand Name"]?.trim();
//           const status = row["Status (Active / Inactive)"]?.trim();
//           const isDamaged = row["Damaged (Yes/No)"]?.trim() === "Yes"? true : false;
//           const isAssigned = row["Assigned (Yes/No)"]?.trim() === "Yes"? true : false;
//           const isUnderMaintenance = row["Under Maintenance (Yes/No)"]?.trim() === "Yes"? true : false;

//           const vendorId = vendorsMap.get(vendorName);
//           const subCategoryObj = subCategoryMap.get(subCategoryName);
//           const subCategoryId = subCategoryObj?._id;
//           const subCatPrefix = subCategoryObj?.subCategoryName
//             .slice(0, 2)
//             .toUpperCase();
//           const ownershipPrefix = ownershipType.slice(0, 2).toUpperCase();

//           if (
//             !assetName ||
//             !assetType ||
//             !vendorId ||
//             !subCategoryId ||
//             !purchaseDate ||
//             !quantity ||
//             !pricePerUnit ||
//             !warranty ||
//             !brand
//           ) {
//             return res
//               .status(400)
//               .json({ message: `Row is invalid: ${JSON.stringify(row)}` });
//           }

//           const key = `${ownershipPrefix}-${deptPrefix}-${subCatPrefix}`;
//           if (!assetCounters[key]) {
//             const count = await Asset.countDocuments({
//               ownershipType,
//               department,
//               subCategory: subCategoryId,
//             });
//             assetCounters[key] = count;
//           }

//           for (let i = 0; i < quantity; i++) {
//             const assetNumber = assetCounters[key] + 1;
//             const uniqueAssetId = `${key}-${assetNumber}`;
//             assetCounters[key]++;

//             assets.push({
//               assetType: assetType === "Digital" ? "Digital" : "Physical",
//               assetId: uniqueAssetId,
//               departmentAssetId: uniqueAssetId,
//               tangable: tangible,
//               ownershipType,
//               vendor: vendorId,
//               company,
//               name: assetName,
//               purchaseDate,
//               price: pricePerUnit,
//               warranty,
//               warrantyExpiryDate: calculateFutureDateByMonths(
//                 purchaseDate,
//                 warranty,
//               ),
//               brand,
//               isDamaged: false,
//               department,
//               status: status === "Inactive" ? "Inactive" : "Active",
//               subCategory: subCategoryId,
//               rentedExpirationDate: null,
//             });
//           }
//         }

//         if (!assets.length) {
//           return res.status(400).json({ message: "No valid assets to insert" });
//         }

//         await Asset.insertMany(assets);
//         res
//           .status(201)
//           .json({ message: `${assets.length} assets inserted successfully` });
//       })
//       .on("error", (err) => {
//         console.error("CSV parsing error:", err);
//         next(err);
//       });
//   } catch (error) {
//     next(error);
//   }
// };

const bulkInsertAssets = async (req, res, next) => {
  try {
    const { department } = req.params;
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid csv file" });
    }

    const company = req.user?.companyId;

    /* ------------------ FETCH REFERENCE DATA ------------------ */

    const [categories, subCategories, vendors, departmentDoc, units] =
      await Promise.all([
        Category.find().lean(),
        AssetSubCategory.find().lean(),
        Vendor.find({ departmentId: department }).lean(),
        Department.findById(department).lean(),
        Unit.find({ company }).lean(),
      ]);

    const categoryMap = new Map(
      categories.map((c) => [c.categoryName?.trim(), c]),
    );

    const subCategoryMap = new Map(
      subCategories.map((c) => [c.subCategoryName?.trim(), c]),
    );

    const vendorsMap = new Map(vendors.map((v) => [v.name?.trim(), v._id]));

    const normalize = (val) => val?.toLowerCase().replace(/\s+/g, "");

    const unitMap = new Map(units.map((u) => [normalize(u.unitNo), u._id]));

    const deptPrefix = departmentDoc.name.slice(0, 2).toUpperCase();

    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    const rows = [];

    stream
      .pipe(csvParser())
      .on("data", (row) => rows.push(row))
      .on("end", async () => {
        try {
          const assets = [];
          const isYes = (val) => val?.toLowerCase() === "yes";

          /* 🔥 SAME AS addAsset */
          const existingAssetsCount = await Asset.countDocuments({
            department,
          });

          let globalCounter = existingAssetsCount;

          for (const row of rows) {
            /* ------------------ PARSE ------------------ */

            const assetName = row["Asset Name"]?.trim();
            const assetType = row["Asset Type (Digital / Physical)"]?.trim();
            const secondaryIdInput = row["Department Asset ID"]?.trim();

            const tangible =
              row["Tangible / Intangible  Asset"]?.toLowerCase() === "tangible";

            const ownershipType =
              row["Ownership Type (Owned / Rental)"]?.trim();

            const vendorName = row["Vendor Name"]?.trim();
            const categoryName = row["Category"]?.trim();
            const subCategoryName = row["Sub Category"]?.trim();
            const unitNo = row["Unit No"]?.trim();

            const purchaseDate = row["Purchase Date"]
              ? new Date(row["Purchase Date"])
              : null;

            const pricePerUnit = Number(row["Price Per Unit"]) || 0;
            const warranty = Number(row["Warranty In Months"]) || 0;
            const rentedMonths = Number(row["Rented Months"]) || 0;

            const description = row["Description"]?.trim();
            const serialNumber = row["Serial Number"]?.trim();
            const brand = row["Brand Name"]?.trim();

            const isDamaged = isYes(row["Damaged (Yes/No)"]);
            const isAssigned = isYes(row["Assigned (Yes/No)"]);
            const isUnderMaintenance = isYes(row["Under Maintenance (Yes/No)"]);

            /* ------------------ MAP ------------------ */

            const vendorId = vendorsMap.get(vendorName);
            const categoryObj = categoryMap.get(categoryName);
            const subCategoryObj = subCategoryMap.get(subCategoryName);

            const categoryId = categoryObj?._id;
            const subCategoryId = subCategoryObj?._id;
            const unitId = unitMap.get(normalize(unitNo));

            /* ------------------ VALIDATION ------------------ */

            if (
              !assetName ||
              !assetType ||
              !vendorId ||
              !categoryId ||
              !subCategoryId ||
              !unitId ||
              !purchaseDate ||
              !pricePerUnit ||
              !brand
            ) {
              return res.status(400).json({
                message: `Invalid row: ${JSON.stringify(row)}`,
              });
            }

            /* ------------------ PREFIX ------------------ */

            const ownershipPrefix =
              ownershipType?.slice(0, 2).toUpperCase() || "XX";

            const subCatPrefix = subCategoryObj.subCategoryName
              .slice(0, 2)
              .toUpperCase();

            /* ------------------ SECONDARY ID CHECK ------------------ */

            if (secondaryIdInput) {
              const exists = await Asset.findOne({
                secondaryId: secondaryIdInput,
              });

              if (exists) {
                return res.status(400).json({
                  message: `Duplicate secondary ID: ${secondaryIdInput}`,
                });
              }
            }

            /* ------------------ CREATE SINGLE ASSET ------------------ */

            globalCounter++;

            const uniqueAssetId = `${ownershipPrefix}-${deptPrefix}-${subCatPrefix}-${globalCounter}`;

            const warrantyExpiryDate = warranty
              ? calculateFutureDateByMonths(purchaseDate, warranty)
              : null;

            const rentedExpirationDate =
              ownershipType === "Rental"
                ? calculateFutureDateByMonths(purchaseDate, rentedMonths)
                : null;

            assets.push({
              assetType: assetType === "Digital" ? "Digital" : "Physical",
              assetId: uniqueAssetId,
              departmentAssetId: uniqueAssetId,

              secondaryId: secondaryIdInput || uniqueAssetId,

              tangable: tangible,
              ownershipType,

              vendor: vendorId,
              category: categoryId,
              subCategory: subCategoryId,

              company,
              department,
              unit: unitId,

              name: assetName,
              description,
              serialNumber,

              purchaseDate,
              price: pricePerUnit,

              warranty,
              warrantyExpiryDate,
              rentedMonths,
              rentedExpirationDate,

              brand,

              isDamaged,
              isAssigned,
              isUnderMaintenance,

              status: "Active",
            });
          }

          if (!assets.length) {
            return res.status(400).json({ message: "No valid assets" });
          }

          await Asset.insertMany(assets, { ordered: false });

          return res.status(201).json({
            message: `${assets.length} assets inserted successfully`,
          });
        } catch (err) {
          return res.status(500).json({
            message: "Error processing assets",
            error: err.message,
          });
        }
      })
      .on("error", next);
  } catch (error) {
    next(error);
  }
};

const bulkAssignedAssets = async (req, res) => {
  try {
    const { department } = req.params;
    const { company } = req;

    if (!req.file) {
      return res.status(400).json({ message: "CSV file is required" });
    }

    const stream = Readable.from(req.file.buffer.toString("utf-8").trim());

    const rows = [];

    stream
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", async () => {
        try {
          if (!rows.length) {
            return res.status(400).json({ message: "No data found in CSV" });
          }

          /* ------------------ FETCH ALL REFERENCES ------------------ */

          const [assets, users, departments, units] = await Promise.all([
            Asset.find({ company }).select("_id secondaryId"),
            UserData.find({ company }).select("_id employeeId"),
            Department.find().select("_id name"),
            Unit.find({ company }).select("_id unitNo"),
          ]);

          /* ------------------ MAPS ------------------ */

          const normalize = (val) => val?.toLowerCase().replace(/\s+/g, "");

          const assetMap = new Map(
            assets.map((a) => [a.secondaryId?.trim(), a._id]),
          );

          const userMap = new Map(
            users.map((u) => [u.employeeId?.trim(), u._id]),
          );

          const deptMap = new Map(
            departments.map((d) => [d.name?.trim(), d._id]),
          );

          const unitMap = new Map(
            units.map((u) => [normalize(u.unitNo), u._id]),
          );

          /* ------------------ PROCESS ------------------ */

          const assignments = [];

          for (const row of rows) {
            const secondaryId = row["Department Asset ID"]?.trim();
            const assigneeEmpId = row["Assignee (Employee ID)"]?.trim();
            const toDeptName = row["Department (Assigned To)"]?.trim();
            const approvedEmpId = row["Approved By (Employee ID)"]?.trim();
            const rejectedEmpId = row["Rejected By (Employee ID)"]?.trim();
            const unitNo = row["Unit No"]?.trim();
            const status =
              row["Status (Approved/Rejected/Pending/Revoked)"]?.trim();

            /* ------------------ MAP VALUES ------------------ */

            const assetId = assetMap.get(secondaryId);
            const assigneeId = userMap.get(assigneeEmpId);
            const toDepartmentId = deptMap.get(toDeptName);
            const approvedById = userMap.get(approvedEmpId);
            const rejectedById = userMap.get(rejectedEmpId);
            const unitId = unitMap.get(normalize(unitNo));

            /* ------------------ VALIDATION ------------------ */

            if (!assetId) {
              return res.status(400).json({
                message: `Asset not found for secondaryId: ${secondaryId}`,
              });
            }

            if (!assigneeId) {
              return res.status(400).json({
                message: `Assignee not found: ${assigneeEmpId}`,
              });
            }

            if (!toDepartmentId) {
              return res.status(400).json({
                message: `Department not found: ${toDeptName}`,
              });
            }

            if (!unitId) {
              return res.status(400).json({
                message: `Unit not found: ${unitNo}`,
              });
            }

            /* ------------------ BUILD OBJECT ------------------ */

            assignments.push({
              asset: assetId,
              fromDepartment: department,
              toDepartment: toDepartmentId,
              approvedBy: approvedById || null,
              rejectededBy: rejectedById || null,
              assignee: assigneeId,
              company,
              location: unitId,
              status: ["Approved", "Rejected", "Pending", "Revoked"].includes(
                status,
              )
                ? status
                : "Pending",
              isRevoked: status === "Revoked",
            });
          }

          if (!assignments.length) {
            return res.status(400).json({
              message: "No valid assignments to insert",
            });
          }

          /* ------------------ INSERT ------------------ */

          await AssignAsset.insertMany(assignments, { ordered: false });

          return res.status(201).json({
            message: `${assignments.length} assignments inserted successfully`,
          });
        } catch (err) {
          return res.status(500).json({
            message: "Error processing assignments",
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
  addAsset,
  editAsset,
  getAssets,
  getAssetsWithDepartments,
  bulkInsertAssets,
  bulkAssignedAssets,
};
