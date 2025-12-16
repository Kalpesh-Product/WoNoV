const { default: mongoose } = require("mongoose");
const User = require("../../models/hr/UserData");
const Task = require("../../models/tasks/Task");
const CustomError = require("../../utils/customErrorlogs");
const { formatDate, formatTime } = require("../../utils/formatDateTime");
const { createLog } = require("../../utils/moduleLogs");
const validateUsers = require("../../utils/validateUsers");
const Department = require("../../models/Departments");
const UserData = require("../../models/hr/UserData");
const emitter = require("../../utils/eventEmitter");

const createTasks = async (req, res, next) => {
  const { user, ip, company } = req;
  const logPath = "tasks/TaskLog";
  const logAction = "Create Task";
  const logSourceKey = "task";

  try {
    const {
      taskName,
      department,
      description,
      taskType,
      // status,
      // priority,
      // assignees,
      dueTime,
      endDate: dueDate,
      startDate: assignedDate,
    } = req.body;

    if (
      !taskName ||
      !department ||
      !description ||
      !dueDate ||
      !assignedDate ||
      !dueTime ||
      !taskType
    ) {
      throw new CustomError(
        "Missing required fields",
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

    const parsedAssignedDate = new Date(assignedDate);
    const parsedDueDate = new Date(dueDate);

    if (isNaN(parsedAssignedDate.getTime())) {
      throw new CustomError(
        "Invalid date format",
        logPath,
        logAction,
        logSourceKey
      );
    }
    if (isNaN(parsedDueDate.getTime())) {
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
    // let existingUsers = [];
    // if (Array.isArray(assignees)) {
    //   existingUsers = await validateUsers(assignees);
    //   if (existingUsers.length !== assignees.length) {
    //     throw new CustomError(
    //       "One or more assignees are invalid or do not exist",
    //       logPath,
    //       logAction,
    //       logSourceKey
    //     );
    //   }
    // }

    const newTask = new Task({
      taskName,
      taskType,
      department,
      description,
      // status,
      // priority: priority ? priority : "High",
      // assignedTo: existingUsers,
      assignedBy: user,
      assignedDate,
      dueDate: parsedDueDate,
      dueTime: dueTime,
      company,
    });

    await newTask.save();

    // Emit the task notification
    const foundDepartment = await Department.findById(department).select(
      "name"
    );

    const userDetails = await UserData.findById({
      _id: user,
    });

    const deptEmployees = await UserData.find({
      departments: { $in: department },
    });
    console.log(department);

    // const deptEmployees = await UserData.find({
    //   departments: { $in: [department] },
    // });

    // const employeeIds = deptEmployees.map((emp) => emp._id);

    // * Emit notification event for task creation *
    emitter.emit("notification", {
      initiatorData: user, // user._id is expected if used downstream
      users: deptEmployees.map((emp) => ({
        userActions: {
          whichUser: emp._id, // send to department admin or fallback to self
          hasRead: false,
        },
      })),
      type: "add task",
      module: "Tasks",
      message: `A new task "${taskName}" was added by ${userDetails.firstName} ${userDetails.lastName} in ${foundDepartment.name} department.`,
    });

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
      changes: newTask,
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

const updateTaskStatus = async (req, res, next) => {
  const { user, ip, company } = req;
  const logPath = "tasks/TaskLog";
  const logAction = "Update Task Status";
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new CustomError(
        "Invalid task ID provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const currDate = new Date();
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { status: "Completed", completedBy: user, completedDate: currDate },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      throw new CustomError("Task not found", logPath, logAction, logSourceKey);
    }

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Task status updated successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: updatedTask._id,
      changes: {
        status: "Completed",
        prevStatus: "Pending",
        completedBy: user,
      },
    });

    return res.status(200).json({ message: "Task marked completed" });
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
    const { taskName, description, status, priority, assignees } = req.body;

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
    if (description !== undefined) updates.description = description;
    if (status !== undefined) {
      if (status !== "Completed") {
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
    const { company, departments, roles } = req;

    let query = { company };

    if (!roles.includes("Master Admin") && !roles.includes("Super Adtmin")) {
      query.department = { $in: departments };
    }

    const tasks = await Task.find(query)
      .populate("assignedBy", "firstName lastName")
      .populate("completedBy", "firstName lastName")
      .populate("department", "name")
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
        completedBy,
      };
    });

    return res.status(200).json(transformedTasks);
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const { company } = req;
    const { dept } = req.query;
    const query = { company };

    // const team = await UserData.find({});

    if (dept) {
      // const admins = await User.aggregate([
      //   {
      //     $match: {
      //       departments: { $in: [new mongoose.Types.ObjectId(dept)] },
      //     },
      //   },
      //   {
      //     $unwind: "$role", // Unwind role array
      //   },
      //   {
      //     $lookup: {
      //       from: "roles",
      //       localField: "role",
      //       foreignField: "_id",
      //       as: "roleInfo",
      //     },
      //   },
      //   {
      //     $unwind: "$roleInfo",
      //   },
      //   {
      //     $match: {
      //       "roleInfo.roleTitle": {
      //         $regex: /Admin$/,
      //         $options: "i",
      //       },
      //     },
      //   },
      //   {
      //     $project: { _id: 1 }, // Only need user IDs
      //   },
      // ]);

      // const adminIds = admins.map((admin) => admin._id);

      query.department = dept;
      query.status = "Pending";
      query.taskType = "Department";
      // query.assignedBy = { $in: adminIds };
    }

    const tasks = await Task.find(query)
      .populate("department", "name")
      .populate("assignedBy", "firstName lastName")
      .populate("completedBy", "firstName lastName")
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

    return res.status(200).json(transformedTasks);
  } catch (error) {
    next(error);
  }
};

const getMyTasks = async (req, res, next) => {
  try {
    const { user, company } = req;
    const { flag } = req.query;
    const query = { company, assignedBy: user, taskType: "Self" };

    if (flag === "pending") {
      query.status = "Pending";
    }

    const tasks = await Task.find(query)
      .populate("department", "name")
      .populate("assignedBy", "firstName lastName")
      .populate("completedBy", "firstName lastName")
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

    return res.status(200).json(transformedTasks);
  } catch (error) {
    next(error);
  }
};

const getMyAssignedTasks = async (req, res, next) => {
  try {
    const { user, departments, company } = req;

    const tasks = await Task.find({
      company,
      assignedBy: { $ne: user },
      department: { $in: departments },
    })
      .populate("department", "name")
      .populate("assignedBy", "firstName lastName")
      .populate("completedBy", "firstName lastName")
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
        dueTime: task.dueTime ? task.dueTime : "06:30 PM",
        assignedDate: task.assignedDate,
        completedBy,
      };
    });

    return res.status(200).json(transformedTasks);
  } catch (error) {
    next(error);
  }
};

