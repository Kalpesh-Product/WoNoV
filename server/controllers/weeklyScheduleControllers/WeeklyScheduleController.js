const UserData = require("../../models/hr/UserData");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");
const WeeklySchedule = require("../../models/WeeklySchedule");
const { default: mongoose } = require("mongoose");
const Unit = require("../../models/locations/Unit");
const { Readable } = require("stream");
const csvParser = require("csv-parser");

const assignWeeklyUnit = async (req, res, next) => {
  const logPath = "administration/AdministrationLog";
  const logAction = "Assign Weekly Unit";
  const logSourceKey = "weeklySchedule";
  try {
    const { startDate, endDate, location, employee, department } = req.body;

    const { company, user, ip } = req;

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (!startDate || !endDate || !location || !employee) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (isNaN(startDateObj.getDate()) || isNaN(endDateObj.getDate())) {
      throw new CustomError(
        "Invalid date format",
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
    if (!mongoose.Types.ObjectId.isValid(location)) {
      throw new CustomError(
        "Invalid location ID provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const foundUser = await UserData.findOne({ _id: employee }).lean().exec();

    if (!foundUser) {
      throw new CustomError("User not found", logPath, logAction, logSourceKey);
    }

    const foundUnit = await Unit.findById({ _id: location });

    if (!foundUnit) {
      throw new CustomError("Unit not found", logPath, logAction, logSourceKey);
    }

    // const isAlreadyAssigned = await WeeklySchedule.findOne({
    //   "employee.id": foundUser._id,
    //   startDate: { $lte: endDate },
    //   endDate: { $gte: startDate },
    // })
    //   .lean()
    //   .exec();

    // if (isAlreadyAssigned) {
    //   return res.status(400).json({
    //     message: "Employee is already assigned to this location",
    //   });
    // }

    // Create a new WeeklyUnit document
    const newAssignedUnit = new WeeklySchedule({
      startDate: startDateObj,
      endDate: endDateObj,
      location,
      employee: {
        id: foundUser._id,
      },
      department,
      company,
    });

    const savedAssignedUnit = await newAssignedUnit.save();

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Weekly Unit Assigned Successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: savedAssignedUnit._id,
      changes: newAssignedUnit,
    });

    res.status(201).json({
      message: "Weekly unit assigned successfully",
      data: newAssignedUnit,
    });
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError(error.message, logPath, logAction, logSourceKey, 500)
    );
  }
};

const updateWeeklyUnit = async (req, res, next) => {
  const logPath = "administration/AdministrationLog";
  const logAction = "Update Weekly Unit";
  const logSourceKey = "weeklySchedule";

  try {
    const { weeklyScheduleId, startDate, endDate, location, employee } =
      req.body;
    const { company, user, ip } = req;

    if (!weeklyScheduleId || !startDate || !endDate || !location || !employee) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!mongoose.Types.ObjectId.isValid(weeklyScheduleId)) {
      throw new CustomError(
        "Invalid weeklySchedule ID provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const updatedSchedule = await WeeklySchedule.findByIdAndUpdate(
      {
        _id: weeklyScheduleId,
      },
      {
        $set: {
          "employee.isActive": false,
          "employee.isReAssigned": true,
        },
      },
      { new: true }
    );

    if (!updatedSchedule) {
      throw new CustomError(
        "Failed to update the weekly schedule",
        logPath,
        logAction,
        logSourceKey
      );
    }

    await updatedSchedule.save();

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (!startDateObj || !endDateObj || !location || !employee) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (isNaN(startDateObj.getDate()) || isNaN(endDateObj.getDate())) {
      throw new CustomError(
        "Invalid date format",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!mongoose.Types.ObjectId.isValid(location)) {
      throw new CustomError(
        "Invalid location ID provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const foundUser = await UserData.findOne({ empId: employee });

    if (!foundUser) {
      throw new CustomError("User not found", logPath, logAction, logSourceKey);
    }

    const foundUnit = await Unit.findById({ _id: location });

    if (!foundUnit) {
      throw new CustomError("Unit not found", logPath, logAction, logSourceKey);
    }

    const newAssignedUnit = new WeeklySchedule({
      startDate: startDateObj,
      endDate: endDateObj,
      location,
      employee: {
        id: foundUser._id,
      },
      company,
    });

    await newAssignedUnit.save();

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Substitute added to Weekly Unit",
      status: "Success",
      user,
      ip,
      company,
      sourceKey: logSourceKey,
      sourceId: updatedSchedule._id,
      changes: {
        oldSchedule: {
          name: `${updatedSchedule.employee.id.firstName} ${updatedSchedule.employee.id.lastName}`,
          isActive: false,
          isReassigned: true,
        },
        newSchedule: newAssignedUnit,
      },
    });

    res.status(200).json({
      message: "Weekly unit updated successfully",
      data: newAssignedUnit,
    });
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError(error.message, logPath, logAction, logSourceKey, 500)
    );
  }
};

const addSubstitute = async (req, res, next) => {
  const logPath = "administration/AdministrationLog";
  const logAction = "Add Substitution";
  const logSourceKey = "weeklySchedule";

  try {
    const { weeklyScheduleId, substitute, fromDate, toDate } = req.body;
    const { company, user, ip } = req;

    if (!substitute || !fromDate || !toDate) {
      return res.status(400).json({ message: "Missing substitution fields" });
    }

    const schedule = await WeeklySchedule.findOne({
      _id: weeklyScheduleId,
      company,
    });
    if (!schedule) {
      throw new CustomError(
        "Weekly unit not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    schedule.employee.isActive = false;

    const lastActiveIndex = schedule.substitutions.findLastIndex(
      (sub) => sub.isActive
    );
    if (lastActiveIndex !== -1) {
      // const substitute = schedule.substitutions[lastActiveIndex];
      // substitute.endDate = parsedFromDate;

      // if (
      //   substitute.fromDate.getTime() === parsedFromDate.getTime() &&
      //   substitute.toDate.getTime() === parsedToDate.getTime()
      // ) {
      //   substitute.isActive = false;
      // }

      const parsedFromDate = new Date(fromDate);
      const parsedToDate = new Date(toDate);

      // Deactivate or modify existing active substitutions that overlap
      schedule.substitutions.forEach((sub) => {
        if (sub.isActive) {
          const subFrom = new Date(sub.fromDate);
          const subTo = new Date(sub.toDate);

          const isExactMatch =
            subFrom.getTime() === parsedFromDate.getTime() &&
            subTo.getTime() === parsedToDate.getTime();

          const isOverlap = parsedFromDate <= subTo && parsedToDate >= subFrom; // checks overlap

          if (isExactMatch) {
            sub.isActive = false;
          } else if (isOverlap) {
            const subEndBeforeNew = new Date(parsedFromDate);
            subEndBeforeNew.setDate(subEndBeforeNew.getDate() - 1);

            const subStartAfterNew = new Date(parsedToDate);
            subStartAfterNew.setDate(subStartAfterNew.getDate() + 1);

            const originalSubTo = new Date(sub.toDate); // backup original end

            // Case: overlap in middle → split into two entries
            if (sub.fromDate < parsedFromDate && originalSubTo > parsedToDate) {
              // Modify current to be first half
              sub.toDate = subEndBeforeNew;

              // Push second half as a new substitution
              schedule.substitutions.push({
                substitute: sub.substitute,
                fromDate: subStartAfterNew,
                toDate: originalSubTo,
                isActive: true,
              });
            } else {
              // Simple overlap: just trim the date range
              if (sub.fromDate < parsedFromDate) {
                sub.toDate = subEndBeforeNew;
              } else if (sub.toDate > parsedToDate) {
                sub.fromDate = subStartAfterNew;
              } else {
                sub.isActive = false;
              }
            }
          }
        }
      });
    }

    schedule.substitutions.push({
      substitute,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      isActive: true,
    });

    await schedule.save();

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Substitute added to Weekly Unit",
      status: "Success",
      user,
      ip,
      company,
      sourceKey: logSourceKey,
      sourceId: schedule._id,
      changes: { substitute, fromDate, toDate },
    });

    res.status(200).json({
      message: "Substitute added successfully",
      data: schedule,
    });
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError(error.message, logPath, logAction, logSourceKey, 500)
    );
  }
};

