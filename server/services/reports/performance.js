const kraKpaRole = require("../../models/performances/kraKpaRole");
const kraKpaTask = require("../../models/performances/kraKpaTask");

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

const fetchPerformanceReportService = async ({
  dateFilter,
  departmentId,
  departments = [],
  company,
  type,
  user,
}) => {
  try {
    const dept = departmentId || departments?.[0];

    if (!dept) {
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
      department: dept,
      taskType: { $in: reportTaskTypes },
      isDeleted: { $ne: true },
      ...(dateFilter || {}),
      ...(isIndividualReport && user?._id ? { assignTo: user._id } : {}),
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
      if (completion?.task?.department?._id?.toString() !== dept.toString())
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

module.exports = {
  fetchPerformanceReportService,
};
