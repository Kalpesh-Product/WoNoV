const Leave = require("../../models/hr/Leaves");
const mongoose = require("mongoose");
const UserData = require("../../models/hr/UserData");
const { createLog } = require("../../utils/moduleLogs");
const csvParser = require("csv-parser");
const { Readable } = require("stream");
const Company = require("../../models/hr/Company");

const CustomError = require("../../utils/customErrorlogs");

const requestLeave = async (req, res, next) => {
  const logPath = "hr/HrLog";
  const logAction = "Request Leave";
  const logSourceKey = "leave";
  const { user, ip, company } = req;

  try {
    const {
      empId,
      fromDate,
      toDate,
      leaveType,
      leavePeriod,
      hours,
      description,
    } = req.body;

    if (
      !empId ||
      !fromDate ||
      !toDate ||
      !leaveType ||
      !leavePeriod ||
      !hours ||
      !description
    ) {
      throw new CustomError(
        "All fields are required",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    const currDate = new Date();

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new CustomError(
        "Invalid date format",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Ensure the leave starts in the future
    if (startDate < currDate) {
      throw new CustomError(
        "Please select future date",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const foundUser = await UserData.findOne({ empId }).populate({
      path: "company",
      select: "employeeTypes",
    });

    if (!foundUser) {
      throw new CustomError("User not found", logPath, logAction, logSourceKey);
    }

    // Check if the user has already taken leaves that exceed the granted limit
    const leaves = await Leave.find({ takenBy: foundUser._id });
    if (leaves) {
      const singleLeaves = leaves.filter(
        (leave) =>
          (leave.leavePeriod === "Single" && leave.leaveType === leaveType) ||
          leave.leaveType === "Abrupt"
      );
      const singleLeaveHours = singleLeaves.length * 9;

      const partialLeaveHours = leaves
        .filter((leave) => leave.leavePeriod === "Partial")
        .reduce((acc, leave) => acc + leave.hours, 0);

      const grantedLeaves = foundUser.employeeType.leavesCount.find((leave) => {
        return leave.leaveType.toLowerCase() === leaveType.toLowerCase();
      });

      const grantedLeaveHours = grantedLeaves ? grantedLeaves.count * 9 : 0;
      const takenLeaveHours = singleLeaveHours + partialLeaveHours;

      if (takenLeaveHours > grantedLeaveHours) {
        throw new CustomError(
          "Can't request more leaves",
          logPath,
          logAction,
          logSourceKey
        );
      }
    }

    const noOfDays = Math.abs(
      (currDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let updatedLeaveType = "";
    if (leaveType === "Privileged" && noOfDays < 7) {
      updatedLeaveType = "Abrupt";
    }

    const newLeave = new Leave({
      company,
      takenBy: foundUser._id,
      leaveType: updatedLeaveType ? updatedLeaveType : leaveType,
      fromDate,
      toDate,
      leavePeriod,
      hours,
      description,
    });

    await newLeave.save();

    // Success log with details of the leave request

    await createLog({
      path: path,
      action: logAction,
      remarks: "Leave request sent successfully",
      status: "Success",
      user,
      ip,
      company,
      sourceKey: logSourceKey,
      sourceId: newLeave._id,
      changes: {
        fromDate,
        toDate,
        leaveType: updatedLeaveType ? updatedLeaveType : leaveType,
        leavePeriod,
        hours,
        description,
        requester: foundUser._id,
      }
  })

    return res.status(201).json({ message: "Leave request sent" });
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

const fetchAllLeaves = async (req, res, next) => {
  try {
    const user = req.userData.userId;

    const leaves = await Leave.find({ takenBy: user });

    if (!leaves || leaves.length === 0) {
      return res.status(204).json({ message: "No leaves found" });
    }

    return res.status(200).json(leaves);
  } catch (error) {
    next(error);
  }
};

const fetchPastLeaves = async (req, res, next) => {
  try {
    const user = req.userData.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const leavesBeforeToday = await Leave.find({
      fromDate: { $lt: today },
      takenBy: user,
    });

    if (!leavesBeforeToday) {
      return res.status(204).json({ message: "No leaves found" });
    }

    return res.status(200).json(leavesBeforeToday);
  } catch (error) {
    next(error);
  }
};

const fetchUserLeaves = async (req, res, next) => {
  try {
    const { id } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const user = await UserData.findOne({ empId: id });
    const leaves = await Leave.find({
      takenBy: user._id,
    });

    if (!leaves) {
      return res.status(204).json({ message: "No leaves found" });
    }

    return res.status(200).json(leaves);
  } catch (error) {
    next(error);
  }
};

const approveLeave = async (req, res, next) => {
  const logPath = "hr/HrLog";
  const logAction = "Approve Leave Request";
  const logSourceKey = "leave";
  const { user, ip, company } = req;
  try {
    const leaveId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(leaveId)) {
      await createLog(
        path,
        action,
        "Invalid Leave Id provided",
        "Failed",
        user,
        ip,
        company
      );
      return res.status(400).json({ message: "Invalid Leave Id provided" });
    }

    const updatedLeave = await Leave.findOneAndUpdate(
      { _id: leaveId },
      {
        $set: { status: "Approved", approvedBy: user },
        $unset: { rejectedBy: "" },
      },
      { new: true }
    );

    if (!updatedLeave) {
      await createLog(
        path,
        action,
        "Couldn't approve the leave request",
        "Failed",
        user,
        ip,
        company
      );
      return res
        .status(400)
        .json({ message: "Couldn't approve the leave request" });
    }

    // Success log
    await createLog(
      path,
      action,
      "Leave approved successfully",
      "Success",
      user,
      ip,
      company,
      updatedLeave._id,
      {
        status: "Approved",
        approvedBy: user,
      }
    );

    return res.status(200).json({ message: "Leave Approved" });
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

const rejectLeave = async (req, res, next) => {
  const logPath = "hr/HrLog";
  const logAction = "Reject Leave Request";
  const logSourceKey = "leave";
  const { user, ip, company } = req;

  try {
    const leaveId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(leaveId)) {
      await createLog(
        path,
        action,
        "Invalid Leave Id provided",
        "Failed",
        user,
        ip,
        company
      );
      return res.status(400).json({ message: "Invalid Leave Id provided" });
    }

    const updatedLeave = await Leave.findOneAndUpdate(
      { _id: leaveId },
      {
        $set: { status: "Rejected", rejectedBy: user },
        $unset: { approvedBy: "" },
      },
      { new: true }
    );

    if (!updatedLeave) {
      await createLog(
        path,
        action,
        "No such leave exists",
        "Failed",
        user,
        ip,
        company
      );
      return res.status(400).json({ message: "No such leave exists" });
    }

    await createLog(
      path,
      action,
      "Leave rejected successfully",
      "Success",
      user,
      ip,
      company,
      updatedLeave._id,
      {
        status: "Rejected",
        rejectedBy: user,
      }
    );
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Leave rejected successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: updatedLeave._id,
      changes: { status: "Rejected", rejectedBy: user },
    });

    return res.status(200).json({ message: "Leave rejected" });
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

const bulkInsertLeaves = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res
        .status(400)
        .json({ message: "Please provide a valid CSV file" });
    }

    const { company } = req;
    const foundCompany = await Company.findById(company).lean();
    if (!foundCompany) {
      return res.status(400).json({ message: "No such company is registered" });
    }

    const users = await UserData.find({ company }).lean();
    const usersMap = new Map(users.map((user) => [user.empId, user._id]));

    const leaves = [];
    const stream = Readable.from(file.buffer.toString("utf-8")).pipe(
      csvParser()
    );

    stream.on("data", (row) => {
      const takenById = usersMap.get(row["takenBy(emp ID)"]);
      const approvedById = row["approvedBy (Emp ID)"]
        ? usersMap.get(row["approvedBy (Emp ID)"])
        : null;
      const rejectedById = row["rejectedBy (Emp ID)"]
        ? usersMap.get(row["rejectedBy (Emp ID)"])
        : null;

      if (takenById) {
        leaves.push({
          company: company,
          takenBy: takenById,
          fromDate: new Date(row["fromDate"]),
          toDate: new Date(row["toDate"]),
          leaveType: row["leaveType"],
          leavePeriod: row["leavePeriod"],
          hours: Number(row["hours"]),
          description: row["description"],
          status: row["status"] || "Pending",
          approvedBy: approvedById,
          rejectedBy: rejectedById,
        });
      }
    });

    stream.on("end", async () => {
      if (leaves.length > 0) {
        await Leave.insertMany(leaves);
        res.status(201).json({
          message: "Leaves inserted successfully",
          count: leaves.length,
        });
      } else {
        res.status(400).json({ message: "No valid leave records found" });
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestLeave,
  fetchAllLeaves,
  fetchPastLeaves,
  fetchUserLeaves,
  approveLeave,
  rejectLeave,
  bulkInsertLeaves,
};
