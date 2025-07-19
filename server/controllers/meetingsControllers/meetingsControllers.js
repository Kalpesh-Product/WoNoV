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
const Review = require("../../models/meetings/Reviews");
const CoworkingMembers = require("../../models/sales/CoworkingMembers");
const UserData = require("../../models/hr/UserData");
const Company = require("../../models/hr/Company");
const CoworkingClient = require("../../models/sales/CoworkingClient");
const ExternalCompany = require("../../models/meetings/ExternalCompany");
const MeetingRevenue = require("../../models/sales/MeetingRevenue");
const emitter = require("../../utils/eventEmitter");
const { isValid } = require("date-fns/isValid");
const Role = require("../../models/roles/Roles");

const addMeetings = async (req, res, next) => {
  const logPath = "meetings/MeetingLog";
  const logAction = "Book Meeting";
  const logSourceKey = "meeting";

  try {
    const {
      meetingType,
      bookedRoom,
      bookedBy,
      startDate,
      endDate,
      startTime,
      endTime,
      subject,
      agenda,
      client,
      externalCompany,
      internalParticipants,
      externalParticipants,
      paymentAmount,
      paymentStatus,
      paymentMode,
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
      !agenda ||
      (meetingType === "Internal" && !bookedBy) ||
      (meetingType === "Internal" && !client) ||
      (meetingType === "External" && !externalCompany)
    ) {
      throw new CustomError(
        "Missing required fields",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (client && !mongoose.Types.ObjectId.isValid(client)) {
      throw new CustomError(
        "Invalid client Id provided",
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

    let internalUsers = [];
    let users = [];
    let isClient = client ? company.toString() !== client.toString() : false;

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

      if (isClient) {
        users = await CoworkingMembers.find({
          _id: { $in: internalParticipants },
        });
      } else {
        users = await User.find({ _id: { $in: internalParticipants } });
      }

      const unmatchedIds = internalParticipants.filter(
        (id) =>
          !users.find((user) => {
            return user._id.toString() === id.toString();
          })
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

    // Calculate meeting duration and credit deduction
    const durationInMs = endTimeObj - startTimeObj;
    const durationInHours = durationInMs / (1000 * 60 * 60);
    const creditPerHour = roomAvailable.perHourCredit || 0;
    const totalCreditsUsed = durationInHours * creditPerHour;

    // Atomically deduct credits using findOneAndUpdate with credit check
    const updateQuery = { _id: bookedBy };
    const BookingModel = isClient ? CoworkingMembers : User;

    const updatedUser = await BookingModel.findOneAndUpdate(
      {
        ...updateQuery,
        credits: { $gte: totalCreditsUsed },
      },
      { $inc: { credits: -totalCreditsUsed } },
      { new: true }
    );

    if (!updatedUser) {
      throw new CustomError(
        "Insufficient credits or booking user not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const meeting = new Meeting({
      meetingType,
      bookedBy: !isClient ? bookedBy : null,
      clientBookedBy: isClient ? bookedBy : null,
      receptionist: user,
      startDate: startDateObj,
      endDate: endDateObj,
      startTime: startTimeObj,
      endTime: endTimeObj,
      bookedRoom: roomAvailable._id,
      subject,
      agenda,
      creditsUsed: totalCreditsUsed,
      client: meetingType === "Internal" ? client : null,
      externalClient: meetingType === "External" ? externalCompany : null,
      company,
      status: "Upcoming",
      internalParticipants:
        internalParticipants && !isClient ? internalUsers : [],
      clientParticipants: internalParticipants && isClient ? internalUsers : [],
      externalParticipants: externalParticipants || [],
    });

    const savedMeeting = await meeting.save();
    // await Promise.all([
    //   meeting.save(),
    //   Room.findByIdAndUpdate(roomAvailable._id, { status: "Occupied" }),
    // ]);

    if (!savedMeeting) {
      throw new CustomError(
        "Failed to book meeting",
        logPath,
        logAction,
        logSourceKey
      );
    }

    isClient
      ? null
      : emitter.emit("notification", {
          initiatorData: updatedUser._id,
          users: internalParticipants.map((userId) => ({
            userActions: {
              whichUser: userId,
              hasRead: false,
            },
          })),
          type: "book meeting",
          module: "Meetings",
          message: `You have been added to a meeting by ${updatedUser.firstName} ${updatedUser.lastName}`,
        });

    await createLog({
      path: logPath,
      action: logAction,
      remarks: "Meeting added successfully and updated room status",
      status: "Success",
      user: user,
      ip: ip,
      company: company,
      sourceKey: logSourceKey,
      sourceId: savedMeeting._id,
      changes: meeting,
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
    const { user, company, roles, departments } = req;

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
      .populate([
        {
          path: "bookedBy",
          select: "departments firstName lastName email",
          populate: { path: "departments", select: "name" },
        },
        { path: "clientBookedBy", select: "employeeName email" },
        {
          path: "receptionist",
          select: "firstName lastName departments",
          populate: { path: "departments", select: "name" },
        },
        { path: "client", select: "clientName" },
        // { path: "externalClient", select: "companyName pocName mobileNumber" },
        { path: "internalParticipants", select: "firstName lastName email" },
        { path: "clientParticipants", select: "employeeName email" },
        { path: "externalParticipants", select: "firstName lastName email" },
      ]);

    const departmentIds = departments.map((dept) => dept._id);

    const department = await Department.find({
      _id: { $in: departmentIds },
    });

    let filteredMeetings = meetings;
    if (
      !roles.includes("Administration Admin") &&
      !roles.includes("Administration Employee") &&
      !roles.includes("Master Admin") &&
      !roles.includes("Super Admin")
    ) {
      filteredMeetings = meetings.filter((meeting) => {
        if (!meeting.bookedBy || !Array.isArray(meeting.bookedBy.departments))
          return false;

        const bookedDeptIds = meeting.bookedBy.departments.map((dept) =>
          dept._id?.toString()
        );

        return bookedDeptIds.some((deptId) => departmentIds.includes(deptId));
      });
    }

    const reviews = await Review.find().select(
      "-createdAt -updatedAt -__v -company"
    );

    if (!reviews) {
      return res.status(400).json({ message: "No reviews found" });
    }

    const internalParticipants = filteredMeetings.map((meeting) =>
      meeting.internalParticipants.map((participant) => participant)
    );
    const clientParticipants = filteredMeetings.map((meeting) =>
      meeting.clientParticipants.map((participant) => participant)
    );

    const transformedMeetings = filteredMeetings.map((meeting, index) => {
      let totalParticipants = [];
      if (
        internalParticipants[index].length &&
        clientParticipants[index].length &&
        meeting.externalParticipants.length
      ) {
        totalParticipants = [
          ...internalParticipants[index],
          ...meeting.externalParticipants,
        ];
      }

      const meetingReviews = reviews.find(
        (review) => review.meeting.toString() === meeting._id.toString()
      );

      const isClient = meeting.client ? true : false;

      const isReceptionist = meeting.receptionist.departments.some(
        (dept) => dept.name === "Administration"
      );

      let receptionist;
      if (isReceptionist) {
        receptionist = meeting.receptionist
          ? [
              meeting.receptionist.firstName,
              meeting.receptionist.middleName,
              meeting.receptionist.lastName,
            ]
              .filter(Boolean)
              .join(" ")
          : "";
      }

      return {
        _id: meeting._id,
        name: meeting.bookedBy?.name,
        receptionist: isReceptionist ? receptionist : "N/A",
        // bookedBy: { ...meeting.bookedBy },
        clientBookedBy: meeting.clientBookedBy,
        department: meeting?.bookedBy?.departments,
        roomName: meeting.bookedRoom.name,
        bookedBy: meeting.bookedBy,
        location: meeting.bookedRoom.location,
        client: isClient
          ? meeting.client.clientName
          : meeting.externalClient
          ? null
          : "BIZ Nest",
        externalClient: meeting.externalClient
          ? meeting.externalClient.companyName
          : null,
        paymentAmount: meeting.paymentAmount ? meeting.paymentAmount : null,
        paymentMode: meeting.paymentMode ? meeting.paymentMode : null,
        paymentStatus: meeting.paymentStatus ? meeting.paymentStatus : null,
        meetingType: meeting.meetingType,
        housekeepingStatus: meeting.houeskeepingStatus,
        date: meeting.startDate,
        endDate: meeting.endDate,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        extendTime: meeting.extendTime,
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
            : clientParticipants[index].length > 0
            ? clientParticipants[index]
            : meeting.externalParticipants,
        reviews: meetingReviews ? meetingReviews : [],
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
    const { user, company, roles } = req;

    let meetings = [];

    meetings = await Meeting.find({
      company,
      $or: [
        { bookedBy: user },
        {
          internalParticipants: { $in: [new mongoose.Types.ObjectId(user)] },
        },
        {
          externalParticipants: { $in: [new mongoose.Types.ObjectId(user)] },
        },
      ],
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
      .populate([
        {
          path: "bookedBy",
          selected: "firstName lastName email departments",
          populate: { path: "departments" },
        },
        { path: "clientBookedBy", select: "employeeName email" },
        {
          path: "receptionist",
          select: "firstName lastName departments",
          populate: { path: "departments", select: "name" },
        },
        { path: "client", select: "clientName" },
        // {
        //   path: "externalClient",
        //   select: "companyName pocName mobileNumber",
        // },
        { path: "internalParticipants", select: "firstName lastName email" },
        { path: "clientParticipants", select: "employeeName email" },
        { path: "externalParticipants", select: "firstName lastName email" },
      ]);

    const reviews = await Review.find().select(
      "-createdAt -updatedAt -__v -company"
    );

    if (!reviews) {
      return res.status(400).json({ message: "No reviews found" });
    }

    const internalParticipants = meetings.map((meeting) =>
      meeting.internalParticipants.map((participant) => participant)
    );

    const clientParticipants = meetings.map((meeting) =>
      meeting.clientParticipants.map((participant) => participant)
    );

    const transformedMeetings = meetings.map((meeting, index) => {
      let totalParticipants = [];
      if (
        internalParticipants[index].length &&
        clientParticipants[index].length &&
        meeting.externalParticipants.length
      ) {
        totalParticipants = [
          ...internalParticipants[index],
          ...meeting.externalParticipants,
        ];
      }

      const meetingReviews = reviews.find(
        (review) => review.meeting.toString() === meeting._id.toString()
      );

      const isClient = meeting.client ? true : false;

      const bookedBy = meeting.bookedBy
        ? [
            meeting.bookedBy.firstName,
            meeting.bookedBy.middleName,
            meeting.bookedBy.lastName,
          ]
            .filter(Boolean)
            .join(" ")
        : "";

      const isReceptionist = meeting.receptionist.departments.some(
        (dept) => dept.name === "Administration"
      );

      let receptionist;
      if (isReceptionist) {
        receptionist = meeting.receptionist
          ? [
              meeting.receptionist.firstName,
              meeting.receptionist.middleName,
              meeting.receptionist.lastName,
            ]
              .filter(Boolean)
              .join(" ")
          : "";
      }

      return {
        _id: meeting._id,
        receptionist: receptionist,
        bookedBy: bookedBy,
        clientBookedBy: meeting.clientBookedBy,
        department: meeting?.bookedBy?.departments,
        roomName: meeting.bookedRoom.name,
        location: meeting.bookedRoom.location,
        client: isClient
          ? meeting.client.clientName
          : meeting.externalClient
          ? null
          : "BIZ Nest",
        externalClient: meeting.externalClient
          ? meeting.externalClient.companyName
          : null,
        paymentAmount: meeting.paymentAmount ? meeting.paymentAmount : null,
        paymentMode: meeting.paymentMode ? meeting.paymentMode : null,
        paymentStatus: meeting.paymentStatus ? meeting.paymentStatus : null,
        meetingType: meeting.meetingType,
        housekeepingStatus: meeting.houeskeepingStatus,
        date: meeting.startDate,
        endDate: meeting.endDate,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        extendTime: meeting.extendTime,
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
            : clientParticipants[index].length > 0
            ? clientParticipants[index]
            : meeting.externalParticipants,
        reviews: meetingReviews ? meetingReviews : [],
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
    const user = req.user;

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
      {
        $set: { housekeepingChecklist: completedTasks },
        houeskeepingStatus: "Completed",
      },
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

    const adminManager = await UserData.aggregate([
      {
        $lookup: {
          from: "roles",
          localField: "role",
          foreignField: "_id",
          as: "roleDetails",
        },
      },
      {
        $unwind: "$roleDetails",
      },
      {
        $match: {
          "roleDetails.roleTitle": "Administration Admin",
        },
      },
    ]);

    if (!adminManager) {
      return res
        .send(400)
        .json({ message: "Administration Admin role not found" });
    }

    const adminIds = adminManager.map((admin) => admin._id);

    const isClient = foundMeeting.clientBookedBy;

    if (!isClient) {
      emitter.emit("notification", {
        initiatorData: user,
        users: adminIds.map((userId) => ({
          userActions: { whichUser: userId, hasRead: false },
        })),
        type: "update checklist",
        module: "Meetings",
        message: "Housekeeping checklist is updated",
      });
    }

    return res
      .status(200)
      .json({ message: "Housekeeping tasks added successfully" });
  } catch (error) {
    next(error);
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
        endTime: meeting.endTime,
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
  const { reason } = req.body;
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

    if (
      typeof reason !== "string" ||
      !reason.length ||
      reason.replace(/\s/g, "").length > 100
    ) {
      throw new CustomError(
        "Reason should be within 100 characters",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const cancelledMeeting = await Meeting.findByIdAndUpdate(
      meetingId,
      { status: "Cancelled" },
      { reason },
      { new: true }
    ).populate({ path: "bookedBy", select: "firstName lastName" });

    if (!cancelledMeeting) {
      throw new CustomError(
        "Meeting not found, please check the ID",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const isClient = cancelledMeeting.clientBookedBy;

    if (!isClient && cancelledMeeting.internalParticipants.length > 0) {
      const bookedBy = cancelledMeeting.bookedBy;
      emitter.emit("notification", {
        initiatorData: user,
        users: cancelledMeeting.internalParticipants.map((userId) => ({
          userActions: { whichUser: userId, hasRead: false },
        })),
        type: "cancel meeting",
        module: "Meetings",
        message: `Your meeting has been cancelled by ${bookedBy.firstName} ${bookedBy.lastName}`,
      });
    }

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

    const meeting = await Meeting.findById(meetingId).populate([
      { path: "bookedRoom" },
      { path: "bookedBy", select: "firstName lastName" },
    ]);
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
      bookedRoom: meeting.bookedRoom._id,
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

    // Step 1: Calculate additional duration
    const oldEndTime = new Date(meeting.endTime);
    const addedMs = newEndTimeObj - oldEndTime;
    const addedHours = addedMs / (1000 * 60 * 60);

    const creditPerHour = meeting.bookedRoom.perHourCredit || 0;
    const addedCredits = addedHours * creditPerHour;

    // Step 2: Deduct credits from the user
    const isClient = !!meeting.externalClient;
    const bookingUserModel = isClient ? CoworkingClient : User;
    const bookingUserId = isClient ? meeting.externalClient : meeting.bookedBy;

    const bookingUser = await bookingUserModel.findById(bookingUserId);
    if (!bookingUser) {
      throw new CustomError(
        "Booking user not found for credit deduction",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (bookingUser.credits < addedCredits) {
      throw new CustomError(
        "Insufficient credits to extend this meeting",
        logPath,
        logAction,
        logSourceKey
      );
    }

    // Atomic deduction of credits
    await bookingUserModel.findOneAndUpdate(
      { _id: bookingUserId },
      { $inc: { credits: -addedCredits } }
    );

    // Step 3: Update meeting details
    // meeting.endTime = newEndTimeObj;
    // meeting.endDate = newEndTimeObj;
    meeting.extendTime = newEndTimeObj;
    meeting.creditsUsed = (meeting.creditsUsed || 0) + addedCredits;
    await meeting.save();

    const isInternal = meeting.bookedBy;

    if (isInternal && meeting.internalParticipants.length > 0) {
      const bookedBy = meeting.bookedBy;
      emitter.emit("notification", {
        initiatorData: user,
        users: meeting.internalParticipants.map((userId) => ({
          userActions: { whichUser: userId, hasRead: false },
        })),
        type: "extend meeting",
        module: "Meetings",
        message: `Your meeting has been extended by ${bookedBy.firstName} ${bookedBy.lastName}`,
      });
    }

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
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ message: "Invalid room Id provided" });
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

    // No date formatting here
    res.status(200).json(meetings);
  } catch (error) {
    next(error);
  }
};

//Update payment details
const updateMeeting = async (req, res, next) => {
  const logPath = "meetings/MeetingLog";
  const logAction = "Update Meeting Time";
  const logSourceKey = "meeting";

  try {
    const { user, ip, company } = req;
    const { paymentAmount, paymentMode, paymentStatus } = req.body;
    const { meetingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(meetingId)) {
      return res.status(400).json({ message: "Invalid meeting Id provided" });
    }

    const updatedMeeting = await Meeting.findByIdAndUpdate(
      meetingId,
      {
        paymentAmount,
        paymentMode,
        paymentStatus: paymentStatus === "Paid" ? true : false,
      },
      { new: true }
    ).populate([
      { path: "bookedRoom" },
      { path: "externalClient", select: "clientCompany" },
    ]);

    if (!updatedMeeting) {
      throw new CustomError(
        "Meeting not found",
        logPath,
        logAction,
        logSourceKey
      );
    }

    if (updatedMeeting.meetingType !== "External") {
      throw new CustomError(
        "Meeting type is not external",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const durationInMs = updatedMeeting.endTime - updatedMeeting.startTime;
    const durationInHours = durationInMs / (1000 * 60 * 60);
    const perHourCost = updatedMeeting.bookedRoom.perHourPrice;
    const amountToBePaid = durationInHours * perHourCost;

    const isValidAmount = Number(paymentAmount) === amountToBePaid;

    // if (!isValidAmount) {
    //   throw new CustomError(
    //     `Actual amount is INR ${amountToBePaid}`,
    //     logPath,
    //     logAction,
    //     logSourceKey
    //   );
    // }

    const meetingRevenue = new MeetingRevenue({
      date: updatedMeeting.startDate,
      company,
      clientName: updatedMeeting.externalClient.clientCompany,
      particulars: "Meeting room booking",
      costPerHour: updatedMeeting.bookedRoom.perHourPrice,
      totalAmount: paymentAmount,
      paymentDate: updatedMeeting.startDate,
      remarks: paymentMode,
      // meetingRoomName: updatedMeeting.bookedRoom.name,
      meeting: updatedMeeting._id,
      hoursBooked: durationInHours,
    });

    savedRevenue = await meetingRevenue.save();

    if (!savedRevenue) {
      throw new CustomError(
        "Failed to save meeting revenue",
        logPath,
        logAction,
        logSourceKey
      );
    }

    const updatedVisitor = await Visitor.findOneAndUpdate(
      {
        clientCompany: updatedMeeting.externalClient.clientCompany,
      },
      {
        meeting: updatedMeeting._id,
      }
    );

    if (!updatedVisitor) {
      throw new CustomError(
        "Failed to save meeting revenue",
        logPath,
        logAction,
        logSourceKey
      );
    }

    return res.status(200).json({ message: "Meeting updated successfully" });
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

const updateMeetingStatus = async (req, res, next) => {
  const { status, meetingId } = req.body;
  const { user } = req;
  const updatedMeeting = await Meeting.findByIdAndUpdate(
    meetingId,
    { status },
    { new: true }
  ).populate("bookedBy", "firstName lastName");

  const updateRoomStatus = await Room.findByIdAndUpdate(
    {
      _id: updatedMeeting.bookedRoom,
    },
    { status: "Available" },
    { new: true }
  );

  if (!updatedMeeting) {
    return res.status(404).json({ message: "Meeting not found" });
  }
  if (!updateRoomStatus) {
    return res.status(404).json({ message: "Failed to update room status" });
  }

  const isClient = updatedMeeting.clientBookedBy;

  const statusChart = {
    Ongoing: "Your meeting is currently ongoing",
    Completed: "Your meeting has concluded",
  };

  if (!isClient && updatedMeeting.internalParticipants.length > 0) {
    emitter.emit("notification", {
      initiatorData: user,
      users: updatedMeeting.internalParticipants.map((userId) => ({
        userActions: { whichUser: userId, hasRead: false },
      })),
      type: "update status",
      module: "Meetings",
      message: statusChart[status],
    });
  }

  return res
    .status(200)
    .json({ message: "Meeting status updated successfully" });
};

const getAllCompanies = async (req, res, next) => {
  const { company } = req;

  //Fetching all the companies
  const foundCompany = await Company.find({ _id: company }).select(
    "companyName"
  );
  const coworkingCompanies = await CoworkingClient.find({ company }).select(
    "clientName"
  );
  const visitorCompanies = await ExternalCompany.find().select("companyName");

  if (!foundCompany) {
    return res.status(404).json({ message: "No company found" });
  }

  if (!coworkingCompanies) {
    return res.status(404).json({ message: "No coworking company found" });
  }

  if (!visitorCompanies) {
    return res.status(404).json({ message: "No visitor company found" });
  }

  //Fetching all the members

  const companyEmployees = await UserData.find({ company })
    .populate([{ path: "company", select: "companyName" }])
    .select("firstName middleName lastName email")
    .lean()
    .exec();

  const coworkingMembers = await CoworkingMembers.find({ company })
    .populate([{ path: "client", select: "clientName email" }])
    .select("employeeName email")
    .lean()
    .exec();

  const visitorMembers = await Visitor.find({ company })
    .select("firstName middleName lastName email visitorCompany")
    .lean()
    .exec();

  //Adding members to each company data

  const companyWithMembers = foundCompany.map((client) => {
    return {
      ...client._doc,
      members: companyEmployees.filter(
        (member) => member?.company._id.toString() === client?._id.toString()
      ),
    };
  });

  const coworkingWithMembers = coworkingCompanies.map((client) => {
    return {
      ...client._doc,
      members: coworkingMembers.filter(
        (member) => member?.client._id.toString() === client?._id.toString()
      ),
    };
  });

  const visitorWithMembers = visitorCompanies.map((client) => {
    return {
      ...client._doc,
      members: visitorMembers.filter((member) => {
        return (
          member?.visitorCompany &&
          member?.visitorCompany === client.companyName
        );
      }),
    };
  });

  const allCompanies = [
    ...companyWithMembers,
    ...coworkingWithMembers,
    ...visitorWithMembers,
  ];

  return res.status(200).json(allCompanies);
};

const updateMeetingDetails = async (req, res, next) => {
  try {
    const {
      meetingId,
      startTime,
      endTime,
      internalParticipants,
      clientParticipants,
      externalParticipants,
      paymentAmount,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(meetingId)) {
      return res.status(400).json({ message: "Invalid meeting ID" });
    }

    // if (
    //   externalParticipants &&
    //   externalParticipants.length > 0 &&
    //   !paymentAmount
    // ) {
    //   return res.status(400).json({ message: "Payment amount required" });
    // }

    const meeting = await Meeting.findById(meetingId).populate([
      { path: "bookedRoom" },
      { path: "bookedBy", select: "firstName lastName" },
    ]);
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    const internalMeetingParticipants =
      internalParticipants && internalParticipants.length > 0
        ? internalParticipants
        : clientParticipants && clientParticipants.length > 0
        ? clientParticipants
        : [];

    const isClient = !!meeting.clientBookedBy;
    const BookingModel = isClient ? CoworkingMembers : User;
    const bookedUserId = isClient ? meeting.clientBookedBy : meeting.bookedBy;

    const currDate = new Date();
    const startTimeObj = new Date(startTime);
    const endTimeObj = new Date(endTime);

    if (isNaN(startTimeObj.getTime()) || isNaN(endTimeObj.getTime())) {
      return res.status(400).json({ message: "Invalid date/time format" });
    }

    const conflictingMeeting = await Meeting.findOne({
      _id: { $ne: meetingId },
      bookedRoom: meeting.bookedRoom._id,
      startDate: { $lte: currDate },
      endDate: { $gte: currDate },
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
      return res
        .status(409)
        .json({ message: "Room is already booked for the specified time" });
    }

    let internalUsers = [];
    if (internalMeetingParticipants) {
      const invalidIds = internalMeetingParticipants.filter(
        (id) => !mongoose.Types.ObjectId.isValid(id)
      );
      if (invalidIds.length > 0) {
        return res
          .status(400)
          .json({ message: "Invalid internal participant IDs" });
      }

      const users = await BookingModel.find({
        _id: { $in: internalMeetingParticipants },
      });
      const unmatchedIds = internalMeetingParticipants.filter(
        (id) => !users.find((u) => u._id.toString() === id.toString())
      );

      if (unmatchedIds.length > 0) {
        return res.status(400).json({
          message: "Some internal participant IDs did not match any user",
        });
      }

      internalUsers = users.map((u) => u._id);
    }

    const oldCreditsUsed = meeting.creditsUsed || 0;
    const durationInMs = endTimeObj - startTimeObj;
    const durationInHours = durationInMs / (1000 * 60 * 60);
    const creditPerHour = meeting.bookedRoom.perHourCredit || 0;
    const newCreditsUsed = durationInHours * creditPerHour;
    const creditDifference = newCreditsUsed - oldCreditsUsed;

    if (creditDifference > 0) {
      // Deduct extra credits
      const updatedUser = await BookingModel.findOneAndUpdate(
        {
          _id: bookedUserId,
          credits: { $gte: newCreditsUsed },
        },
        { $inc: { credits: -creditDifference } },
        { new: true }
      );

      if (!updatedUser) {
        return res
          .status(400)
          .json({ message: "Insufficient credits for the update" });
      }
    } else if (creditDifference < 0) {
      // Refund excess credits
      await BookingModel.findByIdAndUpdate(bookedUserId, {
        $inc: { credits: Math.abs(creditDifference) },
      });
    }

    const changes = {
      startTime: startTimeObj,
      endTime: endTimeObj,
      creditsUsed: newCreditsUsed,
      internalParticipants: !isClient ? internalUsers : [],
      clientParticipants: isClient ? internalUsers : [],
      externalParticipants: externalParticipants || [],
      paymentAmount: externalParticipants ? paymentAmount : 0,
    };

    const updatedMeeting = await Meeting.findByIdAndUpdate(
      meetingId,
      { $set: changes },
      { new: true }
    ).populate([
      { path: "bookedRoom" },
      { path: "externalClient", select: "clientCompany" },
    ]);

    // if (externalParticipants && externalParticipants.length > 0) {
    //   const meetingRevenue = await MeetingRevenue.findByIdAndUpdate({
    //     meeting: updatedMeeting._id,
    //     totalAmount: paymentAmount,
    //   });

    //   if (!meetingRevenue) {
    //     return res
    //       .status(400)
    //       .json({ message: "Failed to update the meeting revenue" });
    //   }

    //   const updatedVisitor = await Visitor.findOneAndUpdate(
    //     {
    //       clientCompany: updatedMeeting.externalClient.clientCompany,
    //     },
    //     {
    //       meeting: updatedMeeting._id,
    //     }
    //   );

    //   if (!updatedVisitor) {
    //     return res
    //       .status(400)
    //       .json({ message: "Failed to update the visitor" });
    //   }
    // }

    if (!updatedMeeting) {
      return res.status(500).json({ message: "Failed to update meeting" });
    }

    if (!isClient && internalParticipants?.length > 0) {
      const bookedBy = meeting.bookedBy;
      emitter.emit("notification", {
        initiatorData: bookedBy,
        users: internalParticipants.map((userId) => ({
          userActions: { whichUser: userId, hasRead: false },
        })),
        type: "update meeting",
        module: "Meetings",
        message: `Your meeting has been updated by ${bookedBy.firstName} ${bookedBy.lastName}`,
      });
    }

    return res.status(200).json({ message: "Meeting updated successfully" });
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
  getAllCompanies,
  getSingleRoomMeetings,
  updateMeetingStatus,
  updateMeeting,
  updateMeetingDetails,
};
