const { default: mongoose } = require("mongoose");
const ExternalVisits = require("../../models/visitor/ExternalVisits");
const Visitor = require("../../models/visitor/Visitor");

const normalizeVisitorQuery = (query) =>
  typeof query === "string" ? query : query?.query;

const populateVisitorListFields = [
  {
    path: "department",
    select: "name",
  },
  {
    path: "visitorCompany",
    select: "companyName pocName",
  },
  {
    path: "toMeet",
    select: "firstName lastName email",
  },
  {
    path: "toMeetCompany",
    select: "clientName companyName name",
  },
  {
    path: "clientToMeet",
    select: "employeeName email",
  },
  {
    path: "checkedInBy",
    select: "firstName lastName",
  },
  {
    path: "checkedOutBy",
    select: "firstName lastName",
  },
  {
    path: "meeting",
    select:
      "subject agenda startDate endDate startTime endTime meetingType status",
  },
  {
    path: "building",
    select: "buildingName",
  },
  {
    path: "unit",
    select: "unitNo unitName",
  },
];

const attachExternalVisits = async (visitors, companyId) => {
  if (!Array.isArray(visitors) || visitors.length === 0) {
    return visitors;
  }

  const visitorIds = visitors.map((visitor) => visitor._id).filter(Boolean);
  const visits = await ExternalVisits.find({
    visitorId: { $in: visitorIds },
    ...(companyId && { company: companyId }),
  })
    .select("-__v")
    .sort({ checkIn: -1 })
    .lean()
    .exec();

  const visitsByVisitor = visits.reduce((acc, visit) => {
    const visitorId = visit.visitorId?.toString();
    if (!visitorId) {
      return acc;
    }

    if (!acc[visitorId]) {
      acc[visitorId] = [];
    }

    acc[visitorId].push(visit);
    return acc;
  }, {});

  return visitors.map((visitor) => ({
    ...visitor,
    externalVisits: visitsByVisitor[visitor._id.toString()] || [],
  }));
};

