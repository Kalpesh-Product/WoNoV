const { getCreditOverage, getOveragePayment, allocateOveragePayment } = require("./meetingCreditOverage");
const { fetchMeetingReportService } = require("../../services/reports/meeting");
const {
  previousVerificationStatus,
  canVerifyInternalMeetingPayment,
  canAdvanceVerification,
} = require("../../utils/internalMeetingVerification");
const Meeting = require("../../models/meetings/Meetings");
const User = require("../../models/hr/UserData");
const { default: mongoose } = require("mongoose");
const Room = require("../../models/meetings/Rooms");
const { PDFDocument } = require("pdf-lib");
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
const CoworkingMember = require("../../models/sales/CoworkingMembers");
const { handleDocumentUpload, handleDocumentDelete } = require("../../config/s3Config");
const { resetMeetingCreditsIfNeeded } = require("../../utils/resetCredits");
const ExternalVisits = require("../../models/visitor/ExternalVisits");
const buildDateFilter = require("../../utils/dateFilter");
const setAuditLogContext = require("../../utils/auditLogContext");
const { getMeetingDepartments } = require("../../utils/meetingDepartments");
const { meetingOverlapFilter, getMeetingDurationHours } = require("../../utils/meetingSlots");

const hasExceededCredits = (meeting) => (meeting.creditsExceeded ?? meeting.toPay) === true;
const exceededCreditsFilter = {
  $or: [{ creditsExceeded: true }, { creditsExceeded: null, toPay: true }],
};

const getEffectiveEndTime = (meeting) => {
  const originalEndTime = new Date(meeting?.endTime);
  const extendedEndTime = meeting?.extendTime
    ? new Date(meeting.extendTime)
    : null;

  return extendedEndTime &&
    !isNaN(extendedEndTime.getTime()) &&
    extendedEndTime > originalEndTime
    ? extendedEndTime
    : originalEndTime;
};

const calculateCredits = (startTime, endTime, creditPerHour) =>
  Number(
    (
      ((new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60)) *
      Number(creditPerHour || 0)
    ).toFixed(2),
  );

const recalculateAndUpdatePayment = ({
  meeting,
  paymentAmount,
  paymentBaseAmount,
  paymentGstAmount,
  discountAmount,
  paymentMode,
  paymentStatus,
}) => {
  const durationInHours = Number(getMeetingDurationHours(meeting).toFixed(2));
  const perHourCost = Number(meeting.bookedRoom?.perHourPrice || 0);
  const calculatedBaseAmount = Number(
    (durationInHours * perHourCost).toFixed(2),
  );
  const resolvedBaseAmount = Number(
    paymentBaseAmount ?? paymentAmount ?? calculatedBaseAmount,
  );
  const resolvedGstAmount = Number(
    paymentGstAmount ?? (resolvedBaseAmount * 18) / 100,
  );
  const resolvedPaymentAmount = Number(
    paymentAmount ?? resolvedBaseAmount + resolvedGstAmount,
  );

  meeting.paymentBaseAmount = resolvedBaseAmount;
  meeting.paymentGstAmount = resolvedGstAmount;
  meeting.paymentAmount = resolvedPaymentAmount;
  if (paymentMode !== undefined) {
    meeting.paymentMode = paymentMode;
  }
  if (paymentStatus !== undefined) {
    meeting.paymentStatus = paymentStatus === "Paid";
  }
  meeting.discountAmount = Number(discountAmount ?? 0);

  return {
    durationInHours,
    resolvedBaseAmount,
    resolvedGstAmount,
    resolvedPaymentAmount,
  };
};

const getMonthStartUTC = (date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));

