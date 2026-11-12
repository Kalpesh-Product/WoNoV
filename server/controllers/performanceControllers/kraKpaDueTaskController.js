const mongoose = require("mongoose");
const csvParser = require("csv-parser");
const { Readable } = require("stream");
const Department = require("../../models/Departments");
const Company = require("../../models/hr/Company");
const UserData = require("../../models/hr/UserData");
const DueTask = require("../../models/performances/KraKpaDueTask");
const DailyLog = require("../../models/performances/KraKpaDailyLog");
const IndividualMonthlyKpa = require("../../models/performances/KraKpaIndividualMonthlyKpa");
const Event = require("../../models/events/Events");
const isDepartmentManager = require("../../utils/kraKpaDepartmentManager");
const {
  buildLifecycleHistoryEntry,
} = require("../../utils/kraKpaLifecycleHistory");
const {
  validateTaskSchedule,
  isOverdueSchedule,
} = require("../../utils/kraKpaTaskSchedule");
const {
  calculateDelayedWorkingDays,
} = require("../../utils/kraKpaDelayedDays");

const DATE_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const POPULATION = [
  { path: "editHistory.editedBy", select: "firstName middleName lastName" },
  { path: "employee", select: "firstName middleName lastName empId" },
  { path: "department", select: "name" },
  {
    path: "parentKpa",
    select: "target deadline month status isActive isDeleted",
  },
  { path: "lead", select: "firstName middleName lastName empId" },
  { path: "taskIdentifier", select: "firstName middleName lastName empId" },
  { path: "assignedBy", select: "firstName middleName lastName empId" },
  { path: "createdBy", select: "firstName middleName lastName empId" },
];

// const parseDate = (value) => {
//   if (typeof value !== "string" || !DATE_PATTERN.test(value)) return undefined;
//   const date = new Date(`${value}T00:00:00.000Z`);
//   return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
//     ? date
//     : undefined;
// };

const parseDate = (value) => {
  if (typeof value !== "string") return undefined;

  const input = value.trim();

  const months = {
    jan: 1,
    january: 1,
    feb: 2,
    february: 2,
    mar: 3,
    march: 3,
    apr: 4,
    april: 4,
    may: 5,
    jun: 6,
    june: 6,
    jul: 7,
    july: 7,
    aug: 8,
    august: 8,
    sep: 9,
    september: 9,
    oct: 10,
    october: 10,
    nov: 11,
    november: 11,
    dec: 12,
    december: 12,
  };

  let day, month, year;

  // YYYY-MM-DD (existing format)
  if (DATE_PATTERN.test(input)) {
    const [y, m, d] = input.split("-");
    year = Number(y);
    month = Number(m);
    day = Number(d);
  } else {
    // DD-MM-YYYY, DD-MM-YY
    // DD-MMM-YYYY, DD-MMM-YY
    // DD-MMMM-YYYY, DD-MMMM-YY
    const match = input.match(/^(\d{2})-(\d{2}|[A-Za-z]{3,9})-(\d{2}|\d{4})$/);

    if (!match) return undefined;

    day = Number(match[1]);

    month = /^\d{2}$/.test(match[2])
      ? Number(match[2])
      : months[match[2].toLowerCase()];

    year = Number(match[3]);

    // Convert YY to 20YY
    if (match[3].length === 2) {
      year += 2000;
    }
  }

  if (
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12 ||
    year < 1 ||
    year > 9999 ||
    day < 1 ||
    day > 31
  ) {
    return undefined;
  }

  const date = new Date(Date.UTC(0, month - 1, day));
  date.setUTCFullYear(year);

  // Reject invalid calendar dates
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    return undefined;
  }

  return date;
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
  return {
    allDepartments,
    canViewOthers,
    departmentIds,
    isHr,
    isTopManagement,
  };
};

const getScopedFilter = (req, access) => ({
  company: req.company,
  isDeleted: { $ne: true },
  ...(!access.allDepartments && { department: { $in: access.departmentIds } }),
  ...(!access.canViewOthers && { employee: req.user }),
});

