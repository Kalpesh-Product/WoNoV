const {
  fetchDeptTaskReportService,
  fetchMyTasksReportService,
} = require("../../services/reports/task");
const { default: mongoose } = require("mongoose");
const User = require("../../models/hr/UserData");
const Task = require("../../models/tasks/Task");
const CustomError = require("../../utils/customErrorlogs");
const { formatDate, formatTime } = require("../../utils/formatDateTime");
const { createLog } = require("../../utils/moduleLogs");
const validateUsers = require("../../utils/validateUsers");
const Department = require("../../models/Departments");
const UserData = require("../../models/hr/UserData");
const Unit = require("../../models/locations/Unit");
const emitter = require("../../utils/eventEmitter");
const { Readable } = require("stream");
const csvParser = require("csv-parser");
const {
  toUtcStartOfDay,
  getTodayUtcRange,
  getRequestTimezone,
} = require("../../utils/dateTimezone");

const VALID_BULK_TASK_STATUSES = ["Pending", "InProgress", "Completed"];
const BULK_TASK_REQUIRED_FIELDS = [
  "taskName",
  "department",
  // "description",
  "assignedDate",
  // "dueDate",t
  "dueTime",
  "taskType",
];
const CSV_MIME_TYPES = [
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel",
  "text/plain",
];

const normalizeCsvValue = (value) => String(value || "").trim();

const normalizeLookupValue = (value) => normalizeCsvValue(value).toLowerCase();

