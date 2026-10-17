const mongoose = require("mongoose");
const Department = require("../../models/Departments");
const Company = require("../../models/hr/Company");
const UserData = require("../../models/hr/UserData");
const DailyLog = require("../../models/performances/KraKpaDailyLog");
const DailyLogOption = require("../../models/performances/KraKpaDailyLogOption");
const DueTask = require("../../models/performances/KraKpaDueTask");
const SelfKpa = require("../../models/performances/KraKpaIndividualMonthlyKpa");
const SelfKra = require("../../models/performances/KraKpaSelfKra");
const SelfKraCompletion = require("../../models/performances/KraKpaSelfKraCompletion");
const Event = require("../../models/events/Events");
const {
  calculateDelayedWorkingDays,
  toCalendarKey,
} = require("../../utils/kraKpaDelayedDays");

const DATE_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const KPA_SLOTS = ["11:00 AM - 12:30 PM", "03:00 PM - 04:30 PM"];
const GENERAL_DAILY_LOG_OPTIONS = [
  "Team & Manager Meetings",
  "General Tasks",
  "Internal Discussions",
  "Self KPA/KRA Updating",
  "Any abrupt work",
];
const normalizeGeneralTaskName = (value) =>
  String(value || "").trim().toLowerCase();
const DEFAULT_GENERAL_TASK_NAMES = new Set(
  GENERAL_DAILY_LOG_OPTIONS.map(normalizeGeneralTaskName),
);
const POPULATION = [
  { path: "employee", select: "firstName middleName lastName empId" },
  { path: "department", select: "name" },
  { path: "createdBy", select: "firstName middleName lastName empId" },
  { path: "sourceDueTask", select: "dueTaskName deadline" },
  { path: "sourceSelfKra", select: "title description category lead startsOn" },
  { path: "sourceSelfKpa", select: "target deadline status closingDate" },
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
  const canCreateGeneralTask =
    isHr ||
    isTopManagement ||
    roles.some((role) => role.includes("manager"));
  return {
    allDepartments,
    canManageOthers,
    canCreateGeneralTask,
    departmentIds,
    isHr,
  };
};

const getScopedFilter = (req, access) => ({
  company: req.company,
  isDeleted: { $ne: true },
  ...(!access.allDepartments && { department: { $in: access.departmentIds } }),
  ...(!access.canManageOthers && { employee: req.user }),
});

const canCreateGeneralTaskForDepartment = async (
  req,
  departmentId,
  access,
) => {
  if (access.canCreateGeneralTask) return true;
  if (!mongoose.isValidObjectId(departmentId)) return false;

  const company = await Company.findById(req.company)
    .select("selectedDepartments.department selectedDepartments.admin")
    .lean();
  const assignment = company?.selectedDepartments?.find(
    (item) => String(item.department) === String(departmentId),
  );
  if (!assignment?.admin) return false;

  return Boolean(
    await UserData.exists({
      _id: req.user,
      company: req.company,
      departments: departmentId,
      role: assignment.admin,
      isActive: true,
    }),
  );
};

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
  const canCreateGeneralTask = await canCreateGeneralTaskForDepartment(
    req,
    department,
    access,
  );
  if (
    !access.canManageOthers &&
    !canCreateGeneralTask &&
    String(employee) !== String(req.user)
  ) {
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
  return { access, canCreateGeneralTask };
};

const validateLog = (body, { requireKpaSlot = true } = {}) => {
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
  if (!date) return { error: "Date is required" };
  if (!dayTaskName) return { error: "Day Task Name is required" };
  if (dayTaskName.length > 1000) return { error: "Day Task Name is too long" };
  if (!["KRA", "KPA", "GENERAL"].includes(type)) {
    return { error: "Type must be KRA, KPA, or General" };
  }
  if (type === "KPA" && requireKpaSlot && !KPA_SLOTS.includes(kpaSlot)) {
    return { error: "KPA Slot is required" };
  }
  if (reasonForCarryForward.length > 5000) {
    return { error: "Reason for Carry Forward is too long" };
  }
  return {
    value: {
      date,
      dayTaskName,
      type,
      kpaSlot: type === "KPA" ? kpaSlot : "",
      reasonForCarryForward,
    },
  };
};

