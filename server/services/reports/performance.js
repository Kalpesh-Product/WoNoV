const kraKpaRole = require("../../models/performances/kraKpaRole");
const kraKpaTask = require("../../models/performances/kraKpaTask");
const { hasDepartmentAdminAccess, hasGlobalReportAccess } = require("./access");
const { getPagination } = require("../../utils/pagination");
const {
  buildSearchRegex,
  resolveReferenceIds,
} = require("../../utils/referenceSearch");
const UserData = require("../../models/hr/UserData");
const Department = require("../../models/Departments");

// const isDepartmentAdmin = (roles) =>
//   roles.some(
//     (role) =>
//       typeof role === "string" &&
//       role.endsWith(" Admin") &&
//       !["Master Admin", "Super Admin"].includes(role),
//   );

const stringifiedSearchCondition = (field, searchRegex) => ({
  $expr: {
    $regexMatch: {
      input: {
        $convert: {
          input: `$${field}`,
          to: "string",
          onError: "",
          onNull: "",
        },
      },
      regex: searchRegex.source,
      options: "i",
    },
  },
});

const resolvePerformanceSearchReferences = async ({ company, search }) => {
  const searchRegex = buildSearchRegex(search);

  if (!searchRegex) {
    return {
      searchRegex: null,
      users: [],
      departments: [],
    };
  }

  const { users = [], departments = [] } = await resolveReferenceIds(
    searchRegex,
    [
      {
        key: "users",
        model: UserData,
        fields: ["firstName", "middleName", "lastName", "email", "empId"],
        extraFilter: company ? { company } : {},
      },
      {
        key: "departments",
        model: Department,
        fields: ["name"],
      },
    ],
  );

  /*
   * resolveReferenceIds matches individual name fields.
   * This additionally supports "John Smith".
   */
  const fullNameUsers = await UserData.find({
    ...(company ? { company } : {}),
    $expr: {
      $regexMatch: {
        input: {
          $trim: {
            input: {
              $concat: [
                { $ifNull: ["$firstName", ""] },
                " ",
                { $ifNull: ["$middleName", ""] },
                " ",
                { $ifNull: ["$lastName", ""] },
              ],
            },
          },
        },
        regex: searchRegex.source,
        options: "i",
      },
    },
  })
    .select("_id")
    .lean();

  return {
    searchRegex,
    users: uniqueIds([...users, ...fullNameUsers.map(({ _id }) => _id)]),
    departments,
  };
};

const buildPerformanceRoleSearchConditions = async ({ company, search }) => {
  const { searchRegex, users, departments } =
    await resolvePerformanceSearchReferences({
      company,
      search,
    });

  if (!searchRegex) return [];

  return [
    // Task/model fields
    { task: searchRegex },
    { taskType: searchRegex },
    { status: searchRegex },

    stringifiedSearchCondition("_id", searchRegex),
    stringifiedSearchCondition("kpaDuration", searchRegex),
    stringifiedSearchCondition("assignedDate", searchRegex),
    stringifiedSearchCondition("dueDate", searchRegex),

    // Reference fields
    ...(departments.length
      ? [
          {
            department: {
              $in: departments,
            },
          },
        ]
      : []),

    ...(users.length
      ? [
          {
            assignTo: {
              $in: users,
            },
          },
        ]
      : []),
  ];
};

const buildCompletedPerformanceSearchConditions = async ({
  company,
  search,
}) => {
  const { searchRegex, users } = await resolvePerformanceSearchReferences({
    company,
    search,
  });

  if (!searchRegex) return [];

  /*
   * Find KRA/KPA role tasks matching task name,
   * department, assigned user, dates, etc.
   */
  const roleSearchConditions = await buildPerformanceRoleSearchConditions({
    company,
    search,
  });

  const matchingRoleTasks = roleSearchConditions.length
    ? await kraKpaRole
        .find({
          company,
          isDeleted: { $ne: true },
          $or: roleSearchConditions,
        })
        .select("_id")
        .lean()
    : [];

  const matchingRoleTaskIds = matchingRoleTasks.map(({ _id }) => _id);

  return [
    // Fields stored directly in kraKpaTask
    { status: searchRegex },
    { comment: searchRegex },

    stringifiedSearchCondition("_id", searchRegex),
    stringifiedSearchCondition("completionDate", searchRegex),

    // Completed By
    ...(users.length
      ? [
          {
            completedBy: {
              $in: users,
            },
          },
        ]
      : []),

    // Task name / department / Assigned To / dates
    ...(matchingRoleTaskIds.length
      ? [
          {
            task: {
              $in: matchingRoleTaskIds,
            },
          },
        ]
      : []),
  ];
};

