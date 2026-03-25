const { default: mongoose } = require("mongoose");
const kraKpaRole = require("../../models/performances/kraKpaRole");
const kraKpaTask = require("../../models/performances/kraKpaTask");
const emitter = require("../../utils/eventEmitter");
const Department = require("../../models/Departments");
const UserData = require("../../models/hr/UserData");
const { Readable } = require("stream");
const csvParser = require("csv-parser");

const createDeptBasedTask = async (req, res, next) => {
  const { user, ip, company } = req;
  try {
    const {
      task,
      taskType,
      department,
      dueDate,
      assignedDate,
      kpaDuration,
      assignTo,
    } = req.body;

    if (!task || !taskType || !department || !assignedDate) {
      return res
        .status(400)
        .json({ message: "Please provide all the valid details" });
    }

    if (taskType === "KPA" && (!kpaDuration || !dueDate)) {
      return res
        .status(400)
        .json({ message: "KPA type or due date is missing" });
    }

    if (!mongoose.Types.ObjectId.isValid(department)) {
      return res
        .status(400)
        .json({ message: "Invalid department ID provided" });
    }

    const currDate = new Date();

    const parsedAssignedDate = assignedDate ? new Date(assignedDate) : currDate;
    const parsedDueDate = dueDate ? new Date(dueDate) : currDate;
    const dueTime = "6:30 PM";

    const isKraType = ["KRA", "INDIVIDUALKRA", "TEAMKRA"].includes(taskType);
    const isSameDate = currDate.toDateString() === parsedDueDate.toDateString();

    if (isSameDate && !isKraType) {
      return res.status(400).json({ message: "Task type should be KRA" });
    }

    const kpaTypeMatch =
      parsedDueDate.getMonth() - parsedAssignedDate.getMonth() <= 1
        ? "Monthly"
        : parsedDueDate.getMonth() - parsedAssignedDate.getMonth() > 1 &&
            parsedDueDate.getMonth() - parsedAssignedDate.getMonth() <= 12
          ? "Annually"
          : "No match";

    if (taskType === "KPA" && kpaTypeMatch !== kpaDuration) {
      return res
        .status(400)
        .json({ message: "Selected dates and kpa type doesn't match" });
    }

    if (
      isNaN(currDate.getTime()) ||
      isNaN(parsedDueDate.getTime()) ||
      isNaN(parsedAssignedDate.getTime())
    ) {
      return res.status(400).json({ message: "Invalid date format provided" });
    }

    const assignees = Array.isArray(assignTo) ? assignTo : [assignTo || user];

    const tasksToCreate = assignees.map((assigneeId) => ({
      task,
      assignedBy: user,
      department,
      assignTo: assigneeId,
      assignedDate: parsedAssignedDate,
      dueDate:
        taskType === "KRA" ||
        taskType === "TEAMKRA" ||
        taskType === "INDIVIDUALKRA"
          ? currDate
          : parsedDueDate,
      dueTime,
      taskType,
      kpaDuration,
      company,
    }));

    const createdTasks = await kraKpaRole.insertMany(tasksToCreate);

    // * Emit notification event for kra/kpa creation *

    // Emit the task notification
    const foundDepartment =
      await Department.findById(department).select("name");

    const userDetails = await UserData.findById({
      _id: user,
    });

    const deptEmployees = await UserData.find({
      departments: { $in: department },
    });
    console.log(department);

    emitter.emit("notification", {
      initiatorData: user, // user._id is expected if used downstream
      users: deptEmployees.map((emp) => ({
        userActions: {
          whichUser: emp._id, // send to department admin or fallback to self
          hasRead: false,
        },
      })),
      type: "add kra/kpa",
      module: "Performance",
      message: `A new ${taskType} "${task}" was added by ${userDetails.firstName} ${userDetails.lastName} in ${foundDepartment.name} department.`,
    });

    return res.status(201).json({
      message: `${taskType} added successfully`,
      data: createdTasks,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Server Error" });
  }
};

const updateTaskStatus = async (req, res, next) => {
  const { user, ip, company } = req;

  try {
    const { taskId, taskType } = req.params;

    if (!taskId) {
      // throw new CustomError(
      //   "Missing required fields",
      //   logPath,
      //   logAction,
      //   logSourceKey
      // );
      return res.send(400).status({ message: "Missing required fields" });
    }

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      // throw new CustomError(
      //   "Invalid task ID provided",
      //   logPath,
      //   logAction,
      //   logSourceKey
      // );
      return res.send(400).status({ message: "Invalid task ID provided" });
    }

    const completionDate = new Date();

    const existingTask = await kraKpaTask.findOne({
      task: taskId,
      status: "Completed",
    });

    // if (existingTask) {
    //   throw new CustomError(
    //     "Task already marked completed",
    //     logPath,
    //     logAction,
    //     logSourceKey
    //   );
    // }

    const updatedStatus = await kraKpaRole.findByIdAndUpdate(
      taskId,
      { $push: { completedDate: completionDate } },
      { new: true },
    );

    if (!updatedStatus) {
      // throw new CustomError(
      //   "Failed to update the status",
      //   logPath,
      //   logAction,
      //   logSourceKey
      // );
      return res.send(400).status({ message: "Failed to update the status" });
    }

    const newKraKpaTask = new kraKpaTask({
      task: taskId,
      completedBy: user,
      status: "Completed",
      completionDate,
      company,
    });

    const savedNewKraKpaTask = await newKraKpaTask.save();

    // await createLog({
    //   path: logPath,
    //   action: logAction,
    //   remarks: `${taskType}  marked completed`,
    //   status: "Success",
    //   user: user,
    //   ip: ip,
    //   company: company,
    //   sourceKey: logSourceKey,
    //   sourceId: savedNewKraKpaTask._id,
    //   changes: {
    //     status: "Completed",
    //     prevStatus: "Pending",
    //     completionDate,
    //   },
    // });

    return res.status(201).json({ message: `${taskType} marked completed` });
  } catch (error) {
    // if (error instanceof CustomError) {
    //   next(error);
    // } else {
    //   next(
    //     new CustomError(error.message, logPath, logAction, logSourceKey, 500)
    //   );
    // }
    next(error);
  }
};

const deleteTaskRecurrence = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task ID provided" });
    }

    const deletedTask = await kraKpaRole.findByIdAndUpdate(
      taskId,
      { isDeleted: true },
      { new: true },
    );

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.status(200).json({ message: "Task recurrence removed" });
  } catch (error) {
    next(error);
  }
};

