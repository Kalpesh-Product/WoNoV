const buildDateFilter = require("../../utils/dateFilter");
const { fetchBudgetService, fetchVoucherService } = require("./finance");
const { fetchTicketReportService } = require("./ticket");
const { fetchVendorReportService } = require("./vendor");
const { fetchPerformanceReportService } = require("./performance");
const {
  fetchDeptTaskReportService,
  fetchMyTasksReportService,
} = require("./task");
const {
  fetchAssetReportService,
  fetchAssignedAssetReportService,
} = require("./asset");
const { fetchMeetingReportService } = require("./meeting");
const {
  fetchVisitorReportService,
  fetchInternalVisitorsReportService,
  fetchClientVisitorsReportService,
} = require("./visitor");
const { fetchCoworkingRevenueService } = require("./revenue");

const { fetchMeetingRevenueReportService } = require("./revenue");
const { fetchAlternateRevenueReportService } = require("./revenue");
const { fetchVirtualOfficeRevenueReportService } = require("./revenue");
const {
  fetchCoworkingClientReportService,
  fetchVirtualOfficeClientsReportService,
  fetchCoworkingMembersReportService,
} = require("./client");
const {
  fetchUsersReportService,
  fetchLeavesReportService,
  fetchAttendanceReportService,
} = require("./employees");
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
    staticParams: { isReport: true, type },
  });

/**
 * Stable keys should come from Report.reportKey in DB where possible.
 * Keeping reportName aliases for backward compatibility.
 */

const reportServiceRegistry = {
  attendance: createReportService(fetchAttendanceReportService, {
    dateField: "inTime",
  }),

  leaves: createReportService(fetchLeavesReportService, {
    dateField: "fromDate",
  }),

  employees: createReportService(fetchUsersReportService, {
    dateField: "startDate",
  }),

  "external-clients": createReportService(fetchVisitorReportService, {
    dateField: "checkIn",
    contextKeys: ["departmentId", "company"],
    staticParams: { isMeeting: true },
  }),

  "open-desk-clients": createReportService(fetchVisitorReportService, {
    dateField: "checkIn",
    contextKeys: ["departmentId", "company"],
    staticParams: { isOpendDesk: true },
  }),

  "virtual-office-clients": createReportService(
    fetchVirtualOfficeClientsReportService,
    {
      dateField: "termStartDate",
    },
  ),

  "coworking-client-members-biometric": createReportService(
    fetchCoworkingMembersReportService,
    {
      dateField: "dateOfJoining",
    },
  ),

  "coworking-client-members": createReportService(
    fetchCoworkingMembersReportService,
    {
      dateField: "dateOfJoining",
    },
  ),

  "coworking-clients": createReportService(fetchCoworkingClientReportService, {
    dateField: "startDate",
  }),

  "virtual-office-revenue": createReportService(
    fetchVirtualOfficeRevenueReportService,
    {
      dateField: "rentDate",
    },
  ),

  "alternate-revenue": createReportService(fetchAlternateRevenueReportService, {
    dateField: "invoiceCreationDate",
  }),

  "coworking-revenue": createReportService(fetchCoworkingRevenueService, {
    dateField: "rentDate",
  }),

  "meeting-revenue": createReportService(fetchMeetingRevenueReportService, {
    dateField: "date",
  }),

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

  asset: createReportService(fetchAssignedAssetReportService, {
    dateField: "createdAt",
    contextKeys: [...COMMON_REPORT_CONTEXT_KEYS, "query"],
  }),

  meeting: createReportService(fetchMeetingReportService, {
    dateField: "startDate",
  }),

  visitor: createReportService(fetchInternalVisitorsReportService, {
    dateField: "checkIn",
  }),

  client: createReportService(fetchClientVisitorsReportService, {
    dateField: "checkIn",
  }),

  ticket: createReportService(fetchTicketReportService, {
    dateField: "createdAt",
    contextKeys: ["departmentId", "roles", "departments"],
  }),

  budget: createReportService(fetchBudgetService, {
    dateField: "dueDate",
    contextKeys: FINANCE_REPORT_CONTEXT_KEYS,
  }),

  "electricity-expense": createReportService(fetchBudgetService, {
    dateField: "dueDate",
    contextKeys: FINANCE_REPORT_CONTEXT_KEYS,
    staticParams: { isElectricity: true },
  }),

  voucher: createReportService(fetchVoucherService, {
    dateField: "dueDate",
    contextKeys: FINANCE_REPORT_CONTEXT_KEYS,
  }),

  vendor: createReportService(fetchVendorReportService, {
    dateField: "onboardingDate",
  }),
};

const resolveReportService = (reportMeta = {}) => {
  console.log;
  ("Resolving report service for reportMeta:", reportMeta);
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
