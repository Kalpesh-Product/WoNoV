const UserData = require("../../models/hr/UserData");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");
const WeeklySchedule = require("../../models/administration/WeeklySchedule");
const { default: mongoose } = require("mongoose");
const Unit = require("../../models/locations/Unit");

const assignWeeklyUnit = async (req, res, next) => {
  const logPath = "administration/AdministrationLog";
  const logAction = "Assign Weekly Unit";
  const logSourceKey = "weeklySchedule";
  try {
    const { startDate, endDate, location, employee } = req.body;

    const { company, user, ip } = req;

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
  const logAction = "Update Weekly Unit Substitution";
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
    const { company } = req;

    const data = await WeeklySchedule.find({ company })
      .populate("employee.id", "firstName lastName")
      .populate("substitutions.substitute", "firstName lastName")
      .populate({
        path: "location",
        select: "unitName",
        populate: { path: "building", select: "buildingName" },
      });

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

module.exports = { assignWeeklyUnit, updateWeeklyUnit, fetchWeeklyUnits };
