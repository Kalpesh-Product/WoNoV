const Task = require("../../models/tasks/Task");

// const isDepartmentAdmin = (roles) =>
//   roles.some(
//     (role) =>
//       typeof role === "string" &&
//       role.endsWith(" Admin") &&
//       !["Master Admin", "Super Admin"].includes(role),
//)
const { hasDepartmentAdminAccess, hasGlobalReportAccess } = require("./access");

const fetchDeptTaskReportService = async ({
  dateFilter,
  departments = [],
  roles = [],
  company,
  user,
  query,
  isReport = false,
}) => {
  try {
    const hasGlobalAccess = hasGlobalReportAccess(roles);
    const hasDepartmentAccess = hasDepartmentAdminAccess(roles);

    let dept = query ? query.dept : departments;

    const queryObj = {
      company,
      isDeleted: { $ne: true },
      ...(!hasGlobalAccess &&
        !hasDepartmentAccess && { assignedTo: { $in: [user] } }),
      ...(!hasGlobalAccess &&
        dept && {
          department: { $in: departments },
        }),
      taskType: "Department",
      ...(!isReport && {
        status: "Pending",
      }),

      ...(dateFilter?.assignedDate && {
        assignedDate: dateFilter.assignedDate,
      }),
    };

    console.log("query obj", queryObj);
    console.log("hasGlobalAccess", hasGlobalAccess);
    console.log("hasDepartmentAccess", hasDepartmentAccess);

    const tasks = await Task.find(queryObj)
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
        dueDate: task.dueDate,
        dueTime: task.dueTime ? task.dueTime : null,
        assignedDate: task.assignedDate,
        completedBy,
      };
    });

    return transformedTasks;
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
}) => {
  try {
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

    const tasks = await Task.find(queryObj)
      .populate("department", "name")
      .populate("assignedBy", "firstName lastName")
      .populate("completedBy", "firstName lastName")
      .populate({ path: "location", select: "unitNo unitName" })
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
        dueTime: task.dueTime ? task.dueTime : null,
        assignedDate: task.assignedDate,
        completedBy,
      };
    });

    return transformedTasks;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  fetchDeptTaskReportService,
  fetchMyTasksReportService,
};
