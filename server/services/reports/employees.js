const Leave = require("../../models/hr/Leaves");
const UserData = require("../../models/hr/UserData");

const fetchUsersReportService = async ({
  company,
  query = {},
  dateFilter,
  isReport = false,
} = {}) => {
  const { deptId, status = "true" } = query;

  if (status && !["true", "false"].includes(status)) {
    throw new Error("Status must be true/false");
  }

  console.log("isREport", isReport);
  const filter = {
    company,
    isActive: status === "true",
  };

  if (deptId) {
    filter.departments = deptId;
  }

  // Adjust this field if your report should filter on another date field
  if (dateFilter?.startDate) {
    filter.startDate = dateFilter.startDate;
  }

  const populateOptions = [
    { path: "reportsTo", select: "_id name email roleTitle" },
    { path: "departments", select: "name" },
    { path: "company", select: "name" },
    { path: "role", select: "roleTitle" },
  ];

  const users = await UserData.find(filter)
    .select("-password")
    .populate(populateOptions)
    .sort({ startDate: 1 })
    .lean()
    .exec();

  const transformedUsers = users.map((user) => {
    if (!isReport) {
      return user;
    }

    const { clockInDetails, refreshToken, permissions, ...rest } = user;

    return rest;
  });

  return transformedUsers || [];
};

const fetchLeavesReportService = async ({ company, dateFilter } = {}) => {
  const matchStage = {
    "takenBy.isActive": true,
  };

  if (dateFilter?.fromDate) {
    matchStage.fromDate = dateFilter.fromDate;
  }

  const leaves = await Leave.aggregate([
    {
      $lookup: {
        from: "userdatas",
        localField: "takenBy",
        foreignField: "_id",
        as: "takenBy",
      },
    },
    { $unwind: "$takenBy" },
    { $match: matchStage },

    {
      $lookup: {
        from: "userdatas",
        localField: "addedBy",
        foreignField: "_id",
        as: "addedBy",
      },
    },
    { $unwind: { path: "$addedBy", preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: "userdatas",
        localField: "approvedBy",
        foreignField: "_id",
        as: "approvedBy",
      },
    },
    { $unwind: { path: "$approvedBy", preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: "userdatas",
        localField: "rejectedBy",
        foreignField: "_id",
        as: "rejectedBy",
      },
    },
    { $unwind: { path: "$rejectedBy", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        hours: {
          $cond: {
            if: { $eq: ["$leavePeriod", "Multiple"] },
            then: {
              $concat: [
                {
                  $toString: {
                    $floor: { $divide: ["$hours", 9] },
                  },
                },
                " days",
              ],
            },
            else: {
              $concat: [{ $toString: "$hours" }, " hrs"],
            },
          },
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            "$$ROOT",
            {
              takenBy: {
                firstName: "$takenBy.firstName",
                lastName: "$takenBy.lastName",
                empId: "$takenBy.empId",
              },
              addedBy: {
                $cond: {
                  if: { $ifNull: ["$addedBy._id", false] },
                  then: {
                    firstName: "$addedBy.firstName",
                    lastName: "$addedBy.lastName",
                  },
                  else: null,
                },
              },
              approvedBy: {
                $cond: {
                  if: { $ifNull: ["$approvedBy._id", false] },
                  then: {
                    firstName: "$approvedBy.firstName",
                    lastName: "$approvedBy.lastName",
                  },
                  else: null,
                },
              },
              rejectedBy: {
                $cond: {
                  if: { $ifNull: ["$rejectedBy._id", false] },
                  then: {
                    firstName: "$rejectedBy.firstName",
                    lastName: "$rejectedBy.lastName",
                  },
                  else: null,
                },
              },
            },
          ],
        },
      },
    },
  ]);

  return leaves || [];
};

module.exports = {
  fetchUsersReportService,
  fetchLeavesReportService,
};
