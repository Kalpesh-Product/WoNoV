const buildDateFilter = require("../../utils/dateFilter");
const { fetchBudgetService, fetchVoucherService } = require("./finance");
const { fetchTicketReportService } = require("./ticket");
const { fetchVendorReportService } = require("./vendor");
const { fetchPerformanceReportService } = require("./performance");
const {
  fetchDeptTaskReportService,
  fetchMyTasksReportService,
} = require("./task");
const { fetchAssetReportService } = require("./asset");
const { fetchMeetingReportService } = require("./meeting");
const { fetchVisitorReportService } = require("./visitor");
const { fetchCoworkingRevenueService } = require("./revenue");

const normalizeReportIdentifier = (value = "") =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-report$/, "");

const COMMON_REPORT_CONTEXT_KEYS = [
  "departmentId",
  "departments",
  "roles",
  "company",
  "user",
];
const FINANCE_REPORT_CONTEXT_KEYS = ["departments", "departmentId", "roles"];

const pickContext = (context = {}, keys = []) =>
  keys.reduce((params, key) => {
    if (Object.prototype.hasOwnProperty.call(context, key)) {
      params[key] = context[key];
    }

    return params;
  }, {});

const buildReportDateFilter = (dateFilter, field) =>
  buildDateFilter({
    startDate: dateFilter?.startDate,
    endDate: dateFilter?.endDate,
    field,
  });

const createReportService =
  (
    service,
    {
      dateField,
      contextKeys = COMMON_REPORT_CONTEXT_KEYS,
      staticParams = { isReport: true },
    },
  ) =>
  async (context = {}) =>
    service({
      ...pickContext(context, contextKeys),
      dateFilter: buildReportDateFilter(context.dateFilter, dateField),
      ...staticParams,
    });

const createPerformanceReportService = (type) =>
  createReportService(fetchPerformanceReportService, {
    dateField: "assignedDate",
  });

/**
 * Stable keys should come from Report.reportKey in DB where possible.
 * Keeping reportName aliases for backward compatibility.
 */
// const reportServiceRegistry = {
//   vendor: async ({
//     dateFilter,
//     departmentId,
//     departments,
//     roles,
//     company,
//     user,
//   }) =>
//     fetchVendorReportService({
//       dateFilter: {
//         ...buildDateFilter({
//           startDate: dateFilter?.startDate,
//           endDate: dateFilter?.endDate,
//           field: "onboardingDate",
//         }),
//       },
//       departmentId,
//       departments,
//       roles,
//       company,
//       user,
//     }),

//   "dept-kpa": async ({
//     dateFilter,
//     departmentId,
//     departments,
//     roles,
//     company,
//     user,
//   }) =>
//     fetchPerformanceReportService({
//       dateFilter: {
//         ...buildDateFilter({
//           startDate: dateFilter?.startDate,
//           endDate: dateFilter?.endDate,
//           field: "assignedDate",
//         }),
//       },
//       departmentId,
//       departments,
//       roles,
//       company,
//       user,
//       type: "KPA",
//       isReport: true,
//     }),
//   "dept-kra": async ({
//     dateFilter,
//     departmentId,
//     departments,
//     roles,
//     company,
//     user,
//   }) =>
//     fetchPerformanceReportService({
//       dateFilter: {
//         ...buildDateFilter({
//           startDate: dateFilter?.startDate,
//           endDate: dateFilter?.endDate,
//           field: "assignedDate",
//         }),
//       },
//       departmentId,
//       departments,
//       roles,
//       company,
//       user,
//       type: "KRA",
//       isReport: true,
//     }),
//   "individual-kra": async ({
//     dateFilter,
//     departmentId,
//     departments,
//     roles,
//     company,
//     user,
//   }) =>
//     fetchPerformanceReportService({
//       dateFilter: {
//         ...buildDateFilter({
//           startDate: dateFilter?.startDate,
//           endDate: dateFilter?.endDate,
//           field: "assignedDate",
//         }),
//       },
//       departmentId,
//       departments,
//       roles,
//       company,
//       user,
//       type: "INDIVIDUALKRA",
//       isReport: true,
//     }),
//   "individual-kpa": async ({
//     dateFilter,
//     departmentId,
//     departments,
//     roles,
//     company,
//     user,
//   }) =>
//     fetchPerformanceReportService({
//       dateFilter: {
//         ...buildDateFilter({
//           startDate: dateFilter?.startDate,
//           endDate: dateFilter?.endDate,
//           field: "assignedDate",
//         }),
//       },
//       departmentId,
//       departments,
//       roles,
//       company,
//       user,
//       type: "INDIVIDUALKPA",
//       isReport: true,
//     }),
//   "my-task": async ({
//     dateFilter,
//     departmentId,
//     departments,
//     roles,
//     company,
//     user,
//   }) =>
//     fetchMyTasksReportService({
//       dateFilter: {
//         ...buildDateFilter({
//           startDate: dateFilter?.startDate,
//           endDate: dateFilter?.endDate,
//           field: "assignedDate",
//         }),
//       },
//       departmentId,
//       departments,
//       roles,
//       company,
//       user,
//     }),
//   "department-task": async ({
//     dateFilter,
//     departmentId,
//     departments,
//     roles,
//     company,
//     user,
//   }) =>
//     fetchDeptTaskReportService({
//       dateFilter: {
//         ...buildDateFilter({
//           startDate: dateFilter?.startDate,
//           endDate: dateFilter?.endDate,
//           field: "assignedDate",
//         }),
//       },
//       departmentId,
//       departments,
//       roles,
//       company,
//       user,
//       isReport: true,
//     }),

