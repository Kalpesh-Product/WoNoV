const { default: mongoose } = require("mongoose");
const UserData = require("../../models/hr/UserData");
const kraKpaRole = require("../../models/tasks/kraKpaRole");
const kraKpaTask = require("../../models/tasks/kraKpaTask");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");

const createRoleBasedTask = async (req, res, next) => {
  const { user, ip, company } = req;
  const logPath = "tasks/TaskLog";
  const logAction = "Create Task";
  const logSourceKey = "kraKpaRoles";

  try {
    const { type } = req.query;

    const {
      task,
      description,
      role,
      department,
      priority,
      assignedDate,
      dueDate,
    } = req.body;

    if (!type) {
      throw new CustomError(
        "Missing Task type",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (
      !task ||
      !description ||
      !department ||
      !role ||
      !priority ||
      !assignedDate ||
      !dueDate
    ) {
      throw new CustomError(
        "Missing required fields",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!mongoose.Types.ObjectId.isValid(role)) {
      throw new CustomError(
        "Invalid role ID provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!mongoose.Types.ObjectId.isValid(department)) {
      throw new CustomError(
        "Invalid department ID provided",
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
        "Character limit exceeded,only upto 150 characters allowed",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (
      isNaN(new Date(assignedDate).getTime()) ||
      isNaN(new Date(dueDate).getTime())
    ) {
      throw new CustomError(
        "Invalid date format provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const parsedAssignedDate = new Date(assignedDate);
    const parsedDueDate = new Date(dueDate);

    const newRoleKraKpa = new kraKpaRole({
      task,
      description,
      assignedBy: user,
      role,
      department,
      priority,
      assignedDate: parsedAssignedDate,
      dueDate: parsedDueDate,
      taskType: type,
      company,
    });

    const savedNewRoleKraKpa = await newRoleKraKpa.save();

    // Log success with createLog
    await createLog({
      path: logPath,
      action: logAction,
      remarks: `${type} added successfully`,
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: savedNewRoleKraKpa._id,
      changes: newRoleKraKpa,
    });

    return res.status(201).json({ message: `${type} added successfully` });
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

const createIndividualTask = async (req, res, next) => {
  const { user, ip, company } = req;
  const logPath = "hr/HrLog";
  const logAction = "Create Individual KRA/KPA";
  const logSourceKey = "user";

  try {
    const { type } = req.query;

    const {
      task,
      description,
      empId,
      department,
      priority,
      assignedDate,
      dueDate,
    } = req.body;

    if (
      !task ||
      !description ||
      !department ||
      !empId ||
      !priority ||
      !assignedDate ||
      !dueDate
    ) {
      throw new CustomError(
        "Missing required fields",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!type) {
      throw new CustomError(
        "Missing task type",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!mongoose.Types.ObjectId.isValid(department)) {
      throw new CustomError(
        "Invalid department ID provided",
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
        "Character limit exceeded,only upto 150 characters allowed",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (
      isNaN(new Date(assignedDate).getTime()) ||
      isNaN(new Date(dueDate).getTime())
    ) {
      throw new CustomError(
        "Invalid date format provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const parsedAssignedDate = new Date(assignedDate);
    const parsedDueDate = new Date(dueDate);

    const founudUser = await UserData.findOne({ empId });

    if (!founudUser) {
      throw new CustomError("User not found", logPath, logAction, logSourceKey);
    }

    const taskDetails = {
      task,
      assignedBy: user,
      description,
      department,
      priority,
      taskType: type,
      assignedDate: parsedAssignedDate,
      dueDate: parsedDueDate,
    };
    const updateUserData = await UserData.findOneAndUpdate(
      { empId },
      {
        $push: { kraKpa: taskDetails },
      },
      { new: true }
    );

    if (!updateUserData) {
      throw new CustomError(
        `Failed to add the ${type}`,
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Log success with createLog
    await createLog({
      path: logPath,
      action: logAction,
      remarks: `${type} added successfully`,
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: updateUserData._id,
      changes: taskDetails,
    });

    return res.status(201).json({ message: `${type} added successfully` });
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

const updateTaskStatus = async (req, res, next) => {
  const { user, ip, company } = req;
  const logPath = "tasks/TaskLog";
  const logAction = "Update KRA/KPA status";
  const logSourceKey = "kraKpaTasks";

  try {
    const { taskId } = req.params;

    if (!taskId) {
      throw new CustomError(
        "Missing required fields",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new CustomError(
        "Invalid task ID provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const completionDate = new Date();

    const updateTaskStatus = await kraKpaTask.findOneAndUpdate(
      { _id: taskId },
      {
        status: "Completed",
        completionDate,
      },
      { new: true }
    );

    if (!updateTaskStatus) {
      throw new CustomError(
        `Failed to update the task`,
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Log success with createLog
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Task status updated successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: updateTaskStatus._id,
      changes: {
        status: "Completed",
        completionDate,
      },
    });

    return res.status(201).json({ message: `Task completed` });
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

const getMyKraKpaTasks = async (req, res, next) => {
  try {
    const { company } = req;
    const { empId, type } = req.query;

    if (!empId) {
      return res.status(400).json({ message: "Missing employee ID" });
    }

    if (!type) {
      return res.status(400).json({ message: "Missing task type" });
    }

    const foundUser = await UserData.findOne({ empId }).populate({
      path: "role",
      select: "roleTitle",
    });

    if (!foundUser) {
      return res.status(400).json({ message: "User not found" });
    }

    const tasks = await kraKpaTask
      .find({
        company,
      })
      .populate({
        path: "task",
        populate: [
          { path: "department", select: "name" },
          { path: "assignedBy", select: "firstName middleName lastName" },
        ],
      })
      .populate({ path: "assignedTo", select: "firstName middleName lastName" })
      .select("-company")
      .lean();

    const transformedTasks = tasks
      .filter((task) => {
        console.log(
          task.assignedTo._id.toString() === foundUser._id.toString()
        );
        return (
          task.assignedTo._id.toString() === foundUser._id.toString() &&
          task.task.taskType === type
        );
      })
      .map((task) => {
        const assignedBy = `${task.task.assignedBy.firstName} ${
          task.task.assignedBy.middleName || ""
        } ${task.task.assignedBy.lastName}`;

        const assignee = `${task.assignedTo.firstName} ${
          task.assignedTo.middleName || ""
        } ${task.assignedTo.lastName}`;

        return {
          taskName: task.task.task,
          description: task.task.description,
          assignedBy: assignedBy.trim(),
          assignedTo: assignee.trim(),
          assignedDate: task.task.assignedDate,
          dueDate: task.task.dueDate,
          status: task.status,
        };
      });

    const individualTasks = foundUser?.kraKpa || [];
    const allTasks = [...transformedTasks, ...individualTasks];

    return res.status(200).json(allTasks);
  } catch (error) {
    next(error);
  }
};

const getAllKpaTasks = async (req, res, next) => {
  try {
    const { company } = req;

    const tasks = await kraKpaTask
      .find({
        company,
      })
      .populate({
        path: "task",
        populate: [
          { path: "department", select: "name" },
          { path: "assignedBy", select: "firstName middleName lastName" },
        ],
      })
      .populate({ path: "assignedTo", select: "firstName middleName lastName" })
      .select("-company")
      .lean();

    const transformedByDepartment = {};

    tasks.forEach((task) => {
      if (task.task.taskType !== "KPA") return;

      const departmentName = task.task.department.name;
      const assignedBy = `${task.task.assignedBy.firstName} ${
        task.task.assignedBy.middleName || ""
      } ${task.task.assignedBy.lastName}`;
      const assignee = `${task.assignedTo.firstName}  ${
        task.assignedTo.middleName || ""
      } ${task.assignedTo.lastName}`;

      const transformedTask = {
        taskName: task.task.task,
        description: task.task.description,
        assignedBy: assignedBy.trim(),
        assignedTo: assignee.trim(),
        assignedDate: task.task.assignedDate,
        dueDate: task.task.dueDate,
        status: task.status,
      };

      if (!transformedByDepartment[departmentName]) {
        transformedByDepartment[departmentName] = {
          department: departmentName,
          total: 0,
          achieved: 0,
          tasks: [],
        };
      }

      transformedByDepartment[departmentName].tasks.push(transformedTask);
      transformedByDepartment[departmentName].total += 1;

      if (task.status === "Completed") {
        transformedByDepartment[departmentName].achieved += 1;
      }
    });

    const transformedDeptTasks = Object.values(transformedByDepartment);

    return res.status(200).json(transformedDeptTasks);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRoleBasedTask,
  createIndividualTask,
  getAllKpaTasks,
  getMyKraKpaTasks,
  updateTaskStatus,
};
