const mongoose = require("mongoose");
const Department = require("../../models/Departments");
const UserData = require("../../models/hr/UserData");
const DailyLog = require("../../models/performances/KraKpaDailyLog");

const DATE_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const KPA_SLOTS = ["11:00 AM - 12:30 PM", "03:00 PM - 04:30 PM"];
const POPULATION = [
  { path: "employee", select: "firstName middleName lastName empId" },
  { path: "department", select: "name" },
  { path: "createdBy", select: "firstName middleName lastName empId" },
  { path: "sourceDueTask", select: "dueTaskName" },
];

const parseDate = (value) => {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    ? date
    : undefined;
};

const getAccess = async (req) => {
  const roles = (req.roles || []).map((role) => String(role).toLowerCase());
  const departmentIds = (req.departments || [])
    .map((department) => String(department?._id || department))
    .filter((id) => mongoose.isValidObjectId(id));
  const isHr = roles.some((role) => /^hr(?:\s|$)/.test(role));
  const isTopManagement =
    roles.includes("top management") ||
    Boolean(
      departmentIds.length &&
        (await Department.exists({
          _id: { $in: departmentIds },
          name: /^top management$/i,
        })),
    );
  const allDepartments =
    isHr ||
    isTopManagement ||
    roles.some((role) => ["master admin", "super admin"].includes(role));
  const canManageOthers =
    allDepartments ||
    roles.some((role) => role.includes("manager") || role.endsWith("admin"));
  return { allDepartments, canManageOthers, departmentIds, isHr };
};

const getScopedFilter = (req, access) => ({
  company: req.company,
  isDeleted: { $ne: true },
  ...(!access.allDepartments && { department: { $in: access.departmentIds } }),
  ...(!access.canManageOthers && { employee: req.user }),
});

const hideRestrictedComments = (record, access) => {
  const value = typeof record?.toObject === "function" ? record.toObject() : { ...record };
  if (!access.canManageOthers) {
    delete value.managerComments;
    delete value.reviewerComments;
  }
  if (!access.isHr) delete value.hrComments;
  return value;
};

const validateScope = async (req, department, employee) => {
  if (!mongoose.isValidObjectId(department) || !mongoose.isValidObjectId(employee)) {
    return { status: 400, message: "Valid department and employee IDs are required" };
  }
  const access = await getAccess(req);
  if (!access.allDepartments && !access.departmentIds.includes(String(department))) {
    return { status: 403, message: "Department access denied" };
  }
  if (!access.canManageOthers && String(employee) !== String(req.user)) {
    return { status: 403, message: "Employee access denied" };
  }
  const validEmployee = await UserData.exists({
    _id: employee,
    company: req.company,
    departments: department,
    isActive: true,
  });
  if (!validEmployee) {
    return { status: 400, message: "Employee is not active in this department" };
  }
  return { access };
};

const validateLog = (body) => {
  const date = parseDate(body.date);
  const dayTaskName = typeof body.dayTaskName === "string"
    ? body.dayTaskName.trim()
    : "";
  const type = typeof body.type === "string" ? body.type.trim().toUpperCase() : "";
  const kpaSlot = typeof body.kpaSlot === "string" ? body.kpaSlot.trim() : "";
  const reasonForCarryForward =
    typeof body.reasonForCarryForward === "string"
      ? body.reasonForCarryForward.trim()
      : "";
  const resourceComment =
    typeof body.resourceComment === "string" ? body.resourceComment.trim() : "";
  if (!date) return { error: "Date is required" };
  if (!dayTaskName) return { error: "Day Task Name is required" };
  if (dayTaskName.length > 1000) return { error: "Day Task Name is too long" };
  if (!["KRA", "KPA"].includes(type)) return { error: "Type must be KRA or KPA" };
  if (type === "KPA" && !KPA_SLOTS.includes(kpaSlot)) {
    return { error: "KPA Slot is required" };
  }
  if (reasonForCarryForward.length > 5000) {
    return { error: "Reason for Carry Forward is too long" };
  }
  if (resourceComment.length > 5000) {
    return { error: "Resource Comment is too long" };
  }
  return {
    value: {
      date,
      dayTaskName,
      type,
      kpaSlot: type === "KPA" ? kpaSlot : "",
      reasonForCarryForward,
      resourceComment,
    },
  };
};

