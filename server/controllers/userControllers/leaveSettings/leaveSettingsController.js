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

    if (!employeeId || !Array.isArray(leaves) || leaves.length === 0) {
      throw new CustomError(
        "Missing required fields",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const normalizeManagedLeaveType = (value) => {
      const normalized = String(value || "").trim().toLowerCase();
      if (["privileged", "priviledged"].includes(normalized)) {
        return "Privileged";
      }
      if (normalized === "sick") return "Sick";
      return "";
    };
    const normalizedLeaves = leaves.map((leave) => ({
      leaveType: normalizeManagedLeaveType(leave?.leaveType),
      count: Number(leave?.count),
    }));

    const hasInvalidLeave = normalizedLeaves.some(
      (leave) =>
        !leave.leaveType ||
        !Number.isFinite(leave.count) ||
        leave.count < 0,
    );

    if (hasInvalidLeave) {
      throw new CustomError(
        "Sick and Privileged leave counts must be valid non-negative numbers",
        logPath,
        logAction,
        logSourceKey,
        400,
      );
    }

    const employee = await UserData.findOne({ empId: employeeId, company })
      .select("employeeType.leavesCount")
      .lean()
      .exec();

    if (!employee) {
      throw new CustomError(
        "Employee not found",
        logPath,
        logAction,
        logSourceKey,
        404,
      );
    }

    const updatedTypes = new Set(
      normalizedLeaves.map((leave) => leave.leaveType.toLowerCase()),
    );
    const preservedLeaves = (employee.employeeType?.leavesCount || []).filter(
      (leave) =>
        !updatedTypes.has(
          normalizeManagedLeaveType(leave?.leaveType).toLowerCase(),
        ),
    );
    const updatedLeaveCounts = [...preservedLeaves, ...normalizedLeaves];

    const updatedLeaves = await UserData.findByIdAndUpdate(
      { _id: employee._id },
      {
        $set: { "employeeType.leavesCount": updatedLeaveCounts },
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
      changes: updatedLeaveCounts,
    });

    return res.status(200).json({
      message: "Leave counts updated successfully",
      leavesCount: updatedLeaves.employeeType?.leavesCount || [],
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

module.exports = { addEmployeeLeaves };