const escapeRegex = (value) =>
  normalizeCsvValue(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isValidCsvUpload = (file) => {
  const originalName = normalizeLookupValue(file?.originalname);
  return (
    CSV_MIME_TYPES.includes(file?.mimetype) || originalName.endsWith(".csv")
  );
};

const parseCsvRows = (csvData) =>
  new Promise((resolve, reject) => {
    const rows = [];

    Readable.from(csvData)
      .pipe(csvParser())
      .on("data", (row) => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });

const parseTaskDate = (value) => {
  const parsedDate = new Date(normalizeCsvValue(value));
  return isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const parseTaskDueTime = (value, dueDate) => {
  const rawDueTime = normalizeCsvValue(value);
  if (!rawDueTime || !dueDate) return null;

  const parsedTime = new Date(rawDueTime);
  if (!isNaN(parsedTime.getTime())) return parsedTime;

  const timeMatch = rawDueTime.match(
    /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i,
  );
  if (!timeMatch) return null;

  let hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  const seconds = Number(timeMatch[3] || 0);
  const meridiem = timeMatch[4]?.toUpperCase();

  if (minutes > 59 || seconds > 59 || hours > (meridiem ? 12 : 23)) {
    return null;
  }

  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;

  const dateWithTime = new Date(dueDate);
  dateWithTime.setHours(hours, minutes, seconds, 0);
  return dateWithTime;
};

const splitUserName = (name) => {
  const parts = normalizeCsvValue(name).split(/\s+/).filter(Boolean);
  if (parts.length < 2) return null;
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
};

const resolveBulkTaskUser = async (value, company) => {
  const normalizedValue = normalizeCsvValue(value);
  if (!normalizedValue) return null;

  const baseQuery = company ? { company } : {};
  if (mongoose.Types.ObjectId.isValid(normalizedValue)) {
    return UserData.findOne({ _id: normalizedValue, ...baseQuery })
      .select("_id")
      .lean();
  }

  const name = splitUserName(normalizedValue);
  const firstName = name?.firstName || normalizedValue;
  const userQuery = {
    ...baseQuery,
    firstName: new RegExp(`^${escapeRegex(firstName)}$`, "i"),
  };

  if (name?.lastName) {
    userQuery.lastName = new RegExp(`^${escapeRegex(name.lastName)}$`, "i");
  }

  return UserData.findOne(userQuery).select("_id").lean();
};

const resolveBulkTaskDepartment = async (value) => {
  const normalizedValue = normalizeCsvValue(value);
  if (!normalizedValue) return null;

  if (mongoose.Types.ObjectId.isValid(normalizedValue)) {
    return Department.findOne({ _id: normalizedValue, isActive: true })
      .select("_id")
      .lean();
  }

  return Department.findOne({
    name: new RegExp(`^${escapeRegex(normalizedValue)}$`, "i"),
    isActive: true,
  })
    .select("_id")
    .lean();
};

const resolveBulkTaskLocation = async (value, company) => {
  const normalizedValue = normalizeCsvValue(value);
  if (!normalizedValue) return null;

  const baseQuery = { isActive: true, ...(company ? { company } : {}) };
  if (mongoose.Types.ObjectId.isValid(normalizedValue)) {
    return Unit.findOne({ _id: normalizedValue, ...baseQuery })
      .select("_id")
      .lean();
  }

  const escapedValue = escapeRegex(normalizedValue);
  return Unit.findOne({
    ...baseQuery,
    $or: [
      { unitNo: new RegExp(`^${escapedValue}$`, "i") },
      { unitName: new RegExp(`^${escapedValue}$`, "i") },
      { unitName: new RegExp(escapedValue, "i") },
    ],
  })
    .select("_id")
    .lean();
};

const createTasks = async (req, res, next) => {
  const { user, ip, company } = req;
  const logPath = "tasks/TaskLog";
  const logAction = "Create Task";
  const logSourceKey = "task";

  try {
    const {
      taskName,
      department,
      description,
      taskType,
      // status,
      // priority,
      // assignees,
      dueTime,
      endDate: dueDate,
      startDate: assignedDate,
      location,
      assignTo,
    } = req.body;

    if (
      !taskName ||
      !department ||
      !description ||
      !dueDate ||
      !assignedDate ||
      !dueTime ||
      !taskType
    ) {
      throw new CustomError(
        "Missing required fields",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    if (!mongoose.Types.ObjectId.isValid(department)) {
      throw new CustomError(
        "Invalid department ID provided",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const parsedAssignedDate = new Date(assignedDate);
    const parsedDueDate = new Date(dueDate);

    let validatedLocation = null;
    if (location) {
      if (!mongoose.Types.ObjectId.isValid(location)) {
        throw new CustomError(
          "Invalid location ID provided",
          logPath,
          logAction,
          logSourceKey,
        );
      }

      validatedLocation = await Unit.findOne({
        _id: location,
        company,
        isActive: true,
      })
        .select("_id")
        .lean();

      if (!validatedLocation) {
        throw new CustomError(
          "Selected location does not exist",
          logPath,
          logAction,
          logSourceKey,
        );
      }
    }

    if (isNaN(parsedAssignedDate.getTime())) {
      throw new CustomError(
        "Invalid date format",
        logPath,
        logAction,
        logSourceKey,
      );
    }
    if (isNaN(parsedDueDate.getTime())) {
      throw new CustomError(
        "Invalid date format",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    if (parsedAssignedDate > parsedDueDate) {
      throw new CustomError(
        "Start date cannot be after end date",
        logPath,
        logAction,
        logSourceKey,
      );
    }
    // const timezone = getRequestTimezone(req);
    // const parsedAssignedDate = toUtcStartOfDay(assignedDate, timezone);

    // if (!parsedAssignedDate) {
    //   throw new CustomError(
    //     "Invalid assigned date",
    //     logPath,
    //     logAction,
    //     logSourceKey
    //   );
    // }
    // const parsedDueDate = toUtcStartOfDay(dueDate, timezone);

    // if (!parsedDueDate) {
    //   throw new CustomError(
    //     "Invalid due date",
    //     logPath,
    //     logAction,
    //     logSourceKey
    //   );
    // }

    if (
      typeof description !== "string" ||
      !description.length ||
      description.replace(/\s/g, "").length > 100
    ) {
      throw new CustomError(
        "Character limit exceeded",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    // Validate all assignees
    // let existingUsers = [];
    // if (Array.isArray(assignees)) {
    //   existingUsers = await validateUsers(assignees);
    //   if (existingUsers.length !== assignees.length) {
    //     throw new CustomError(
    //       "One or more assignees are invalid or do not exist",
    //       logPath,
    //       logAction,
    //       logSourceKey
    //     );
    //   }
    // }
    let existingUsers = [];
    if (assignTo) {
      existingUsers = await validateUsers([assignTo]);
      if (existingUsers.length !== 1) {
        throw new CustomError(
          "Assignee is invalid or does not exist",
          logPath,
          logAction,
          logSourceKey,
        );
      }
    }

    const newTask = new Task({
      taskName,
      taskType,
      department,
      description,
      // status,
      // priority: priority ? priority : "High",
      assignedTo: existingUsers,
      assignedBy: user,
      assignedDate: parsedAssignedDate,
      dueDate: parsedDueDate,
      dueTime: dueTime,
      company,
      location: validatedLocation?._id || null,
    });

    await newTask.save();

    // Emit the task notification
    const foundDepartment =
      await Department.findById(department).select("name");

    const userDetails = await UserData.findById({
      _id: user,
    });

    const deptEmployees = await UserData.find({
      departments: { $in: department },
    });

    // const deptEmployees = await UserData.find({
    //   departments: { $in: [department] },
    // });

    // const employeeIds = deptEmployees.map((emp) => emp._id);

    // * Emit notification event for task creation *
    emitter.emit("notification", {
      initiatorData: user, // user._id is expected if used downstream
      users: deptEmployees.map((emp) => ({
        userActions: {
          whichUser: emp._id, // send to department admin or fallback to self
          hasRead: false,
        },
      })),
      type: "add task",
      module: "Tasks",
      message: `A new task "${taskName}" was added by ${userDetails.firstName} ${userDetails.lastName} in ${foundDepartment.name} department.`,
    });

    // Log success with createLog
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Task added successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: newTask._id,
      changes: newTask,
    });

    return res.status(201).json({ message: "Task added successfully" });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500),
      );
    }
  }
};

const updateTaskStatus = async (req, res, next) => {
  const { user, ip, company } = req;
  const logPath = "tasks/TaskLog";
  const logAction = "Update Task Status";
  const logSourceKey = "task";

  try {
    const { id } = req.params;

    if (!id) {
      throw new CustomError(
        "Task ID must be provided",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError(
        "Invalid task ID provided",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const currDate = new Date();
    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, company, isDeleted: { $ne: true } },
      { status: "Completed", completedBy: user, completedDate: currDate },
      { new: true, runValidators: true },
    );

    if (!updatedTask) {
      throw new CustomError("Task not found", logPath, logAction, logSourceKey);
    }

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Task status updated successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: updatedTask._id,
      changes: {
        status: "Completed",
        prevStatus: "Pending",
        completedBy: user,
      },
    });

    return res.status(200).json({ message: "Task marked completed" });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500),
      );
    }
  }
};

const updateTask = async (req, res, next) => {
  const { user, ip, company } = req;
  const logPath = "tasks/TaskLog";
  const logAction = "Update Task";
  const logSourceKey = "task";

  try {
    const { id } = req.params;
    const {
      taskName,
      description,
      status,
      priority,
      assignees,
      startDate,
      endDate,
      dueTime,
      assignTo,
      location,
    } = req.body;

    if (!id) {
      throw new CustomError(
        "Task ID must be provided",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const updates = {};

    if (taskName !== undefined) updates.taskName = taskName;
    if (description !== undefined) updates.description = description;
    if (startDate !== undefined) {
      const parsedAssignedDate = new Date(startDate);
      if (isNaN(parsedAssignedDate.getTime())) {
        throw new CustomError(
          "Invalid start date",
          logPath,
          logAction,
          logSourceKey,
        );
      }
      updates.assignedDate = parsedAssignedDate;
    }
    if (endDate !== undefined) {
      const parsedDueDate = new Date(endDate);
      if (isNaN(parsedDueDate.getTime())) {
        throw new CustomError(
          "Invalid end date",
          logPath,
          logAction,
          logSourceKey,
        );
      }
      updates.dueDate = parsedDueDate;
    }
    if (dueTime !== undefined) updates.dueTime = dueTime;
    if (status !== undefined) {
      if (status !== "Completed") {
        throw new CustomError(
          "Invalid status value",
          logPath,
          logAction,
          logSourceKey,
        );
      }
      updates.status = status;
    }
    if (priority !== undefined) {
      const validPriorities = ["High", "Medium", "Low"];
      if (!validPriorities.includes(priority)) {
        throw new CustomError(
          "Invalid priority value",
          logPath,
          logAction,
          logSourceKey,
        );
      }
      updates.priority = priority;
    }
    if (assignees !== undefined) {
      if (!Array.isArray(assignees)) {
        throw new CustomError(
          "Assignees must be an array of user IDs",
          logPath,
          logAction,
          logSourceKey,
        );
      }
      updates.assignedTo = assignees;
    }
    if (assignTo !== undefined) {
      const existingUsers = await validateUsers([assignTo]);
      if (existingUsers.length !== 1) {
        throw new CustomError(
          "Assignee is invalid or does not exist",
          logPath,
          logAction,
          logSourceKey,
        );
      }
      updates.assignedTo = existingUsers;
    }
    if (location !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(location)) {
        throw new CustomError(
          "Invalid location ID provided",
          logPath,
          logAction,
          logSourceKey,
        );
      }

      const validatedLocation = await Unit.findOne({
        _id: location,
        company,
        isActive: true,
      })
        .select("_id")
        .lean();

      if (!validatedLocation) {
        throw new CustomError(
          "Selected location does not exist",
          logPath,
          logAction,
          logSourceKey,
        );
      }
      updates.location = validatedLocation._id;
    }

    if (Object.keys(updates).length === 0) {
      throw new CustomError(
        "No valid fields to update",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!updatedTask) {
      throw new CustomError("Task not found", logPath, logAction, logSourceKey);
    }

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Task updated successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: updatedTask._id,
      changes: updates,
    });

    return res
      .status(200)
      .json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500),
      );
    }
  }
};

