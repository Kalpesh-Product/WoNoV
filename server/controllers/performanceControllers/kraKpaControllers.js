const { default: mongoose } = require("mongoose");
const UserData = require("../../models/hr/UserData");
const kraKpaRole = require("../../models/performance/kraKpaRole");
const kraKpaTask = require("../../models/performance/kraKpaTask");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");

const createDeptBasedTask = async (req, res, next) => {
  const { user, ip, company } = req;
  const logPath = "performance/PerformanceLog";
  const logAction = "Create Task";
  const logSourceKey = "kraKpaRoles";

  try {
    const {
      task,
      taskType,
      description,
      department,
      dueDate,
      kpaDuration,
      assignedDate,
    } = req.body;

    if (!task || !taskType || !description || !department || !assignedDate) {
      throw new CustomError(
        "Missing required fields",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (taskType === "KPA" && (!kpaDuration || !dueDate)) {
      throw new CustomError(
        "KPA type or due date is missing",
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

    const parsedAssignedDate = new Date(assignedDate);
    const parsedDueDate = new Date(dueDate);
    const dueTime = "6:30 PM";

    // const isSameDay =
    //   parsedDueDate.getDate() - parsedAssignedDate.getDate() === 0;
    // const isSameMonth =
    //   parsedDueDate.getMonth() - parsedAssignedDate.getMonth() === 0;

    if (parsedAssignedDate === parsedDueDate && taskType !== "KRA") {
      console.log("inn");
      throw new CustomError(
        "Task type should be KRA",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const kpaTypeMatch =
      parsedDueDate.getMonth() - parsedAssignedDate.getMonth() <= 1
        ? "Monthly"
        : parsedDueDate.getMonth() - parsedAssignedDate.getMonth() > 1 &&
          parsedDueDate.getMonth() - parsedAssignedDate.getMonth() <= 12
        ? "Annualy"
        : "No match";

    if (taskType === "KPA" && kpaTypeMatch !== kpaDuration) {
      throw new CustomError(
        "Selected dates and kpa type doesn't match",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (isNaN(parsedAssignedDate.getTime()) || isNaN(parsedDueDate.getTime())) {
      throw new CustomError(
        "Invalid date format provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const newRoleKraKpa = new kraKpaRole({
      task,
      description,
      assignedBy: user,
      department,
      assignedDate,
      dueDate: parsedDueDate,
      dueTime,
      taskType,
      kpaDuration,
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

const updateTaskStatus = async (req, res, next) => {
  const { user, ip, company } = req;
  const logPath = "performance/performanceLog";
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

    const newKraKpaTask = new kraKpaTask({
      task: taskId,
      assignedTo: user,
      status: "Completed",
      completionDate,
      company,
    });

    const savedNewKraKpaTask = await newKraKpaTask.save();

    // const updateTaskStatus = await kraKpaTask.findOneAndUpdate(
    //   { _id: taskId },
    //   {
    //     status: "Completed",
    //     completionDate,
    //   },
    //   { new: true }
    // );

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
      sourceId: savedNewKraKpaTask._id,
      changes: {
        status: "Completed",
        prevStatus: "Pending",
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

const getKraKpaTasks = async (req, res, next) => {
  try {
    const { company } = req;
    const { type, dept, duration } = req.query;

    const query = { company };
    let subQuery;

    if (dept) {
      query.department = dept;
    }
    if (duration) {
      query.duration = duration;
    }

    const matchingDepartments = await kraKpaRole.find(query).select("-company");

    const tasks = await kraKpaTask
      .find({
        company,
        task: { $in: matchingDepartments.map((dept) => dept._id) },
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
        return task.task.taskType === type;
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
          assignedDate: "9:30 AM",
          dueTime: "6:30 PM",
          completionDate: task.completionDate ? task.completionDate : "N/A",
          status: task.status,
        };
      });

    return res.status(200).json(transformedTasks);
  } catch (error) {
    next(error);
  }
};

const getMyKraKpaTasks = async (req, res, next) => {
  try {
    const { company } = req;
    const { empId, type, dept, duration } = req.query;

    const query = { company };
    if (dept) {
      query.department = dept;
    }
    if (duration) {
      query.duration = duration;
    }

    const foundUser = await UserData.findOne({ empId });

    if (!foundUser) {
      return res.status(400).json({ message: "User not found" });
    }

    const matchingDepartments = await kraKpaRole.find(query).select("_id");

    const tasks = await kraKpaTask
      .find({
        company: company,
        task: { $in: matchingDepartments.map((dept) => dept._id) },
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
          assignedDate: "9:30 AM",
          dueTime: "6:30 PM",
          completionDate: task.completionDate ? task.completionDate : "N/A",
          status: task.status,
        };
      });

    return res.status(200).json(transformedTasks);
  } catch (error) {
    next(error);
  }
};

const getAllDeptTasks = async (req, res, next) => {
  try {
    const { company } = req;
    const { duration, taskType } = req.query;

    let departmentMap = new Map();
    let query = { company };

    if (duration) {
      query.kpaDuration = duration;
    }
    if (taskType) {
      query.taskType = taskType;
    }

    const tasks = await kraKpaRole
      .find(query)
      .populate([{ path: "department", select: "name" }])
      .select("-company")
      .lean();

    tasks.forEach((task) => {
      const dept = task.department || "Unknown";

      if (!departmentMap.has(dept)) {
        departmentMap.set(dept, {
          department: dept,
          dailyKRA: 0,
          monthlyKPA: 0,
          annuallyKPA: 0,
        });
      }

      const department = departmentMap.get(dept);

      if (task.taskType === "KRA") department.dailyKRA++;
      if (task.taskType === "KPA" && task.kpaDuration === "Monthly")
        department.monthlyKPA++;
      if (task.taskType === "KPA" && task.kpaDuration === "Annually")
        department.annuallyKPA++;
    });

    const result = Array.from(departmentMap.values());

    return res.status(200).json(result);
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
  createDeptBasedTask,
  // createIndividualTask,
  getAllKpaTasks,
  getKraKpaTasks,
  getMyKraKpaTasks,
  getAllDeptTasks,
  updateTaskStatus,
};