const syncSelfKpasForDeadline = async ({
  req,
  department,
  employee,
  date,
}) => {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);
  const kpas = await SelfKpa.find({
    company: req.company,
    department,
    employee,
    deadline: { $gte: date, $lt: nextDate },
    isDeleted: { $ne: true },
    $or: [
      { approvalStatus: "Approved" },
      { approvalStatus: { $exists: false } },
    ],
  })
    .select("target deadline status closingDate createdBy")
    .lean();
  const kpaIds = kpas.map((kpa) => kpa._id);
  await DailyLog.updateMany(
    {
      company: req.company,
      department,
      employee,
      date,
      sourceSelfKpa: kpaIds.length
        ? { $type: "objectId", $nin: kpaIds }
        : { $type: "objectId" },
      isDeleted: false,
    },
    { $set: { isDeleted: true, updatedBy: req.user } },
  );
  if (kpas.length === 0) return;

  await DailyLog.bulkWrite(
    kpas.map((kpa) => {
      const isCompleted = kpa.status === "Completed";
      return {
        updateOne: {
          filter: {
            company: req.company,
            sourceSelfKpa: kpa._id,
            date,
            isDeleted: false,
          },
          update: {
            $setOnInsert: {
              company: req.company,
              department,
              employee,
              sourceSelfKpa: kpa._id,
              date,
              type: "KPA",
              kpaSlot: "",
              reasonForCarryForward: "",
              resourceComment: "",
              managerComments: "",
              hrComments: "",
              reviewerComments: "",
              startTime: null,
              endTime: null,
              createdBy: kpa.createdBy || employee,
              isDeleted: false,
            },
            $set: {
              dayTaskName: kpa.target,
              deadline: kpa.deadline,
              status: isCompleted ? "Done" : "Due",
              completedAt: isCompleted ? kpa.closingDate || null : null,
              updatedBy: req.user,
            },
          },
          upsert: true,
        },
      };
    }),
  );
};

const syncPendingCarryForwardsForToday = async ({
  req,
  department,
  employee,
  date,
}) => {
  if (toCalendarKey(date) !== toCalendarKey()) return;

  const historicalLogs = await DailyLog.find({
    company: req.company,
    department,
    employee,
    date: { $lt: date },
    sourceSelfKra: null,
    sourceSelfKpa: null,
    isDeleted: { $ne: true },
  })
    .sort({ date: 1, createdAt: 1 })
    .lean();
  if (historicalLogs.length === 0) return;

  const logsById = new Map(
    historicalLogs.map((log) => [String(log._id), log]),
  );
  const latestLogByTask = new Map();
  const getTaskKey = (log) => {
    if (log.sourceDueTask) return `due-task:${String(log.sourceDueTask)}`;

    let root = log;
    const visited = new Set([String(log._id)]);
    while (root.carriedFromDailyLog) {
      const parentId = String(root.carriedFromDailyLog);
      if (visited.has(parentId)) break;
      const parent = logsById.get(parentId);
      if (!parent) break;
      visited.add(parentId);
      root = parent;
    }
    return `daily-log:${String(root._id)}`;
  };

  historicalLogs.forEach((log) => {
    latestLogByTask.set(getTaskKey(log), log);
  });
  const pendingLogs = [...latestLogByTask.values()].filter(
    (log) => log.status === "Due",
  );
  if (pendingLogs.length === 0) return;

  await DailyLog.bulkWrite(
    pendingLogs.map((log) => ({
      updateOne: {
        filter: {
          company: req.company,
          date,
          isDeleted: false,
          ...(log.sourceDueTask
            ? { sourceDueTask: log.sourceDueTask }
            : { carriedFromDailyLog: log._id }),
        },
        update: {
          $setOnInsert: {
            company: req.company,
            department: log.department,
            employee: log.employee,
            sourceDueTask: log.sourceDueTask || null,
            carriedFromDailyLog: log._id,
            date,
            deadline:
              log.deadline || (log.type === "GENERAL" ? log.date : null),
            dayTaskName: log.dayTaskName,
            type: log.type,
            kpaSlot: log.kpaSlot || "",
            status: "Due",
            reasonForCarryForward: "",
            resourceComment: "",
            managerComments: "",
            hrComments: "",
            reviewerComments: "",
            completedAt: null,
            createdBy: log.createdBy || employee,
            updatedBy: req.user,
            isDeleted: false,
          },
        },
        upsert: true,
      },
    })),
  );
};

