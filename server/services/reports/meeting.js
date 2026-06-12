const Meeting = require("../../models/meetings/Meetings");
const Review = require("../../models/meetings/Reviews");
const UserData = require("../../models/hr/UserData");
const { formatDuration } = require("../../utils/formatDateTime");

const formatPersonName = (person) =>
  [person?.firstName, person?.lastName].filter(Boolean).join(" ");

const formatParticipants = (participants = []) =>
  participants
    .map((participant) =>
      participant?.firstName
        ? formatPersonName(participant)
        : participant?.employeeName || participant?.name || "",
    )
    .filter(Boolean)
    .join(", ");

const getEffectiveEndTime = (meeting) => {
  if (!meeting?.extendTime) return meeting?.endTime;
  if (!meeting?.endTime) return meeting.extendTime;

  return new Date(meeting.extendTime) > new Date(meeting.endTime)
    ? meeting.extendTime
    : meeting.endTime;
};

const fetchMeetingReportService = async ({
  dateFilter,
  departments = [],
  roles = [],
  company,
  user,
  isReport = false,
  type,
}) => {
  try {
    const meetings = await Meeting.find({
      company,
      ...(dateFilter?.startDate && {
        startDate: dateFilter?.startDate,
      }),
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
          select: "firstName middleName lastName email departments designation",
          populate: {
            path: "departments",
            select: "name",
          },
        },
        { path: "clientBookedBy", select: "employeeName email" },
        { path: "externalBookedBy", select: "firstName middleName lastName" },
        {
          path: "receptionist",
          select: "firstName lastName departments",
          populate: { path: "departments", select: "name" },
        },
        { path: "client", select: "clientName" },
        {
          path: "externalClient",
          select: "registeredClientCompany visitorCompany",
        },
        // { path: "externalClient", select: "companyName pocName mobileNumber" },
        { path: "internalParticipants", select: "firstName lastName email" },
        { path: "clientParticipants", select: "employeeName email" },
        { path: "externalParticipants", select: "firstName lastName email" },
      ]);

    const currentUserId = user?.toString();

    const foundUser = currentUserId
      ? await UserData.findById(currentUserId)
          .populate({ path: "departments", select: "name" })
          .select("departments")
          .lean()
      : null;
    const userDepartments = foundUser?.departments?.length
      ? foundUser.departments
      : departments;
    const canViewAllMeetings = (userDepartments || []).some((department) =>
      ["Administration", "Top Management"].includes(department?.name),
    );

    const filteredMeetings = canViewAllMeetings
      ? meetings
      : meetings.filter(
          (meeting) =>
            meeting?.bookedBy?._id?.toString() === currentUserId ||
            meeting?.clientBookedBy?._id?.toString() === currentUserId ||
            (meeting?.internalParticipants || []).some(
              (participant) => participant?._id?.toString() === currentUserId,
            ) ||
            (meeting?.clientParticipants || []).some(
              (participant) => participant?._id?.toString() === currentUserId,
            ),
        );

    const reviews = await Review.find().select(
      "-createdAt -updatedAt -__v -company",
    );

    if (!reviews) {
      throw new Error({ message: "No reviews found" });
    }

    const internalParticipants = filteredMeetings.map(
      (meeting) => meeting.internalParticipants || [],
    );
    const clientParticipants = filteredMeetings.map(
      (meeting) => meeting.clientParticipants || [],
    );

    const transformedMeetings = filteredMeetings.map((meeting, index) => {
      const totalParticipants = [
        ...(internalParticipants[index] || []),
        ...(clientParticipants[index] || []),
        ...(meeting.externalParticipants || []),
      ];

      const meetingReviews = reviews.find(
        (review) => review.meeting.toString() === meeting._id.toString(),
      );

      const isReceptionist = meeting.receptionist?.departments?.some(
        (dept) => dept.name === "Administration",
      );

      return {
        _id: meeting._id,
        receptionist: isReceptionist
          ? formatPersonName(meeting.receptionist)
          : "N/A",
        clientBookedBy: meeting.clientBookedBy,
        department: meeting?.bookedBy?.departments,
        roomName: meeting.bookedRoom?.name,
        bookedBy:
          meeting.bookedBy ||
          (meeting.externalBookedBy
            ? {
                _id: meeting.externalBookedBy._id,
                firstName: meeting.externalBookedBy.firstName,
                middleName: meeting.externalBookedBy.middleName,
                lastName: meeting.externalBookedBy.lastName,
              }
            : null),
        location: meeting.bookedRoom?.location,
        client: meeting.client
          ? meeting.client.clientName
          : meeting.externalClient
            ? null
            : "BIZNest",
        externalClient: meeting.externalClient
          ? meeting.externalClient.registeredClientCompany
          : null,
        paymentAmount: meeting.paymentAmount ?? null,
        paymentMode: meeting.paymentMode ?? null,
        paymentStatus: meeting?.paymentStatus ? "Paid" : "Unpaid",
        paymentProof: meeting.paymentProof?.link ?? null,
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
        participants: totalParticipants,
        reviews: meetingReviews || [],
        discountAmount: meeting.discountAmount,
        paymentVerification: meeting.paymentVerification,
        company: meeting.company,
      };
    });

    if (isReport) {
      const meetingTypeFilter = String(type || "")
        .trim()
        .toLowerCase();

      const typeFilteredMeetings = ["internal", "external"].includes(
        meetingTypeFilter,
      )
        ? filteredMeetings.filter(
            (meeting) =>
              String(meeting?.meetingType || "")
                .trim()
                .toLowerCase() === meetingTypeFilter,
          )
        : filteredMeetings;

      return typeFilteredMeetings.map((meeting) => {
        const effectiveEndTime = getEffectiveEndTime(meeting);

        const participants =
          meetingTypeFilter === "external"
            ? meeting.externalParticipants || []
            : [
                ...(meeting.internalParticipants || []),
                ...(meeting.clientParticipants || []),
              ];

        const client = meeting.client
          ? meeting?.client?.clientName
          : meeting?.externalClient
            ? meeting?.externalClient?.visitorCompany
            : meeting.meetingType === "Internal"
              ? "BIZ Nest"
              : null;

        return {
          client,
          bookedBy:
            formatPersonName(meeting.bookedBy) ||
            meeting.clientBookedBy?.employeeName ||
            formatPersonName(meeting.externalBookedBy) ||
            "Unknown",
          buildingName: meeting.location?.building?.buildingName,
          roomName: meeting.roomName,
          unitName: meeting.location?.unitName,
          // meetingType: meeting.meetingType,
          subject: meeting.subject,
          agenda: meeting.agenda,
          startDate: meeting.startDate,
          endDate: meeting.endDate,
          duration: formatDuration(meeting.startTime, effectiveEndTime),
          startTime: meeting.startTime,
          endTime: effectiveEndTime,
          housekeepingStatus: meeting.housekeepingStatus,
          ...(type === "internal" && {
            department: (meeting?.bookedBy?.departments || [])
              .map((dept) => dept?.name)
              .filter(Boolean)
              .join(", "),
          }),

          participants: formatParticipants(participants),
          receptionist: formatPersonName(meeting.receptionist),
          location: meeting.location?.unitNo,
          meetingStatus: meeting.meetingStatus,
          ...(type === "external" && {
            registeredClientCompany:
              meeting?.externalClient?.registeredClientCompany,
            paymentAmount: meeting.paymentAmount ?? 0,
            paymnetDiscountAmount: meeting.discountAmount ?? 0,
            paymentMode: meeting.paymentMode,
            paymentStatus: meeting.paymentStatus,
            paymentVerification: meeting.paymentVerification,
            paymentProofUrl: meeting.paymentProof,
          }),
        };
      });
    }

    return transformedMeetings;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  fetchMeetingReportService,
};