const fetchVisitorReportService = async ({
  dateFilter,
  query,
  company,
  visitorFlag,
  isMeeting = false,
  isOpendDesk = false,
}) => {
  console.log("dateFilter", dateFilter);
  try {
    const companyId = new mongoose.Types.ObjectId(company);
    const queryKey = normalizeVisitorQuery(query);
    let visitors;
    const filter = { company: companyId };

    if (visitorFlag) {
      filter.visitorFlag = visitorFlag;
    }

    if (dateFilter?.checkIn) {
      filter.checkIn = {
        ...(dateFilter.checkIn.$gte && {
          $gte: new Date(dateFilter.checkIn.$gte),
        }),
        ...(dateFilter.checkIn.$lte && {
          $lte: new Date(dateFilter.checkIn.$lte),
        }),
      };
    } else {
      console.log(
        "dateFilter is not provided, using default date range for dashboard",
      );
      //for dashboard
      filter.checkIn = {
        $gte: new Date("2026-01-01T18:30:00.000Z"),
        $lte: new Date("2027-03-31T18:29:59.999Z"),
      };
    }

    if (isMeeting) {
      filter.visitorType = "Meeting";
    }

    if (isOpendDesk) {
      filter.visitorType = {
        $in: ["Full-Day Pass", "Half-Day Pass"],
      };
    }

    console.log("filter", filter);

    // {
    //       company: companyId,
    //       ...(dateFilter?.checkIn && {
    //         checkIn: dateFilter?.checkIn,
    //       }),
    //     }

    console.time("mongo-aggregate");

    // visitors = await Visitor.aggregate([
    //   { $match: filter },
    //   {
    //     $project: {
    //       firstName: 1,
    //       lastName: 1,
    //       email: 1,
    //       checkIn: 1,
    //       checkOut: 1,
    //       visitorType: 1,
    //     },
    //   },
    // ]);

    console.timeEnd("mongo-aggregate");

    console.log("Mongo state:", mongoose.connection.readyState);

    //     const result = await Visitor.aggregate([
    //   { $match: filter },
    //   { $project: { _id: 1 } },
    // ]).explain("executionStats");

    // console.dir(result, { depth: null });

    switch (queryKey) {
      case "department":
        visitors = await Visitor.aggregate([
          {
            $match: {
              ...filter,
            },
          },
          { $match: { department: { $ne: null } } },
          {
            $group: {
              _id: "$department",
              visitors: { $sum: 1 },
            },
          },
          {
            $lookup: {
              from: "departments",
              localField: "_id",
              foreignField: "_id",
              as: "department",
            },
          },
          { $unwind: "$department" },
          { $project: { department: "$department.name", visitors: 1 } },
        ]);
        break;

      case "today":
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        visitors = await Visitor.find({
          ...filter,
          dateOfVisit: { $gte: startOfDay, $lte: endOfDay },
        })
          .select("-__v")
          .populate(populateVisitorListFields)
          .lean()
          .exec();
        visitors = await attachExternalVisits(visitors, companyId);
        break;

      default:
        // visitors = await Visitor.find(filter)
        //   .select("-__v")
        //   .populate(populateVisitorListFields)
        //   .lean()
        //   .exec();
        visitors = await Visitor.aggregate([
          {
            $match: filter,
          },

          {
            $project: {
              firstName: 1,
              middleName: 1,
              lastName: 1,
              email: 1,
              gender: 1,
              phoneNumber: 1,
              city: 1,
              state: 1,
              sector: 1,
              visitorType: 1,
              visitrFlag: 1,
              purposeOfVisit: 1,
              visitorRoles: 1,
              department: 1,
              visitorCompany: 1,
              ...(dateFilter?.checkIn && {
                toMeet: 1,
                clientToMeet: 1,
                toMeetCompany: 1,
                checkedInBy: 1,
                checkedOutBy: 1,
                building: 1,
                unit: 1,
              }),

              dateOfVisit: 1,
              scheduledDate: 1,
              scheduledStartTime: 1,
              scheduledEndTime: 1,
              checkIn: 1,
              checkOut: 1,
              amount: 1,
              gstAmount: 1,
              discount: 1,
              totalAmount: 1,
              paymentStatus: 1,
              paymentMode: 1,
              paymentProof: 1,
              notes: 1,
              gstNumber: 1,
              panNumber: 1,
              idProof: 1,
              panFile: 1,
              otherFile: 1,
              gstFile: 1,
              registeredClientCompany: 1,
              brandName: 1,
            },
          },

          ...(dateFilter?.checkIn
            ? [
                {
                  $set: {
                    hasToMeet: {
                      $and: [
                        { $ne: [{ $type: "$toMeet" }, "missing"] },
                        { $ne: ["$toMeet", null] },
                      ],
                    },
                  },
                },
                {
                  $lookup: {
                    from: "userdatas",
                    localField: "toMeet",
                    foreignField: "_id",
                    pipeline: [
                      {
                        $project: {
                          firstName: 1,
                          lastName: 1,
                          email: 1,
                        },
                      },
                    ],
                    as: "toMeet",
                  },
                },
                {
                  $set: {
                    toMeet: { $first: "$toMeet" },
                  },
                },

                {
                  $lookup: {
                    from: "coworkingmembers",
                    localField: "clientToMeet",
                    foreignField: "_id",
                    pipeline: [
                      {
                        $project: {
                          employeeName: 1,
                          email: 1,
                        },
                      },
                    ],
                    as: "clientToMeet",
                  },
                },
                {
                  $set: {
                    clientToMeet: { $first: "$clientToMeet" },
                  },
                },

                {
                  $lookup: {
                    from: "coworkingclients",
                    localField: "toMeetCompany",
                    foreignField: "_id",
                    pipeline: [
                      {
                        $project: {
                          clientName: 1,
                          companyName: 1,
                          name: 1,
                        },
                      },
                    ],
                    as: "toMeetCompany",
                  },
                },
                {
                  $set: {
                    toMeetCompany: {
                      $cond: [
                        "$hasToMeet",
                        "BIZ Nest",
                        { $first: "$toMeetCompany" },
                      ],
                    },
                  },
                },
                {
                  $unset: "hasToMeet",
                },

                {
                  $lookup: {
                    from: "userdatas",
                    localField: "checkedInBy",
                    foreignField: "_id",
                    pipeline: [
                      {
                        $project: {
                          firstName: 1,
                          lastName: 1,
                        },
                      },
                    ],
                    as: "checkedInBy",
                  },
                },
                {
                  $set: {
                    checkedInBy: { $first: "$checkedInBy" },
                  },
                },

                {
                  $lookup: {
                    from: "userdatas",
                    localField: "checkedOutBy",
                    foreignField: "_id",
                    pipeline: [
                      {
                        $project: {
                          firstName: 1,
                          lastName: 1,
                        },
                      },
                    ],
                    as: "checkedOutBy",
                  },
                },
                {
                  $set: {
                    checkedOutBy: { $first: "$checkedOutBy" },
                  },
                },
                {
                  $lookup: {
                    from: "units",
                    localField: "unit",
                    foreignField: "_id",
                    pipeline: [
                      {
                        $project: {
                          unitNo: 1,
                          unitName: 1,
                        },
                      },
                    ],
                    as: "unit",
                  },
                },
                {
                  $set: {
                    unit: { $first: "$unit" },
                  },
                },

                {
                  $lookup: {
                    from: "buildings",
                    localField: "building",
                    foreignField: "_id",
                    pipeline: [
                      {
                        $project: {
                          buildingName: 1,
                        },
                      },
                    ],
                    as: "building",
                  },
                },
                {
                  $set: {
                    building: { $first: "$building" },
                  },
                },

                //        {
                //   $lookup: {
                //     from: "externalvisits",
                //     let: {
                //       visitorId: "$_id",
                //       companyId: "$company",
                //     },
                //     pipeline: [
                //       {
                //         $match: {
                //           $expr: {
                //             $and: [
                //               { $eq: ["$visitorId", "$$visitorId"] },
                //               { $eq: ["$company", "$$companyId"] },
                //             ],
                //           },
                //         },
                //       },
                //       {
                //         $project: {
                //           __v: 0,
                //         },
                //       },
                //       {
                //         $sort: {
                //           checkIn: -1,
                //         },
                //       },
                //     ],
                //     as: "externalVisits",
                //   },
                // },
              ]
            : []),
        ]);

        if (dateFilter?.checkIn) {
          visitors = await attachExternalVisits(visitors, companyId);
        }
    }

    return visitors;
  } catch (error) {
    throw error;
  }
};