const listDailyLogs = async (req, res, next) => {
  try {
    const { department, employee } = req.query;
    if (department && !mongoose.isValidObjectId(department)) {
      return res.status(400).json({ message: "Invalid department ID" });
    }
    if (employee && !mongoose.isValidObjectId(employee)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }
    const access = await getAccess(req);
    const records = await DailyLog.find({
      ...getScopedFilter(req, access),
      ...(department && { department }),
      ...(employee && { employee }),
    })
      .sort({ date: -1, createdAt: -1 })
      .populate(POPULATION)
      .lean();
    return res.json(records.map((record) => hideRestrictedComments(record, access)));
  } catch (error) {
    return next(error);
  }
};

const createDailyLog = async (req, res, next) => {
  try {
    const scope = await validateScope(req, req.body.department, req.body.employee);
    if (scope.message) return res.status(scope.status).json({ message: scope.message });
    const validation = validateLog(req.body);
    if (validation.error) return res.status(400).json({ message: validation.error });
    const record = await DailyLog.create({
      ...validation.value,
      company: req.company,
      department: req.body.department,
      employee: req.body.employee,
      status: "Due",
      createdBy: req.user,
      updatedBy: req.user,
    });
    await record.populate(POPULATION);
    return res.status(201).json(hideRestrictedComments(record, scope.access));
  } catch (error) {
    return next(error);
  }
};

const updateDailyLog = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid Daily Log ID" });
    }
    const access = await getAccess(req);
    const record = await DailyLog.findOne({
      _id: req.params.id,
      ...getScopedFilter(req, access),
    });
    if (!record) return res.status(404).json({ message: "Daily Log not found" });
    const validation = validateLog(req.body);
    if (validation.error) return res.status(400).json({ message: validation.error });
    const hasManagerComments = Object.hasOwn(req.body, "managerComments");
    const hasHrComments = Object.hasOwn(req.body, "hrComments");
    if (hasManagerComments && !access.canManageOthers) {
      return res.status(403).json({
        message: "Only managers or HR can update Manager Comments",
      });
    }
    if (hasHrComments && !access.isHr) {
      return res.status(403).json({ message: "Only HR can update HR Comments" });
    }
    const managerComments = hasManagerComments
      ? typeof req.body.managerComments === "string"
        ? req.body.managerComments.trim()
        : null
      : record.managerComments;
    const hrComments = hasHrComments
      ? typeof req.body.hrComments === "string"
        ? req.body.hrComments.trim()
        : null
      : record.hrComments;
    if (managerComments === null || managerComments.length > 5000) {
      return res.status(400).json({ message: "Manager Comments are invalid" });
    }
    if (hrComments === null || hrComments.length > 5000) {
      return res.status(400).json({ message: "HR Comments are invalid" });
    }
    Object.assign(record, validation.value, {
      managerComments,
      hrComments,
      updatedBy: req.user,
    });
    await record.save();
    await record.populate(POPULATION);
    return res.json(hideRestrictedComments(record, access));
  } catch (error) {
    return next(error);
  }
};

const completeDailyLog = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid Daily Log ID" });
    }
    const access = await getAccess(req);
    const record = await DailyLog.findOne({
      _id: req.params.id,
      ...getScopedFilter(req, access),
    });
    if (!record) return res.status(404).json({ message: "Daily Log not found" });
    if (String(record.employee) !== String(req.user)) {
      return res.status(403).json({
        message: "Only the employee can mark this Daily Log as done",
      });
    }
    if (record.status === "Done") {
      return res.status(409).json({ message: "Daily Log is already completed" });
    }
    record.status = "Done";
    record.completedAt = new Date();
    record.updatedBy = req.user;
    await record.save();
    await record.populate(POPULATION);
    return res.json(hideRestrictedComments(record, access));
  } catch (error) {
    return next(error);
  }
};

const deleteDailyLog = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid Daily Log ID" });
    }
    const access = await getAccess(req);
    const record = await DailyLog.findOne({
      _id: req.params.id,
      ...getScopedFilter(req, access),
    });
    if (!record) return res.status(404).json({ message: "Daily Log not found" });
    if (!access.canManageOthers || String(record.employee) === String(req.user)) {
      return res.status(403).json({ message: "Employees cannot delete Daily Logs" });
    }
    record.isDeleted = true;
    record.updatedBy = req.user;
    await record.save();
    return res.json({ message: "Daily Log deleted" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listDailyLogs,
  createDailyLog,
  updateDailyLog,
  completeDailyLog,
  deleteDailyLog,
};
