const Attendance = require("../models/hr/Attendance");
const UserData = require("../models/hr/UserData");
const mongoose = require("mongoose");
const { createLog } = require("../utils/moduleLogs");
const CustomError = require("../utils/customErrorlogs");
const { Readable } = require("stream");
const csvParser = require("csv-parser");
const AttendanceCorrection = require("../models/hr/AttendanceCorrection");
const Company = require("../models/hr/Company");
const DEFAULT_CHECK_IN_GRACE_MINUTES = 15;

const normalizeShiftName = (shiftName) =>
  String(shiftName || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "");

const getSnapshotShiftWindow = (shiftSnapshot, referenceTime) => {
  const snapshotStart = new Date(shiftSnapshot?.startTime);
  const snapshotEnd = new Date(shiftSnapshot?.endTime);
  const reference = new Date(referenceTime);
  if (
    Number.isNaN(snapshotStart.getTime()) ||
    Number.isNaN(snapshotEnd.getTime()) ||
    Number.isNaN(reference.getTime())
  ) {
    return null;
  }

  const startMinuteOfDay =
    snapshotStart.getHours() * 60 + snapshotStart.getMinutes();
  const endMinuteOfDay = snapshotEnd.getHours() * 60 + snapshotEnd.getMinutes();
  const referenceMinuteOfDay =
    reference.getHours() * 60 + reference.getMinutes();
  const isOvernight = endMinuteOfDay <= startMinuteOfDay;
  const shiftStart = new Date(reference);
  shiftStart.setHours(
    snapshotStart.getHours(),
    snapshotStart.getMinutes(),
    0,
    0,
  );
  if (isOvernight && referenceMinuteOfDay <= endMinuteOfDay) {
    shiftStart.setDate(shiftStart.getDate() - 1);
  }

  const shiftEnd = new Date(shiftStart);
  shiftEnd.setHours(snapshotEnd.getHours(), snapshotEnd.getMinutes(), 0, 0);
  if (isOvernight) shiftEnd.setDate(shiftEnd.getDate() + 1);

  return { shiftStart, shiftEnd };
};