const fetchWeeklyUnits = async (req, res, next) => {
  try {
    const { department } = req.params;
    const { company } = req;

    const foundUsers = await UserData.find({
      departments: { $in: [department] },
    })
      .populate([
        {
          path: "role",
          select: "roleTitle",
        },
        { path: "departments", select: "name" },
      ])
      .select("firstName middleName lastName");

    if (foundUsers.length < 0) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const foundManager = foundUsers.find((user) => {
      const foundDepartment = user.departments.find((dept) => {
        return dept._id.toString() === department.toString();
      });

      const userRole = user.role.find((role) => {
        return (
          role.roleTitle.startsWith(
            foundDepartment ? foundDepartment.name : ""
          ) && role.roleTitle.endsWith("Admin")
        );
      });
      return userRole;
    });

    let manager = "N/A";
    if (foundManager) {
      manager = `${foundManager.firstName} ${foundManager.lastName}`;
    }

    const weeklySchedules = await WeeklySchedule.find({ company, department })
      .populate("employee.id", "firstName lastName")
      .populate("substitutions.substitute", "firstName lastName")
      .populate({
        path: "location",
        select: "unitName unitNo",
        populate: [
          { path: "building", select: "buildingName" },
          {
            path: "adminLead",
            select: "firstName middleName lastName departments",
            populate: { path: "departments", select: "name" },
          },
          {
            path: "maintenanceLead",
            select: "firstName middleName lastName departments",
            populate: { path: "departments", select: "name" },
          },
          {
            path: "itLead",
            select: "firstName middleName lastName departments",
            populate: { path: "departments", select: "name" },
          },
        ],
      });

    const transformedData = weeklySchedules.map((schedule) => ({
      ...schedule._doc,
      manager,
    }));

    res.status(200).json(transformedData);
  } catch (error) {
    next(error);
  }
};