const uniqueIds = (ids = []) =>
  Array.from(
    new Map(ids.filter(Boolean).map((id) => [id.toString(), id])).values(),
  );

const REPORT_TYPE_CONFIG = {
  KPA: ["KPA"],
  KRA: ["KRA"],
  INDIVIDUALKPA: ["INDIVIDUALKPA", "TEAMKPA"],
  INDIVIDUALKRA: ["INDIVIDUALKRA", "TEAMKRA"],
};

const formatName = (user = {}) =>
  [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ");

const normalizeTask = ({
  roleTask,
  completion = null,
  status = "Pending",
}) => ({
  id: completion?._id || roleTask._id,
  roleTaskId: roleTask._id,
  taskName: roleTask.task,
  taskType: roleTask.taskType,
  kpaDuration: roleTask.kpaDuration || null,
  department: roleTask.department?.name || null,
  assignedTo: formatName(roleTask.assignTo || {}),
  assignedDate: roleTask.assignedDate,
  dueDate: roleTask.dueDate,
  status,
  completionDate: completion?.completionDate || null,
  completedBy: completion?.completedBy
    ? formatName(completion.completedBy)
    : "",
});

const fetchPerformanceTasksService = async ({
  company,
  type,
  dept,
  duration,
  date,
  status,
  roles = [],
  userDepts = [],
  user,
  dateFilter,
  page,
  limit,
  search,
}) => {
  const {
    shouldPaginate,
    page: parsedPage,
    limit: parsedLimit,
    skip,
  } = getPagination({ page, limit });
  const targetDay = date ? new Date(date) : new Date();
  const startOfDay = new Date(targetDay);
  const endOfDay = new Date(targetDay);

  startOfDay.setUTCHours(0, 0, 0, 0);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const taskTypes =
    type === "INDIVIDUALKRA"
      ? ["INDIVIDUALKRA", "TEAMKRA"]
      : type === "INDIVIDUALKPA"
        ? ["INDIVIDUALKPA", "TEAMKPA"]
        : [type];
  const taskQuery = {
    company,
    department: dept,
    isDeleted: { $ne: true },
    taskType: taskTypes.length === 1 ? taskTypes[0] : { $in: taskTypes },
    ...(duration && { kpaDuration: duration }),
    ...(status && { status }),
    ...(dateFilter?.assignedDate && {
      assignedDate: dateFilter.assignedDate,
    }),
    completedDate: {
      $not: {
        $elemMatch: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      },
    },
  };

  const searchConditions = await buildPerformanceRoleSearchConditions({
    company,
    search,
  });

  if (searchConditions.length) {
    taskQuery.$or = searchConditions;
  }

  const tasks = await kraKpaRole
    .find(taskQuery)
    .populate([
      { path: "department", select: "name" },
      { path: "assignTo", select: "firstName lastName" },
    ])
    .select("-company")
    .lean()
    .exec();
  const isHrOrSuperAdmin =
    roles.includes("Master Admin") ||
    roles.includes("Super Admin") ||
    roles.includes("HR Admin") ||
    roles.includes("HR Employee");
  const isManager = isHrOrSuperAdmin || userDepts.includes(dept);
  const uniqueTasks = Array.from(
    new Map(tasks.map((task) => [task._id.toString(), task])).values(),
  );
  const dedupedByTaskName =
    type === "KRA"
      ? Array.from(
          uniqueTasks
            .reduce((map, task) => {
              const key = (task.task || "").toString().trim().toLowerCase();
              const previous = map.get(key);

              if (!previous) {
                map.set(key, task);
                return map;
              }

              const previousDate = new Date(
                previous.assignedDate || previous.createdAt || 0,
              );
              const currentDate = new Date(
                task.assignedDate || task.createdAt || 0,
              );

              if (currentDate > previousDate) {
                map.set(key, task);
              }

              return map;
            }, new Map())
            .values(),
        )
      : uniqueTasks;
  const visibleTasks = dedupedByTaskName.filter((task) => {
    if (["KRA", "KPA", "TEAMKRA", "TEAMKPA"].includes(type)) {
      return task.taskType === type;
    }

    if (["INDIVIDUALKRA", "INDIVIDUALKPA"].includes(type)) {
      const isOwnTask = task.assignTo?._id?.toString() === user.toString();

      if (task.taskType === type) {
        return isManager || isOwnTask;
      }

      const mappedType = type === "INDIVIDUALKRA" ? "TEAMKRA" : "TEAMKPA";

      return task.taskType === mappedType && isOwnTask;
    }

    return false;
  });

  if (shouldPaginate) {
    visibleTasks.sort((firstTask, secondTask) => {
      const dateDifference =
        new Date(secondTask.assignedDate) - new Date(firstTask.assignedDate);

      return (
        dateDifference ||
        secondTask._id.toString().localeCompare(firstTask._id.toString())
      );
    });
  }

  const total = visibleTasks.length;
  const selectedTasks = shouldPaginate
    ? visibleTasks.slice(skip, skip + parsedLimit)
    : visibleTasks;
  const transformedTasks = selectedTasks.map((task) => ({
    id: task._id,
    taskName: task.task,
    dueDate: task.dueDate,
    assignedDate: task.assignedDate,
    dueTime: "6:30 PM",
    status: task.status || "Pending",
    assignedTo: task.assignTo
      ? `${task.assignTo.firstName} ${task.assignTo.lastName}`
      : "N/A",
    assignToId: task.assignTo?._id,
  }));

  return shouldPaginate
    ? {
        data: transformedTasks,
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          total,
          totalPages: Math.ceil(total / parsedLimit),
        },
      }
    : transformedTasks;
};

