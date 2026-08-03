const CustomError = require("./customErrorlogs");

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 500;

const parsePositiveInteger = (value, fallback) => {
  const parsedValue = Number.parseInt(value, 10);

  return Number.isInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
};

const getPagination = ({ page, limit } = {}) => {
  const shouldPaginate = page !== undefined && limit !== undefined;

  if (!shouldPaginate) {
    return { shouldPaginate: false };
  }

  const parsedPage = parsePositiveInteger(page, DEFAULT_PAGE);
  const parsedLimit = parsePositiveInteger(limit, DEFAULT_LIMIT);

  if (parsedLimit > MAX_LIMIT) {
    throw new CustomError(`Limit cannot exceed ${MAX_LIMIT}`);
  }

  return {
    shouldPaginate: true,
    page: parsedPage,
    limit: parsedLimit,
    skip: (parsedPage - 1) * parsedLimit,
  };
};

module.exports = {
  DEFAULT_LIMIT,
  MAX_LIMIT,
  getPagination,
};
