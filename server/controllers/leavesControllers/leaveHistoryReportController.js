const Leave = require("../../models/hr/Leaves");
const { buildSearchRegex } = require("../../utils/referenceSearch");
const { getPagination } = require("../../utils/pagination");

const formatName = (user) =>
  user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || "N/A"
    : "N/A";

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      }).format(new Date(value))
    : "N/A";

const parseDateRange = (fromDate, toDate) => {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(String(fromDate || "")) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(String(toDate || ""))
  ) {
    return null;
  }
  const start = new Date(`${fromDate}T00:00:00.000+05:30`);
  const end = new Date(`${toDate}T23:59:59.999+05:30`);
  return start <= end ? { start, end } : null;
};

const getLeaveHistoryReport = async (req, res, next) => {
  try {
    const company = req.company || req.userData?.company;
    const range = parseDateRange(req.query.fromDate, req.query.toDate);
    if (!range) {
      return res.status(400).json({
        message: "A valid from date and to date are required",
      });
    }

    const { page, limit, skip } = getPagination({
      page: req.query.page || 1,
      limit: req.query.limit || 25,
    });
    const employee = String(req.query.employee || "").trim();
    const searchRegex = buildSearchRegex(req.query.search);

    const leaves = await Leave.find({
      company,
      ...(employee && { takenBy: employee }),
      fromDate: { $lte: range.end },
      toDate: { $gte: range.start },
    })
      .populate("addedBy", "firstName lastName empId")
      .populate("takenBy", "firstName lastName empId")
      .populate("approvedBy", "firstName lastName empId")
      .populate("rejectedBy", "firstName lastName empId")
      .sort({ fromDate: -1, createdAt: -1, _id: -1 })
      .lean();

    const rows = leaves.map((leave) => ({
      _id: leave._id,
      fromDate: formatDate(leave.fromDate),
      toDate: formatDate(leave.toDate),
      leaveType: leave.leaveType || "N/A",
      leavePeriod: leave.leavePeriod || "N/A",
      hours: Number(leave.hours) || 0,
      description: leave.description || "N/A",
      status: leave.status || "N/A",
      addedBy: formatName(leave.addedBy),
      takenBy: formatName(leave.takenBy),
      takenByEmpId: leave.takenBy?.empId || "N/A",
      approvedBy: formatName(leave.approvedBy),
      rejectedBy: formatName(leave.rejectedBy),
    }));

    const searchedRows = searchRegex
      ? rows.filter((row) =>
          [
            row.leaveType,
            row.leavePeriod,
            row.hours,
            row.description,
            row.status,
            row.addedBy,
            row.takenBy,
            row.takenByEmpId,
            row.approvedBy,
            row.rejectedBy,
          ].some((value) => searchRegex.test(String(value ?? ""))),
        )
      : rows;

    const total = searchedRows.length;
    return res.status(200).json({
      data: searchedRows.slice(skip, skip + limit),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getLeaveHistoryReport };
