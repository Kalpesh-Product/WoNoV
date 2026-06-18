const Company = require("../../models/hr/Company");
const Unit = require("../../models/locations/Unit");
const CoworkingClient = require("../../models/sales/CoworkingClient");
const CoworkingMembers = require("../../models/sales/CoworkingMembers");
const mongoose = require("mongoose");
const VirtualOfficeClient = require("../../models/sales/VirtualOfficeClient");
const WorkationClient = require("../../models/sales/WorkationClients");

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
  isReport = false,
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

  const allEntities = [...(isReport ? [] : hostCompanyData), ...clients];

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

    const {
      meetingCreditBalanceHistory,
      service,
      documents,
      lastManualCreditResetAt,
      isHost,
      unit,
      building,
      ...restEntity
    } = entity;

    const { fullAddress, ...buildingRest } = unit?.building || {};

    return {
      ...restEntity,
      memberCount: entityId ? memberCountByClientId[entityId] || 0 : 0,
      ...(!isReport && {
        members: visibleMembers.filter(
          (member) =>
            member.client &&
            member.client._id.toString() === entity._id.toString(),
        ),
        meetingCreditBalanceHistory,
        service,
        lastManualCreditResetAt,
        documents,
        isHost,
        building,
      }),
      unit: {
        building: {
          ...buildingRest,
          ...(!isReport && { fullAddress }),
        },
        unitNo: unit?.unitNo,
        unitName: unit?.unitName,
      },
    };
  });
};

const fetchVirtualOfficeClientsReportService = async ({
  dateFilter,
  query = {},
  isReport = false,
} = {}) => {
  const filter = { ...query };

  if (dateFilter?.termStartDate) {
    filter.termStartDate = dateFilter.termStartDate;
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
  ];

  const clients = await VirtualOfficeClient.find(filter)
    .populate(populateOptions)
    .lean()
    .exec();

  if (isReport) {
    return (clients || []).map((client) => {
      const {
        service,
        cabinTotal,
        openTotal,
        rentStatus,
        perDeskMeetingCredits,
        totalMeetingCredits,
        ...restClient
      } = client;

      return {
        ...restClient,
        unit: restClient.unit
          ? {
              ...restClient.unit,
              building: restClient.unit.building
                ? {
                    _id: restClient.unit.building._id,
                    buildingName: restClient.unit.building.buildingName,
                  }
                : restClient.unit.building,
            }
          : restClient.unit,
      };
    });
  }

  return clients || [];
};

const fetchWorkationClientsReportService = async ({
  dateFilter,
  query = {},
  isReport = false,
} = {}) => {
  let filter = {};
  if (dateFilter?.startDate) {
    filter.startDate = dateFilter.startDate;
  }

  const clients = await WorkationClient.find(filter).lean().exec();

  return clients || [];
};

const fetchCoworkingMembersReportService = async ({
  company,
  dateFilter,
  user,
} = {}) => {
  const filter = {};

  if (company) {
    filter.company = company;
  }

  // Adjust the field according to your schema
  if (dateFilter?.dateOfJoining) {
    filter.dateOfJoining = dateFilter.dateOfJoining;
  }

  const members = await CoworkingMembers.find(filter)
    .populate([
      {
        path: "client",
        select: "clientName unit",
        populate: {
          path: "unit",
          select: "unitNo",
        },
      },
    ])
    .select(
      "employeeName email gender mobileNo phone dob dateOfJoining biometricStatus isActive isDeleted client unit",
    )
    .lean()
    .exec();

  const visibleMembers = filterVisibleMembers(members, {
    user,
  });

  return visibleMembers || [];
};

module.exports = {
  fetchCoworkingClientReportService,
  fetchVirtualOfficeClientsReportService,
  fetchCoworkingMembersReportService,
  fetchWorkationClientsReportService,
};
