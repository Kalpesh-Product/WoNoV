const mongoose = require("mongoose");
const Department = require("../../models/Departments");
const UserData = require("../../models/hr/UserData");
const DueTask = require("../../models/performances/KraKpaDueTask");
const DailyLog = require("../../models/performances/KraKpaDailyLog");

const DATE_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const toCalendarDate = (value = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
const POPULATION = [
  { path: "employee", select: "firstName middleName lastName empId" },
  { path: "department", select: "name" },
  { path: "lead", select: "firstName middleName lastName empId" },
  { path: "taskIdentifier", select: "firstName middleName lastName empId" },
  { path: "assignedBy", select: "firstName middleName lastName empId" },
  { path: "createdBy", select: "firstName middleName lastName empId" },
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
  const canViewOthers =
    allDepartments ||
    roles.some((role) => role.includes("manager") || role.endsWith("admin"));
  return { allDepartments, canViewOthers, departmentIds };
};

const getScopedFilter = (req, access) => ({
  company: req.company,
  isDeleted: { $ne: true },
  ...(!access.allDepartments && { department: { $in: access.departmentIds } }),
  ...(!access.canViewOthers && { employee: req.user }),
});

const validateScope = async (req, department, employee) => {
  if (!mongoose.isValidObjectId(department) || !mongoose.isValidObjectId(employee)) {
    return { status: 400, message: "Valid department and employee IDs are required" };
  }
  const access = await getAccess(req);
  if (!access.allDepartments && !access.departmentIds.includes(String(department))) {
    return { status: 403, message: "Department access denied" };
  }
  if (!access.canViewOthers && String(employee) !== String(req.user)) {
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

const validateUserSelection = async (req, userId, department, field) => {
  if (!mongoose.isValidObjectId(userId)) return `${field} is required`;
  const exists = await UserData.exists({
    _id: userId,
    company: req.company,
    departments: department,
    isActive: true,
  });
  return exists ? null : `${field} must be an active user in this department`;
};

const validateTask = (body) => {
  const dueTaskName = typeof body.dueTaskName === "string"
    ? body.dueTaskName.trim()
    : "";
  const comments = typeof body.comments === "string" ? body.comments.trim() : "";
  const identificationDate = parseDate(body.identificationDate);
  const deadline = parseDate(body.deadline);
  if (!dueTaskName) return { error: "Due Task Name is required" };
  if (dueTaskName.length > 500) return { error: "Due Task Name is too long" };
  if (!identificationDate) return { error: "Identification Date is required" };
  if (!deadline) return { error: "Deadline is required" };
  if (comments.length > 5000) return { error: "Comments are too long" };
  return { value: { dueTaskName, identificationDate, deadline, comments } };
};

const listDueTaskUsers = async (req, res, next) => {
  try {
    const { department } = req.query;
    if (!mongoose.isValidObjectId(department)) {
      return res.status(400).json({ message: "A valid department ID is required" });
    }
    const access = await getAccess(req);
    if (!access.allDepartments && !access.departmentIds.includes(String(department))) {
      return res.status(403).json({ message: "Department access denied" });
    }
    const users = await UserData.find({
      company: req.company,
      departments: department,
      isActive: true,
    })
      .select("firstName middleName lastName empId")
      .sort({ firstName: 1, middleName: 1, lastName: 1 })
      .lean();
    return res.json(users);
  } catch (error) {
    return next(error);
  }
};

const listDueTasks = async (req, res, next) => {
  try {
    const { department, employee } = req.query;
    if (department && !mongoose.isValidObjectId(department)) {
      return res.status(400).json({ message: "Invalid department ID" });
    }
    if (employee && !mongoose.isValidObjectId(employee)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }
    const access = await getAccess(req);
    const records = await DueTask.find({
      ...getScopedFilter(req, access),
      ...(department && { department }),
      ...(employee && { employee }),
    })
      .sort({ identificationDate: -1, createdAt: -1 })
      .populate(POPULATION)
      .lean();
    const linkedDueTaskIds = await DailyLog.distinct("sourceDueTask", {
      company: req.company,
      sourceDueTask: { $in: records.map((record) => record._id) },
    });
    const linkedDueTaskSet = new Set(linkedDueTaskIds.map(String));
    return res.json(
      records.map((record) => ({
        ...record,
        isAddedToDailyLogs: linkedDueTaskSet.has(String(record._id)),
      })),
    );
  } catch (error) {
    return next(error);
  }
};

const createDueTask = async (req, res, next) => {
  try {
    const scope = await validateScope(req, req.body.department, req.body.employee);
    if (scope.message) return res.status(scope.status).json({ message: scope.message });
    const validation = validateTask(req.body);
    if (validation.error) return res.status(400).json({ message: validation.error });
    const identifierError = await validateUserSelection(
      req,
      req.body.taskIdentifier,
      req.body.department,
      "Task Identifier",
    );
    if (identifierError) return res.status(400).json({ message: identifierError });
    const record = await DueTask.create({
      ...validation.value,
      company: req.company,
      department: req.body.department,
      employee: req.body.employee,
      lead: req.body.employee,
      taskIdentifier: req.body.taskIdentifier,
      status: "Pending",
      assignedBy: req.user,
      createdBy: req.user,
      updatedBy: req.user,
    });
    await record.populate(POPULATION);
    return res.status(201).json(record);
  } catch (error) {
    return next(error);
  }
};

const updateDueTask = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid Due Task ID" });
    }
    const validation = validateTask(req.body);
    if (validation.error) return res.status(400).json({ message: validation.error });
    const access = await getAccess(req);
    const record = await DueTask.findOne({
      _id: req.params.id,
      ...getScopedFilter(req, access),
    });
    if (!record) return res.status(404).json({ message: "Due Task not found" });
    if (record.status === "Closed") {
      return res.status(409).json({ message: "A closed Due Task cannot be edited" });
    }
    if (
      String(record.employee) === String(req.user) &&
      validation.value.deadline.toISOString().slice(0, 10) !==
        record.deadline.toISOString().slice(0, 10)
    ) {
      return res.status(403).json({
        message: "Employees cannot edit the Due Task deadline",
      });
    }
    if (
      String(record.employee) !== String(req.user) &&
      String(record.createdBy) !== String(req.user) &&
      !access.canViewOthers
    ) {
      return res.status(403).json({ message: "Due Task edit access denied" });
    }
    const identifierError = await validateUserSelection(
      req,
      req.body.taskIdentifier,
      record.department,
      "Task Identifier",
    );
    if (identifierError) return res.status(400).json({ message: identifierError });
    Object.assign(record, validation.value, {
      lead: record.employee,
      taskIdentifier: req.body.taskIdentifier,
      updatedBy: req.user,
    });
    await record.save();
    await DailyLog.updateMany(
      { sourceDueTask: record._id, isDeleted: { $ne: true } },
      {
        $set: {
          dayTaskName: record.dueTaskName,
          updatedBy: req.user,
        },
      },
    );
    await record.populate(POPULATION);
    return res.json(record);
  } catch (error) {
    return next(error);
  }
};

