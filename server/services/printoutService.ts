import type { PopulateOptions, FilterQuery } from "mongoose";
import Printout, { type IPrintout } from "../models/Printout";

export const populatePrintout: PopulateOptions[] = [
  { path: "takenBy", select: "firstName lastName" },
  { path: "location", select: "buildingName" },
  { path: "unit", select: "unitName unitNo" },
  { path: "client", select: "clientName companyName name" },
  { path: "requestedBy", select: "employeeName firstName lastName name email" },
  { path: "department", select: "departmentId name" },
];

interface FetchPrintoutsOptions {
  filters?: FilterQuery<IPrintout>;
  dateFilter?: FilterQuery<IPrintout>;
  page?: string;
  limit?: string;
}

export const fetchPrintoutsService = async ({
  filters = {},
  dateFilter,
  page,
  limit,
}: FetchPrintoutsOptions) => {
  const shouldPaginate = page !== undefined && limit !== undefined;
  const parsedPage = Math.max(Number.parseInt(page || "", 10) || 1, 1);
  const parsedLimit = Math.max(Number.parseInt(limit || "", 10) || 10, 1);
  const skip = (parsedPage - 1) * parsedLimit;
  const printoutFilters: FilterQuery<IPrintout> = {
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
        total: total as number,
        totalPages: Math.ceil((total as number) / parsedLimit),
      },
    }),
  };
};
