const Task = require("../../models/tasks/Task");

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
    let dept = query ? query.dept : departments[0];

    query = { company, isDeleted: { $ne: true } };

    const queryObj = {
      company,
      isDeleted: { $ne: true },

      ...(dept && {
        department: dept,
        taskType: "Department",
      }),

      ...(!isReport && {
        status: "Pending",
      }),

      ...(dateFilter?.assignedDate && {
        assignedDate: dateFilter.assignedDate,
      }),
    };

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
    console.log("user", user);
    let { flag } = query;

    const queryObj = {
      company,
      isDeleted: { $ne: true },
      assignedBy: user,
      department: departments[0],
      taskType: "Self",
      ...(flag === "Pending" &&
        !isReport && {
          status: "Pending",
        }),
      ...(dateFilter?.assignedDate && {
        assignedDate: dateFilter.assignedDate,
      }),
    };

    console.log("query", queryObj);
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
