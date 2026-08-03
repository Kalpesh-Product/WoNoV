const Task = require("../../models/tasks/Task");

// const isDepartmentAdmin = (roles) =>
//   roles.some(
//     (role) =>
//       typeof role === "string" &&
//       role.endsWith(" Admin") &&
//       !["Master Admin", "Super Admin"].includes(role),
//)
const { hasDepartmentAdminAccess, hasGlobalReportAccess } = require("./access");
const { getPagination } = require("../../utils/pagination");

const fetchAllTasksService = async ({
  dateFilter,
  departments = [],
  roles = [],
  company,
  page,
  limit,
}) => {
  const {
    shouldPaginate,
    page: parsedPage,
    limit: parsedLimit,
    skip,
  } = getPagination({ page, limit });
  const hasGlobalAccess =
    roles.includes("Master Admin") || roles.includes("Super Admin");
  const queryObj = {
    company,
    isDeleted: { $ne: true },
    ...(!hasGlobalAccess && { department: { $in: departments } }),
    ...(dateFilter?.assignedDate && {
      assignedDate: dateFilter.assignedDate,
    }),
  };

  let tasksQuery = Task.find(queryObj)
    .populate("assignedBy", "firstName lastName")
    .populate("assignedTo", "firstName lastName")
    .populate("completedBy", "firstName lastName")
    .populate("department", "name")
    .populate({
      path: "location",
      select: "unitNo unitName",
      populate: { path: "building", select: "buildingName" },
    })
    .select("-company");

  if (shouldPaginate) {
    tasksQuery = tasksQuery.sort({ _id: 1 }).skip(skip).limit(parsedLimit);
  }

  const [tasks, total] = await Promise.all([
    tasksQuery.lean().exec(),
    shouldPaginate
      ? Task.countDocuments(queryObj).exec()
      : Promise.resolve(null),
  ]);

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

const fetchDeptTaskReportService = async ({
  dateFilter,
  departments = [],
  roles = [],
  company,
  user,
  query,
  isReport = false,
  page,
  limit,
}) => {
  try {
    const {
      shouldPaginate,
      page: parsedPage,
      limit: parsedLimit,
      skip,
    } = getPagination({ page, limit });
    const hasGlobalAccess = hasGlobalReportAccess(roles);
    const hasDepartmentAccess = hasDepartmentAdminAccess(roles);

    const requestedDepartments = query?.dept
      ? Array.isArray(query.dept)
        ? query.dept
        : [query.dept]
      : departments;

    const queryObj = {
      company,
      isDeleted: { $ne: true },
      ...(!hasGlobalAccess &&
        !hasDepartmentAccess && { assignedTo: { $in: [user] } }),
      ...(requestedDepartments?.length && {
        department: { $in: requestedDepartments },
      }),
      taskType: "Department",
      ...(!isReport && {
        status: "Pending",
      }),

      ...(dateFilter?.assignedDate && {
        assignedDate: dateFilter.assignedDate,
      }),
    };

    let tasksQuery = Task.find(queryObj)
      .populate("department", "name")
      .populate("assignedBy", "firstName lastName")
      .populate("assignedTo", "firstName lastName")
      .populate("completedBy", "firstName lastName")
      .populate({ path: "location", select: "unitNo unitName" })
      .populate({
        path: "location",
        select: "unitName unitNo",
        populate: { path: "building", select: "buildingName" },
      })
      .select("-company");

    if (shouldPaginate) {
      tasksQuery = tasksQuery.sort({ _id: 1 }).skip(skip).limit(parsedLimit);
    }

    const [tasks, total] = await Promise.all([
      tasksQuery.lean().exec(),
      shouldPaginate
        ? Task.countDocuments(queryObj).exec()
        : Promise.resolve(null),
    ]);

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
        dueDate: task.dueDate,
        dueTime: task.dueTime ? task.dueTime : null,
        assignedDate: task.assignedDate,
        completedBy,
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
  } catch (error) {
    throw error;
  }
};

const fetchMyTasksReportService = async ({
  dateFilter,
  departments = [],
  roles = [],
  company,
  user,
  query = {},
  isReport = false,
  page,
  limit,
}) => {
  try {
    const {
      shouldPaginate,
      page: parsedPage,
      limit: parsedLimit,
      skip,
    } = getPagination({ page, limit });
    const hasGlobalAccess = hasGlobalReportAccess(roles);
    const hasDepartmentAccess = hasDepartmentAdminAccess(roles);

    let { flag } = query;

    const queryObj = {
      company,
      isDeleted: { $ne: true },
      // ...(!isDepartmentAdmin(roles) && { assignedBy: user }),
      // department: { $in: departments },
      ...(!hasGlobalAccess && !hasDepartmentAccess && { assignedBy: user }),
      ...(!hasGlobalAccess && { department: { $in: departments } }),
      taskType: "Self",
      ...(flag === "Pending" &&
        !isReport && {
          status: "Pending",
        }),
      ...(dateFilter?.assignedDate && {
        assignedDate: dateFilter.assignedDate,
      }),
    };

    let tasksQuery = Task.find(queryObj)
      .populate("department", "name")
      .populate("assignedBy", "firstName lastName")
      .populate("completedBy", "firstName lastName")
      .populate({ path: "location", select: "unitNo unitName" })
      .populate({
        path: "location",
        select: "unitName unitNo",
        populate: { path: "building", select: "buildingName" },
      })
      .select("-company");

    if (shouldPaginate) {
      tasksQuery = tasksQuery.sort({ _id: 1 }).skip(skip).limit(parsedLimit);
    }

    const [tasks, total] = await Promise.all([
      tasksQuery.lean().exec(),
      shouldPaginate
        ? Task.countDocuments(queryObj).exec()
        : Promise.resolve(null),
    ]);

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
        dueTime: task.dueTime ? task.dueTime : null,
        assignedDate: task.assignedDate,
        completedBy,
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
  } catch (error) {
    throw error;
  }
};

const fetchDepartmentTaskDataService = async ({
  company,
  dateFilter = {},
}) => {
  const allTasks = await Task.find({
    company,
    isDeleted: { $ne: true },
  })
    .populate("department", "name")
    .populate("assignedBy", "firstName middleName lastName")
    .populate("assignedTo", "firstName middleName lastName")
    .populate("completedBy", "firstName middleName lastName")
    .select("-company")
    .lean();

  const assignedDateFilter = dateFilter.assignedDate;
  const departmentTasks = allTasks.filter((task) => {
    if (task.taskType !== "Department") return false;
    if (!assignedDateFilter) return true;

    const assignedDate = new Date(task.assignedDate);
    return (
      (!assignedDateFilter.$gte || assignedDate >= assignedDateFilter.$gte) &&
      (!assignedDateFilter.$lte || assignedDate <= assignedDateFilter.$lte)
    );
  });

  const groupedTasks = new Map();

  allTasks.forEach((task) => {
    const department = task.department?.name;
    if (department && !groupedTasks.has(department)) {
      groupedTasks.set(department, { department, tasks: [] });
    }
  });

  departmentTasks.forEach((task) => {
    const department = task.department?.name;
    if (!department) return;

    if (!groupedTasks.has(department)) {
      groupedTasks.set(department, { department, tasks: [] });
    }

    groupedTasks.get(department).tasks.push(task);
  });

  return Array.from(groupedTasks.values()).map((group) => ({
    ...group,
    total: group.tasks.length,
    achieved: group.tasks.filter((task) => task.status === "Completed").length,
  }));
};

const fetchDepartmentWiseTasksOverviewReportService = async ({
  company,
  dateFilter,
}) => {
  const departmentData = await fetchDepartmentTaskDataService({
    company,
    dateFilter,
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
  fetchAllTasksService,
  fetchDeptTaskReportService,
  fetchMyTasksReportService,
  fetchDepartmentTaskDataService,
  fetchDepartmentWiseTasksOverviewReportService,
};
