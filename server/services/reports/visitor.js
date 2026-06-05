const { default: mongoose } = require("mongoose");
const ExternalVisits = require("../../models/visitor/ExternalVisits");
const Visitor = require("../../models/visitor/Visitor");

const attachExternalVisits = async (visitors) => {
  if (!Array.isArray(visitors) || visitors.length === 0) {
    return visitors;
  }

  const visitorIds = visitors.map((visitor) => visitor._id);
  const visits = await ExternalVisits.find({ visitorId: { $in: visitorIds } })
    .sort({ checkIn: -1 })
    .lean();

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
    ...visitor.toObject(),
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
    let visitors;
    let filter = { company: companyId };

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

    console.log("filter", filter);
    switch (query) {
      case "department":
        visitors = await Visitor.aggregate([
          {
            $match: {
              company: companyId,
              ...(dateFilter?.checkIn && {
                checkIn: dateFilter?.checkIn,
              }),
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
          company: companyId,
          dateOfVisit: { $gte: startOfDay, $lte: endOfDay },
          ...(dateFilter?.checkIn && {
            checkIn: dateFilter?.checkIn,
          }),
        }).populate([
          {
            path: "department",
            select: "name",
          },
          {
            path: "visitorCompany",
            select: "companyName",
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
          // {
          //   path: "clientCompany",
          //   select: "clientName email",
          // },
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
        ]);
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

module.exports = {
  fetchVisitorReportService,
};