const getCompletedTasks = async (req, res, next) => {
  try {
    const { company } = req;
    const { deptId } = req.params;

    const tasks = await Task.find({
      company,
      department: deptId,
      status: "Completed",
    })
      .populate("department", "name")
      .populate("assignedBy", "firstName lastName")
      .populate("completedBy", "firstName lastName")
      .select("-company")
      .lean();

    if (!tasks) {
      return res.status(400).json({ message: "No tasks found" });
    }

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
        dueTime: task.dueTime ? task.dueTime : "06:30 PM",
        assignedDate: task.assignedDate,
        completedBy,
      };
    });

    return res.status(200).json(transformedTasks);
  } catch (error) {
    next(error);
  }
};

const getMyCompletedTasks = async (req, res, next) => {
  try {
    const { user, company } = req;

    const tasks = await Task.find({
      company,
      completedBy: user,
      // $or: [
      //   { $and: [{ taskType: "Self" }, { status: "Completed" }] },
      //   { $and: [{ completedBy: user }] },
      // ],
    })
      .populate("department", "name")
      .populate("assignedBy", "firstName lastName")
      .populate("completedBy", "firstName lastName")
      .select("-company")
      .lean();

    if (!tasks) {
      return res.status(400).json({ message: "No tasks found" });
    }
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
        dueTime: task.dueTime ? task.dueTime : "06:30 PM",
        assignedDate: task.assignedDate,
        completedBy,
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
      assignedDate: { $gte: startOfDay, $lte: endOfDay },
      $or: [{ assignedBy: { $in: [user] } }, { completedBy: { $in: [user] } }],
    })
      .populate("department", "name")
      .populate("assignedBy", "firstName lastName")
      .populate("completedBy", "firstName lastName")
      .select("-company")
      .lean();

    if (!tasks) {
      return res.status(400).json({ message: "Failed to fetch the tasks" });
    }

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
        task: task.taskName,
        dueTime: task.dueTime,
        dueDate: task.dueDate,
        assignedDate: task.assignedDate,
        department: task.department.name,
        completedBy,
      };
    });

    return res.status(200).json(transformedTasks);
  } catch (error) {
    next(error);
  }
};

const getTodayDeptTasks = async (req, res, next) => {
  try {
    const { user, company } = req;
    const { dept } = req.query;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    if (dept && !mongoose.Types.ObjectId.isValid(dept)) {
      return res
        .status(400)
        .json({ message: "Invalid department ID provided" });
    }

    const tasks = await Task.find({
      company,
      assignedDate: { $gte: startOfDay, $lte: endOfDay },
      department: dept,
    })
      .populate("department", "name")
      .populate("assignedBy", "firstName lastName")
      .populate("completedBy", "firstName lastName")
      .select("-company")
      .lean();

    if (!tasks) {
      return res.status(400).json({ message: "Failed to fetch the tasks" });
    }

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
        task: task.taskName,
        dueTime: task.dueTime,
        dueDate: task.dueDate,
        assignedDate: task.assignedDate,
        department: task.department.name,
        completedBy,
      };
    });

    return res.status(200).json(transformedTasks);
  } catch (error) {
    next(error);
  }
};