const getAllTasks = async (req, res, next) => {
  try {
    const { company, departments, roles } = req;

    // let query = { company };
    let query = { company, isDeleted: { $ne: true } };

    if (!roles.includes("Master Admin") && !roles.includes("Super Admin")) {
      query.department = { $in: departments };
    }

    const tasks = await Task.find(query)
      .populate("assignedBy", "firstName lastName")
      .populate("assignedTo", "firstName lastName")
      .populate("completedBy", "firstName lastName")
      .populate("department", "name")
      .populate({
        path: "location",
        select: "unitNo unitName",
        populate: { path: "building", select: "buildingName" },
      })
      .select("-company")
      .lean();

    const transformedTasks = tasks.map((task) => {
      const completedBy = task.completedBy
        ? [
            task.completedBy.firstName,
            task.completedBy.middleName,
            task.completedBy.lastName,
          ]
            .filter(Boolean)
            .join(" ")
        : "";
      return {
        ...task,
        department: task.department.name,
        completedBy,
      };
    });

    return res.status(200).json(transformedTasks);
  } catch (error) {
    next(error);
  }
};

async function getTasks(req, res) {
  const payload = await fetchDeptTaskReportService({
    departmentId: req.body?.department,
    departments: req.body?.departments || req?.departments || [],
    roles: req?.roles || [],
    company: req?.company || null,
    user: req?.user || null,
    query: req?.query,
  });

  return res.status(200).json(payload);
}

