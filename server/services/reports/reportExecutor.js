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
  const reportService = resolveReportService(report);

  console.log("Executing report with parameters:", report);
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
