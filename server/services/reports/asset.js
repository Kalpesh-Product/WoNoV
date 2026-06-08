const Asset = require("../../models/assets/Assets");
const AssignAsset = require("../../models/assets/AssignAsset");
const Department = require("../../models/Departments");
const UserData = require("../../models/hr/UserData");

const fetchAssetReportService = async ({
  dateFilter,
  departments: departmentIds = [],
  roles = [],
  company,
  user: loggedInUser,
  query,
  isReport = false,
}) => {
  const defaultQuery = {
    assigned: null,
    departmentId: null,
    vendorId: null,
    sortBy: 0,
    order: 0,
  };

  query = query && Object.keys(query).length ? query : defaultQuery;

  try {
    const userId = loggedInUser;
    const user = await UserData.findById(userId)
      .populate("departments")
      .lean()
      .exec();

    if (!user) {
      throw new Error({ message: "User not found" });
    }

    const userDepartments = departmentIds || user.departments || [];

    const isTopManagement = userDepartments.some(
      (dept) => dept.name === "Top Management",
    );
    const userDepartmentIds = userDepartments.map((dept) => dept._id);

    const companyId = user.company;
    let { assigned, departmentId, vendorId, sortBy, order } = query;

    const departments = await Department.find({ isActive: true }).lean().exec();

    const assetFilter = {
      company: companyId,
      ...(dateFilter?.createdAt && {
        createdAt: dateFilter?.createdAt,
      }),
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

        {
          path: "vendor",
          populate: {
            path: "departmentId",
            select: "name",
          },
        },

        {
          path: "subCategory",
          select: "subCategoryName",
          populate: {
            path: "category",
            select: "categoryName",
          },
        },

        {
          path: "location",
          select: "unitNo unitName",
          populate: {
            path: "building",
            select: "buildingName",
          },
        },

        {
          path: "assignedAsset",
          populate: [
            {
              path: "assignee",
              select: "firstName lastName",
            },
            {
              path: "fromDepartment",
              select: "name",
            },
            {
              path: "toDepartment",
              select: "name",
            },
            {
              path: "approvedBy",
              select: "firstName lastName",
            },
            {
              path: "assignedBy",
              select: "firstName lastName",
            },
            {
              path: "rejectededBy",
              select: "firstName lastName",
            },
            {
              path: "location",
              select: "unitNo unitName",
              populate: {
                path: "building",
                select: "buildingName",
              },
            },
          ],
        },
      ])
      // .populate([
      //   { path: "department", select: "name" },
      //   { path: "vendor", populate: { path: "departmentId", select: "name" } },
      //   {
      //     path: "subCategory",
      //     select: "subCategoryName category",
      //     populate: { path: "category", select: "categoryName" },
      //   },
      //   {
      //     path: "location",
      //     select: "unitNo unitName",
      //     populate: { path: "building", select: "buildingName" },
      //   },
      // ])

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

    let result;

    // Group assets by department ID
    if (!isReport) {
      const assetMap = {};
      for (const asset of assetsWithAssignmentState) {
        const deptId = asset.department?._id?.toString();
        if (!assetMap[deptId]) assetMap[deptId] = [];
        assetMap[deptId].push(asset);
      }

      // Combine with departments, include empty ones
      result = (
        departmentId
          ? departments.filter((dept) => dept._id.toString() === departmentId)
          : departments
      ).map((dept) => ({
        departmentId: dept._id.toString(),
        departmentName: dept.name,
        assets: assetMap[dept._id.toString()] || [],
      }));
    } else {
      result = assetsWithAssignmentState.map((asset) => ({
        _id: asset._id,

        // Asset Details
        assetType: asset.assetType,
        assetId: asset.assetId,
        secondaryId: asset.secondaryId,
        departmentAssetId: asset.departmentAssetId,

        name: asset.name,
        serialNumber: asset.serialNumber,
        description: asset.description,
        brand: asset.brand,

        tangable: asset.tangable,
        ownershipType: asset.ownershipType,

        rentedMonths: asset.rentedMonths,

        // Purchase Details
        purchaseDate: asset.purchaseDate,
        price: asset.price,

        warranty: asset.warranty,
        warrantyExpiryDate: asset.warrantyExpiryDate,
        rentedExpirationDate: asset.rentedExpirationDate,

        warrantyDocument: asset.warrantyDocument || null,

        // Status
        status: asset.status,
        isDamaged: asset.isDamaged,
        isUnderMaintenance: asset.isUnderMaintenance,
        isAssigned: asset.isAssigned,

        assignmentState: asset.assignmentState,

        // Department
        department: asset.department
          ? {
              _id: asset.department._id,
              name: asset.department.name,
            }
          : null,

        // Vendor
        vendor: asset.vendor
          ? {
              _id: asset.vendor._id,
              vendorName: asset.vendor.vendorName,
              departmentId: asset.vendor.departmentId || null,
            }
          : null,

        // Category
        category: asset.subCategory.category
          ? {
              _id: asset.subCategory.category._id,
              categoryName: asset.subCategory.category.categoryName,
            }
          : null,

        subCategory: asset.subCategory
          ? {
              _id: asset.subCategory._id,
              subCategoryName: asset.subCategory.subCategoryName,
            }
          : null,

        // Location
        location: asset.location
          ? {
              _id: asset.location._id,
              unitNo: asset.location.unitNo,
              unitName: asset.location.unitName,
              building: asset.location.building
                ? {
                    _id: asset.location.building._id,
                    buildingName: asset.location.building.buildingName,
                  }
                : null,
            }
          : null,

        // Assignment
        assignedAsset: asset.assignedAsset || null,
        // Assignment
        // assignedAsset: asset.assignedAsset
        //   ? (() => {
        //       const { rejectededBy, ...rest } = asset.assignedAsset;
        //       return {
        //         ...rest,
        //         rejectedBy: rejectededBy,
        //       };
        //     })()
        //   : null,

        // Asset Image
        assetImage: asset.assetImage || null,

        createdAt: asset.createdAt,
        updatedAt: asset.updatedAt,
      }));
    }

    return result;
  } catch (error) {
    throw error;
  }
};

