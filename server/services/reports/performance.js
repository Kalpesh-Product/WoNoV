const kraKpaTask = require("../../models/performances/kraKpaTask");

const fetchPerformanceReportService = async ({
  dateFilter,
  departmentId,
  departments: userDepts = [],
  roles = [],
  company,
  user,
  type,
}) => {
  try {
    const dept = userDepts;
    let query = { duration: "Annually", empId: user };
    const { duration, empId } = query;

    if (!dept) {
      throw Error({ message: "Missing department ID" });
    }
    if (!type) {
      throw Error({ message: "Missing task type" });
    }

    const completedTasks = await kraKpaTask
      .find({ company, status: "Completed", completionDate: dateFilter })
      .populate([
        {
          path: "task",
          select: "",
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
      .select("-company");
    const isHrOrSuperAdmin =
      roles.includes("Master Admin") ||
      roles.includes("Super Admin") ||
      roles.includes("HR Admin") ||
      roles.includes("HR Employee");

    const isManager = isHrOrSuperAdmin || userDepts.includes(dept);

    const uniqueCompletedTasks = Array.from(
      new Map(
        completedTasks.map((task) => {
          const taskId =
            task?.task?._id?.toString?.() || task?._id?.toString?.();
          const completionKey = `${taskId || "unknown"}-${new Date(task.completionDate).toISOString().slice(0, 10)}`;
          return [completionKey, task];
        }),
      ).values(),
    );

    const transformedCompletedTasks = !uniqueCompletedTasks.length
      ? []
      : uniqueCompletedTasks
          .filter((task) => {
            if (!task.task || task.task.isDeleted) return false;
            if (duration && duration !== task.task.kpaDuration) return;
            if (empId && task.completedBy.empId !== empId) return;
            if (task.task.department._id.toString() !== dept) return false;
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

              if (monthIndex === -1) return false;

              const completionDate = new Date(task.completionDate);
              if (Number.isNaN(completionDate.getTime())) return false;

              if (completionDate.getMonth() !== monthIndex) return false;
            }

            if (year) {
              const completionDate = new Date(task.completionDate);
              if (Number.isNaN(completionDate.getTime())) return false;

              if (completionDate.getFullYear() !== Number(year)) return false;
            }

            // Department KRA/KPA
            if (type === "KRA" || type === "KPA") {
              return task.task.taskType === type;
            }

            // Team KRA/KPA
            if (type === "TEAMKRA" || type === "TEAMKPA") {
              return task.task.taskType === type;
            }

            // Individual KRA/KPA also includes own Team assignments
            if (type === "INDIVIDUALKRA" || type === "INDIVIDUALKPA") {
              const isOwnTask =
                task.task.assignTo?._id.toString() === req.user.toString();

              if (task.task.taskType === type) {
                if (isManager) return true;
                return isOwnTask;
              }

              const mappedType =
                type === "INDIVIDUALKRA" ? "TEAMKRA" : "TEAMKPA";
              if (task.task.taskType === mappedType) {
                return isOwnTask;
              }
            }

            return false;
          })
          .map((task) => {
            const completedBy = `${task.completedBy.firstName} ${
              task.completedBy.middleName || ""
            } ${task.completedBy.lastName}`;

            return {
              id: task._id,
              taskName: task.task.task,
              department: task.task.department.name,
              completedBy: completedBy,
              assignedDate: task.task.assignedDate,
              dueDate: task.task.dueDate,
              dueTime: "6:30 PM",
              completionDate: task.completionDate ? task.completionDate : "N/A",
              status: task.status,
            };
          });

    return transformedCompletedTasks;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  fetchPerformanceReportService,
};