const fetchTeamMembersSchedule = async (req, res, next) => {
  try {
    const { unitId, department } = req.query;
    const { company } = req;

    if (!mongoose.Types.ObjectId.isValid(unitId)) {
      return res.status(400).json({ message: "Invalid user Id provided" });
    }

    const foundUsers = await UserData.find({
      departments: { $in: [department] },
      isActive: true,
    })
      .populate([
        {
          path: "role",
          select: "roleTitle",
        },
        { path: "departments", select: "name" },
      ])
      .select("firstName middleName lastName");

    if (foundUsers.length < 0) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const foundManager = foundUsers.find((user) => {
      const foundDepartment = user.departments.find((dept) => {
        return dept._id.toString() === department.toString();
      });

      const userRole = user.role.find((role) => {
        return (
          role.roleTitle.startsWith(
            foundDepartment ? foundDepartment.name : ""
          ) && role.roleTitle.endsWith("Admin")
        );
      });
      return userRole;
    });

    let manager = "N/A";
    if (foundManager) {
      manager = `${foundManager.firstName} ${foundManager.lastName}`;
    }

    const weeklySchedules = await WeeklySchedule.find({
      company,
      location: unitId,
      department,
    })
      .populate({
        path: "employee.id",
        select: "firstName lastName departments",
        populate: { path: "departments" },
      })
      .populate("substitutions.substitute", "firstName lastName")
      .populate({
        path: "location",
        select: "unitName unitNo",
        populate: [
          { path: "building", select: "buildingName" },
          {
            path: "adminLead",
            select: "firstName middleName lastName departments",
            populate: { path: "departments", select: "name" },
          },
          {
            path: "maintenanceLead",
            select: "firstName middleName lastName departments",
            populate: { path: "departments", select: "name" },
          },
          {
            path: "itLead",
            select: "firstName middleName lastName departments",
            populate: { path: "departments", select: "name" },
          },
        ],
      });

    const transformedData = weeklySchedules.map((schedule) => ({
      ...schedule._doc,
      manager,
    }));

    res.status(200).json(transformedData);
  } catch (error) {
    next(error);
  }
};

