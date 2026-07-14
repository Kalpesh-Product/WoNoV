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

const attachExternalVisits = async (visitors) => {
  if (!Array.isArray(visitors) || visitors.length === 0) {
    return visitors;
  }

  const visitorIds = visitors.map((visitor) => visitor._id);
  const visits = await ExternalVisits.find({ visitorId: { $in: visitorIds } })
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
  isMeeting = false,
  isOpendDesk = false,
}) => {
  try {
    const companyId = new mongoose.Types.ObjectId(company);
    const queryKey = normalizeVisitorQuery(query);
    let visitors;
    const filter = { company: companyId };

    if (dateFilter) {
      filter.checkIn = dateFilter.checkIn;
    }

    if (isMeeting) {
      filter.visitorType = "Meeting";
    }

    if (isOpendDesk) {
      filter.visitorType = {
        $in: ["Full-Day Pass", "Half-Day Pass"],
      };
    }

    // {
    //       company: companyId,
    //       ...(dateFilter?.checkIn && {
    //         checkIn: dateFilter?.checkIn,
    //       }),
    //     }

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
        visitors = await attachExternalVisits(visitors);
        break;

      default:
        visitors = await Visitor.find(filter).populate([
          {
            path: "department",
            select: "name",
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
            path: "visitorCompany",
            select: "companyName pocName",
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
          },
          {
            path: "building",
            select: "buildingName",
          },
          {
            path: "unit",
            select: "unitNo unitName",
          },
        ]);
        visitors = await attachExternalVisits(visitors);
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
