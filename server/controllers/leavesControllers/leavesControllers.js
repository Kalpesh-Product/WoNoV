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

    //Check the leave period and no. of leaves taken are correct
    // const isSameDay = endDate.getDate() === startDate.getDate();

    // if (!isSameDay && hours < workingHours) {
    //   throw new CustomError(
    //     "Selected date and hours is inappropriate",
    //     logPath,
    //     logAction,
    //     logSourceKey
    //   );
    // }

    const workingHours = 9;
    const period =
      Number(hours) < Number(workingHours)
        ? "Partial"
        : Number(hours) === Number(workingHours)
        ? "Single"
        : "Multiple";

    if (leavePeriod !== period) {
      throw new CustomError(
        "Leave period and number of hours doesn't match",
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
      const singleLeaves = leaves.filter((leave) => {
        return leave.leavePeriod === "Single" && leave.leaveType === leaveType;
      });
      const singleLeaveHours = singleLeaves.length * 9;

      const partialLeaveHours = leaves
        .filter((leave) => {
          return (
            leave.leavePeriod === "Partial" && leave.leaveType === leaveType
          );
        })
        .reduce((acc, leave) => acc + leave.hours, 0);

      const multipleLeaveHours = leaves
        .filter(
          (leave) =>
            leave.leavePeriod === "Multiple" && leave.leaveType === leaveType
        )
        .reduce((acc, leave) => acc + leave.hours, 0);

      const abruptLeaveHours = leaves
        .filter((leave) => leave.leaveType === "Abrupt")
        .reduce((acc, leave) => acc + leave.hours, 0);

      const grantedLeaves = foundUser.employeeType.leavesCount.find((leave) => {
        return leave.leaveType.toLowerCase() === leaveType.toLowerCase();
      });

      // Calculated the number of leaves by no of working hours
      const grantedLeaveHours = grantedLeaves ? grantedLeaves.count * 9 : 0;
      let takenLeaveHours =
        singleLeaveHours + partialLeaveHours + multipleLeaveHours;

      if (leaveType === "Privileged") {
        takenLeaveHours += abruptLeaveHours;
      }

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
      addedBy: user,
      takenBy: foundUser._id,
      leaveType: updatedLeaveType ? updatedLeaveType : leaveType,
      fromDate,
      toDate,
      leavePeriod,
      hours,
      description,
    });

    await newLeave.save();

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
    const leaves = await Leave.find()
      .populate([
        { path: "addedBy", select: "firstName lastName" },
        { path: "takenBy", select: "firstName lastName" },
        { path: "approvedBy", select: "firstName lastName" },
        { path: "rejectedBy", select: "firstName lastName" },
      ])
      .lean()
      .exec();

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
    }).populate([
      { path: "addedBy", select: "firstName lastName" },
      { path: "takenBy", select: "firstName lastName" },
      { path: "approvedBy", select: "firstName lastName" },
      { path: "rejectedBy", select: "firstName lastName" },
    ]);

    if (!leaves) {
      return res.status(204).json({ message: "No leaves found" });
    }

    const allocatedPrivilegedLeaves = user.employeeType.leavesCount.reduce(
      (acc, leave) =>
        leave.leaveType === "Privileged" ? acc + leave.count : acc,
      0
    );

    const allocatedSickLeaves = user.employeeType.leavesCount.reduce(
      (acc, leave) => (leave.leaveType === "Sick" ? acc + leave.count : acc),
      0
    );

    const privilegedLeaveHours = leaves
      .filter((leave) => leave.leaveType === "Privileged Leave")
      .reduce((acc, leave) => acc + leave.hours, 0);

    const sickLeaveHours = leaves
      .filter((leave) => leave.leaveType === "Sick Leave")
      .reduce((acc, leave) => acc + leave.hours, 0);

    // const abruptLeaveHours = leaves
    //   .filter((leave) => leave.leaveType === "Abrupt Leave")
    //   .reduce((acc, leave) => acc + leave.hours, 0);

    const workingHours = 9;

    const takenPrivilegedLeaves = Number(
      (privilegedLeaveHours / workingHours).toFixed(2)
    );

    const takenSickLeaves = Number((sickLeaveHours / workingHours).toFixed(2));

    const leavesCount = {
      allocatedPrivilegedLeaves,
      allocatedSickLeaves,
      takenPrivilegedLeaves,
      takenSickLeaves,
    };

    // const transformedLeaves = { leaves };

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
      throw new CustomError(
        "Invalid Leave Id provided",
        logPath,
        logAction,
        logSourceKey
      );
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
      throw new CustomError(
        "Failed to approve the leave request",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // await createLog({
    //   path: logPath,
    //   action: logAction,
    //   remarks: "Leave approved successfully",
    //   status: "Success",
    //   user,
    //   ip,
    //   company,
    //   sourceKey: logSourceKey,
    //   sourceId: leaveId,
    //   changes: {
    //     status: "Approved",
    //     approvedBy: user,
    //   },
    // });

    return res.status(200).json({ message: "Leave request Approved" });
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
      throw new CustomError(
        "Invalid Leave Id provided",
        logPath,
        logAction,
        logSourceKey
      );
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
      throw new CustomError(
        "Failed to reject leave request",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // await createLog({
    //   path: logPath,
    //   action: logAction,
    //   remarks: "Leave rejected successfully",
    //   status: "Success",
    //   user,
    //   ip,
    //   company,
    //   sourceKey: logSourceKey,
    //   sourceId: leaveId,
    //   changes: {
    //     status: "Rejected",
    //     approvedBy: user,
    //   },
    // });

    return res.status(200).json({ message: "Leave request rejected" });
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
