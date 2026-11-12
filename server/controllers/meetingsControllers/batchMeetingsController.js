const mongoose = require("mongoose");
const Meeting = require("../../models/meetings/Meetings");
const Room = require("../../models/meetings/Rooms");
const User = require("../../models/hr/UserData");
const CoworkingMembers = require("../../models/sales/CoworkingMembers");
const CoworkingClient = require("../../models/sales/CoworkingClient");
const Company = require("../../models/hr/Company");
const Visitor = require("../../models/visitor/Visitor");
const { resetMeetingCreditsIfNeeded } = require("../../utils/resetCredits");
const { createLog } = require("../../utils/moduleLogs");
const emitter = require("../../utils/eventEmitter");
const { meetingOverlapFilter, meetingOverlaps } = require("../../utils/meetingSlots");

const getMonthStartUTC = (date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));

const bookMeetingDates = async (req, res, next) => {
  const {
    bookedRoom,
    meetingType,
    bookedBy,
    clientBookedBy,
    client,
    externalCompany,
    externalParticipants,
    internalParticipants = [],
    clientParticipants = [],
    subject,
    agenda,
    slots,
  } = req.body;

  const fail = (status, message, conflicts) =>
    res.status(status).json({ message, ...(conflicts ? { conflicts } : {}) });

  if (
    !mongoose.isValidObjectId(bookedRoom) ||
    !["Internal", "External"].includes(meetingType) ||
    !String(subject || "").trim() ||
    !String(agenda || "").trim() ||
    !Array.isArray(slots) ||
    slots.length < 2 ||
    slots.length > 100
  ) {
    return fail(400, "Provide a room, meeting details, and 2–100 selected dates.");
  }
  if (meetingType === "Internal" && !mongoose.isValidObjectId(client)) {
    return fail(400, "An internal meeting requires a client.");
  }
  if (meetingType === "External" && (!mongoose.isValidObjectId(externalCompany) || !Array.isArray(externalParticipants) || !externalParticipants.length)) {
    return fail(400, "An external meeting requires a client and participant.");
  }
  if (!Array.isArray(internalParticipants) || !Array.isArray(clientParticipants)) {
    return fail(400, "Participants must be supplied as lists.");
  }

  const now = new Date();
  const seenDates = new Set();
  const parsedSlots = [];
  for (const slot of slots) {
    const date = String(slot?.date || "");
    const start = new Date(slot?.startTime);
    const end = new Date(slot?.endTime);
    const dayStart = new Date(slot?.startDate);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      seenDates.has(date) ||
      !Number.isFinite(start.getTime()) ||
      !Number.isFinite(end.getTime()) ||
      !Number.isFinite(dayStart.getTime()) ||
      start < now ||
      start < dayStart ||
      end > new Date(dayStart.getTime() + 24 * 60 * 60 * 1000) ||
      end <= start ||
      end - start > 24 * 60 * 60 * 1000
    ) {
      return fail(400, `Invalid or duplicate meeting slot: ${date || "unknown date"}.`);
    }
    seenDates.add(date);
    parsedSlots.push({ date, start, end, dayStart });
  }
  parsedSlots.sort((a, b) => a.start - b.start);

  let lockToken;
  let session;
  let createdMeetings = [];
  try {
    const requestingUser = await User.findById(req.user)
      .populate("role", "roleTitle")
      .populate("departments", "name")
      .select("role departments")
      .lean();
    const isAdministrationUser = requestingUser?.role?.some((role) =>
      /^Administration\b/i.test(role?.roleTitle || ""),
    ) || requestingUser?.departments?.some((department) =>
      String(department?.name || "").trim().toLowerCase() === "administration",
    );
    const isTechAdmin = requestingUser?.role?.some(
      (role) => role?.roleTitle === "Tech Admin",
    );
    const monthlyBookingUserIds = [
      "67b83885daad0f7bab2f18a9",
      "6961fcd737afa664ab215d0a",
    ];
    const isAllowedEmployee = monthlyBookingUserIds.includes(String(req.user));
    if (!isAdministrationUser && !isTechAdmin && !isAllowedEmployee) {
      return fail(403, "You don't have access to book multiple meeting dates.");
    }

    const isClient = meetingType === "Internal" && String(client) !== String(req.company);
    let resolvedClientBookedBy = clientBookedBy;
    if (isClient && !bookedBy && !resolvedClientBookedBy) {
      const currentUser = await User.findById(req.user).select("email firstName lastName phone").lean();
      const fullName = [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(" ").trim();
      const conditions = [
        ...(currentUser?.email ? [{ email: currentUser.email }] : []),
        ...(fullName ? [{ employeeName: fullName }] : []),
        ...(currentUser?.phone ? [{ mobileNo: currentUser.phone }] : []),
      ];
      if (conditions.length) {
        const member = await CoworkingMembers.findOne({ client, $or: conditions })
          .collation({ locale: "en", strength: 2 }).select("_id").lean();
        resolvedClientBookedBy = member?._id;
      }
    }
    if (meetingType === "Internal" && !bookedBy && !resolvedClientBookedBy) {
      return fail(400, "An internal meeting requires a booker.");
    }
    if (meetingType === "External" && !(await Visitor.exists({ _id: externalCompany, company: req.company }))) {
      return fail(400, "External visitor not found in this company.");
    }

    const participantIds = [...new Set([...internalParticipants, ...clientParticipants].filter(Boolean).map(String))];
    if (participantIds.some((id) => !mongoose.isValidObjectId(id))) {
      return fail(400, "Invalid participant ID.");
    }
    const [users, members] = await Promise.all([
      User.find({ _id: { $in: participantIds } }).select("_id").lean(),
      CoworkingMembers.find({ _id: { $in: participantIds } }).select("_id").lean(),
    ]);
    const knownIds = new Set([...users, ...members].map((item) => String(item._id)));
    if (participantIds.some((id) => !knownIds.has(id))) {
      return fail(400, "Some participants were not found.");
    }

    lockToken = new mongoose.Types.ObjectId().toString();
    const room = await Room.findOneAndUpdate(
      {
        _id: bookedRoom,
        company: req.company,
        status: "Available",
        $or: [
          { bookingLockExpiresAt: { $exists: false } },
          { bookingLockExpiresAt: { $lte: new Date() } },
        ],
      },
      { $set: { bookingLockToken: lockToken, bookingLockExpiresAt: new Date(Date.now() + 5 * 60 * 1000) } },
      { new: true },
    );
    if (!room) return fail(409, "Room booking is currently being processed. Please try again.");

    const BookingModel = isClient ? CoworkingClient : Company;
    const creditsByMonth = new Map();
    if (meetingType === "Internal") {
      for (const slot of parsedSlots) {
        const monthStart = getMonthStartUTC(slot.start);
        const key = monthStart.toISOString();
        creditsByMonth.set(key, (creditsByMonth.get(key) || 0) +
          Number((((slot.end - slot.start) / 3600000) * Number(room.perHourCredit || 0)).toFixed(2)));
      }
      for (const key of creditsByMonth.keys()) {
        const creditRecord = await resetMeetingCreditsIfNeeded(BookingModel, client, new Date(key));
        if (!creditRecord) return fail(400, "Booking client/company not found.");
      }
    }

    const firstSlot = parsedSlots[0];
    const lastSlot = parsedSlots[parsedSlots.length - 1];
    const meetingDoc = {
      meetingType,
      bookingPeriod: "Month",
      bookingSlots: parsedSlots.map((slot) => ({ date: slot.date, startTime: slot.start, endTime: slot.end })),
      bookedBy: meetingType === "Internal" && bookedBy ? bookedBy : null,
      clientBookedBy: meetingType === "Internal" && isClient && resolvedClientBookedBy ? resolvedClientBookedBy : null,
      externalBookedBy: meetingType === "External" ? bookedBy : null,
      receptionist: req.user,
      bookedRoom: room._id,
      startDate: firstSlot.dayStart,
      endDate: lastSlot.dayStart,
      startTime: firstSlot.start,
      endTime: lastSlot.end,
      subject,
      agenda,
      creditsUsed: meetingType === "Internal"
        ? Number([...creditsByMonth.values()].reduce((total, amount) => total + amount, 0).toFixed(2))
        : 0,
      client: meetingType === "Internal" ? client : null,
      externalClient: meetingType === "External" ? externalCompany : null,
      company: req.company,
      status: "Upcoming",
      internalParticipants: users.map((item) => item._id),
      clientParticipants: members.map((item) => item._id),
      externalParticipants: externalParticipants || [],
    };

    session = await mongoose.startSession();
    await session.withTransaction(async () => {
      const existing = await Meeting.find({
        bookedRoom: room._id,
        status: { $ne: "Cancelled" },
        ...meetingOverlapFilter(firstSlot.start, lastSlot.end),
      }).select("startTime endTime extendTime bookingSlots").session(session).lean();
      const conflicts = parsedSlots.filter((slot) =>
        existing.some((meeting) => meetingOverlaps(meeting, slot.start, slot.end)),
      ).map((slot) => slot.date);
      if (conflicts.length) {
        const error = new Error(`Room already booked on ${conflicts.join(", ")}. No meetings were created.`);
        error.status = 409;
        error.conflicts = conflicts;
        throw error;
      }

      if (meetingType === "Internal") {
        const currentMonth = getMonthStartUTC(new Date()).toISOString();
        for (const [key, amount] of creditsByMonth) {
          const update = {
            $inc: {
              "meetingCreditBalanceHistory.$.remainingCredit": -amount,
              "meetingCreditBalanceHistory.$.consumedCredit": amount,
            },
          };
          if (key === currentMonth) update.$inc.meetingCreditBalance = -amount;
          const updated = await BookingModel.findOneAndUpdate(
            {
              _id: client,
              meetingCreditBalanceHistory: {
                $elemMatch: {
                  monthStartDate: {
                    $gte: new Date(new Date(key).getTime() - 12 * 3600000),
                    $lte: new Date(new Date(key).getTime() + 12 * 3600000),
                  },
                },
              },
            },
            update,
            { session },
          );
          if (!updated) throw new Error("Unable to update meeting credits for the selected month.");
        }
      }
      createdMeetings = await Meeting.create([meetingDoc], { session });
    });

    const recipientIds = [...new Set([
      ...users.map((item) => String(item._id)),
      ...(meetingType === "Internal" && mongoose.isValidObjectId(bookedBy) ? [String(bookedBy)] : []),
    ])].filter((id) => id !== String(req.user));
    if (recipientIds.length) {
      try {
        emitter.emit("notification", {
          initiatorData: req.user,
          users: recipientIds.map((id) => ({ userActions: { whichUser: id, hasRead: false } })),
          type: "book meeting",
          module: "Meetings",
          message: `You have been added to a meeting on ${parsedSlots.length} dates`,
        });
      } catch {
        // The meetings have committed; notification delivery cannot undo them.
      }
    }

    // Logging is informational; a logging failure must not turn a committed booking into an error.
    await createLog({
      path: "meetings/MeetingLog",
      action: "Book Meetings",
      remarks: `One meeting booked on ${parsedSlots.length} dates`,
      status: "Success",
      user: req.user,
      ip: req.ip,
      company: req.company,
      sourceKey: "meeting",
      sourceId: createdMeetings[0]?._id,
      changes: { bookedRoom, dates: parsedSlots.map((slot) => slot.date) },
    }).catch(() => {});
    return res.status(201).json({ message: `Meeting booked on ${parsedSlots.length} dates.`, count: 1 });
  } catch (error) {
    if (error.status) return fail(error.status, error.message, error.conflicts);
    next(error);
  } finally {
    if (session) await session.endSession();
    if (lockToken) {
      await Room.updateOne(
        { _id: bookedRoom, bookingLockToken: lockToken },
        { $unset: { bookingLockToken: 1, bookingLockExpiresAt: 1 } },
      ).catch(() => {});
    }
  }
};

module.exports = { bookMeetingDates };
