const UserData = require("../../models/hr/UserData");
const kraKpaRole = require("../../models/tasks/kraKpaRole");
const kraKpaTask = require("../../models/tasks/kraKpaTask");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");

const createRoleBasedTask = async (req, res, next) => {
  const { user, ip, company } = req;
  const logPath = "tasks/TaskLog";
  const logAction = "Create Task";
  const logSourceKey = "kraKpaRole";

  try {
    const { task, description, role, department, priority, taskType } =
      req.body;

    if (
      !task ||
      !taskType ||
      !assignedBy ||
      !description ||
      !department ||
      !role ||
      !priority
    ) {
      throw new CustomError(
        "Missing required fields",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (mongoose.Types.ObjectId.isValid(role)) {
      throw new CustomError(
        "Invalid role ID provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (mongoose.Types.ObjectId.isValid(department)) {
      throw new CustomError(
        "Invalid department ID provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const currDate = new Date();

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

    const newRoleKraKpa = new kraKpaRole({
      task,
      description,
      assignedBy: user,
      role,
      department,
      priority,
      creationDate: currDate,
      taskType,
      company,
    });

    const savedNewRoleKraKpa = await newRoleKraKpa.save();

    // Log success with createLog
    await createLog({
      path: logPath,
      action: logAction,
      remarks: `${taskType} added successfully`,
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: savedNewRoleKraKpa._id,
      changes: newRoleKraKpa,
    });

    return res.status(201).json({ message: `${taskType} added successfully` });
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
  const logAction = "Create Task";
  const logSourceKey = "user";

  try {
    const { task, description, empId, department, priority, taskType } =
      req.body;

    if (
      !task ||
      !taskType ||
      !assignedBy ||
      !description ||
      !department ||
      !empId ||
      !priority
    ) {
      throw new CustomError(
        "Missing required fields",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (mongoose.Types.ObjectId.isValid(empId)) {
      throw new CustomError(
        "Invalid employee ID provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (mongoose.Types.ObjectId.isValid(department)) {
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

    const founudUser = await UserData.findOne({ empId });

    if (!founudUser) {
      throw new CustomError("User not found", logPath, logAction, logSourceKey);
    }

    const currDate = new Date();
    const taskDetails = {
      task,
      description,
      empId,
      department,
      priority,
      taskType,
      creationDate: currDate,
    };
    const updateUserData = await UserData.findOneAndUpdate(
      { empId },
      {
        $push: { kraKpa: taskDetails },
      }
    );

    if (!updateUserData) {
      throw new CustomError(
        `Failed to add the ${taskType}`,
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Log success with createLog
    await createLog({
      path: logPath,
      action: logAction,
      remarks: `${taskType} added successfully`,
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: updateUserData._id,
      changes: taskDetails,
    });

    return res.status(201).json({ message: `${taskType} added successfully` });
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

const getAllKraKpaTasks = async (req, res, next) => {
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
  getAllKraKpaTasks,
  getAllKpaTasks,
};