const fetchAssignedAssetReportService = async ({
  dateFilter,
  departments: departmentIds = [],
  company,
  user: loggedInUser,
  query,
}) => {
  const defaultQuery = {
    assigned: null,
    departmentId: null,
    sortBy: null,
    order: null,
  };

  query = query && Object.keys(query).length ? query : defaultQuery;

  try {
    const user = await UserData.findById(loggedInUser)
      .populate("departments")
      .lean()
      .exec();

    if (!user) throw new Error("User not found");

    const userDepartments = departmentIds?.length
      ? departmentIds
      : user.departments || [];
    const isTopManagement = userDepartments.some(
      (dept) => dept.name === "Top Management",
    );
    const userDepartmentIds = userDepartments.map((dept) => dept._id);

    const { assigned, departmentId, vendorId, sortBy, order } = query;

    // Build asset filter
    const assetFilter = {
      company: user.company,
      ...(dateFilter?.createdAt && { createdAt: dateFilter.createdAt }),
      ...(!isTopManagement && { department: { $in: userDepartmentIds } }),
      ...(departmentId && { department: departmentId }),
      ...(vendorId && { vendor: vendorId }),
      ...(assigned === "true" && { assignedTo: { $ne: null } }),
      ...(assigned === "false" && { assignedTo: null }),
    };

    const sortField = sortBy || "purchaseDate";
    const sortOrder = order === "desc" ? -1 : 1;

    // Fetch assets
    const assets = await Asset.find(assetFilter)
      .populate([
        { path: "department", select: "name" },
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
        { path: "vendor", select: "name companyName" },
      ])
      .select("-company")
      .sort({ [sortField]: sortOrder })
      .lean()
      .exec();

    if (!assets.length) return [];

    // Fetch latest AssignAsset record for each asset in one query
    const assetIds = assets.map((a) => a._id);

    const assignRecords = await AssignAsset.find({ asset: { $in: assetIds } })
      .sort({ createdAt: -1 })
      .populate([
        { path: "assignee", select: "firstName lastName" },
        { path: "fromDepartment", select: "name" },
        { path: "toDepartment", select: "name" },
        { path: "approvedBy", select: "firstName lastName" },
        { path: "assignedBy", select: "firstName lastName" },
        { path: "rejectededBy", select: "firstName lastName" },
        {
          path: "location",
          select: "unitNo unitName",
          populate: { path: "building", select: "buildingName" },
        },
      ])
      .lean()
      .exec();

    // Map: assetId -> latest AssignAsset record
    const assignMap = {};
    for (const record of assignRecords) {
      const key = record.asset?.toString();
      if (!assignMap[key]) assignMap[key] = record; // first = latest due to sort
    }

    // Attach assignment to each asset
    const result = assets.map((asset) => {
      const assignment = assignMap[asset._id.toString()] || null;

      const assignmentState = assignment
        ? assignment.status === "Approved"
          ? "Assigned"
          : assignment.status === "Pending"
            ? "Pending"
            : assignment.status === "Rejected"
              ? "Rejected"
              : "Available"
        : "Available";

      return {
        ...asset,
        category: asset?.subCategory?.category?.categoryName || "-",
        subCategory: asset?.subCategory?.subCategoryName || "-",
        assignmentState,
        assignedAsset: assignment,
      };
    });

    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  fetchAssetReportService,
  fetchAssignedAssetReportService,
};