const listDailyLogOptions = async (req, res, next) => {
  try {
    await DailyLogOption.init();
    const { department, employee } = req.query;
    if (!mongoose.isValidObjectId(department)) {
      return res.status(400).json({ message: "Valid department ID is required" });
    }
    if (employee && !mongoose.isValidObjectId(employee)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }
    const access = await getAccess(req);
    if (
      department &&
      !access.allDepartments &&
      !access.departmentIds.includes(String(department))
    ) {
      return res.status(403).json({ message: "Department access denied" });
    }
    const canCreateGeneralTask = await canCreateGeneralTaskForDepartment(
      req,
      department,
      access,
    );
    if (
      employee &&
      !access.canManageOthers &&
      !canCreateGeneralTask &&
      String(employee) !== String(req.user)
    ) {
      return res.status(403).json({ message: "Employee access denied" });
    }

    const savedOptions = await DailyLog.distinct("dayTaskName", {
      company: req.company,
      department,
      type: "GENERAL",
      isDeleted: { $ne: true },
    });
    const existingCustomOptions = [
      ...new Map(
        savedOptions
          .map((option) => String(option || "").trim())
          .filter(
            (option) =>
              option &&
              !DEFAULT_GENERAL_TASK_NAMES.has(normalizeGeneralTaskName(option)),
          )
          .map((option) => [normalizeGeneralTaskName(option), option]),
      ).values(),
    ];
    if (existingCustomOptions.length > 0) {
      await DailyLogOption.bulkWrite(
        existingCustomOptions.map((option) => ({
          updateOne: {
            filter: {
              company: req.company,
              department,
              normalizedName: normalizeGeneralTaskName(option),
            },
            update: {
              $setOnInsert: {
                company: req.company,
                department,
                name: option,
                normalizedName: normalizeGeneralTaskName(option),
                isActive: true,
                isDeleted: false,
                createdBy: null,
                updatedBy: null,
              },
            },
            upsert: true,
          },
        })),
        { ordered: false },
      );
    }

    const departmentOptions = await DailyLogOption.find({
      company: req.company,
      department,
      isActive: { $ne: false },
      isDeleted: { $ne: true },
    })
      .sort({ name: 1 })
      .select("name")
      .lean();
    const options = new Map();
    GENERAL_DAILY_LOG_OPTIONS.forEach((option) =>
      options.set(option.toLowerCase(), option),
    );
    departmentOptions.forEach((savedOption) => {
      const option = String(savedOption?.name || "").trim();
      if (option && !options.has(option.toLowerCase())) {
        options.set(option.toLowerCase(), option);
      }
    });

    return res.json({
      canCreateGeneralTask,
      options: [...options.values()],
    });
  } catch (error) {
    return next(error);
  }
};

