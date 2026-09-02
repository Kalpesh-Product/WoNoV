const Attendance = require("../models/hr/Attendance");
const Events = require("../models/events/Events");
const Leaves = require("../models/hr/Leaves");
const MonthlyAttendanceSummary = require("../models/hr/MonthlyAttendanceSummary");
const UserData = require("../models/hr/UserData");
const { buildSearchRegex } = require("../utils/referenceSearch");
const { getPagination } = require("../utils/pagination");

const DAILY_WORK_HOURS = 9;

const getMonthRange = (month) => {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(String(month || ""))) return null;
  const [year, monthNumber] = month.split("-").map(Number);
  const nextMonthYear = monthNumber === 12 ? year + 1 : year;
  return {
    start: new Date(`${month}-01T00:00:00.000+05:30`),
    end: new Date(
      `${nextMonthYear}-${String(monthNumber === 12 ? 1 : monthNumber + 1).padStart(2, "0")}-01T00:00:00.000+05:30`,
    ),
    yearStart: new Date(`${year}-01-01T00:00:00.000+05:30`),
  };
};

const normalizeLeaveType = (value) => {
  const type = String(value || "").trim().toLowerCase();
  if (type.includes("sick")) return "sick";
  if (
    type.includes("privileged") ||
    type.includes("priviledged") ||
    type.includes("abrupt")
  ) {
    return "privileged";
  }
  return null;
};

const roundDays = (value) => Number(Number(value || 0).toFixed(2));

const deriveSummary = ({ employee, attendance, leaves, holidays, range }) => {
  const attendanceHours = attendance.reduce((total, entry) => {
    const start = new Date(entry.inTime);
    const end = new Date(entry.outTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
      return total;
    }
    return total + (end - start) / 3600000;
  }, 0);

  let weeklyOffs = 0;
  for (let date = new Date(range.start); date < range.end; date.setDate(date.getDate() + 1)) {
    if (date.getDay() === 0) weeklyOffs += 1;
  }

  const holidayDates = new Set();
  holidays.forEach((holiday) => {
    const holidayStart = new Date(holiday.start);
    const holidayEnd = new Date(holiday.end || holiday.start);
    if (Number.isNaN(holidayStart.getTime()) || Number.isNaN(holidayEnd.getTime())) return;
    const boundedStart = holidayStart < range.start ? new Date(range.start) : holidayStart;
    const boundedEnd = holidayEnd >= range.end ? new Date(range.end.getTime() - 1) : holidayEnd;
    for (let date = new Date(boundedStart); date <= boundedEnd; date.setDate(date.getDate() + 1)) {
      holidayDates.add(date.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }));
    }
  });

  const monthLeaves = leaves.filter(
    (leave) => new Date(leave.fromDate) < range.end && new Date(leave.toDate) >= range.start,
  );
  const timeOff = roundDays(
    monthLeaves.reduce((total, leave) => total + (Number(leave.hours) || 0), 0) /
      DAILY_WORK_HOURS,
  );

  const allotted = { sick: 0, privileged: 0 };
  (employee.employeeType?.leavesCount || []).forEach((leave) => {
    const category = normalizeLeaveType(leave.leaveType);
    if (category) allotted[category] += Number(leave.count) || 0;
  });
  const before = { sick: 0, privileged: 0 };
  const through = { sick: 0, privileged: 0 };
  leaves.forEach((leave) => {
    const category = normalizeLeaveType(leave.leaveType);
    const date = new Date(leave.fromDate);
    if (!category || date < range.yearStart || date >= range.end) return;
    const days = (Number(leave.hours) || 0) / DAILY_WORK_HOURS;
    through[category] += days;
    if (date < range.start) before[category] += days;
  });
  const lop = roundDays(
    Object.keys(allotted).reduce((total, category) => {
      const previousOverflow = Math.max(before[category] - allotted[category], 0);
      const currentOverflow = Math.max(through[category] - allotted[category], 0);
      return total + Math.max(currentOverflow - previousOverflow, 0);
    }, 0),
  );

  return {
    attendanceDays: roundDays(attendanceHours / DAILY_WORK_HOURS),
    workingDays: roundDays(attendanceHours / DAILY_WORK_HOURS),
    weeklyOffs,
    holidays: holidayDates.size,
    timeOff,
    overtime: 0,
    lop,
  };
};

