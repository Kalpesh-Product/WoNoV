const Printout = require("../models/Printout");

const populatePrintout = [
  { path: "takenBy", select: "firstName lastName" },
  { path: "location", select: "buildingName" },
  { path: "unit", select: "unitName unitNo" },
  { path: "client", select: "clientName companyName name" },
  { path: "requestedBy", select: "employeeName firstName lastName name email" },
  { path: "department", select: "departmentId name" },
];

const fetchPrintoutsService = async ({
  filters = {},
  dateFilter,
  page,
  limit,
}) => {
  const shouldPaginate = page !== undefined && limit !== undefined;
  const parsedPage = Math.max(Number.parseInt(page, 10) || 1, 1);
  const parsedLimit = Math.max(Number.parseInt(limit, 10) || 10, 1);
  const skip = (parsedPage - 1) * parsedLimit;
  const printoutFilters = {
    ...filters,
    ...(dateFilter || {}),
  };

  let printoutsQuery = Printout.find(printoutFilters)
    .populate(populatePrintout)
    .sort({ takenAt: -1 });

  if (shouldPaginate) {
    printoutsQuery = printoutsQuery.skip(skip).limit(parsedLimit);
  }

  const [printouts, total] = await Promise.all([
    printoutsQuery.lean().exec(),
    shouldPaginate
      ? Printout.countDocuments(printoutFilters).exec()
      : Promise.resolve(null),
  ]);

  return {
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
};

module.exports = {
  fetchPrintoutsService,
  populatePrintout,
};