const getMyTasks = async (req, res) => {
  const payload = await fetchMyTasksReportService({
    departmentId: req.body?.department,
    departments: req.body?.departments || req?.departments || [],
    roles: req?.roles || [],
    company: req?.company || null,
    user: req?.user || null,
    query: req?.query,
  });

  return res.status(200).json(payload);
};

const getMyAssignedTasks = async (req, res, next) => {
  try {
    const { user, departments, company } = req;

    const tasks = await Task.find({
      company,
      assignedBy: { $ne: user },
      department: { $in: departments },
      isDeleted: { $ne: true },
    })
      .populate("department", "name")
      .populate("assignedBy", "firstName lastName")
      .populate("completedBy", "firstName lastName")
      .populate({
        path: "location",
        select: "unitName unitNo",
        populate: { path: "building", select: "buildingName" },
      })
      .select("-company")
      .lean();

    const transformedTasks = tasks.map((task) => {
      const completedBy = task.completedBy
        ? [
            task.completedBy.firstName,
            task.completedBy.middleName,
            task.completedBy.lastName,
          ]
            .filter(Boolean)
            .join(" ")
        : "";

      return {
        ...task,
        dueDate: task.dueDate,
        dueTime: task.dueTime ? task.dueTime : "06:30 PM",
        assignedDate: task.assignedDate,
        completedBy,
      };
    });

    return res.status(200).json(transformedTasks);
  } catch (error) {
    next(error);
  }
};

const getCompletedTasks = async (req, res, next) => {
  try {
    const { company } = req;
    const { deptId } = req.params;

    const tasks = await Task.find({
      company,
      department: deptId,
      status: "Completed",
    })
      .populate("department", "name")
      .populate("assignedBy", "firstName lastName")
      .populate("assignedTo", "firstName middleName lastName")
      .populate("completedBy", "firstName lastName")
      .populate({
        path: "location",
        select: "unitName unitNo",
        populate: { path: "building", select: "buildingName" },
      })
      .select("-company")
      .lean();

    if (!tasks) {
      return res.status(400).json({ message: "No tasks found" });
    }

    const transformedTasks = tasks.map((task) => {
      const completedBy = task.completedBy
        ? [
            task.completedBy.firstName,
            task.completedBy.middleName,
            task.completedBy.lastName,
          ]
            .filter(Boolean)
            .join(" ")
        : "";
      return {
        ...task,
        unitNo: task.location?.unitNo || "N/A",
        dueDate: task.dueDate,
        dueTime: task.dueTime ? task.dueTime : "06:30 PM",
        assignedDate: task.assignedDate,
        completedBy,
      };
    });

    return res.status(200).json(transformedTasks);
  } catch (error) {
    next(error);
  }
};