const populateVisitorFields = [
  {
    path: "department",
    select: "name",
  },
  {
    path: "toMeet",
    select: "firstName lastName email",
  },
  {
    path: "clientToMeet",
    select: "employeeName email",
  },
  {
    path: "toMeetCompany",
    select: "clientName companyName name",
  },
  {
    path: "checkedInBy",
    select: "firstName lastName",
  },
  {
    path: "checkedOutBy",
    select: "firstName lastName",
  },
  {
    path: "building",
    select: "buildingName",
  },
  {
    path: "unit",
    select: "unitNo unitName",
  },
  {
    path: "meeting",
  },
];

const mapVisitorReportFields = (visitor = {}) => ({
  firstName: visitor.firstName || "-",
  middleName: visitor.middleName || "-",
  lastName: visitor.lastName || "-",
  email: visitor.email || "-",
  gender: visitor.gender || "-",
  phoneNumber: visitor.phoneNumber || "-",
  city: visitor.city || "-",
  state: visitor.state || "-",
  sector: visitor.sector || "-",

  visitorType: visitor.visitorType || "-",
  purposeOfVisit: visitor.purposeOfVisit || "-",
  visitorRoles: visitor.visitorRoles || [],

  department: visitor.department?.name || "-",
  toMeet: visitor.toMeet
    ? `${visitor.toMeet.firstName || ""} ${visitor.toMeet.lastName || ""}`.trim()
    : "-",
  toMeetEmail: visitor.toMeet?.email || "-",

  visitorCompany: visitor.visitorCompany || "-",
  registeredClientCompany: visitor.registeredClientCompany || "-",
  brandName: visitor.brandName || "-",
  toMeetCompany:
    visitor.toMeetCompany?.clientName ||
    visitor.toMeetCompany?.companyName ||
    visitor.toMeetCompany?.name ||
    "-",

  building: visitor.building?.buildingName || "-",
  unit: visitor.unit?.unitName || "-",
  unitNo: visitor.unit?.unitNo || "-",

  scheduledDate: visitor.scheduledDate || null,
  scheduledStartTime: visitor.scheduledStartTime || null,
  scheduledEndTime: visitor.scheduledEndTime || null,
  dateOfVisit: visitor.dateOfVisit || null,
  checkIn: visitor.checkIn || null,
  checkOut: visitor.checkOut || null,

  checkedInBy: visitor.checkedInBy
    ? `${visitor.checkedInBy.firstName || ""} ${
        visitor.checkedInBy.lastName || ""
      }`.trim()
    : "-",
  checkedOutBy: visitor.checkedOutBy
    ? `${visitor.checkedOutBy.firstName || ""} ${
        visitor.checkedOutBy.lastName || ""
      }`.trim()
    : "-",

  amount: visitor.amount ?? 0,
  gstAmount: visitor.gstAmount ?? 0,
  discount: visitor.discount ?? 0,
  totalAmount: visitor.totalAmount ?? 0,
  paymentStatus: visitor.paymentStatus ?? false,
  paymentMode: visitor.paymentMode || "-",

  notes: visitor.notes || "-",
});

