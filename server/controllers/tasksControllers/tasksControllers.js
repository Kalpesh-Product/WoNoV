const User = require("../../models/hr/UserData");
const Project = require("../../models/tasks/Project");
const Task = require("../../models/tasks/Task");
const CustomError = require("../../utils/customErrorlogs");
const { formatDate, formatTime } = require("../../utils/formatDateTime");
const { createLog } = require("../../utils/moduleLogs");
const validateUsers = require("../../utils/validateUsers");

const createTasks = async (req, res, next) => {
  const { user, ip, company } = req;
  const logPath = "tasks/TaskLog";
  const logAction = "Create Task";
  const logSourceKey = "task";

  try {
    const {
      taskName,
      description,
      projectId,
      status,
      priority,
      assignees,
      dueDate,
      dueTime,
      taskType,
      taskTag,
    } = req.body;

    if (
      !taskName ||
      !taskType ||
      !taskTag ||
      !description ||
      !projectId ||
      !status ||
      !dueDate
    ) {
      throw new CustomError(
        "Missing required fields",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const assignedDate = new Date();
    const parsedDueDate = new Date(dueDate);
    const parsedDueTime = new Date(dueTime);

    if (isNaN(parsedDueDate.getTime())) {
      throw new CustomError(
        "Invalid date format",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (dueTime && isNaN(parsedDueTime.getTime())) {
      throw new CustomError(
        "Invalid date format",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (
      typeof description !== "string" ||
      !description.length ||
      description.replace(/\s/g, "").length > 100
    ) {
      throw new CustomError(
        "Character limit exceeded",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Validate all assignees

    let existingUsers = [];
    if (Array.isArray(assignees)) {
      existingUsers = await validateUsers(assignees);
      if (existingUsers.length !== assignees.length) {
        throw new CustomError(
          "One or more assignees are invalid or do not exist",
          logPath,
          logAction,
          logSourceKey
        );
      }
    }

    const newTask = new Task({
      taskName,
      description,
      project: projectId,
      status,
      priority: priority ? priority : "Medium",
      assignedTo: existingUsers,
      assignedBy: user,
      assignedDate,
      dueDate: parsedDueDate,
      dueTime: dueTime ? parsedDueTime : null,
      taskType,
      taskTag,
      company,
    });

    await newTask.save();

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
      changes: {
        taskName,
        description,
        projectId,
        status,
        priority,
        assignees: existingUsers,
        dueDate,
        dueTime,
        taskType,
      },
    });

    return res.status(201).json({ message: "Task added successfully" });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500)
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
    const { taskName, description, status, priority, assignees, taskType } =
      req.body;

    if (!id) {
      throw new CustomError(
        "Task ID must be provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const updates = {};

    if (taskName !== undefined) updates.taskName = taskName;
    if (taskType !== undefined) updates.taskType = taskType;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) {
      const validStatuses = ["Upcoming", "In progress", "Pending", "Completed"];
      if (!validStatuses.includes(status)) {
        throw new CustomError(
          "Invalid status value",
          logPath,
          logAction,
          logSourceKey
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
          logSourceKey
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
          logSourceKey
        );
      }
      updates.assignedTo = assignees;
    }

    if (Object.keys(updates).length === 0) {
      throw new CustomError(
        "No valid fields to update",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
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
        new CustomError(error.message, logPath, logAction, logSourceKey, 500)
      );
    }
  }
};

const getAllTasks = async (req, res, next) => {
  try {
    const { company } = req;

    const tasks = await Task.find({
      company,
    })
      .populate({
        path: "project",
        select: "projectName department",
        populate: {
          path: "department",
          select: "name",
        },
      })
      .populate("assignedBy", "firstName lastName")
      .populate("assignedTo", "firstName lastName")
      .select("-company")
      .lean();

    const transformedTasks = tasks.map((task) => {
      return {
        ...task,
        dueDate: formatDate(task.dueDate),
        dueTime: task.dueTime ? formatTime(task.dueTime) : null,
        assignedDate: formatDate(task.assignedDate),
      };
    });

    return res.status(200).json(transformedTasks);
  } catch (error) {
    next(error);
  }
};

const getMyTasks = async (req, res, next) => {
  try {
    const { user, company } = req;

    const tasks = await Task.find({
      company,
      assignedTo: { $in: [user] },
    })
      .populate({
        path: "project",
        select: "projectName department",
        populate: {
          path: "department",
          select: "name",
        },
      })
      .populate("assignedBy", "firstName lastName")
      .populate("assignedTo", "firstName lastName")
      .select("-company")
      .lean();

    const transformedTasks = tasks.map((task) => {
      return {
        ...task,
        dueDate: formatDate(task.dueDate),
        dueTime: task.dueTime ? formatTime(task.dueTime) : null,
        assignedDate: formatDate(task.assignedDate),
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

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      company,
      assignedTo: { $in: [user] },
      assignedDate: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate({
        path: "project",
        select: "projectName",
      })
      .populate("assignedBy", "firstName lastName")
      .populate("assignedTo", "firstName lastName")
      .select("-company")
      .lean();

    if (!tasks) {
      return res.status(400).json({ message: "Failed to fetch the tasks" });
    }

    const transformedTasks = tasks.map((task) => {
      return {
        ...task,
        task: task.taskName,
        type: task.taskType,
        dueTime: formatTime(task.dueTime),
        dueDate: formatTime(task.dueDate),
        assignedDate: formatDate(task.assignedDate),
      };
    });

    return res.status(200).json(transformedTasks);
  } catch (error) {
    next(error);
  }
};

const getTeamMembersTasksProjects = async (req, res, next) => {
  try {
    const { company, departments } = req;

    // Find team members
    const teamMembers = await User.find({
      departments: { $in: departments },
    });

    const teamMemberIds = teamMembers.map((member) => member._id);

    const teamMembersData = await Promise.all(
      teamMemberIds.map(async (id) => {
        // Fetch tasks assigned to the team member
        const tasks = await Task.find({
          company,
          $and: [
            { assignedTo: { $in: [id] } }, // User must be in assignedTo
            { assignedBy: { $ne: id } }, // User must NOT be assignedBy
          ],
        })
          .populate({
            path: "assignedTo",
            select: "email firstName lastName status",
            populate: [
              { path: "role", select: "roleTitle" },
              { path: "departments", select: "name" },
            ],
          })
          .populate("assignedBy", "firstName lastName")
          .populate("project", "projectName")
          .select("-company")
          .lean();

        // Fetch projects assigned to the employee
        const projects = await Project.find({
          company,
          assignedTo: { $in: [id] },
        })
          .select("projectName")
          .lean();

        // Find the correct user details from the first task
        let userDetails = {};
        if (tasks.length > 0) {
          const matchedUser = tasks[0].assignedTo.find(
            (user) => user._id.toString() === id.toString()
          );

          if (matchedUser) {
            userDetails = {
              email: matchedUser.email,
              name: `${matchedUser.firstName} ${matchedUser.lastName}`,
              role:
                Array.isArray(matchedUser.role) && matchedUser.role.length
                  ? matchedUser.role.map((role) => role.roleTitle)
                  : ["No Role"],
              departments:
                matchedUser.departments?.map((dept) => dept.name) || [],
              status: matchedUser.status || "Active",
            };
          }
        }

        if (tasks.length > 0) {
          return {
            ...userDetails,
            tasksCount: tasks.length,
            projectsCount: projects.length || null,
          };
        }

        return null; // Return null for users with no tasks
      })
    );

    // Filter out null elements (users with 0 tasks)
    const filteredData = teamMembersData.filter((member) => member !== null);

    return res.status(200).json(filteredData);
  } catch (error) {
    next(error);
  }
};

const getAssignedTasks = async (req, res, next) => {
  try {
    const { user, company } = req;

    const tasks = await Task.find({ company, assignedBy: user })
      .populate({
        path: "project",
        select: "projectName",
      })
      .populate("assignedBy", "firstName lastName")
      .populate("assignedTo", "firstName lastName")
      .select("-company")
      .lean();

    const transformedTasks = tasks.map((task) => {
      return {
        ...task,
        dueDate: formatDate(task.dueDate),
        dueTime: task.dueTime ? formatTime(task.dueTime) : null,
        assignedDate: formatDate(task.assignedDate),
      };
    });

    return res.status(200).json(transformedTasks);
  } catch (error) {
    next(error);
  }
};

const completeTasks = async (req, res, next) => {
  const { company, user, ip } = req;
  const logPath = "tasks/TaskLog";
  const logAction = "Update Task Status";
  const logSourceKey = "task";

  try {
    const { taskIds } = req.body;

    if (!taskIds || !taskIds.length) {
      throw new CustomError("Missing tasks", logPath, logAction, logSourceKey);
    }

    // Step 1: Fetch tasks before updating
    const existingTasks = await Task.find({ _id: { $in: taskIds }, company });

    if (!existingTasks.length) {
      throw new CustomError(
        "No tasks found for the given IDs",
        logPath,
        logAction,
        logSourceKey
      );
    }

    await Task.updateMany(
      { _id: { $in: taskIds }, company },
      { status: "Completed" }
    );

    // Step 3: Fetch updated tasks
    const updatedTasks = await Task.find({ _id: { $in: taskIds }, company });

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
        })
    );

    return res.status(200).json({
      message: "Task status updated successfully",
    });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500)
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
        logSourceKey
      );
    }

    const deletedTask = await Task.findByIdAndUpdate(
      { _id: id, company },
      { isDeleted: true },
      { new: true }
    );

    if (!deletedTask) {
      throw new CustomError(
        "Failed to delete the task",
        logPath,
        logAction,
        logSourceKey
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
        new CustomError(error.message, logPath, logAction, logSourceKey, 500)
      );
    }
  }
};

module.exports = {
  createTasks,
  updateTask,
  getMyTasks,
  getMyTodayTasks,
  getAllTasks,
  getTeamMembersTasksProjects,
  getAssignedTasks,
  completeTasks,
  deleteTask,
};