const getKraKpaTasks = async (req, res, next) => {
  try {
    const { company } = req;
    const { type, dept, duration } = req.query;

    const query = { company };

    // if (!dept) {
    //   return res.status(400).json({ message: "Missing department ID" });
    // }
    if (!type) {
      return res.status(400).json({ message: "Missing task type" });
    }
    if (duration) {
      query.kpaDuration = duration;
    }

    const today = new Date();
    const startOfDay = new Date(today.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setUTCHours(23, 59, 59, 999));

    // query.department = dept;
    if (type === "INDIVIDUALKRA") {
      query.taskType = { $in: ["INDIVIDUALKRA", "TEAMKRA"] };
    } else if (type === "INDIVIDUALKPA") {
      query.taskType = { $in: ["INDIVIDUALKPA", "TEAMKPA"] };
    } else {
      query.taskType = type;
    }

    const { roles, departments: userDepts } = req;

    const isHrOrSuperAdmin =
      roles.includes("Master Admin") ||
      roles.includes("Super Admin") ||
      roles.includes("HR Admin") ||
      roles.includes("HR Employee");

    const isManager = isHrOrSuperAdmin || userDepts.includes(dept);

    const tasks = await kraKpaRole
      .find({
        ...query,
        department: dept,
        isDeleted: { $ne: true },
        completedDate: {
          $not: {
            $elemMatch: {
              $gte: startOfDay,
              $lte: endOfDay,
            },
          },
        },
      })
      .populate([
        { path: "department", select: "name" },
        { path: "assignTo", select: "firstName lastName" },
      ])
      .select("-company");

    const transformedTasks = tasks
      .filter((task) => {
        // Department KRA/KPA: Everyone in dept sees
        if (type === "KRA" || type === "KPA") {
          return task.taskType === type;
        }

        // Team KRA/KPA: Only managers see
        if (type === "TEAMKRA" || type === "TEAMKPA") {
          return task.taskType === type;
        }

        // Individual KRA/KPA: User sees own (including from Team assignments)
        if (type === "INDIVIDUALKRA" || type === "INDIVIDUALKPA") {
          const isOwnTask =
            task.assignTo?._id.toString() === req.user.toString();

          // If the task type matches exactly (Individual)
          if (task.taskType === type) {
            if (isManager) return true;
            return isOwnTask;
          }

          // If it's a Team task assigned to this user, show it in their Individual tab
          const mappedType = type === "INDIVIDUALKRA" ? "TEAMKRA" : "TEAMKPA";
          if (task.taskType === mappedType) {
            return isOwnTask;
          }
        }

        return false;
      })
      .map((task) => {
        return {
          id: task._id,
          taskName: task.task,
          dueDate: task.dueDate,
          assignedDate: task.assignedDate,
          dueTime: "6:30 PM",
          status: task.status ? task.status : "Pending",
          assignedTo: task.assignTo
            ? `${task.assignTo.firstName} ${task.assignTo.lastName}`
            : "N/A",
          assignToId: task.assignTo?._id,
        };
      });

    // const completedTasks = await kraKpaTask
    //   .find({ company, status: "Completed" })
    //   .populate([
    //     {
    //       path: "task",
    //       select: "",
    //       populate: [{ path: "department", select: "name" }],
    //     },
    //     {
    //       path: "completedBy",
    //       select: "firstName middleName lastName empId",
    //     },
    //   ])
    //   .select("-company");

    // const transformedCompletedTasks =
    //   completedTasks.length < 0
    //     ? []
    //     : completedTasks
    //         .filter((task) => {
    //           if (duration && duration !== task.task.kpaDuration) return;
    //           if (empId && task.completedBy.empId !== empId) return;

    //           return (
    //             task.task.department._id.toString() === dept &&
    //             task.task.taskType === type
    //           );
    //         })
    //         .map((task) => {
    //           const completedBy = `${task.completedBy.firstName} ${
    //             task.completedBy.middleName || ""
    //           } ${task.completedBy.lastName}`;

    //           return {
    //             id: task._id,
    //             taskName: task.task.task,
    //             completedBy: completedBy,
    //             assignedDate: task.task.assignedDate,
    //             dueDate: task.task.dueDate,
    //             dueTime: "6:30 PM",
    //             completionDate: task.completionDate
    //               ? task.completionDate
    //               : "N/A",
    //             status: task.status,
    //           };
    //         });

    // const allTasks = [...transformedTasks, ...transformedCompletedTasks];
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

    if (!dept) {
      return res.status(400).json({ message: "Missing department ID" });
    }
    if (!type) {
      return res.status(400).json({ message: "Missing task type" });
    }
    if (duration) {
      query.kpaDuration = duration;
    }

    const today = new Date();
    const startOfDay = new Date(today.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setUTCHours(23, 59, 59, 999));

    query.department = dept;
    query.taskType = type;

    // const foundUser = await UserData.findOne({ empId });

    // if (!foundUser) {
    //   return res.status(400).json({ message: "User not found" });
    // }

    const tasks = await kraKpaRole
      .find({
        ...query,
        isDeleted: { $ne: true },
        completedDate: {
          $not: {
            $elemMatch: {
              $gte: startOfDay,
              $lte: endOfDay,
            },
          },
        },
      })
      .populate([
        { path: "department", select: "name" },
        { path: "assignedBy", select: "firstName middleName lastName" },
      ])
      .select("-company");

    // const tasks = await kraKpaTask
    //   .find({
    //     company: company,
    //     task: { $in: matchingDepartments.map((dept) => dept._id) },
    //   })
    //   .populate({
    //     path: "task",
    //     populate: [
    //       { path: "department", select: "name" },
    //       { path: "assignedBy", select: "firstName middleName lastName" },
    //     ],
    //   })
    //   .populate({ path: "assignedTo", select: "firstName middleName lastName" })
    //   .select("-company")
    //   .lean();

    const transformedTasks = tasks
      .filter((task) => {
        return (
          // task.assignedTo._id.toString() === foundUser._id.toString() &&
          task.taskType === type
        );
      })
      .map((task) => {
        // const assignee = `${task.assignedTo.firstName} ${
        //   task.assignedTo.middleName || ""
        // } ${task.assignedTo.lastName}`;

        return {
          id: task._id,
          taskName: task.task,
          assignedDate: task.assignedDate,
          dueDate: task.dueDate,
          dueTime: "6:30 PM",
          // completionDate: task.completionDate ? task.completionDate : "N/A",
          status: task.status,
        };
      });

    return res.status(200).json(transformedTasks);
  } catch (error) {
    next(error);
  }
};

