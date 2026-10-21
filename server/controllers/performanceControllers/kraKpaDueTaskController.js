const mongoose = require("mongoose");
const Department = require("../../models/Departments");
const UserData = require("../../models/hr/UserData");
const DueTask = require("../../models/performances/KraKpaDueTask");
const DailyLog = require("../../models/performances/KraKpaDailyLog");
const IndividualMonthlyKpa = require("../../models/performances/KraKpaIndividualMonthlyKpa");
const Event = require("../../models/events/Events");
const isDepartmentManager = require("../../utils/kraKpaDepartmentManager");
const { validateTaskSchedule, isOverdueSchedule } = require("../../utils/kraKpaTaskSchedule");
const {
  calculateDelayedWorkingDays,
} = require("../../utils/kraKpaDelayedDays");

const DATE_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const POPULATION = [
  { path: "editHistory.editedBy", select: "firstName middleName lastName" },
  { path: "employee", select: "firstName middleName lastName empId" },
  { path: "department", select: "name" },
  { path: "parentKpa", select: "target deadline month status" },
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
  return { allDepartments, canViewOthers, departmentIds, isHr, isTopManagement };
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

const validateParentKpa = async ({
  req,
  parentKpa,
  department,
  employee,
  identificationDate,
}) => {
  if (!mongoose.isValidObjectId(parentKpa)) {
    return { error: "Main KPA is required" };
  }
  const month = identificationDate.toISOString().slice(0, 7);
  const record = await IndividualMonthlyKpa.findOne({
    _id: parentKpa,
    company: req.company,
    department,
    employee,
    month,
    isDeleted: { $ne: true },
    $or: [
      { approvalStatus: "Approved" },
      { approvalStatus: { $exists: false } },
    ],
  }).select("_id deadline");
  if (!record) {
    return { error: "Select a valid KPA for the selected month" };
  }
  if (!record.deadline) {
    return { error: "The selected KPA must have a deadline" };
  }
  return { value: record._id, deadline: record.deadline };
};

const validateTaskDates = (task, parentKpaDeadline) => {
  if (task.deadline > parentKpaDeadline) {
    return "KPA Task deadline cannot be after the KPA deadline";
  }
  if (task.identificationDate > task.deadline) {
    return "Identification Date cannot be after the KPA Task deadline";
  }
  if (task.identificationDate > parentKpaDeadline) {
    return "Identification Date cannot be after the KPA deadline";
  }
  return null;
};

const validateTask = (body) => {
  const dueTaskName = typeof body.dueTaskName === "string"
    ? body.dueTaskName.trim()
    : "";
  const comments = typeof body.comments === "string" ? body.comments.trim() : "";
  const identificationDate = parseDate(body.identificationDate);
  const deadline = parseDate(body.deadline);
  if (!dueTaskName) return { error: "KPA Task is required" };
  if (dueTaskName.length > 500) return { error: "KPA Task is too long" };
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
    const holidays = await Event.find({
      company: req.company,
      type: { $regex: /^holidays?$/i },
      active: { $ne: false },
    })
      .select("start end")
      .lean();
    const dailyLogSchedules = records.length
      ? await DailyLog.aggregate([
          {
            $match: {
              company: records[0].company,
              sourceDueTask: { $in: records.map((record) => record._id) },
            },
          },
          {
            $group: {
              _id: "$sourceDueTask",
              scheduledDate: { $min: "$date" },
            },
          },
        ])
      : [];
    const scheduleByDueTask = new Map(
      dailyLogSchedules.map((schedule) => [
        String(schedule._id),
        schedule.scheduledDate,
      ]),
    );
    return res.json(
      records.map((record) => ({
        ...record,
        delayedDays:
          record.status === "Closed"
            ? calculateDelayedWorkingDays(
                record.deadline,
                record.closureDate,
                holidays,
              )
            : 0,
        scheduledDate: scheduleByDueTask.get(String(record._id)) || null,
        isAddedToDailyLogs: scheduleByDueTask.has(String(record._id)),
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
    const parentKpaValidation = await validateParentKpa({
      req,
      parentKpa: req.body.parentKpa,
      department: req.body.department,
      employee: req.body.employee,
      identificationDate: validation.value.identificationDate,
    });
    if (parentKpaValidation.error) {
      return res.status(400).json({ message: parentKpaValidation.error });
    }
    const dateError = validateTaskDates(
      validation.value,
      parentKpaValidation.deadline,
    );
    if (dateError) return res.status(400).json({ message: dateError });
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
      parentKpa: parentKpaValidation.value,
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
      validation.value.deadline.toISOString().slice(0, 10) !==
        record.deadline.toISOString().slice(0, 10)
    ) {
      const canEditDeadline = access.isHr || access.isTopManagement ||
        await isDepartmentManager(req, record.department, access);
      if (!canEditDeadline) {
        return res.status(403).json({
          message: "Only the department manager, HR or Top Management can edit the Due Task deadline",
        });
      }
    }
    if (
      String(record.employee) !== String(req.user) &&
      String(record.createdBy) !== String(req.user) &&
      !access.canViewOthers
    ) {
      return res.status(403).json({ message: "Due Task edit access denied" });
    }
    const parentKpaValidation = await validateParentKpa({
      req,
      parentKpa: req.body.parentKpa,
      department: record.department,
      employee: record.employee,
      identificationDate: validation.value.identificationDate,
    });
    if (parentKpaValidation.error) {
      return res.status(400).json({ message: parentKpaValidation.error });
    }
    const dateError = validateTaskDates(
      validation.value,
      parentKpaValidation.deadline,
    );
    if (dateError) return res.status(400).json({ message: dateError });
    const identifierError = await validateUserSelection(
      req,
      req.body.taskIdentifier,
      record.department,
      "Task Identifier",
    );
    if (identifierError) return res.status(400).json({ message: identifierError });
    await record.populate([
      { path: "parentKpa", select: "target" },
      { path: "taskIdentifier", select: "firstName middleName lastName" },
    ]);
    const historyChanges = [];
    for (const [field, label] of Object.entries({
      dueTaskName: "KPA Task", identificationDate: "Identification Date",
      deadline: "KPA Task Deadline", comments: "Comments",
    })) {
      if (!Object.hasOwn(req.body, field)) continue;
      const serialize = (value) => value instanceof Date ? value.toISOString() : value || null;
      const oldValue = serialize(record[field]);
      const newValue = serialize(validation.value[field]);
      if (oldValue !== newValue) historyChanges.push({ field, label, oldValue, newValue });
    }
    if (String(record.parentKpa?._id || record.parentKpa) !== String(parentKpaValidation.value)) {
      const parent = await IndividualMonthlyKpa.findById(parentKpaValidation.value).select("target").lean();
      historyChanges.push({ field: "parentKpa", label: "Main KPA", oldValue: record.parentKpa?.target || null, newValue: parent?.target || null });
    }
    if (String(record.taskIdentifier?._id || record.taskIdentifier) !== String(req.body.taskIdentifier)) {
      const identifier = await UserData.findById(req.body.taskIdentifier).select("firstName middleName lastName").lean();
      const name = (user) => [user?.firstName, user?.middleName, user?.lastName].filter(Boolean).join(" ") || null;
      historyChanges.push({ field: "taskIdentifier", label: "Task Identifier", oldValue: name(record.taskIdentifier), newValue: name(identifier) });
    }
    Object.assign(record, validation.value, {
      parentKpa: parentKpaValidation.value,
      lead: record.employee,
      taskIdentifier: req.body.taskIdentifier,
      updatedBy: req.user,
    });
    if (historyChanges.length) {
      if (!Array.isArray(record.editHistory)) record.editHistory = [];
      record.editHistory.push({ editedBy: req.user, editedAt: new Date(), changes: historyChanges });
    }
    await record.save();
    await DailyLog.updateMany(
      { sourceDueTask: record._id, isDeleted: { $ne: true } },
      {
        $set: {
          dayTaskName: record.dueTaskName,
          deadline: record.deadline,
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
    const scheduleError = validateTaskSchedule(date, [record]);
    if (scheduleError) return res.status(400).json({ message: scheduleError });
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
      isCarryForward: isOverdueSchedule(date, record.deadline),
      deadline: record.deadline,
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

const addDueTasksToDailyLogs = async (req, res, next) => {
  try {
    const dueTaskIds = Array.isArray(req.body?.dueTaskIds)
      ? [...new Set(req.body.dueTaskIds.map(String))]
      : [];
    if (
      dueTaskIds.length === 0 ||
      dueTaskIds.length > 100 ||
      dueTaskIds.some((id) => !mongoose.isValidObjectId(id))
    ) {
      return res.status(400).json({
        message: "Select between 1 and 100 valid Due Tasks",
      });
    }

    const date = parseDate(req.body?.date);
    if (!date) return res.status(400).json({ message: "Date is required" });

    const access = await getAccess(req);
    const records = await DueTask.find({
      _id: { $in: dueTaskIds },
      ...getScopedFilter(req, access),
    }).lean();
    if (records.length !== dueTaskIds.length) {
      return res.status(404).json({
        message: "One or more selected Due Tasks were not found",
      });
    }
    if (
      records.some(
        (record) =>
          String(record.employee) !== String(req.user) &&
          String(record.lead) !== String(req.user),
      )
    ) {
      return res.status(403).json({
        message: "You cannot add one or more selected tasks to Daily Logs",
      });
    }
    if (records.some((record) => record.status === "Closed")) {
      return res.status(409).json({
        message: "Closed Due Tasks cannot be added to Daily Logs",
      });
    }
    const scheduleError = validateTaskSchedule(date, records);
    if (scheduleError) return res.status(400).json({ message: scheduleError });

    const existingLinks = await DailyLog.distinct("sourceDueTask", {
      company: req.company,
      sourceDueTask: { $in: dueTaskIds },
    });
    if (existingLinks.length > 0) {
      return res.status(409).json({
        message: "One or more selected Due Tasks are already in Daily Logs",
      });
    }

    const dailyLogs = await DailyLog.insertMany(
      records.map((record) => ({
        company: record.company,
        department: record.department,
        employee: record.employee,
        sourceDueTask: record._id,
        date,
        isCarryForward: isOverdueSchedule(date, record.deadline),
        deadline: record.deadline,
        dayTaskName: record.dueTaskName,
        type: "KPA",
        kpaSlot: "",
        status: "Due",
        createdBy: req.user,
        updatedBy: req.user,
      })),
    );
    await DailyLog.populate(dailyLogs, [
      { path: "employee", select: "firstName middleName lastName empId" },
      { path: "department", select: "name" },
      { path: "createdBy", select: "firstName middleName lastName empId" },
      { path: "sourceDueTask", select: "dueTaskName" },
    ]);
    return res.status(201).json(dailyLogs);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "A selected Due Task is already in Daily Logs for this date",
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
    const holidays = await Event.find({
      company: req.company,
      type: { $regex: /^holidays?$/i },
      active: { $ne: false },
    })
      .select("start end")
      .lean();
    const delayedDays = calculateDelayedWorkingDays(
      record.deadline,
      closureDate,
      holidays,
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
  addDueTasksToDailyLogs,
  closeDueTask,
  deleteDueTask,
};