const getEmployeeShiftWindow = async (userId, companyId, referenceTime) => {
  const [employee, companyData] = await Promise.all([
    UserData.findById(userId).select("shift").lean(),
    Company.findById(companyId).select("shifts").lean(),
  ]);
  const shiftName = String(employee?.shift || "").trim();
  const normalizedShiftName = normalizeShiftName(shiftName);
  const configuredShift = (companyData?.shifts || []).find(
    (shift) =>
      shift?.isActive !== false &&
      shift?.isDeleted !== true &&
      normalizeShiftName(shift?.name) === normalizedShiftName,
  );
  const configuredStart = configuredShift?.startTime
    ? new Date(configuredShift.startTime)
    : null;
  const configuredEnd = configuredShift?.endTime
    ? new Date(configuredShift.endTime)
    : null;
  const isNightShift = normalizedShiftName === "nightshift";
  const startHours =
    configuredStart?.getHours() ?? (isNightShift ? 19 : 9);
  const startMinutes =
    configuredStart?.getMinutes() ?? (isNightShift ? 0 : 30);
  const endHours = configuredEnd?.getHours() ?? (isNightShift ? 4 : 18);
  const endMinutes = configuredEnd?.getMinutes() ?? (isNightShift ? 0 : 30);
  const startMinuteOfDay = startHours * 60 + startMinutes;
  const endMinuteOfDay = endHours * 60 + endMinutes;
  const isOvernight = endMinuteOfDay <= startMinuteOfDay;

  const reference = new Date(referenceTime);
  const shiftStart = new Date(reference);
  shiftStart.setHours(startHours, startMinutes, 0, 0);
  if (
    isOvernight &&
    reference.getHours() * 60 + reference.getMinutes() <= endMinuteOfDay
  ) {
    shiftStart.setDate(shiftStart.getDate() - 1);
  }

  const shiftEnd = new Date(shiftStart);
  shiftEnd.setHours(endHours, endMinutes, 0, 0);
  if (isOvernight) shiftEnd.setDate(shiftEnd.getDate() + 1);

  return {
    shiftId: configuredShift?._id || null,
    shiftName: configuredShift?.name || shiftName || null,
    shiftStart,
    shiftEnd,
    earliestCheckIn: new Date(shiftStart.getTime() - 60 * 60 * 1000),
    latestCheckOut: new Date(shiftEnd.getTime() + 60 * 60 * 1000),
  };
};

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

    const shiftWindow = await getEmployeeShiftWindow(
      user,
      company,
      clockInTime,
    );

    // Check attendance before validating the time window. Otherwise a second
    // attempt after clock-out can incorrectly look like a shift-timing error.
    const existingAttendance = await Attendance.findOne({
      user,
      inTime: {
        $gte: shiftWindow.earliestCheckIn,
        $lte: shiftWindow.shiftEnd,
      },
    })
      .select("outTime")
      .lean()
      .exec();

    if (existingAttendance) {
      return res.status(400).json({
        message: existingAttendance.outTime
          ? "Attendance is already completed for this shift"
          : "You have already clocked in for this shift",
      });
    }

    if (
      clockInTime < shiftWindow.earliestCheckIn ||
      clockInTime > shiftWindow.shiftEnd
    ) {
      return res.status(400).json({
        message:
          "Check-in is allowed from 1 hour before the shift starts until the shift ends",
      });
    }

    const newAttendance = new Attendance({
      inTime: clockInTime,
      entryType,
      user,
      company,
      shiftSnapshot: {
        shiftId: shiftWindow.shiftId,
        shiftName: shiftWindow.shiftName,
        startTime: shiftWindow.shiftStart,
        endTime: shiftWindow.shiftEnd,
        checkInGraceMinutes: DEFAULT_CHECK_IN_GRACE_MINUTES,
      },
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

    if (clockOutTime < attendance.inTime) {
      return res
        .status(400)
        .json({ message: "Check-out cannot be before check-in" });
    }

    const snapshotWindow = getSnapshotShiftWindow(
      attendance.shiftSnapshot,
      attendance.inTime,
    );
    const shiftWindow = !snapshotWindow
      ? await getEmployeeShiftWindow(user, company, attendance.inTime)
      : {
          latestCheckOut: new Date(
            snapshotWindow.shiftEnd.getTime() + 60 * 60 * 1000,
          ),
        };
    if (clockOutTime > shiftWindow.latestCheckOut) {
      return res.status(400).json({
        message: "Check-out is allowed up to 1 hour after the shift ends",
      });
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
          { path: "rejectedBy", select: "firstName middleName lastName empId" },
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
        { path: "rejectedBy", select: "firstName middleName lastName empId" },
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

    const correctionShiftWindow =
      getSnapshotShiftWindow(foundDate.shiftSnapshot, foundDate.inTime) ||
      (await getEmployeeShiftWindow(
        foundUser._id,
        company,
        foundDate.inTime,
      ));
    const shiftStartMinutes =
      correctionShiftWindow.shiftStart.getHours() * 60 +
      correctionShiftWindow.shiftStart.getMinutes();
    const shiftEndMinutes =
      correctionShiftWindow.shiftEnd.getHours() * 60 +
      correctionShiftWindow.shiftEnd.getMinutes();
    const isOvernightShift = shiftEndMinutes <= shiftStartMinutes;
    const afterMidnightLimit = isOvernightShift
      ? shiftEndMinutes +
        Math.floor((shiftStartMinutes - shiftEndMinutes) / 2)
      : 0;

    function mergeShiftDateWithTime(timeString) {
      const time = new Date(timeString);
      if (Number.isNaN(time.getTime())) return new Date(NaN);

      const merged = new Date(correctionShiftWindow.shiftStart);
      merged.setHours(
        time.getHours(),
        time.getMinutes(),
        time.getSeconds(),
        time.getMilliseconds()
      );
      const timeMinutes = time.getHours() * 60 + time.getMinutes();
      if (isOvernightShift && timeMinutes <= afterMidnightLimit) {
        merged.setDate(merged.getDate() + 1);
      }
      return merged;
    }

    const clockIn = inTime ? mergeShiftDateWithTime(inTime) : null;
    const clockOut = outTime ? mergeShiftDateWithTime(outTime) : null;
    const breakStart = startBreak ? mergeShiftDateWithTime(startBreak) : null;
    const breakEnd = endBreak ? mergeShiftDateWithTime(endBreak) : null;

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

    if ((startBreak && !endBreak) || (!startBreak && endBreak)) {
      throw new CustomError(
        "Both break start and break end are required",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const effectiveInTime = clockIn || foundDate.inTime;
    const effectiveOutTime = clockOut || foundDate.outTime;
    if (
      effectiveInTime &&
      effectiveOutTime &&
      effectiveOutTime <= effectiveInTime
    ) {
      throw new CustomError(
        "Corrected clock-out must be after clock-in",
        logPath,
        logAction,
        logSourceKey,
      );
    }
    if (
      breakStart &&
      (breakEnd <= breakStart ||
        breakStart < effectiveInTime ||
        (effectiveOutTime && breakEnd > effectiveOutTime))
    ) {
      throw new CustomError(
        "Corrected break must fall between clock-in and clock-out",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const correctedBreaks =
      breakStart && breakEnd ? [{ startBreak: breakStart, endBreak: breakEnd }] : [];

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

    //Clock out correction request for prev day
    if (foundDate.inTime && !foundDate.outTime && clockOut) {
      await UserData.findOneAndUpdate(
        { _id: foundUser._id },
        {
          $set: {
            "clockInDetails.hasClockedIn": false,
            "clockInDetails.clockInTime": null,
            "clockInDetails.clockOutTime": null,
            breaks: [],
          },
        }
      )
        .lean()
        .exec();
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
      correctedBreaks = [],
      originalBreaks = [],
      originalInTime,
      originalOutTime,
    } = correction;

    // ✅ Build date range to find original attendance
    const targetDate = new Date(inTime || correction.createdAt);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // ✅ Calculate total breakDuration
    const effectiveBreaks = correctedBreaks.length
      ? correctedBreaks
      : originalBreaks;
    let totalBreakDuration = 0;
    effectiveBreaks.forEach((b) => {
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
          breaks: effectiveBreaks,
          breakDuration: breakDurationInMinutes,
          breakCount: effectiveBreaks.length,
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

    const companyId = req.company?._id || req.company;
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ message: "Invalid or missing company ID" });
    }
    const employees = await UserData.find({ company: companyId })
      .select("_id empId reportsTo role shift")
      .lean();
    const companyData = await Company.findById(companyId)
      .select("shifts")
      .lean();

    const employeeMap = new Map(employees.map((emp) => [emp.empId, emp]));
    const reportingManagerByRole = new Map();
    employees.forEach((employee) => {
      const employeeRoles = Array.isArray(employee.role)
        ? employee.role
        : employee.role
          ? [employee.role]
          : [];

      employeeRoles.forEach((role) => {
        const roleId = role?._id || role;
        const key = roleId?.toString();
        if (key && !reportingManagerByRole.has(key)) {
          reportingManagerByRole.set(key, employee._id);
        }
      });
    });
    const shiftByName = new Map(
      (companyData?.shifts || [])
        .filter(
          (shift) => shift?.isActive !== false && shift?.isDeleted !== true,
        )
        .map((shift) => [normalizeShiftName(shift.name), shift]),
    );

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
          const splitBreakTimes = (value) =>
            String(value || "")
              .split(/[|;,]/)
              .map((time) => time.trim())
              .filter(Boolean);
          const breakStartValues = splitBreakTimes(
            row["Break Start"] || row["Start Break"],
          );
          const breakEndValues = splitBreakTimes(
            row["Break End"] || row["End Break"],
          );
          const numberedBreaks = new Map();
          Object.entries(row).forEach(([header, value]) => {
            const match =
              header.match(/^Break\s*(\d+)\s*(Start|End)$/i) ||
              header.match(/^(Start|End)\s*Break\s*(\d+)$/i);
            if (!match) return;

            const isBreakFirst = /^Break/i.test(header);
            const index = Number(isBreakFirst ? match[1] : match[2]);
            const boundary = String(
              isBreakFirst ? match[2] : match[1],
            ).toLowerCase();
            const current = numberedBreaks.get(index) || {};
            current[boundary] = String(value || "").trim();
            numberedBreaks.set(index, current);
          });
          [...numberedBreaks.entries()]
            .sort(([first], [second]) => first - second)
            .forEach(([, breakEntry]) => {
              if (breakEntry.start) breakStartValues.push(breakEntry.start);
              if (breakEntry.end) breakEndValues.push(breakEntry.end);
            });

          if (!employeeMap.has(empId)) {
            responseSent = true;
            parser.destroy(); // Stop further processing
            return res
              .status(400)
              .json({ message: `Employee not found: ${empId}` });
          }

          const employee = employeeMap.get(empId);
          const employeeShift = shiftByName.get(
            normalizeShiftName(employee?.shift),
          );
          const shiftStart = employeeShift?.startTime
            ? new Date(employeeShift.startTime)
            : null;
          const shiftEnd = employeeShift?.endTime
            ? new Date(employeeShift.endTime)
            : null;
          const isNightShift =
            normalizeShiftName(employee?.shift) === "nightshift";
          const shiftStartMinutes = shiftStart
            ? shiftStart.getHours() * 60 + shiftStart.getMinutes()
            : isNightShift
              ? 19 * 60
              : 9 * 60 + 30;
          const shiftEndMinutes = shiftEnd
            ? shiftEnd.getHours() * 60 + shiftEnd.getMinutes()
            : isNightShift
              ? 4 * 60
              : 18 * 60 + 30;
          const isOvernightShift =
            shiftStartMinutes !== null &&
            shiftEndMinutes !== null &&
            shiftEndMinutes <= shiftStartMinutes;
          const parseAttendanceTime = (timeValue) => {
            const parsedTime = new Date(`${dateStr} ${timeValue}`);
            if (
              isOvernightShift &&
              !isNaN(parsedTime.getTime()) &&
              parsedTime.getHours() * 60 + parsedTime.getMinutes() <
                shiftStartMinutes
            ) {
              parsedTime.setDate(parsedTime.getDate() + 1);
            }
            return parsedTime;
          };

          const inTime = parseAttendanceTime(inTimeStr);
          const outTime = parseAttendanceTime(outTimeStr);

          if (isNaN(inTime.getTime()) || isNaN(outTime.getTime())) {
            responseSent = true;
            parser.destroy();
            return res.status(400).json({
              message: `Invalid time format for employee ${empId} on ${dateStr}`,
            });
          }

          const expectedShiftStart = new Date(dateStr);
          expectedShiftStart.setHours(
            Math.floor(shiftStartMinutes / 60),
            shiftStartMinutes % 60,
            0,
            0,
          );
          const expectedShiftEnd = new Date(dateStr);
          expectedShiftEnd.setHours(
            Math.floor(shiftEndMinutes / 60),
            shiftEndMinutes % 60,
            0,
            0,
          );
          if (isOvernightShift) {
            expectedShiftEnd.setDate(expectedShiftEnd.getDate() + 1);
          }
          const earliestCheckIn = new Date(
            expectedShiftStart.getTime() - 60 * 60 * 1000,
          );
          const latestCheckOut = new Date(
            expectedShiftEnd.getTime() + 60 * 60 * 1000,
          );

          if (inTime < earliestCheckIn || inTime > expectedShiftEnd) {
            responseSent = true;
            parser.destroy();
            return res.status(400).json({
              message: `Check-in is outside the allowed shift window for employee ${empId} on ${dateStr}`,
            });
          }

          if (outTime > latestCheckOut) {
            responseSent = true;
            parser.destroy();
            return res.status(400).json({
              message: `Check-out exceeds the 1-hour shift grace period for employee ${empId} on ${dateStr}`,
            });
          }

          if (outTime <= inTime) {
            responseSent = true;
            parser.destroy();
            return res.status(400).json({
              message: `Out Time must be after In Time for employee ${empId} on ${dateStr}`,
            });
          }

          if (breakStartValues.length !== breakEndValues.length) {
            responseSent = true;
            parser.destroy();
            return res.status(400).json({
              message: `Every break must have both a start and end time for employee ${empId} on ${dateStr}`,
            });
          }

          let breaks = [];
          let breakDuration = 0;
          if (breakStartValues.length) {
            breaks = breakStartValues
              .map((startValue, index) => ({
                startBreak: parseAttendanceTime(startValue),
                endBreak: parseAttendanceTime(breakEndValues[index]),
              }))
              .sort((first, second) => first.startBreak - second.startBreak);

            const invalidBreakIndex = breaks.findIndex(
              (breakEntry, index) =>
                isNaN(breakEntry.startBreak.getTime()) ||
                isNaN(breakEntry.endBreak.getTime()) ||
                breakEntry.endBreak <= breakEntry.startBreak ||
                breakEntry.startBreak < inTime ||
                breakEntry.endBreak > outTime ||
                (index > 0 &&
                  breakEntry.startBreak < breaks[index - 1].endBreak),
            );
            if (invalidBreakIndex !== -1) {
              responseSent = true;
              parser.destroy();
              return res.status(400).json({
                message: `Invalid or overlapping break ${invalidBreakIndex + 1} for employee ${empId} on ${dateStr}`,
              });
            }

            const totalBreakMilliseconds = breaks.reduce(
              (total, breakEntry) =>
                total + (breakEntry.endBreak - breakEntry.startBreak),
              0,
            );
            breakDuration = Math.round(
              totalBreakMilliseconds / (1000 * 60),
            );
          }

          const reportingManagerId = employee?.reportsTo
            ? reportingManagerByRole.get(employee.reportsTo.toString())
            : null;

          if (!reportingManagerId) {
            responseSent = true;
            parser.destroy();
            return res.status(400).json({
              message: `Reporting manager not found for employee ${empId}`,
            });
          }

          newAttendanceRecords.push({
            company: new mongoose.Types.ObjectId(companyId),
            user: employee._id,
            date: new Date(dateStr),
            inTime,
            outTime,
            shiftSnapshot: {
              shiftId: employeeShift?._id || null,
              shiftName: employeeShift?.name || employee?.shift || null,
              startTime: expectedShiftStart,
              endTime: expectedShiftEnd,
              checkInGraceMinutes: DEFAULT_CHECK_IN_GRACE_MINUTES,
            },
            breaks,
            breakDuration,
            entryType: row["Entry Type"] || "web",
            approvedBy: reportingManagerId,
            status: "Approved",
          });
        } catch (parseError) {
          responseSent = true;
          parser.destroy();
          return res
            .status(500)
            .json({ message: "Parsing error", error: parseError });
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
            error: error.message,
          });
        }
      })
      .on("error", (err) => {
        if (!responseSent) {
          responseSent = true;
          res
            .status(500)
            .json({ message: "Error reading CSV file", error: err });
        }
      });
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        message: "Unexpected server error",
        error: error.message,
      });
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