const addMeetings = async (req, res, next) => {
  const logPath = "meetings/MeetingLog";
  const logAction = "Book Meeting";
  const logSourceKey = "meeting";

  let bookingLockToken;
  let lockedRoomId;

  try {
    const {
      meetingType,
      bookedRoom,
      bookedBy,
      clientBookedBy,
      startDate,
      endDate,
      startTime,
      endTime,
      subject,
      agenda,
      client,
      externalCompany,
      internalParticipants,
      clientParticipants,
      externalParticipants,
      paymentAmount,
      paymentStatus,
      paymentMode,
    } = req.body;

    const company = req.company;
    const user = req.user;
    const ip = req.ip;
    let isClient = client ? company.toString() !== client.toString() : false;
    let resolvedClientBookedBy = clientBookedBy;

    if (meetingType === "Internal" && isClient && !bookedBy && !resolvedClientBookedBy) {
      const normalizeText = (value) =>
        String(value || "").trim().toLowerCase();

      const currentUser = await User.findById(user)
        .select("email firstName lastName phone")
        .lean();

      const currentUserFullName = normalizeText(
        [currentUser?.firstName, currentUser?.lastName]
          .filter(Boolean)
          .join(" "),
      );

      const memberLookupConditions = [
        ...(currentUser?.email ? [{ email: currentUser.email }] : []),
        ...(currentUserFullName ? [{ employeeName: currentUserFullName }] : []),
        ...(currentUser?.phone ? [{ mobileNo: currentUser.phone }] : []),
      ];

      const currentClientMembers = memberLookupConditions.length
        ? await CoworkingMembers.find({
            client,
            $or: memberLookupConditions,
          })
            .select("_id")
            .collation({ locale: "en", strength: 2 })
            .lean()
        : [];

      const fallbackClientMembers =
        currentClientMembers.length || !memberLookupConditions.length
          ? []
          : await CoworkingMembers.find({
              $or: memberLookupConditions,
            })
              .select("_id")
              .collation({ locale: "en", strength: 2 })
              .lean();

      resolvedClientBookedBy = (
        currentClientMembers.length > 0
          ? currentClientMembers
          : fallbackClientMembers
      )[0]?._id || null;
    }

    if (
      !meetingType ||
      !startDate ||
      !endDate ||
      !startTime ||
      !endTime ||
      !subject ||
      !agenda ||
      // (meetingType === "Internal" && !bookedBy) ||
      (meetingType === "Internal" && !bookedBy && !resolvedClientBookedBy) ||
      (meetingType === "Internal" && !client) ||
      (meetingType === "External" && !externalCompany) ||
      (meetingType === "External" &&
        (!Array.isArray(externalParticipants) ||
          externalParticipants.length === 0))
    ) {
      throw new CustomError(
        "Missing required fields",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    if (client && !mongoose.Types.ObjectId.isValid(client)) {
      throw new CustomError(
        "Invalid client Id provided",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    if (meetingType === "External") {
      if (!mongoose.Types.ObjectId.isValid(externalCompany)) {
        throw new CustomError(
          "Invalid external visitor Id provided",
          logPath,
          logAction,
          logSourceKey,
        );
      }

      const externalVisitorExists = await Visitor.exists({
        _id: externalCompany,
        company,
      });
      if (!externalVisitorExists) {
        throw new CustomError(
          "External visitor not found in this company",
          logPath,
          logAction,
          logSourceKey,
        );
      }
    }

    if (!mongoose.Types.ObjectId.isValid(bookedRoom)) {
      throw new CustomError(
        "Invalid Room Id provided",
        logPath,
        logAction,
        logSourceKey,
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
        logSourceKey,
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
        logSourceKey,
      );
    }

    bookingLockToken = new mongoose.Types.ObjectId().toString();
    lockedRoomId = roomAvailable._id;
    const lockNow = new Date();
    const lockedRoom = await Room.findOneAndUpdate(
      {
        _id: roomAvailable._id,
        status: "Available",
        $or: [
          { bookingLockExpiresAt: { $exists: false } },
          { bookingLockExpiresAt: { $lte: lockNow } },
        ],
      },
      {
        $set: {
          bookingLockToken,
          bookingLockExpiresAt: new Date(lockNow.getTime() + 5 * 60 * 1000),
        },
      },
      { new: true },
    );

    if (!lockedRoom) {
      throw new CustomError(
        "Room booking is currently being processed. Please try again.",
        logPath,
        logAction,
        logSourceKey,
        409,
      );
    }

    const normalizeParticipantIds = (ids = []) =>
      Array.from(
        new Set(
          (Array.isArray(ids) ? ids : [])
            .filter(Boolean)
            .map((id) => String(id).trim())
            .filter(Boolean),
        ),
      );

    const internalParticipantIds = normalizeParticipantIds(internalParticipants);
    const clientParticipantIds = normalizeParticipantIds(clientParticipants);
    const requestedParticipantIds = Array.from(
      new Set([...internalParticipantIds, ...clientParticipantIds]),
    );

    let internalUsers = [];
    let clientUsers = [];

    if (requestedParticipantIds.length > 0) {
      const invalidIds = requestedParticipantIds.filter(
        (id) => !mongoose.Types.ObjectId.isValid(id),
      );

      if (invalidIds.length > 0) {
        throw new CustomError(
          "Invalid internal participant IDs",
          logPath,
          logAction,
          logSourceKey,
        );
      }

      const [matchedInternalUsers, matchedClientUsers] = await Promise.all([
        User.find({ _id: { $in: requestedParticipantIds } }).select("_id"),
        CoworkingMembers.find({ _id: { $in: requestedParticipantIds } }).select(
          "_id",
        ),
      ]);

      const internalIdSet = new Set(
        matchedInternalUsers.map((user) => user._id.toString()),
      );
      const clientIdSet = new Set(
        matchedClientUsers.map((user) => user._id.toString()),
      );

      const unmatchedIds = requestedParticipantIds.filter(
        (id) => !internalIdSet.has(id) && !clientIdSet.has(id),
      );

      if (unmatchedIds.length > 0) {
        throw new CustomError(
          "Some internal participant IDs did not match any user",
          logPath,
          logAction,
          logSourceKey,
        );
      }

      internalUsers = matchedInternalUsers.map((user) => user._id);
      clientUsers = matchedClientUsers.map((user) => user._id);
    }

    const conflictingMeeting = await Meeting.findOne({
      bookedRoom: roomAvailable._id,
      status: { $ne: "Cancelled" },
      ...meetingOverlapFilter(startTimeObj, endTimeObj),
    });

    if (conflictingMeeting) {
      throw new CustomError(
        "Room is already booked for the specified time",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    // Calculate meeting duration and credit deduction

    const durationInMinutes = (endTimeObj - startTimeObj) / (1000 * 60);

    if (durationInMinutes <= 0) {
      throw new CustomError(
        "End time must be greater than start time",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const creditPerHour = roomAvailable.perHourCredit || 0;

    const totalCreditsUsed =
      meetingType === "Internal"
        ? Number(((durationInMinutes / 60) * creditPerHour).toFixed(2))
        : 0;

    // const durationInMs = endTimeObj - startTimeObj;
    // const durationInHours = durationInMs / (1000 * 60 * 60);
    // const creditPerHour = roomAvailable.perHourCredit || 0;
    // const totalCreditsUsed =
    //   meetingType === "Internal" ? durationInHours * creditPerHour : 0;

    // Atomically deduct credits using findOneAndUpdate with credit check

    const bookingUser = bookedBy
      ? await User.findById(bookedBy)
      : isClient && resolvedClientBookedBy
        ? await CoworkingMembers.findById(resolvedClientBookedBy)
        : null;

    const meetingParticipants = Array.from(
      new Set(
        [
          ...(Array.isArray(internalUsers) ? internalUsers : []),
          ...(Array.isArray(clientUsers) ? clientUsers : []),
          bookingUser?._id || null,
        ]
          .filter(Boolean)
          .map((id) => id.toString()),
      ),
    ).map((id) => new mongoose.Types.ObjectId(id));

    const normalizeEmail = (value) =>
      String(value || "").trim().toLowerCase();

    const departmentManagerRecipientIds = async () => {
      const departmentIds = Array.isArray(req.departments)
        ? req.departments.filter(Boolean)
        : [];

      if (!departmentIds.length) {
        return [];
      }

      const userDepartments = await UserData.find({
        company: req.company,
        departments: { $in: departmentIds },
        isActive: true,
      })
        .populate([
          { path: "role", select: "roleTitle" },
          { path: "departments", select: "name" },
        ])
        .select("_id firstName lastName");

      const managerIds = userDepartments
        .filter((user) =>
          user.departments?.some((department) =>
            user.role?.some((role) => {
              const roleTitle = String(role?.roleTitle || "");
              const departmentName = String(department?.name || "");
              return (
                roleTitle.startsWith(departmentName) &&
                (roleTitle.endsWith("Admin") || roleTitle.endsWith("Manager"))
              );
            }),
          ),
        )
        .map((user) => user._id.toString());

      return Array.from(new Set(managerIds)).map(
        (id) => new mongoose.Types.ObjectId(id),
      );
    };

    const notificationRecipientIds = async () => {
      if (!isClient) {
        const managerRecipientIds = await departmentManagerRecipientIds();
        return Array.from(
          new Set(
            [...meetingParticipants, ...managerRecipientIds].map((id) =>
              id.toString(),
            ),
          ),
        ).map((id) => new mongoose.Types.ObjectId(id));
      }

      const rawRecipientIds = Array.from(
        new Set(meetingParticipants.map((id) => id.toString())),
      );

      const coworkingMemberDocs = await CoworkingMembers.find({
        _id: { $in: rawRecipientIds },
      })
        .select("_id email")
        .lean()
        .exec();

      const memberEmailSet = new Set(
        coworkingMemberDocs
          .map((member) => normalizeEmail(member.email))
          .filter(Boolean),
      );

      const mappedUsers = memberEmailSet.size
        ? await User.find({
            email: { $in: Array.from(memberEmailSet) },
          })
            .select("_id email")
            .lean()
            .exec()
        : [];

      const userIdByEmail = new Map(
        mappedUsers.map((user) => [normalizeEmail(user.email), user._id]),
      );

      const recipientSet = new Set();

      rawRecipientIds.forEach((recipientId) => {
        const member = coworkingMemberDocs.find(
          (item) => item._id.toString() === recipientId,
        );

        if (member) {
          const mappedUserId = userIdByEmail.get(normalizeEmail(member.email));
          if (mappedUserId) {
            recipientSet.add(mappedUserId.toString());
          }
          return;
        }

        recipientSet.add(recipientId);
      });

      const managerRecipientIds = await departmentManagerRecipientIds();
      managerRecipientIds.forEach((managerId) =>
        recipientSet.add(managerId.toString()),
      );

      return Array.from(recipientSet).map((id) => new mongoose.Types.ObjectId(id));
    };

    const saveBooking = async (session = null) => {
      let overagePayment;
      if (meetingType === "Internal") {
        const BookingModel = isClient ? CoworkingClient : Company;

        const meetingDate = new Date(startTime);
        const meetingMonthStart = getMonthStartUTC(meetingDate);
        const now = new Date();
        const currentMonthStart = getMonthStartUTC(now);
        const isCurrentMonth =
          meetingMonthStart.getTime() === currentMonthStart.getTime();

        const creditRecord = await resetMeetingCreditsIfNeeded(
          BookingModel,
          client,
          meetingDate,
          session,
        );

        if (!creditRecord) {
          throw new CustomError(
            "Booking client/company not found",
            logPath,
            logAction,
            logSourceKey,
          );
        }

        const updateFields = {
          $inc: {
            "meetingCreditBalanceHistory.$.remainingCredit": -totalCreditsUsed,
            "meetingCreditBalanceHistory.$.consumedCredit": totalCreditsUsed,
          },
        };

        if (isCurrentMonth) {
          updateFields.$inc.meetingCreditBalance = -totalCreditsUsed;
        }

        const updatedCreditRecord = await BookingModel.findOneAndUpdate(
          {
            _id: client,
            meetingCreditBalanceHistory: {
              $elemMatch: {
                monthStartDate: {
                  $gte: new Date(
                    meetingMonthStart.getTime() - 12 * 60 * 60 * 1000,
                  ),
                  $lte: new Date(
                    meetingMonthStart.getTime() + 12 * 60 * 60 * 1000,
                  ),
                },
              },
            },
          },
          updateFields,
          { session },
        );

        if (!updatedCreditRecord) {
          throw new CustomError(
            "Unable to update meeting credits for the selected month",
            logPath,
            logAction,
            logSourceKey,
          );
        }

        if (isClient) {
          const credits = getCreditOverage(updatedCreditRecord, meetingMonthStart, totalCreditsUsed);
          if (credits > 0) {
            overagePayment = getOveragePayment(roomAvailable, [{ monthStart: meetingMonthStart, credits }]);
          }
        }
      }

      const meeting = new Meeting({
        meetingType,
        creditsExceeded: false,
         bookedBy: meetingType === "Internal" && bookedBy ? bookedBy : null,
        clientBookedBy:
          meetingType === "Internal" && isClient && resolvedClientBookedBy
            ? resolvedClientBookedBy
            : null,
        externalBookedBy: meetingType === "External" ? bookedBy : null,
        receptionist: user,
        startDate: startDateObj,
        endDate: endDateObj,
        startTime: startTimeObj,
        endTime: endTimeObj,
        bookedRoom: roomAvailable._id,
        subject,
        agenda,
        creditsUsed: totalCreditsUsed,
        ...overagePayment,
        client: meetingType === "Internal" ? client : null,
        externalClient: meetingType === "External" ? externalCompany : null,
        company,
        status: "Upcoming",
        internalParticipants: internalUsers,
        clientParticipants: clientUsers,
        externalParticipants: externalParticipants || [],
      });

      if (session) meeting.$session(session);
      const savedMeeting = await meeting.save();
      return savedMeeting;
    };

    const savedMeeting = meetingType === "Internal"
      ? await mongoose.connection.transaction(saveBooking)
      : await saveBooking();

    const notificationRecipients = await notificationRecipientIds();

    if (bookingUser && notificationRecipients.length > 0) {
      const bookingUserName = bookingUser?.firstName || bookingUser?.lastName
        ? `${bookingUser?.firstName || ""} ${bookingUser?.lastName || ""}`.trim()
        : bookingUser?.employeeName || bookingUser?.name || "Unknown";

      emitter.emit("notification", {
        initiatorData: bookingUser._id,
        users: notificationRecipients.map((userId) => ({
          userActions: {
            whichUser: userId,
            hasRead: false,
          },
        })),
        type: "book meeting",
        module: "Meetings",
        message: `You have been added to a meeting by ${bookingUserName}`,
      });
    }

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
      changes: savedMeeting,
    });

    return res.status(201).json({
      message: "Meeting added successfully",
    });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500),
      );
    }
  } finally {
    if (lockedRoomId && bookingLockToken) {
      await Room.updateOne(
        { _id: lockedRoomId, bookingLockToken },
        { $unset: { bookingLockToken: 1, bookingLockExpiresAt: 1 } },
      ).catch(() => {});
    }
  }
};

const getAvaliableUsers = async (req, res, next) => {
  try {
    const { startTime, endTime } = req.query;
    if (!startTime || !endTime) {
      return res.status(400).json({ message: "Start/End time missing" });
    }

    if (
      isNaN(new Date(startTime).getTime()) ||
      isNaN(new Date(endTime).getTime())
    ) {
      return res.status(400).json({ message: "Please provide a valid date" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const cancelledStatuses = [
      "Cancelled",
      "Canceled",
      "cancelled",
      "canceled",
    ];

    const meetings = await Meeting.find({
      company: req.company,
      status: { $nin: cancelledStatuses },
      ...meetingOverlapFilter(start, end),
    })
      .select(
        "bookedBy clientBookedBy internalParticipants clientParticipants startTime endTime extendTime bookingSlots",
      )
      .lean()
      .exec();

    const unavailableUserIds = new Set();
    meetings.forEach((meeting) => {
      if (meeting.bookedBy) unavailableUserIds.add(meeting.bookedBy.toString());
      if (meeting.clientBookedBy)
        unavailableUserIds.add(meeting.clientBookedBy.toString());
      if (meeting.internalParticipants) {
        meeting.internalParticipants.forEach((userId) =>
          unavailableUserIds.add(userId.toString()),
        );
      }

      if (meeting.clientParticipants) {
        meeting.clientParticipants.forEach((userId) =>
          unavailableUserIds.add(userId.toString()),
        );
      }
    });

    // Fetch all users and filter out unavailable ones
    const activeClientIds = await CoworkingClient.find({
      company: req.company,
      // _id: { $nin: Array.from(unavailableUserIds) },
      isActive: true,
    })
      .select("_id")
      .lean();

    const [availableUsers, availableClientMembers] = await Promise.all([
      User.find({
        company: req.company,
        _id: { $nin: Array.from(unavailableUserIds) },
        isActive: true,
      })
        .select("_id firstName lastName email")
        .lean()
        .exec(),
      CoworkingMembers.find({
        client: { $in: activeClientIds.map((client) => client._id) },
        _id: { $nin: Array.from(unavailableUserIds) },
      })
        .select("_id employeeName email client")
        .populate({ path: "client", select: "clientName" })
        .lean()
        .exec(),
    ]);

    const formattedClientMembers = availableClientMembers.map((member) => ({
      _id: member._id,
      employeeName: member.employeeName,
      email: member.email,
      client: member.client?._id || member.client,
      clientName: member.client?.clientName,
    }));

    const totalAvailableUsers = [...availableUsers, ...formattedClientMembers];

    res.status(200).json(totalAvailableUsers);
  } catch (error) {
    next(error);
  }
};

async function getMeetings(req, res, next) {
  try {
    const { user, company, roles, departments = [] } = req;
    const type = req.query?.type || req.type || "";
    const completed = req.query?.completed;
    const calendar = req.query?.calendar === "true";
    const includeTotal = req.query?.includeTotal === "true";
    const includeReviews = req.query?.includeReviews === "true";
    const { clientId } = req.query;
    if (clientId && !mongoose.isValidObjectId(clientId)) {
      return res.status(400).json({ message: "Invalid client ID" });
    }

    const requestFilters = req.query?.dateFilter ||
      req.query?.filters || {
        startDate:
          req.query?.["dateFilter[startDate]"] ||
          req.query?.["filters[startDate]"] ||
          req.query?.startDate,
        endDate:
          req.query?.["dateFilter[endDate]"] ||
          req.query?.["filters[endDate]"] ||
          req.query?.endDate,
      };
    const hasDateFilter = Boolean(
      requestFilters?.startDate || requestFilters?.endDate,
    );

    const payload = await fetchMeetingReportService({
      departments,
      roles,
      user,
      company,
      type,
      completed,
      calendar,
      includeTotal,
      includeReviews,
      includeInternalPaymentRevenue: req.query?.includeInternalPaymentRevenue === "true" &&
        canVerifyInternalMeetingPayment(departments, roles),
      clientId,
      page: req.query?.page,
      limit: req.query?.limit,
      search: req.query?.search,
      searchContext: req.query?.searchContext,
      ...(hasDateFilter && {
        dateFilter: buildDateFilter({
          startDate: requestFilters.startDate,
          endDate: requestFilters.endDate,
          field: "startDate",
          endExclusive: true,
        }),
      }),
    });

    return res.status(200).json(payload);
  } catch (error) {
    return next(error);
  }
}

async function getMeetingBookingCounts(req, res, next) {
  try {
    const { company } = req;
    const indiaDateParts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
    }).formatToParts(new Date());
    const currentYear = Number(
      indiaDateParts.find((part) => part.type === "year")?.value,
    );
    const currentMonth = Number(
      indiaDateParts.find((part) => part.type === "month")?.value,
    );
    const fiscalYearStart = currentMonth >= 4 ? currentYear : currentYear - 1;
    const rangeStart = new Date(
      `${fiscalYearStart}-04-01T00:00:00.000+05:30`,
    );
    const cutoffMonth = new Date(
      Date.UTC(currentYear, currentMonth - 2, 1),
    );
    const cutoffYear = cutoffMonth.getUTCFullYear();
    const cutoffMonthNumber = String(cutoffMonth.getUTCMonth() + 1).padStart(
      2,
      "0",
    );
    const rangeEnd = new Date(
      `${cutoffYear}-${cutoffMonthNumber}-01T00:00:00.000+05:30`,
    );
    const meetingBookingQuery = {
      company,
      startDate: { $gte: rangeStart, $lt: rangeEnd },
      status: "Completed",
    };
    const [internal, external] = await Promise.all([
      Meeting.countDocuments({
        ...meetingBookingQuery,
        meetingType: "Internal",
      }),
      Meeting.countDocuments({
        ...meetingBookingQuery,
        meetingType: "External",
      }),
    ]);

    return res.status(200).json({
      internal,
      external,
      total: internal + external,
      periodLabel: `FY ${fiscalYearStart}-${String(fiscalYearStart + 1).slice(-2)}`,
      throughMonth: new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        month: "long",
        year: "numeric",
      }).format(new Date(rangeEnd.getTime() - 1)),
    });
  } catch (error) {
    return next(error);
  }
}

// const getMeetings = async (req, res, next) => {
//   try {
//     const { user, company, roles, departments } = req;

//     const meetings = await Meeting.find({
//       company,
//     })
//       .populate({
//         path: "bookedRoom",
//         select: "name housekeepingStatus",
//         populate: {
//           path: "location",
//           select: "unitName unitNo",
//           populate: {
//             path: "building",
//             select: "buildingName",
//           },
//         },
//       })
//       .populate([
//         {
//           path: "bookedBy",
//           select: "departments firstName lastName email",
//           populate: { path: "departments", select: "name" },
//         },
//         { path: "clientBookedBy", select: "employeeName email" },
//         { path: "externalBookedBy", select: "firstName middleName lastName" },
//         {
//           path: "receptionist",
//           select: "firstName lastName departments",
//           populate: { path: "departments", select: "name" },
//         },
//         { path: "client", select: "clientName" },
//         { path: "externalClient", select: "registeredClientCompany" },
//         // { path: "externalClient", select: "companyName pocName mobileNumber" },
//         { path: "internalParticipants", select: "firstName lastName email" },
//         { path: "clientParticipants", select: "employeeName email" },
//         { path: "externalParticipants", select: "firstName lastName email" },
//       ]);

//     const departmentIds = departments.map((dept) => dept._id);

//     const department = await Department.find({
//       _id: { $in: departmentIds },
//     });

//     let filteredMeetings = meetings;

//     const currentUserId = user?.toString();

//     if (
//       !roles.includes("Administration Admin") &&
//       !roles.includes("Finance Admin") &&
//       !roles.includes("Administration Employee") &&
//       !roles.includes("Master Admin") &&
//       !roles.includes("Super Admin") &&
//       !roles.includes("Tech Admin") &&
//       !roles.includes("Tech Employee")
//     ) {
//       filteredMeetings = meetings.filter((meeting) => {
//         const isMeetingParticipant =
//           meeting?.bookedBy?._id?.toString() === currentUserId ||
//           meeting?.clientBookedBy?._id?.toString() === currentUserId ||
//           (meeting?.internalParticipants || []).some(
//             (participant) => participant?._id?.toString() === currentUserId,
//           ) ||
//           (meeting?.clientParticipants || []).some(
//             (participant) => participant?._id?.toString() === currentUserId,
//           );

//         if (isMeetingParticipant) return true;

//         if (!meeting.bookedBy || !Array.isArray(meeting.bookedBy.departments)) {
//           return false;
//         }

//         const bookedDeptIds = meeting.bookedBy.departments.map((dept) =>
//           dept._id?.toString(),
//         );

//         return bookedDeptIds.some((deptId) => departmentIds.includes(deptId));
//       });
//     }

//     const reviews = await Review.find().select(
//       "-createdAt -updatedAt -__v -company",
//     );

//     if (!reviews) {
//       return res.status(400).json({ message: "No reviews found" });
//     }

//     const internalParticipants = filteredMeetings.map((meeting) =>
//       meeting.internalParticipants.map((participant) => participant),
//     );
//     const clientParticipants = filteredMeetings.map((meeting) =>
//       meeting.clientParticipants.map((participant) => participant),
//     );

// const transformedMeetings = filteredMeetings.map((meeting, index) => {
//   // let totalParticipants = [];
//   // if (
//   //   internalParticipants[index].length &&
//   //   clientParticipants[index].length &&
//   //   meeting.externalParticipants.length
//   // ) {
//   //   totalParticipants = [
//   //     ...internalParticipants[index],
//   //     ...meeting.externalParticipants,
//   //   ];
//   // }
//   const totalParticipants = [
//     ...(internalParticipants[index] || []),
//     ...(clientParticipants[index] || []),
//     ...(meeting.externalParticipants || []),
//   ];

//   const meetingReviews = reviews.find(
//     (review) => review.meeting.toString() === meeting._id.toString(),
//   );

//   const isClient = meeting.client ? true : false;

//   const isReceptionist = meeting.receptionist.departments.some(
//     (dept) => dept.name === "Administration",
//   );

//   let receptionist;
//   if (isReceptionist) {
//     receptionist = meeting.receptionist
//       ? [
//           meeting.receptionist.firstName,
//           meeting.receptionist.middleName,
//           meeting.receptionist.lastName,
//         ]
//           .filter(Boolean)
//           .join(" ")
//       : "";
//   }

//   return {
//     _id: meeting._id,
//     name: meeting.bookedBy?.name,
//     receptionist: isReceptionist ? receptionist : "N/A",
//     // bookedBy: { ...meeting.bookedBy },
//     clientBookedBy: meeting.clientBookedBy,
//     department: meeting?.bookedBy?.departments,
//     roomName: meeting.bookedRoom.name,
//     bookedBy:
//       meeting.bookedBy ||
//       (meeting.externalBookedBy
//         ? {
//             _id: meeting.externalBookedBy._id,
//             firstName: meeting.externalBookedBy.firstName,
//             middleName: meeting.externalBookedBy.middleName,
//             lastName: meeting.externalBookedBy.lastName,
//           }
//         : null),
//     location: meeting.bookedRoom.location,
//     client: isClient
//       ? meeting.client.clientName
//       : meeting.externalClient
//         ? null
//         : "BIZNest",
//     externalClient: meeting.externalClient
//       ? meeting.externalClient.registeredClientCompany
//       : null,
//     paymentAmount: meeting.paymentAmount ? meeting.paymentAmount : null,
//     paymentMode: meeting.paymentMode ? meeting.paymentMode : null,
//     paymentStatus: meeting?.paymentStatus ? "Paid" : "Unpaid",
//     paymentProof: meeting.paymentProof ? meeting.paymentProof.link : null,
//     meetingType: meeting.meetingType,
//     housekeepingStatus: meeting.houeskeepingStatus,
//     date: meeting.startDate,
//     endDate: meeting.endDate,
//     startTime: meeting.startTime,
//     endTime: meeting.endTime,
//     extendTime: meeting.extendTime,
//     credits: meeting.credits,
//     duration: formatDuration(meeting.startTime, meeting.endTime),
//     meetingStatus: meeting.status,
//     action: meeting.extend,
//     agenda: meeting.agenda,
//     subject: meeting.subject,
//     housekeepingChecklist: [...(meeting.housekeepingChecklist ?? [])],
//     // participants:
//     //   totalParticipants.length > 0
//     //     ? totalParticipants
//     //     : internalParticipants[index].length > 0
//     //     ? internalParticipants[index]
//     //     : clientParticipants[index].length > 0
//     //     ? clientParticipants[index]
//     //     : meeting.externalParticipants,
//     participants: totalParticipants,
//     reviews: meetingReviews ? meetingReviews : [],
//     discountAmount: meeting.discountAmount,
//     paymentVerification: meeting.paymentVerification,
//     company: meeting.company,
//   };
// });

//     return res.status(200).json(transformedMeetings);
//   } catch (error) {
//     next(error);
//   }
// };

const getMyMeetings = async (req, res, next) => {
  try {
    const { user, company, roles } = req;

    let meetings = [];
    const normalizeText = (value) =>
      String(value || "")
        .trim()
        .toLowerCase();

    const currentUser = await User.findById(user)
      .select("email firstName lastName phone")
      .lean();

    const currentUserFullName = normalizeText(
      [currentUser?.firstName, currentUser?.lastName]
        .filter(Boolean)
        .join(" "),
    );

    const memberLookupConditions = [
      ...(currentUser?.email ? [{ email: currentUser.email }] : []),
      ...(currentUserFullName ? [{ employeeName: currentUserFullName }] : []),
      ...(currentUser?.phone ? [{ mobileNo: currentUser.phone }] : []),
    ];

    const currentClientMembers = memberLookupConditions.length
      ? await CoworkingMember.find({
          company,
          $or: memberLookupConditions,
        })
          .select("_id")
          .collation({ locale: "en", strength: 2 })
          .lean()
      : [];

    const fallbackClientMembers =
      currentClientMembers.length || !memberLookupConditions.length
        ? []
        : await CoworkingMember.find({
            $or: memberLookupConditions,
          })
            .select("_id")
            .collation({ locale: "en", strength: 2 })
            .lean();

    const currentClientMemberIds = (
      currentClientMembers.length > 0
        ? currentClientMembers
        : fallbackClientMembers
    ).map((member) => member._id);


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
         ...(currentClientMemberIds.length
          ? [
              { clientBookedBy: { $in: currentClientMemberIds } },
              { clientParticipants: { $in: currentClientMemberIds } },
            ]
          : []),
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
          select: "firstName lastName email departments",
          populate: { path: "departments" },
        },
        { path: "externalBookedBy", select: "firstName lastName" },
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
      "-createdAt -updatedAt -__v -company",
    );

    if (!reviews) {
      return res.status(400).json({ message: "No reviews found" });
    }

    const internalParticipants = meetings.map((meeting) =>
      meeting.internalParticipants.map((participant) => participant),
    );

    const clientParticipants = meetings.map((meeting) =>
      meeting.clientParticipants.map((participant) => participant),
    );

    const transformedMeetings = meetings.map((meeting, index) => {
      const totalParticipants = [
        ...(internalParticipants[index] || []),
        ...(clientParticipants[index] || []),
        ...(meeting.externalParticipants || []),
      ];

      const meetingReviews = reviews.find(
        (review) => review.meeting.toString() === meeting._id.toString(),
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

      const externalBookedBy = meeting.externalBookedBy
        ? [meeting.externalBookedBy.firstName, meeting.externalBookedBy.lastName]
            .filter(Boolean)
            .join(" ")
        : "";

      const isReceptionist = (meeting.receptionist?.departments || []).some(
        (dept) => dept.name === "Administration",
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

      const isCurrentUserInvolved = Boolean(
        meeting?.bookedBy?._id?.toString() === user?.toString() ||
          (meeting?.internalParticipants || []).some(
            (participant) => participant?._id?.toString() === user?.toString(),
          ) ||
          currentClientMemberIds.some(
            (memberId) =>
              memberId?.toString() ===
              meeting?.clientBookedBy?._id?.toString(),
          ) ||
          (meeting?.clientParticipants || []).some((participant) =>
            currentClientMemberIds.some(
              (memberId) => memberId?.toString() === participant?._id?.toString(),
            ),
          ),
      );
      const isCurrentUserBooked = Boolean(
        meeting?.bookedBy?._id?.toString() === user?.toString() ||
          currentClientMemberIds.some(
            (memberId) =>
              memberId?.toString() ===
              meeting?.clientBookedBy?._id?.toString(),
          ),
      );

      return {
        _id: meeting._id,
        receptionist: receptionist,
        bookedById: meeting?.bookedBy?._id || null,
        clientBookedById: meeting?.clientBookedBy?._id || null,
        isCurrentUserInvolved,
        isCurrentUserBooked,
        // bookedBy: bookedBy,
         bookedBy:
          bookedBy ||
          externalBookedBy ||
          meeting.clientBookedBy?.employeeName ||
          "Unknown",
        externalBookedBy: externalBookedBy || null,
        clientBookedBy: meeting.clientBookedBy,
        department: getMeetingDepartments(meeting),
        roomName: meeting.bookedRoom.name,
        location: meeting.bookedRoom.location,
        client: isClient
          ? meeting.client.clientName
          : meeting.externalClient
            ? null
            : "BIZNest",
        clientId: meeting.client?._id || null,
        externalClient: meeting.externalClient
          ? meeting.externalClient.companyName
          : null,
        paymentAmount: meeting.paymentAmount ? meeting.paymentAmount : null,
        paymentMode: meeting.paymentMode ? meeting.paymentMode : null,
        paymentStatus: meeting.paymentStatus ? meeting.paymentStatus : null,
        paymentProof: meeting.paymentProof ? meeting.paymentProof.link : null,
        meetingType: meeting.meetingType,
        housekeepingStatus:
          meeting.bookedRoom?.housekeepingStatus ||
          meeting.housekeepingStatus ||
          "N/A",
        date: meeting.startDate,
        endDate: meeting.endDate,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        bookingPeriod: meeting.bookingPeriod || "Day",
        bookingSlots: meeting.bookingSlots || [],
        extendTime: meeting.extendTime,
        credits: meeting.credits,
        duration: meeting.bookingSlots?.length
          ? `${Math.round(getMeetingDurationHours(meeting) * 60)}min`
          : formatDuration(meeting.startTime, getEffectiveEndTime(meeting)),
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
        discountAmount: meeting.discountAmount,
        paymentVerification: meeting.paymentVerification,
        company: meeting.company,
      };
    });

    return res.status(200).json(transformedMeetings);
  } catch (error) {
    next(error);
  }
};

const deleteMyMeeting = async (req, res, next) => {
  try {
    const { meetingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(meetingId)) {
      return res.status(400).json({ message: "Invalid meeting ID provided" });
    }

    const meeting = await Meeting.findOne({
      _id: meetingId,
      company: req.company,
      status: "Upcoming",
    })
      .populate("clientBookedBy", "email")
      .populate("clientParticipants", "email")
      .exec();

    if (!meeting) {
      return res.status(404).json({
        message: "Only your upcoming meetings can be deleted",
      });
    }

    const currentUser = await User.findById(req.user)
      .select("email firstName lastName phone")
      .lean();
    const currentUserFullName = [
      currentUser?.firstName,
      currentUser?.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim()
      .toLowerCase();
    const memberLookupConditions = [
      ...(currentUser?.email ? [{ email: currentUser.email }] : []),
      ...(currentUserFullName
        ? [{ employeeName: currentUserFullName }]
        : []),
      ...(currentUser?.phone ? [{ mobileNo: currentUser.phone }] : []),
    ];
    const companyMembers = memberLookupConditions.length
      ? await CoworkingMember.find({
          company: req.company,
          $or: memberLookupConditions,
        })
          .select("_id")
          .collation({ locale: "en", strength: 2 })
          .lean()
      : [];
    const fallbackMembers =
      companyMembers.length || !memberLookupConditions.length
        ? []
        : await CoworkingMember.find({ $or: memberLookupConditions })
            .select("_id")
            .collation({ locale: "en", strength: 2 })
            .lean();
    const currentClientMemberIds = (
      companyMembers.length ? companyMembers : fallbackMembers
    ).map((member) => member._id.toString());
    const isBookedByUser = meeting.bookedBy?.toString() === req.user.toString();
    const isInternalParticipant = meeting.internalParticipants.some(
      (participantId) => participantId.toString() === req.user.toString(),
    );
    const isClientUser =
      currentClientMemberIds.includes(
        meeting.clientBookedBy?._id?.toString(),
      ) ||
      meeting.clientParticipants.some((participant) =>
        currentClientMemberIds.includes(participant?._id?.toString()),
      );

    if (!isBookedByUser && !isInternalParticipant && !isClientUser) {
      return res.status(403).json({
        message: "You do not have permission to delete this meeting",
      });
    }

    if (meeting.meetingType === "Internal" && hasExceededCredits(meeting)) {
      return res.status(409).json({ message: "Cancel this meeting to reverse its credit deduction" });
    }
    await meeting.deleteOne();
    setAuditLogContext(req, "Permanently Delete Meeting", {
      meetingId: String(meeting._id),
      meetingSubject: meeting.subject,
      deletionType: "permanent",
    });

    return res.status(200).json({
      message: "Meeting permanently deleted successfully",
    });
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
        logSourceKey,
      );
    }

    if (!mongoose.Types.ObjectId.isValid(meetingId)) {
      throw new CustomError(
        "Invalid meeting id provided",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const inCompleteTasks = housekeepingTasks.filter(
      (task) => task.status === "Pending",
    );

    if (inCompleteTasks.length > 0) {
      throw new CustomError(
        "Please check out the tasks before submitting",
        logPath,
        logAction,
        logSourceKey,
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
      { new: true },
    );

    const room = await Room.findOneAndUpdate(
      { name: roomName },
      { housekeepingStatus: "Completed", status: "Available" },
      { new: true },
    );

    if (!foundMeeting) {
      throw new CustomError(
        "Failed to add the housekeeping tasks",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    if (!room) {
      throw new CustomError(
        "Failed to update the room status",
        logPath,
        logAction,
        logSourceKey,
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
        logSourceKey,
      );
    }

    if (!mongoose.Types.ObjectId.isValid(meetingId)) {
      throw new CustomError(
        "Invalid meeting ID provided",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const updatedMeeting = await Meeting.findByIdAndUpdate(
      meetingId,
      { $pull: { housekeepingChecklist: { name: housekeepingTask } } },
      { new: true },
    );

    if (!updatedMeeting) {
      throw new CustomError(
        "Failed to delete housekeeping task",
        logPath,
        logAction,
        logSourceKey,
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

    setAuditLogContext(req, "Delete Housekeeping Task", {
      meetingId: String(updatedMeeting._id),
      housekeepingTask,
      deletionType: "permanent",
    });

    return res.status(200).json({
      message: "Housekeeping task deleted successfully",
    });
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      next(
        new CustomError(error.message, logPath, logAction, logSourceKey, 500),
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
        "meeting",
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
        logSourceKey,
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
        logSourceKey,
      );
    }

    const cancelledMeeting = await mongoose.connection.transaction(async (session) => {
      const meetingToCancel = await Meeting.findOne({ _id: meetingId, company }).select(
        "status meetingType creditsUsed client internalParticipants bookedBy startTime bookingSlots creditsExceeded toPay paymentStatus",
      ).session(session);

      if (!meetingToCancel) {
        throw new CustomError(
          "Meeting not found, please check the ID",
          logPath,
          logAction,
          logSourceKey,
        );
      }

      if (meetingToCancel.bookingSlots?.length > 1) {
        throw new CustomError("Cancellation is not available for month bookings", logPath, logAction, logSourceKey, 400);
      }

      if (meetingToCancel.status === "Cancelled") {
        throw new CustomError(
          "Meeting is already cancelled",
          logPath,
          logAction,
          logSourceKey,
        );
      }

      if (meetingToCancel.meetingType === "Internal" && hasExceededCredits(meetingToCancel) && meetingToCancel.paymentStatus) {
        throw new CustomError("A meeting with a paid credit overage cannot be cancelled", logPath, logAction, logSourceKey, 409);
      }

      // Refund used credits only for internal meetings
      if (meetingToCancel.meetingType === "Internal") {
        const creditsToRefund = Number(meetingToCancel.creditsUsed || 0);
        const BookingModel = meetingToCancel.client && String(meetingToCancel.client) !== String(company)
          ? CoworkingClient
          : Company;

        if (meetingToCancel.client && creditsToRefund > 0) {
          const meetingDate = new Date(meetingToCancel.startTime || new Date());
          // const meetingMonthStart = new Date(
          //   meetingDate.getFullYear(),
          //   meetingDate.getMonth(),
          //   1,
          // );
          const meetingMonthStart = getMonthStartUTC(meetingDate);

          const now = new Date();
          // const currentMonthStart = new Date(
          //   now.getFullYear(),
          //   now.getMonth(),
          //   1,
          // );
          const currentMonthStart = getMonthStartUTC(now);
          const isCurrentMonth =
            meetingMonthStart.getTime() === currentMonthStart.getTime();

          const creditRecord = await resetMeetingCreditsIfNeeded(
            BookingModel,
            meetingToCancel.client,
            meetingDate,
            session,
          );

          if (!creditRecord) {
            throw new CustomError(
              "Booking client/company not found",
              logPath,
              logAction,
              logSourceKey,
            );
          }

          const updateFields = {
            $inc: {
              "meetingCreditBalanceHistory.$.remainingCredit": creditsToRefund,
              "meetingCreditBalanceHistory.$.consumedCredit": -creditsToRefund,
            },
          };

          if (isCurrentMonth) {
            updateFields.$inc.meetingCreditBalance = creditsToRefund;
          }

          await BookingModel.findOneAndUpdate(
            {
              _id: meetingToCancel.client,
              meetingCreditBalanceHistory: {
                $elemMatch: {
                  monthStartDate: {
                    $gte: new Date(
                      meetingMonthStart.getTime() - 12 * 60 * 60 * 1000,
                    ),
                    $lte: new Date(
                      meetingMonthStart.getTime() + 12 * 60 * 60 * 1000,
                    ),
                  },
                },
              },
            },
            updateFields,
            { session },
          );
        }
      }

      const cancelled = await Meeting.findByIdAndUpdate(
        meetingId,
        { $set: { status: "Cancelled", reason } },
        { new: true, session },
      ).populate({ path: "bookedBy", select: "firstName lastName" });

      if (!cancelled) {
        throw new CustomError(
          "Meeting not found, please check the ID",
          logPath,
          logAction,
          logSourceKey,
        );
      }
      return cancelled;
    });

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
        new CustomError(error.message, logPath, logAction, logSourceKey, 500),
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
  let extensionLockToken;
  let extensionLockedRoomId;

  try {
    if (!meetingId || !newEndTime) {
      throw new CustomError(
        "Meeting ID and new end time are required",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    if (!mongoose.Types.ObjectId.isValid(meetingId)) {
      throw new CustomError(
        "Invalid meeting ID",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    let meeting = await Meeting.findOne({ _id: meetingId, company }).populate([
      { path: "bookedRoom" },
      { path: "bookedBy", select: "firstName lastName" },
    ]);
    if (!meeting) {
      throw new CustomError(
        "Meeting not found",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    if (meeting.bookingSlots?.length > 1) {
      throw new CustomError("Extension is not available for month bookings", logPath, logAction, logSourceKey, 400);
    }

    extensionLockToken = new mongoose.Types.ObjectId().toString();
    extensionLockedRoomId = meeting.bookedRoom._id;
    const lockNow = new Date();
    const lockedRoom = await Room.findOneAndUpdate(
      {
        _id: extensionLockedRoomId,
        $or: [
          { bookingLockExpiresAt: { $exists: false } },
          { bookingLockExpiresAt: { $lte: lockNow } },
        ],
      },
      {
        $set: {
          bookingLockToken: extensionLockToken,
          bookingLockExpiresAt: new Date(lockNow.getTime() + 5 * 60 * 1000),
        },
      },
      { new: true },
    );

    if (!lockedRoom) {
      throw new CustomError(
        "Room timing is currently being updated. Please try again.",
        logPath,
        logAction,
        logSourceKey,
        409,
      );
    }

    meeting = await Meeting.findById(meetingId).populate([
      { path: "bookedRoom" },
      { path: "bookedBy", select: "firstName lastName" },
    ]);
    if (!meeting) {
      throw new CustomError(
        "Meeting not found",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const newEndTimeObj = new Date(newEndTime);
    if (isNaN(newEndTimeObj.getTime())) {
      throw new CustomError(
        "Invalid new end time format",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const normalizedNewEndTime = newEndTimeObj;
    const currentEffectiveEndTime = getEffectiveEndTime(meeting);

    if (normalizedNewEndTime <= currentEffectiveEndTime) {
      throw new CustomError(
        "New end time must be later than the current end time",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    // Check for conflicting meeting
    const conflictingMeeting = await Meeting.findOne({
      bookedRoom: meeting.bookedRoom._id,
      status: { $ne: "Cancelled" },
      ...meetingOverlapFilter(currentEffectiveEndTime, normalizedNewEndTime),
      _id: { $ne: meetingId },
    });
    if (conflictingMeeting) {
      throw new CustomError(
        "Room is already booked during the extended time",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    // Step 1: Calculate additional duration
    const creditPerHour = meeting.bookedRoom.perHourCredit || 0;
    const currentTotalCredits = calculateCredits(
      meeting.startTime,
      currentEffectiveEndTime,
      creditPerHour,
    );
    const newTotalCredits = calculateCredits(
      meeting.startTime,
      normalizedNewEndTime,
      creditPerHour,
    );
    const addedCredits = Number(
      (newTotalCredits - currentTotalCredits).toFixed(2),
    );

    // Step 2: Deduct credits from the user
    const isInternal = meeting.meetingType === "Internal";
    const isClient =
      isInternal &&
      meeting.client &&
      meeting.client.toString() !== company.toString();
    const bookingUserModel = isClient ? CoworkingClient : Company;
    if (isClient && addedCredits > 0 && hasExceededCredits(meeting) && meeting.paymentStatus) {
      return res.status(409).json({ message: "A meeting with a paid credit overage cannot be extended" });
    }


    const saveExtension = async (session = null) => {
      let overagePayment;
      if (isInternal) {
        // Ensure credit records are initialized for the month of the meeting
        const bookingUserCompany = await resetMeetingCreditsIfNeeded(
          bookingUserModel,
          meeting.client,
          meeting.startTime,
          session,
        );

        if (!bookingUserCompany) {
          throw new CustomError(
            "Booking user company not found for credit deduction",
            logPath,
            logAction,
            logSourceKey,
          );
        }

        const meetingMonthStart = getMonthStartUTC(new Date(meeting.startTime));

        const updateFields = {
          $inc: {
            "meetingCreditBalanceHistory.$.remainingCredit": -addedCredits,
            "meetingCreditBalanceHistory.$.consumedCredit": addedCredits,
          },
        };

        const now = new Date();
        const currentMonthStart = getMonthStartUTC(now);
        const isCurrentMonth =
          meetingMonthStart.getTime() === currentMonthStart.getTime();

        if (isCurrentMonth) {
          updateFields.$inc.meetingCreditBalance = -addedCredits;
        }

        // Atomic deduction across both balances using fuzzy date match for history entry
        const updatedCreditRecord = await bookingUserModel.findOneAndUpdate(
          {
            _id: meeting.client,
            meetingCreditBalanceHistory: {
              $elemMatch: {
                monthStartDate: {
                  $gte: new Date(
                    meetingMonthStart.getTime() - 12 * 60 * 60 * 1000,
                  ),
                  $lte: new Date(
                    meetingMonthStart.getTime() + 12 * 60 * 60 * 1000,
                  ),
                },
              },
            },
          },
          updateFields,
          { session },
        );

        if (!updatedCreditRecord) {
          throw new CustomError(
            "Unable to update meeting credits for the selected month",
            logPath,
            logAction,
            logSourceKey,
          );
        }

        if (isClient && addedCredits > 0) {
          const additionalOverage = getCreditOverage(updatedCreditRecord, meetingMonthStart, addedCredits);
          if (additionalOverage > 0) {
            overagePayment = getOveragePayment(meeting.bookedRoom, [{
              monthStart: meetingMonthStart,
              credits: (meeting.overageCredits || 0) + additionalOverage,
            }]);
          }
        }

      }

      const updatedMeeting = await Meeting.findOneAndUpdate(
        { _id: meeting._id, updatedAt: meeting.updatedAt, status: { $ne: "Cancelled" } },
        { $set: {
          extendTime: normalizedNewEndTime,
          creditsUsed: isInternal ? newTotalCredits : 0,
          ...overagePayment,
        } },
        { session, new: true, runValidators: true },
      );
      if (!updatedMeeting) {
        throw new CustomError("Meeting changed. Try extending it again.", logPath, logAction, logSourceKey, 409);
      }
    };

    if (isInternal) {
      await mongoose.connection.transaction(saveExtension);
    } else {
      await saveExtension();
    }

    const isInternalBooking = meeting.bookedBy;

    if (isInternalBooking && meeting.internalParticipants.length > 0) {
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
        new CustomError(error.message, logPath, logAction, logSourceKey, 500),
      );
    }
  } finally {
    if (extensionLockedRoomId && extensionLockToken) {
      await Room.updateOne(
        {
          _id: extensionLockedRoomId,
          bookingLockToken: extensionLockToken,
        },
        { $unset: { bookingLockToken: 1, bookingLockExpiresAt: 1 } },
      ).catch(() => {});
    }
  }
};

const getSingleRoomMeetings = async (req, res, next) => {
  const { roomId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ message: "Invalid room Id provided" });
    }

    const meetings = await Meeting.find({
      bookedRoom: roomId,
      company: req.company,
      $expr: {
        $gte: [
          { $max: ["$endTime", "$extendTime"] },
          new Date(Date.now() - 24 * 60 * 60 * 1000),
        ],
      },
    }).populate("bookedRoom", "_id name status description seats");

    // No date formatting here
    res.status(200).json(meetings);
  } catch (error) {
    next(error);
  }
};

//Update payment details
const uploadMeetingPaymentProof = async (company, reference, paymentProofFile) => {
  if (!paymentProofFile) return undefined;
  const logPath = "meetings/MeetingLog";
  const logAction = "Update Payment Status";
  const logSourceKey = "meeting";

  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/jpg",
  ];

  if (!allowedMimeTypes.includes(paymentProofFile.mimetype)) {
    throw new CustomError(
      "Invalid payment proof file type",
      logPath,
      logAction,
      logSourceKey,
    );
  }

  let processedBuffer = paymentProofFile.buffer;
  const originalFilename = paymentProofFile.originalname;

  if (paymentProofFile.mimetype === "application/pdf") {
    try {
      const pdfDoc = await PDFDocument.load(paymentProofFile.buffer);
      pdfDoc.setTitle(originalFilename.split(".")[0] || "Payment Proof");
      processedBuffer = await pdfDoc.save();
    } catch (pdfErr) {
      console.error("PDF processing failed:", pdfErr);
      // Decide: fail or fallback to original buffer?
      // Most secure: fail the request
      throw new CustomError("Invalid or corrupted PDF file");
    }
  }

  const foundCompany =
    await Company.findById(company).select("companyName");

  if (!foundCompany) {
    throw new CustomError(
      "Company not found",
      logPath,
      logAction,
      logSourceKey,
    );
  }

  const response = await handleDocumentUpload(
    processedBuffer,
    `${foundCompany.companyName}/meetings/${reference}/payment-proof`,
    originalFilename,
  );

  if (!response.public_id) {
    throw new CustomError(
      "Failed to upload payment proof",
      logPath,
      logAction,
      logSourceKey,
    );
  }

  return {
    name: originalFilename,
    link: response.secure_url,
    id: response.public_id,
    date: new Date(),
    mimeType: paymentProofFile.mimetype,
  };
};

const settleMeetingCredits = async (meeting, company, session) => {
  const currentMonth = getMonthStartUTC(new Date()).getTime();
  for (const { monthStart, credits } of meeting.creditOverages) {
    const month = monthStart.getTime();
    const increment = { "meetingCreditBalanceHistory.$.remainingCredit": credits };
    if (month === currentMonth) increment.meetingCreditBalance = credits;
    const result = await CoworkingClient.updateOne(
      {
        _id: meeting.client,
        company,
        meetingCreditBalanceHistory: {
          $elemMatch: {
            monthStartDate: {
              $gte: new Date(month - 12 * 3600000),
              $lte: new Date(month + 12 * 3600000),
            },
          },
        },
      },
      { $inc: increment },
      { session },
    );
    if (!result.matchedCount) throw new Error("Unable to settle the meeting credit balance");
  }
};

const payClientMeetingOverages = async (req, res, next) => {
  const { clientId, startDate, endDate, paymentMode, paymentBaseAmount, paymentGstQuoted } = req.body;
  const { company, user, roles, departments } = req;
  const discount = Number(req.body.discountAmount ?? 0);
  const rangeStart = new Date(startDate);
  const rangeEnd = new Date(endDate);
  let quotedIds;
  try {
    quotedIds = JSON.parse(req.body.meetingIds);
  } catch {
    return res.status(400).json({ message: "Invalid meeting IDs" });
  }

  if (!mongoose.isValidObjectId(clientId) || !(rangeStart < rangeEnd) ||
      !Array.isArray(quotedIds) || !quotedIds.length ||
      !quotedIds.every((id) => typeof id === "string" && mongoose.isValidObjectId(id)) ||
      !Meeting.schema.path("paymentMode").enumValues.includes(paymentMode) ||
      !Number.isFinite(discount) || discount < 0) {
    return res.status(400).json({ message: "Invalid payment details" });
  }

  const paymentChanged = () => new CustomError(
    "The outstanding meetings or amounts changed. Refresh Meeting History to review the total.",
    "meetings/MeetingLog", "Record Client Meeting Payment", "meeting", 409,
  );
  const cents = (amount) => Math.round(Number(amount) * 100);

  let proof;
  try {
    const history = await fetchMeetingReportService({
      company, user, roles, departments, clientId, type: "internal",
      dateFilter: { startDate: { $gte: rangeStart, $lt: rangeEnd } },
    });
    const outstanding = history.filter((meeting) =>
      meeting.creditsExceeded && meeting.paymentOutstanding && meeting.meetingStatus !== "Cancelled",
    );
    const quotes = new Map(outstanding.map((meeting) => [String(meeting._id), meeting]));
    if (outstanding.length !== quotedIds.length || new Set(quotedIds).size !== quotedIds.length ||
        !quotedIds.every((id) => quotes.has(id))) {
      throw paymentChanged();
    }

    const base = outstanding.reduce((sum, meeting) => sum + cents(meeting.paymentBaseAmount), 0);
    const originalGst = outstanding.reduce((sum, meeting) => sum + cents(meeting.paymentGstAmount), 0);
    const discountCents = cents(discount);
    if (base !== cents(paymentBaseAmount) || originalGst !== cents(paymentGstQuoted)) throw paymentChanged();
    if (discountCents > base) return res.status(400).json({ message: "Discount exceeds the outstanding amount" });

    const revenueId = new mongoose.Types.ObjectId();
    proof = await uploadMeetingPaymentProof(company, revenueId, req.file);
    const paymentDate = new Date();
    const taxable = base - discountCents;
    const gst = discountCents ? Math.round(taxable * 0.18) : originalGst;

    await mongoose.connection.transaction(async (session) => {
      const meetings = await Meeting.find({
        _id: { $in: quotedIds }, company, client: clientId, meetingType: "Internal",
        status: { $ne: "Cancelled" }, paymentStatus: false, ...exceededCreditsFilter,
      }).sort({ _id: 1 }).session(session);

      if (meetings.length !== quotedIds.length || meetings.some((meeting) => {
        const quote = quotes.get(String(meeting._id));
        return cents(meeting.paymentBaseAmount) !== cents(quote.paymentBaseAmount) ||
          cents(meeting.paymentGstAmount) !== cents(quote.paymentGstAmount) ||
          meeting.overageCredits !== quote.overageCredits ||
          meeting.updatedAt?.getTime() !== new Date(quote.updatedAt).getTime();
      })) throw paymentChanged();

      const amounts = allocateOveragePayment(meetings, base, discountCents, gst);
      for (const [index, meeting] of meetings.entries()) {
        await settleMeetingCredits(meeting, company, session);
        meeting.set({
          creditsExceeded: true,
          toPay: undefined,
          paymentStatus: true,
          paymentVerification: "Pending",
          paymentMode,
          ...amounts[index],
          ...(proof && { paymentProof: proof }),
        });
        await meeting.save({ session });
      }

      // Consolidate draft revenue from the earlier single-meeting payment form.
      await MeetingRevenue.deleteMany({
        company, meeting: { $in: quotedIds }, status: "Unpaid", "invoice.link": { $exists: false },
      }, { session });
      await MeetingRevenue.create([{
        _id: revenueId,
        company,
        client: outstanding[0].client,
        date: paymentDate,
        paymentDate,
        particulars: "Meeting credit payment",
        meetingIds: quotedIds,
        meetingRangeStart: rangeStart,
        meetingRangeEndExclusive: rangeEnd,
        discount: discountCents / 100,
        ...(proof && { paymentProof: proof }),
        taxable: taxable / 100,
        gst: gst / 100,
        totalAmount: (taxable + gst) / 100,
        status: "Paid",
        remarks: paymentMode,
        paymentVerification: "Pending",
        financeStatus: "Pending",
      }], { session });
    });

    return res.status(200).json({ message: "Meeting payment recorded" });
  } catch (error) {
    if (proof?.id && !error.hasErrorLabel?.("UnknownTransactionCommitResult")) {
      await handleDocumentDelete(proof.id).catch(() => {});
    }
    return next(error);
  }
};

const updateInternalMeetingPayment = async (req, res, meeting) => {
  const { company } = req;
  const { paymentMode, paymentStatus, discountAmount } = req.body;
  const discount = Number(discountAmount ?? 0);
  if (!["Paid", "Unpaid"].includes(paymentStatus) ||
      !Number.isFinite(discount) || discount < 0 || discount > meeting.paymentBaseAmount) {
    return res.status(400).json({ message: "Invalid payment details" });
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const current = await Meeting.findOne({
        _id: meeting._id,
        company,
        ...exceededCreditsFilter,
        paymentStatus: false,
        status: { $ne: "Cancelled" },
      }).session(session);
      if (!current || current.paymentBaseAmount !== meeting.paymentBaseAmount) {
        throw new CustomError("Meeting payment is no longer available", "meetings/MeetingLog", "Update Payment Status", "meeting", 409);
      }

      const base = current.paymentBaseAmount;
      const gst = Number(((base - discount) * 0.18).toFixed(2));
      current.paymentMode = paymentMode;
      current.paymentStatus = paymentStatus === "Paid";
      current.discountAmount = discount;
      current.paymentGstAmount = gst;
      current.paymentAmount = Number((base - discount + gst).toFixed(2));
      if (meeting.isModified("paymentProof")) current.paymentProof = meeting.paymentProof;

      if (current.paymentStatus) {
        await settleMeetingCredits(current, company, session);
      }

      await current.save({ session });
      const client = await CoworkingClient.findById(current.client).select("clientName").session(session);
      await MeetingRevenue.findOneAndUpdate(
        { meeting: current._id, company },
        { $set: {
          date: current.startDate,
          client: client?.clientName,
          particulars: "Meeting room booking",
          unitsOrHours: "Hours",
          costPerHour: meeting.bookedRoom?.perHourPrice,
          meetingRoomName: meeting.bookedRoom?.name,
          taxable: Number((base - discount).toFixed(2)),
          gst,
          totalAmount: current.paymentAmount,
          paymentDate: new Date(),
          status: paymentStatus,
          remarks: paymentMode,
          hoursBooked: meeting.bookedRoom?.perHourCredit
            ? Number((current.overageCredits / meeting.bookedRoom.perHourCredit).toFixed(2))
            : 0,
        } },
        { session, upsert: true, runValidators: true, setDefaultsOnInsert: true },
      );
    });
    return res.status(200).json({ message: "Meeting updated successfully" });
  } finally {
    await session.endSession();
  }
};

const updateMeeting = async (req, res, next) => {
  const logPath = "meetings/MeetingLog";
  const logAction = "Update Payment Status";
  const logSourceKey = "meeting";

  try {
    const { user, ip, company } = req;
    const {
      paymentAmount,
      paymentMode,
      paymentStatus,
      discountAmount,
      paymentBaseAmount,
      paymentGstAmount,
      client,
      taxable,
      gst,
      status,
      unitsOrHours,
      meetingRoomName,
    } = req.body;
    const { meetingId } = req.params;
    const paymentProofFile = req.file;

    if (!mongoose.Types.ObjectId.isValid(meetingId)) {
      return res.status(400).json({ message: "Invalid meeting Id provided" });
    }

    if (!paymentAmount || !paymentMode || !paymentStatus) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const updatedMeeting = await Meeting.findOne({ _id: meetingId, company }).populate([
      { path: "bookedRoom" },
      { path: "externalClient", select: "registeredClientCompany" },
    ]);

    if (!updatedMeeting) {
      throw new CustomError(
        "Meeting not found",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const isInternal = updatedMeeting.meetingType === "Internal";
    if (isInternal && (!hasExceededCredits(updatedMeeting) || updatedMeeting.paymentStatus || updatedMeeting.status === "Cancelled")) {
      return res.status(409).json({ message: "Meeting payment is no longer available" });
    }

    if (isInternal && Number(paymentBaseAmount) !== updatedMeeting.paymentBaseAmount) {
      return res.status(409).json({ message: "The overage amount changed. Reopen Payment Details to review it." });
    }

    if (!isInternal && updatedMeeting.meetingType !== "External") {
      throw new CustomError(
        "Meeting type is not external",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const { durationInHours, resolvedBaseAmount, resolvedGstAmount } =
      isInternal ? {} : recalculateAndUpdatePayment({
        meeting: updatedMeeting,
        paymentAmount,
        paymentBaseAmount,
        paymentGstAmount,
        discountAmount,
        paymentMode,
        paymentStatus,
      });

    // Validate actual amount (optional)
    // if (Number(paymentAmount) !== amountToBePaid) {
    //   throw new CustomError(
    //     `Actual amount is INR ${amountToBePaid}`,
    //     logPath,
    //     logAction,
    //     logSourceKey
    //   );
    // }

    const paymentProof = await uploadMeetingPaymentProof(company, meetingId, paymentProofFile);
    if (paymentProof) updatedMeeting.paymentProof = paymentProof;

    // updatedMeeting.paymentBaseAmount = paymentBaseAmount;
    // updatedMeeting.paymentGstAmount = paymentGstAmount;
    // updatedMeeting.paymentAmount = paymentAmount;
    // updatedMeeting.paymentMode = paymentMode;
    // updatedMeeting.paymentStatus = paymentStatus === "Paid";
    // updatedMeeting.discountAmount = discountAmount ?? 0;

    if (isInternal) return await updateInternalMeetingPayment(req, res, updatedMeeting);

    await updatedMeeting.save();

    const resolvedPaymentStatus = paymentStatus === "Paid" ? "Paid" : "Unpaid";
    const resolvedClientName =
      client || updatedMeeting.externalClient?.registeredClientCompany || "";

    const revenuePayload = {
      date: updatedMeeting.startDate,
      company,
      client: resolvedClientName,
      particulars: "Meeting room booking",
      unitsOrHours: unitsOrHours || "Hours",
      costPerHour: updatedMeeting.bookedRoom.perHourPrice,
      meetingRoomName: meetingRoomName || updatedMeeting.bookedRoom?.name,
      taxable: Number(taxable ?? resolvedBaseAmount ?? 0),
      gst: Number(gst ?? resolvedGstAmount ?? 0),
      totalAmount: Number(updatedMeeting.paymentAmount || 0),
      paymentDate: updatedMeeting.startDate,
      status: status || resolvedPaymentStatus,
      remarks: paymentMode,
      meeting: updatedMeeting._id,
      hoursBooked: durationInHours,
    };

    const savedRevenue = await MeetingRevenue.findOneAndUpdate(
      { meeting: updatedMeeting._id, company },
      { $set: revenuePayload },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );

    if (!savedRevenue) {
      throw new CustomError(
        "Failed to save meeting revenue",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    // const updatedVisitor = await Visitor.findOneAndUpdate(
    //   {
    //     clientCompany: updatedMeeting.externalClient.clientCompany,
    //   },
    //   {
    //     meeting: updatedMeeting._id,
    //   },
    // );

    // if (!updatedVisitor) {
    //   throw new CustomError(
    //     "Failed to update visitor meeting reference",
    //     logPath,
    //     logAction,
    //     logSourceKey,
    //   );
    // }

    const visitorPaymentDetails = {
      meeting: updatedMeeting._id,
      amount: updatedMeeting.paymentBaseAmount,
      discount: updatedMeeting.discountAmount,
      gstAmount: updatedMeeting.paymentGstAmount,
      totalAmount: updatedMeeting.paymentAmount,
      paymentMode: updatedMeeting.paymentMode,
      paymentStatus: updatedMeeting.paymentStatus,
      paymentProof: {
        url: updatedMeeting.paymentProof?.link,
        id: updatedMeeting.paymentProof?.id,
      },
    };

    const updatedVisitor = await Visitor.findByIdAndUpdate(
      updatedMeeting.externalClient._id,
      visitorPaymentDetails,
      { new: true },
    );

    if (!updatedVisitor) {
      throw new CustomError(
        "Failed to update visitor payment details",
        logPath,
        logAction,
        logSourceKey,
      );
    }

    const hasMeetingVisit = await ExternalVisits.exists({ company, meeting: updatedMeeting._id });
    await ExternalVisits.updateMany(
      {
        company,
        ...(hasMeetingVisit ? { meeting: updatedMeeting._id } : { $or: [
          { meeting: updatedMeeting._id },
          {
            visitorId: updatedVisitor._id,
            legacyVisitorEntryId: updatedVisitor._id,
          },
        ] }),
      },
      visitorPaymentDetails,
    );

    return res.status(200).json({ message: "Meeting updated successfully" });
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError(error.message, logPath, logAction, logSourceKey, 500),
    );
  }
};

const verifyInternalMeetingPayment = async (req, meetingId, status) => {
  const { company, departments, roles } = req;
  const error = (message, code) =>
    new CustomError(message, "meetings/MeetingLog", "Verify Internal Meeting Payment", "meeting", code);

  if (!canVerifyInternalMeetingPayment(departments, roles)) {
    throw error("Finance access is required to verify internal meeting payments", 403);
  }

  if (!previousVerificationStatus[status]) throw error("Invalid payment verification step", 400);

  await mongoose.connection.transaction(async (session) => {
    const meeting = await Meeting.findOne({
      _id: meetingId, company, meetingType: "Internal", paymentStatus: true,
      status: { $ne: "Cancelled" }, ...exceededCreditsFilter,
    }).session(session);
    if (!meeting) throw error("Only paid internal meeting overages can be verified", 409);

    const revenue = await MeetingRevenue.findOne({
      company, status: "Paid", meetingIds: meeting._id,
    }).session(session) ?? await MeetingRevenue.findOne({
      company, status: "Paid", meeting: meeting._id,
    }).session(session);
    if (!revenue) throw error("No paid Meeting Revenue entry is linked to this meeting", 409);

    const currentStatus = revenue.paymentVerification ?? meeting.paymentVerification ?? "Pending";
    if (currentStatus === status) return;
    if (!canAdvanceVerification(currentStatus, status)) {
      throw error("Payment verification has changed. Refresh and complete the steps in order.", 409);
    }

    const ids = revenue.meetingIds?.length ? revenue.meetingIds : [meeting._id];
    const result = await Meeting.updateMany({
      _id: { $in: ids }, company, client: meeting.client, meetingType: "Internal",
      paymentStatus: true, status: { $ne: "Cancelled" }, ...exceededCreditsFilter,
    }, { $set: { paymentVerification: status } }, { session, runValidators: true });
    if (result.matchedCount !== ids.length) {
      throw error("Some meetings from this payment are no longer eligible for verification", 409);
    }

    revenue.paymentVerification = status;
    if (status === "Completed" && revenue.financeStatus !== "Verified") {
      revenue.financeStatus = "Upload Invoice";
    }
    await revenue.save({ session });
  });
};

const updateMeetingPaymentStatus = async (req, res, next) => {
  try {
    const { status, meetingId } = req.body;
    const company = req.company;
    const validStatuses = ["Pending", "Under Review", "Verified", "Completed"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    if (!mongoose.Types.ObjectId.isValid(meetingId)) {
      return res.status(400).json({ message: "Invalid meeting ID" });
    }

    const meeting = await Meeting.findOne({ _id: meetingId, company }).select("meetingType").lean();
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    if (meeting.meetingType === "Internal") {
      await verifyInternalMeetingPayment(req, meetingId, status);
    } else {
      const updatedMeeting = await Meeting.findOneAndUpdate(
        { _id: meetingId, company, meetingType: "External" },
        { paymentVerification: status },
        { new: true, runValidators: true },
      ).populate("bookedBy", "firstName lastName");

      if (!updatedMeeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }

      if (status === "Completed") {
        await MeetingRevenue.findOneAndUpdate(
          { meeting: updatedMeeting._id, company },
          { $set: { financeStatus: "Upload Invoice" } },
        );
      }

    }

    const message =
      status === "Completed"
        ? "Payment verification completed. Invoice upload enabled"
        : status === "Verified"
          ? "Payment verified"
          : "Payment under review";

    return res.status(200).json({ message });
  } catch (error) {
    return next(error);
  }
};

const updateMeetingStatus = async (req, res, next) => {
  const { status, meetingId } = req.body;
  const { user } = req;

  const validStatuses = ["Ongoing", "Completed"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }
  const meeting = await Meeting.findById(meetingId);

  if (!meeting) {
    return res.status(404).json({ message: "Meeting not found" });
  }

  const currDate = new Date();

  // Prevent completing/ongoing meeting before start date/time
  if (currDate < meeting.startTime) {
    return res.status(400).json({
      message: `Meeting cannot be marked ${status.toLowerCase()} before its start time`,
    });
  }

  if (status === "Completed" && meeting.bookingSlots?.length > 1 && currDate < meeting.endTime) {
    return res.status(400).json({ message: "A month booking can be completed only after its final slot ends" });
  }

  // if (status === "Completed" && currDate < getEffectiveEndTime(meeting)) {
  //   return res.status(400).json({
  //     message: "Meeting cannot be marked completed before its end time",
  //   });
  // }

  const updatePayload = {
    status,
    ...(status === "Completed" && {
      completedAt: currDate,
      completedBy: user,
    }),
  };

  const updatedMeeting = await Meeting.findByIdAndUpdate(
    meetingId,
    updatePayload,
    { new: true },
  ).populate("bookedBy", "firstName lastName");

  const updateRoomStatus = await Room.findByIdAndUpdate(
    {
      _id: updatedMeeting.bookedRoom,
    },
    { status: "Available" },
    { new: true },
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
    "companyName",
  );
  const coworkingCompanies = await CoworkingClient.find({ company }).select(
    "clientName",
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
        (member) => member?.company._id.toString() === client?._id.toString(),
      ),
    };
  });

  const coworkingWithMembers = coworkingCompanies.map((client) => {
    return {
      ...client._doc,
      members: coworkingMembers.filter(
        (member) => member?.client._id.toString() === client?._id.toString(),
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
  const { roles, company } = req;

  try {
    const {
      meetingId,
      date,
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

    const meeting = await Meeting.findOne({ _id: meetingId, company }).populate([
      { path: "bookedRoom" },
      { path: "bookedBy", select: "firstName lastName" },
    ]);
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    if (meeting.bookingSlots?.length > 1) {
      return res.status(400).json({ message: "Editing is not available for month bookings" });
    }

    const isClient = !!meeting.clientBookedBy;
    const isExternal = !!meeting.externalBookedBy;
    const isCoworkingBooking = Boolean(meeting.client && String(meeting.client) !== String(meeting.company));
    const BookingCompanyModel = isCoworkingBooking
      ? CoworkingClient
      : isExternal
        ? Visitor
        : Company;
    const BookingUserModel = isClient
      ? CoworkingMember
      : isExternal
        ? Visitor
        : User;
    const bookedClientId = meeting.client
      ? meeting.client
      : meeting.externalClient;

    const currDate = new Date();
    let startTimeObj = new Date(startTime);
    let endTimeObj = new Date(endTime);

    if (isNaN(startTimeObj.getTime()) || isNaN(endTimeObj.getTime())) {
      return res.status(400).json({ message: "Invalid date/time format" });
    }

    const allowedRoles = ["Tech Admin", "Tech Employee"];
    const adminTimingRoles = [
      "Admin Admin",
      "Admin Manager",
      "Admin Employee",
      "Administration Admin",
      "Administration Manager",
      "Administration Employee",
    ];
    const dateEditRoles = [
      "Super Admin",
      "Master Admin",
      "Tech Admin",
      "Tech Employee",
    ];
    const departmentNames =
      req.user?.departments?.map((dept) => dept?.name?.trim()) || [];
    const isTech = roles?.some((r) => allowedRoles.includes(r));
    const isAdminTimingUser =
      roles?.some((r) => adminTimingRoles.includes(r)) ||
      departmentNames.some((deptName) =>
        ["Admin", "Administration"].includes(deptName),
      );
    const canEditMeetingDate = roles?.some((r) => dateEditRoles.includes(r));
    const hasSpecialEditWindowAccess = isAdminTimingUser || canEditMeetingDate;
    const isAdminTimingRestrictedUser = isAdminTimingUser;
    const meetingStartTime = new Date(meeting.startTime);
    const meetingEndTime = getEffectiveEndTime(meeting);
    const isUpcoming = meetingStartTime > currDate;
    const editWindowEndTime = new Date(meetingStartTime.getTime() + 30 * 60000);
    const hasMeetingStarted = meetingStartTime <= currDate;
    const isAdminTimingBufferExpired =
      isAdminTimingRestrictedUser && currDate > editWindowEndTime;
    const requestedDateObj = date ? new Date(date) : null;

    if (date && isNaN(requestedDateObj.getTime())) {
      return res.status(400).json({ message: "Invalid meeting date format" });
    }

    if (canEditMeetingDate && requestedDateObj) {
      const normalizeDateTime = (selectedDate, sourceTime) => {
        const normalizedDateTime = new Date(selectedDate);
        const sourceDateTime = new Date(sourceTime);

        normalizedDateTime.setHours(
          sourceDateTime.getHours(),
          sourceDateTime.getMinutes(),
          sourceDateTime.getSeconds(),
          sourceDateTime.getMilliseconds(),
        );

        return normalizedDateTime;
      };

      startTimeObj = normalizeDateTime(requestedDateObj, startTimeObj);
      endTimeObj = normalizeDateTime(requestedDateObj, endTimeObj);
    }

    if (!isTech && !isUpcoming && !hasSpecialEditWindowAccess) {
      return res.status(403).json({
        message: "You are not allowed to edit meeting timings to past time",
      });
    }

    if (isAdminTimingRestrictedUser && isAdminTimingBufferExpired) {
      return res.status(403).json({
        message:
          "Meeting edit is allowed only until 30 minutes after the original start time",
      });
    }

    if (
      ["Internal", "External"].includes(meeting.meetingType) &&
      isAdminTimingRestrictedUser
    ) {
      const allowedStartLowerBound = isAdminTimingBufferExpired
        ? meetingStartTime
        : new Date(meetingStartTime.getTime() - 30 * 60000);
      const allowedEndLowerBound = isAdminTimingBufferExpired
        ? meetingEndTime
        : new Date(meetingEndTime.getTime() - 30 * 60000);
      const isStartTimeInAllowedRange = startTimeObj >= allowedStartLowerBound;
      const isEndTimeInAllowedRange = endTimeObj >= allowedEndLowerBound;

      if (!isStartTimeInAllowedRange || !isEndTimeInAllowedRange) {
        return res.status(403).json({
          message:
            "Meeting timing edits are allowed from 30 minutes before start time until 30 minutes after start time",
        });
      }
    }

    if (startTimeObj > endTimeObj) {
      return res
        .status(400)
        .json({ message: "Start time is greater than end time" });
    }

    const conflictingMeeting = await Meeting.findOne({
      _id: { $ne: meetingId },
      bookedRoom: meeting.bookedRoom._id,
      status: { $ne: "Cancelled" },
      ...meetingOverlapFilter(startTimeObj, endTimeObj),
    });

    if (conflictingMeeting) {
      return res
        .status(409)
        .json({ message: "Room is already booked for the specified time" });
    }

    const normalizeParticipantIds = (ids = []) =>
      Array.from(
        new Set(
          (Array.isArray(ids) ? ids : [])
            .filter(Boolean)
            .map((id) => String(id).trim())
            .filter(Boolean),
        ),
      );

    const requestedInternalParticipantIds = normalizeParticipantIds(
      internalParticipants,
    );
    const requestedClientParticipantIds = normalizeParticipantIds(
      clientParticipants,
    );
    const requestedParticipantIds = Array.from(
      new Set([...requestedInternalParticipantIds, ...requestedClientParticipantIds]),
    );

    let internalUsers = [];
    let clientUsers = [];

    if (requestedParticipantIds.length > 0) {
      const invalidIds = requestedParticipantIds.filter(
        (id) => !mongoose.Types.ObjectId.isValid(id),
      );
      if (invalidIds.length > 0) {
        return res
          .status(400)
          .json({ message: "Invalid internal participant IDs" });
      }

      const [matchedInternalUsers, matchedClientUsers] = await Promise.all([
        User.find({ _id: { $in: requestedParticipantIds } }).select("_id"),
        CoworkingMembers.find({ _id: { $in: requestedParticipantIds } }).select(
          "_id",
        ),
      ]);

      const internalIdSet = new Set(
        matchedInternalUsers.map((user) => user._id.toString()),
      );
      const clientIdSet = new Set(
        matchedClientUsers.map((user) => user._id.toString()),
      );

      const unmatchedIds = requestedParticipantIds.filter(
        (id) => !internalIdSet.has(id) && !clientIdSet.has(id),
      );

      if (unmatchedIds.length > 0) {
        return res.status(400).json({
          message: "Some internal participant IDs did not match any user",
        });
      }

      internalUsers = matchedInternalUsers.map((user) => user._id);
      clientUsers = matchedClientUsers.map((user) => user._id);
    }

    // const oldCreditsUsed = meeting.creditsUsed || 0;
    // const durationInMs = endTimeObj - startTimeObj;
    // const durationInHours = durationInMs / (1000 * 60 * 60);
    // const creditPerHour = meeting.bookedRoom.perHourCredit || 0;
    // const newCreditsUsed = durationInHours * creditPerHour;
    // const creditDifference = newCreditsUsed - oldCreditsUsed;

    //Credits calculation
    const durationInMinutes = (endTimeObj - startTimeObj) / (1000 * 60);

    if (durationInMinutes <= 0) {
      return res
        .status(400)
        .json({ message: "End time must be greater than start time" });
    }

    const creditPerHour = meeting.bookedRoom.perHourCredit || 0;

    //deduction based on minutes
    const normalizeCredits = (minutes) =>
      Number(((minutes / 60) * creditPerHour).toFixed(2));

    // Deduction based on exact minutes (not rounded hours)
    const newCreditsUsed = normalizeCredits(durationInMinutes);

    // Recompute old credits from previous timings so credit diffs also stay minute-based
    const oldDurationInMinutes =
      (getEffectiveEndTime(meeting) - new Date(meeting.startTime)) /
      (1000 * 60);
    const oldCreditsUsed =
      oldDurationInMinutes > 0
        ? normalizeCredits(oldDurationInMinutes)
        : meeting.creditsUsed || 0;

    const creditDifference = Number(
      (newCreditsUsed - oldCreditsUsed).toFixed(2),
    );
    const hasMeetingTimingChanged =
      startTimeObj.getTime() !== meetingStartTime.getTime() ||
      endTimeObj.getTime() !== meetingEndTime.getTime();

    const isCreditApplicable = !isExternal;
    if (isCreditApplicable && hasExceededCredits(meeting) && meeting.paymentStatus && hasMeetingTimingChanged) {
      return res.status(409).json({ message: "Timing cannot be changed after a credit overage has been paid" });
    }

    const saveDetails = async (session = null) => {
      let overagePayment;

      if (creditDifference !== 0 && isCreditApplicable) {
        const meetingDate = new Date(meeting.startTime);
        // const meetingMonthStart = new Date(
        //   meetingDate.getFullYear(),
        //   meetingDate.getMonth(),
        //   1,
        // );
        const meetingMonthStart = getMonthStartUTC(meetingDate);

        const now = new Date();
        // const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthStart = getMonthStartUTC(now);
        const isCurrentMonth =
          meetingMonthStart.getTime() === currentMonthStart.getTime();

        const updateFields = {
          $inc: {
            "meetingCreditBalanceHistory.$.remainingCredit": -creditDifference,
            "meetingCreditBalanceHistory.$.consumedCredit": creditDifference,
          },
        };

        if (isCurrentMonth) {
          updateFields.$inc.meetingCreditBalance = -creditDifference;
        }

        const updatedEntity = await BookingCompanyModel.findOneAndUpdate(
          {
            _id: bookedClientId,
            meetingCreditBalanceHistory: {
              $elemMatch: {
                monthStartDate: {
                  $gte: new Date(
                    meetingMonthStart.getTime() - 12 * 60 * 60 * 1000,
                  ),
                  $lte: new Date(
                    meetingMonthStart.getTime() + 12 * 60 * 60 * 1000,
                  ),
                },
              },
            },
          },
          updateFields,
          { session },
        );

        if (!updatedEntity) {
          throw new CustomError("Booking entity or history entry not found", "meetings/MeetingLog", "Update Meeting", "meeting", 404);
        }
        if (isCoworkingBooking) {
          const previousOverage = meeting.overageCredits || 0;
          const credits = creditDifference > 0
            ? previousOverage + getCreditOverage(updatedEntity, meetingMonthStart, creditDifference)
            : Math.max(previousOverage + creditDifference, 0);
          if (credits !== previousOverage) {
            overagePayment = getOveragePayment(meeting.bookedRoom, [{ monthStart: meetingMonthStart, credits }]);
          }
        }
      }

      const changes = {
        ...(canEditMeetingDate && requestedDateObj
          ? {
              startDate: requestedDateObj,
              endDate: requestedDateObj,
            }
          : {}),
        startTime: startTimeObj,
        endTime: hasMeetingTimingChanged ? endTimeObj : meeting.endTime,
        extendTime: hasMeetingTimingChanged ? null : meeting.extendTime || null,
        // creditsUsed: externalParticipants ? newCreditsUsed : 0,
        creditsUsed: isExternal ? 0 : newCreditsUsed,
        internalParticipants: internalUsers,
        clientParticipants: clientUsers,
        externalParticipants: externalParticipants || [],
        ...(isExternal && { paymentAmount: paymentAmount || meeting.paymentAmount }),
        ...overagePayment,
      };

      const updated = await Meeting.findOneAndUpdate(
        { _id: meetingId, company, updatedAt: meeting.updatedAt },
        {
          $set: changes,
          ...(overagePayment && !overagePayment.creditsExceeded && { $unset: {
            paymentBaseAmount: 1,
            paymentAmount: 1,
            paymentGstAmount: 1,
            paymentMode: 1,
            paymentProof: 1,
            discountAmount: 1,
          } }),
        },
        { new: true, session },
      ).populate([
        { path: "bookedRoom" },
        { path: "externalClient", select: "clientCompany" },
      ]);

      if (!updated) {
        throw new CustomError("Meeting changed. Try editing it again.", "meetings/MeetingLog", "Update Meeting", "meeting", 409);
      }
      return updated;
    };

    const updatedMeeting = isCreditApplicable && creditDifference !== 0
      ? await mongoose.connection.transaction(saveDetails)
      : await saveDetails();

    // if (isExternal) {
    //   updatedMeeting = await recalculateAndUpdatePayment({
    //     meeting: updatedMeeting,
    //     startTime: startTimeObj,
    //     endTime: endTimeObj,
    //     company: updatedMeeting.company,
    //   });
    // }

    if (isExternal) {
      const {
        durationInHours,
        resolvedBaseAmount,
        resolvedGstAmount,
        resolvedPaymentAmount,
      } = recalculateAndUpdatePayment({
        meeting: updatedMeeting,
        paymentAmount,
      });

      await updatedMeeting.save();

      // 🔥 Update Meeting Revenue (THIS WAS MISSING)
      await MeetingRevenue.findOneAndUpdate(
        { meeting: updatedMeeting._id },
        {
          $set: {
            taxable: resolvedBaseAmount,
            gst: resolvedGstAmount,
            totalAmount: resolvedPaymentAmount,
            hoursBooked: durationInHours,
            costPerHour: updatedMeeting.bookedRoom?.perHourPrice,
            meetingRoomName: updatedMeeting.bookedRoom?.name,
            date: updatedMeeting.startDate,
            paymentDate: updatedMeeting.startDate,
          },
        },
        { upsert: true, new: true },
      );
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
  getMeetingBookingCounts,
  getMyMeetings,
  deleteMyMeeting,
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
  updateMeetingPaymentStatus,
  payClientMeetingOverages,
};
