const Meeting = require("../../models/meetings/Meetings");
const Review = require("../../models/meetings/Reviews");
const UserData = require("../../models/hr/UserData");
const { formatDuration } = require("../../utils/formatDateTime");
const Company = require("../../models/hr/Company");
const Department = require("../../models/Departments");
const Room = require("../../models/meetings/Rooms");
const Unit = require("../../models/locations/Unit");
const Building = require("../../models/locations/Building");
const CoworkingClient = require("../../models/sales/CoworkingClient");
const CoworkingMember = require("../../models/sales/CoworkingMembers");
const Visitor = require("../../models/visitor/Visitor");
const { getPagination } = require("../../utils/pagination");

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

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const idsFrom = (documents) => documents.map(({ _id }) => _id);

const buildMeetingSearchConditions = async ({
  company,
  search,
  searchContext,
}) => {
  const normalizedSearch = String(search || "")
    .trim()
    .slice(0, 100);
  if (!normalizedSearch) return [];

  const escapedSearch = escapeRegex(normalizedSearch);
  const searchRegex = new RegExp(escapedSearch, "i");

  const [departments, buildings, clients, members, visitors] =
    await Promise.all([
      Department.find({ name: searchRegex }).select("_id").lean(),
      Building.find({ company, buildingName: searchRegex })
        .select("_id")
        .lean(),
      CoworkingClient.find({
        $or: [
          { clientName: searchRegex },
          { clientInvoiceName: searchRegex },
          { brandName: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
        ],
      })
        .select("_id")
        .lean(),
      CoworkingMember.find({
        company,
        $or: [
          { employeeName: searchRegex },
          { email: searchRegex },
          { mobileNo: searchRegex },
        ],
      })
        .select("_id")
        .lean(),
      Visitor.find({
        company,
        $or: [
          { firstName: searchRegex },
          { middleName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          { phoneNumber: searchRegex },
          { registeredClientCompany: searchRegex },
          { visitorCompany: searchRegex },
        ],
      })
        .select("_id")
        .lean(),
    ]);

  const departmentIds = idsFrom(departments);
  const buildingIds = idsFrom(buildings);
  const clientIds = idsFrom(clients);
  const memberIds = idsFrom(members);
  const visitorIds = idsFrom(visitors);

  const [users, units] = await Promise.all([
    UserData.find({
      company,
      $or: [
        { firstName: searchRegex },
        { middleName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { empId: searchRegex },
        ...(departmentIds.length
          ? [{ departments: { $in: departmentIds } }]
          : []),
      ],
    })
      .select("_id")
      .lean(),
    Unit.find({
      company,
      $or: [
        { unitName: searchRegex },
        { unitNo: searchRegex },
        ...(buildingIds.length ? [{ building: { $in: buildingIds } }] : []),
      ],
    })
      .select("_id")
      .lean(),
  ]);

  const userIds = idsFrom(users);
  const unitIds = idsFrom(units);
  const rooms = await Room.find({
    company,
    $or: [
      { name: searchRegex },
      { roomId: searchRegex },
      ...(unitIds.length ? [{ location: { $in: unitIds } }] : []),
    ],
  })
    .select("_id")
    .lean();
  const roomIds = idsFrom(rooms);

  const numericSearch = Number(normalizedSearch.replace(/,/g, ""));
  const durationMatch = normalizedSearch.match(
    /^(\d+)\s*(?:min|minute|minutes)?$/i,
  );
  const durationMinutes = durationMatch ? Number(durationMatch[1]) : null;
  const compactSearch = normalizedSearch
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const durationConditions =
    durationMinutes !== null
      ? [
          {
            $expr: {
              $eq: [
                {
                  $divide: [
                    {
                      $subtract: [
                        {
                          $max: [
                            "$endTime",
                            { $ifNull: ["$extendTime", "$endTime"] },
                          ],
                        },
                        "$startTime",
                      ],
                    },
                    60000,
                  ],
                },
                durationMinutes,
              ],
            },
          },
        ]
      : [];
  const bookedByConditions = [
    ...(userIds.length ? [{ bookedBy: { $in: userIds } }] : []),
    ...(memberIds.length ? [{ clientBookedBy: { $in: memberIds } }] : []),
    ...(visitorIds.length ? [{ externalBookedBy: { $in: visitorIds } }] : []),
  ];
  const venueConditions = roomIds.length
    ? [{ bookedRoom: { $in: roomIds } }]
    : [];
  const clientConditions = [
    ...(clientIds.length ? [{ client: { $in: clientIds } }] : []),
    ...(visitorIds.length ? [{ externalClient: { $in: visitorIds } }] : []),
  ];
  const normalizedLowerSearch = normalizedSearch.toLowerCase();
  const paymentStatusConditions = [];

  if (normalizedLowerSearch === "paid") {
    paymentStatusConditions.push({ paymentStatus: true });
  }
  if (
    normalizedLowerSearch === "unpaid" ||
    normalizedLowerSearch === "wait for payment"
  ) {
    paymentStatusConditions.push({ paymentStatus: false });
  }
  if (normalizedLowerSearch === "verify payment") {
    paymentStatusConditions.push({
      paymentStatus: true,
      paymentVerification: "Under Review",
    });
  }
  if (normalizedLowerSearch === "completed") {
    paymentStatusConditions.push({
      paymentStatus: true,
      paymentVerification: "Verified",
    });
  }
  if (normalizedLowerSearch === "review payment") {
    paymentStatusConditions.push({
      paymentStatus: true,
      paymentVerification: { $nin: ["Under Review", "Verified"] },
    });
  }

  if (searchContext === "internal-table") {
    return [
      { status: searchRegex },
      { houeskeepingStatus: searchRegex },
      ...bookedByConditions,
      ...venueConditions,
      ...clientConditions,
      ...(compactSearch && "biznest".includes(compactSearch)
        ? [
            { meetingType: "Internal", client: company },
            { meetingType: "Internal", client: null, externalClient: null },
          ]
        : []),
      ...(!Number.isNaN(numericSearch)
        ? [{ credits: numericSearch }, { creditsUsed: numericSearch }]
        : []),
    ];
  }

  if (searchContext === "external-table") {
    return [
      { subject: searchRegex },
      { agenda: searchRegex },
      { meetingType: searchRegex },
      { status: searchRegex },
      { houeskeepingStatus: searchRegex },
      { paymentMode: searchRegex },
      { paymentVerification: searchRegex },
      { "paymentProof.link": searchRegex },
      ...bookedByConditions,
      ...(userIds.length ? [{ receptionist: { $in: userIds } }] : []),
      ...venueConditions,
      ...clientConditions,
      ...durationConditions,
      ...(!Number.isNaN(numericSearch)
        ? [{ paymentAmount: numericSearch }, { discountAmount: numericSearch }]
        : []),
      ...paymentStatusConditions,
    ];
  }

  return [
    { subject: searchRegex },
    { agenda: searchRegex },
    { meetingType: searchRegex },
    { status: searchRegex },
    { houeskeepingStatus: searchRegex },
    { paymentMode: searchRegex },
    { paymentVerification: searchRegex },
    { "paymentProof.link": searchRegex },
    { "externalParticipants.name": searchRegex },
    { "externalParticipants.mobileNumber": searchRegex },
    {
      $expr: {
        $regexMatch: {
          input: { $toString: "$startTime" },
          regex: escapedSearch,
          options: "i",
        },
      },
    },
    {
      $expr: {
        $regexMatch: {
          input: {
            $toString: {
              $max: ["$endTime", { $ifNull: ["$extendTime", "$endTime"] }],
            },
          },
          regex: escapedSearch,
          options: "i",
        },
      },
    },
    ...(userIds.length
      ? [
          { bookedBy: { $in: userIds } },
          { receptionist: { $in: userIds } },
          { internalParticipants: { $in: userIds } },
        ]
      : []),
    ...(memberIds.length
      ? [
          { clientBookedBy: { $in: memberIds } },
          { clientParticipants: { $in: memberIds } },
        ]
      : []),
    ...(visitorIds.length
      ? [
          { externalBookedBy: { $in: visitorIds } },
          { externalClient: { $in: visitorIds } },
        ]
      : []),
    ...(clientIds.length ? [{ client: { $in: clientIds } }] : []),
    ...(roomIds.length ? [{ bookedRoom: { $in: roomIds } }] : []),
    ...(durationMinutes !== null
      ? [
          {
            $expr: {
              $eq: [
                {
                  $divide: [
                    {
                      $subtract: [
                        {
                          $max: [
                            "$endTime",
                            { $ifNull: ["$extendTime", "$endTime"] },
                          ],
                        },
                        "$startTime",
                      ],
                    },
                    60000,
                  ],
                },
                durationMinutes,
              ],
            },
          },
        ]
      : []),
    ...(!Number.isNaN(numericSearch)
      ? [
          { paymentAmount: numericSearch },
          { discountAmount: numericSearch },
          { creditsUsed: numericSearch },
        ]
      : []),
    ...("paid".includes(normalizedSearch.toLowerCase())
      ? [{ paymentStatus: true }]
      : []),
    ...("unpaid".includes(normalizedSearch.toLowerCase())
      ? [{ paymentStatus: false }]
      : []),
    ...(compactSearch && "biznest".includes(compactSearch)
      ? [
          { meetingType: "Internal", client: company },
          { meetingType: "Internal", client: null, externalClient: null },
        ]
      : []),
  ];
};

const fetchMeetingReportService = async ({
  dateFilter,
  departments = [],
  roles = [],
  company,
  user,
  isReport = false,
  type,
  completed,
  includeTotal = false,
  page,
  limit,
  search,
  searchContext,
}) => {
  try {
    const {
      shouldPaginate,
      page: parsedPage,
      limit: parsedLimit,
      skip,
    } = getPagination({ page, limit });
    let total;
    const buildResponse = (data) =>
      shouldPaginate
        ? {
            data,
            pagination: {
              page: parsedPage,
              limit: parsedLimit,
              total,
              totalPages: Math.ceil(total / parsedLimit),
            },
          }
        : includeTotal
          ? {
              data,
              total,
            }
          : data;

    const currentUserId = user?.toString();
    const foundUser = currentUserId
      ? await UserData.findById(currentUserId)
          .populate({ path: "departments", select: "name" })
         .select("departments email")
          .lean()
      : null;
     const currentMemberIds = foundUser?.email
      ? idsFrom(
          await CoworkingMember.find({
            email: foundUser.email,
            isActive: true,
          })
            .select("_id")
            .collation({ locale: "en", strength: 2 })
            .lean(),
        )
      : [];
    const currentMemberIdSet = new Set(
      currentMemberIds.map((memberId) => memberId.toString()),
    );
    const userDepartments = foundUser?.departments?.length
      ? foundUser.departments
      : departments;
    const canViewAllMeetings = (userDepartments || []).some((department) =>
      ["Administration", "Top Management", "Finance"].includes(
        department?.name,
      ),
    );

    if (!canViewAllMeetings && !currentUserId) {
      total = 0;
      return buildResponse([]);
    }

    const meetingTypeFilter = String(type || "")
      .trim()
      .toLowerCase();
    const normalizedCompletedFilter = String(completed ?? "")
      .trim()
      .toLowerCase();
    const shouldHideCompleted = normalizedCompletedFilter === "false";
    const searchConditions = await buildMeetingSearchConditions({
      company,
      search,
      searchContext,
    });
    const calendarVisibleStatusQuery =
      includeTotal && !shouldPaginate
        ? {
            status: {
              $in: ["Upcoming", "Completed"],
            },
          }
        : {};

    const meetingQuery = {
      company,
      ...(dateFilter?.startDate && { startDate: dateFilter.startDate }),
      ...(["internal", "external"].includes(meetingTypeFilter) && {
        meetingType:
          meetingTypeFilter.charAt(0).toUpperCase() +
          meetingTypeFilter.slice(1),
      }),
      ...calendarVisibleStatusQuery,
      ...(shouldHideCompleted && {
        status: { $nin: ["Completed", "Cancelled"] },
      }),
      ...(searchConditions.length && {
        $and: [{ $or: searchConditions }],
      }),
      ...(!canViewAllMeetings &&
        currentUserId && {
          $or: [
            // { bookedBy: currentUserId },
            // { clientBookedBy: currentUserId },
            // { internalParticipants: currentUserId },
            // { clientParticipants: currentUserId },

             { bookedBy: currentUserId },
            { internalParticipants: currentUserId },
            ...(currentMemberIds.length
              ? [
                  { clientBookedBy: { $in: currentMemberIds } },
                  { clientParticipants: { $in: currentMemberIds } },
                ]
              : []),
          ],
        }),
    };

    if (includeTotal && !shouldPaginate) {
      total = await Meeting.countDocuments(meetingQuery).exec();
    }

    let meetingsQuery = Meeting.find(meetingQuery)
      .select(
        "bookedBy clientBookedBy externalBookedBy receptionist bookedRoom startDate endDate startTime endTime extendTime meetingType credits creditsUsed paymentAmount paymentStatus paymentMode paymentProof paymentVerification internalParticipants clientParticipants externalParticipants agenda subject status client externalClient company housekeepingChecklist houeskeepingStatus discountAmount extend",
      )
      .populate({ path: "company", select: "meetingCreditBalance" })
      .populate({
        path: "bookedRoom",
        select: "name housekeepingStatus location",
        populate: {
          path: "location",
          select: "unitName unitNo building",
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
        {
          path: "client",
          select: "clientName meetingCreditBalance",
          transform: (clientDocument, clientId) => {
            const isHostCompany = clientId?.toString() === company?.toString();

            if (isHostCompany) {
              return {
                _id: clientId,
                clientName: "BIZNest",
                isHostCompany: true,
              };
            }

            return clientDocument;
          },
        },
        {
          path: "externalClient",
          select: "registeredClientCompany visitorCompany",
        },
        // { path: "externalClient", select: "companyName pocName mobileNumber" },
        { path: "internalParticipants", select: "firstName lastName email" },
        { path: "clientParticipants", select: "employeeName email" },
      ]);

    if (shouldPaginate) {
      meetingsQuery = meetingsQuery
        .sort({ startDate: -1, _id: -1 })
        .skip(skip)
        .limit(parsedLimit);
    }

    let meetings;
    if (shouldPaginate) {
      [meetings, total] = await Promise.all([
        meetingsQuery.lean().exec(),
        Meeting.countDocuments(meetingQuery).exec(),
      ]);
    } else {
      meetings = await meetingsQuery.lean().exec();
    }

    const meetingIds = meetings.map((meeting) => meeting._id);
    const reviews = meetingIds.length
      ? await Review.find({ meeting: { $in: meetingIds } })
          .select("-createdAt -updatedAt -__v -company")
          .lean()
          .exec()
      : [];

    const reviewsByMeetingId = reviews.reduce((acc, review) => {
      const meetingId = review.meeting?.toString();
      if (meetingId) {
        acc[meetingId] = review;
      }
      return acc;
    }, {});

    const getMeetingReview = (meeting) =>
      reviewsByMeetingId[meeting._id?.toString()] || [];

    const transformedMeetings = meetings.map((meeting) => {
      const totalParticipants = [
        ...(meeting.internalParticipants || []),
        ...(meeting.clientParticipants || []),
        ...(meeting.externalParticipants || []),
      ];

      const isReceptionist = meeting.receptionist?.departments?.some(
        (dept) => dept.name === "Administration",
      );
        const isCurrentUserInvolved = Boolean(
        meeting.bookedBy?._id?.toString() === currentUserId ||
          (meeting.internalParticipants || []).some(
            (participant) => participant?._id?.toString() === currentUserId,
          ) ||
          currentMemberIdSet.has(meeting.clientBookedBy?._id?.toString()) ||
          (meeting.clientParticipants || []).some((participant) =>
            currentMemberIdSet.has(participant?._id?.toString()),
          ),
      );

      return {
        _id: meeting._id,
         isCurrentUserInvolved,
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
        duration: formatDuration(
          meeting.startTime,
          getEffectiveEndTime(meeting),
        ),
        meetingStatus: meeting.status,
        action: meeting.extend,
        agenda: meeting.agenda,
        subject: meeting.subject,
        housekeepingChecklist: [...(meeting.housekeepingChecklist ?? [])],
        participants: totalParticipants,
        reviews: getMeetingReview(meeting),
        discountAmount: meeting.discountAmount,
        paymentVerification: meeting.paymentVerification,
        company: meeting.company,
      };
    });

    const hostMeetingCreditBalance = meetings[0]?.company?.meetingCreditBalance;

    if (isReport) {
      const reportMeetings = meetings.map((meeting) => {
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
            ? meeting?.externalClient?.registeredClientCompany
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
          roomName: meeting.bookedRoom?.name,
          subject: meeting.subject,
          agenda: meeting.agenda,
          startDate: meeting.startDate,
          endDate: meeting.endDate,
          duration: formatDuration(meeting.startTime, effectiveEndTime),
          startTime: meeting.startTime,
          endTime: effectiveEndTime,
          meetingType: meeting.meetingType,
          housekeepingStatus: meeting.houeskeepingStatus,
          ...(meetingTypeFilter === "internal" && {
            department: (meeting?.bookedBy?.departments || [])
              .map((dept) => dept?.name)
              .filter(Boolean)
              .join(", "),
            creditsUsed: meeting.creditsUsed ?? 0,
            remainingCredits: meeting.client
              ? meeting.client?.meetingCreditBalance
              : hostMeetingCreditBalance,
          }),

          participants: formatParticipants(participants),
          receptionist: formatPersonName(meeting.receptionist),
          location: meeting.bookedRoom?.location,
          meetingStatus: meeting.status,
          ...(meetingTypeFilter === "external" && {
            paymentAmount: meeting.paymentAmount ?? 0,
            paymentDiscountAmount: meeting.discountAmount ?? 0,
            paymentMode: meeting.paymentMode,
            paymentStatus: meeting.paymentStatus,
            paymentVerification: meeting.paymentVerification,
            paymentProofUrl: meeting.paymentProof,
          }),
        };
      });

      return buildResponse(reportMeetings);
    }

    return buildResponse(transformedMeetings);
  } catch (error) {
    throw error;
  }
};

// const fetchMeetingReportService = async ({
//   dateFilter,
//   departments = [],
//   roles = [],
//   company,
//   user,
//   isReport = false,
//   type,
// }) => {
//   try {
//     const meetings = await Meeting.find({
//       company,
//       ...(dateFilter?.startDate && {
//         startDate: dateFilter?.startDate,
//       }),
//     })
//       .populate({ path: "company", select: "meetingCreditBalance" })
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
//           select: "firstName middleName lastName email departments designation",
//           populate: {
//             path: "departments",
//             select: "name",
//           },
//         },
//         { path: "clientBookedBy", select: "employeeName email" },
//         { path: "externalBookedBy", select: "firstName middleName lastName" },
//         {
//           path: "receptionist",
//           select: "firstName lastName departments",
//           populate: { path: "departments", select: "name" },
//         },
//         { path: "client", select: "clientName meetingCreditBalance" },
//         {
//           path: "externalClient",
//           select: "registeredClientCompany visitorCompany",
//         },
//         // { path: "externalClient", select: "companyName pocName mobileNumber" },
//         { path: "internalParticipants", select: "firstName lastName email" },
//         { path: "clientParticipants", select: "employeeName email" },
//         { path: "externalParticipants", select: "firstName lastName email" },
//       ]);

//     const currentUserId = user?.toString();

//     const foundUser = currentUserId
//       ? await UserData.findById(currentUserId)
//           .populate({ path: "departments", select: "name" })
//           .select("departments")
//           .lean()
//       : null;
//     const userDepartments = foundUser?.departments?.length
//       ? foundUser.departments
//       : departments;
//     const canViewAllMeetings = (userDepartments || []).some((department) =>
//       ["Administration", "Top Management"].includes(department?.name),
//     );

//     const filteredMeetings = canViewAllMeetings
//       ? meetings
//       : meetings.filter(
//           (meeting) =>
//             meeting?.bookedBy?._id?.toString() === currentUserId ||
//             meeting?.clientBookedBy?._id?.toString() === currentUserId ||
//             (meeting?.internalParticipants || []).some(
//               (participant) => participant?._id?.toString() === currentUserId,
//             ) ||
//             (meeting?.clientParticipants || []).some(
//               (participant) => participant?._id?.toString() === currentUserId,
//             ),
//         );

//     const reviews = await Review.find().select(
//       "-createdAt -updatedAt -__v -company",
//     );

//     if (!reviews) {
//       throw new Error({ message: "No reviews found" });
//     }

//     const internalParticipants = filteredMeetings.map(
//       (meeting) => meeting.internalParticipants || [],
//     );
//     const clientParticipants = filteredMeetings.map(
//       (meeting) => meeting.clientParticipants || [],
//     );

//     const transformedMeetings = filteredMeetings.map((meeting, index) => {
//       const totalParticipants = [
//         ...(internalParticipants[index] || []),
//         ...(clientParticipants[index] || []),
//         ...(meeting.externalParticipants || []),
//       ];

//       const meetingReviews = reviews.find(
//         (review) => review.meeting.toString() === meeting._id.toString(),
//       );

//       const isReceptionist = meeting.receptionist?.departments?.some(
//         (dept) => dept.name === "Administration",
//       );

//       return {
//         _id: meeting._id,
//         receptionist: isReceptionist
//           ? formatPersonName(meeting.receptionist)
//           : "N/A",
//         clientBookedBy: meeting.clientBookedBy,
//         department: meeting?.bookedBy?.departments,
//         roomName: meeting.bookedRoom?.name,
//         bookedBy:
//           meeting.bookedBy ||
//           (meeting.externalBookedBy
//             ? {
//                 _id: meeting.externalBookedBy._id,
//                 firstName: meeting.externalBookedBy.firstName,
//                 middleName: meeting.externalBookedBy.middleName,
//                 lastName: meeting.externalBookedBy.lastName,
//               }
//             : null),
//         location: meeting.bookedRoom?.location,
//         client: meeting.client
//           ? meeting.client.clientName
//           : meeting.externalClient
//             ? null
//             : "BIZNest",
//         externalClient: meeting.externalClient
//           ? meeting.externalClient.registeredClientCompany
//           : null,
//         paymentAmount: meeting.paymentAmount ?? null,
//         paymentMode: meeting.paymentMode ?? null,
//         paymentStatus: meeting?.paymentStatus ? "Paid" : "Unpaid",
//         paymentProof: meeting.paymentProof?.link ?? null,
//         meetingType: meeting.meetingType,
//         housekeepingStatus: meeting.houeskeepingStatus,
//         date: meeting.startDate,
//         endDate: meeting.endDate,
//         startTime: meeting.startTime,
//         endTime: meeting.endTime,
//         extendTime: meeting.extendTime,
//         credits: meeting.credits,
//         duration: formatDuration(meeting.startTime, meeting.endTime),
//         meetingStatus: meeting.status,
//         action: meeting.extend,
//         agenda: meeting.agenda,
//         subject: meeting.subject,
//         housekeepingChecklist: [...(meeting.housekeepingChecklist ?? [])],
//         participants: totalParticipants,
//         reviews: meetingReviews || [],
//         discountAmount: meeting.discountAmount,
//         paymentVerification: meeting.paymentVerification,
//         company: meeting.company,
//       };
//     });

//     // const hostCompany = await Company.findById(company)
//     //   .select("meetingCreditBalance")
//     //   .lean();

//     const hostCompany = meetings[0]?.company.meetingCreditBalance;

//     if (isReport) {
//       const meetingTypeFilter = String(type || "")
//         .trim()
//         .toLowerCase();

//       const typeFilteredMeetings = ["internal", "external"].includes(
//         meetingTypeFilter,
//       )
//         ? filteredMeetings.filter(
//             (meeting) =>
//               String(meeting?.meetingType || "")
//                 .trim()
//                 .toLowerCase() === meetingTypeFilter,
//           )
//         : filteredMeetings;

//       return typeFilteredMeetings.map((meeting) => {
//         const effectiveEndTime = getEffectiveEndTime(meeting);

//         const meetingReviews = reviews.find(
//           (review) => review.meeting?.toString() === meeting._id?.toString(),
//         );

//         const participants =
//           meetingTypeFilter === "external"
//             ? meeting.externalParticipants || []
//             : [
//                 ...(meeting.internalParticipants || []),
//                 ...(meeting.clientParticipants || []),
//               ];

//         const client = meeting.client
//           ? meeting?.client?.clientName
//           : meeting?.externalClient
//             ? meeting?.externalClient?.registeredClientCompany
//             : meeting.meetingType === "Internal"
//               ? "BIZ Nest"
//               : null;

//         return {
//           client,
//           bookedBy:
//             formatPersonName(meeting.bookedBy) ||
//             meeting.clientBookedBy?.employeeName ||
//             formatPersonName(meeting.externalBookedBy) ||
//             "Unknown",
//           roomName: meeting.bookedRoom?.name,
//           // meetingType: meeting.meetingType,
//           subject: meeting.subject,
//           agenda: meeting.agenda,
//           startDate: meeting.startDate,
//           endDate: meeting.endDate,
//           duration: formatDuration(meeting.startTime, effectiveEndTime),
//           startTime: meeting.startTime,
//           endTime: effectiveEndTime,
//           housekeepingStatus: meeting.houeskeepingStatus,
//           ...(meetingTypeFilter === "internal" && {
//             department: (meeting?.bookedBy?.departments || [])
//               .map((dept) => dept?.name)
//               .filter(Boolean)
//               .join(", "),
//             creditsUsed: meeting.creditsUsed ?? 0,
//             remainingCredits: meeting.client
//               ? meeting.client?.meetingCreditBalance
//               : hostCompany.meetingCreditBalance,
//           }),

//           participants: formatParticipants(participants),
//           receptionist: formatPersonName(meeting.receptionist),
//           location: meeting.bookedRoom?.location,
//           meetingStatus: meeting.status,
//           ...(meetingTypeFilter === "external" && {
//             paymentAmount: meeting.paymentAmount ?? 0,
//             paymentDiscountAmount: meeting.discountAmount ?? 0,
//             paymentMode: meeting.paymentMode,
//             paymentStatus: meeting.paymentStatus,
//             paymentVerification: meeting.paymentVerification,
//             paymentProofUrl: meeting.paymentProof,
//           }),
//         };
//       });
//     }

//     return transformedMeetings;
//   } catch (error) {
//     throw error;
//   }
// };

module.exports = {
  fetchMeetingReportService,
};