const fetchPrimaryUnits = async (req, res, next) => {
  try {
    const { id, name } = req.query;
    const { company } = req;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ message: "Invalid department Id provided" });
    }
    const foundUsers = await UserData.find({
      departments: { $in: [id] },
      isActive: true,
    })
      .populate([
        {
          path: "role",
          select: "roleTitle",
        },
        { path: "departments", select: "name" },
      ])
      .select("firstName middleName lastName");

    if (foundUsers.length < 0) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const units = await Unit.find({ company })
      .populate([
        {
          path: "adminLead",
          select: "firstName middleName lastName departments",
          populate: { path: "departments", select: "name" },
        },
        {
          path: "maintenanceLead",
          select: "firstName middleName lastName departments",
          populate: { path: "departments", select: "name" },
        },
        {
          path: "itLead",
          select: "firstName middleName lastName departments",
          populate: { path: "departments", select: "name" },
        },
      ])
      .select("unitNo unitName building isActive");

    if (!units) {
      return res.status(400).json({ message: "Units not found" });
    }

    const foundManager = foundUsers.find((user) => {
      const foundDepartment = user.departments.find((dept) => {
        return dept.name === name;
      });

      const userRole = user.role.find((role) => {
        return (
          role.roleTitle.startsWith(
            foundDepartment ? foundDepartment.name : ""
          ) && role.roleTitle.endsWith("Admin")
        );
      });
      return userRole;
    });

    let manager = "N/A";
    if (foundManager) {
      manager = `${foundManager.firstName} ${foundManager.lastName}`;
    }

    const filteredUsers = foundUsers.map((user) => {
      const dept =
        name === "Administration"
          ? "adminLead"
          : name === "Maintenance"
          ? "maintenanceLead"
          : name === "IT"
          ? "itLead"
          : "";

      const primaryUnit = units.find((unit) => {
        return unit[dept] && unit[dept]._id.toString() === user._id.toString();
      });

      return {
        ...user._doc,
        primaryUnit: primaryUnit ? primaryUnit : {},
        manager,
      };
    });

    const transformedData = units.map((unit) => ({
      ...unit._doc,
      manager,
    }));

    res.status(200).json(filteredUsers);
  } catch (error) {
    next(error);
  }
};

const bulkInsertWeeklyShiftSchedule = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ message: "Please upload a valid CSV file" });
    }

    const { departmentId } = req.params;

    // Fetch required mappings
    const [employees, units] = await Promise.all([
      UserData.find({ isActive: true }).lean(),
      Unit.find({ isActive: true }).lean(),
    ]);

    const employeeMap = new Map(employees.map((emp) => [emp.empId, emp._id]));
    const unitMap = new Map(units.map((unit) => [unit.unitNo, unit._id]));

    const rows = [];
    const stream = Readable.from(file.buffer.toString("utf-8").trim());

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        rows.push(row);
      })
      .on("end", async () => {
        const bulkData = [];

        for (const row of rows) {
          const startDate = new Date(row["Start Date"]);
          const endDate = new Date(row["End Date"]);
          const locationId = unitMap.get(row["Location"]);

          const empId = row["Employee ID"];
          const employeeId = employeeMap.get(empId);

          if (
            !locationId ||
            !employeeId ||
            isNaN(startDate) ||
            isNaN(endDate)
          ) {
            console.warn(`Skipping invalid row: ${JSON.stringify(row)}`);
            continue;
          }

          const isActive = row["Employee Is Active"]?.toLowerCase() === "true";
          const isReassigned =
            row["Employee Is Reassigned"]?.toLowerCase() === "true";

          const substitutions = Object.entries(row)
            .filter(
              ([key, value], index) =>
                key.startsWith("Substitutions") &&
                value &&
                employeeMap.has(value)
            )
            .map(([_, subEmpId]) => ({
              substitute: employeeMap.get(subEmpId),
              isActive: true,
            }));

          bulkData.push({
            company: req.company,
            department: departmentId,
            startDate,
            endDate,
            location: locationId,
            employee: {
              id: employeeId,
              isActive,
              isReassigned,
            },
            substitutions,
          });
        }

        if (bulkData.length === 0) {
          return res
            .status(400)
            .json({ message: "No valid records to insert" });
        }

        await WeeklySchedule.insertMany(bulkData);
        res.status(200).json({
          message: "Shift schedules inserted",
          count: bulkData.length,
        });
      })
      .on("error", (error) => {
        console.error("CSV Parsing Error:", error);
        next(error);
      });
  } catch (error) {
    console.error("Bulk Insert Error:", error);
    next(error);
  }
};

module.exports = {
  assignWeeklyUnit,
  updateWeeklyUnit,
  addSubstitute,
  fetchWeeklyUnits,
  fetchPrimaryUnits,
  fetchTeamMembersSchedule,
  bulkInsertWeeklyShiftSchedule,
};