const getMyCompletedTasks = async (req, res, next) => {
  try {
    const { user, company } = req;

    const tasks = await Task.find({
      company,
      completedBy: user,
      isDeleted: { $ne: true },
      // $or: [
      //   { $and: [{ taskType: "Self" }, { status: "Completed" }] },
      //   { $and: [{ completedBy: user }] },
      // ],
    })
      .populate("department", "name")
      .populate("assignedBy", "firstName lastName")
      .populate("completedBy", "firstName lastName")
      .populate({
        path: "location",
        select: "unitName unitNo",
        populate: { path: "building", select: "buildingName" },
      })
      .select("-company")
      .lean();

    if (!tasks) {
      return res.status(400).json({ message: "No tasks found" });
    }
    const transformedTasks = tasks.map((task) => {
      const completedBy = task.completedBy
        ? [
            task.completedBy.firstName,
            task.completedBy.middleName,
            task.completedBy.lastName,
          ]
            .filter(Boolean)
            .join(" ")
        : "";
      return {
        ...task,
        dueDate: task.dueDate,
        dueTime: task.dueTime ? task.dueTime : "06:30 PM",
        assignedDate: task.assignedDate,
        completedBy,
      };
    });
    return res.status(200).json(transformedTasks);
  } catch (error) {
    next(error);
  }
};

const getMyTodayTasks = async (req, res, next) => {
  try {
    const { user, company } = req;
    const timezone = getRequestTimezone(req);
    const { start, end } = getTodayUtcRange(timezone);

    const startOfDay = new Date();
    // startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    // endOfDay.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      company,
      isDeleted: { $ne: true },
      // assignedDate: { $gte: start, $lte: end },
      // assignedDate: { $gte: startOfDay, $lte: endOfDay },
      $or: [
        { assignedBy: { $in: [user] } },
        { assignedTo: { $in: [user] } },
        { completedBy: { $in: [user] } },
      ],
    })
      .populate("department", "name")
      .populate("assignedBy", "firstName lastName")
      .populate("assignedTo", "firstName lastName")
      .populate("completedBy", "firstName lastName")
      .populate({
        path: "location",
        select: "unitName unitNo",
        populate: { path: "building", select: "buildingName" },
      })
      .select("-company")
      .lean();

    if (!tasks) {
      return res.status(400).json({ message: "Failed to fetch the tasks" });
    }

    const transformedTasks = tasks.map((task) => {
      const completedBy = task.completedBy
        ? [
            task.completedBy.firstName,
            task.completedBy.middleName,
            task.completedBy.lastName,
          ]
            .filter(Boolean)
            .join(" ")
        : "";

      return {
        ...task,
        task: task.taskName,
        dueTime: task.dueTime,
        dueDate: task.dueDate,
        assignedDate: task.assignedDate,
        department: task.department.name,
        completedBy,
      };
    });

    return res.status(200).json(transformedTasks);
  } catch (error) {
    next(error);
  }
};

const getTodayDeptTasks = async (req, res, next) => {
  try {
    const { user, company } = req;
    const { dept } = req.query;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    if (dept && !mongoose.Types.ObjectId.isValid(dept)) {
      return res
        .status(400)
        .json({ message: "Invalid department ID provided" });
    }

    const tasks = await Task.find({
      company,
      isDeleted: { $ne: true },
      assignedDate: { $gte: startOfDay, $lte: endOfDay },
      department: dept,
    })
      .populate("department", "name")
      .populate("assignedBy", "firstName lastName")
      .populate("completedBy", "firstName lastName")
      .populate({
        path: "location",
        select: "unitName unitNo",
        populate: { path: "building", select: "buildingName" },
      })
      .select("-company")
      .lean();

    if (!tasks) {
      return res.status(400).json({ message: "Failed to fetch the tasks" });
    }

    const transformedTasks = tasks.map((task) => {
      const completedBy = task.completedBy
        ? [
            task.completedBy.firstName,
            task.completedBy.middleName,
            task.completedBy.lastName,
          ]
            .filter(Boolean)
            .join(" ")
        : "";

      return {
        ...task,
        task: task.taskName,
        dueTime: task.dueTime,
        dueDate: task.dueDate,
        assignedDate: task.assignedDate,
        department: task.department.name,
        completedBy,
      };
    });

    return res.status(200).json(transformedTasks);
  } catch (error) {
    next(error);
  }
};

