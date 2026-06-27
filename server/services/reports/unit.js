const mongoose = require("mongoose");
const Company = require("../../models/hr/Company");
const Unit = require("../../models/locations/Unit");
const CoworkingClient = require("../../models/sales/CoworkingClient");

const sanitizeUnitForReport = (unit) => {
  if (!unit) return unit;

  const {
    clearImage,
    occupiedImage,
    adminLead,
    maintenanceLead,
    itLead,
    isOnlyBudget,
    includesBudget,
    building,
    ...rest
  } = unit;

  return {
    ...rest,
    building: building
      ? {
          buildingName: building.buildingName,
        }
      : null,
  };
};

const sanitizeUnitsForReport = (payload) => {
  if (Array.isArray(payload)) {
    return payload.map(sanitizeUnitForReport);
  }

  return sanitizeUnitForReport(payload);
};

const isDeskCalculationRequested = (deskCalculated) =>
  deskCalculated === "true";

const calculateRemainingDesks = (
  unit,
  occupiedCabinDesks = 0,
  occupiedOpenDesks = 0,
) => ({
  ...unit,
  remainingCabinDesks: Math.max(0, (unit.cabinDesks || 0) - occupiedCabinDesks),
  remainingOpenDesks: Math.max(0, (unit.openDesks || 0) - occupiedOpenDesks),
});

const fetchUnitById = async ({ company, unitId, includeDeskCalculation }) => {
  const unit = await Unit.findOne({ _id: unitId, company })
    .populate("building", "_id buildingName fullAddress")
    .lean()
    .exec();

  if (!unit) {
    return { statusCode: 400, payload: [] };
  }

  if (!includeDeskCalculation) {
    return { payload: unit };
  }

  const coworkingClients = await CoworkingClient.find({
    company,
    unit: unitId,
  })
    .select("cabinDesks openDesks")
    .lean()
    .exec();

  const occupiedDeskTotals = coworkingClients.reduce(
    (totals, client) => ({
      cabinDesks: totals.cabinDesks + (client.cabinDesks || 0),
      openDesks: totals.openDesks + (client.openDesks || 0),
    }),
    { cabinDesks: 0, openDesks: 0 },
  );

  return {
    statusCode: 200,
    payload: calculateRemainingDesks(
      unit,
      occupiedDeskTotals.cabinDesks,
      occupiedDeskTotals.openDesks,
    ),
  };
};

const fetchCompanyUnits = async ({ company, includeDeskCalculation }) => {
  let units = await Unit.find({
    company,
    isActive: true,
    isOnlyBudget: false,
  })
    .populate([
      {
        path: "building",
        select: "_id buildingName fullAddress",
      },
      {
        path: "adminLead",
        select: "firstName middleName lastName departments",
        populate: { path: "departments", select: "name" },
      },
      {
        path: "maintenanceLead",
        select: "firstName middleName lastName departments",
        populate: { path: "departments", select: "name" },
      },
      {
        path: "itLead",
        select: "firstName middleName lastName departments",
        populate: { path: "departments", select: "name" },
      },
    ])
    .lean()
    .exec();

  if (!units.length || !includeDeskCalculation) {
    return { payload: units };
  }

  const clientData = await CoworkingClient.aggregate([
    { $match: { company: new mongoose.Types.ObjectId(company) } },
    {
      $group: {
        _id: "$unit",
        totalCabinDesks: { $sum: "$cabinDesks" },
        totalOpenDesks: { $sum: "$openDesks" },
      },
    },
  ]);

  const clientMap = clientData.reduce((map, data) => {
    if (data?._id) {
      map[data._id.toString()] = {
        totalCabinDesks: data.totalCabinDesks || 0,
        totalOpenDesks: data.totalOpenDesks || 0,
      };
    }
    return map;
  }, {});

  units = units.map((unit) => {
    const occupiedDesks = clientMap[unit._id?.toString?.()] || {};

    return calculateRemainingDesks(
      unit,
      occupiedDesks.totalCabinDesks || 0,
      occupiedDesks.totalOpenDesks || 0,
    );
  });

  return { payload: units };
};

// const fetchUnitReportService = async ({
//   company,
//   unitId,
//   deskCalculated,
//   isReport,
// }) => {
//   const companyExists = await Company.findById(company).lean().exec();
//   if (!companyExists) {
//     return { statusCode: 400, payload: { message: "Company not found" } };
//   }

//   const includeDeskCalculation = isDeskCalculationRequested(deskCalculated);

//   if (unitId) {
//     return fetchUnitById({ company, unitId, includeDeskCalculation });
//   }

//   return fetchCompanyUnits({ company, includeDeskCalculation });
// };

const fetchUnitReportService = async ({
  company,
  unitId,
  deskCalculated,
  isReport,
}) => {
  const companyExists = await Company.findById(company).lean().exec();

  if (!companyExists) {
    return { payload: { message: "Company not found" } };
  }

  const includeDeskCalculation = isDeskCalculationRequested(deskCalculated);

  const response = unitId
    ? await fetchUnitById({ company, unitId, includeDeskCalculation })
    : await fetchCompanyUnits({ company, includeDeskCalculation });

  if (isReport) {
    return {
      ...response,
      payload: sanitizeUnitsForReport(response.payload),
    };
  }

  return response;
};

module.exports = {
  fetchUnitReportService,
};
