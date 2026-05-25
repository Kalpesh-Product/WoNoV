// const UserData = require("../../models/hr/UserData");
// const { resolveReportService } = require("./index");

// const executeReport = async ({
//   report,
//   filters,
//   department,
//   departments,
//   userId,
// }) => {
//   const reportService = resolveReportService(report);

//   if (!reportService) {
//     throw new Error(`Unsupported report: ${report.reportName}`);
//   }

//   const foundUser = await UserData.findById(userId)
//     .populate([
//       { path: "role", select: "roleTitle" },
//       { path: "departments", select: "name" },
//     ])
//     .select("role company departments")
//     .lean();

//   const roles = (foundUser?.role || []).map((role) => role.roleTitle);

//   return await reportService({
//     dateFilter: filters,
//     departmentId: department,
//     departments: departments || [],
//     roles,
//     company: foundUser.company,
//     user: foundUser._id,
//   });
// };

// module.exports = {
//   executeReport,
// };

const UserData = require("../../models/hr/UserData");
const { resolveReportService } = require("./index");

const toArray = (value) =>
  Array.isArray(value) ? value : value ? [value] : [];

async function executeReport({
  report,
  filters,
  department,
  departments,
  userId,
}) {
  console.log("2. non-queue| executeReport");
  const reportService = resolveReportService(report);

  if (!reportService) {
    throw new Error(
      `Unsupported report: ${report?.reportName || "unknown"}, ensure the reportKey is registered in reportServiceRegistry`,
    );
  }

  const foundUser = await UserData.findById(userId)
    .populate([
      { path: "role", select: "roleTitle" },
      { path: "departments", select: "name" },
    ])
    .select("role company departments")
    .lean();

  if (!foundUser) {
    throw new Error("User not found for report execution");
  }

  const roles = toArray(foundUser.role)
    .map((role) => role?.roleTitle)
    .filter(Boolean);

  return reportService({
    dateFilter: filters,
    departmentId: department,
    departments: departments || [],
    roles,
    company: foundUser.company,
    user: foundUser._id,
  });
}

module.exports = { executeReport };