const fetchCompletedPerformanceTasksService = async ({
  company,
  type,
  dept,
  duration,
  empId,
  month,
  year,
  roles = [],
  userDepts = [],
  user,
  dateFilter,
  page,
  limit,
  search,
}) => {
  const {
    shouldPaginate,
    page: parsedPage,
    limit: parsedLimit,
    skip,
  } = getPagination({ page, limit });
  const completedTaskQuery = {
    company,
    status: "Completed",
    ...(dateFilter?.completionDate && {
      completionDate: dateFilter.completionDate,
    }),
  };

  const completedSearchConditions =
    await buildCompletedPerformanceSearchConditions({
      company,
      search,
    });

  if (completedSearchConditions.length) {
    completedTaskQuery.$or = completedSearchConditions;
  }

  const completedTasks = await kraKpaTask
    .find(completedTaskQuery)
    .populate([
      {
        path: "task",
        populate: [
          { path: "department", select: "name" },
          { path: "assignTo", select: "firstName lastName" },
        ],
      },
      {
        path: "completedBy",
        select: "firstName middleName lastName empId",
      },
    ])
    .select("-company")
    .lean()
    .exec();

  if (shouldPaginate) {
    completedTasks.sort((firstTask, secondTask) => {
      const dateDifference =
        new Date(secondTask.completionDate) -
        new Date(firstTask.completionDate);

      return (
        dateDifference ||
        secondTask._id.toString().localeCompare(firstTask._id.toString())
      );
    });
  }

  const isHrOrSuperAdmin =
    roles.includes("Master Admin") ||
    roles.includes("Super Admin") ||
    roles.includes("HR Admin") ||
    roles.includes("HR Employee");
  const isManager = isHrOrSuperAdmin || userDepts.includes(dept);

  const uniqueCompletedTasks = Array.from(
    new Map(
      completedTasks.map((task) => {
        const taskId = task?.task?._id?.toString?.() || task?._id?.toString?.();
        const completionKey = `${taskId || "unknown"}-${new Date(
          task.completionDate,
        )
          .toISOString()
          .slice(0, 10)}`;

        return [completionKey, task];
      }),
    ).values(),
  );

  const filteredTasks = uniqueCompletedTasks.filter((task) => {
    if (!task.task || task.task.isDeleted) return false;
    if (duration && duration !== task.task.kpaDuration) return false;
    if (empId && task.completedBy?.empId !== empId) return false;
    if (task.task.department?._id?.toString() !== dept) return false;

    const completionDate = new Date(task.completionDate);

    if (month) {
      const monthIndex = [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
      ].indexOf(String(month).trim().toLowerCase());

      if (monthIndex === -1 || Number.isNaN(completionDate.getTime())) {
        return false;
      }
      if (completionDate.getMonth() !== monthIndex) return false;
    }

    if (year) {
      if (Number.isNaN(completionDate.getTime())) return false;
      if (completionDate.getFullYear() !== Number(year)) return false;
    }

    if (["KRA", "KPA", "TEAMKRA", "TEAMKPA"].includes(type)) {
      return task.task.taskType === type;
    }

    if (["INDIVIDUALKRA", "INDIVIDUALKPA"].includes(type)) {
      const isOwnTask = task.task.assignTo?._id?.toString() === user.toString();

      if (task.task.taskType === type) {
        return isManager || isOwnTask;
      }

      const mappedType = type === "INDIVIDUALKRA" ? "TEAMKRA" : "TEAMKPA";

      return task.task.taskType === mappedType && isOwnTask;
    }

    return false;
  });

  const total = filteredTasks.length;
  const selectedTasks = shouldPaginate
    ? filteredTasks.slice(skip, skip + parsedLimit)
    : filteredTasks;
  const transformedTasks = selectedTasks.map((task) => {
    const completedBy = `${task.completedBy.firstName} ${
      task.completedBy.middleName || ""
    } ${task.completedBy.lastName}`;

    return {
      id: task._id,
      taskId: task.task?._id?.toString?.() || "",
      taskName: task.task.task,
      department: task.task.department.name,
      completedBy,
      completedById: task.completedBy?._id?.toString?.() || "",
      completedByName: completedBy,
      assignedDate: task.task.assignedDate,
      dueDate: task.task.dueDate,
      dueTime: "6:30 PM",
      completionDate: task.completionDate || "N/A",
      status: task.status,
      comment: task.comment || "",
    };
  });

  return shouldPaginate
    ? {
        data: transformedTasks,
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          total,
          totalPages: Math.ceil(total / parsedLimit),
        },
      }
    : transformedTasks;
};

