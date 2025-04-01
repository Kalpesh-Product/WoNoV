const Attendance = require("../models/hr/Attendance");
const UserData = require("../models/hr/UserData");
const mongoose = require("mongoose");
const {
  formatDate,
  formatTime,
  formatWithOrdinal,
} = require("../utils/formatDateTime");
const { createLog } = require("../utils/moduleLogs");
const CustomError = require("../utils/customErrorlogs");
const { Readable } = require("stream");
const csvParser = require("csv-parser");

const clockIn = async (req, res, next) => {
  const { user, ip, company } = req;
  const { inTime, entryType } = req.body;
  const logPath = "hr/HrLog";
  const logAction = "Clock In";
  const logSourceKey = "attendance";

  try {
    if (!inTime || !entryType) {
      throw new CustomError(
        "All fields are required",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const clockInTime = new Date(inTime);
    const currDate = new Date();

    if (clockInTime.getDate() !== currDate.getDate()) {
      throw new CustomError(
        "Please select present date",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (isNaN(clockInTime.getTime())) {
      throw new CustomError(
        "Invalid date format",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Check if the user has already clocked in today
    const attendances = await Attendance.find({ user: user._id });
    const todayClockInExists = attendances.some((attendance) => {
      const attendanceTime = new Date(attendance.inTime);
      return attendanceTime.getDate() === clockInTime.getDate();
    });

    // if (todayClockInExists) {
    //   throw new CustomError(
    //     "Cannot clock in for the day again",
    //     logPath,
    //     logAction,
    //     logSourceKey
    //   );
    // }

    const newAttendance = new Attendance({
      inTime: clockInTime,
      entryType,
      user: user,
      company,
    });

    const savedAttendance = await newAttendance.save();

    // Log the successful clock-in
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Clock in successful",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: newAttendance._id,
      changes: {
        inTime: clockInTime,
        entryType,
      },
    });

    return res.status(201).json({ message: "You clocked in" });
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

const clockOut = async (req, res, next) => {
  const { user, ip, company } = req;
  const { outTime } = req.body;
  const logPath = "hr/HrLog";
  const logAction = "Clock Out";
  const logSourceKey = "attendance";

  try {
    if (!outTime) {
      throw new CustomError(
        "All fields are required",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const clockOutTime = new Date(outTime);
    if (isNaN(clockOutTime.getTime())) {
      throw new CustomError(
        "Invalid date format",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Retrieve the latest attendance record for the user
    const attendance = await Attendance.findOne({ user }).sort({
      createdAt: -1,
    });
    if (!attendance) {
      throw new CustomError(
        "No attendance record exists",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (attendance.outTime) {
      throw new CustomError(
        "Already clocked out",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Update the attendance record with outTime
    attendance.outTime = clockOutTime;
    await attendance.save();

    // Log the successful clock out
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Clock out successful",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: attendance._id,
      changes: {
        inTime: attendance.inTime,
        outTime: clockOutTime,
      },
    });

    return res.status(200).json({ message: "You clocked out" });
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

const startBreak = async (req, res, next) => {
  const logPath = "AttendanceLogs";
  const logAction = "Start Break";
  const logSourceKey = "attendance";
  const { startBreak } = req.body;
  const loggedInUser = req.user;
  const ip = req.ip;
  const company = req.company;

  try {
    if (!startBreak) {
      throw new CustomError(
        "All fields are required",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const startBreakTime = new Date(startBreak);
    if (isNaN(startBreakTime.getTime())) {
      throw new CustomError(
        "Invalid date format",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Retrieve the latest attendance record for the user
    const attendance = await Attendance.findOne({
      user: loggedInUser._id,
    }).sort({ createdAt: -1 });
    if (!attendance) {
      throw new CustomError(
        "No clock in record exists",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (attendance.breakCount === 2) {
      throw new CustomError(
        "Only 2 breaks allowed",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const updatedAttendance = await Attendance.findByIdAndUpdate(
      attendance._id,
      {
        startBreak: startBreakTime,
        endBreak: null,
        breakCount: attendance.breakCount + 1,
      },
      { new: true }
    );

    if (!updatedAttendance) {
      throw new CustomError(
        "No clock in record exists",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Log the successful break start
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Break started successfully",
      status: "Success",
      user: loggedInUser,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: updatedAttendance._id,
      changes: {
        startBreak: startBreakTime,
        breakCount: updatedAttendance.breakCount,
      },
    });

    return res.status(200).json({ message: "Break started" });
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

const endBreak = async (req, res, next) => {
  const { user, ip, company } = req;
  const { endBreak } = req.body;
  const logPath = "hr/HrLog";
  const logAction = "End Break";
  const logSourceKey = "attendance";

  try {
    if (!endBreak) {
      throw new CustomError(
        "All fields are required",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const endBreakTime = new Date(endBreak);
    if (isNaN(endBreakTime.getTime())) {
      throw new CustomError(
        "Invalid date format",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Retrieve the latest attendance record for the user
    const attendance = await Attendance.findOne({ user: user._id }).sort({
      createdAt: -1,
    });
    if (!attendance) {
      throw new CustomError(
        "No clock in record exists",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!attendance.startBreak) {
      throw new CustomError(
        "No break record found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const startBreakTime = new Date(attendance.startBreak);
    const breakDuration =
      (endBreakTime - startBreakTime) / (1000 * 60) +
      (attendance.breakDuration || 0);

    attendance.endBreak = endBreakTime;
    attendance.breakDuration = breakDuration;
    await attendance.save();

    // Log the successful break end
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Break ended successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: attendance._id,
      changes: {
        startBreak: attendance.startBreak,
        endBreak: endBreakTime,
        breakDuration,
      },
    });

    return res.status(200).json({ message: "Break ended" });
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

const getAllAttendance = async (req, res, next) => {
  const company = req.userData.company;

  try {
    // const user = await UserData.findById({ _id: loggedInUser }).populate({
    //   path: "role",
    //   select: "roleTitle",
    // });

    // const validRoles = ["Master Admin", "Super Admin", "HR Admin"];

    // const hasPermission = user.role.some((role) =>
    //   validRoles.includes(role.roleTitle)
    // );

    // if (!hasPermission) {
    //   return res.sendStatus(403);
    // }

    if (!mongoose.Types.ObjectId.isValid(company)) {
      return res.status(400).json("Invalid company Id provided");
    }

    let attendances = [];
    attendances = await Attendance.find({ company });
    attendances = await Attendance.find({ company });

    if (!attendances) {
      return res.status(400).json({ message: "No attendance exists" });
    }

    const transformedAttendances = attendances.map((attendance) => {
      const totalMins =
        attendance.outTime && attendance.inTime
          ? (attendance.outTime - attendance.inTime) / (1000 * 60)
          : 0;

      const breakMins = attendance.breakDuration || 0;
      const workMins = totalMins > breakMins ? totalMins - breakMins : 0;

      return {
        date: formatDate(attendance.inTime) || "N/A",
        date: formatDate(attendance.inTime) || "N/A",
        inTime: formatTime(attendance.inTime) || "N/A",
        outTime: formatTime(attendance.outTime) || "N/A",
        workHours: (workMins / 60).toFixed(2),
        workHours: (workMins / 60).toFixed(2),
        breakHours: (breakMins / 60).toFixed(2),
        totalHours: (totalMins / 60).toFixed(2),
        entryType: attendance.entryType || "N/A",
      };
    });

    return res.status(200).json(transformedAttendances);
  } catch (error) {
    next(error);
  }
};

const getAttendance = async (req, res, next) => {
  const { id } = req.params;
  const { user, company } = req;

  try {
    const user = await UserData.findOne({ empId: id });
    const attendances = await Attendance.find({
      user: user._id,
      company,
    });

    if (!attendances) {
      return res.status(400).json({ message: "No attendance exists" });
    }

    const transformedAttendances = attendances.map((attendance) => {
      const totalMins =
        attendance.outTime && attendance.inTime
          ? (attendance.outTime - attendance.inTime) / (1000 * 60)
          : 0;

      const breakMins = attendance.breakDuration || 0;
      const workMins = totalMins > breakMins ? totalMins - breakMins : 0;

      return {
        date: formatWithOrdinal(attendance.inTime) || "N/A",
        inTime: formatTime(attendance.inTime) || "N/A",
        outTime: formatTime(attendance.outTime) || "N/A",
        workHours: (workMins / 60).toFixed(2),
        breakHours: (breakMins / 60).toFixed(2),
        totalHours: (totalMins / 60).toFixed(2),
        entryType: attendance.entryType || "N/A",
      };
    });

    return res.status(200).json(transformedAttendances);
  } catch (error) {
    next(error);
  }
};

const correctAttendance = async (req, res, next) => {
  const { user, ip, company } = req;
  const { targetedDay, inTime, outTime, empId } = req.body;
  const logPath = "hr/HrLog";
  const logAction = "Correct Attendance";
  const logSourceKey = "attendance";

  try {
    if (!targetedDay) {
      throw new CustomError(
        "Correction Day is required",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // ✅ Convert `targetedDay` to UTC midnight to match MongoDB stored date
    const targetedDate = new Date(targetedDay);
    const startOfDay = new Date(
      targetedDate.getFullYear(),
      targetedDate.getMonth(),
      targetedDate.getDate(),
      0,
      0,
      0,
      0
    );

    const endOfDay = new Date(
      targetedDate.getFullYear(),
      targetedDate.getMonth(),
      targetedDate.getDate(),
      23,
      59,
      59,
      999
    );

    const foundUser = await UserData.findOne({ empId });

    if (!foundUser) {
      throw new CustomError("User not found", logPath, logAction, logSourceKey);
    }

    const foundDate = await Attendance.findOne({
      user: foundUser._id,
      createdAt: { $gte: startOfDay, $lt: endOfDay },
    });

    if (!foundDate) {
      throw new CustomError(
        "No timeclock found for that day",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const clockIn = inTime ? new Date(inTime) : foundDate.inTime;
    const clockOut = outTime ? new Date(outTime) : foundDate.outTime;

    if (inTime && isNaN(clockIn.getTime())) {
      throw new CustomError(
        "Invalid clock-in format",
        logPath,
        logAction,
        logSourceKey
      );
    }
    if (outTime && isNaN(clockOut.getTime())) {
      throw new CustomError(
        "Invalid clock-out format",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // ✅ Update attendance record
    await Attendance.findOneAndUpdate(
      { user: foundUser._id, createdAt: { $gte: startOfDay, $lt: endOfDay } },
      { $set: { inTime: clockIn, outTime: clockOut } }
    );

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Attendance corrected successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: foundDate._id,
      changes: {
        requester: foundUser._id,
        oldInTime: foundDate.inTime,
        oldOutTime: foundDate.outTime,
        newInTime: clockIn,
        newOutTime: clockOut,
      },
    });

    return res
      .status(200)
      .json({ message: "Attendance corrected successfully" });
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

const bulkInsertAttendance = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const companyId = req.company;

    const employees = await UserData.find({ company: companyId })
      .select("_id empId")
      .lean();

    const employeeMap = new Map(employees.map((emp) => [emp.empId, emp._id]));

    const newAttendanceRecords = [];
    const stream = Readable.from(req.file.buffer.toString("utf-8").trim());

    stream
      .pipe(csvParser())
      .on("data", async (row) => {
        try {
          const empId = row["User (Emp ID)"].trim();
          if (!employeeMap.has(empId)) {
            throw new Error(`Employee not found: ${empId}`);
          }

          const attendanceRecord = {
            company: new mongoose.Types.ObjectId(companyId),
            user: employeeMap.get(empId),
            date: new Date(row["Date"]),
            inTime: new Date(`${row["Date"].trim()} ${row["In Time"].trim()}`),
            outTime: new Date(
              `${row["Date"].trim()} ${row["Out Time"].trim()}`
            ),
            entryType: row["Entry Type"] || "web",
          };

          newAttendanceRecords.push(attendanceRecord);
        } catch (error) {
          console.error("Error processing row:", row, error);
        }
      })
      .on("end", async () => {
        try {
          if (newAttendanceRecords.length === 0) {
            return res
              .status(400)
              .json({ message: "No valid attendance records found in CSV" });
          }

          await Attendance.insertMany(newAttendanceRecords);

          res.status(201).json({
            message: "Bulk attendance data inserted successfully",
            insertedCount: newAttendanceRecords.length,
          });
        } catch (error) {
          res
            .status(500)
            .json({ message: "Error inserting attendance records", error });
        }
      });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  clockIn,
  clockOut,
  startBreak,
  endBreak,
  getAllAttendance,
  getAttendance,
  correctAttendance,
  bulkInsertAttendance,
};
