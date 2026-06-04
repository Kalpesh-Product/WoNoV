const Company = require("../../models/hr/Company");
const Unit = require("../../models/locations/Unit");
const CoworkingClient = require("../../models/sales/CoworkingClient");
const CoworkingMembers = require("../../models/sales/CoworkingMembers");
const mongoose = require("mongoose");

const DELETED_MEMBER_VIEW_ROLES = new Set(["master admin", "super admin"]);

const normalizeRoleValue = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const getUserRoleTitles = (context) =>
  (Array.isArray(context?.roles) ? context.roles : [])
    .map((role) => normalizeRoleValue(role?.roleTitle || role))
    .filter(Boolean);

const getUserDepartmentNames = (context) =>
  (Array.isArray(context?.departments) ? context.departments : [])
    .map((department) =>
      normalizeRoleValue(
        department?.name || department?.departmentName || department,
      ),
    )
    .filter(Boolean);

const canViewDeletedMembers = (context) => {
  const roleTitles = getUserRoleTitles(context);
  const departmentNames = getUserDepartmentNames(context);

  if (
    roleTitles.some((roleTitle) => DELETED_MEMBER_VIEW_ROLES.has(roleTitle))
  ) {
    return true;
  }

  return (
    roleTitles.some(
      (roleTitle) =>
        roleTitle.includes("air tech department") ||
        roleTitle.includes("air tech"),
    ) ||
    departmentNames.some(
      (departmentName) =>
        departmentName.includes("air tech department") ||
        departmentName.includes("air tech"),
    )
  );
};

const filterVisibleMembers = (members = [], context) => {
  if (canViewDeletedMembers(context)) {
    return members;
  }

  return members.filter((member) => !member?.isDeleted);
};

const fetchCoworkingClientReportService = async ({
  company,
  query = {},
  dateFilter,
  user,
}) => {
  const { coworkingclientid, unitId, active } = query;

  if (
    coworkingclientid &&
    !mongoose.Types.ObjectId.isValid(coworkingclientid)
  ) {
    throw new Error("Invalid client ID format");
  }

  if (unitId && !mongoose.Types.ObjectId.isValid(unitId)) {
    throw new Error("Invalid unit ID format");
  }

  const units = await Unit.find({ company }).populate({
    path: "building",
    select: "buildingName",
  });

  if (!units?.length) {
    return [];
  }

  let clientQuery = { company };

  if (coworkingclientid) {
    clientQuery = { _id: coworkingclientid };
  } else if (unitId) {
    clientQuery.unit = unitId;
  } else if (active) {
    clientQuery.isActive = active === "true";
  }

  // Add date filtering if applicable
  if (dateFilter) {
    clientQuery.startDate = dateFilter.startDate;
  }

  const populateOptions = [
    {
      path: "unit",
      select: "_id unitName unitNo cabinDesks openDesks",
      populate: {
        path: "building",
        select: "_id buildingName fullAddress",
      },
    },
    {
      path: "service",
      select: "_id serviceName description",
    },
  ];

  const clients = await CoworkingClient.find(clientQuery)
    .populate(populateOptions)
    .lean()
    .exec();

  let hostCompanyData = [];

  if (
    !coworkingclientid ||
    coworkingclientid.toString() === company.toString()
  ) {
    const hostCompany = await Company.findById(company)
      .select(
        "companyName totalMeetingCredits meetingCreditBalance meetingCreditBalanceHistory",
      )
      .lean()
      .exec();

    if (hostCompany) {
      hostCompanyData = [
        {
          _id: hostCompany._id,
          clientName: "BIZNest",
          totalMeetingCredits: hostCompany.totalMeetingCredits,
          meetingCreditBalance: hostCompany.meetingCreditBalance,
          meetingCreditBalanceHistory:
            hostCompany.meetingCreditBalanceHistory || [],
          isActive: true,
          isHost: true,
        },
      ];
    }
  }

  const allEntities = [...hostCompanyData, ...clients];

  if (!allEntities.length) {
    return [];
  }

  const members = await CoworkingMembers.find({ company })
    .populate([
      {
        path: "client",
        select: "clientName email",
      },
      {
        path: "unit",
        select: "unitName unitNo",
      },
    ])
    .lean()
    .exec();

  const visibleMembers = filterVisibleMembers(members, { user });

  const clientObjectIds = allEntities
    .map((entity) => entity?._id)
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  const shouldIncludeDeletedMembers = canViewDeletedMembers({ user });

  const memberMatchStage = {
    client: { $in: clientObjectIds },
  };

  if (!shouldIncludeDeletedMembers) {
    memberMatchStage.isDeleted = { $ne: true };
  }

  const memberCounts = await CoworkingMembers.aggregate([
    {
      $match: memberMatchStage,
    },
    {
      $group: {
        _id: "$client",
        count: { $sum: 1 },
      },
    },
  ]);

  const memberCountByClientId = memberCounts.reduce((acc, item) => {
    const clientId = item?._id ? String(item._id) : "";

    if (clientId) {
      acc[clientId] = item.count || 0;
    }

    return acc;
  }, {});

  return allEntities.map((entity) => {
    const entityId = entity?._id?.toString();

    return {
      ...entity,
      memberCount: entityId ? memberCountByClientId[entityId] || 0 : 0,
      members: visibleMembers.filter(
        (member) =>
          member.client &&
          member.client._id.toString() === entity._id.toString(),
      ),
    };
  });
};

module.exports = {
  fetchCoworkingClientReportService,
};
