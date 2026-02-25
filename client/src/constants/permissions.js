export const PERMISSIONS = {
  ASSETS_VIEW_ASSETS: {
    value: "view_assets",
    title: "VIEW ASSETS",
    type: "read",
  },
  ASSETS_MANAGE_ASSETS: {
    value: "manage_assets",
    title: "MANAGE ASSETS",
    type: "read",
  },
  ASSETS_ASSIGNED_UNASSIGNED: {
    value: "assigned_unassigned",
    title: "ASSIGNED UNASSIGNED",
    type: "read",
  },
  ASSETS_ASSIGNED_ASSETS: {
    value: "assigned_assets",
    title: "ASSIGNED ASSETS",
    type: "read",
  },

  // Tickets Module
  TICKETS_RAISE_TICKET: {
    value: "raise_ticket",
    title: "RAISE TICKET",
    type: "read",
    route: "/app/tickets/raise-ticket",
  },
  TICKETS_MANAGE_TICKETS: {
    value: "manage_tickets",
    title: "MANAGE TICKETS",
    type: "read",
    route: "/app/tickets/manage-tickets",
  },

  TICKETS_RECIEVED_TICKETS: {
    value: "recieved_tickets",
    title: "RECIEVED TICKETS",
    type: "read",
    route: "/app/tickets/manage-tickets",
  },
  TICKETS_ACCEPTED_TICKETS: {
    value: "accepted_tickets",
    title: "ACCEPTED TICKETS",
    type: "read",
    route: "/app/tickets/manage-tickets",
  },
  TICKETS_ASSIGNED_TICKETS: {
    value: "assigned_tickets",
    title: "ASSIGNED TICKETS",
    type: "read",
    route: "/app/tickets/manage-tickets",
  },
  TICKETS_SUPPORT_TICKETS: {
    value: "support_tickets",
    title: "SUPPORT TICKETS",
    type: "read",
    route: "/app/tickets/manage-tickets",
  },
  TICKETS_ESCALATED_TICKETS: {
    value: "escalated_tickets",
    title: "ESCALATED TICKETS",
    type: "read",
    route: "/app/tickets/manage-tickets",
  },
  TICKETS_CLOSED_TICKETS: {
    value: "closed_tickets",
    title: "CLOSED TICKETS",
    type: "read",
    route: "/app/tickets/manage-tickets",
  },

  TICKETS_TICKET_SETTINGS: {
    value: "ticket_settings",
    title: "TICKET SETTINGS",
    type: "read",
    route: "/app/tickets/settings",
  },
  TICKETS_REPORTS: {
    value: "ticket_reports",
    title: "TICKET REPORTS",
    type: "read",
    route: "/app/tickets/reports",
  },
  TICKETS_TEAM_MEMBERS: {
    value: "tickets_team_members",
    title: "TICKETS TEAM MEMBERS",
    type: "read",
    route: "/app/tickets/team-members",
  },
  TICKETS_TOTAL_TICKETS_DONUT: {
    value: "total_tickets_donut",
    title: "TOTAL TICKETS DONUT",
    type: "read",
  },
  TICKETS_DEPARTMENT_TICKETS_DONUT: {
    value: "department_tickets_donut",
    title: "DEPARTMENT TICKETS DONUT",
    type: "read",
  },
  TICKETS_PRIORITY_WISE_TICKETS_DATA_CARD: {
    value: "priority_wise_tickets_data_card",
    title: "PRIORITY WISE TICKETS DATA CARD",
    type: "read",
  },
  TICKETS_DEPARTMENT_TICKETS_DATA_CARD: {
    value: "department_tickets_data_card",
    title: "DEPARTMENT TICKETS DATA CARD",
    type: "read",
  },
  TICKETS_PERSONAL_TICKETS_DATA_CARD: {
    value: "personal_tickets_data_card",
    title: "PERSONAL TICKETS DATA CARD",
    type: "read",
  },
  TICKETS_OVERALL_DEPARTMENT_WISE_TICKETS: {
    value: "overall_department_wise_tickets",
    title: "OVERALL DEPARTMENT WISE TICKETS",
    type: "read",
  },

  // Performance Module

  PERFORMANCE_DAILY_KRA: {
    value: "daily_kra",
    title: "DAILY KRA",
    type: "read",
    route: "daily-KRA",
  },
  PERFORMANCE_MONTHLY_KPA: {
    value: "monthly_kpa",
    title: "MONTHLY KPA",
    type: "read",
    route: "monthly-KPA",
  },

  //Tasks Module
  TASKS_OVERALL_AVERAGE_COMPLETION: {
    value: "overall_average_task_completion",
    title: "OVERALL AVERAGE TASK COMPLETION",
    type: "read",
  },
  TASKS_MY_TASKS: { value: "my_tasks", title: "MY TASKS", type: "read" },
  TASKS_DEPARTMENT_TASKS: {
    value: "department_tasks",
    title: "DEPARTMENT TASKS",
    type: "read",
  },
  TASKS_TEAM_MEMBERS: {
    value: "task_team_members",
    title: "TASK TEAM MEMBERS",
    type: "read",
  },
  TASKS_REPORTS: { value: "task_reports", title: "TASK REPORTS", type: "read" },
  TASKS_SETTINGS: {
    value: "task_settings",
    title: "TASK SETTINGS",
    type: "read",
  },
  // Data Cards
  TASKS_TOTAL_DEPARTMENT_TASKS: {
    value: "total_department_tasks",
    title: "TOTAL DEPARTMENT TASKS",
    type: "read",
  },
  TASKS_TOTAL_DEPARTMENT_PENDING_TASKS: {
    value: "total_department_pending_tasks",
    title: "TOTAL DEPARTMENT PENDING TASKS",
    type: "read",
  },
  TASKS_TOTAL_DEPARTMENT_COMPLETED_TASKS: {
    value: "total_department_completed_tasks",
    title: "TOTAL DEPARTMENT COMPLETED TASKS",
    type: "read",
  },

  // Pie Charts
  TASKS_OVERALL_PENDING_VS_COMPLETED: {
    value: "overall_pending_vs_completed",
    title: "OVERALL PENDING VS COMPLETED",
    type: "read",
  },
  TASKS_DEPARTMENT_WISE_PENDING: {
    value: "department_wise_pending",
    title: "DEPARTMENT WISE PENDING",
    type: "read",
  },

  // Tables
  TASKS_HIGH_PRIORITY_DUE: {
    value: "high_priority_due",
    title: "HIGH PRIORITY DUE",
    type: "read",
  },
  TASKS_MY_MEETINGS_TODAY: {
    value: "my_meetings_today",
    title: "MY MEETINGS TODAY",
    type: "read",
  },
  TASKS_RECENTLY_ADDED: {
    value: "recently_added",
    title: "RECENTLY ADDED",
    type: "read",
  },

  // Tabs
  TASKS_MY_TASK_REPORTS: {
    value: "my_task_reports",
    title: "MY TASK REPORTS",
    type: "read",
    route: "/app/tasks/reports/my-task-reports",
  },
  TASKS_ASSIGNED_TASKS_REPORTS: {
    value: "assigned_tasks_reports",
    title: "ASSIGNED TASKS REPORTS",
    type: "read",
    route: "/app/tasks/reports/assigned-task-reports",
  },

  // Visitors Module
  VISITORS_MONTHLY_TOTAL_VISITORS: {
    value: "visitors_monthly_total_visitors",
    title: "VISITORS MONTHLY TOTAL VISITORS",
    type: "read",
  },
  VISITORS_ADD_VISITOR: {
    value: "add_visitor",
    title: "ADD VISITOR",
    type: "read",
    route: "/app/visitors/add-visitor",
  },
  VISITORS_ADD_CLIENT: {
    value: "add_client",
    title: "ADD CLIENT",
    type: "read",
    route: "/app/visitors/add-client",
  },
  VISITORS_MANAGE_VISITORS: {
    value: "manage_visitors",
    title: "MANAGE VISITORS",
    type: "read",
    route: "/app/visitors/manage-visitors",
  },
  VISITORS_TEAM_MEMBERS: {
    value: "visitor_team_members",
    title: "VISITOR TEAM MEMBERS",
    type: "read",
    route: "/app/visitors/team-members",
  },
  VISITORS_REPORTS: {
    value: "visitor_reports",
    title: "VISITOR REPORTS",
    type: "read",
    route: "/app/visitors/reports",
  },

  VISITORS_VISITOR_CATEGORIES: {
    value: "visitor_categories",
    title: "VISITOR CATEGORIES",
    type: "read",
  },
  VISITORS_CHECKED_IN_VS_YET_TO_CHECK_OUT: {
    value: "visitor_checked_in_vs_yet_to_check_out",
    title: "VISITOR CHECKED IN VS YET TO CHECK OUT",
    type: "read",
  },
  VISITORS_GENDER_DATA_PIE: {
    value: "visitor_gender_data_pie_chart",
    title: "VISITOR GENDER DATA PIE CHART",
    type: "read",
  },
  VISITORS_DEPARTMENT_WISE_VISITS_PIE: {
    value: "visitor_department_wise_visits_pie_chart",
    title: "VISITOR DEPARTMENT WISE VISITS PIE CHART",
    type: "read",
  },
  VISITORS_TODAY: {
    value: "visitor_today",
    title: "VISITOR TODAY",
    type: "read",
  },

  //Visitors Data Cards
  VISITORS_CHECKED_IN_VISITORS_TODAY: {
    value: "checked_in_visitors_today",
    title: "CHECKED IN VISITORS TODAY",
    type: "read",
  },
  VISITORS_CHECKED_OUT_TODAY: {
    value: "checked_out_today",
    title: "CHECKED OUT TODAY",
    type: "read",
  },
  VISITORS_YET_TO_CHECK_OUT: {
    value: "yet_to_check_out",
    title: "YET TO CHECK OUT",
    type: "read",
  },
  VISITORS_WALK_IN_VISITS_TODAY: {
    value: "walk_in_visits_today",
    title: "WALK IN VISITS TODAY",
    type: "read",
  },
  VISITORS_SCHEDULED_VISITS_TODAY: {
    value: "scheduled_visits_today",
    title: "SCHEDULED VISITS TODAY",
    type: "read",
  },
  VISITORS_MEETING_BOOKINGS_TODAY: {
    value: "meeting_bookings_today",
    title: "MEETING BOOKINGS TODAY",
    type: "read",
  },
  //Visitors Tabs
  VISITORS_MANAGE_INTERNAL_VISITORS: {
    value: "visitors_manage_internal_visitors",
    title: "VISITORS MANAGE INTERNAL VISITORS",
    type: "read",
    access: "page",
    route: "/app/visitors/manage-visitors/internal-visitors",
  },
  VISITORS_MANAGE_EXTERNAL_CLIENTS: {
    value: "visitors_manage_external_clients",
    title: "VISITORS MANAGE EXTERNAL CLIENTS",
    type: "read",
    access: "page",
    route: "/app/visitors/manage-visitors/external-clients",
  },

  //Visitors table
  VISITORS_VISITORS_TODAY: {
    value: "visitors_visitors_today",
    title: "VISITORS VISITORS TODAY",
    type: "read",
  },

  // Meetings Module

  //Meeting Graphs
  MEETINGS_AVERAGE_ROOM_UTILIZATION: {
    value: "average_room_utilization",
    title: "AVERAGE ROOM UTILIZATION",
    type: "read",
  },
  MEETINGS_EXTERNAL_GUESTS_VISITED: {
    value: "external_guests_visited",
    title: "EXTERNAL GUESTS VISITED",
    type: "read",
  },
  MEETINGS_AVERAGE_OCCUPANCY: {
    value: "average_occupancy",
    title: "AVERAGE OCCUPANCY",
    type: "read",
  },
  MEETINGS_BUSY_TIME_WEEK: {
    value: "busy_time_week",
    title: "BUSY TIME WEEK",
    type: "read",
  },

  // Cards
  MEETINGS_BOOK_MEETING: {
    value: "book_meeting",
    title: "BOOK MEETING",
    type: "read",
    access: "page",
    route: "/app/meetings/book-meeting",
  },
  MEETINGS_MANAGE_MEETINGS: {
    value: "manage_meetings",
    title: "MANAGE MEETINGS",
    type: "read",
  },
  MEETINGS_CALENDAR: {
    value: "calendar",
    title: "CALENDAR",
    type: "read",
  },
  MEETINGS_REPORTS: {
    value: "reports",
    title: "REPORTS",
    type: "read",
  },
  MEETINGS_REVIEWS: {
    value: "reviews",
    title: "REVIEWS",
    type: "read",
  },
  MEETINGS_SETTINGS: {
    value: "settings",
    title: "SETTINGS",
    type: "read",
  },

  // Pie Charts
  MEETINGS_ROOM_STATUS: {
    value: "room_status",
    title: "ROOM STATUS",
    type: "read",
  },
  MEETINGS_HOUSEKEEPING_STATUS: {
    value: "housekeeping_status",
    title: "HOUSEKEEPING STATUS",
    type: "read",
  },
  MEETINGS_DURATION_BREAKDOWN: {
    value: "duration_breakdown",
    title: "DURATION BREAKDOWN",
    type: "read",
  },

  // Tabs
  MEETINGS_MEETINGS_INTERNAL: {
    value: "manage_meetings_internal",
    title: "MANAGE MEETINGS INTERNAL",
    type: "read",
    access: "page",
    route: "/app/meetings/manage-meetings/internal-meetings",
  },
  MEETINGS_MEETINGS_EXTERNAL: {
    value: "manage_meetings_external",
    title: "MANAGE MEETINGS EXTERNAL",
    type: "read",
    access: "page",
    route: "/app/meetings/manage-meetings/external-meetings",
  },

  // Data Cards
  MEETINGS_HOURS_BOOKED: {
    value: "hours_booked",
    title: "HOURS BOOKED",
    type: "read",
  },
  MEETINGS_UNIQUE_BOOKINGS: {
    value: "unique_bookings",
    title: "UNIQUE BOOKINGS",
    type: "read",
  },
  MEETINGS_BIZ_NEST_BOOKINGS: {
    value: "biz_nest_bookings",
    title: "BIZ NEST BOOKINGS",
    type: "read",
  },
  MEETINGS_GUEST_BOOKINGS: {
    value: "guest_bookings",
    title: "GUEST BOOKINGS",
    type: "read",
  },
  MEETINGS_AVERAGE_HOURS_BOOKED: {
    value: "average_hours_booked",
    title: "AVERAGE HOURS BOOKED",
    type: "read",
  },
  MEETINGS_HOURS_CANCELLED: {
    value: "hours_cancelled",
    title: "HOURS CANCELLED",
    type: "read",
  },

  // Tables
  MEETINGS_INTERNAL_ONGOING_MEETINGS: {
    value: "internal_ongoing_meetings",
    title: "INTERNAL ONGOING MEETINGS",
    type: "read",
  },
  MEETINGS_EXTERNAL_ONGOING_MEETINGS: {
    value: "external_ongoing_meetings",
    title: "EXTERNAL ONGOING MEETINGS",
    type: "read",
  },

  //Meeting buttons
  MEETINGS_ADD_ROOM: {
    value: "add_room",
    title: "ADD ROOM",
    type: "write",
    access: "button",
  },

  // Finance Module
  FINANCE_CASHFLOW: { value: "cashflow", title: "CASHFLOW", type: "read" },
  FINANCE_FINANCE: {
    value: "finance_finance",
    title: "FINANCE FINANCE",
    type: "read",
  },
  FINANCE_BILLING: { value: "billing", title: "BILLING", type: "read" },
  FINANCE_MIX_BAG: {
    value: "finance_mix_bag",
    title: "FINANCE MIX BAG",
    type: "read",
  },
  FINANCE_DATA: { value: "finance_data", title: "FINANCE DATA", type: "read" },
  FINANCE_SETTINGS: {
    value: "finance_settings",
    title: "FINANCE SETTINGS",
    type: "read",
  },

  FINANCE_PAYOUTS: {
    value: "finance_payouts_pie_chart",
    title: "FINANCE PAYOUTS PIE CHART",
    type: "read",
  },
  FINANCE_CUSTOMER_COLLECTIONS: {
    value: "finance_customer_collections_pie_chart",
    title: "FINANCE CUSTOMER COLLECTIONS PIE CHART",
    type: "read",
  },
  FINANCE_STATUTORY_PAYMENTS_DONUT: {
    value: "finance_statutory_payments_donut_chart",
    title: "FINANCE STATUTORY PAYMENTS DONUT CHART",
    type: "read",
  },
  FINANCE_RENTAL_PAYMENTS_DONUT: {
    value: "finance_rental_payments_donut_chart",
    title: "FINANCE RENTAL PAYMENTS DONUT CHART",
    type: "read",
  },
  FINANCE_PAYOUTS_MUI_TABLE: {
    value: "finance_payouts_table",
    title: "FINANCE PAYOUTS TABLE",
    type: "read",
  },
  FINANCE_INCOME_EXPENSE_YEARLY_GRAPH: {
    value: "finance_income_expense_yearly_graph",
    title: "FINANCE INCOME EXPENSE YEARLY GRAPH",
    type: "read",
  },
  FINANCE_INCOME_DATA_CARD: {
    value: "finance_income_data_card",
    title: "FINANCE INCOME DATA CARD",
    type: "read",
  },
  FINANCE_EXPENSE_DATA_CARD: {
    value: "finance_expense_data_card",
    title: "FINANCE EXPENSE DATA CARD",
    type: "read",
  },
  FINANCE_PL_DATA_CARD: {
    value: "finance_pl_data_card",
    title: "FINANCE PL DATA CARD",
    type: "read",
  },

  // Finance Tabs
  FINANCE_CASHFLOW_PROJECTIONS: {
    value: "cashflow_projections",
    title: "CASHFLOW PROJECTIONS",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/cashflow/projections",
  },
  FINANCE_CASHFLOW_HISTORICAL: {
    value: "historical_pnl",
    title: "HISTORICAL PNL",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/cashflow/historical-P&L",
  },

  FINANCE_BUDGET: {
    value: "finance_budget",
    title: "FINANCE BUDGET",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/finance/budget",
  },
  FINANCE_PAYMENT_SCHEDULE: {
    value: "finance_payment_schedule",
    title: "FINANCE PAYMENT SCHEDULE",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/finance/payment-schedule",
  },
  FINANCE_VOUCHER: {
    value: "finance_voucher",
    title: "FINANCE VOUCHER",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/finance/voucher",
  },
  FINANCE_DEPT_WISE_BUDGET: {
    value: "dept_wise_budget",
    title: "DEPT WISE BUDGET",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/finance/dept-wise-budget",
  },
  FINANCE_COLLECTIONS: {
    value: "collections",
    title: "COLLECTIONS",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/finance/collections",
  },
  FINANCE_STATUTORY_PAYMENTS: {
    value: "finance_statutory_payments",
    title: "FINANCE STATUTORY PAYMENTS",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/finance/statutory-payments",
  },
  FINANCE_LANDLORD_PAYMENTS: {
    value: "finance_landlord_payments",
    title: "FINANCE LANDLORD PAYMENTS",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/finance/landlord-payments",
  },
  FINANCE_MEETINGS_EXTERNAL: {
    value: "finance_meetings_external",
    title: "FINANCE MEETINGS EXTERNAL",
    type: "read",
    access: "page",
    route:
      "/app/dashboard/finance-dashboard/mix-bag/manage-meetings/external-meetings",
  },
  FINANCE_MEETINGS_INTERNAL: {
    value: "finance_meetings_internal",
    title: "FINANCE MEETINGS INTERNAL",
    type: "read",
    access: "page",
    route:
      "/app/dashboard/finance-dashboard/mix-bag/manage-meetings/internal-meetings",
  },

  FINANCE_BILLING_CLIENT_INVOICE: {
    value: "client_invoice",
    title: "CLIENT INVOICE",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/billing/client-invoice",
  },
  FINANCE_BILLING_DEPARTMENT_INVOICE: {
    value: "department_invoice",
    title: "DEPARTMENT INVOICE",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/billing/department-invoice",
  },
  FINANCE_BILLING_PENDING_APPROVALS: {
    value: "finance_pending_approvals",
    title: "FINANCE PENDING APPROVALS",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/billing/pending-approvals",
  },
  FINANCE_BILLING_VOUCHER_HISTORY: {
    value: "finance_voucher_history",
    title: "FINANCE VOUCHER HISTORY",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/billing/voucher-history",
  },

  FINANCE_DATA_ASSET_LIST: {
    value: "finance_asset_list",
    title: "FINANCE ASSET LIST",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/data/asset-list",
  },
  FINANCE_DATA_MONTHLY_INVOICE_REPORTS: {
    value: "finance_monthly_invoice_reports",
    title: "FINANCE MONTHLY INVOICE REPORTS",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/data/monthly-invoice-reports",
  },
  FINANCE_DATA_VENDORS: {
    value: "finance_data_vendors",
    title: "FINANCE DATA VENDORS",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/data/vendor",
  },

  FINANCE_SETTINGS_BULK_UPLOAD: {
    value: "finance_bulk_upload",
    title: "FINANCE BULK UPLOAD",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/settings/bulk-upload",
  },
  FINANCE_SETTINGS_SOPS: {
    value: "finance_sops",
    title: "FINANCE SOPS",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/settings/sops",
  },
  FINANCE_SETTINGS_POLICIES: {
    value: "finance_policies",
    title: "FINANCE POLICIES",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/settings/policies",
  },

  // 🔷 Sales Dashboard

  SALES_TURNOVER: { value: "turnover", title: "TURNOVER", type: "read" },
  SALES_FINANCE: { value: "finance", title: "FINANCE", type: "read" },
  SALES_MIX_BAG: { value: "mix_bag", title: "MIX BAG", type: "read" },
  SALES_DATA: { value: "data", title: "DATA", type: "read" },
  SALES_SETTINGS: { value: "settings", title: "SETTINGS", type: "read" },

  // 🔷 Sales Nav Cards
  SALES_REVENUE: { value: "revenue", title: "REVENUE", type: "read" },
  SALES_KEY_STATS: { value: "key_stats", title: "KEY STATS", type: "read" },
  SALES_AVERAGE: { value: "average", title: "AVERAGE", type: "read" },

  // 🔷 Sales graphs
  SALES_DEPARTMENT_REVENUES: {
    value: "department_revenues",
    title: "DEPARTMENT REVENUES",
    type: "read",
  },
  SALES_MONTHLY_UNIQUE_LEADS: {
    value: "monthly_unique_leads",
    title: "MONTHLY UNIQUE LEADS",
    type: "read",
  },
  SALES_SOURCING_CHANNELS: {
    value: "sourcing_channels",
    title: "SOURCING CHANNELS",
    type: "read",
  },

  // 🔷 Sales Chart Permissions
  SALES_SECTOR_WISE_OCCUPANCY: {
    value: "sector_wise_occupancy",
    title: "SECTOR WISE OCCUPANCY",
    type: "read",
  },
  SALES_CLIENT_WISE_OCCUPANCY: {
    value: "client_wise_occupancy",
    title: "CLIENT WISE OCCUPANCY",
    type: "read",
  },
  SALES_CLIENT_GENDER_WISE_DATA: {
    value: "client_gender_wise_data",
    title: "CLIENT GENDER WISE DATA",
    type: "read",
  },
  SALES_INDIA_WISE_MEMBERS: {
    value: "india_wise_members",
    title: "INDIA WISE MEMBERS",
    type: "read",
  },
  SALES_CURRENT_MONTH_CLIENT_ANNIVERSARY: {
    value: "current_month_client_anniversary",
    title: "CURRENT MONTH CLIENT ANNIVERSARY",
    type: "read",
  },
  SALES_CLIENT_MEMBER_BIRTHDAY: {
    value: "client_member_birthday",
    title: "CLIENT MEMBER BIRTHDAY",
    type: "read",
  },

  //Finance
  SALES_BUDGET: {
    value: "budget",
    title: "BUDGET",
    type: "read",
    route: "/app/dashboard/sales-dashboard/finance/budget",
  },
  SALES_PAYMENT_SCHEDULE: {
    value: "payment_schedule",
    title: "PAYMENT SCHEDULE",
    type: "read",
    route: "/app/dashboard/sales-dashboard/finance/payment-schedule",
  },
  SALES_VOUCHER: {
    value: "voucher",
    title: "VOUCHER",
    type: "read",
    route: "/app/dashboard/sales-dashboard/finance/voucher",
  },
  // Revenue
  SALES_TOTAL_REVENUE: {
    value: "total_revenue",
    title: "TOTAL REVENUE",
    type: "read",
    route: "/app/dashboard/sales-dashboard/revenue/total-revenue",
  },
  SALES_COWORKING: {
    value: "coworking",
    title: "COWORKING",
    type: "read",
    route: "/app/dashboard/sales-dashboard/revenue/co-working",
  },
  SALES_MEETINGS: {
    value: "meetings",
    title: "MEETINGS",
    type: "read",
    route: "/app/dashboard/sales-dashboard/revenue/meetings",
  },
  SALES_VIRTUAL_OFFICE: {
    value: "virtual_office",
    title: "VIRTUAL OFFICE",
    type: "read",
    route: "/app/dashboard/sales-dashboard/revenue/virtual-office",
  },
  SALES_WORKATIONS: {
    value: "workations",
    title: "WORKATIONS",
    type: "read",
    route: "/app/dashboard/sales-dashboard/revenue/workation",
  },
  SALES_ALT_REVENUE: {
    value: "alt_revenue",
    title: "ALT REVENUE",
    type: "read",
    route: "/app/dashboard/sales-dashboard/revenue/alt-revenue",
  },

  //Data
  SALES_ASSET_LIST: {
    value: "asset_list",
    title: "ASSET LIST",
    type: "read",
    route: "/app/dashboard/sales-dashboard/data/asset-list",
  },
  SALES_MONTHLY_INVOICE_REPORTS: {
    value: "monthly_invoice_reports",
    title: "MONTHLY INVOICE REPORTS",
    type: "read",
    route: "/app/dashboard/sales-dashboard/data/monthly-invoice-reports",
  },
  SALES_VENDOR: {
    value: "vendor",
    title: "VENDOR",
    type: "read",
    route: "/app/dashboard/sales-dashboard/data/vendor",
  },
  //Settings
  SALES_BULK_UPLOAD: {
    value: "bulk_upload",
    title: "BULK UPLOAD",
    type: "read",
    route: "/app/dashboard/sales-dashboard/settings/bulk-upload",
  },
  SALES_SOPS: {
    value: "sops",
    title: "SOPS",
    type: "read",
    route: "/app/dashboard/sales-dashboard/settings/sops",
  },
  SALES_POLICIES: {
    value: "policies",
    title: "POLICIES",
    type: "read",
    route: "/app/dashboard/sales-dashboard/settings/policies",
  },

  // HR Module

  //Graphs
  HR_DEPARTMENT_EXPENSE: {
    value: "hr_department_expense",
    title: "HR DEPARTMENT EXPENSE",
    type: "read",
  },
  // cards
  HR_EMPLOYEE: { value: "employee", title: "EMPLOYEE", type: "read" },
  HR_COMPANY: { value: "company", title: "COMPANY", type: "read" },
  HR_FINANCE: { value: "hr_finance", title: "HR FINANCE", type: "read" },
  HR_MIX_BAG: { value: "hr_mix_bag", title: "HR MIX BAG", type: "read" },
  HR_DATA: { value: "hr_data", title: "HR DATA", type: "read" },
  HR_SETTINGS: { value: "hr_settings", title: "HR SETTINGS", type: "read" },

  //Data Card
  HR_EXPENSES: { value: "expenses", title: "EXPENSES", type: "read" },
  HR_AVERAGES: { value: "averages", title: "AVERAGES", type: "read" },

  //Tables
  HR_ANNUAL_KPA_VS_ACHIEVEMENTS: {
    value: "annual_kpa_vs_achievements",
    title: "ANNUAL KPA VS ACHIEVEMENTS",
    type: "read",
  },
  HR_ANNUAL_TASKS_VS_ACHIEVEMENTS: {
    value: "annual_tasks_vs_achievements",
    title: "ANNUAL TASKS VS ACHIEVEMENTS",
    type: "read",
  },
  HR_CURRENT_MONTH_BIRTHDAY_LIST: {
    value: "current_month_birthday_list",
    title: "CURRENT MONTH BIRTHDAY LIST",
    type: "read",
  },
  HR_CURRENT_MONTH_HOLIDAY_LIST: {
    value: "current_month_holiday_list",
    title: "CURRENT MONTH HOLIDAY LIST",
    type: "read",
  },

  // edit button
  HR_EMPLOYEE_EDIT: {
    value: "hr_employee_edit",
    title: "HR EMPLOYEE EDIT",
    type: "write",
    access: "button",
  },

  // Pie charts
  HR_EMPLOYEE_GENDER_DISTRIBUTION_PIE: {
    value: "gender_distribution_pie_chart",
    title: "GENDER DISTRIBUTION PIE CHART",
    type: "read",
  },
  HR_CITY_WISE_EMPLOYEES_PIE: {
    value: "city_wise_employees_pie_chart",
    title: "CITY WISE EMPLOYEES PIE CHART",
    type: "read",
  },

  //Employee
  HR_EMPLOYEE_LIST: {
    value: "employee_list",
    title: "EMPLOYEE LIST",
    type: "read",
    route: "/app/dashboard/HR-dashboard/employee/employee-list",
  },

  HR_PAST_EMPLOYEES: {
    value: "past_employees",
    title: "PAST EMPLOYEES",
    type: "read",
    route: "/app/dashboard/HR-dashboard/employees/past-employees",
  },

  HR_ATTENDANCE: {
    value: "attendance",
    title: "ATTENDANCE",
    type: "read",
    route: "/app/dashboard/HR-dashboard/attendance",
  },

  HR_LEAVES: {
    value: "leaves",
    title: "LEAVES",
    type: "read",
    route: "/app/dashboard/HR-dashboard/leaves",
  },

  HR_EMPLOYEE_ONBOARDING: {
    value: "employee_onboarding",
    title: "EMPLOYEE ONBOARDING",
    type: "read",
    route: "/app/dashboard/HR-dashboard/employees/employee-onboarding",
  },

  //Company
  HR_COMPANY_LOGO: {
    value: "company_logo",
    title: "COMPANY LOGO",
    type: "read",
    // route: "/app/dashboard/HR-dashboard/company/company-logo",
  },
  HR_COMPANY_HANDBOOK: {
    value: "company_handbook",
    title: "COMPANY HANDBOOK",
    type: "read",
    // route: "/app/dashboard/HR-dashboard/company/company-handbook",
  },
  HR_DEPARTMENTS: {
    value: "departments",
    title: "DEPARTMENTS",
    type: "read",
    route: "/app/dashboard/HR-dashboard/company/departments",
  },
  HR_WORK_LOCATIONS: {
    value: "work_locations",
    title: "WORK LOCATIONS",
    type: "read",
    route: "/app/dashboard/HR-dashboard/company/work-locations",
  },
  HR_HOLIDAYS: {
    value: "holidays",
    title: "HOLIDAYS",
    type: "read",
    route: "/app/dashboard/HR-dashboard/company/holidays",
  },
  HR_EVENTS: {
    value: "events",
    title: "EVENTS",
    type: "read",
    route: "/app/dashboard/HR-dashboard/company/events",
  },
  HR_COMPANY_POLICIES: {
    value: "company_policies",
    title: "COMPANY POLICIES",
    type: "read",
    route: "/app/dashboard/HR-dashboard/company/policies",
  },
  HR_COMPANY_SOPS: {
    value: "company_sops",
    title: "COMPANY SOPS",
    type: "read",
    route: "/app/dashboard/HR-dashboard/company/sops",
  },
  HR_EMPLOYEE_TYPES: {
    value: "employee_types",
    title: "EMPLOYEE TYPES",
    type: "read",
    route: "/app/dashboard/HR-dashboard/company/employee-type",
  },
  HR_SHIFTS: {
    value: "shifts",
    title: "SHIFTS",
    type: "read",
    route: "/app/dashboard/HR-dashboard/company/shifts",
  },
  HR_TEMPLATES: {
    value: "templates",
    title: "TEMPLATES",
    type: "read",
    route: "/app/dashboard/HR-dashboard/company/templates",
  },

  //Finance
  HR_BUDGET: {
    value: "budget",
    title: "BUDGET",
    type: "read",
    route: "/app/dashboard/HR-dashboard/finance/budget",
  },

  HR_PAYMENT_SCHEDULE: {
    value: "payment_schedule",
    title: "PAYMENT SCHEDULE",
    type: "read",
    route: "/app/dashboard/HR-dashboard/finance/payment-schedule",
  },

  HR_VOUCHER: {
    value: "voucher",
    title: "VOUCHER",
    type: "read",
    route: "/app/dashboard/HR-dashboard/finance/voucher",
  },

  HR_PAYROLL: {
    value: "payroll",
    title: "PAYROLL",
    type: "read",
    route: "/app/dashboard/HR-dashboard/finance/payroll",
  },

  //Data
  HR_JOB_APPLICATION_LIST: {
    value: "job_application_list",
    title: "JOB APPLICATION LIST",
    type: "read",
    route: "/app/dashboard/HR-dashboard/data/job-application-list",
  },

  HR_PAYROLL_REPORTS: {
    value: "payroll_reports",
    title: "PAYROLL REPORTS",
    type: "read",
    route: "/app/dashboard/HR-dashboard/data/payroll-reports",
  },

  HR_ASSET_LIST: {
    value: "asset_list",
    title: "ASSET LIST",
    type: "read",
    route: "/app/dashboard/HR-dashboard/data/asset-list",
  },

  HR_MONTHLY_INVOICE_REPORTS: {
    value: "monthly_invoice_reports",
    title: "MONTHLY INVOICE REPORTS",
    type: "read",
    route: "/app/dashboard/HR-dashboard/data/monthly-invoice-reports",
  },

  HR_VENDOR: {
    value: "vendor",
    title: "VENDOR",
    type: "read",
    route: "/app/dashboard/HR-dashboard/data/vendor",
  },
  //Settings
  HR_BULK_UPLOAD: {
    value: "bulk_upload",
    title: "BULK UPLOAD",
    type: "read",
    route: "/app/dashboard/hr-dashboard/settings/bulk-upload",
  },
  HR_SOPS: {
    value: "sops",
    title: "SOPS",
    type: "read",
    route: "/app/dashboard/hr-dashboard/settings/sops",
  },
  HR_POLICIES: {
    value: "policies",
    title: "POLICIES",
    type: "read",
    route: "/app/dashboard/hr-dashboard/settings/policies",
  },

  // 🟡 Admin Dashboard
  ADMIN_ANNUAL_EXPENSES: {
    value: "annual_expenses",
    title: "ANNUAL EXPENSES",
    type: "read",
  },
  ADMIN_INVENTORY: { value: "inventory", title: "INVENTORY", type: "read" },
  ADMIN_FINANCE: { value: "finance", title: "FINANCE", type: "read" },
  ADMIN_MIX_BAG: { value: "mix_bag", title: "MIX BAG", type: "read" },
  ADMIN_DATA: { value: "data", title: "DATA", type: "read" },
  ADMIN_SETTINGS: { value: "settings", title: "SETTINGS", type: "read" },
  // 🟡 Admin Graphs
  ADMIN_DEPARTMENT_EXPENSE: {
    value: "department_expense",
    title: "DEPARTMENT EXPENSE",
    type: "read",
  },
  // 🟡 Admin Data Cards
  ADMIN_TOTAL_ADMIN_OFFICES: {
    value: "total_admin_offices",
    title: "TOTAL ADMIN OFFICES",
    type: "read",
  },
  ADMIN_MONTHLY_DUE_TASKS: {
    value: "monthly_due_tasks",
    title: "MONTHLY DUE TASKS",
    type: "read",
  },
  ADMIN_MONTHLY_EXPENSE: {
    value: "monthly_expense",
    title: "MONTHLY EXPENSE",
    type: "read",
  },
  ADMIN_TOP_EXECUTIVE: {
    value: "top_executive",
    title: "TOP EXECUTIVE",
    type: "read",
  },
  ADMIN_EXPENSE_PER_SQFT: {
    value: "expense_per_sqft",
    title: "EXPENSE PER SQFT",
    type: "read",
  },
  ADMIN_ELECTRICITY_EXPENSE_PER_SQFT: {
    value: "electricity_expense_per_sqft",
    title: "ELECTRICITY EXPENSE PER SQFT",
    type: "read",
  },
  // 🟡 Admin Tables
  ADMIN_WEEKLY_EXECUTIVE_SHIFT_TIMING: {
    value: "weekly_executive_shift_timing",
    title: "WEEKLY EXECUTIVE SHIFT TIMING",
    type: "read",
  },
  ADMIN_UPCOMING_EVENTS_LIST: {
    value: "upcoming_events_list",
    title: "UPCOMING EVENTS LIST",
    type: "read",
  },
  ADMIN_UPCOMING_CLIENT_MEMBER_BIRTHDAYS: {
    value: "upcoming_client_member_birthdays",
    title: "UPCOMING CLIENT MEMBER BIRTHDAYS",
    type: "read",
  },
  ADMIN_UPCOMING_CLIENT_ANNIVERSARIES: {
    value: "upcoming_client_anniversaries",
    title: "UPCOMING CLIENT ANNIVERSARIES",
    type: "read",
  },
  ADMIN_NEWLY_JOINED_HOUSE_KEEPING_MEMBERS: {
    value: "newly_joined_house_keeping_members",
    title: "NEWLY JOINED HOUSE KEEPING MEMBERS",
    type: "read",
  },
  // 🟡 Admin Pie Charts
  ADMIN_UNIT_WISE_DUE_TASKS: {
    value: "unit_wise_due_tasks",
    title: "UNIT WISE DUE TASKS",
    type: "read",
  },
  ADMIN_EXECUTIVE_WISE_DUE_TASKS: {
    value: "executive_wise_due_tasks",
    title: "EXECUTIVE WISE DUE TASKS",
    type: "read",
  },
  ADMIN_TOTAL_DESKS_COMPANY_WISE: {
    value: "total_desks_company_wise",
    title: "TOTAL DESKS COMPANY WISE",
    type: "read",
  },
  ADMIN_BIOMETRICS_GENDER_DATA: {
    value: "biometrics_gender_data",
    title: "BIOMETRICS GENDER DATA",
    type: "read",
  },
  // Finance
  ADMIN_BUDGET: {
    value: "budget",
    title: "BUDGET",
    type: "read",
    route: "/app/dashboard/admin-dashboard/finance/budget",
  },

  ADMIN_PAYMENT_SCHEDULE: {
    value: "payment_schedule",
    title: "PAYMENT SCHEDULE",
    type: "read",
    route: "/app/dashboard/admin-dashboard/finance/payment-schedule",
  },

  ADMIN_VOUCHER: {
    value: "voucher",
    title: "VOUCHER",
    type: "read",
    route: "/app/dashboard/admin-dashboard/finance/voucher",
  },

  // Housekeeping Members
  ADMIN_HOUSEKEEPING_MEMBERS_LIST: {
    value: "housekeeping_members_list",
    title: "HOUSEKEEPING MEMBERS LIST",
    type: "read",
    route:
      "/app/dashboard/admin-dashboard/mix-bag/housekeeping-members/members-list",
  },
  ADMIN_HOUSEKEEPING_MEMBER_ONBOARD: {
    value: "housekeeping_member_onboard",
    title: "HOUSEKEEPING MEMBER ONBOARD",
    type: "read",
    route:
      "/app/dashboard/admin-dashboard/mix-bag/housekeeping-members/member-onboard",
  },
  ADMIN_HOUSEKEEPING_ASSIGN_ROTATION: {
    value: "housekeeping_assign_rotation",
    title: "HOUSEKEEPING ASSIGN ROTATION",
    type: "read",
    route:
      "/app/dashboard/admin-dashboard/mix-bag/housekeeping-members/member-schedule",
  },

  // Clients Members Data
  ADMIN_CLIENT_MEMBERS_DATA: {
    value: "client_members_data",
    title: "CLIENT MEMBERS DATA",
    type: "read",
    route:
      "/app/dashboard/admin-dashboard/mix-bag/client-members/client-members-data",
  },
  ADMIN_CLIENT_MEMBERS_ONBOARD: {
    value: "client_members_onboard",
    title: "CLIENT MEMBERS ONBOARD",
    type: "read",
    route:
      "/app/dashboard/admin-dashboard/mix-bag/client-members/client-members-onboard",
  },

  // Data
  ADMIN_ELECTRICITY_EXPENSES: {
    value: "electricity_expenses",
    title: "ELECTRICITY EXPENSES",
    type: "read",
    route:
      "/app/dashboard/admin-dashboard/mix-bag/infra-expenses/electricity-expenses",
  },
  ADMIN_ASSET_LIST: {
    value: "asset_list",
    title: "ASSET LIST",
    type: "read",
    route: "/app/dashboard/admin-dashboard/mix-bag/infra-expenses/asset-list",
  },
  ADMIN_MONTHLY_INVOICE_REPORTS: {
    value: "monthly_invoice_reports",
    title: "MONTHLY INVOICE REPORTS",
    type: "read",
    route:
      "/app/dashboard/admin-dashboard/mix-bag/infra-expenses/monthly-invoice-reports",
  },
  ADMIN_VENDOR: {
    value: "vendor",
    title: "VENDOR",
    type: "read",
    route: "/app/dashboard/admin-dashboard/mix-bag/infra-expenses/vendor",
  },
  //Settings
  ADMIN_MODULE_BULK_UPLOAD: {
    value: "bulk_upload",
    title: "BULK UPLOAD",
    type: "read",
    route: "/app/dashboard/admin-dashboard/settings/bulk-upload",
  },
  ADMIN_MODULE_SOPS: {
    value: "sops",
    title: "SOPS",
    type: "read",
    route: "/app/dashboard/admin-dashboard/settings/sops",
  },
  ADMIN_MODULE_POLICIES: {
    value: "policies",
    title: "POLICIES",
    type: "read",
    route: "/app/dashboard/admin-dashboard/settings/policies",
  },

  // 🟢 Maintenance Dashboard

  // 🟢 Maintenance Graphs
  MAINTENANCE_DEPARTMENT_EXPENSES: {
    value: "department_expenses",
    title: "DEPARTMENT EXPENSES",
    type: "read",
  },

  // 🟢 Maintenance Nav Cards
  MAINTENANCE_ANNUAL_EXPENSES: {
    value: "annual_expenses",
    title: "ANNUAL EXPENSES",
    type: "read",
  },
  MAINTENANCE_INVENTORY: {
    value: "inventory",
    title: "INVENTORY",
    type: "read",
  },
  MAINTENANCE_FINANCE: { value: "finance", title: "FINANCE", type: "read" },
  MAINTENANCE_MIX_BAG: { value: "mix_bag", title: "MIX BAG", type: "read" },
  MAINTENANCE_DATA: { value: "data", title: "DATA", type: "read" },
  MAINTENANCE_SETTINGS: { value: "settings", title: "SETTINGS", type: "read" },
  // 🟢 Maintenance Data Cards
  MAINTENANCE_OFFICES_UNDER_MANAGEMENT: {
    value: "offices_under_management",
    title: "OFFICES UNDER MANAGEMENT",
    type: "read",
  },
  MAINTENANCE_MONTHLY_DUE_TASKS: {
    value: "monthly_due_tasks",
    title: "MONTHLY DUE TASKS",
    type: "read",
  },
  MAINTENANCE_MONTHLY_EXPENSE: {
    value: "monthly_expense",
    title: "MONTHLY EXPENSE",
    type: "read",
  },
  MAINTENANCE_EXPENSE_PER_SQFT: {
    value: "expense_per_sqft",
    title: "EXPENSE PER SQFT",
    type: "read",
  },
  MAINTENANCE_ASSETS_UNDER_MANAGEMENT: {
    value: "assets_under_management",
    title: "ASSETS UNDER MANAGEMENT",
    type: "read",
  },
  MAINTENANCE_MONTHLY_KPA: {
    value: "monthly_kpa",
    title: "MONTHLY KPA",
    type: "read",
  },

  //Tables
  MAINTENANCE_TOP_HIGH_PRIORITY_TASKS: {
    value: "top_high_priority_tasks",
    title: "TOP HIGH PRIORITY TASKS",
    type: "read",
  },
  MAINTENANCE_WEEKLY_EXECUTIVE_SHIFT_TIMING: {
    value: "weekly_executive_shift_timing",
    title: "WEEKLY EXECUTIVE SHIFT TIMING",
    type: "read",
  },

  //Pie Charts
  MAINTENANCE_CATEGORY_WISE_MAINTENANCE: {
    value: "category_wise_maintenance",
    title: "CATEGORY WISE MAINTENANCE",
    type: "read",
  },
  MAINTENANCE_DUE_MAINTENANCE: {
    value: "due_maintenance",
    title: "DUE MAINTENANCE",
    type: "read",
  },
  MAINTENANCE_UNIT_WISE_MAINTENANCE: {
    value: "unit_wise_maintenance",
    title: "UNIT WISE MAINTENANCE",
    type: "read",
  },
  MAINTENANCE_EXECUTION_CHANNEL: {
    value: "execution_channel",
    title: "EXECUTION CHANNEL",
    type: "read",
  },
  MAINTENANCE_AVERAGE_MONTHLY_DUE: {
    value: "average_monthly_due",
    title: "AVERAGE MONTHLY DUE",
    type: "read",
  },
  MAINTENANCE_AVERAGE_YEARLY_DUE: {
    value: "average_yearly_due",
    title: "AVERAGE YEARLY DUE",
    type: "read",
  },

  //Finance
  MAINTENANCE_BUDGET: {
    value: "budget",
    title: "BUDGET",
    type: "read",
    route: "/app/dashboard/maintenance-dashboard/finance/budget",
  },

  MAINTENANCE_PAYMENT_SCHEDULE: {
    value: "payment_schedule",
    title: "PAYMENT SCHEDULE",
    type: "read",
    route: "/app/dashboard/maintenance-dashboard/finance/payment-schedule",
  },

  MAINTENANCE_VOUCHER: {
    value: "voucher",
    title: "VOUCHER",
    type: "read",
    route: "/app/dashboard/maintenance-dashboard/finance/voucher",
  },

  //Data
  MAINTENANCE_AMC_RECORDS: {
    value: "amc_records",
    title: "AMC RECORDS",
    type: "read",
    route: "/app/dashboard/maintenance-dashboard/data/amc-records",
  },

  MAINTENANCE_ASSET_LIST: {
    value: "asset_list",
    title: "ASSET LIST",
    type: "read",
    route: "/app/dashboard/maintenance-dashboard/data/asset-list",
  },

  MAINTENANCE_MONTHLY_INVOICE_REPORTS: {
    value: "monthly_invoice_reports",
    title: "MONTHLY INVOICE REPORTS",
    type: "read",
    route: "/app/dashboard/maintenance-dashboard/data/monthly-invoice-reports",
  },

  MAINTENANCE_VENDOR: {
    value: "vendor",
    title: "VENDOR",
    type: "read",
    route: "/app/dashboard/maintenance-dashboard/data/vendor",
  },

  //Settings
  MAINTENANCE_BULK_UPLOAD: {
    value: "bulk_upload",
    title: "BULK UPLOAD",
    type: "read",
    route: "/app/dashboard/maintenance-dashboard/settings/bulk-upload",
  },

  MAINTENANCE_SOPS: {
    value: "sops",
    title: "SOPS",
    type: "read",
    route: "/app/dashboard/maintenance-dashboard/settings/sops",
  },

  MAINTENANCE_POLICIES: {
    value: "policies",
    title: "POLICIES",
    type: "read",
    route: "/app/dashboard/maintenance-dashboard/settings/policies",
  },

  // 🔵 IT Dashboard

  // 🔵 IT Graphs
  IT_DEPARTMENT_EXPENSES: {
    value: "it_department_expenses",
    title: "IT DEPARTMENT EXPENSES",

    type: "read",
    access: "page",
  },

  // 🔵 IT Nav Cards
  IT_ANNUAL_EXPENSES: {
    value: "it_annual_expenses",
    title: "IT ANNUAL EXPENSES",

    type: "read",
    access: "page",
  },
  IT_INVENTORY: {
    value: "it_inventory",
    title: "IT INVENTORY",
    type: "read",
    access: "page",
  },
  IT_FINANCE: {
    value: "it_finance",
    title: "IT FINANCE",
    type: "read",
    access: "page",
  },
  IT_MIX_BAG: {
    value: "it_mix_bag",
    title: "IT MIX BAG",
    type: "read",
    access: "page",
  },
  IT_DATA: { value: "it_data", title: "IT DATA", type: "read", access: "page" },
  IT_SETTINGS: {
    value: "it_settings",
    title: "IT SETTINGS",
    type: "write",
    access: "page",
  },

  // 🔵 IT Data Cards
  IT_OFFICES_UNDER_MANAGEMENT: {
    value: "offices_under_management",
    title: "OFFICES UNDER MANAGEMENT",
    type: "read",
  },
  IT_DUE_TASKS_THIS_MONTH: {
    value: "due_tasks_this_month",
    title: "DUE TASKS THIS MONTH",
    type: "read",
  },
  IT_INTERNET_EXPENSE_PER_SQFT: {
    value: "internet_expense_per_sqft",
    title: "INTERNET EXPENSE PER SQFT",
    type: "read",
  },
  IT_EXPENSE_PER_SQFT: {
    value: "expense_per_sqft",
    title: "EXPENSE PER SQFT",
    type: "read",
  },
  IT_MONTHLY_EXPENSE: {
    value: "monthly_expense",
    title: "MONTHLY EXPENSE",
    type: "read",
  },
  IT_MONTHLY_KPA: { value: "monthly_kpa", title: "MONTHLY KPA", type: "read" },

  // 🔵 IT Tables
  IT_TOP_10_HIGH_PRIORITY_DUE_TASKS: {
    value: "top_10_high_priority_due_tasks",
    title: "TOP 10 HIGH PRIORITY DUE TASKS",
    type: "read",
  },
  IT_WEEKLY_EXECUTIVE_SHIFT_TIMING: {
    value: "weekly_executive_shift_timing",
    title: "WEEKLY EXECUTIVE SHIFT TIMING",
    type: "read",
  },

  // 🔵 IT Pie Charts

  IT_UNIT_WISE_DUE_TASKS: {
    value: "unit_wise_due_tasks",
    title: "UNIT WISE DUE TASKS",
    type: "read",
  },
  IT_EXECUTIVE_WISE_DUE_TASKS: {
    value: "executive_wise_due_tasks",
    title: "EXECUTIVE WISE DUE TASKS",
    type: "read",
  },
  IT_UNIT_WISE_IT_EXPENSES: {
    value: "unit_wise_it_expenses",
    title: "UNIT WISE IT EXPENSES",
    type: "read",
  },
  IT_BIOMETRICS_GENDER_DATA: {
    value: "biometrics_gender_data",
    title: "BIOMETRICS GENDER DATA",
    type: "read",
  },
  IT_CLIENT_WISE_COMPLAINTS: {
    value: "client_wise_complaints",
    title: "CLIENT WISE COMPLAINTS",
    type: "read",
  },
  IT_TYPE_OF_IT_COMPLAINTS: {
    value: "type_of_it_complaints",
    title: "TYPE OF IT COMPLAINTS",
    type: "read",
  },

  //Finance
  IT_BUDGET: {
    value: "budget",
    title: "BUDGET",
    type: "read",
    route: "/app/dashboard/IT-dashboard/finance/budget",
  },

  IT_PAYMENT_SCHEDULE: {
    value: "payment_schedule",
    title: "PAYMENT SCHEDULE",
    type: "read",
    route: "/app/dashboard/IT-dashboard/finance/payment-schedule",
  },

  IT_VOUCHER: {
    value: "voucher",
    title: "VOUCHER",
    type: "read",
    route: "/app/dashboard/IT-dashboard/finance/voucher",
  },

  //Data
  IT_AMC_RECORDS: {
    value: "amc_records",
    title: "AMC RECORDS",
    type: "read",
    route: "/app/dashboard/IT-dashboard/data/amc-records",
  },
  IT_ASSET_LIST: {
    value: "asset_list",
    title: "ASSET LIST",
    type: "read",
    route: "/app/dashboard/IT-dashboard/data/asset-list",
  },
  IT_MONTHLY_INVOICE_REPORTS: {
    value: "monthly_invoice_reports",
    title: "MONTHLY INVOICE REPORTS",
    type: "read",
    route: "/app/dashboard/IT-dashboard/data/monthly-invoice-reports",
  },
  IT_VENDOR: {
    value: "vendor",
    title: "VENDOR",
    type: "read",
    route: "/app/dashboard/IT-dashboard/data/vendor",
  },
  //Settings
  IT_BULK_UPLOAD: {
    value: "bulk_upload",
    title: "BULK UPLOAD",
    type: "read",
    route: "/app/dashboard/IT-dashboard/settings/bulk-upload",
  },

  IT_SOPS: {
    value: "sops",
    title: "SOPS",
    type: "read",
    route: "/app/dashboard/IT-dashboard/settings/sops",
  },

  IT_POLICIES: {
    value: "policies",
    title: "POLICIES",
    type: "read",
    route: "/app/dashboard/IT-dashboard/settings/policies",
  },

  // 🟣 Frontend Dashboard

  //Graphs
  FRONTEND_SITE_VISITORS: {
    value: "site_visitors",
    title: "SITE VISITORS",
    type: "read",
  },
  FRONTEND_DEPARTMENT_EXPENSE: {
    value: "department_expense",
    title: "DEPARTMENT EXPENSE",
    type: "read",
  },
  FRONTEND_WEBSITE_ISSUES_RAISED: {
    value: "website_issues_raised",
    title: "WEBSITE ISSUES RAISED",
    type: "read",
  },

  //Nav cards
  FRONTEND_CREATE_WEBSITE: {
    value: "create_website",
    title: "CREATE WEBSITE",
    type: "read",
    access: "page",
  },
  FRONTEND_EDIT_WEBSITE: {
    value: "edit_website",
    title: "EDIT WEBSITE",
    type: "read",
    access: "page",
  },
  FRONTEND_NEW_THEMES: {
    value: "new_themes",
    title: "NEW THEMES",
    type: "read",
    access: "page",
  },
  FRONTEND_FINANCE: {
    value: "finance",
    title: "FINANCE",
    type: "read",
    access: "page",
  },
  FRONTEND_DATA: { value: "data", title: "DATA", type: "read", access: "page" },
  FRONTEND_SETTINGS: {
    value: "settings",
    title: "SETTINGS",
    type: "write",
    access: "page",
  },

  //Pie charts
  FRONTEND_NATION_WISE_SITE_VISITORS: {
    value: "nation_wise_site_visitors",
    title: "NATION WISE SITE VISITORS",
    type: "read",
  },
  FRONTEND_STATE_WISE_SITE_VISITORS: {
    value: "state_wise_site_visitors",
    title: "STATE WISE SITE VISITORS",
    type: "read",
  },
  //finance
  FRONTEND_BUDGET: {
    value: "budget",
    title: "BUDGET",
    type: "read",
    route: "/app/dashboard/frontend-dashboard/finance/budget",
  },

  FRONTEND_PAYMENT_SCHEDULE: {
    value: "payment_schedule",
    title: "PAYMENT SCHEDULE",
    type: "read",
    route: "/app/dashboard/frontend-dashboard/finance/payment-schedule",
  },

  FRONTEND_VOUCHER: {
    value: "voucher",
    title: "VOUCHER",
    type: "read",
    route: "/app/dashboard/frontend-dashboard/finance/voucher",
  },

  //Data
  FRONTEND_LEADS: {
    value: "leads",
    title: "LEADS",
    type: "read",
    route: "/app/dashboard/frontend-dashboard/data/leads",
  },
  FRONTEND_WEBSITE_ISSUE_REPORTS: {
    value: "website_issue_reports",
    title: "WEBSITE ISSUE REPORTS",
    type: "read",
    route: "/app/dashboard/frontend-dashboard/data/website-issue-reports",
  },
  FRONTEND_ASSET_LIST: {
    value: "asset_list",
    title: "ASSET LIST",
    type: "read",
    route: "/app/dashboard/frontend-dashboard/data/asset-list",
  },
  FRONTEND_MONTHLY_INVOICE_REPORTS: {
    value: "monthly_invoice_reports",
    title: "MONTHLY INVOICE REPORTS",
    type: "read",
    route: "/app/dashboard/frontend-dashboard/data/monthly-invoice-reports",
  },
  FRONTEND_VENDOR: {
    value: "vendor",
    title: "VENDOR",
    type: "read",
    route: "/app/dashboard/frontend-dashboard/data/vendor",
  },

  //Settings
  FRONTEND_BULK_UPLOAD: {
    value: "bulk_upload",
    title: "BULK UPLOAD",
    type: "read",
    route: "/app/dashboard/frontend-dashboard/settings/bulk-upload",
  },

  FRONTEND_SOPS: {
    value: "sops",
    title: "SOPS",
    type: "read",
    route: "/app/dashboard/frontend-dashboard/settings/sops",
  },

  FRONTEND_POLICIES: {
    value: "policies",
    title: "POLICIES",
    type: "read",
    route: "/app/dashboard/frontend-dashboard/settings/policies",
  },

  // Sidebar
  // Sidebar
  SIDEBAR_DASHBOARD: {
    value: "sidebar_dashboard",
    title: "DASHBOARD",
    type: "read",
    access: "page",
  },
  SIDEBAR_FINANCE_DASHBOARD: {
    value: "sidebar_finance_dashboard",
    title: "FINANCE DASHBOARD",
    type: "read",
    access: "page",
  },
  SIDEBAR_SALES_DASHBOARD: {
    value: "sidebar_sales_dashboard",
    title: "SALES DASHBOARD",
    type: "read",
    access: "page",
  },
  SIDEBAR_HR_DASHBOARD: {
    value: "sidebar_hr_dashboard",
    title: "HR DASHBOARD",
    type: "read",
    access: "page",
  },
  SIDEBAR_FRONTEND_DASHBOARD: {
    value: "sidebar_frontend_dashboard",
    title: "FRONTEND DASHBOARD",
    type: "read",
    access: "page",
  },
  SIDEBAR_ADMIN_DASHBOARD: {
    value: "sidebar_admin_dashboard",
    title: "ADMIN DASHBOARD",
    type: "read",
    access: "page",
  },
  SIDEBAR_MAINTENANCE_DASHBOARD: {
    value: "sidebar_maintenance_dashboard",
    title: "MAINTENANCE DASHBOARD",
    type: "read",
    access: "page",
  },
  SIDEBAR_IT_DASHBOARD: {
    value: "sidebar_it_dashboard",
    title: "IT DASHBOARD",
    type: "read",
    access: "page",
  },
  SIDEBAR_CAFE_DASHBOARD: {
    value: "sidebar_cafe_dashboard",
    title: "CAFE DASHBOARD",
    type: "read",
    access: "page",
  },
  SIDEBAR_TICKETS: {
    value: "sidebar_tickets",
    title: "TICKETS",
    type: "read",
    access: "page",
  },
  SIDEBAR_MEETINGS: {
    value: "sidebar_meetings",
    title: "MEETINGS",
    type: "read",
    access: "page",
  },
  SIDEBAR_TASKS: {
    value: "sidebar_tasks",
    title: "TASKS",
    type: "read",
    access: "page",
  },
  SIDEBAR_PERFORMANCE: {
    value: "sidebar_performance",
    title: "PERFORMANCE",
    type: "read",
    access: "page",
  },
  SIDEBAR_VISITORS: {
    value: "sidebar_visitors",
    title: "VISITORS",
    type: "read",
    access: "page",
  },
  SIDEBAR_CALENDAR: {
    value: "sidebar_calendar",
    title: "CALENDAR",
    type: "read",
    access: "page",
  },
  SIDEBAR_ACCESS: {
    value: "sidebar_access",
    title: "ACCESS",
    type: "read",
    access: "page",
  },
  SIDEBAR_NOTIFICATIONS: {
    value: "sidebar_notifications",
    title: "NOTIFICATIONS",
    type: "read",
    access: "page",
  },
  SIDEBAR_PROFILE: {
    value: "sidebar_profile",
    title: "PROFILE",
    type: "read",
    access: "page",
  },
  SIDEBAR_REPORTS: {
    value: "sidebar_reports",
    title: "REPORTS",
    type: "read",
    access: "page",
  },
  SIDEBAR_ASSETS: {
    value: "sidebar_assets",
    title: "ASSETS",
    type: "read",
    access: "page",
  },
  SIDEBAR_CHAT: {
    value: "sidebar_chat",
    title: "CHAT",
    type: "read",
    access: "page",
  },

  ACCESS_PERMISSIONS: {
    value: "access_permissions",
    title: "ACCESS PERMISSIONS",
    access: "page",
    type: "write",
  },
};
