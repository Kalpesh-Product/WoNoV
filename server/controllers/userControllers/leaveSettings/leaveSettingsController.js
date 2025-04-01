const { default: mongoose } = require("mongoose");
const UserData = require("../../../models/hr/UserData");
const CustomError = require("../../../utils/customErrorlogs");
const { createLog } = require("../../../utils/moduleLogs");

const addEmployeeLeaves = async (req, res, next) => {
  const logPath = "hr/HrLog";
  const logAction = "Add Employee Leaves";
  const logSourceKey = "employeeLeave";
  const { user, company, ip } = req;

  try {
    const { employeeId, leaves } = req.body;

    // leaves = [
    //     {
    //       leaveType:  "Privileged",
    //       count: 6
    //     },
    //   ],

    if (!employeeId || !Array.isArray(leaves)) {
      throw new CustomError(
        "Missing required fields",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const employee = await UserData.findOne({ empId: employeeId })
      .lean()
      .exec();

    const updatedLeaves = await UserData.findByIdAndUpdate(
      { _id: employee._id },
      {
        $set: { "employeeType.leavesCount": leaves },
      },
      {
        new: true,
        lean: true,
      }
    ).exec();

    if (!updatedLeaves) {
      throw new CustomError(
        "Failed to add leaves",
        logPath,
        logAction,
        logSourceKey
      );
    }

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Leaves added successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: user,
      changes: leaves,
    });

    return res.status(201).json({ message: "Leaves added successfully" });
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

module.exports = { addEmployeeLeaves };