//   asset: async ({
//     dateFilter,
//     departmentId,
//     departments,
//     roles,
//     company,
//     user,
//     query,
//   }) =>
//     fetchAssetReportService({
//       dateFilter: {
//         ...buildDateFilter({
//           startDate: dateFilter?.startDate,
//           endDate: dateFilter?.endDate,
//           field: "createdAt",
//         }),
//       },
//       departmentId,
//       departments,
//       roles,
//       company,
//       user,
//       query,
//       isReport: true,
//     }),

//   meeting: async ({
//     dateFilter,
//     company,
//     departmentId,
//     departments,
//     roles,
//     user,
//   }) =>
//     fetchMeetingReportService({
//       dateFilter: {
//         ...buildDateFilter({
//           startDate: dateFilter?.startDate,
//           endDate: dateFilter?.endDate,
//           field: "startDate",
//         }),
//       },
//       company,
//       departmentId,
//       departments,
//       roles,
//       user,
//       isReport: true,
//     }),

//   visitor: async ({ dateFilter, departmentId, company }) =>
//     fetchVisitorReportService({
//       dateFilter: {
//         ...buildDateFilter({
//           startDate: dateFilter?.startDate,
//           endDate: dateFilter?.endDate,
//           field: "checkIn",
//         }),
//       },
//       departmentId,
//       company,
//     }),

//   budget: async ({ dateFilter, departmentId, departments, roles }) =>
//     fetchBudgetService({
//       departments,
//       departmentId,
//       dateFilter: {
//         ...buildDateFilter({
//           startDate: dateFilter?.startDate,
//           endDate: dateFilter?.endDate,
//           field: "dueDate",
//         }),
//       },
//       roles,
//       isReport: true,
//     }),
//   voucher: async ({ dateFilter, departmentId, departments, roles }) =>
//     fetchVoucherService({
//       departments,
//       departmentId,
//       dateFilter: {
//         ...buildDateFilter({
//           startDate: dateFilter?.startDate,
//           endDate: dateFilter?.endDate,
//           field: "dueDate",
//         }),
//       },
//       roles,
//       isReport: true,
//     }),

//   ticket: async ({ dateFilter, departmentId, departments, roles }) =>
//     fetchTicketReportService({
//       departmentId,
//       roles,
//       departments,
//       dateFilter: buildDateFilter({
//         startDate: dateFilter?.startDate,
//         endDate: dateFilter?.endDate,
//         field: "createdAt",
//       }),
//     }),
// };

const reportServiceRegistry = {
  "dept-kpa": createPerformanceReportService("KPA"),
  "dept-kra": createPerformanceReportService("KRA"),
  "individual-kra": createPerformanceReportService("INDIVIDUALKRA"),
  "individual-kpa": createPerformanceReportService("INDIVIDUALKPA"),

  "my-task": createReportService(fetchMyTasksReportService, {
    dateField: "assignedDate",
  }),
  "department-task": createReportService(fetchDeptTaskReportService, {
    dateField: "assignedDate",
  }),

  asset: createReportService(fetchAssetReportService, {
    dateField: "createdAt",
    contextKeys: [...COMMON_REPORT_CONTEXT_KEYS, "query"],
  }),

  meeting: createReportService(fetchMeetingReportService, {
    dateField: "startDate",
  }),

  visitor: createReportService(fetchVisitorReportService, {
    dateField: "checkIn",
    contextKeys: ["departmentId", "company"],
  }),

  ticket: createReportService(fetchTicketReportService, {
    dateField: "createdAt",
    contextKeys: ["departmentId", "roles", "departments"],
  }),

  budget: createReportService(fetchBudgetService, {
    dateField: "dueDate",
    contextKeys: FINANCE_REPORT_CONTEXT_KEYS,
  }),
  voucher: createReportService(fetchVoucherService, {
    dateField: "dueDate",
    contextKeys: FINANCE_REPORT_CONTEXT_KEYS,
  }),

  vendor: createReportService(fetchVendorReportService, {
    dateField: "onboardingDate",
  }),

  "coworking-revenue": createReportService(fetchCoworkingRevenueService, {
    dateField: "rentDate",
  }),
};

const resolveReportService = (reportMeta = {}) => {
  const key = normalizeReportIdentifier(reportMeta.reportKey || "");
  const name = normalizeReportIdentifier(reportMeta.reportName || "");

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
