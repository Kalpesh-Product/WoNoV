const buildDateFilter = require("../../utils/dateFilter");
const { fetchBudgetService } = require("./finance");
const { fetchTicketReportService } = require("./ticket");

/**
 * Stable keys should come from Report.reportKey in DB where possible.
 * Keeping reportName aliases for backward compatibility.
 */
const reportServiceRegistry = {
  budget: async ({ filters, departmentId }) =>
    fetchBudgetService({
      departmentId,
      dateFilter: {
        ...buildDateFilter({
          startDate: filters?.startDate,
          endDate: filters?.endDate,
          field: "dueDate",
        }),
      },
    }),

  "expense-and-budget": async ({ filters, departmentId }) =>
    fetchBudgetService({
      departmentId,
      dateFilter: {
        ...buildDateFilter({
          startDate: filters?.startDate,
          endDate: filters?.endDate,
          field: "dueDate",
        }),
      },
    }),

  ticket: async ({ filters, departmentId }) =>
    fetchTicketReportService({
      departmentId,
      dateFilter: {
        ...buildDateFilter({
          startDate: filters?.startDate,
          endDate: filters?.endDate,
          field: "createdAt",
        }),
      },
    }),
};

const resolveReportService = (reportMeta = {}) => {
  console.log("Resolving report service for reportMeta:", reportMeta);
  const key = (reportMeta.reportKey || "").trim().toLowerCase();
  const name = (reportMeta.reportName || "").trim().toLowerCase();

  console.log(
    `Looking for report service with key: "${key}" or name: "${name}"`,
  );
  if (key && reportServiceRegistry[key]) {
    return reportServiceRegistry[key];
  }

  if (name && reportServiceRegistry[name]) {
    return reportServiceRegistry[name];
  }

  return null;
};

module.exports = {
  reportServiceRegistry,
  resolveReportService,
};
