const UserData = require("../../models/hr/UserData");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");
const WeeklySchedule = require("../../models/WeeklySchedule");
const { default: mongoose } = require("mongoose");
const Unit = require("../../models/locations/Unit");
const Role = require("../../models/roles/Roles");

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
      schedule.substitutions[lastActiveIndex].isActive = false;
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
    const { id, department } = req.query;
    const { company } = req;

    if (!mongoose.Types.ObjectId.isValid(id)) {
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
      "employee.id": id,
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

module.exports = {
  assignWeeklyUnit,
  updateWeeklyUnit,
  addSubstitute,
  fetchWeeklyUnits,
  fetchPrimaryUnits,
  fetchTeamMembersSchedule,
};