const fetchInternalVisitorsReportService = async ({
  company,
  dateFilter,
} = {}) => {
  const filter = {
    company: new mongoose.Types.ObjectId(company),
    visitorType: { $in: ["Walk In", "Scheduled"] },
    ...(dateFilter?.checkIn && { checkIn: dateFilter.checkIn }),
  };

  const visits = await ExternalVisits.find(filter)
    .populate([
      {
        path: "visitorId",
        select: "firstName lastName email gender phoneNumber",
      },
      { path: "toMeet", select: "firstName lastName" },
      { path: "clientToMeet", select: "employeeName" },
      { path: "toMeetCompany", select: "clientName companyName name" },
      { path: "checkedInBy", select: "firstName lastName" },
      { path: "checkedOutBy", select: "firstName lastName" },
      { path: "department", select: "name" },
      {
        path: "unit",
        select: "unitNo unitName",
        populate: { path: "building", select: "buildingName" },
      },
    ])
    .select(
      "-amount -discount -gstAmount -totalAmount -paymentStatus -paymentVerification -paymentMode -paymentProof -notes -legacyVisitorEntryId -visitorRoles -visitorFlag -meeting",
    )
    .lean()
    .exec();

  return visits.map((visit) => {
    const { visitorId, ...visitWithoutVisitorId } = visit;
    const { checkIn, checkOut, ...merged } = {
      ...visitorId,
      ...visitWithoutVisitorId,
    };
    return {
      ...merged,
      checkInDate: checkIn
        ? new Date(checkIn).toLocaleDateString("en-IN")
        : null,
      checkInTime: checkIn
        ? new Date(checkIn).toLocaleTimeString("en-IN")
        : null,
      checkOutDate: checkOut
        ? new Date(checkOut).toLocaleDateString("en-IN")
        : null,
      checkOutTime: checkOut
        ? new Date(checkOut).toLocaleTimeString("en-IN")
        : null,
    };
  });
};

const fetchClientVisitorsReportService = async ({
  company,
  dateFilter,
  type,
} = {}) => {
  const filter = {
    company: new mongoose.Types.ObjectId(company),
    visitorType:
      type === "client"
        ? {
            $in: ["Meeting", "Full-Day Pass", "Half-Day Pass"],
          }
        : type === "meeting"
          ? {
              $in: ["Meeting"],
            }
          : type === "open-desk"
            ? {
                $in: ["Full-Day Pass", "Half-Day Pass"],
              }
            : {},
  };

  if (dateFilter?.checkIn) {
    filter.checkIn = dateFilter.checkIn;
  }

  const visits = await ExternalVisits.find(filter)
    .populate([
      {
        path: "visitorId",
        select:
          "firstName lastName email gender phoneNumber city state sector   brandName registeredClientCompany gstNumber gstFile panNumber panFile idProof otherFile",
      },
      { path: "checkedInBy", select: "firstName lastName" },
      { path: "checkedOutBy", select: "firstName lastName" },
      {
        path: "unit",
        select: "unitNo unitName",
        populate: { path: "building", select: "buildingName" },
      },
    ])
    .select(
      "-notes -legacyVisitorEntryId -toMeet -clientToMeet -toMeetCompany -scheduledDate -scheduledStartTime -scheduledEndTime -visitorRoles -visitorFlag -visitorCompany -department -meeting",
    )
    .lean()
    .exec();

  return visits.map((visit) => {
    const { visitorId, ...visitWithoutVisitorId } = visit;
    const { checkIn, checkOut, ...merged } = {
      ...visitorId,
      ...visitWithoutVisitorId,
    };
    return {
      ...merged,
      checkInDate: checkIn
        ? new Date(checkIn).toLocaleDateString("en-IN")
        : null,
      checkInTime: checkIn
        ? new Date(checkIn).toLocaleTimeString("en-IN")
        : null,
      checkOutDate: checkOut
        ? new Date(checkOut).toLocaleDateString("en-IN")
        : null,
      checkOutTime: checkOut
        ? new Date(checkOut).toLocaleTimeString("en-IN")
        : null,
    };
  });
};

module.exports = {
  fetchVisitorReportService,
  fetchInternalVisitorsReportService,
  fetchClientVisitorsReportService,
};