const getTeamMembersTasks = async (req, res, next) => {
  try {
    const { company, departments } = req;
    const { month } = req.query;

    if (!company || !departments || departments.length === 0) {
      return res
        .status(400)
        .json({ message: "Company or departments info missing in request" });
    }

    const teamMembers = await User.find({
      departments: { $in: departments },
      isActive: true,
    })
      .populate([
        { path: "role", select: "roleTitle" },
        { path: "departments", select: "name" },
      ])
      .select("firstName middleName lastName email");

    // const tasks = await Task.find({
    //   company,
    //   department: { $in: departments },
    // })
    //   .populate([
    //     {
    //       path: "completedBy",
    //       select: "email firstName lastName isActive",
    //       populate: [
    //         { path: "role", select: "roleTitle" },
    //         { path: "departments", select: "name" },
    //       ],
    //     },
    //   ])
    //   .populate("assignedBy", "firstName lastName")
    //   .select("-company")
    //   .lean();

    const monthPattern = /^\d{4}-\d{2}$/;
    const monthToUse = monthPattern.test(month || "")
      ? month
      : new Date().toISOString().slice(0, 7);
    const [year, monthIndex] = monthToUse.split("-").map(Number);
    const startDate = new Date(year, monthIndex - 1, 1);
    const endDate = new Date(year, monthIndex, 1);

    const tasks = await Task.find({
      company,
      department: { $in: departments },
      status: "Completed",
      taskType: "Department",
      completedBy: { $ne: null },
      isDeleted: { $ne: true },
      completedDate: { $gte: startDate, $lt: endDate },
    })
      .select("completedBy")
      .lean();

    // const transformedTasks = teamMembers.map((member) => {
    //   const memberId = member._id.toString();

    //   const totalTasks = tasks.filter((emp) => {
    //     const completedById = emp?.completedBy?._id;
    //     return completedById && completedById.toString() === memberId;
    //   }).length;

    //   return {
    //     name: `${member.firstName} ${member.middleName || ""} ${
    //       member.lastName
    //     }`.trim(),
    //     email: member.email,
    //     department: member.departments.map((dept) => dept.name),
    //     role: member.role.map((r) => r.roleTitle),
    //     tasks: totalTasks,
    //   };
    // });

    const transformedTasks = teamMembers.map((member) => {
      const memberId = member._id.toString();

      const completedTaskCount = tasks.filter(
        (task) => task.completedBy?.toString() === memberId,
      ).length;

      return {
        name: `${member.firstName} ${member.middleName || ""} ${
          member.lastName
        }`.trim(),
        email: member.email,
        department: member.departments.map((dept) => dept.name),
        role: member.role.map((r) => r.roleTitle),
        tasks: completedTaskCount,
      };
    });

    return res.status(200).json(transformedTasks);
  } catch (error) {
    next(error);
  }
};