const validateScope = async (req, department, employee) => {
  if (
    !mongoose.isValidObjectId(department) ||
    !mongoose.isValidObjectId(employee)
  ) {
    return {
      status: 400,
      message: "Valid department and employee IDs are required",
    };
  }
  const access = await getAccess(req);
  if (
    !access.allDepartments &&
    !access.departmentIds.includes(String(department))
  ) {
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
    return {
      status: 400,
      message: "Employee is not active in this department",
    };
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
}) => {
  if (!mongoose.isValidObjectId(parentKpa)) {
    return { error: "Main KPA is required" };
  }
  const record = await IndividualMonthlyKpa.findOne({
    _id: parentKpa,
    company: req.company,
    department,
    employee,
    isDeleted: { $ne: true },
    isActive: { $ne: false },
    $or: [
      { approvalStatus: "Approved" },
      { approvalStatus: { $exists: false } },
    ],
  }).select("_id deadline");
  if (!record) {
    return { error: "Select an active, approved KPA for this employee" };
  }
  if (!record.deadline) {
    return { error: "The selected KPA must have a deadline" };
  }
  return { value: record._id, deadline: record.deadline };
};

const hasInactiveParentKpa = async (req, record) => {
  if (!record?.parentKpa) return false;
  const parentKpa = await IndividualMonthlyKpa.findOne({
    _id: record.parentKpa,
    company: req.company,
    isDeleted: { $ne: true },
    isActive: { $ne: false },
  })
    .select("_id")
    .lean();
  return !parentKpa;
};

const validateTaskDates = (task) => {
  if (task.identificationDate > task.deadline) {
    return "Identification Date cannot be after the KPA Task deadline";
  }
  return null;
};

const validateTask = (body) => {
  const dueTaskName =
    typeof body.dueTaskName === "string" ? body.dueTaskName.trim() : "";
  const comments =
    typeof body.comments === "string" ? body.comments.trim() : "";
  const identificationDate = parseDate(body.identificationDate);
  const deadline = parseDate(body.deadline);
  if (!dueTaskName) return { error: "KPA Task is required" };
  if (dueTaskName.length > 500) return { error: "KPA Task is too long" };
  if (!identificationDate) return { error: "Identification Date is required" };
  const todayParts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date()).map(({ type, value }) => [type, value]),
  );
  const today = new Date(Date.UTC(
    Number(todayParts.year), Number(todayParts.month) - 1, Number(todayParts.day),
  ));
  if (identificationDate > today) return { error: "Identification Date cannot be in the future" };
  if (!deadline) return { error: "Deadline is required" };
  if (comments.length > 5000) return { error: "Comments are too long" };
  return { value: { dueTaskName, identificationDate, deadline, comments } };
};