const fetchPerformanceReportService = async ({
  dateFilter,
  departmentId,
  departments = [],
  company,
  type,
  user,
  roles,
}) => {
  try {
    const hasGlobalAccess = hasGlobalReportAccess(roles);
    const hasDepartmentAccess = hasDepartmentAdminAccess(roles);

    const dept = departmentId || departments?.[0];

    if (!dept && !hasGlobalAccess) {
      throw new Error("Missing department ID");
    }

    const reportTaskTypes = REPORT_TYPE_CONFIG[type];

    if (!reportTaskTypes) {
      throw new Error("Missing or invalid report type");
    }

    const isIndividualReport = [
      "INDIVIDUALKPA",
      "INDIVIDUALKRA",
      "TEAMKRA",
      "TEAMKPA",
    ].includes(type);

    const baseRoleQuery = {
      company,
      ...(dateFilter.assignedDate && { assignedDate: dateFilter.assignedDate }),
      ...(dept && !hasGlobalAccess ? { department: dept } : {}),
      taskType: { $in: reportTaskTypes },
      isDeleted: { $ne: true },
      ...(isIndividualReport && dateFilter ? { ...dateFilter } : {}), //Add date filter only for individual reports as dept reports are recurring
      ...(!hasGlobalAccess && !hasDepartmentAccess
        ? { ...(isIndividualReport && user ? { assignTo: user } : {}) }
        : {}), // If not department admin, then filter by assignedTo for individual reports
    };

    const roleTasks = await kraKpaRole
      .find(baseRoleQuery)
      .populate([
        { path: "department", select: "name" },
        { path: "assignTo", select: "firstName middleName lastName" },
      ])
      .select("-company")
      .lean();

    const roleTaskIds = roleTasks.map((roleTask) => roleTask._id);

    const completedTasksRaw = roleTaskIds.length
      ? await kraKpaTask
          .find({
            company,
            status: "Completed",
            task: { $in: roleTaskIds },
          })
          .populate([
            {
              path: "task",
              populate: [
                { path: "department", select: "name" },
                { path: "assignTo", select: "firstName middleName lastName" },
              ],
            },
            {
              path: "completedBy",
              select: "firstName middleName lastName empId",
            },
          ])
          .select("-company")
          .lean()
      : [];

    const completedByRoleTaskId = new Map();

    completedTasksRaw.forEach((completion) => {
      const roleTaskId = completion?.task?._id?.toString();
      if (!roleTaskId) return;
      if (
        dept &&
        !hasGlobalAccess &&
        completion?.task?.department?._id?.toString() !== dept.toString()
      )
        return;

      completedByRoleTaskId.set(roleTaskId, completion);
    });

    const response = {
      pending: [],
      completed: [],
    };

    roleTasks.forEach((roleTask) => {
      const completion = completedByRoleTaskId.get(roleTask._id.toString());

      if (completion) {
        response.completed.push(
          normalizeTask({ roleTask, completion, status: "Completed" }),
        );
      } else {
        response.pending.push(normalizeTask({ roleTask, status: "Pending" }));
      }
    });

    return response;
  } catch (error) {
    throw error;
  }
};

