const buildDateFilter = require("../../utils/dateFilter");
const { fetchBudgetService } = require("./finance");
const { fetchTicketReportService } = require("./ticket");
const { fetchPerformanceReportService } = require("./performance");
const {
  fetchDeptTaskReportService,
  fetchMyTasksReportService,
} = require("./task");
const { fetchAssetReportService } = require("./asset");
const { fetchMeetingReportService } = require("./meeting");
const { fetchVisitorReportService } = require("./visitor");

const normalizeReportIdentifier = (value = "") =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-report$/, "");

/**
 * Stable keys should come from Report.reportKey in DB where possible.
 * Keeping reportName aliases for backward compatibility.
 */
const reportServiceRegistry = {
  "dept-kpa": async ({
    dateFilter,
    departmentId,
    departments,
    roles,
    company,
    user,
  }) =>
    fetchPerformanceReportService({
      dateFilter: {
        ...buildDateFilter({
          startDate: dateFilter?.startDate,
          endDate: dateFilter?.endDate,
          field: "assignedDate",
        }),
      },
      departmentId,
      departments,
      roles,
      company,
      user,
      type: "KPA",
      isReport: true,
    }),
  "dept-kra": async ({
    dateFilter,
    departmentId,
    departments,
    roles,
    company,
    user,
  }) =>
    fetchPerformanceReportService({
      dateFilter: {
        ...buildDateFilter({
          startDate: dateFilter?.startDate,
          endDate: dateFilter?.endDate,
          field: "assignedDate",
        }),
      },
      departmentId,
      departments,
      roles,
      company,
      user,
      type: "KRA",
      isReport: true,
    }),
  "individual-kra": async ({
    dateFilter,
    departmentId,
    departments,
    roles,
    company,
    user,
  }) =>
    fetchPerformanceReportService({
      dateFilter: {
        ...buildDateFilter({
          startDate: dateFilter?.startDate,
          endDate: dateFilter?.endDate,
          field: "assignedDate",
        }),
      },
      departmentId,
      departments,
      roles,
      company,
      user,
      type: "INDIVIDUALKRA",
      isReport: true,
    }),
  "individual-kpa": async ({
    dateFilter,
    departmentId,
    departments,
    roles,
    company,
    user,
  }) =>
    fetchPerformanceReportService({
      dateFilter: {
        ...buildDateFilter({
          startDate: dateFilter?.startDate,
          endDate: dateFilter?.endDate,
          field: "assignedDate",
        }),
      },
      departmentId,
      departments,
      roles,
      company,
      user,
      type: "INDIVIDUALKPA",
      isReport: true,
    }),
  "my-task": async ({
    dateFilter,
    departmentId,
    departments,
    roles,
    company,
    user,
  }) =>
    fetchMyTasksReportService({
      dateFilter: {
        ...buildDateFilter({
          startDate: dateFilter?.startDate,
          endDate: dateFilter?.endDate,
          field: "assignedDate",
        }),
      },
      departmentId,
      departments,
      roles,
      company,
      user,
    }),
  "department-task": async ({
    dateFilter,
    departmentId,
    departments,
    roles,
    company,
    user,
  }) =>
    fetchDeptTaskReportService({
      dateFilter: {
        ...buildDateFilter({
          startDate: dateFilter?.startDate,
          endDate: dateFilter?.endDate,
          field: "assignedDate",
        }),
      },
      departmentId,
      departments,
      roles,
      company,
      user,
      isReport: true,
    }),

  asset: async ({
    dateFilter,
    departmentId,
    departments,
    roles,
    company,
    user,
    query,
  }) =>
    fetchAssetReportService({
      dateFilter: {
        ...buildDateFilter({
          startDate: dateFilter?.startDate,
          endDate: dateFilter?.endDate,
          field: "createdAt",
        }),
      },
      departmentId,
      departments,
      roles,
      company,
      user,
      query,
      isReport: true,
    }),

  meeting: async ({ dateFilter, company, departmentId, departments, roles }) =>
    fetchMeetingReportService({
      dateFilter: {
        ...buildDateFilter({
          startDate: dateFilter?.startDate,
          endDate: dateFilter?.endDate,
          field: "startDate",
        }),
      },
      company,
      departmentId,
      departments,
      roles,
      isReport: true,
    }),

  visitor: async ({ dateFilter, company }) =>
    fetchVisitorReportService({
      dateFilter: {
        ...buildDateFilter({
          startDate: dateFilter?.startDate,
          endDate: dateFilter?.endDate,
          field: "checkIn",
        }),
      },
      company,
    }),

  budget: async ({ dateFilter, departmentId }) =>
    fetchBudgetService({
      departmentId,
      dateFilter: {
        ...buildDateFilter({
          startDate: dateFilter?.startDate,
          endDate: dateFilter?.endDate,
          field: "dueDate",
        }),
      },
    }),

  ticket: async ({ dateFilter, departmentId, departments, roles }) =>
    fetchTicketReportService({
      departmentId,
      roles,
      departments,
      dateFilter: buildDateFilter({
        startDate: dateFilter?.startDate,
        endDate: dateFilter?.endDate,
        field: "createdAt",
      }),
    }),
};

const resolveReportService = (reportMeta = {}) => {
  console.log("Resolving report service for reportMeta:", reportMeta);
  const key = normalizeReportIdentifier(reportMeta.reportKey || "");
  const name = normalizeReportIdentifier(reportMeta.reportName || "");

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