const listDueTaskUsers = async (req, res, next) => {
  try {
    const { department } = req.query;
    if (!mongoose.isValidObjectId(department)) {
      return res
        .status(400)
        .json({ message: "A valid department ID is required" });
    }
    const access = await getAccess(req);
    if (
      !access.allDepartments &&
      !access.departmentIds.includes(String(department))
    ) {
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
              isDeleted: { $ne: true },
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
        isInactiveParentKpa: Boolean(
          record.parentKpa &&
          (record.parentKpa.isActive === false || record.parentKpa.isDeleted),
        ),
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
    const scope = await validateScope(
      req,
      req.body.department,
      req.body.employee,
    );
    if (scope.message)
      return res.status(scope.status).json({ message: scope.message });
    const validation = validateTask(req.body);
    if (validation.error)
      return res.status(400).json({ message: validation.error });
    const parentKpaValidation = await validateParentKpa({
      req,
      parentKpa: req.body.parentKpa,
      department: req.body.department,
      employee: req.body.employee,
    });
    if (parentKpaValidation.error) {
      return res.status(400).json({ message: parentKpaValidation.error });
    }
    const dateError = validateTaskDates(validation.value);
    if (dateError) return res.status(400).json({ message: dateError });
    const identifierError = await validateUserSelection(
      req,
      req.body.taskIdentifier,
      req.body.department,
      "Task Identifier",
    );
    if (identifierError)
      return res.status(400).json({ message: identifierError });
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

const normalizeCsvHeader = (value) =>
  String(value || "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
const normalizeKpaName = (value) =>
  String(value || "")
    .replace(/^'(?=\s*[=+@-])/, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const bulkUploadDueTasks = async (req, res, next) => {
  try {
    const { department, employee, createdAtStart, createdAtEnd } = req.body;
    const scope = await validateScope(req, department, employee);
    if (scope.message)
      return res.status(scope.status).json({ message: scope.message });
    if (!req.file || !/\.csv$/i.test(req.file.originalname || "")) {
      return res.status(400).json({ message: "Please upload a CSV file." });
    }
    if (req.file.buffer.length > 2 * 1024 * 1024) {
      return res.status(400).json({ message: "CSV file must be under 2 MB." });
    }
    const rangeStart = parseDate(createdAtStart);
    const rangeEndDay = parseDate(createdAtEnd);
    if (!rangeStart || !rangeEndDay || rangeStart > rangeEndDay) {
      return res
        .status(400)
        .json({ message: "Select a valid KPA date range." });
    }
    const rangeEnd = new Date(rangeEndDay.getTime() + 24 * 60 * 60 * 1000);
    const csv = req.file.buffer
      .toString("utf8")
      .replace(/^\uFEFF/, "")
      .trim();
    if (!csv)
      return res.status(400).json({ message: "The CSV file is empty." });

    let headers = [];
    const rows = [];
    await new Promise((resolve, reject) => {
      Readable.from([csv])
        .pipe(csvParser())
        .on("headers", (values) => {
          headers = values.map(normalizeCsvHeader);
        })
        .on("data", (row) => rows.push(row))
        .on("end", resolve)
        .on("error", reject);
    });
    const requiredHeaders = [
      "mainkpa",
      "kpatask",
      "identificationdate",
      "taskdeadline",
    ];
    if (requiredHeaders.some((header) => !headers.includes(header))) {
      return res.status(400).json({
        message:
          "CSV must include Main KPA, KPA Task, Identification Date, and Task Deadline columns.",
      });
    }
    const nonEmptyRows = rows.filter((row) =>
      Object.values(row).some((value) => String(value ?? "").trim()),
    );
    if (!nonEmptyRows.length || nonEmptyRows.length > 500) {
      return res
        .status(400)
        .json({ message: "Upload between 1 and 500 Due Task rows." });
    }

    const company = await Company.findById(req.company)
      .select("selectedDepartments.department selectedDepartments.admin")
      .lean();
    const managerRole = company?.selectedDepartments?.find(
      (assignment) => String(assignment.department) === String(department),
    )?.admin;
    const manager =
      managerRole &&
      (await UserData.findOne({
        company: req.company,
        departments: department,
        role: managerRole,
        isActive: true,
      })
        .select("_id")
        .lean());
    if (!manager) {
      return res.status(400).json({
        message:
          "No active manager is assigned to this department. Due Tasks were not uploaded.",
      });
    }

    const getCell = (row, header) => {
      const key = Object.keys(row).find(
        (name) => normalizeCsvHeader(name) === header,
      );
      return key ? String(row[key] ?? "").trim() : "";
    };
    const kpas = await IndividualMonthlyKpa.find({
      company: req.company,
      department,
      employee,
      createdAt: { $gte: rangeStart, $lt: rangeEnd },
      isDeleted: { $ne: true },
      isActive: { $ne: false },
      $or: [
        { approvalStatus: "Approved" },
        { approvalStatus: { $exists: false } },
      ],
    })
      .select("_id target deadline createdAt")
      .lean();
    const kpasByName = new Map();
    kpas.forEach((kpa) => {
      const name = normalizeKpaName(kpa.target);
      kpasByName.set(name, [...(kpasByName.get(name) || []), kpa]);
    });
    const errors = [];
    const mismatchRows = [];
    const records = nonEmptyRows.map((row, index) => {
      const rowNumber = index + 2;
      const parentKpaName = getCell(row, "mainkpa");
      const task = validateTask({
        dueTaskName: getCell(row, "kpatask"),
        identificationDate: getCell(row, "identificationdate"),
        deadline: getCell(row, "taskdeadline"),
        comments: getCell(row, "comments"),
      });
      const matches = kpasByName.get(normalizeKpaName(parentKpaName)) || [];
      const parentKpa = matches.length === 1 ? matches[0] : null;
      if (!parentKpaName) {
        errors.push({
          row: rowNumber,
          field: "Main KPA",
          message: "Main KPA is required.",
        });
      } else if (matches.length > 1) {
        errors.push({
          row: rowNumber,
          field: "Main KPA",
          message:
            "More than one KPA has this name in the selected date range. Rename the KPAs to distinguish them before uploading.",
        });
      } else if (!matches.length) {
        mismatchRows.push(rowNumber);
        errors.push({
          row: rowNumber,
          field: "Main KPA",
          message: "No matching KPA. Download a fresh template and keep the Main KPA name unchanged.",
        });
      } else if (!parentKpa.deadline) {
        errors.push({
          row: rowNumber,
          field: "Main KPA",
          message: "The matching KPA has no deadline.",
        });
      }
      if (task.error) {
        const field = task.error.startsWith("Identification Date")
          ? "Identification Date"
          : task.error.startsWith("Deadline")
            ? "Task Deadline"
            : task.error.startsWith("Comments")
              ? "Comments"
              : "KPA Task";
        errors.push({ row: rowNumber, field, message: task.error });
      }
      if (!parentKpa || task.error) return null;
      const dateError = validateTaskDates(task.value);
      if (dateError)
        errors.push({
          row: rowNumber,
          field: "Task Deadline",
          message: dateError,
        });
      return {
        ...task.value,
        company: req.company,
        department,
        employee,
        parentKpa: parentKpa._id,
        lead: employee,
        taskIdentifier: manager._id,
        status: "Pending",
        assignedBy: req.user,
        createdBy: req.user,
        updatedBy: req.user,
      };
    });
    if (errors.length) {
      return res.status(400).json({
        message: mismatchRows.length
          ? "Some Main KPAs don't match the active, approved KPAs in this date range. No tasks were uploaded."
          : "Please fix the listed rows and try again. No tasks were uploaded.",
        ...(mismatchRows.length && { code: "MAIN_KPA_MISMATCH", mismatchRows }),
        errors,
      });
    }
    await DueTask.insertMany(records, { ordered: true });
    return res
      .status(201)
      .json({
        count: records.length,
        message: "Due Tasks uploaded successfully.",
      });
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
    if (validation.error)
      return res.status(400).json({ message: validation.error });
    const access = await getAccess(req);
    const record = await DueTask.findOne({
      _id: req.params.id,
      ...getScopedFilter(req, access),
    });
    if (!record) return res.status(404).json({ message: "Due Task not found" });
    if (await hasInactiveParentKpa(req, record)) {
      return res.status(409).json({
        message: "Tasks linked to an inactive KPA cannot be edited",
      });
    }
    if (record.status === "Closed") {
      return res
        .status(409)
        .json({ message: "A closed Due Task cannot be edited" });
    }
    if (
      validation.value.deadline.toISOString().slice(0, 10) !==
      record.deadline.toISOString().slice(0, 10)
    ) {
      const canEditDeadline =
        String(record.employee) === String(req.user) ||
        access.isHr ||
        access.isTopManagement ||
        (await isDepartmentManager(req, record.department, access));
      if (!canEditDeadline) {
        return res.status(403).json({
          message:
            "Only the assigned employee, department manager, HR or Top Management can edit the Due Task deadline",
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
    });
    if (parentKpaValidation.error) {
      return res.status(400).json({ message: parentKpaValidation.error });
    }
    const dateError = validateTaskDates(validation.value);
    if (dateError) return res.status(400).json({ message: dateError });
    const identifierError = await validateUserSelection(
      req,
      req.body.taskIdentifier,
      record.department,
      "Task Identifier",
    );
    if (identifierError)
      return res.status(400).json({ message: identifierError });
    await record.populate([
      { path: "parentKpa", select: "target" },
      { path: "taskIdentifier", select: "firstName middleName lastName" },
    ]);
    const historyChanges = [];
    for (const [field, label] of Object.entries({
      dueTaskName: "KPA Task",
      identificationDate: "Identification Date",
      deadline: "KPA Task Deadline",
      comments: "Comments",
    })) {
      if (!Object.hasOwn(req.body, field)) continue;
      const serialize = (value) =>
        value instanceof Date ? value.toISOString() : value || null;
      const oldValue = serialize(record[field]);
      const newValue = serialize(validation.value[field]);
      if (oldValue !== newValue)
        historyChanges.push({ field, label, oldValue, newValue });
    }
    if (
      String(record.parentKpa?._id || record.parentKpa) !==
      String(parentKpaValidation.value)
    ) {
      const parent = await IndividualMonthlyKpa.findById(
        parentKpaValidation.value,
      )
        .select("target")
        .lean();
      historyChanges.push({
        field: "parentKpa",
        label: "Main KPA",
        oldValue: record.parentKpa?.target || null,
        newValue: parent?.target || null,
      });
    }
    if (
      String(record.taskIdentifier?._id || record.taskIdentifier) !==
      String(req.body.taskIdentifier)
    ) {
      const identifier = await UserData.findById(req.body.taskIdentifier)
        .select("firstName middleName lastName")
        .lean();
      const name = (user) =>
        [user?.firstName, user?.middleName, user?.lastName]
          .filter(Boolean)
          .join(" ") || null;
      historyChanges.push({
        field: "taskIdentifier",
        label: "Task Identifier",
        oldValue: name(record.taskIdentifier),
        newValue: name(identifier),
      });
    }
    Object.assign(record, validation.value, {
      parentKpa: parentKpaValidation.value,
      lead: record.employee,
      taskIdentifier: req.body.taskIdentifier,
      updatedBy: req.user,
    });
    if (historyChanges.length) {
      if (!Array.isArray(record.editHistory)) record.editHistory = [];
      record.editHistory.push({
        editedBy: req.user,
        editedAt: new Date(),
        changes: historyChanges,
      });
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
    const type =
      typeof req.body?.type === "string"
        ? req.body.type.trim().toUpperCase()
        : "";
    const kpaSlot =
      typeof req.body?.kpaSlot === "string" ? req.body.kpaSlot.trim() : "";
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
    if (await hasInactiveParentKpa(req, record)) {
      return res.status(409).json({
        message:
          "Tasks linked to an inactive KPA cannot be added to Daily Logs",
      });
    }
    const canAdd =
      String(record.employee) === String(req.user) ||
      String(record.lead) === String(req.user);
    if (!canAdd) {
      return res.status(403).json({
        message:
          "Only the employee or assigned lead can add this task to Daily Logs",
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
    const hasInactiveParent = await Promise.all(
      records.map((record) => hasInactiveParentKpa(req, record)),
    );
    if (hasInactiveParent.some(Boolean)) {
      return res.status(409).json({
        message:
          "Tasks linked to an inactive KPA cannot be added to Daily Logs",
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
    if (await hasInactiveParentKpa(req, record)) {
      return res.status(409).json({
        message: "Tasks linked to an inactive KPA cannot be closed",
      });
    }
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
    if (!Array.isArray(record.editHistory)) record.editHistory = [];
    record.editHistory.push(
      buildLifecycleHistoryEntry({
        user: req.user,
        at: closureDate,
        field: "status",
        label: "Task Status",
        oldValue: "Pending",
        newValue: "Closed",
      }),
    );
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
    if (await hasInactiveParentKpa(req, record)) {
      return res.status(409).json({
        message: "Tasks linked to an inactive KPA cannot be deleted",
      });
    }
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
  bulkUploadDueTasks,
  updateDueTask,
  addDueTaskToDailyLogs,
  addDueTasksToDailyLogs,
  closeDueTask,
  deleteDueTask,
};