const ALL_DEPARTMENT_KPA_ROLES = new Set([
  "HR Admin",
  "HR Employee",
  "Master Admin",
  "Super Admin",
]);

const fetchDepartmentKpaDataService = async ({
  company,
  dateFilter = {},
  departmentIds,
  departments = [],
  roles = [],
}) => {
  const hasAllDepartmentAccess = roles.some((role) =>
    ALL_DEPARTMENT_KPA_ROLES.has(role),
  );
  const scopedDepartmentIds = departmentIds?.length
    ? departmentIds
    : departments;

  const roleQuery = {
    company,
    taskType: "KPA",
    isDeleted: false,
    // ...(!hasAllDepartmentAccess && {
    //   department: { $in: scopedDepartmentIds || [] },
    // }),
  };

  const allRoleTasks = await kraKpaRole
    .find(roleQuery)
    .populate({ path: "department", select: "name" })
    .lean();

  const assignedDateFilter = dateFilter.assignedDate;
  const roleTasks = assignedDateFilter
    ? allRoleTasks.filter((task) => {
        const assignedDate = new Date(task.assignedDate);
        return (
          (!assignedDateFilter.$gte ||
            assignedDate >= assignedDateFilter.$gte) &&
          (!assignedDateFilter.$lte || assignedDate <= assignedDateFilter.$lte)
        );
      })
    : allRoleTasks;

  const roleTaskIds = roleTasks.map((task) => task._id);
  const completedTasks = roleTaskIds.length
    ? await kraKpaTask
        .find({ company, task: { $in: roleTaskIds } })
        .populate({
          path: "task",
          populate: { path: "department", select: "name" },
        })
        .populate({
          path: "completedBy",
          select: "firstName middleName lastName",
        })
        .select("-company")
        .lean()
    : [];

  const groupedTasks = new Map();
  const completedTaskIds = new Set();

  allRoleTasks.forEach((roleTask) => {
    const department = roleTask.department?.name;
    if (department && !groupedTasks.has(department)) {
      groupedTasks.set(department, { department, tasks: [] });
    }
  });

  const addTask = (department, task) => {
    if (!groupedTasks.has(department)) {
      groupedTasks.set(department, { department, tasks: [] });
    }
    groupedTasks.get(department).tasks.push(task);
  };

  completedTasks.forEach((completion) => {
    const roleTask = completion.task;
    const department = roleTask?.department?.name;
    if (!roleTask?._id || !department) return;

    completedTaskIds.add(roleTask._id.toString());
    addTask(department, {
      taskName: roleTask.task,
      assignedTo: formatName(completion.completedBy),
      assignedDate: roleTask.assignedDate,
      dueDate: roleTask.dueDate,
      status: completion.status,
      comment: completion.comment || "",
    });
  });

  roleTasks.forEach((roleTask) => {
    const department = roleTask.department?.name;
    if (!department || completedTaskIds.has(roleTask._id.toString())) return;

    addTask(department, {
      taskName: roleTask.task,
      assignedTo: null,
      assignedDate: roleTask.assignedDate,
      dueDate: roleTask.dueDate,
      status: "Pending",
    });
  });

  return Array.from(groupedTasks.values()).map((group) => ({
    ...group,
    total: group.tasks.length,
    achieved: group.tasks.filter((task) => task.status === "Completed").length,
  }));
};

const fetchDepartmentWiseKpaOverviewReportService = async ({
  company,
  dateFilter,
  departmentId,
  departments = [],
  roles = [],
}) => {
  const departmentData = await fetchDepartmentKpaDataService({
    company,
    dateFilter,
    departmentIds: departmentId ? [departmentId] : undefined,
    departments,
    roles,
  });

  return departmentData.map(({ department, total, achieved }) => ({
    department,
    totalTasks: total,
    achievedTasks: achieved,
    achievedPercent: `${total ? ((achieved / total) * 100).toFixed(0) : "0"}%`,
    shortFall: `${total ? (((total - achieved) / total) * 100).toFixed(0) : "0"}%`,
  }));
};

