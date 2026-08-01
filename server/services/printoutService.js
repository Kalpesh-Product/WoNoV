const Printout = require("../models/Printout");
const { getPagination } = require("../utils/pagination");

const populatePrintout = [
  { path: "takenBy", select: "firstName lastName" },
  { path: "location", select: "buildingName" },
  { path: "unit", select: "unitName unitNo" },
  { path: "client", select: "clientName companyName name" },
  { path: "requestedBy", select: "employeeName firstName lastName name email" },
  { path: "department", select: "name -_id" },
];

const sanitizePrintout = (printout) => {
  if (!printout) return printout;

  const sanitizedPrintout = { ...printout };
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
  isReport = false,
}) => {
  const {
    shouldPaginate,
    page: parsedPage,
    limit: parsedLimit,
    skip,
  } = getPagination({ page, limit });
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
