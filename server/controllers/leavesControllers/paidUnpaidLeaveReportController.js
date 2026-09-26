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
  return String(value || "").replace(/\s+leave$/i, "").trim() || "Other";
};

const roundDays = (value) => Number(Number(value || 0).toFixed(2));

const getMonthRange = (month) => {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(String(month || ""))) return null;
  const [year, monthNumber] = month.split("-").map(Number);
  return {
    start: new Date(`${month}-01T00:00:00.000+05:30`),
    end: new Date(
      `${monthNumber === 12 ? year + 1 : year}-${String(
        monthNumber === 12 ? 1 : monthNumber + 1,
      ).padStart(2, "0")}-01T00:00:00.000+05:30`,
    ),
    yearStart: new Date(`${year}-01-01T00:00:00.000+05:30`),
    year,
    monthNumber,
  };
};

const getPaidUnpaidLeaveReport = async (req, res, next) => {
  try {
    const company = req.company || req.userData?.company;
    const range = getMonthRange(req.query.month);
    if (!range) {
      return res.status(400).json({ message: "Month must use YYYY-MM format" });
    }

    const { page, limit, skip } = getPagination({
      page: req.query.page || 1,
      limit: req.query.limit || 25,
    });
    const employeeId = String(req.query.employee || "").trim();
    const selectedLeaveType = String(req.query.leaveType || "All").trim();
    const requestedType =
      selectedLeaveType.toLowerCase() === "all" ? "" : selectedLeaveType;
    const searchRegex = buildSearchRegex(req.query.search);
    const employeeQuery = {
      company,
      isActive: true,
      ...(employeeId && { _id: employeeId }),
    };

    const employees = await UserData.find(employeeQuery)
      .select("firstName lastName empId employeeType.leavesCount")
      .sort({ firstName: 1, lastName: 1, _id: 1 })
      .lean();
    const employeeIds = employees.map(({ _id }) => _id);
    const leaves = employeeIds.length
      ? await Leave.find({
          company,
          takenBy: { $in: employeeIds },
          status: "Approved",
          fromDate: { $gte: range.yearStart, $lt: range.end },
        })
          .select("takenBy fromDate hours leaveType")
          .sort({ fromDate: 1, _id: 1 })
          .lean()
      : [];

    const leavesByEmployee = new Map();
    leaves.forEach((leave) => {
      const key = String(leave.takenBy);
      if (!leavesByEmployee.has(key)) leavesByEmployee.set(key, []);
      leavesByEmployee.get(key).push(leave);
    });

    const rows = [];
    employees.forEach((employee) => {
      const allotted = {};
      (employee.employeeType?.leavesCount || []).forEach((leave) => {
        const type = normalizeLeaveType(leave.leaveType);
        allotted[type] = (allotted[type] || 0) + (Number(leave.count) || 0);
      });

      const before = {};
      const during = {};
      (leavesByEmployee.get(String(employee._id)) || []).forEach((leave) => {
        const type = normalizeLeaveType(leave.leaveType);
        if (requestedType && type.toLowerCase() !== requestedType.toLowerCase()) {
          return;
        }
        const days = (Number(leave.hours) || 0) / DAILY_WORK_HOURS;
        if (new Date(leave.fromDate) < range.start) {
          before[type] = (before[type] || 0) + days;
        } else {
          during[type] = (during[type] || 0) + days;
        }
      });

      const reportLeaveTypes = requestedType
        ? [requestedType]
        : Array.from(
            new Set([
              "Privileged",
              "Sick",
              "Compoff",
              ...Object.keys(allotted),
              ...Object.keys(during),
            ]),
          );

      reportLeaveTypes.forEach((leaveType) => {
        const monthDays = during[leaveType] || 0;
        const allowance = allotted[leaveType] || 0;
        const usedBefore = before[leaveType] || 0;
        const unpaidBefore = Math.max(usedBefore - allowance, 0);
        const unpaidThrough = Math.max(usedBefore + monthDays - allowance, 0);
        const unpaidLeaves = Math.max(unpaidThrough - unpaidBefore, 0);
        rows.push({
          _id: `${employee._id}-${leaveType}-${req.query.month}`,
          employee: `${employee.firstName || ""} ${employee.lastName || ""}`.trim(),
          employeeId: employee.empId || "N/A",
          month: new Intl.DateTimeFormat("en-IN", { month: "long" }).format(
            new Date(Date.UTC(range.year, range.monthNumber - 1, 1)),
          ),
          year: range.year,
          leaveType,
          paidLeaves: roundDays(Math.max(monthDays - unpaidLeaves, 0)),
          unpaidLeaves: roundDays(unpaidLeaves),
        });
      });
    });

    const searchedRows = searchRegex
      ? rows.filter((row) =>
          [
            row.employee,
            row.employeeId,
            row.leaveType,
            row.paidLeaves,
            row.unpaidLeaves,
          ].some((value) => searchRegex.test(String(value ?? ""))),
        )
      : rows;

    searchedRows.sort((a, b) =>
      a.employee.localeCompare(b.employee) || a.leaveType.localeCompare(b.leaveType),
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

module.exports = { getPaidUnpaidLeaveReport };