const getAllDeptTasks = async (req, res, next) => {
  try {
    const { roles, departments, company } = req;
    const { month } = req.query;
    let departmentMap = new Map();
    let query = { company, taskType: "Department", isDeleted: { $ne: true } };

    const monthPattern = /^\d{4}-\d{2}$/;
    const monthToUse = monthPattern.test(month || "")
      ? month
      : new Date().toISOString().slice(0, 7);
    const [year, monthIndex] = monthToUse.split("-").map(Number);
    const startDate = new Date(year, monthIndex - 1, 1);
    const endDate = new Date(year, monthIndex, 1);

    query.assignedDate = { $gte: startDate, $lt: endDate };

    const isSuperAdmin =
      roles.includes("Master Admin") || roles.includes("Super Admin");

    if (!isSuperAdmin) {
      query.department = { $in: departments };
    }

    // Step 1: Fetch only accessible departments
    const deptFilter = { isActive: true };
    if (!isSuperAdmin) {
      deptFilter._id = { $in: departments };
    }

    const fetchedDepartments = await Department.find(deptFilter).lean();

    // Step 2: Pre-fill the departmentMap with only allowed departments
    fetchedDepartments.forEach((dept) => {
      departmentMap.set(dept._id.toString(), {
        department: dept,
        totalTasks: 0,
        pendingTasks: 0,
        completedTasks: 0,
      });
    });

    // Step 3: Fetch tasks that match the user's access level
    const tasks = await Task.find(query)
      .populate([{ path: "department", select: "name" }])
      .select("-company")
      .lean();

    // Step 4: Count tasks into the pre-filled map
    tasks.forEach((task) => {
      const dept = task.department;
      const deptId = dept?._id?.toString();

      if (deptId && departmentMap.has(deptId)) {
        const entry = departmentMap.get(deptId);
        entry.totalTasks++;
        if (task.status === "Pending") entry.pendingTasks++;
        if (task.status === "Completed") entry.completedTasks++;
      }
    });

    // Step 5: Return departments user has access to, even if no tasks
    const result = Array.from(departmentMap.values());

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getAssignedTasks = async (req, res, next) => {
  try {
    const { user, company } = req;

    const tasks = await Task.find({
      company,
      assignedBy: user,
      isDeleted: { $ne: true },
    })
      .populate("assignedBy", "firstName lastName")
      .populate("completedBy", "firstName lastName")
      .populate({
        path: "location",
        select: "unitName unitNo",
        populate: { path: "building", select: "buildingName" },
      })
      .select("-company")
      .lean();

    const transformedTasks = tasks.map((task) => {
      const completedBy = task.completedBy
        ? [
            task.completedBy.firstName,
            task.completedBy.middleName,
            task.completedBy.lastName,
          ]
            .filter(Boolean)
            .join(" ")
        : "";

      return {
        ...task,
        dueDate: formatDate(task.dueDate),
        dueTime: task.dueTime ? formatTime(task.dueTime) : null,
        assignedDate: formatDate(task.assignedDate),
        completedBy,
      };
    });

    return res.status(200).json(transformedTasks);
  } catch (error) {
    next(error);
  }
};

//Update multiple tasks statuses together
const completeTasks = async (req, res, next) => {
  const { company, user, ip } = req;
  const logPath = "tasks/TaskLog";
  const logAction = "Mark Completed Tasks";
  const logSourceKey = "task";

  try {
    const { taskIds } = req.body;

    if (!taskIds || !taskIds.length) {
      throw new CustomError("Missing tasks", logPath, logAction, logSourceKey);
    }

    // Step 1: Fetch tasks before updating
    const existingTasks = await Task.find({
      _id: { $in: taskIds },
      company,
      isDeleted: { $ne: true },
    });

    if (!existingTasks.length) {
      throw new CustomError(
        "No tasks found for the given IDs",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    await Task.updateMany(
      { _id: { $in: taskIds }, company, isDeleted: { $ne: true } },
      { status: "Completed" },
    );

    // Step 3: Fetch updated tasks
    const updatedTasks = await Task.find({
      _id: { $in: taskIds },
      company,
      isDeleted: { $ne: true },
    });

    // Log the changes

    updatedTasks.map(
      async (task) =>
        await createLog({
          path: logPath,
          action: logAction,
          remarks: "Task status updated successfully",
          status: "Success",
          user: user,
          ip: ip,
          company: company,
          sourceKey: logSourceKey,
          sourceId: task._id,
          changes: {
            taskId: task._id,
            previousStatus: existingTasks.find((t) => t._id.equals(task._id))
              ?.status,
            newStatus: task.status,
          },
        }),
    );

    return res.status(200).json({
      message: "Tasks marked completed",
    });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500),
      );
    }
  }
};

const deleteTask = async (req, res, next) => {
  const { company, user, ip } = req;
  const logPath = "tasks/TaskLog";
  const logAction = "Delete Task";
  const logSourceKey = "task";

  try {
    const { id } = req.params;
    if (!id) {
      throw new CustomError(
        "Task ID must be provided",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError(
        "Invalid task ID provided",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const deletedTask = await Task.findOneAndUpdate(
      { _id: id, company, isDeleted: { $ne: true } },
      { isDeleted: true },
      { new: true, runValidators: true },
    );

    if (!deletedTask) {
      throw new CustomError(
        "Failed to delete the task",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    // Log the successful deletion
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Task deleted successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: deletedTask._id,
      changes: { isDeleted: true },
    });

    return res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500),
      );
    }
  }
};

const getTasksSummary = async (req, res, next) => {
  try {
    const { company, departments, roles } = req;

    const tasks = await Task.find({ company, isDeleted: { $ne: true } })
      .populate("assignedBy", "firstName lastName")
      .populate("completedBy", "firstName lastName")
      .populate("department", "name")
      .populate({ path: "location", select: "unitNo unitName" })
      .select("-company")
      .lean();

    const taskMap = new Map();

    tasks.forEach((task) => {
      const dept = task.department.name || "Unknown";

      if (!taskMap.has(dept)) {
        taskMap.set(dept, {
          department: dept,
          total: 0,
          achieved: 0,
          tasks: [],
        });
      }

      const mappedTask = taskMap.get(dept);

      mappedTask.total += 1;

      if (task.status === "Completed") {
        mappedTask.achieved += 1;
      }

      mappedTask.tasks.push(task);
    });

    const result = Array.from(taskMap.values());
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const bulkInsertTasks = async (req, res, next) => {
  try {
    const { company, user } = req;
    const file = req.file;

    if (!file || !isValidCsvUpload(file)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid CSV file",
      });
    }

    const csvData = file.buffer.toString("utf-8").trim();
    if (!csvData) {
      return res.status(400).json({
        success: false,
        message: "CSV file is empty",
      });
    }

    const rows = await parseCsvRows(csvData);
    const tasks = [];
    const invalidRows = [];

    for (const [index, row] of rows.entries()) {
      const rowNumber = index + 2;
      const reasons = [];
      const taskName = normalizeCsvValue(row.taskName);
      const taskType = normalizeCsvValue(row.taskType);
      const assignedBy = normalizeCsvValue(row.assignedBy);
      const assignedTo = normalizeCsvValue(row.assignedTo);
      const description = normalizeCsvValue(row.description);
      const assignedDate = normalizeCsvValue(row.assignedDate);
      const dueDate = normalizeCsvValue(row.dueDate);
      const dueTime = normalizeCsvValue(row.dueTime);
      const status = normalizeCsvValue(row.status) || "Pending";
      const location = normalizeCsvValue(row.location);
      const department = normalizeCsvValue(row.department);

      const missingFields = BULK_TASK_REQUIRED_FIELDS.filter(
        (field) => !normalizeCsvValue(row[field]),
      );
      if (missingFields.length > 0) {
        reasons.push(`Missing required fields: ${missingFields.join(", ")}`);
      }

      if (taskType && !["Self", "Department"].includes(taskType)) {
        reasons.push("Invalid taskType. Must be Self or Department");
      }

      if (!VALID_BULK_TASK_STATUSES.includes(status)) {
        reasons.push(
          "Invalid status. Must be Pending, InProgress, or Completed",
        );
      }

      if (
        description &&
        (typeof description !== "string" ||
          !description.length ||
          description.replace(/\s/g, "").length > 100)
      ) {
        reasons.push("Character limit exceeded");
      }

      const parsedAssignedDate = parseTaskDate(assignedDate);
      const parsedDueDate = parseTaskDate(dueDate);
      if (assignedDate && !parsedAssignedDate) {
        reasons.push("Invalid assignedDate format");
      }
      if (dueDate && !parsedDueDate) reasons.push("Invalid dueDate format");
      if (
        parsedAssignedDate &&
        parsedDueDate &&
        parsedAssignedDate > parsedDueDate
      ) {
        reasons.push("Start date cannot be after end date");
      }

      const parsedDueTime = parseTaskDueTime(dueTime, parsedDueDate);
      if (dueTime && parsedDueDate && !parsedDueTime) {
        reasons.push("Invalid dueTime format");
      }

      const resolvedDepartment = department
        ? await resolveBulkTaskDepartment(department)
        : null;
      if (department && !resolvedDepartment) {
        reasons.push(`Invalid department: ${department}`);
      }

      const resolvedLocation = location
        ? await resolveBulkTaskLocation(location, company)
        : null;
      if (location && !resolvedLocation) {
        reasons.push(`Invalid location: ${location}`);
      }

      const resolvedAssignedTo = assignedTo
        ? await resolveBulkTaskUser(assignedTo, company)
        : null;
      if (assignedTo && !resolvedAssignedTo) {
        reasons.push(`Invalid assignedTo user: ${assignedTo}`);
      }

      const resolvedAssignedBy = assignedBy
        ? await resolveBulkTaskUser(assignedBy, company)
        : null;
      if (assignedBy && !resolvedAssignedBy) {
        reasons.push(`Invalid assignedBy user: ${assignedBy}`);
      }

      if (reasons.length > 0) {
        invalidRows.push({ rowNumber, row, reasons });
        continue;
      }

      tasks.push({
        taskName,
        taskType,
        department: resolvedDepartment._id,
        description,
        assignedTo: resolvedAssignedTo ? [resolvedAssignedTo._id] : [],
        assignedBy: resolvedAssignedBy?._id || user,
        assignedDate: parsedAssignedDate,
        dueDate: parsedDueDate,
        dueTime: parsedDueTime,
        status,
        company,
        location: resolvedLocation?._id || null,
      });
    }

    let insertedTasks = [];
    if (tasks.length > 0) {
      insertedTasks = await Task.insertMany(tasks, { ordered: false });
    }

    return res.status(insertedTasks.length > 0 ? 201 : 400).json({
      success: insertedTasks.length > 0,
      message:
        insertedTasks.length > 0
          ? "Tasks uploaded successfully"
          : "No valid task rows found in the CSV",
      insertedCount: insertedTasks.length,
      skippedCount: invalidRows.length,
      invalidRows,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTasks,
  updateTask,
  updateTaskStatus,
  getMyTasks,
  getMyTodayTasks,
  getAllTasks,
  getTasks,
  getTeamMembersTasks,
  getAssignedTasks,
  getAllDeptTasks,
  completeTasks,
  deleteTask,
  getCompletedTasks,
  getMyCompletedTasks,
  getMyAssignedTasks,
  getTodayDeptTasks,
  getTasksSummary,
  bulkInsertTasks,
};