const fetchDepartmentKraDataService = async ({
  company,
  dateFilter = {},
  departmentIds,
  departments = [],
  roles = [],
}) => {
  const hasAllDepartmentAccess = roles.some((role) =>
    ALL_DEPARTMENT_KPA_ROLES.has(role),
  );
  const scopedDepartmentIds = departmentIds?.length
    ? departmentIds
    : departments;

  const roleQuery = {
    company,
    taskType: "KRA",
    isDeleted: false,
    // ...(!hasAllDepartmentAccess && {
    //   department: { $in: scopedDepartmentIds || [] },
    // }),
  };

  const allRoleTasks = await kraKpaRole
    .find(roleQuery)
    .populate({ path: "department", select: "name" })
    .lean();

  const assignedDateFilter = dateFilter.assignedDate;
  const roleTasks = assignedDateFilter
    ? allRoleTasks.filter((task) => {
        const assignedDate = new Date(task.assignedDate);
        return (
          (!assignedDateFilter.$gte ||
            assignedDate >= assignedDateFilter.$gte) &&
          (!assignedDateFilter.$lte || assignedDate <= assignedDateFilter.$lte)
        );
      })
    : allRoleTasks;

  const roleTaskIds = roleTasks.map((task) => task._id);
  const completedTasks = roleTaskIds.length
    ? await kraKpaTask
        .find({ company, task: { $in: roleTaskIds } })
        .populate({
          path: "task",
          populate: { path: "department", select: "name" },
        })
        .populate({
          path: "completedBy",
          select: "firstName middleName lastName",
        })
        .select("-company")
        .lean()
    : [];

  const groupedTasks = new Map();
  const completedTaskIds = new Set();

  allRoleTasks.forEach((roleTask) => {
    const department = roleTask.department?.name;
    if (department && !groupedTasks.has(department)) {
      groupedTasks.set(department, { department, tasks: [] });
    }
  });

  const addTask = (department, task) => {
    if (!groupedTasks.has(department)) {
      groupedTasks.set(department, { department, tasks: [] });
    }
    groupedTasks.get(department).tasks.push(task);
  };

  completedTasks.forEach((completion) => {
    const roleTask = completion.task;
    const department = roleTask?.department?.name;
    if (!roleTask?._id || !department) return;

    completedTaskIds.add(roleTask._id.toString());
    addTask(department, {
      taskName: roleTask.task,
      assignedTo: formatName(completion.completedBy),
      assignedDate: roleTask.assignedDate,
      dueDate: roleTask.dueDate,
      status: completion.status,
      comment: completion.comment || "",
    });
  });

  roleTasks.forEach((roleTask) => {
    const department = roleTask.department?.name;
    if (!department || completedTaskIds.has(roleTask._id.toString())) return;

    addTask(department, {
      taskName: roleTask.task,
      assignedTo: null,
      assignedDate: roleTask.assignedDate,
      dueDate: roleTask.dueDate,
      status: "Pending",
    });
  });

  return Array.from(groupedTasks.values()).map((group) => ({
    ...group,
    total: group.tasks.length,
    achieved: group.tasks.filter((task) => task.status === "Completed").length,
  }));
};

const fetchDepartmentWiseKraOverviewReportService = async ({
  company,
  dateFilter,
  departmentId,
  departments = [],
  roles = [],
}) => {
  const departmentData = await fetchDepartmentKraDataService({
    company,
    dateFilter,
    departmentIds: departmentId ? [departmentId] : undefined,
    departments,
    roles,
  });

  return departmentData.map(({ department, total, achieved }) => ({
    department,
    totalTasks: total,
    achievedTasks: achieved,
    achievedPercent: `${total ? ((achieved / total) * 100).toFixed(0) : "0"}%`,
    shortFall: `${total ? (((total - achieved) / total) * 100).toFixed(0) : "0"}%`,
  }));
};

module.exports = {
  fetchCompletedPerformanceTasksService,
  fetchPerformanceTasksService,
  fetchPerformanceReportService,
  fetchDepartmentKpaDataService,
  fetchDepartmentWiseKpaOverviewReportService,
  fetchDepartmentKraDataService,
  fetchDepartmentWiseKraOverviewReportService,
};
