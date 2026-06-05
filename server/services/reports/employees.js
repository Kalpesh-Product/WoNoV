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

module.exports = {
  fetchUsersReportService,
};
