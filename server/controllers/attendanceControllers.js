const Attendance = require("../models/hr/Attendance");
const UserData = require("../models/hr/UserData");
const mongoose = require("mongoose");
const { createLog } = require("../utils/moduleLogs");
const CustomError = require("../utils/customErrorlogs");
const { Readable } = require("stream");
const csvParser = require("csv-parser");
const AttendanceCorrection = require("../models/hr/AttendanceCorrection");

const clockIn = async (req, res, next) => {
  const { user, ip, company } = req;
  const { inTime, entryType } = req.body;
  const logPath = "hr/hrLog";
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

    // if (clockInTime.getDate() !== currDate.getDate()) {
    //   throw new CustomError(
    //     "Please select present date",
    //     logPath,
    //     logAction,
    //     logSourceKey
    //   );
    // }

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

    if (todayClockInExists) {
      throw new CustomError(
        "Cannot clock in for the day again",
        logPath,
        logAction,
        logSourceKey
      );
    }

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
      sourceId: savedAttendance._id,
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
    const currDate = new Date();
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
    const isSameDay = clockOutTime.getDate() - currDate.getDate() === 0;
    if (!isSameDay) {
      throw new CustomError(
        "Please select present date",
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

  try {
    const requests = await AttendanceCorrection.find({
      company,
    })
      .populate([
        { path: "user", select: "firstName middleName lastName empId" },
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
  const { targetedDay, inTime, outTime, startBreak, endBreak, empId } =
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

    // const foundDate = await Attendance.findOne({
    //   user: foundUser._id,
    //   createdAt: { $gte: startOfDay, $lt: endOfDay },
    // }).sort({ createdAt: -1 });

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

    const isAllowed =
      currentDate.getDate() - targetedDate.getDate() === 1 ||
      currentDate.getDate() - targetedDate.getDate() === 0;

    // if (!isAllowed) {
    //   throw new CustomError(
    //     "Correction request only for same or previous day is allowed",
    //     logPath,
    //     logAction,
    //     logSourceKey
    //   );
    // }

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

    // Validate presence and parse
    // const clockIn = inTime ? new Date(inTime) : null;
    // const clockOut = outTime ? new Date(outTime) : null;
    // const breakStart = startBreak ? new Date(startBreak) : null;
    // const breakEnd = endBreak ? new Date(endBreak) : null;

    const clockIn = inTime ? mergeDateWithTime(targetedDate, inTime) : null;
    const clockOut = outTime ? mergeDateWithTime(targetedDate, outTime) : null;
    const breakStart = startBreak
      ? mergeDateWithTime(targetedDate, startBreak)
      : null;
    const breakEnd = endBreak
      ? mergeDateWithTime(targetedDate, endBreak)
      : null;

    // Check validity of any provided fields
    if (inTime && isNaN(clockIn)) {
      throw new CustomError(
        "Invalid clock-in format",
        logPath,
        logAction,
        logSourceKey
      );
    }
    if (outTime && isNaN(clockOut)) {
      throw new CustomError(
        "Invalid clock-out format",
        logPath,
        logAction,
        logSourceKey
      );
    }
    if (startBreak && isNaN(breakStart)) {
      throw new CustomError(
        "Invalid start break format",
        logPath,
        logAction,
        logSourceKey
      );
    }
    if (endBreak && isNaN(breakEnd)) {
      throw new CustomError(
        "Invalid end break format",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Create new correction request

    const newRequest = new AttendanceCorrection({
      inTime: clockIn,
      outTime: clockOut,
      startBreak: breakStart,
      endBreak: breakEnd,
      originalInTime: foundDate.inTime || null,
      originalOutTime: foundDate.outTime || null,
      originalStartBreak: foundDate.startBreak || null,
      originalEndBreak: foundDate.endBreak || null,
      user: foundUser._id,
      company: company,
    });

    await newRequest.save();

    // await createLog({
    //   path: logPath,
    //   action: logAction,
    //   remarks: "Attendance correction request submitted",
    //   status: "Success",
    //   user: user,
    //   ip: ip,
    //   company: company,
    //   sourceKey: logSourceKey,
    //   sourceId: foundDate._id,
    //   changes: {
    //     requester: foundUser._id,
    //     oldInTime: foundDate.inTime,
    //     oldOutTime: foundDate.outTime,
    //     oldStartBreak: foundDate.startBreak,
    //     oldEndBreak: foundDate.endBreak,
    //     newInTime: clockIn,
    //     newOutTime: clockOut,
    //     newStartBreak: breakStart,
    //     newEndBreak: breakEnd,
    //   },
    // });

    return res.status(200).json({
      message: "Attendance correction request submitted successfully",
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
    const correction = await AttendanceCorrection.findById({
      _id: attendanceId,
    });
    if (!correction) {
      throw new CustomError(
        "Correction request not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const { user: userId, inTime, outTime, startBreak, endBreak } = correction;

    // ✅ Build date boundaries for finding the correct attendance
    const targetDate = new Date(inTime || correction.createdAt);
    const startOfDay = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
      0,
      0,
      0,
      0
    );
    const endOfDay = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
      23,
      59,
      59,
      999
    );

    // ✅ Calculate breakDuration in minutes
    let breakDuration = 0;
    if (startBreak && endBreak) {
      breakDuration = Math.floor(
        (new Date(endBreak) - new Date(startBreak)) / 60000
      ); // ms to min
    }

    // ✅ Update the actual attendance record
    const updatedAttendance = await Attendance.findOneAndUpdate(
      {
        user: userId,
        inTime: { $gte: startOfDay, $lt: endOfDay },
      },
      {
        $set: {
          inTime,
          outTime,
          startBreak,
          endBreak,
          breakDuration,
          breakCount: startBreak && endBreak ? 1 : 0,
          status: "Approved",
        },
        $unset: { rejectedBy: "" },
      },
      { new: true }
    );

    if (!updatedAttendance) {
      throw new CustomError(
        "Failed to approve and update attendance record",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // ✅ Update correction request status to Approved
    correction.status = "Approved";
    correction.approvedBy = user;
    await correction.save();

    // ✅ Log the approval
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Correction request approved and attendance updated",
      status: "Success",
      user,
      ip,
      company,
      sourceKey: logSourceKey,
      sourceId: attendanceId,
      changes: {
        status: "Approved",
        updatedAttendanceId: updatedAttendance._id,
        inTime,
        outTime,
        startBreak,
        endBreak,
        breakDuration,
      },
    });

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

    const updatedAttendance = await AttendanceCorrection.findOneAndUpdate(
      { _id: attendanceId },
      {
        $set: { status: "Rejected", rejectedBy: user },
        $unset: { approvedBy: "" },
      },
      { new: true }
    );

    if (!updatedAttendance) {
      throw new CustomError(
        "Failed to reject the correction request",
        logPath,
        logAction,
        logSourceKey
      );
    }

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Correction request rejected successfully",
      status: "Success",
      user,
      ip,
      company,
      sourceKey: logSourceKey,
      sourceId: attendanceId,
      changes: {
        status: "Rejected",
        approvedBy: user,
      },
    });

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
    const invalidRows = [];

    const stream = Readable.from(req.file.buffer.toString("utf-8").trim());

    stream
      .pipe(csvParser())
      .on("data", (row) => {
        const empId = row["User (Emp ID)"]?.trim();
        const dateStr = row["Date"]?.trim();
        const inTimeStr = row["In Time"]?.trim();
        const outTimeStr = row["Out Time"]?.trim();

        if (!employeeMap.has(empId)) {
          invalidRows.push(`Employee not found: ${empId}`);
          return;
        }

        const inTime = new Date(`${dateStr} ${inTimeStr}`);
        const outTime = new Date(`${dateStr} ${outTimeStr}`);

        if (isNaN(inTime.getTime()) || isNaN(outTime.getTime())) {
          invalidRows.push(
            `Invalid time format for employee ${empId} on ${dateStr}`
          );
          return;
        }

        newAttendanceRecords.push({
          company: new mongoose.Types.ObjectId(companyId),
          user: employeeMap.get(empId),
          date: new Date(dateStr),
          inTime,
          outTime,
          entryType: row["Entry Type"] || "web",
        });
      })
      .on("end", async () => {
        if (invalidRows.length > 0) {
          return res.status(400).json({
            message: "Invalid data found in CSV",
            errors: invalidRows,
          });
        }

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
  getAttendanceRequests,
  correctAttendance,
  approveCorrectionRequest,
  rejectCorrectionRequest,
  bulkInsertAttendance,
};