const listDailyLogs = async (req, res, next) => {
  try {
    const {
      department,
      employee,
      date: requestedDate,
      startDate,
      endDate,
    } = req.query;
    if (department && !mongoose.isValidObjectId(department)) {
      return res.status(400).json({ message: "Invalid department ID" });
    }
    if (employee && !mongoose.isValidObjectId(employee)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }
    const occurrenceDate = requestedDate ? parseDate(requestedDate) : null;
    const rangeStart = startDate ? parseDate(startDate) : null;
    const rangeEnd = endDate ? parseDate(endDate) : null;
    if (requestedDate && !occurrenceDate) {
      return res.status(400).json({ message: "Invalid Daily Log date" });
    }
    if (startDate && !rangeStart) {
      return res.status(400).json({ message: "Invalid Daily Log start date" });
    }
    if (endDate && !rangeEnd) {
      return res.status(400).json({ message: "Invalid Daily Log end date" });
    }
    if (rangeStart && rangeEnd && rangeStart > rangeEnd) {
      return res.status(400).json({
        message: "Daily Log start date cannot be after the end date",
      });
    }
    const access = await getAccess(req);
    if (department && !access.allDepartments &&
      !access.departmentIds.includes(String(department))) {
      return res.status(403).json({ message: "Department access denied" });
    }
    if (employee && !access.canManageOthers && String(employee) !== String(req.user)) {
      return res.status(403).json({ message: "Employee access denied" });
    }
    if (department && employee && occurrenceDate) {
      await syncPendingCarryForwardsForToday({
        req,
        department,
        employee,
        date: occurrenceDate,
      });
      await syncSelfKpasForDeadline({
        req,
        department,
        employee,
        date: occurrenceDate,
      });
    }
    const records = await DailyLog.find({
      ...getScopedFilter(req, access),
      ...(department && { department }),
      ...(employee && { employee }),
      ...((rangeStart || rangeEnd) && {
        date: {
          ...(rangeStart && { $gte: rangeStart }),
          ...(rangeEnd && { $lte: rangeEnd }),
        },
      }),
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
    const canCreateGeneralTask = scope.canCreateGeneralTask;
    if (
      validation.value.type === "GENERAL" &&
      !canCreateGeneralTask
    ) {
      const normalizedName = normalizeGeneralTaskName(
        validation.value.dayTaskName,
      );
      const isDefaultOption = DEFAULT_GENERAL_TASK_NAMES.has(normalizedName);
      const isExistingOption = isDefaultOption
        ? true
        : Boolean(
            await DailyLogOption.exists({
              company: req.company,
              department: req.body.department,
              normalizedName,
              isActive: { $ne: false },
              isDeleted: { $ne: true },
            }),
          );
      if (!isExistingOption) {
        return res.status(403).json({
          message: "Employees can only select an existing General Task",
        });
      }
    }
    if (
      validation.value.type === "GENERAL" &&
      canCreateGeneralTask &&
      !DEFAULT_GENERAL_TASK_NAMES.has(
        normalizeGeneralTaskName(validation.value.dayTaskName),
      )
    ) {
      const normalizedName = normalizeGeneralTaskName(
        validation.value.dayTaskName,
      );
      await DailyLogOption.findOneAndUpdate(
        {
          company: req.company,
          department: req.body.department,
          normalizedName,
          isDeleted: false,
        },
        {
          $setOnInsert: {
            company: req.company,
            department: req.body.department,
            name: validation.value.dayTaskName,
            normalizedName,
            isDeleted: false,
            createdBy: req.user,
          },
          $set: { isActive: true, updatedBy: req.user },
        },
        { upsert: true, new: true, runValidators: true },
      );
    }
    const record = await DailyLog.create({
      ...validation.value,
      deadline: validation.value.type === "GENERAL" ? validation.value.date : null,
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
    if (!access.canManageOthers) {
      return res.status(403).json({
        message: "Only managers, HR, or Top Management can edit Daily Logs",
      });
    }
    const record = await DailyLog.findOne({
      _id: req.params.id,
      ...getScopedFilter(req, access),
    });
    if (!record) return res.status(404).json({ message: "Daily Log not found" });
    const validation = validateLog(req.body, { requireKpaSlot: false });
    if (validation.error) return res.status(400).json({ message: validation.error });
    if (Object.hasOwn(req.body, "resourceComment")) {
      return res.status(400).json({
        message: "Resource Comment can only be added when marking the Daily Log as done",
      });
    }
    if (Object.hasOwn(req.body, "reasonForCarryForward")) {
      return res.status(400).json({
        message: "Reason for Carry Forward can only be added when marking a carried-forward Daily Log as done",
      });
    }
    delete validation.value.reasonForCarryForward;
    validation.value.dayTaskName = record.dayTaskName;
    validation.value.type = record.type;
    validation.value.kpaSlot = record.type === "KPA" ? record.kpaSlot : "";
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
    if (record.status === "Done") {
      return res.status(409).json({ message: "Daily Log is already completed" });
    }
    if (record.sourceSelfKpa) {
      return res.status(400).json({
        message: "Complete the main KPA from the Self KPA page",
      });
    }
    const startTime = new Date(req.body?.startTime);
    const endTime = new Date(req.body?.endTime);
    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      return res.status(400).json({ message: "Start Time and End Time are required" });
    }
    const occurrenceDate = toCalendarKey(record.date);
    if (
      toCalendarKey(startTime) !== occurrenceDate ||
      toCalendarKey(endTime) !== occurrenceDate
    ) {
      return res.status(400).json({
        message: "Start Time and End Time must be within the Daily Log date",
      });
    }
    if (endTime <= startTime) {
      return res.status(400).json({ message: "End Time must be after Start Time" });
    }
    if (record.type === "KPA" && occurrenceDate !== toCalendarKey()) {
      return res.status(400).json({
        message: "A KPA Task can only be marked as done on its Daily Log date",
      });
    }
    const resourceComment = typeof req.body?.resourceComment === "string"
      ? req.body.resourceComment.trim()
      : "";
    const reasonForCarryForward =
      typeof req.body?.reasonForCarryForward === "string"
        ? req.body.reasonForCarryForward.trim()
        : "";
    if (record.carriedFromDailyLog && !reasonForCarryForward) {
      return res.status(400).json({
        message: "Reason for Carry Forward is required",
      });
    }
    if (!resourceComment) {
      return res.status(400).json({ message: "Resource Comment is required" });
    }
    if (reasonForCarryForward.length > 5000) {
      return res.status(400).json({
        message: "Reason for Carry Forward is too long",
      });
    }
    if (resourceComment.length > 5000) {
      return res.status(400).json({ message: "Resource Comment is too long" });
    }
    if (record.sourceSelfKra) {
      if (occurrenceDate !== toCalendarKey()) {
        return res.status(400).json({
          message: "A Self KRA can only be marked as done for today",
        });
      }
      const selfKra = await SelfKra.findOne({
        _id: record.sourceSelfKra,
        company: req.company,
        isDeleted: { $ne: true },
        isActive: { $ne: false },
      }).lean();
      if (!selfKra) {
        return res.status(404).json({ message: "Linked Self KRA not found" });
      }
      if (String(selfKra.lead) !== String(req.user)) {
        return res.status(403).json({
          message: "Only the assigned lead can complete this Self KRA",
        });
      }
      await SelfKraCompletion.findOneAndUpdate(
        {
          kraTemplate: selfKra._id,
          occurrenceDate,
        },
        {
          $setOnInsert: {
            company: selfKra.company,
            department: selfKra.department,
            employee: selfKra.employee,
            kraTemplate: selfKra._id,
            occurrenceDate,
            title: selfKra.title,
            description: selfKra.description,
            category: selfKra.category || null,
            lead: selfKra.lead,
            createdBy: selfKra.createdBy || selfKra.employee,
            status: "Completed",
            startTime,
            endTime,
            completedAt: new Date(),
            completedBy: req.user,
          },
        },
        { upsert: true, new: true, runValidators: true },
      );
    } else {
      if (String(record.employee) !== String(req.user)) {
        return res.status(403).json({
          message: "Only the employee can mark this Daily Log as done",
        });
      }
      if (record.sourceDueTask) {
        const dueTask = await DueTask.findOne({
          _id: record.sourceDueTask,
          company: req.company,
          isDeleted: { $ne: true },
        });
        if (dueTask && dueTask.status !== "Closed") {
          const closureDate = new Date();
          const holidays = await Event.find({
            company: req.company,
            type: { $regex: /^holidays?$/i },
            active: { $ne: false },
          })
            .select("start end")
            .lean();
          dueTask.status = "Closed";
          dueTask.closureDate = closureDate;
          dueTask.delayedDays = calculateDelayedWorkingDays(
            dueTask.deadline,
            closureDate,
            holidays,
          );
          dueTask.updatedBy = req.user;
          await dueTask.save();
        }
      }
    }
    record.status = "Done";
    record.startTime = startTime;
    record.endTime = endTime;
    if (record.carriedFromDailyLog) {
      record.reasonForCarryForward = reasonForCarryForward;
    }
    record.resourceComment = resourceComment;
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
  listDailyLogOptions,
  listDailyLogs,
  createDailyLog,
  updateDailyLog,
  completeDailyLog,
  deleteDailyLog,
};
