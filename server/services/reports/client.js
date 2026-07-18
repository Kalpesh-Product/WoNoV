const Company = require("../../models/hr/Company");
const Unit = require("../../models/locations/Unit");
const CoworkingClient = require("../../models/sales/CoworkingClient");
const CoworkingMembers = require("../../models/sales/CoworkingMembers");
const mongoose = require("mongoose");
const VirtualOfficeClient = require("../../models/sales/VirtualOfficeClient");
const WorkationClient = require("../../models/sales/WorkationClients");
const { formatDate } = require("../../utils/formatDateTime");

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

const DEFAULT_BUILDING_NAME = "Sunteck Kanaka";

const toObjectId = (value) => new mongoose.Types.ObjectId(value);

const fetchInventoryBuildingUnitsReportService = async ({
  company,
  buildingName = DEFAULT_BUILDING_NAME,
  type = "",
}) => {
  const companyExists = await Company.findById(company).lean().exec();

  if (!companyExists) {
    return { payload: { message: "Company not found" } };
  }

  const units = await Unit.find({
    company,
    isActive: true,
    isOnlyBudget: false,
  })
    .populate({ path: "building", select: "_id buildingName fullAddress" })
    .lean()
    .exec();

  const filteredUnits = units;

  if (!filteredUnits.length) {
    return { payload: [] };
  }

  const unitIds = filteredUnits.map((unit) => toObjectId(unit._id));

  const occupancyData = await CoworkingClient.aggregate([
    {
      $match: {
        company: toObjectId(company),
        unit: { $in: unitIds },
        isActive: true,
      },
    },
    {
      $group: {
        _id: "$unit",
        totalOccupiedDesks: {
          $sum: { $add: ["$openDesks", "$cabinDesks"] },
        },
      },
    },
  ]);

  const occupiedByUnit = occupancyData.reduce((acc, item) => {
    if (item?._id) {
      acc[item._id.toString()] = Number(item.totalOccupiedDesks) || 0;
    }
    return acc;
  }, {});

  const payload = filteredUnits.map((unit, index) => {
    const unitId = unit._id?.toString?.() || String(unit._id);
    const totalDesks =
      (Number(unit.openDesks) || 0) + (Number(unit.cabinDesks) || 0);
    const occupiedDesks = occupiedByUnit[unitId] || 0;

    return {
      unitNo: unit.unitNo,
      unitName: unit.unitName,
      buildingName: unit.building.buildingName,
      sqft: unit.sqft || 0,
      occupiedDesks,
      ...(type !== "offices" && {
        totalDesks,
        openDesks: unit.openDesks || 0,
        cabinDesks: unit.cabinDesks || 0,
        freeDesks: Math.max(totalDesks - occupiedDesks, 0),
      }),
    };
  });

  return { payload };
};

const getReferenceId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value._id) return value._id.toString();
  if (typeof value?.toString === "function") return value.toString();
  return "";
};

const isSameReference = (left, right) =>
  getReferenceId(left) === getReferenceId(right);

const buildUnitAvailabilityPayload = ({ unit, clients, visibleMembers }) => {
  const totalOccupiedDesks = clients.reduce(
    (acc, client) => acc + ((client.openDesks || 0) + (client.cabinDesks || 0)),
    0,
  );

  const totalDesks = (unit?.openDesks || 0) + (unit?.cabinDesks || 0);

  return {
    unitId: unit?._id,
    unitNo: unit?.unitNo,
    unitName: unit?.unitName,
    buildingName: unit?.building?.buildingName,
    clearImage: unit?.clearImage || null,
    occupiedImage: unit?.occupiedImage || null,
    totalDesks,
    totalOccupiedDesks,
    clientDetails: clients.map((client) => {
      let transformedMembers = [];
      const memberDetails = visibleMembers.find((member) =>
        isSameReference(member?.client, client?._id),
      );

      if (memberDetails) {
        transformedMembers = {
          member: memberDetails.employeeName || "Unknown",
          date: formatDate(memberDetails.dob),
          email: memberDetails.email,
          mobileNo: memberDetails.mobileNo,
        };
      }

      return {
        client: client.clientName,
        occupiedDesks: (client.openDesks || 0) + (client.cabinDesks || 0),
        memberDetails: transformedMembers,
      };
    }),
  };
};

const fetchClientsOccupancyReportService = async ({
  company,
  dateFilter,
} = {}) => {
  const filter = {};

  if (company) {
    filter.company = toObjectId(company);
  }

  filter.isActive = true;

  if (dateFilter?.startDate) {
    filter.startDate = dateFilter.startDate;
  }

  const clients = await CoworkingClient.find(filter)
    .select("clientName openDesks cabinDesks unit")
    .populate({
      path: "unit",
      select: "unitName unitNo openDesks cabinDesks building",
      populate: {
        path: "building",
        select: "buildingName",
      },
    })
    .lean()
    .exec();

  const clientsWithOccupiedDesks = (clients || [])
    .map((client) => {
      const occupiedDesks =
        (Number(client.openDesks) || 0) + (Number(client.cabinDesks) || 0);
      const totalUnitDesks =
        (Number(client.unit?.openDesks) || 0) +
        (Number(client.unit?.cabinDesks) || 0);

      return {
        clientName: client.clientName || "-",
        occupiedDesks,
        occupiedPercent: totalUnitDesks
          ? ((occupiedDesks / totalUnitDesks) * 100).toFixed(2)
          : 0,
        unitNo: client.unit?.unitNo || "-",
        unitName: client.unit?.unitName || "-",
        buildingName: client.unit?.building?.buildingName || "-",
      };
    })
    .sort((a, b) => {
      if (a.unitNo !== b.unitNo) {
        return a.unitNo.localeCompare(b.unitNo, undefined, { numeric: true });
      }

      return b.occupiedDesks - a.occupiedDesks;
    });

  return clientsWithOccupiedDesks.map((client) => ({
    unitNo: client.unitNo,
    unitName: client.unitName,
    buildingName: client.buildingName,
    "Client Name": client.clientName,
    "Occupied Desks": client.occupiedDesks,
    "Occupied %": client.occupiedPercent,
    // "Occupied %": totalOccupiedDesks
    //   ? `${Math.round((client.occupiedDesks / totalOccupiedDesks) * 100)} %`
    //   : "0 %",
  }));
};

module.exports = {
  fetchCoworkingClientReportService,
  fetchVirtualOfficeClientsReportService,
  fetchCoworkingMembersReportService,
  fetchWorkationClientsReportService,
  fetchInventoryBuildingUnitsReportService,
  fetchClientsOccupancyReportService,
};
