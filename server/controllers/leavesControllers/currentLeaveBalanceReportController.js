const Leave = require("../../models/hr/Leaves");
const UserData = require("../../models/hr/UserData");
const { buildSearchRegex } = require("../../utils/referenceSearch");
const { getPagination } = require("../../utils/pagination");

const DAILY_WORK_HOURS = 9;

const normalizeLeaveType = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized.includes("sick")) return "Sick";
  if (
    normalized.includes("privileged") ||
    normalized.includes("priviledged") ||
    normalized.includes("abrupt")
  ) {
    return "Privileged";
  }
  if (normalized.includes("comp")) return "Compoff";
  if (normalized.includes("weekly")) return "Weeklyoffs";
  return String(value || "").replace(/\s+leave$/i, "").trim() || "Other";
};

const roundDays = (value) => Number(Number(value || 0).toFixed(2));

const getCurrentYearRange = () => {
  const now = new Date();
  const year = now.getFullYear();
  return {
    start: new Date(`${year}-01-01T00:00:00.000+05:30`),
    end: now,
  };
};

const getCurrentLeaveBalanceReport = async (req, res, next) => {
  try {
    const company = req.company || req.userData?.company;
    const { page, limit, skip } = getPagination({
      page: req.query.page || 1,
      limit: req.query.limit || 25,
    });
    const employeeId = String(req.query.employee || "").trim();
    const selectedLeaveType = String(req.query.leaveType || "All").trim();
    const requestedType =
      selectedLeaveType.toLowerCase() === "all"
        ? ""
        : normalizeLeaveType(selectedLeaveType);
    const searchRegex = buildSearchRegex(req.query.search);
    const range = getCurrentYearRange();

    const employees = await UserData.find({
      company,
      isActive: true,
      ...(employeeId && { _id: employeeId }),
    })
      .select("firstName lastName empId employeeType.leavesCount")
      .sort({ firstName: 1, lastName: 1, _id: 1 })
      .lean();

    const employeeIds = employees.map(({ _id }) => _id);
    const leaves = employeeIds.length
      ? await Leave.find({
          company,
          takenBy: { $in: employeeIds },
          status: "Approved",
          fromDate: { $gte: range.start, $lte: range.end },
        })
          .select("takenBy hours leaveType")
          .lean()
      : [];

    const usedByEmployee = new Map();
    leaves.forEach((leave) => {
      const employeeKey = String(leave.takenBy);
      if (!usedByEmployee.has(employeeKey)) usedByEmployee.set(employeeKey, {});
      const used = usedByEmployee.get(employeeKey);
      const type = normalizeLeaveType(leave.leaveType);
      used[type] = (used[type] || 0) + (Number(leave.hours) || 0) / DAILY_WORK_HOURS;
    });

    const rows = [];
    employees.forEach((employee) => {
      const allotted = {};
      (employee.employeeType?.leavesCount || []).forEach((leave) => {
        const type = normalizeLeaveType(leave.leaveType);
        allotted[type] = (allotted[type] || 0) + (Number(leave.count) || 0);
      });

      const used = usedByEmployee.get(String(employee._id)) || {};
      const leaveTypes = requestedType
        ? [requestedType]
        : Array.from(
            new Set([
              "Privileged",
              "Sick",
              "Compoff",
              ...Object.keys(allotted),
              ...Object.keys(used),
            ]),
          );

      leaveTypes.forEach((leaveType) => {
        const allottedLeaves = allotted[leaveType] || 0;
        const usedLeaves = used[leaveType] || 0;
        const encashedLeaves = 0;
        rows.push({
          _id: `${employee._id}-${leaveType}`,
          employee: `${employee.firstName || ""} ${employee.lastName || ""}`.trim(),
          employeeId: employee.empId || "N/A",
          leaveType,
          allottedLeaves: roundDays(allottedLeaves),
          usedLeaves: roundDays(usedLeaves),
          encashedLeaves,
          balanceLeaves: roundDays(
            Math.max(allottedLeaves - usedLeaves - encashedLeaves, 0),
          ),
          overflowLeaves: roundDays(
            Math.max(usedLeaves + encashedLeaves - allottedLeaves, 0),
          ),
        });
      });
    });

    const searchedRows = searchRegex
      ? rows.filter((row) =>
          [
            row.employee,
            row.employeeId,
            row.leaveType,
            row.allottedLeaves,
            row.usedLeaves,
            row.encashedLeaves,
            row.balanceLeaves,
            row.overflowLeaves,
          ].some((value) => searchRegex.test(String(value ?? ""))),
        )
      : rows;

    searchedRows.sort(
      (a, b) =>
        a.employee.localeCompare(b.employee) ||
        a.leaveType.localeCompare(b.leaveType),
    );
    const total = searchedRows.length;
    return res.status(200).json({
      data: searchedRows.slice(skip, skip + limit),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getCurrentLeaveBalanceReport };
