const Meeting = require("../../models/meetings/Meetings");
const User = require("../../models/hr/UserData");
const { default: mongoose } = require("mongoose");
const Room = require("../../models/meetings/Rooms");
const {
  formatDate,
  formatTime,
  formatDuration,
} = require("../../utils/formatDateTime");
const Department = require("../../models/Departments");
const { createLog } = require("../../utils/moduleLogs");
const CustomError = require("../../utils/customErrorlogs");
const Visitor = require("../../models/visitor/Visitor");

const addMeetings = async (req, res, next) => {
  const logPath = "meetings/MeetingLog";
  const logAction = "Book Meeting";
  const logSourceKey = "meeting";

  try {
    const {
      meetingType,
      bookedRoom,
      startDate,
      endDate,
      startTime,
      endTime,
      subject,
      agenda,
      internalParticipants,
      externalParticipants,
    } = req.body;

    const company = req.company;
    const user = req.user;
    const ip = req.ip;

    if (
      !meetingType ||
      !startDate ||
      !endDate ||
      !startTime ||
      !endTime ||
      !subject ||
      !agenda
    ) {
      throw new CustomError(
        "Missing required fields",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!mongoose.Types.ObjectId.isValid(bookedRoom)) {
      throw new CustomError(
        "Invalid Room Id provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const currDate = new Date();
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const startTimeObj = new Date(startTime);
    const endTimeObj = new Date(endTime);

    if (
      isNaN(startDateObj.getTime()) ||
      isNaN(endDateObj.getTime()) ||
      isNaN(startTimeObj.getTime()) ||
      isNaN(endTimeObj.getTime())
    ) {
      throw new CustomError(
        "Invalid date format",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (startDateObj.getDate() < currDate.getDate()) {
      throw new CustomError(
        "Please select future timing",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const roomAvailable = await Room.findOne({
      _id: bookedRoom,
      status: "Available",
    });

    if (!roomAvailable) {
      throw new CustomError(
        "Room is unavailable",
        logPath,
        logAction,
        logSourceKey
      );
    }

    let totalParticipants = [];
    let internalUsers = [];
    let externalUsers = [];

    if (internalParticipants) {
      const invalidIds = internalParticipants.filter(
        (id) => !mongoose.Types.ObjectId.isValid(id)
      );

      if (invalidIds.length > 0) {
        throw new CustomError(
          "Invalid internal participant IDs",
          logPath,
          logAction,
          logSourceKey
        );
      }

      const users = await User.find({ _id: { $in: internalParticipants } });

      const unmatchedIds = internalParticipants.filter(
        (id) => !users.find((user) => user._id.toString() === id)
      );

      if (unmatchedIds.length > 0) {
        throw new CustomError(
          "Some internal participant IDs did not match any user",
          logPath,
          logAction,
          logSourceKey
        );
      }

      internalUsers = users.map((user) => user._id);
    }
    if (externalParticipants) {
      // const {
      //   companyName,
      //   registeredCompanyName,
      //   companyURL,
      //   email,
      //   mobileNumber,
      //   gstNumber,
      //   panNumber,
      //   address,
      //   personName,
      // } = externalCompanyData;

      // if (!companyName || !email || !mobileNumber || !personName) {
      //   throw new CustomError(
      //     "Missing required fields for external participants",
      //     logPath,
      //     logAction,
      //     logSourceKey
      //   );
      // }

      // const newExternalCompany = new ExternalCompany({
      //   companyName,
      //   registeredCompanyName,
      //   companyURL,
      //   email,
      //   mobileNumber,
      //   gstNumber: gstNumber,
      //   panNumber: panNumber,
      //   address: address || "",
      //   personName,
      // });

      // const savedExternalCompany = await newExternalCompany.save();

      // externalClientData = {
      //   participants: [...externalParticipants],
      //   company: savedExternalCompany._id,
      // };
      const invalidIds = externalParticipants.filter(
        (id) => !mongoose.Types.ObjectId.isValid(id)
      );

      if (invalidIds.length > 0) {
        throw new CustomError(
          "Invalid internal participant IDs",
          logPath,
          logAction,
          logSourceKey
        );
      }

      const users = await Visitor.find({ _id: { $in: externalParticipants } });

      const unmatchedIds = externalParticipants.filter(
        (id) => !users.find((user) => user._id.toString() === id)
      );

      if (unmatchedIds.length > 0) {
        throw new CustomError(
          "Some external participant IDs did not match any user",
          logPath,
          logAction,
          logSourceKey
        );
      }

      externalUsers = users.map((user) => user._id);
    }

    const conflictingMeeting = await Meeting.findOne({
      bookedRoom: roomAvailable._id,
      startDate: { $lte: endDateObj },
      endDate: { $gte: startDateObj },
      $or: [
        {
          $and: [
            { startTime: { $lte: startTimeObj } },
            { endTime: { $gt: startTimeObj } },
          ],
        },
        {
          $and: [
            { startTime: { $lt: endTimeObj } },
            { endTime: { $gte: endTimeObj } },
          ],
        },
        {
          $and: [
            { startTime: { $gte: startTimeObj } },
            { endTime: { $lte: endTimeObj } },
          ],
        },
      ],
    });

    if (conflictingMeeting) {
      throw new CustomError(
        "Room is already booked for the specified time",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const meeting = new Meeting({
      meetingType,
      bookedBy: user,
      startDate: startDateObj,
      endDate: endDateObj,
      startTime: startTimeObj,
      endTime: endTimeObj,
      bookedRoom: roomAvailable._id,
      subject,
      agenda,
      company,
      internalParticipants: internalParticipants ? internalUsers : [],
      externalParticipants: externalParticipants ? externalUsers : [],
    });

    await meeting.save();

    // Update room status to "Booked"
    roomAvailable.status = "Occupied";
    await roomAvailable.save();

    const data = {
      meetingType,
      bookedBy: user,
      bookedRoom: bookedRoom,
      startDate: startDateObj,
      endDate: endDateObj,
      startTime: startTimeObj,
      endTime: endTimeObj,
      subject,
      agenda,
      company,
      internalParticipants,
      externalParticipants,
    };

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Meeting added successfully and updated room status",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: meeting._id,
      changes: data,
    });

    return res.status(201).json({
      message: "Meeting added successfully",
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

const getAvaliableUsers = async (req, res, next) => {
  try {
    const { startTime, endTime } = req.query;
    if (!startTime || !endTime) {
      return res.status(400).json({ message: "Please provide a valid date" });
    }

    if (
      isNaN(new Date(startTime).getTime()) ||
      isNaN(new Date(endTime).getTime())
    ) {
      return res.status(400).json({ message: "Please provide a valid date" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    const meetings = await Meeting.find({
      company: req.company,
      $and: [{ startTime: { $lte: end } }, { endTime: { $gte: start } }],
    })
      .select("bookedBy internalParticipants startTime endTime")
      .lean()
      .exec();

    const unavailableUserIds = new Set();
    meetings.forEach((meeting) => {
      if (meeting.bookedBy) unavailableUserIds.add(meeting.bookedBy.toString());
      if (meeting.internalParticipants) {
        meeting.internalParticipants.forEach((userId) =>
          unavailableUserIds.add(userId.toString())
        );
      }
    });

    // Fetch all users and filter out unavailable ones
    const availableUsers = await User.find({
      company: req.company,
      _id: { $nin: Array.from(unavailableUserIds) },
      isActive: true,
    })
      .select("_id firstName lastName email")
      .lean()
      .exec();

    res.status(200).json(availableUsers);
  } catch (error) {
    next(error);
  }
};

const getMeetings = async (req, res, next) => {
  try {
    const { user, company } = req;

    const meetings = await Meeting.find({
      company,
    })
      .populate({
        path: "bookedRoom",
        select: "name housekeepingStatus",
        populate: {
          path: "location",
          select: "unitName unitNo",
          populate: {
            path: "building",
            select: "buildingName",
          },
        },
      })
      .populate("bookedBy", "firstName lastName")
      .populate("internalParticipants", "firstName lastName email")
      .populate("externalParticipants", "fullName email");

    const departments = await User.findById({ _id: user }).select(
      "departments"
    );

    const department = await Department.findById({
      _id: departments.departments[0],
    });

    const internalParticipants = meetings.map((meeting) =>
      meeting.internalParticipants.map((participant) => participant)
    );

    const transformedMeetings = meetings.map((meeting, index) => {
      let totalParticipants = [];
      if (
        internalParticipants[index].length &&
        meeting.externalParticipants.length
      ) {
        totalParticipants = [
          ...internalParticipants[index],
          ...meeting.externalParticipants,
        ];
      }

      return {
        _id: meeting._id,
        name: meeting.bookedBy?.name,
        department: department.name,
        roomName: meeting.bookedRoom.name,
        location: meeting.bookedRoom.location,
        meetingType: meeting.meetingType,
        housekeepingStatus: meeting.bookedRoom.housekeepingStatus,
        date: formatDate(meeting.startDate),
        startTime: formatTime(meeting.startTime),
        endTime: formatTime(meeting.endTime),
        credits: meeting.credits,
        duration: formatDuration(meeting.startTime, meeting.endTime),
        meetingStatus: meeting.status,
        action: meeting.extend,
        agenda: meeting.agenda,
        subject: meeting.subject,
        housekeepingChecklist: [...(meeting.housekeepingChecklist ?? [])],
        participants:
          totalParticipants.length > 0
            ? totalParticipants
            : internalParticipants[index].length > 0
            ? internalParticipants[index]
            : meeting.externalParticipants,
        company: meeting.company,
      };
    });

    return res.status(200).json(transformedMeetings);
  } catch (error) {
    next(error);
  }
};

const getMyMeetings = async (req, res, next) => {
  try {
    const { user, company } = req;

    const meetings = await Meeting.find({
      company,
      bookedBy: user,
    })
      .populate({
        path: "bookedRoom",
        select: "name housekeepingStatus",
        populate: {
          path: "location",
          select: "unitName unitNo",
          populate: {
            path: "building",
            select: "buildingName",
          },
        },
      })
      .populate("bookedBy", "firstName lastName email")
      .populate("internalParticipants", "firstName lastName email _id")
      .populate("externalParticipants", "fullName email");

    const departments = await User.findById({ _id: user }).select(
      "departments"
    );

    const department = await Department.findById({
      _id: departments.departments[0],
    });

    const internalParticipants = meetings.map((meeting) =>
      meeting.internalParticipants.map((participant) => participant)
    );

    const transformedMeetings = meetings.map((meeting, index) => {
      let totalParticipants = [];
      if (
        internalParticipants[index].length &&
        meeting.externalParticipants.length
      ) {
        totalParticipants = [
          ...internalParticipants[index],
          ...meeting.externalParticipants,
        ];
      }

      return {
        _id: meeting._id,
        name: meeting.bookedBy?.name,
        department: department.name,
        roomName: meeting.bookedRoom.name,
        location: meeting.bookedRoom.location,
        meetingType: meeting.meetingType,
        housekeepingStatus: meeting.bookedRoom.housekeepingStatus,
        date: formatDate(meeting.startDate),
        startTime: formatTime(meeting.startTime),
        endTime: formatTime(meeting.endTime),
        credits: meeting.credits,
        duration: formatDuration(meeting.startTime, meeting.endTime),
        meetingStatus: meeting.status,
        action: meeting.extend,
        agenda: meeting.agenda,
        subject: meeting.subject,
        housekeepingChecklist: [...(meeting.housekeepingChecklist ?? [])],
        participants:
          totalParticipants.length > 0
            ? totalParticipants
            : internalParticipants[index].length > 0
            ? internalParticipants[index]
            : meeting.externalParticipants,
        company: meeting.company,
      };
    });

    return res.status(200).json(transformedMeetings);
  } catch (error) {
    next(error);
  }
};

const addHousekeepingTask = async (req, res, next) => {
  try {
    const { housekeepingTasks, meetingId, roomName } = req.body;
    const company = req.company;
    const user = req.user;
    const ip = req.ip;
    const logPath = "meetings/MeetingLog";
    const logAction = "Add Housekeeping Tasks";
    const logSourceKey = "meeting";

    if (!housekeepingTasks || !meetingId || !roomName) {
      throw new CustomError(
        "All fields are required",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!mongoose.Types.ObjectId.isValid(meetingId)) {
      throw new CustomError(
        "Invalid meeting id provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const inCompleteTasks = housekeepingTasks.filter(
      (task) => task.status === "Pending"
    );

    if (inCompleteTasks.length > 0) {
      throw new CustomError(
        "Please check out the tasks before submitting",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const completedTasks = housekeepingTasks.map((task) => ({
      name: task.name,
    }));

    const foundMeeting = await Meeting.findByIdAndUpdate(
      { _id: meetingId },
      { $push: { housekeepingChecklist: completedTasks } },
      { new: true }
    );

    const room = await Room.findOneAndUpdate(
      { name: roomName },
      { housekeepingStatus: "Completed", status: "Available" },
      { new: true }
    );

    if (!foundMeeting) {
      throw new CustomError(
        "Failed to add the housekeeping tasks",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!room) {
      throw new CustomError(
        "Failed to update the room status",
        logPath,
        logAction,
        logSourceKey
      );
    }

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Housekeeping tasks completed and room status updated",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: foundMeeting._id,
      changes: { housekeepingTasks: completedTasks, roomName },
    });

    return res
      .status(200)
      .json({ message: "Housekeeping tasks added successfully" });
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

const deleteHousekeepingTask = async (req, res, next) => {
  const company = req.company;
  const user = req.user;
  const ip = req.ip;
  const logPath = "meetings/MeetingLog";
  const logAction = "Delete Housekeeping Tasks";
  const logSourceKey = "meeting";

  try {
    const { housekeepingTask, meetingId } = req.body;

    if (!housekeepingTask || !meetingId) {
      throw new CustomError(
        "All fields are required",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!mongoose.Types.ObjectId.isValid(meetingId)) {
      throw new CustomError(
        "Invalid meeting ID provided",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const updatedMeeting = await Meeting.findByIdAndUpdate(
      meetingId,
      { $pull: { housekeepingChecklist: { name: housekeepingTask } } },
      { new: true }
    );

    if (!updatedMeeting) {
      throw new CustomError(
        "Failed to delete housekeeping task",
        logPath,
        logAction,
        logSourceKey
      );
    }

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Housekeeping task deleted successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: meetingId,
      changes: { deletedTask: housekeepingTask },
    });

    return res.status(200).json({
      message: "Housekeeping task deleted successfully",
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

const getMeetingsByTypes = async (req, res, next) => {
  try {
    const { type } = req.query;
    const company = req.company;

    if (!type) {
      throw new CustomError(
        "Please send the meeting type",
        400,
        "meetings/MeetingLog",
        "Delete Meeting",
        "meeting"
      );
    }

    const meetings = await Meeting.find({
      meetingType: type,
      company,
    }).populate([
      {
        path: "company",
        select: "companyName",
      },
      {
        path: "bookedRoom",
        select: "name housekeepingStatus",
        populate: {
          path: "location",
          select: "unitName unitNo",
          populate: {
            path: "building",
            select: "buildingName",
          },
        },
      },
    ]);

    if (!meetings) {
      return res
        .status(400)
        .json({ message: `Failed to fetch ${type} meetings` });
    }

    const transformedMeetings = meetings.map((meeting) => {
      return {
        _id: meeting._id,
        roomName: meeting.bookedRoom.name,
        location: meeting.bookedRoom.location,
        meetingType: meeting.meetingType,
        endTime: formatTime(meeting.endTime),
        company: meeting.company.companyName,
      };
    });

    return res.status(200).json(transformedMeetings);
  } catch (error) {
    next(error);
  }
};

const cancelMeeting = async (req, res, next) => {
  const logPath = "meetings/MeetingLog";
  const logAction = "Cancel Meeting";
  const logSourceKey = "meeting";
  const { meetingId } = req.params;
  const { company, user, ip } = req;

  try {
    if (!meetingId) {
      throw new CustomError(
        "Meeting ID is required",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const cancelledMeeting = await Meeting.findByIdAndUpdate(
      meetingId,
      { status: "Cancelled" },
      { new: true }
    );

    if (!cancelledMeeting) {
      throw new CustomError(
        "Meeting not found, please check the ID",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Log the successful meeting cancellation
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Meeting cancelled successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: cancelledMeeting._id,
      changes: { meetingId },
    });

    return res.status(200).json({ message: "Meeting cancelled successfully" });
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

const extendMeeting = async (req, res, next) => {
  const logPath = "meetings/MeetingLog";
  const logAction = "Extend Meeting Time";
  const logSourceKey = "meeting";
  const { meetingId, newEndTime } = req.body;
  const { user, ip, company } = req;

  try {
    if (!meetingId || !newEndTime) {
      throw new CustomError(
        "Meeting ID and new end time are required",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (!mongoose.Types.ObjectId.isValid(meetingId)) {
      throw new CustomError(
        "Invalid meeting ID",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      throw new CustomError(
        "Meeting not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const newEndTimeObj = new Date(newEndTime);
    if (isNaN(newEndTimeObj.getTime())) {
      throw new CustomError(
        "Invalid new end time format",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (newEndTimeObj <= meeting.endTime) {
      throw new CustomError(
        "New end time must be later than the current end time",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Check for conflicting meeting
    const conflictingMeeting = await Meeting.findOne({
      bookedRoom: meeting.bookedRoom,
      startDate: meeting.startDate,
      startTime: { $lt: newEndTimeObj },
      endTime: { $gt: meeting.endTime },
      _id: { $ne: meetingId },
    });
    if (conflictingMeeting) {
      throw new CustomError(
        "Room is already booked during the extended time",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Store the old endTime for logging
    const oldEndTime = meeting.endTime;
    meeting.endTime = newEndTimeObj;
    meeting.endDate = newEndTimeObj;
    await meeting.save();

    // Log the successful extension
    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Meeting extended successfully",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: meeting._id,
      changes: { meetingId, oldEndTime, newEndTime: newEndTimeObj },
    });

    return res.status(200).json({
      message: "Meeting extended successfully",
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

const getSingleRoomMeetings = async (req, res, next) => {
  const { roomId } = req.params;

  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ message: "Invalid roomId provided" });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const meetings = await Meeting.find({
      bookedRoom: roomId,
      $or: [
        { startDate: { $lte: endOfDay }, endDate: { $gte: startOfDay } },
        { startDate: { $gt: endOfDay } },
      ],
    }).populate("bookedRoom", "_id name status description seats");

    const formattedMeetings = meetings.map((meeting) => ({
      ...meeting._doc,
      startDate: meeting.startDate.toLocaleString("en-US", {
        timeZone: timezone,
      }),
      endDate: meeting.endDate.toLocaleString("en-US", {
        timeZone: timezone,
      }),
      startTime: meeting.startTime.toLocaleString("en-US", {
        timeZone: timezone,
      }),
      endTime: meeting.endTime.toLocaleString("en-US", { timeZone: timezone }),
    }));

    res.status(200).json(formattedMeetings);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addMeetings,
  getMeetings,
  getMyMeetings,
  extendMeeting,
  addHousekeepingTask,
  deleteHousekeepingTask,
  getMeetingsByTypes,
  cancelMeeting,
  getAvaliableUsers,
  getSingleRoomMeetings,
};
