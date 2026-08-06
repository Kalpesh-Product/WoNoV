const Printout = require("../models/Printout");
const { getPagination } = require("../utils/pagination");
const {
  buildSearchRegex,
  resolveReferenceIds,
} = require("../utils/referenceSearch");

const populatePrintout = [
  { path: "takenBy", select: "firstName lastName" },
  { path: "location", select: "buildingName" },
  { path: "unit", select: "unitName unitNo" },
  { path: "client", select: "clientName companyName name" },
  { path: "requestedBy", select: "employeeName firstName lastName name email" },
  { path: "department", select: "name -_id" },
];

const buildPrintoutSearchConditions = async (search) => {
  const searchRegex = buildSearchRegex(search);

  if (!searchRegex) return [];

  const {
    users,
    locations,
    units,
    coworkingClients,
    companies,
    coworkingMembers,
    departments,
  } = await resolveReferenceIds(searchRegex, [
    {
      key: "users",
      model: Printout.db.model("UserData"),
      fields: ["firstName", "lastName", "email"],
    },
    {
      key: "locations",
      model: Printout.db.model("Building"),
      fields: ["buildingName"],
    },
    {
      key: "units",
      model: Printout.db.model("Unit"),
      fields: ["unitName", "unitNo"],
    },
    {
      key: "coworkingClients",
      model: Printout.db.model("CoworkingClient"),
      fields: ["clientName", "companyName", "name"],
    },
    {
      key: "companies",
      model: Printout.db.model("Company"),
      fields: ["clientName", "companyName", "name"],
    },
    {
      key: "coworkingMembers",
      model: Printout.db.model("CoworkingMember"),
      fields: ["employeeName", "firstName", "lastName", "email"],
    },
    {
      key: "departments",
      model: Printout.db.model("Department"),
      fields: ["name"],
    },
  ]);

  const clientIds = [...coworkingClients, ...companies];
  const requestedByIds = [...users, ...coworkingMembers];

  /*
   * Regex cannot directly search Number, Date, or ObjectId fields.
   * Convert them safely to strings inside MongoDB.
   */
  const stringifiedFieldCondition = (field) => ({
    $expr: {
      $regexMatch: {
        input: {
          $convert: {
            input: `$${field}`,
            to: "string",
            onError: "",
            onNull: "",
          },
        },
        regex: searchRegex.source,
        options: "i",
      },
    },
  });

  return [
    // Direct string field
    { remark: searchRegex },

    // Date, number, ObjectId and automatic document ID fields
    stringifiedFieldCondition("_id"),
    stringifiedFieldCondition("takenAt"),
    stringifiedFieldCondition("printoutCount"),
    stringifiedFieldCondition("takenBy"),
    stringifiedFieldCondition("location"),
    stringifiedFieldCondition("unit"),
    stringifiedFieldCondition("client"),
    stringifiedFieldCondition("requestedBy"),
    stringifiedFieldCondition("department"),

    // Populated reference fields
    ...(users.length ? [{ takenBy: { $in: users } }] : []),

    ...(locations.length ? [{ location: { $in: locations } }] : []),

    ...(units.length ? [{ unit: { $in: units } }] : []),

    ...(clientIds.length ? [{ client: { $in: clientIds } }] : []),

    ...(requestedByIds.length
      ? [{ requestedBy: { $in: requestedByIds } }]
      : []),

    ...(departments.length ? [{ department: { $in: departments } }] : []),
  ];
};

const sanitizePrintout = (printout) => {
  if (!printout) return printout;

  const sanitizedPrintout = { ...printout };

  if (
    sanitizedPrintout.clientModel === "CoworkingClient" &&
    sanitizedPrintout.client &&
    typeof sanitizedPrintout.client === "object"
  ) {
    const client = { ...sanitizedPrintout.client };
    client.companyName = client.clientName;
    delete client.clientName;
    sanitizedPrintout.client = client;
  }

  delete sanitizedPrintout.clientModel;
  delete sanitizedPrintout.requestedByModel;

  if (
    sanitizedPrintout.department &&
    typeof sanitizedPrintout.department === "object"
  ) {
    const department = { ...sanitizedPrintout.department };
    delete department._id;
    delete department.departmentId;
    sanitizedPrintout.department = department;
  } else if (sanitizedPrintout.department) {
    delete sanitizedPrintout.department;
  }

  return sanitizedPrintout;
};

const fetchPrintoutReportService = async ({
  filters = {},
  dateFilter,
  page,
  limit,
  search,
  isReport = false,
}) => {
  const {
    shouldPaginate,
    page: parsedPage,
    limit: parsedLimit,
    skip,
  } = getPagination({ page, limit });

  let printoutFilters = {
    ...filters,
    ...(dateFilter || {}),
  };

  const searchConditions = await buildPrintoutSearchConditions(search);

  if (searchConditions.length) {
    printoutFilters.$or = searchConditions;
  }

  let printoutsQuery = Printout.find(printoutFilters)
    .populate(populatePrintout)
    .sort({ takenAt: -1 });

  if (shouldPaginate) {
    printoutsQuery = printoutsQuery.skip(skip).limit(parsedLimit);
  }

  const [foundPrintouts, total] = await Promise.all([
    printoutsQuery.lean().exec(),
    shouldPaginate
      ? Printout.countDocuments(printoutFilters).exec()
      : Promise.resolve(null),
  ]);
  const printouts = foundPrintouts.map(sanitizePrintout);

  const result = {
    printouts,
    ...(shouldPaginate && {
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        totalPages: Math.ceil(total / parsedLimit),
      },
    }),
  };

  return isReport ? result.printouts : result;
};

module.exports = {
  fetchPrintoutReportService,
  populatePrintout,
  sanitizePrintout,
};
