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
    const { task, taskType, department, dueDate, assignedDate, kpaDuration } =
      req.body;

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

    if (currDate === parsedDueDate && taskType !== "KRA") {
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

    const newRoleKraKpa = new kraKpaRole({
      task,
      assignedBy: user,
      department,
      assignedDate: parsedAssignedDate,
      dueDate: taskType === "KRA" ? currDate : parsedDueDate,
      dueTime,
      taskType,
      kpaDuration,
      company,
    });

    const savedNewRoleKraKpa = await newRoleKraKpa.save();

    // * Emit notification event for kra/kpa creation *

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
      data: savedNewRoleKraKpa,
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
      { new: true }
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
    query.taskType = type;

    const tasks = await kraKpaRole
      .find({
        ...query,
        department: dept,
        completedDate: {
          $not: {
            $elemMatch: {
              $gte: startOfDay,
              $lte: endOfDay,
            },
          },
        },
      })
      .populate([{ path: "department", select: "name" }])
      .select("-company");

    const transformedTasks = tasks
      .filter((task) => {
        return task.taskType === type;
      })
      .map((task) => {
        return {
          id: task._id,
          taskName: task.task,
          dueDate: task.dueDate,
          assignedDate: task.assignedDate,
          dueTime: "6:30 PM",
          status: task.status ? task.status : "Pending",
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
          populate: [{ path: "department", select: "name" }],
        },
        {
          path: "completedBy",
          select: "firstName middleName lastName empId",
        },
      ])
      .select("-company");

    const transformedCompletedTasks =
      completedTasks.length < 0
        ? []
        : completedTasks
            .filter((task) => {
              if (duration && duration !== task.task.kpaDuration) return;
              if (empId && task.completedBy.empId !== empId) return;

              return (
                task.task.department._id.toString() === dept &&
                task.task.taskType === type
              );
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

    if (duration) {
      query.kpaDuration = duration;
    }
    if (taskType) {
      query.taskType = taskType;
    }

    if (
      !roles.includes("Master Admin") &&
      !roles.includes("Super Admin") &&
      !roles.includes("HR Admin") &&
      !roles.includes("HR Employee")
    ) {
      query.department = { $in: departments };
    }

    const tasks = await kraKpaRole
      .find({ ...query })
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

    const pendingTasks = await kraKpaRole.find({ company }).populate(
      { path: "department", select: "name" }
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
  getCompletedKraKpaTasks,
  bulkInsertKraKpaTasks,
};