const getTeamMembersTasks = async (req, res, next) => {
  try {
    const { company, departments } = req;

    if (!company || !departments || departments.length === 0) {
      return res
        .status(400)
        .json({ message: "Company or departments info missing in request" });
    }

    const teamMembers = await User.find({
      departments: { $in: departments },
      isActive: true,
    })
      .populate([
        { path: "role", select: "roleTitle" },
        { path: "departments", select: "name" },
      ])
      .select("firstName middleName lastName email");

    const tasks = await Task.find({
      company,
      department: { $in: departments },
    })
      .populate([
        {
          path: "completedBy",
          select: "email firstName lastName isActive",
          populate: [
            { path: "role", select: "roleTitle" },
            { path: "departments", select: "name" },
          ],
        },
      ])
      .populate("assignedBy", "firstName lastName")
      .select("-company")
      .lean();

    const transformedTasks = teamMembers.map((member) => {
      const memberId = member._id.toString();

      const totalTasks = tasks.filter((emp) => {
        const completedById = emp?.completedBy?._id;
        return completedById && completedById.toString() === memberId;
      }).length;

      return {
        name: `${member.firstName} ${member.middleName || ""} ${
          member.lastName
        }`.trim(),
        email: member.email,
        department: member.departments.map((dept) => dept.name),
        role: member.role.map((r) => r.roleTitle),
        tasks: totalTasks,
      };
    });

    return res.status(200).json(transformedTasks);
  } catch (error) {
    next(error);
  }
};

const getAllDeptTasks = async (req, res, next) => {
  try {
    const { roles, departments, company } = req;

    let departmentMap = new Map();
    let query = { company, taskType: "Department" };

    const isSuperAdmin =
      roles.includes("Master Admin") || roles.includes("Super Admin");

    if (!isSuperAdmin) {
      query.department = { $in: departments };
    }

    // Step 1: Fetch only accessible departments
    const deptFilter = { isActive: true };
    if (!isSuperAdmin) {
      deptFilter._id = { $in: departments };
    }

    const fetchedDepartments = await Department.find(deptFilter).lean();

    // Step 2: Pre-fill the departmentMap with only allowed departments
    fetchedDepartments.forEach((dept) => {
      departmentMap.set(dept._id.toString(), {
        department: dept,
        totalTasks: 0,
        pendingTasks: 0,
        completedTasks: 0,
      });
    });

    // Step 3: Fetch tasks that match the user's access level
    const tasks = await Task.find(query)
      .populate([{ path: "department", select: "name" }])
      .select("-company")
      .lean();

    // Step 4: Count tasks into the pre-filled map
    tasks.forEach((task) => {
      const dept = task.department;
      const deptId = dept?._id?.toString();

      if (deptId && departmentMap.has(deptId)) {
        const entry = departmentMap.get(deptId);
        entry.totalTasks++;
        if (task.status === "Pending") entry.pendingTasks++;
        if (task.status === "Completed") entry.completedTasks++;
      }
    });

    // Step 5: Return departments user has access to, even if no tasks
    const result = Array.from(departmentMap.values());

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getAssignedTasks = async (req, res, next) => {
  try {
    const { user, company } = req;

    const tasks = await Task.find({ company, assignedBy: user })
      .populate("assignedBy", "firstName lastName")
      .populate("completedBy", "firstName lastName")
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
        dueDate: formatDate(task.dueDate),
        dueTime: task.dueTime ? formatTime(task.dueTime) : null,
        assignedDate: formatDate(task.assignedDate),
        completedBy,
      };
    });

    return res.status(200).json(transformedTasks);
  } catch (error) {
    next(error);
  }
};

//Update multiple tasks statuses together
const completeTasks = async (req, res, next) => {
  const { company, user, ip } = req;
  const logPath = "tasks/TaskLog";
  const logAction = "Mark Completed Tasks";
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
      message: "Tasks marked completed",
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

const getTasksSummary = async (req, res, next) => {
  try {
    const { company, departments, roles } = req;

    const tasks = await Task.find({ company })
      .populate("assignedBy", "firstName lastName")
      .populate("completedBy", "firstName lastName")
      .populate("department", "name")
      .select("-company")
      .lean();

    const taskMap = new Map();

    tasks.forEach((task) => {
      const dept = task.department.name || "Unknown";

      if (!taskMap.has(dept)) {
        taskMap.set(dept, {
          department: dept,
          total: 0,
          achieved: 0,
          tasks: [],
        });
      }

      const mappedTask = taskMap.get(dept);

      mappedTask.total += 1;

      if (task.status === "Completed") {
        mappedTask.achieved += 1;
      }

      mappedTask.tasks.push(task);
    });

    const result = Array.from(taskMap.values());
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTasks,
  updateTask,
  updateTaskStatus,
  getMyTasks,
  getMyTodayTasks,
  getAllTasks,
  getTasks,
  getTeamMembersTasks,
  getAssignedTasks,
  getAllDeptTasks,
  completeTasks,
  deleteTask,
  getCompletedTasks,
  getMyCompletedTasks,
  getMyAssignedTasks,
  getTodayDeptTasks,
  getTasksSummary,
};
