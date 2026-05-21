const Department = require("../../models/Departments");
const Meeting = require("../../models/meetings/Meetings");
const Review = require("../../models/meetings/Reviews");
const { formatDuration } = require("../../utils/formatDateTime");

const fetchMeetingReportService = async ({
  dateFilter,
  departments = [],
  roles = [],
  company,
  user,
  isReport = false,
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
        ,
        { path: "clientBookedBy", select: "employeeName email" },
        { path: "externalBookedBy", select: "firstName middleName lastName" },
        {
          path: "receptionist",
          select: "firstName lastName departments",
          populate: { path: "departments", select: "name" },
        },
        { path: "client", select: "clientName" },
        { path: "externalClient", select: "registeredClientCompany" },
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

    const currentUserId = user?.toString();

    if (
      !roles.includes("Administration Admin") &&
      !roles.includes("Finance Admin") &&
      !roles.includes("Administration Employee") &&
      !roles.includes("Master Admin") &&
      !roles.includes("Super Admin") &&
      !roles.includes("Tech Admin") &&
      !roles.includes("Tech Employee")
    ) {
      filteredMeetings = meetings.filter((meeting) => {
        const isMeetingParticipant =
          meeting?.bookedBy?._id?.toString() === currentUserId ||
          meeting?.clientBookedBy?._id?.toString() === currentUserId ||
          (meeting?.internalParticipants || []).some(
            (participant) => participant?._id?.toString() === currentUserId,
          ) ||
          (meeting?.clientParticipants || []).some(
            (participant) => participant?._id?.toString() === currentUserId,
          );

        if (isMeetingParticipant) return true;

        if (!meeting.bookedBy || !Array.isArray(meeting.bookedBy.departments)) {
          return false;
        }

        const bookedDeptIds = meeting.bookedBy.departments.map((dept) =>
          dept._id?.toString(),
        );

        return bookedDeptIds.some((deptId) => departmentIds.includes(deptId));
      });
    }

    const reviews = await Review.find().select(
      "-createdAt -updatedAt -__v -company",
    );

    if (!reviews) {
      throw new Error({ message: "No reviews found" });
    }

    const internalParticipants = filteredMeetings.map((meeting) =>
      meeting.internalParticipants.map((participant) => participant),
    );
    const clientParticipants = filteredMeetings.map((meeting) =>
      meeting.clientParticipants.map((participant) => participant),
    );

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

    //   const isReceptionist = Array.isArray(meeting?.receptionist?.departments)
    //     ? meeting.receptionist.departments.some(
    //         (dept) => dept.name === "Administration",
    //       )
    //     : false;

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

    //   const bookedBy = meeting.bookedBy
    //     ? [
    //         meeting.bookedBy.firstName,
    //         meeting.bookedBy.middleName,
    //         meeting.bookedBy.lastName,
    //       ]
    //         .filter(Boolean)
    //         .join(" ")
    //     : "";

    //   console.log("bookedBy", meeting?.bookedBy);
    //   console.log("dept", meeting.bookedBy?.departments);
    //   return {
    //     _id: meeting._id,
    //     name: meeting.bookedBy
    //       ? [
    //           meeting.bookedBy.firstName,
    //           meeting.bookedBy.middleName,
    //           meeting.bookedBy.lastName,
    //         ]
    //           .filter(Boolean)
    //           .join(" ")
    //       : null,
    //     receptionist: isReceptionist ? receptionist : "N/A",

    //     clientBookedBy: meeting.clientBookedBy
    //       ? meeting.clientBookedBy.employeeName || meeting.clientBookedBy.email
    //       : null,
    //     department: Array.isArray(meeting?.bookedBy?.departments)
    //       ? meeting.bookedBy.departments
    //       : [],
    //     roomName: meeting.bookedRoom.name,
    //     bookedBy: meeting.bookedBy || null,
    //     bookedByName: meeting.bookedBy
    //       ? [meeting.bookedBy.firstName, meeting.bookedBy.lastName]
    //           .filter(Boolean)
    //           .join(" ") || meeting.bookedBy.email
    //       : meeting.externalBookedBy
    //         ? [
    //             meeting.externalBookedBy.firstName,
    //             meeting.externalBookedBy.middleName,
    //             meeting.externalBookedBy.lastName,
    //           ]
    //             .filter(Boolean)
    //             .join(" ")
    //         : null,

    //     location: meeting.bookedRoom.location,
    //     client: meeting.client ? meeting.client.clientName : null,

    //     externalClient: meeting.externalClient
    //       ? meeting.externalClient.registeredClientCompany ||
    //         meeting.externalClient.visitorCompany ||
    //         [
    //           meeting.externalClient.firstName,
    //           meeting.externalClient.middleName,
    //           meeting.externalClient.lastName,
    //         ]
    //           .filter(Boolean)
    //           .join(" ")
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
    //     participants:
    //       totalParticipants.length > 0
    //         ? totalParticipants
    //         : internalParticipants[index].length > 0
    //           ? internalParticipants[index]
    //           : clientParticipants[index].length > 0
    //             ? clientParticipants[index]
    //             : meeting.externalParticipants,

    //     reviews: meetingReviews ? meetingReviews : [],
    //     discountAmount: meeting.discountAmount,
    //     paymentVerification: meeting.paymentVerification,
    //     company: meeting.company,
    //   };
    // });

    const transformedMeetings = filteredMeetings.map((meeting, index) => {
      // let totalParticipants = [];
      // if (
      //   internalParticipants[index].length &&
      //   clientParticipants[index].length &&
      //   meeting.externalParticipants.length
      // ) {
      //   totalParticipants = [
      //     ...internalParticipants[index],
      //     ...meeting.externalParticipants,
      //   ];
      // }
      const totalParticipants = [
        ...(internalParticipants[index] || []),
        ...(clientParticipants[index] || []),
        ...(meeting.externalParticipants || []),
      ];

      const meetingReviews = reviews.find(
        (review) => review.meeting.toString() === meeting._id.toString(),
      );

      const isClient = meeting.client ? true : false;

      const isReceptionist = meeting.receptionist.departments.some(
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

      return {
        _id: meeting._id,

        receptionist: isReceptionist ? receptionist : "N/A",
        clientBookedBy: isReport
          ? meeting.clientBookedBy?.employeeName
          : meeting.clientBookedBy,
        department: meeting?.bookedBy?.departments,
        roomName: meeting.bookedRoom.name,
        bookedBy: isReport
          ? meeting.bookedBy
            ? `${meeting.bookedBy.firstName} ${meeting.bookedBy.lastName}`
            : meeting.externalBookedBy
              ? {
                  _id: meeting.externalBookedBy._id,
                  firstName: meeting.externalBookedBy.firstName,
                  middleName: meeting.externalBookedBy.middleName,
                  lastName: meeting.externalBookedBy.lastName,
                }
              : null
          : meeting.bookedBy ||
            (meeting.externalBookedBy
              ? {
                  _id: meeting.externalBookedBy._id,
                  firstName: meeting.externalBookedBy.firstName,
                  middleName: meeting.externalBookedBy.middleName,
                  lastName: meeting.externalBookedBy.lastName,
                }
              : null),
        location: isReport
          ? `${meeting.bookedRoom.location.unitNo}`
          : meeting.bookedRoom.location,
        client: isClient
          ? meeting.client.clientName
          : meeting.externalClient
            ? null
            : "BIZNest",
        externalClient: meeting.externalClient
          ? meeting.externalClient.registeredClientCompany
          : null,
        paymentAmount: meeting.paymentAmount ? meeting.paymentAmount : null,
        paymentMode: meeting.paymentMode ? meeting.paymentMode : null,
        paymentStatus: meeting?.paymentStatus ? "Paid" : "Unpaid",
        paymentProof: meeting.paymentProof ? meeting.paymentProof.link : null,
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
        // participants:
        //   totalParticipants.length > 0
        //     ? totalParticipants
        //     : internalParticipants[index].length > 0
        //     ? internalParticipants[index]
        //     : clientParticipants[index].length > 0
        //     ? clientParticipants[index]
        //     : meeting.externalParticipants,
        participants: totalParticipants,
        reviews: meetingReviews ? meetingReviews : [],
        discountAmount: meeting.discountAmount,
        paymentVerification: meeting.paymentVerification,
        company: meeting.company,
      };
    });

    return transformedMeetings;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  fetchMeetingReportService,
};