const addDueTaskToDailyLogs = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid Due Task ID" });
    }
    const date = parseDate(req.body?.date);
    const type = typeof req.body?.type === "string"
      ? req.body.type.trim().toUpperCase()
      : "";
    const kpaSlot = typeof req.body?.kpaSlot === "string"
      ? req.body.kpaSlot.trim()
      : "";
    if (!date) return res.status(400).json({ message: "Date is required" });
    if (!["KRA", "KPA"].includes(type)) {
      return res.status(400).json({ message: "Type must be KRA or KPA" });
    }
    if (
      type === "KPA" &&
      !["11:00 AM - 12:30 PM", "03:00 PM - 04:30 PM"].includes(kpaSlot)
    ) {
      return res.status(400).json({ message: "KPA Slot is required" });
    }
    const access = await getAccess(req);
    const record = await DueTask.findOne({
      _id: req.params.id,
      ...getScopedFilter(req, access),
    }).lean();
    if (!record) return res.status(404).json({ message: "Due Task not found" });
    const canAdd =
      String(record.employee) === String(req.user) ||
      String(record.lead) === String(req.user);
    if (!canAdd) {
      return res.status(403).json({
        message: "Only the employee or assigned lead can add this task to Daily Logs",
      });
    }
    if (record.status === "Closed") {
      return res.status(409).json({
        message: "A closed Due Task cannot be added to Daily Logs",
      });
    }
    const alreadyAdded = await DailyLog.exists({
      company: record.company,
      sourceDueTask: record._id,
    });
    if (alreadyAdded) {
      return res.status(409).json({
        message: "This Due Task has already been added to Daily Logs",
      });
    }
    const dailyLog = await DailyLog.create({
      company: record.company,
      department: record.department,
      employee: record.employee,
      sourceDueTask: record._id,
      date,
      dayTaskName: record.dueTaskName,
      type,
      kpaSlot: type === "KPA" ? kpaSlot : "",
      status: "Due",
      createdBy: req.user,
      updatedBy: req.user,
    });
    await dailyLog.populate([
      { path: "employee", select: "firstName middleName lastName empId" },
      { path: "department", select: "name" },
      { path: "createdBy", select: "firstName middleName lastName empId" },
      { path: "sourceDueTask", select: "dueTaskName" },
    ]);
    return res.status(201).json(dailyLog);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "This Due Task is already in Daily Logs for the selected date",
      });
    }
    return next(error);
  }
};

const closeDueTask = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid Due Task ID" });
    }
    const access = await getAccess(req);
    const record = await DueTask.findOne({
      _id: req.params.id,
      ...getScopedFilter(req, access),
    });
    if (!record) return res.status(404).json({ message: "Due Task not found" });
    if (String(record.lead) !== String(req.user)) {
      return res.status(403).json({
        message: "Only the assigned lead can close this Due Task",
      });
    }
    if (record.status === "Closed") {
      return res.status(409).json({ message: "Due Task is already closed" });
    }
    const closureDate = new Date();
    const closureDay = new Date(`${toCalendarDate(closureDate)}T00:00:00.000Z`);
    const deadlineDay = new Date(`${toCalendarDate(record.deadline)}T00:00:00.000Z`);
    const delayedDays = Math.max(
      0,
      Math.floor((closureDay.getTime() - deadlineDay.getTime()) / 86400000),
    );
    record.status = "Closed";
    record.closureDate = closureDate;
    record.delayedDays = delayedDays;
    record.updatedBy = req.user;
    await record.save();
    await record.populate(POPULATION);
    return res.json(record);
  } catch (error) {
    return next(error);
  }
};

const deleteDueTask = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid Due Task ID" });
    }
    const access = await getAccess(req);
    const record = await DueTask.findOne({
      _id: req.params.id,
      ...getScopedFilter(req, access),
    });
    if (!record) return res.status(404).json({ message: "Due Task not found" });
    if (String(record.employee) === String(req.user)) {
      return res.status(403).json({
        message: "Employees cannot delete Due Tasks",
      });
    }
    record.isDeleted = true;
    record.updatedBy = req.user;
    await record.save();
    return res.json({ message: "Due Task deleted" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listDueTaskUsers,
  listDueTasks,
  createDueTask,
  updateDueTask,
  addDueTaskToDailyLogs,
  closeDueTask,
  deleteDueTask,
};