const getMonthlyAttendanceSummaries = async (req, res, next) => {
  try {
    const company = req.company || req.userData?.company;
    const month = req.query.month;
    const range = getMonthRange(month);
    if (!range) return res.status(400).json({ message: "Month must use YYYY-MM format" });

    const { page, limit, skip } = getPagination({
      page: req.query.page || 1,
      limit: req.query.limit || 25,
    });
    const searchRegex = buildSearchRegex(req.query.search);
    const employeeQuery = {
      company,
      isActive: true,
      ...(searchRegex && {
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { empId: searchRegex },
        ],
      }),
    };
    const [employees, total] = await Promise.all([
      UserData.find(employeeQuery)
        .select("firstName lastName empId employeeType")
        .sort({ firstName: 1, lastName: 1, _id: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UserData.countDocuments(employeeQuery),
    ]);
    const employeeIds = employees.map(({ _id }) => _id);
    const existing = await MonthlyAttendanceSummary.find({
      company,
      employee: { $in: employeeIds },
      month,
    }).lean();
    const existingByEmployee = new Map(
      existing.map((item) => [String(item.employee), item]),
    );
    const employeesToRefresh = employees.filter((employee) => {
      const summary = existingByEmployee.get(String(employee._id));
      return !summary || summary.status === "Draft";
    });

    if (employeesToRefresh.length) {
      const refreshIds = employeesToRefresh.map(({ _id }) => _id);
      const [attendance, leaves, holidays] = await Promise.all([
        Attendance.find({
          company,
          user: { $in: refreshIds },
          inTime: { $gte: range.start, $lt: range.end },
        }).lean(),
        Leaves.find({
          company,
          takenBy: { $in: refreshIds },
          status: "Approved",
          fromDate: { $gte: range.yearStart, $lt: range.end },
        }).lean(),
        Events.find({
          company,
          type: { $regex: /^holidays?$/i },
          active: { $ne: false },
          start: { $lt: range.end },
          end: { $gte: range.start },
        }).lean(),
      ]);
      const operations = employeesToRefresh.map((employee) => {
        const existingSummary = existingByEmployee.get(String(employee._id));
        const derived = deriveSummary({
          employee,
          attendance: attendance.filter(
            (item) => String(item.user) === String(employee._id),
          ),
          leaves: leaves.filter(
            (item) => String(item.takenBy) === String(employee._id),
          ),
          holidays,
          range,
        });
        const workingDaysAdjusted = Boolean(
          existingSummary?.workingDaysAdjusted ||
            (existingSummary &&
              Math.abs(
                Number(existingSummary.workingDays) -
                  Number(existingSummary.attendanceDays),
              ) > 0.001),
        );
        const { workingDays: calculatedWorkingDays, ...derivedValues } = derived;

        return {
          updateOne: {
            filter: { company, employee: employee._id, month },
            update: {
              $setOnInsert: {
                company,
                employee: employee._id,
                month,
                status: "Draft",
              },
              $set: {
                ...derivedValues,
                workingDaysAdjusted,
                ...(!workingDaysAdjusted && {
                  workingDays: calculatedWorkingDays,
                }),
              },
            },
            upsert: true,
          },
        };
      });
      await MonthlyAttendanceSummary.bulkWrite(operations);
    }

    const summaries = await MonthlyAttendanceSummary.find({
      company,
      employee: { $in: employeeIds },
      month,
    })
      .populate("employee", "firstName lastName empId")
      .lean();
    const order = new Map(employeeIds.map((id, index) => [String(id), index]));
    summaries.sort((a, b) => order.get(String(a.employee?._id)) - order.get(String(b.employee?._id)));

    return res.status(200).json({
      data: summaries,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return next(error);
  }
};

const updateMonthlyAttendanceSummary = async (req, res, next) => {
  try {
    const company = req.company || req.userData?.company;
    const workingDays = Number(req.body.workingDays);
    if (!Number.isFinite(workingDays) || workingDays < 0) {
      return res.status(400).json({ message: "Working days must be a non-negative number" });
    }
    const summary = await MonthlyAttendanceSummary.findOneAndUpdate(
      { _id: req.params.id, company, status: "Draft" },
      {
        $set: {
          workingDays: roundDays(workingDays),
          workingDaysAdjusted: true,
          updatedBy: req.userData?.userId,
        },
      },
      { new: true, runValidators: true },
    ).populate("employee", "firstName lastName empId");
    if (!summary) return res.status(404).json({ message: "Editable attendance summary not found" });
    return res.status(200).json({ message: "Attendance summary updated", data: summary });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMonthlyAttendanceSummaries,
  updateMonthlyAttendanceSummary,
};