const getCompletedKraKpaTasks = async (req, res, next) => {
  try {
    const { company } = req;
    const { type, dept, duration, empId } = req.query;
    const { roles, departments: userDepts } = req;

    if (!dept) {
      return res.status(400).json({ message: "Missing department ID" });
    }
    if (!type) {
      return res.status(400).json({ message: "Missing task type" });
    }

    const completedTasks = await kraKpaTask
      .find({ company, status: "Completed" })
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

    const transformedCompletedTasks =
      completedTasks.length < 0
        ? []
        : completedTasks
            .filter((task) => {
              if (!task.task || task.task.isDeleted) return false;
              if (duration && duration !== task.task.kpaDuration) return;
              if (empId && task.completedBy.empId !== empId) return;
              if (task.task.department._id.toString() !== dept) return false;

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
                completionDate: task.completionDate
                  ? task.completionDate
                  : "N/A",
                status: task.status,
              };
            });

    return res.status(200).json(transformedCompletedTasks);
  } catch (error) {
    next(error);
  }
};

const getAllDeptTasks = async (req, res, next) => {
  try {
    const { roles, company, departments } = req;
    const { duration, taskType } = req.query;

    let departmentMap = new Map();
    let query = { company };

    const isHrOrSuperAdmin =
      roles.includes("Master Admin") ||
      roles.includes("Super Admin") ||
      roles.includes("HR Admin") ||
      roles.includes("HR Employee");

    if (duration) {
      query.kpaDuration = duration;
    }
    if (taskType) {
      query.taskType = taskType;
    }

    if (!isHrOrSuperAdmin) {
      query.department = { $in: departments };
    }

    const departmentFilter = { isActive: true };
    if (!isHrOrSuperAdmin) {
      departmentFilter._id = { $in: departments };
    }

    const fetchedDepartments = await Department.find(departmentFilter).lean();

    fetchedDepartments.forEach((dept) => {
      const deptId = dept._id.toString();

      departmentMap.set(deptId, {
        department: dept,
        dailyKRA: 0,
        monthlyKPA: 0,
        annualKPA: 0,
        teamDailyKRA: 0,
        teamMonthlyKPA: 0,
        individualDailyKRA: 0,
        individualMonthlyKPA: 0,
      });
    });

    const tasks = await kraKpaRole
      .find({ ...query })
      .populate([{ path: "department", select: "name" }])
      .select("-company")
      .lean();

    tasks.forEach((task) => {
      const deptId = task.department?._id?.toString() || "unknown";
      if (!departmentMap.has(deptId)) {
        departmentMap.set(deptId, {
          department: task.department || { name: "Unknown" },
          dailyKRA: 0,
          monthlyKPA: 0,
          annualKPA: 0,
          teamDailyKRA: 0,
          teamMonthlyKPA: 0,
          individualDailyKRA: 0,
          individualMonthlyKPA: 0,
        });
      }

      const department = departmentMap.get(deptId);

      if (task.taskType === "KRA") department.dailyKRA++;
      if (task.taskType === "KPA" && task.kpaDuration === "Monthly")
        department.monthlyKPA++;
      if (task.taskType === "KPA" && task.kpaDuration === "Annually")
        department.annualKPA++;
      if (task.taskType === "TEAMKRA") department.teamDailyKRA++;
      if (task.taskType === "TEAMKPA" && task.kpaDuration === "Monthly")
        department.teamMonthlyKPA++;

      if (task.taskType === "INDIVIDUALKRA" || task.taskType === "TEAMKRA") {
        department.individualDailyKRA++;
      }
      if (
        (task.taskType === "INDIVIDUALKPA" || task.taskType === "TEAMKPA") &&
        task.kpaDuration === "Monthly"
      ) {
        department.individualMonthlyKPA++;
      }
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

    const pendingTasks = await kraKpaRole.find({ company }).populate(
      { path: "department", select: "name" },
      // { path: "assignedBy", select: "firstName middleName lastName" },
    );

    const completedTasks = await kraKpaTask
      .find({
        company,
      })
      .populate({
        path: "task",
        populate: [
          { path: "department", select: "name" },
          // { path: "assignedBy", select: "firstName middleName lastName" },
        ],
      })
      .populate({
        path: "completedBy",
        select: "firstName middleName lastName",
      })
      .select("-company")
      .lean();

    const transformedByDepartment = {};

    // Step 1: Handle Completed Tasks
    completedTasks.forEach((task) => {
      if (task.task.taskType !== "KPA") return;

      const departmentName = task.task.department.name;
      const assignee = `${task.completedBy.firstName} ${
        task.completedBy.middleName || ""
      } ${task.completedBy.lastName}`.trim();

      const transformedTask = {
        taskName: task.task.task,
        assignedTo: assignee,
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

    // Step 2: Handle Pending Tasks
    pendingTasks.forEach((task) => {
      if (task.taskType !== "KPA") return;

      const departmentName = task.department.name;

      const transformedTask = {
        taskName: task.task,
        assignedTo: null, // or "Unassigned", depending on your need
        assignedDate: task.assignedDate,
        dueDate: task.dueDate,
        status: "Pending",
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
    });

    // Step 3: Final Result
    const transformedDeptTasks = Object.values(transformedByDepartment);

    return res.status(200).json(transformedDeptTasks);
  } catch (error) {
    next(error);
  }
};

const bulkInsertKraKpaTasks = async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    const file = req.file;
    const company = req.company;

    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file." });
    }

    const employees = await UserData.find({ isActive: true }).lean().exec();
    const employeeMap = new Map(employees.map((emp) => [emp.empId, emp._id]));

    const tasksToInsert = [];

    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const empId = row["Assigned By (EMP ID)"];
        const assignedBy = employeeMap.get(empId);

        tasksToInsert.push({
          task: row["Task"],
          company,
          assignedBy,
          description: row["Description"],
          taskType: row["Task Type (KPA/KRA)"],
          kpaDuration: row["KPA Duration"] || undefined,
          assignedDate: row["Assigned Date"]
            ? new Date(row["Assigned Date"])
            : null,
          dueDate: row["Due Date"] ? new Date(row["Due Date"]) : null,
          department: departmentId,
        });
      })
      .on("end", async () => {
        await kraKpaRole.insertMany(tasksToInsert);
        res.status(201).json({
          message: "Tasks inserted successfully",
          count: tasksToInsert.length,
        });
      })
      .on("error", (err) => {
        next(err);
      });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDeptBasedTask,
  getAllKpaTasks,
  getKraKpaTasks,
  getMyKraKpaTasks,
  getAllDeptTasks,
  updateTaskStatus,
  deleteTaskRecurrence,
  getCompletedKraKpaTasks,
  bulkInsertKraKpaTasks,
};
