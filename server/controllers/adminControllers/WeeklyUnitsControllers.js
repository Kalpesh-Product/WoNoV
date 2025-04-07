const UserData = require("../../models/hr/UserData");
const CustomError = require("../../utils/customErrorlogs");
const { createLog } = require("../../utils/moduleLogs");
const WeeklyUnit = require("../models/WeeklyUnit"); // adjust path as needed

// Assign a weekly unit
const assignWeeklyUnit = async (req, res) => {
  const logPath = "admin/AdminLog";
  const logAction = "Assign Weekly Unit";
  const logSourceKey = "weeklyUnit";
  try {
    const { startDate, endDate, location, employee, substitutions } = req.body;

    const { company, user, ip } = req;
    // Basic validation
    if (!startDate || !endDate || !location || !employee) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (mongoose.Types.ObjectId.isValid(location)) {
      throw new CustomError(
        "Invalid location ID provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (mongoose.Types.ObjectId.isValid(employee)) {
      throw new CustomError(
        "Invalid employee ID provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const foundUser = await UserData.findById({ empId: employee });

    if (!foundUser) {
      throw new CustomError("User not found", logPath, logAction, logSourceKey);
    }

    // Create a new WeeklyUnit document
    const newAssignedUnit = new WeeklyUnit({
      startDate,
      endDate,
      location,
      employee: {
        empID: employee,
      },
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
      data: newAssignment,
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

module.exports = { assignWeeklyUnit };
