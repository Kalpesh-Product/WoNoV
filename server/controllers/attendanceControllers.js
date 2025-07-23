const Attendance = require("../models/hr/Attendance");
const UserData = require("../models/hr/UserData");
const mongoose = require("mongoose");
const { createLog } = require("../utils/moduleLogs");
const CustomError = require("../utils/customErrorlogs");
const { Readable } = require("stream");
const csvParser = require("csv-parser");
const AttendanceCorrection = require("../models/hr/AttendanceCorrection");

const clockIn = async (req, res, next) => {
  const { user, company } = req;
  const { inTime, entryType } = req.body;

  try {
    if (!inTime || !entryType) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const clockInTime = new Date(inTime);
    const currDate = new Date();

    // if (clockInTime.getDate() !== currDate.getDate()) {
    //   return res.status(400).json({ message: "Please select present date" });
    // }

    if (isNaN(clockInTime.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Check if the user has already clocked in today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingToday = await Attendance.findOne({
      user,
      inTime: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .lean()
      .exec();

    if (existingToday) {
      return res
        .status(400)
        .json({ message: "You have already clocked out for the day" });
    }

    const newAttendance = new Attendance({
      inTime: clockInTime,
      entryType,
      user,
      company,
    });

    const savedAttandance = await newAttendance.save();
    if (savedAttandance) {
      await UserData.findOneAndUpdate(
        { _id: user },
        {
          $set: {
            "clockInDetails.hasClockedIn": true,
            "clockInDetails.clockInTime": clockInTime,
            "clockInDetails.clockOutTime": null,
            breaks: [],
          },
        }
      )
        .lean()
        .exec();
    }

    return res.status(201).json({ message: "You clocked in" });
  } catch (error) {
    next(error);
  }
};

const clockOut = async (req, res, next) => {
  const { user, company } = req;
  const { outTime } = req.body;

  try {
    if (!outTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const clockOutTime = new Date(outTime);
    if (isNaN(clockOutTime.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Retrieve latest attendance entry for the user
    const attendance = await Attendance.findOne({
      user,
    }).sort({
      createdAt: -1,
    });

    if (!attendance) {
      return res
        .status(404)
        .json({ message: "No attendance record for today" });
    }

    if (attendance.outTime) {
      return res.status(400).json({ message: "Already clocked out" });
    }

    // ✅ Auto-end the last break if it's open
    const lastBreak = attendance.breaks?.[attendance.breaks.length - 1];
    if (lastBreak && lastBreak.startBreak && !lastBreak.endBreak) {
      return res.status(400).json({ message: "Please end the break" });

      // lastBreak.endBreak = clockOutTime;

      // const duration =
      //   (clockOutTime - new Date(lastBreak.startBreak)) / (1000 * 60); // in minutes
      // if (duration > 0) {
      //   attendance.breakDuration += duration;
      // }
    }

    // ✅ Finalize clock-out
    attendance.outTime = clockOutTime;
    const updatedAttendance = await attendance.save();

    if (updatedAttendance) {
      await UserData.findOneAndUpdate(
        { _id: user },
        {
          $set: {
            "clockInDetails.hasClockedIn": false,
            // "clockInDetails.clockInTime": null,
            // "clockInDetails.breaks": [],
            "clockInDetails.clockOutTime": clockOutTime,
          },
        }
      )
        .lean()
        .exec();
    }

    return res.status(200).json({ message: "You clocked out" });
  } catch (error) {
    console.error("Clock-out error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const startBreak = async (req, res, next) => {
  const logPath = "AttendanceLogs";
  const logAction = "Start Break";
  const logSourceKey = "attendance";
  const { startBreak } = req.body;
  const { user, ip, company } = req;

  try {
    if (!startBreak) {
      throw new CustomError(
        "Start break time is required",
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

    // Get today's date range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Get latest attendance record for today
    const attendance = await Attendance.findOne({
      user,
      inTime: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ createdAt: -1 });

    if (!attendance) {
      throw new CustomError(
        "No clock-in record exists",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (attendance.outTime) {
      throw new CustomError(
        "You've already clocked out",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // ✅ Prevent starting a new break if last one is still active
    const lastBreak = attendance.breaks.at(-1); // last element
    if (lastBreak && !lastBreak.endBreak) {
      throw new CustomError(
        "Previous break not ended yet",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Append new break
    attendance.breaks.push({
      startBreak: startBreakTime,
      endBreak: null,
    });

    const savedAttendance = await attendance.save();

    if (savedAttendance) {
      await UserData.findOneAndUpdate(
        { _id: user },
        {
          $push: {
            "clockInDetails.breaks": {
              start: startBreakTime,
              end: null,
            },
          },
        }
      )
        .lean()
        .exec();
    }

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
        "End break time is required",
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

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const attendance = await Attendance.findOne({
      user,
      inTime: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).sort({ createdAt: -1 });

    if (!attendance) {
      throw new CustomError(
        "No clock in record exists for today",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Find the most recent break without an endBreak
    const lastBreak = attendance.breaks
      .slice()
      .reverse()
      .find((brk) => brk.endBreak === null);

    if (!lastBreak || !lastBreak.startBreak) {
      throw new CustomError(
        "No ongoing break found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const startBreakTime = new Date(lastBreak.startBreak);

    lastBreak.endBreak = endBreakTime;

    // Recalculate total breakDuration
    attendance.breakDuration = attendance.breaks.reduce((total, brk) => {
      if (brk.startBreak && brk.endBreak) {
        return (
          total +
          (new Date(brk.endBreak) - new Date(brk.startBreak)) / (1000 * 60)
        );
      }
      return total;
    }, 0);

    const savedAttendance = await attendance.save();

    if (savedAttendance) {
      await UserData.findOneAndUpdate(
        { _id: user },
        {
          $set: {
            "clockInDetails.breaks.$[last].end": endBreakTime,
          },
        },
        {
          arrayFilters: [{ "last.end": null }],
          new: true,
        }
      )
        .lean()
        .exec();
    }

    // Log
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Break ended successfully",
      status: "Success",
      user,
      ip,
      company,
      sourceKey: logSourceKey,
      sourceId: attendance._id,
      changes: {
        startBreak: startBreakTime,
        endBreak: endBreakTime,
        breakDuration: attendance.breakDuration,
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
    if (!mongoose.Types.ObjectId.isValid(company)) {
      return res.status(400).json("Invalid company Id provided");
    }

    const attendances = await Attendance.find({ company });

    if (!attendances || attendances.length === 0) {
      return res.status(400).json({ message: "No attendance exists" });
    }

    return res.status(200).json(attendances);
  } catch (error) {
    next(error);
  }
};

const getAttendance = async (req, res, next) => {
  const { id } = req.params;
  const { company } = req;

  try {
    const user = await UserData.findOne({ empId: id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const attendances = await Attendance.find({
      user: user._id,
      company,
    })
      .lean()
      .exec();

    if (!attendances || attendances.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(attendances);
  } catch (error) {
    next(error);
  }
};

const getAttendanceRequests = async (req, res, next) => {
  const { company } = req;
  const { userId } = req.query;

  try {
    if (userId) {
      const requests = await AttendanceCorrection.find({
        user: userId,
      })
        .populate([
          { path: "user", select: "firstName middleName lastName empId" },
          { path: "addedBy", select: "firstName middleName lastName empId" },
          { path: "approvedBy", select: "firstName middleName lastName empId" },
        ])
        .lean()
        .exec();

      return res.status(200).json(requests);
    }
    const requests = await AttendanceCorrection.find({
      company,
    })
      .populate([
        { path: "user", select: "firstName middleName lastName empId" },
        { path: "addedBy", select: "firstName middleName lastName empId" },
        { path: "approvedBy", select: "firstName middleName lastName empId" },
      ])
      .lean()
      .exec();

    if (!requests || requests.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
};

const correctAttendance = async (req, res, next) => {
  const { user, ip, company } = req;
  const { targetedDay, inTime, outTime, startBreak, endBreak, empId, reason } =
    req.body;
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

    if (!inTime && !outTime) {
      throw new CustomError(
        "Provide the time to be corrected",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const targetedDate = new Date(targetedDay);
    const currentDate = new Date();

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
      inTime: { $gte: startOfDay, $lt: endOfDay },
    }).sort({ createdAt: -1 });

    if (!foundDate) {
      throw new CustomError(
        "No timeclock found for that day",
        logPath,
        logAction,
        logSourceKey
      );
    }

    function mergeDateWithTime(dateOnly, timeString) {
      const time = new Date(timeString);
      const merged = new Date(dateOnly);
      merged.setHours(
        time.getHours(),
        time.getMinutes(),
        time.getSeconds(),
        time.getMilliseconds()
      );
      return merged;
    }

    const clockIn = inTime ? mergeDateWithTime(targetedDate, inTime) : null;
    const clockOut = outTime ? mergeDateWithTime(targetedDate, outTime) : null;
    const breakStart = startBreak
      ? mergeDateWithTime(targetedDate, startBreak)
      : null;
    const breakEnd = endBreak
      ? mergeDateWithTime(targetedDate, endBreak)
      : null;

    // Validate provided fields
    if (inTime && isNaN(clockIn))
      throw new CustomError(
        "Invalid clock-in format",
        logPath,
        logAction,
        logSourceKey
      );
    if (outTime && isNaN(clockOut))
      throw new CustomError(
        "Invalid clock-out format",
        logPath,
        logAction,
        logSourceKey
      );
    if (startBreak && isNaN(breakStart))
      throw new CustomError(
        "Invalid start break format",
        logPath,
        logAction,
        logSourceKey
      );
    if (endBreak && isNaN(breakEnd))
      throw new CustomError(
        "Invalid end break format",
        logPath,
        logAction,
        logSourceKey
      );

    const correctedBreaks = [];

    correctedBreaks.push({ startBreak: breakStart, endBreak: breakEnd });

    const originalBreaks = foundDate.breaks || [];

    const newRequest = new AttendanceCorrection({
      inTime: clockIn,
      outTime: clockOut,
      correctedBreaks,
      originalInTime: foundDate.inTime || null,
      originalOutTime: foundDate.outTime || null,
      originalBreaks: originalBreaks,
      reason,
      addedBy: user,
      user: foundUser._id,
      company,
    });

    const savedRequest = await newRequest.save();

    const updatedAttendance = await Attendance.findOneAndUpdate(
      {
        user: savedRequest.user,
        inTime: savedRequest.originalInTime,
      },
      {
        $set: {
          status: "Pending",
        },
      },
      { new: true }
    );

    if (!updatedAttendance) {
      return res
        .status(400)
        .json({ message: "Failed to update attendance status" });
    }

    return res.status(200).json({
      message: "Correction request submitted successfully",
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

const approveCorrectionRequest = async (req, res, next) => {
  const logPath = "hr/HrLog";
  const logAction = "Approve Correction Request";
  const logSourceKey = "attendance";
  const { user, ip, company } = req;

  try {
    const { attendanceId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(attendanceId)) {
      throw new CustomError(
        "Invalid attendance Id provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // ✅ Fetch the correction request
    const correction = await AttendanceCorrection.findById(attendanceId);
    if (!correction) {
      throw new CustomError(
        "Correction request not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const {
      user: userId,
      inTime,
      outTime,
      breaks = [],
      originalInTime,
      originalOutTime,
    } = correction;

    // ✅ Build date range to find original attendance
    const targetDate = new Date(inTime || correction.createdAt);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // ✅ Calculate total breakDuration
    let totalBreakDuration = 0;
    breaks.forEach((b) => {
      if (b.startBreak && b.endBreak) {
        const diff = new Date(b.endBreak) - new Date(b.startBreak);
        totalBreakDuration += diff > 0 ? diff : 0;
      }
    });
    const breakDurationInMinutes = totalBreakDuration / (1000 * 60);

    // ✅ Update attendance with corrected values
    const updatedAttendance = await Attendance.findOneAndUpdate(
      {
        user: userId,
        $or: [
          {
            inTime: originalInTime,
          },
          { outTime: originalOutTime },
        ],
      },
      {
        $set: {
          inTime: inTime ? inTime : originalInTime,
          outTime: outTime ? outTime : originalOutTime,
          breaks: breaks.length > 0 ? breaks : [],
          breakDuration: breakDurationInMinutes,
          breakCount: breaks.length,
          status: "Approved",
        },
      },
      { new: true }
    );

    console.log("updatedAttendance", updatedAttendance);
    if (!updatedAttendance) {
      throw new CustomError(
        "Failed to approve and update attendance record",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // ✅ Mark correction request as approved
    correction.status = "Approved";
    correction.approvedBy = user;
    await correction.save();

    return res.status(200).json({
      message: "Correction request approved",
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

const rejectCorrectionRequest = async (req, res, next) => {
  const logPath = "hr/HrLog";
  const logAction = "Reject Correction Request";
  const logSourceKey = "attendance";
  const { user, ip, company } = req;
  try {
    const { attendanceId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(attendanceId)) {
      throw new CustomError(
        "Invalid attendance Id provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const updatedAttendanceCorrection =
      await AttendanceCorrection.findOneAndUpdate(
        { _id: attendanceId },
        {
          $set: { status: "Rejected", rejectedBy: user },
          $unset: { approvedBy: "" },
        },
        { new: true }
      );

    const updatedAttendance = await Attendance.findOneAndUpdate(
      {
        user: updatedAttendanceCorrection.user,
        inTime: updatedAttendanceCorrection.originalInTime,
      },
      {
        $set: {
          status: "Rejected",
        },
      },
      { new: true }
    );

    if (!updatedAttendanceCorrection || !updatedAttendance) {
      throw new CustomError(
        "Failed to reject the correction request",
        logPath,
        logAction,
        logSourceKey
      );
    }

    return res.status(200).json({ message: "Correction request Rejected" });
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
    let responseSent = false;

    const stream = Readable.from(req.file.buffer.toString("utf-8").trim());
    const parser = csvParser();

    stream
      .pipe(parser)
      .on("data", (row) => {
        if (responseSent) return;

        try {
          const empId = row["User (Emp ID)"]?.trim();
          const dateStr = row["Date"]?.trim();
          const inTimeStr = row["In Time"]?.trim();
          const outTimeStr = row["Out Time"]?.trim();

          if (!employeeMap.has(empId)) {
            responseSent = true;
            parser.destroy(); // Stop further processing
            return res
              .status(400)
              .json({ message: `Employee not found: ${empId}` });
          }

          const inTime = new Date(`${dateStr} ${inTimeStr}`);
          const outTime = new Date(`${dateStr} ${outTimeStr}`);

          if (isNaN(inTime.getTime()) || isNaN(outTime.getTime())) {
            responseSent = true;
            parser.destroy();
            return res.status(400).json({
              message: `Invalid time format for employee ${empId} on ${dateStr}`,
            });
          }

          newAttendanceRecords.push({
            company: new mongoose.Types.ObjectId(companyId),
            user: employeeMap.get(empId),
            date: new Date(dateStr),
            inTime,
            outTime,
            entryType: row["Entry Type"] || "web",
          });
        } catch (parseError) {
          responseSent = true;
          parser.destroy();
          return res.status(500).json({ message: "Parsing error", error: parseError });
        }
      })
      .on("end", async () => {
        if (responseSent) return;

        if (newAttendanceRecords.length === 0) {
          return res
            .status(400)
            .json({ message: "No valid attendance records found in CSV" });
        }

        try {
          await Attendance.insertMany(newAttendanceRecords);
          res.status(201).json({
            message: "Bulk attendance data inserted successfully",
            insertedCount: newAttendanceRecords.length,
          });
        } catch (error) {
          res.status(500).json({
            message: "Error inserting attendance records",
            error,
          });
        }
      })
      .on("error", (err) => {
        if (!responseSent) {
          responseSent = true;
          res.status(500).json({ message: "Error reading CSV file", error: err });
        }
      });
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ message: "Unexpected server error", error });
    } else {
      next(error);
    }
  }
};

module.exports = {
  clockIn,
  clockOut,
  startBreak,
  endBreak,
  getAllAttendance,
  getAttendance,
  getAttendanceRequests,
  correctAttendance,
  approveCorrectionRequest,
  rejectCorrectionRequest,
  bulkInsertAttendance,
};
