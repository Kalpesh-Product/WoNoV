const Company = require("../../models/hr/Company");
const Unit = require("../../models/locations/Unit");
const CoworkingClient = require("../../models/sales/CoworkingClient");
const CoworkingMembers = require("../../models/sales/CoworkingMembers");
const mongoose = require("mongoose");
const VirtualOfficeClient = require("../../models/sales/VirtualOfficeClient");
const WorkationClient = require("../../models/sales/WorkationClients");
const { formatDate } = require("../../utils/formatDateTime");
const { getPagination } = require("../../utils/pagination");

const DELETED_MEMBER_VIEW_ROLES = new Set(["master admin", "super admin"]);

const normalizeRoleValue = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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
  page,
  limit,
}) => {
  const { coworkingclientid, unitId, active, search } = query;
  const {
    shouldPaginate,
    page: parsedPage,
    limit: parsedLimit,
    skip,
  } = getPagination({ page, limit });
  const buildResponse = (data, total = 0) =>
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
      : data;

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
    return buildResponse([]);
  }

  const normalizedSearch = String(search || "").trim().slice(0, 100);
  const escapedSearch = escapeRegex(normalizedSearch);
  const searchRegex = escapedSearch ? new RegExp(escapedSearch, "i") : null;
  const numericSearch = Number(normalizedSearch.replace(/,/g, ""));
  let clientQuery = { company };

  if (coworkingclientid) {
    clientQuery = { _id: coworkingclientid };
  } else if (unitId) {
    clientQuery.unit = unitId;
  } else if (active) {
    clientQuery.isActive = active === "true";
  }

  if (dateFilter?.startDate) {
    clientQuery.startDate = dateFilter.startDate;
  }

  if (searchRegex && !coworkingclientid) {
    clientQuery.$or = [
      { clientName: searchRegex },
      ...(!Number.isNaN(numericSearch)
        ? [
            { totalMeetingCredits: numericSearch },
            { "meetingCreditBalanceHistory.consumedCredit": numericSearch },
            { "meetingCreditBalanceHistory.remainingCredit": numericSearch },
          ]
        : []),
      {
        $expr: {
          $regexMatch: {
            input: { $toString: { $ifNull: ["$totalMeetingCredits", ""] } },
            regex: escapedSearch,
            options: "i",
          },
        },
      },
      {
        $expr: {
          $anyElementTrue: {
            $map: {
              input: { $ifNull: ["$meetingCreditBalanceHistory", []] },
              as: "history",
              in: {
                $or: [
                  {
                    $regexMatch: {
                      input: {
                        $toString: {
                          $ifNull: ["$$history.consumedCredit", ""],
                        },
                      },
                      regex: escapedSearch,
                      options: "i",
                    },
                  },
                  {
                    $regexMatch: {
                      input: {
                        $toString: {
                          $ifNull: ["$$history.remainingCredit", ""],
                        },
                      },
                      regex: escapedSearch,
                      options: "i",
                    },
                  },
                ],
              },
            },
          },
        },
      },
    ];
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

  let hostCompanyData = [];

  const shouldIncludeHost =
    !isReport &&
    (!coworkingclientid ||
      coworkingclientid.toString() === company.toString());

  if (shouldIncludeHost) {
    const hostCompany = await Company.findById(company)
      .select(
        "companyName totalMeetingCredits meetingCreditBalance meetingCreditBalanceHistory",
      )
      .lean()
      .exec();

    if (hostCompany) {
      const hostEntity = {
        _id: hostCompany._id,
        clientName: "BIZNest",
        totalMeetingCredits: hostCompany.totalMeetingCredits,
        meetingCreditBalance: hostCompany.meetingCreditBalance,
        meetingCreditBalanceHistory:
          hostCompany.meetingCreditBalanceHistory || [],
        isActive: true,
        isHost: true,
      };
      const hostSearchValues = [
        hostEntity.clientName,
        hostEntity.totalMeetingCredits,
        ...hostEntity.meetingCreditBalanceHistory.flatMap((history) => [
          history?.consumedCredit,
          history?.remainingCredit,
        ]),
      ];
      const hostMatchesSearch =
        !searchRegex ||
        hostSearchValues.some(
          (value) =>
            searchRegex.test(String(value ?? "")) ||
            (!Number.isNaN(numericSearch) && Number(value) === numericSearch),
        );

      if (hostMatchesSearch) hostCompanyData = [hostEntity];
    }
  }

  const hostCount = hostCompanyData.length;
  let clientsQuery = CoworkingClient.find(clientQuery).populate(populateOptions);
  let total = 0;

  if (shouldPaginate) {
    const clientSkip = Math.max(skip - hostCount, 0);
    const includedHostCount = skip < hostCount ? hostCount - skip : 0;
    const clientLimit = Math.max(parsedLimit - includedHostCount, 0);

    clientsQuery = clientsQuery
      .sort({ _id: 1 })
      .skip(clientSkip)
      .limit(clientLimit);

    total = hostCount + (await CoworkingClient.countDocuments(clientQuery));
  }

  const clients = await clientsQuery.lean().exec();
  const paginatedHostData =
    !shouldPaginate || skip < hostCount ? hostCompanyData : [];
  const allEntities = [...paginatedHostData, ...clients];

  if (!allEntities.length) {
    return buildResponse([], total);
  }

  const clientObjectIds = allEntities
    .map((entity) => entity?._id)
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  const members = await CoworkingMembers.find({
    company,
    client: { $in: clientObjectIds },
  })
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

  const result = allEntities.map((entity) => {
    const entityId = entity?._id?.toString();
    const isHostCompany = entityId === company?.toString();

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
      clientName: isHostCompany ? "BIZNest" : restEntity.clientName,
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
        isHost: isHost || isHostCompany,
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

  return buildResponse(result, total);
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
