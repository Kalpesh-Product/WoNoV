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
  FINANCE_CASHFLOW: { value: "finance_cashflow_card", title: "CASHFLOW", type: "read" },
  FINANCE_FINANCE: {
    value: "finance_finance_card",
    title: "FINANCE FINANCE",
    type: "read",
  },
  FINANCE_BILLING: { value: "finance_billing_card", title: "BILLING", type: "read" },
  FINANCE_MIX_BAG: {
    value: "finance_mix_bag_card",
    title: "FINANCE MIX BAG",
    type: "read",
  },

  FINANCE_DIRECTORS_COMPANY_KYC_MIX_BAG: {
    value: "finance_directors_company_kyc",
    title: "FINANCE DIRECTORS COMPANY KYC",
    type: "read",
    route: "/app/dashboard/finance-dashboard/mix-bag/directors-company-KYC",
  },
  FINANCE_COMPLIANCE_DOCUMENTS_MIX_BAG: {
    value: "finance_compliance_documents",
    title: "FINANCE COMPLIANCE DOCUMENTS",
    type: "read",
    route: "/app/dashboard/finance-dashboard/mix-bag/compliance-documents",
  },
  FINANCE_LANDLORD_AGREEMENTS_MIX_BAG: {
    value: "finance_landlord_agreements",
    title: "FINANCE LANDLORD AGREEMENTS",
    type: "read",
    route: "/app/dashboard/finance-dashboard/mix-bag/landlord-agreements",
  },
  FINANCE_CLIENT_AGREEMENTS_MIX_BAG: {
    value: "finance_client_agreements",
    title: "FINANCE CLIENT AGREEMENTS",
    type: "read",
    route: "/app/dashboard/finance-dashboard/mix-bag/client-agreements",
  },
  FINANCE_MANAGE_MEETINGS_MIX_BAG: {
    value: "finance_manage_meetings",
    title: "FINANCE MANAGE MEETINGS",
    type: "read",
    route: "/app/dashboard/finance-dashboard/mix-bag/manage-meetings",
  },
  FINANCE_DATA: { value: "finance_data_card", title: "FINANCE DATA", type: "read" },
  FINANCE_SETTINGS: {
    value: "finance_settings_card",
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
    value: "finance_cashflow_projections_tab",
    title: "CASHFLOW PROJECTIONS",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/cashflow/projections",
  },
  FINANCE_CASHFLOW_HISTORICAL: {
    value: "finance_historical_pnl_tab",
    title: "HISTORICAL PNL",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/cashflow/historical-P&L",
  },

  FINANCE_BUDGET: {
    value: "finance_budget_tab",
    title: "FINANCE BUDGET",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/finance/budget",
  },
  FINANCE_PAYMENT_SCHEDULE: {
    value: "finance_payment_schedule_tab",
    title: "FINANCE PAYMENT SCHEDULE",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/finance/payment-schedule",
  },
  FINANCE_VOUCHER: {
    value: "finance_voucher_tab",
    title: "FINANCE VOUCHER",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/finance/voucher",
  },
  FINANCE_DEPT_WISE_BUDGET: {
    value: "finance_dept_wise_budget_tab",
    title: "DEPT WISE BUDGET",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/finance/dept-wise-budget",
  },
  FINANCE_COLLECTIONS: {
    value: "finance_collections_tab",
    title: "COLLECTIONS",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/finance/collections",
  },
  FINANCE_STATUTORY_PAYMENTS: {
    value: "finance_statutory_payments_tab",
    title: "FINANCE STATUTORY PAYMENTS",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/finance/statutory-payments",
  },
  FINANCE_LANDLORD_PAYMENTS: {
    value: "finance_landlord_payments_tab",
    title: "FINANCE LANDLORD PAYMENTS",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/finance/landlord-payments",
  },
  FINANCE_MEETINGS_EXTERNAL: {
    value: "finance_meetings_external_tab",
    title: "FINANCE MEETINGS EXTERNAL",
    type: "read",
    access: "page",
    route:
      "/app/dashboard/finance-dashboard/mix-bag/manage-meetings/external-meetings",
  },
  FINANCE_MEETINGS_INTERNAL: {
    value: "finance_meetings_internal_tab",
    title: "FINANCE MEETINGS INTERNAL",
    type: "read",
    access: "page",
    route:
      "/app/dashboard/finance-dashboard/mix-bag/manage-meetings/internal-meetings",
  },

  FINANCE_BILLING_CLIENT_INVOICE: {
    value: "finance_client_invoice_tab",
    title: "CLIENT INVOICE",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/billing/client-invoice",
  },
  FINANCE_BILLING_DEPARTMENT_INVOICE: {
    value: "finance_department_invoice_tab",
    title: "DEPARTMENT INVOICE",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/billing/department-invoice",
  },
  FINANCE_BILLING_PENDING_APPROVALS: {
    value: "finance_pending_approvals_tab",
    title: "FINANCE PENDING APPROVALS",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/billing/pending-approvals",
  },
  FINANCE_BILLING_VOUCHER_HISTORY: {
    value: "finance_voucher_history_tab",
    title: "FINANCE VOUCHER HISTORY",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/billing/voucher-history",
  },

  FINANCE_DATA_ASSET_LIST: {
    value: "finance_asset_list_tab",
    title: "FINANCE ASSET LIST",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/data/asset-list",
  },
  FINANCE_DATA_MONTHLY_INVOICE_REPORTS: {
    value: "finance_monthly_invoice_reports_tab",
    title: "FINANCE MONTHLY INVOICE REPORTS",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/data/monthly-invoice-reports",
  },
  FINANCE_DATA_VENDORS: {
    value: "finance_data_vendors_tab",
    title: "FINANCE DATA VENDORS",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/data/vendor",
  },

  FINANCE_SETTINGS_BULK_UPLOAD: {
    value: "finance_bulk_upload_tab",
    title: "FINANCE BULK UPLOAD",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/settings/bulk-upload",
  },
  FINANCE_SETTINGS_SOPS: {
    value: "finance_sops_tab",
    title: "FINANCE SOPS",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/settings/sops",
  },
  FINANCE_SETTINGS_POLICIES: {
    value: "finance_policies_tab",
    title: "FINANCE POLICIES",
    type: "read",
    access: "page",
    route: "/app/dashboard/finance-dashboard/settings/policies",
  },

  // 🔷 Sales Dashboard

  SALES_TURNOVER: { value: "sales_turnover_card", title: "TURNOVER", type: "read" },
  SALES_FINANCE: { value: "sales_finance_card", title: "FINANCE", type: "read" },
  SALES_MIX_BAG: { value: "sales_mix_bag_card", title: "MIX BAG", type: "read" },

  SALES_INVENTORY_MIX_BAG: { value: "sales_inventory_mix_bag_card", title: "INVENTORY", type: "read", route: "/app/dashboard/sales-dashboard/mix-bag/inventory" },
  SALES_REVENUE_MIX_BAG: { value: "sales_revenue_mix_bag_card", title: "REVENUE", type: "read", route: "/app/dashboard/sales-dashboard/mix-bag/revenue" },
  SALES_CLIENTS_MIX_BAG: { value: "sales_clients_mix_bag_card", title: "CLIENTS", type: "read", route: "/app/dashboard/sales-dashboard/mix-bag/clients" },
  SALES_DESKS_MIX_BAG: { value: "sales_desks_mix_bag_card", title: "DESKS", type: "read", route: "/app/dashboard/sales-dashboard/mix-bag/desks" },
  SALES_MANAGE_UNITS_MIX_BAG: { value: "sales_manage_units_mix_bag_card", title: "MANAGE UNITS", type: "read", route: "/app/dashboard/sales-dashboard/mix-bag/manage-units" },

  SALES_DATA: { value: "sales_data_card", title: "DATA", type: "read" },
  SALES_SETTINGS: { value: "sales_settings_card", title: "SETTINGS", type: "read" },

  // 🔷 Sales Nav Cards
  SALES_REVENUE: { value: "sales_revenue_card", title: "REVENUE", type: "read" },
  SALES_KEY_STATS: { value: "sales_key_stats_card", title: "KEY STATS", type: "read" },
  SALES_AVERAGE: { value: "sales_average_card", title: "AVERAGE", type: "read" },

  // 🔷 Sales graphs
  SALES_DEPARTMENT_REVENUES: {
    value: "sales_department_revenues_card",
    title: "DEPARTMENT REVENUES",
    type: "read",
  },
  SALES_MONTHLY_UNIQUE_LEADS: {
    value: "sales_monthly_unique_leads_chart",
    title: "MONTHLY UNIQUE LEADS",
    type: "read",
  },
  SALES_SOURCING_CHANNELS: {
    value: "sales_sourcing_channels_chart",
    title: "SOURCING CHANNELS",
    type: "read",
  },

  // 🔷 Sales Chart Permissions
  SALES_SECTOR_WISE_OCCUPANCY: {
    value: "sales_sector_wise_occupancy_card",
    title: "SECTOR WISE OCCUPANCY",
    type: "read",
  },
  SALES_CLIENT_WISE_OCCUPANCY: {
    value: "sales_client_wise_occupancy_card",
    title: "CLIENT WISE OCCUPANCY",
    type: "read",
  },
  SALES_CLIENT_GENDER_WISE_DATA: {
    value: "sales_client_gender_wise_data_card",
    title: "CLIENT GENDER WISE DATA",
    type: "read",
  },
  SALES_INDIA_WISE_MEMBERS: {
    value: "sales_india_wise_members_card",
    title: "INDIA WISE MEMBERS",
    type: "read",
  },
  SALES_CURRENT_MONTH_CLIENT_ANNIVERSARY: {
    value: "sales_current_month_client_anniversary_card",
    title: "CURRENT MONTH CLIENT ANNIVERSARY",
    type: "read",
  },
  SALES_CLIENT_MEMBER_BIRTHDAY: {
    value: "sales_client_member_birthday_card",
    title: "CLIENT MEMBER BIRTHDAY",
    type: "read",
  },

  //Finance
  SALES_BUDGET: {
    value: "sales_budget_finance_tab",
    title: "BUDGET",
    type: "read",
    route: "/app/dashboard/sales-dashboard/finance/budget",
  },
  SALES_PAYMENT_SCHEDULE: {
    value: "sales_payment_schedule_finance_tab",
    title: "PAYMENT SCHEDULE",
    type: "read",
    route: "/app/dashboard/sales-dashboard/finance/payment-schedule",
  },
  SALES_VOUCHER: {
    value: "sales_voucher_finance_tab",
    title: "VOUCHER",
    type: "read",
    route: "/app/dashboard/sales-dashboard/finance/voucher",
  },
  // Revenue
  SALES_TOTAL_REVENUE: {
    value: "sales_mix_bag_revenue_total_revenue_tab",
    title: "TOTAL REVENUE",
    type: "read",
    route: "/app/dashboard/sales-dashboard/revenue/total-revenue",
  },
  SALES_COWORKING: {
    value: "sales_mix_bag_revenue_coworking_tab",
    title: "COWORKING",
    type: "read",
    route: "/app/dashboard/sales-dashboard/revenue/co-working",
  },
  SALES_MEETINGS: {
    value: "sales_mix_bag_revenue_meetings_tab",
    title: "MEETINGS",
    type: "read",
    route: "/app/dashboard/sales-dashboard/revenue/meetings",
  },
  SALES_VIRTUAL_OFFICE: {
    value: "sales_mix_bag_revenue_virtual_office_tab",
    title: "VIRTUAL OFFICE",
    type: "read",
    route: "/app/dashboard/sales-dashboard/revenue/virtual-office",
  },
  SALES_WORKATIONS: {
    value: "sales_mix_bag_revenue_workations_tab",
    title: "WORKATIONS",
    type: "read",
    route: "/app/dashboard/sales-dashboard/revenue/workation",
  },
  SALES_ALT_REVENUE: {
    value: "sales_mix_bag_revenue_alt_revenue_tab",
    title: "ALT REVENUE",
    type: "read",
    route: "/app/dashboard/sales-dashboard/revenue/alt-revenue",
  },

  //Data
  SALES_ASSET_LIST: {
    value: "sales_asset_list_data_tab",
    title: "ASSET LIST",
    type: "read",
    route: "/app/dashboard/sales-dashboard/data/asset-list",
  },
  SALES_MONTHLY_INVOICE_REPORTS: {
    value: "sales_monthly_invoice_reports_data_tab",
    title: "MONTHLY INVOICE REPORTS",
    type: "read",
    route: "/app/dashboard/sales-dashboard/data/monthly-invoice-reports",
  },
  SALES_VENDOR: {
    value: "sales_vendor_data_tab",
    title: "VENDOR",
    type: "read",
    route: "/app/dashboard/sales-dashboard/data/vendor",
  },
  //Settings
  SALES_BULK_UPLOAD: {
    value: "sales_bulk_upload_settings_tab",
    title: "BULK UPLOAD",
    type: "read",
    route: "/app/dashboard/sales-dashboard/settings/bulk-upload",
  },
  SALES_SOPS: {
    value: "sales_sops_settings_tab",
    title: "SOPS",
    type: "read",
    route: "/app/dashboard/sales-dashboard/settings/sops",
  },
  SALES_POLICIES: {
    value: "sales_policies_settings_tab",
    title: "POLICIES",
    type: "read",
    route: "/app/dashboard/sales-dashboard/settings/policies",
  },

  // HR Module

  //Graphs
  HR_DEPARTMENT_EXPENSE: {
    value: "hr_department_expense_chart",
    title: "HR DEPARTMENT EXPENSE",
    type: "read",
  },
  // cards
  HR_EMPLOYEE: { value: "hr_employee_card", title: "EMPLOYEE", type: "read" },
  HR_COMPANY: { value: "hr_company_card", title: "COMPANY", type: "read" },
  HR_FINANCE: { value: "hr_finance_card", title: "HR FINANCE", type: "read" },
  HR_MIX_BAG: { value: "hr_mix_bag_card", title: "HR MIX BAG", type: "read" },
  HR_ATTENDANCE_REQUESTS_MIX_BAG: {
    value: "hr_attendance_requests_tab",
    title: "Attendance Requests",
    type: "read",
    route: "/app/dashboard/HR-dashboard/mix-bag/attendance/pending-approvals",
  },
  HR_LEAVE_REQUESTS_MIX_BAG: {
    value: "hr_leave_requests_tab",
    title: "Leave Requests",
    type: "read",
    route: "/app/dashboard/HR-dashboard/mix-bag/leaves/pending-approvals",
  },


  //inside dashboard of mix bag
  HR_PENDING_APPROVALS_LEAVES: {
    value: "hr_pending_approvals_leaves_tab",
    title: "Pending Approvals Leaves",
    type: "read",
    route: "/app/dashboard/HR-dashboard/mix-bag/leaves/pending-approvals",
  },
  HR_COMPLETED_LEAVES: {
    value: "hr_completed_leaves_tab",
    title: "Completed Leaves",
    type: "read",
    route: "/app/dashboard/HR-dashboard/mix-bag/leaves/completed",
  },
  HR_PENDING_APPROVALS_ATTENDANCE: {
    value: "hr_pending_approvals_attendance_tab",
    title: "Pending Approvals Attendance",
    type: "read",
    route: "/app/dashboard/HR-dashboard/mix-bag/attendance/pending-approvals",
  },
  HR_COMPLETED_ATTENDANCE: {
    value: "hr_completed_attendance_tab",
    title: "Completed Attendance",
    type: "read",
    route: "/app/dashboard/HR-dashboard/mix-bag/attendance/completed",
  },

  HR_DATA: { value: "hr_data_card", title: "HR DATA", type: "read" },
  HR_SETTINGS: { value: "hr_settings_card", title: "HR SETTINGS", type: "read" },

  //Data Card
  HR_EXPENSES: { value: "hr_expenses_chart", title: "EXPENSES", type: "read" },
  HR_AVERAGES: { value: "hr_averages_chart", title: "AVERAGES", type: "read" },

  //Tables
  HR_ANNUAL_KPA_VS_ACHIEVEMENTS: {
    value: "hr_annual_kpa_vs_achievements_chart",
    title: "ANNUAL KPA VS ACHIEVEMENTS",
    type: "read",
  },
  HR_ANNUAL_TASKS_VS_ACHIEVEMENTS: {
    value: "hr_annual_tasks_vs_achievements_chart",
    title: "ANNUAL TASKS VS ACHIEVEMENTS",
    type: "read",
  },
  HR_CURRENT_MONTH_BIRTHDAY_LIST: {
    value: "hr_current_month_birthday_list_chart",
    title: "CURRENT MONTH BIRTHDAY LIST",
    type: "read",
  },
  HR_CURRENT_MONTH_HOLIDAY_LIST: {
    value: "hr_current_month_holiday_list_chart",
    title: "CURRENT MONTH HOLIDAY LIST",
    type: "read",
  },

  // edit button
  HR_EMPLOYEE_EDIT: {
    value: "hr_employee_edit_button",
    title: "HR EMPLOYEE EDIT",
    type: "write",
    access: "button",
  },

  // correction request
  HR_CORRECTION_REQUEST: {
    value: "hr_correction_request_button",
    title: "HR CORRECTION REQUEST",
    type: "write",
    access: "button",
  },

  HR_LEAVE_REQUEST: {
    value: "hr_leave_request_button",
    title: "HR LEAVE REQUEST",
    type: "write",
    access: "button",
  },

  HR_AGREEMENT_REQUEST: {
    value: "hr_agreement_request_button",
    title: "HR AGREEMENT REQUEST",
    type: "write",
    access: "button",
  },

  HR_ADD_DEPARTMENT: {
    value: "hr_add_department_button",
    title: "HR ADD DEPARTMENT",
    type: "write",
    access: "button",
  },

  HR_ADD_WORK_LOCATION: {
    value: "hr_add_work_location_button",
    title: "HR ADD WORK LOCATION",
    type: "write",
    access: "button",
  },

  HR_ADD_HOLIDAY: {
    value: "hr_add_holiday_button",
    title: "HR ADD HOLIDAY",
    type: "write",
    access: "button",
  },

  HR_ADD_EVENT: {
    value: "hr_add_event_button",
    title: "HR ADD EVENT",
    type: "write",
    access: "button",
  },

  HR_ADD_POLICY: {
    value: "hr_add_policy_button",
    title: "HR ADD POLICY",
    type: "write",
    access: "button",
  },

  HR_ADD_SOP: {
    value: "hr_add_sop_button",
    title: "HR ADD SOP",
    type: "write",
    access: "button",
  },

  HR_ADD_EMPLOYEE_TYPE: {
    value: "hr_add_employee_type_button",
    title: "HR ADD EMPLOYEE TYPE",
    type: "write",
    access: "button",
  },

  HR_ADD_SHIFT: {
    value: "hr_add_shift_button",
    title: "HR ADD SHIFT",
    type: "write",
    access: "button",
  },

  HR_ADD_TEMPLATE: {
    value: "hr_add_template_button",
    title: "HR ADD TEMPLATE",
    type: "write",
    access: "button",
  },

  // Pie charts
  HR_EMPLOYEE_GENDER_DISTRIBUTION_PIE: {
    value: "hr_gender_distribution_pie_chart",
    title: "GENDER DISTRIBUTION PIE CHART",
    type: "read",
  },
  HR_CITY_WISE_EMPLOYEES_PIE: {
    value: "hr_city_wise_employees_pie_chart",
    title: "CITY WISE EMPLOYEES PIE CHART",
    type: "read",
  },

  //Employee
  HR_EMPLOYEE_LIST: {
    value: "hr_employee_list_tab",
    title: "EMPLOYEE LIST",
    type: "read",
    route: "/app/dashboard/HR-dashboard/employee/employee-list",
  },

  HR_PAST_EMPLOYEES: {
    value: "hr_past_employees_tab",
    title: "PAST EMPLOYEES",
    type: "read",
    route: "/app/dashboard/HR-dashboard/employees/past-employees",
  },

  HR_ATTENDANCE: {
    value: "hr_attendance_tab",
    title: "ATTENDANCE",
    type: "read",
    route: "/app/dashboard/HR-dashboard/attendance",
  },

  HR_LEAVES: {
    value: "hr_leaves_tab",
    title: "LEAVES",
    type: "read",
    route: "/app/dashboard/HR-dashboard/leaves",
  },

  HR_EMPLOYEE_ONBOARDING: {
    value: "hr_employee_onboarding_tab",
    title: "EMPLOYEE ONBOARDING",
    type: "read",
    route: "/app/dashboard/HR-dashboard/employees/employee-onboarding",
  },

  //Company
  HR_COMPANY_LOGO: {
    value: "hr_company_logo_tab",
    title: "COMPANY LOGO",
    type: "read",
    route: "/app/dashboard/HR-dashboard/company/company-logo",
  },
  HR_COMPANY_HANDBOOK: {
    value: "hr_company_handbook_tab",
    title: "COMPANY HANDBOOK",
    type: "read",
    route: "/app/dashboard/HR-dashboard/company/company-handbook",
  },
  HR_DEPARTMENTS: {
    value: "hr_departments_tab",
    title: "DEPARTMENTS",
    type: "read",
    route: "/app/dashboard/HR-dashboard/company/departments",
  },
  HR_WORK_LOCATIONS: {
    value: "hr_work_locations_tab",
    title: "WORK LOCATIONS",
    type: "read",
    route: "/app/dashboard/HR-dashboard/company/work-locations",
  },
  HR_HOLIDAYS: {
    value: "hr_holidays_tab",
    title: "HOLIDAYS",
    type: "read",
    route: "/app/dashboard/HR-dashboard/company/holidays",
  },
  HR_EVENTS: {
    value: "hr_events_tab",
    title: "EVENTS",
    type: "read",
    route: "/app/dashboard/HR-dashboard/company/events",
  },
  HR_COMPANY_POLICIES: {
    value: "hr_company_policies_tab",
    title: "COMPANY POLICIES",
    type: "read",
    route: "/app/dashboard/HR-dashboard/company/policies",
  },
  HR_COMPANY_SOPS: {
    value: "hr_company_sops_tab",
    title: "COMPANY SOPS",
    type: "read",
    route: "/app/dashboard/HR-dashboard/company/sops",
  },
  HR_EMPLOYEE_TYPES: {
    value: "hr_employee_types_tab",
    title: "EMPLOYEE TYPES",
    type: "read",
    route: "/app/dashboard/HR-dashboard/company/employee-type",
  },
  HR_SHIFTS: {
    value: "hr_shifts_tab",
    title: "SHIFTS",
    type: "read",
    route: "/app/dashboard/HR-dashboard/company/shifts",
  },
  HR_TEMPLATES: {
    value: "hr_templates_tab",
    title: "TEMPLATES",
    type: "read",
    route: "/app/dashboard/HR-dashboard/company/templates",
  },

  //Finance
  HR_BUDGET: {
    value: "hr_budget_tab",
    title: "BUDGET",
    type: "read",
    route: "/app/dashboard/HR-dashboard/finance/budget",
  },

  HR_PAYMENT_SCHEDULE: {
    value: "hr_payment_schedule_tab",
    title: "PAYMENT SCHEDULE",
    type: "read",
    route: "/app/dashboard/HR-dashboard/finance/payment-schedule",
  },

  HR_VOUCHER: {
    value: "hr_voucher_tab",
    title: "VOUCHER",
    type: "read",
    route: "/app/dashboard/HR-dashboard/finance/voucher",
  },

  HR_PAYROLL: {
    value: "hr_payroll_tab",
    title: "PAYROLL",
    type: "read",
    route: "/app/dashboard/HR-dashboard/finance/payroll",
  },

  //Data
  HR_JOB_APPLICATION_LIST: {
    value: "hr_job_application_list_tab",
    title: "JOB APPLICATION LIST",
    type: "read",
    route: "/app/dashboard/HR-dashboard/data/job-application-list",
  },

  HR_PAYROLL_REPORTS: {
    value: "hr_payroll_reports_tab",
    title: "PAYROLL REPORTS",
    type: "read",
    route: "/app/dashboard/HR-dashboard/data/payroll-reports",
  },

  HR_ASSET_LIST: {
    value: "hr_asset_list_tab",
    title: "ASSET LIST",
    type: "read",
    route: "/app/dashboard/HR-dashboard/data/asset-list",
  },

  HR_MONTHLY_INVOICE_REPORTS: {
    value: "hr_monthly_invoice_reports_tab",
    title: "MONTHLY INVOICE REPORTS",
    type: "read",
    route: "/app/dashboard/HR-dashboard/data/monthly-invoice-reports",
  },

  HR_VENDOR: {
    value: "hr_vendor_tab",
    title: "VENDOR",
    type: "read",
    route: "/app/dashboard/HR-dashboard/data/vendor",
  },
  //Settings
  HR_BULK_UPLOAD: {
    value: "hr_bulk_upload_tab",
    title: "BULK UPLOAD",
    type: "read",
    route: "/app/dashboard/hr-dashboard/settings/bulk-upload",
  },
  HR_SOPS: {
    value: "hr_sops_tab",
    title: "SOPS",
    type: "read",
    route: "/app/dashboard/hr-dashboard/settings/sops",
  },
  HR_POLICIES: {
    value: "hr_policies_tab",
    title: "POLICIES",
    type: "read",
    route: "/app/dashboard/hr-dashboard/settings/policies",
  },

  // 🟡 Admin Dashboard
  ADMIN_ANNUAL_EXPENSES: {
    value: "admin_annual_expenses_page",
    title: "ANNUAL EXPENSES",
    type: "read",
  },
  ADMIN_INVENTORY: { value: "admin_inventory_page", title: "INVENTORY", type: "read" },
  ADMIN_FINANCE: { value: "admin_finance_card", title: "FINANCE", type: "read" },
  ADMIN_MIX_BAG: { value: "admin_mix_bag_card", title: "MIX BAG", type: "read" },
  ADMIN_TEAM_MEMBERS_SCHEDULE_MIX_BAG: {
    value: "admin_team_members_schedule_card",
    title: "TEAM MEMBERS SCHEDULE",
    type: "read",
    route: "/app/dashboard/admin-dashboard/mix-bag/team-members-schedule",
  },
  ADMIN_HOUSEKEEPING_MEMBERS_MIX_BAG: {
    value: "admin_housekeeping_members_card",
    title: "HOUSEKEEPING MEMBERS",
    type: "read",
    route: "/app/dashboard/admin-dashboard/mix-bag/housekeeping-members",
  },
  ADMIN_HOLIDAYS_EVENTS_MIX_BAG: {
    value: "admin_holidays_events_card",
    title: "HOLIDAYS & EVENTS",
    type: "read",
    route: "/app/dashboard/admin-dashboard/mix-bag/holidays-events",
  },
  ADMIN_CLIENT_MEMBERS_MIX_BAG: {
    value: "admin_client_members_card",
    title: "CLIENT MEMBERS",
    type: "read",
    route: "/app/dashboard/admin-dashboard/mix-bag/client-members",
  },
  ADMIN_DATA: { value: "admin_data_card", title: "DATA", type: "read" },
  ADMIN_SETTINGS: { value: "admin_settings_card", title: "SETTINGS", type: "read" },
  // 🟡 Admin Graphs
  ADMIN_DEPARTMENT_EXPENSE: {
    value: "admin_department_expense_chart",
    title: "DEPARTMENT EXPENSE",
    type: "read",
  },
  // 🟡 Admin Data Cards
  ADMIN_TOTAL_ADMIN_OFFICES: {
    value: "admin_total_admin_offices_card",
    title: "TOTAL ADMIN OFFICES",
    type: "read",
  },
  ADMIN_MONTHLY_DUE_TASKS: {
    value: "admin_monthly_due_tasks_card",
    title: "MONTHLY DUE TASKS",
    type: "read",
  },
  ADMIN_MONTHLY_EXPENSE: {
    value: "admin_monthly_expense_card",
    title: "MONTHLY EXPENSE",
    type: "read",
  },
  ADMIN_TOP_EXECUTIVE: {
    value: "admin_top_executive_card",
    title: "TOP EXECUTIVE",
    type: "read",
  },
  ADMIN_EXPENSE_PER_SQFT: {
    value: "admin_expense_per_sqft_card",
    title: "EXPENSE PER SQFT",
    type: "read",
  },
  ADMIN_ELECTRICITY_EXPENSE_PER_SQFT: {
    value: "admin_electricity_expense_per_sqft_card",
    title: "ELECTRICITY EXPENSE PER SQFT",
    type: "read",
  },
  // 🟡 Admin Tables
  ADMIN_WEEKLY_EXECUTIVE_SHIFT_TIMING: {
    value: "admin_weekly_executive_shift_timing_chart",
    title: "WEEKLY EXECUTIVE SHIFT TIMING",
    type: "read",
  },
  ADMIN_UPCOMING_EVENTS_LIST: {
    value: "admin_upcoming_events_list_chart",
    title: "UPCOMING EVENTS LIST",
    type: "read",
  },
  ADMIN_UPCOMING_CLIENT_MEMBER_BIRTHDAYS: {
    value: "admin_upcoming_client_member_birthdays_chart",
    title: "UPCOMING CLIENT MEMBER BIRTHDAYS",
    type: "read",
  },
  ADMIN_UPCOMING_CLIENT_ANNIVERSARIES: {
    value: "admin_upcoming_client_anniversaries_chart",
    title: "UPCOMING CLIENT ANNIVERSARIES",
    type: "read",
  },
  ADMIN_NEWLY_JOINED_HOUSE_KEEPING_MEMBERS: {
    value: "admin_newly_joined_house_keeping_members_chart",
    title: "NEWLY JOINED HOUSE KEEPING MEMBERS",
    type: "read",
  },
  // 🟡 Admin Pie Charts
  ADMIN_UNIT_WISE_DUE_TASKS: {
    value: "admin_unit_wise_due_tasks_chart",
    title: "UNIT WISE DUE TASKS",
    type: "read",
  },
  ADMIN_EXECUTIVE_WISE_DUE_TASKS: {
    value: "admin_executive_wise_due_tasks_chart",
    title: "EXECUTIVE WISE DUE TASKS",
    type: "read",
  },
  ADMIN_TOTAL_DESKS_COMPANY_WISE: {
    value: "admin_total_desks_company_wise_chart",
    title: "TOTAL DESKS COMPANY WISE",
    type: "read",
  },
  ADMIN_BIOMETRICS_GENDER_DATA: {
    value: "admin_biometrics_gender_data_chart",
    title: "BIOMETRICS GENDER DATA",
    type: "read",
  },
  // Finance
  ADMIN_BUDGET: {
    value: "admin_budget_tab",
    title: "BUDGET",
    type: "read",
    route: "/app/dashboard/admin-dashboard/finance/budget",
  },

  ADMIN_PAYMENT_SCHEDULE: {
    value: "admin_payment_schedule_tab",
    title: "PAYMENT SCHEDULE",
    type: "read",
    route: "/app/dashboard/admin-dashboard/finance/payment-schedule",
  },

  ADMIN_VOUCHER: {
    value: "admin_voucher_tab",
    title: "VOUCHER",
    type: "read",
    route: "/app/dashboard/admin-dashboard/finance/voucher",
  },

  // Housekeeping Members
  ADMIN_HOUSEKEEPING_MEMBERS_LIST: {
    value: "admin_housekeeping_members_list_tab",
    title: "HOUSEKEEPING MEMBERS LIST",
    type: "read",
    route:
      "/app/dashboard/admin-dashboard/mix-bag/housekeeping-members/members-list",
  },
  ADMIN_HOUSEKEEPING_MEMBER_ONBOARD: {
    value: "admin_housekeeping_member_onboard_tab",
    title: "HOUSEKEEPING MEMBER ONBOARD",
    type: "read",
    route:
      "/app/dashboard/admin-dashboard/mix-bag/housekeeping-members/member-onboard",
  },
  ADMIN_HOUSEKEEPING_ASSIGN_ROTATION: {
    value: "admin_housekeeping_assign_rotation_tab",
    title: "HOUSEKEEPING ASSIGN ROTATION",
    type: "read",
    route:
      "/app/dashboard/admin-dashboard/mix-bag/housekeeping-members/member-schedule",
  },

  // Clients Members Data
  ADMIN_CLIENT_MEMBERS_DATA: {
    value: "admin_client_members_data_tab",
    title: "CLIENT MEMBERS DATA",
    type: "read",
    route:
      "/app/dashboard/admin-dashboard/mix-bag/client-members/client-members-data",
  },
  ADMIN_CLIENT_MEMBERS_ONBOARD: {
    value: "admin_client_members_onboard_tab",
    title: "CLIENT MEMBERS ONBOARD",
    type: "read",
    route:
      "/app/dashboard/admin-dashboard/mix-bag/client-members/client-members-onboard",
  },

  // Data
  ADMIN_ELECTRICITY_EXPENSES: {
    value: "admin_electricity_expenses_tab",
    title: "ELECTRICITY EXPENSES",
    type: "read",
    route:
      "/app/dashboard/admin-dashboard/mix-bag/infra-expenses/electricity-expenses",
  },
  ADMIN_ASSET_LIST: {
    value: "admin_asset_list_tab",
    title: "ASSET LIST",
    type: "read",
    route: "/app/dashboard/admin-dashboard/mix-bag/infra-expenses/asset-list",
  },
  ADMIN_MONTHLY_INVOICE_REPORTS: {
    value: "admin_monthly_invoice_reports_tab",
    title: "MONTHLY INVOICE REPORTS",
    type: "read",
    route:
      "/app/dashboard/admin-dashboard/mix-bag/infra-expenses/monthly-invoice-reports",
  },
  ADMIN_VENDOR: {
    value: "admin_vendor_tab",
    title: "VENDOR",
    type: "read",
    route: "/app/dashboard/admin-dashboard/mix-bag/infra-expenses/vendor",
  },
  //Settings
  ADMIN_MODULE_BULK_UPLOAD: {
    value: "admin_bulk_upload_tab",
    title: "BULK UPLOAD",
    type: "read",
    route: "/app/dashboard/admin-dashboard/settings/bulk-upload",
  },
  ADMIN_MODULE_SOPS: {
    value: "admin_sops_tab",
    title: "SOPS",
    type: "read",
    route: "/app/dashboard/admin-dashboard/settings/sops",
  },
  ADMIN_MODULE_POLICIES: {
    value: "admin_policies_tab",
    title: "POLICIES",
    type: "read",
    route: "/app/dashboard/admin-dashboard/settings/policies",
  },

  // 🟢 Maintenance Dashboard

  // 🟢 Maintenance Graphs
  MAINTENANCE_DEPARTMENT_EXPENSES: {
    value: "maintenance_department_expenses_chart",
    title: "DEPARTMENT EXPENSES",
    type: "read",
  },

  // 🟢 Maintenance Nav Cards
  MAINTENANCE_ANNUAL_EXPENSES: {
    value: "maintenance_annual_expenses_card",
    title: "ANNUAL EXPENSES",
    type: "read",
  },
  MAINTENANCE_INVENTORY: {
    value: "maintenance_inventory_card",
    title: "INVENTORY",
    type: "read",
  },
  MAINTENANCE_FINANCE: { value: "maintenance_finance_card", title: "FINANCE", type: "read" },
  MAINTENANCE_MIX_BAG: { value: "maintenance_mix_bag_card", title: "MIX BAG", type: "read" },
  MAINTENANCE_TEAM_MEMBERS_SCHEDULE: {
    value: "maintenance_team_members_schedule_card",
    title: "TEAM MEMBERS SCHEDULE",
    type: "read",
    route: "/app/dashboard/maintenance-dashboard/mix-bag/team-members-schedule",
  },
  MAINTENANCE_DATA: { value: "maintenance_data_card", title: "DATA", type: "read" },
  MAINTENANCE_SETTINGS: { value: "maintenance_settings_card", title: "SETTINGS", type: "read" },
  // 🟢 Maintenance Data Cards
  MAINTENANCE_OFFICES_UNDER_MANAGEMENT: {
    value: "maintenance_offices_under_management_card",
    title: "OFFICES UNDER MANAGEMENT",
    type: "read",
  },
  MAINTENANCE_MONTHLY_DUE_TASKS: {
    value: "maintenance_monthly_due_tasks_card",
    title: "MONTHLY DUE TASKS",
    type: "read",
  },
  MAINTENANCE_MONTHLY_EXPENSE: {
    value: "maintenance_monthly_expense_card",
    title: "MONTHLY EXPENSE",
    type: "read",
  },
  MAINTENANCE_EXPENSE_PER_SQFT: {
    value: "maintenance_expense_per_sqft_card",
    title: "EXPENSE PER SQFT",
    type: "read",
  },
  MAINTENANCE_ASSETS_UNDER_MANAGEMENT: {
    value: "maintenance_assets_under_management_card",
    title: "ASSETS UNDER MANAGEMENT",
    type: "read",
  },
  MAINTENANCE_MONTHLY_KPA: {
    value: "maintenance_monthly_kpa_card",
    title: "MONTHLY KPA",
    type: "read",
  },

  //Tables
  MAINTENANCE_TOP_HIGH_PRIORITY_TASKS: {
    value: "maintenance_top_high_priority_tasks_chart",
    title: "TOP HIGH PRIORITY TASKS",
    type: "read",
  },
  MAINTENANCE_WEEKLY_EXECUTIVE_SHIFT_TIMING: {
    value: "maintenance_weekly_executive_shift_timing_chart",
    title: "WEEKLY EXECUTIVE SHIFT TIMING",
    type: "read",
  },

  //Pie Charts
  MAINTENANCE_CATEGORY_WISE_MAINTENANCE: {
    value: "maintenance_category_wise_maintenance_chart",
    title: "CATEGORY WISE MAINTENANCE",
    type: "read",
  },
  MAINTENANCE_DUE_MAINTENANCE: {
    value: "maintenance_due_maintenance_chart",
    title: "DUE MAINTENANCE",
    type: "read",
  },
  MAINTENANCE_UNIT_WISE_MAINTENANCE: {
    value: "maintenance_unit_wise_maintenance_chart",
    title: "UNIT WISE MAINTENANCE",
    type: "read",
  },
  MAINTENANCE_EXECUTION_CHANNEL: {
    value: "maintenance_execution_channel_chart",
    title: "EXECUTION CHANNEL",
    type: "read",
  },
  MAINTENANCE_AVERAGE_MONTHLY_DUE: {
    value: "maintenance_average_monthly_due_chart",
    title: "AVERAGE MONTHLY DUE",
    type: "read",
  },
  MAINTENANCE_AVERAGE_YEARLY_DUE: {
    value: "maintenance_average_yearly_due_chart",
    title: "AVERAGE YEARLY DUE",
    type: "read",
  },

  //Finance
  MAINTENANCE_BUDGET: {
    value: "maintenance_budget_tab",
    title: "BUDGET",
    type: "read",
    route: "/app/dashboard/maintenance-dashboard/finance/budget",
  },

  MAINTENANCE_PAYMENT_SCHEDULE: {
    value: "maintenance_payment_schedule_tab",
    title: "PAYMENT SCHEDULE",
    type: "read",
    route: "/app/dashboard/maintenance-dashboard/finance/payment-schedule",
  },

  MAINTENANCE_VOUCHER: {
    value: "maintenance_voucher_tab",
    title: "VOUCHER",
    type: "read",
    route: "/app/dashboard/maintenance-dashboard/finance/voucher",
  },

  //Data
  MAINTENANCE_AMC_RECORDS: {
    value: "maintenance_amc_records_tab",
    title: "AMC RECORDS",
    type: "read",
    route: "/app/dashboard/maintenance-dashboard/data/amc-records",
  },

  MAINTENANCE_ASSET_LIST: {
    value: "maintenance_asset_list_tab",
    title: "ASSET LIST",
    type: "read",
    route: "/app/dashboard/maintenance-dashboard/data/asset-list",
  },

  MAINTENANCE_MONTHLY_INVOICE_REPORTS: {
    value: "maintenance_monthly_invoice_reports_tab",
    title: "MONTHLY INVOICE REPORTS",
    type: "read",
    route: "/app/dashboard/maintenance-dashboard/data/monthly-invoice-reports",
  },

  MAINTENANCE_VENDOR: {
    value: "maintenance_vendor_tab",
    title: "VENDOR",
    type: "read",
    route: "/app/dashboard/maintenance-dashboard/data/vendor",
  },

  //Settings
  MAINTENANCE_BULK_UPLOAD: {
    value: "maintenance_bulk_upload_tab",
    title: "BULK UPLOAD",
    type: "read",
    route: "/app/dashboard/maintenance-dashboard/settings/bulk-upload",
  },

  MAINTENANCE_SOPS: {
    value: "maintenance_sops_tab",
    title: "SOPS",
    type: "read",
    route: "/app/dashboard/maintenance-dashboard/settings/sops",
  },

  MAINTENANCE_POLICIES: {
    value: "maintenance_policies_tab",
    title: "POLICIES",
    type: "read",
    route: "/app/dashboard/maintenance-dashboard/settings/policies",
  },

  // 🔵 IT Dashboard

  // 🔵 IT Graphs
  IT_DEPARTMENT_EXPENSES: {
    value: "it_department_expenses_chart",
    title: "IT DEPARTMENT EXPENSES",

    type: "read",
    access: "page",
  },

  // 🔵 IT Nav Cards
  IT_ANNUAL_EXPENSES: {
    value: "it_annual_expenses_card",
    title: "IT ANNUAL EXPENSES",

    type: "read",
    access: "page",
  },
  IT_INVENTORY: {
    value: "it_inventory_card",
    title: "IT INVENTORY",
    type: "read",
    access: "page",
  },
  IT_FINANCE: {
    value: "it_finance_card",
    title: "IT FINANCE",
    type: "read",
    access: "page",
  },
  IT_MIX_BAG: {
    value: "it_mix_bag_card",
    title: "IT MIX BAG",
    type: "read",
    access: "page",
  },

  IT_TEAM_MEMBERS_SCHEDULE_MIX_BAG: {
    value: "it_team_members_schedule_mix_bag_card",
    title: "IT TEAM MEMBERS SCHEDULE MIX BAG",
    type: "read",
    route: "/app/dashboard/it-dashboard/mix-bag/team-members-schedule",
  },
  IT_DATA: { value: "it_data_card", title: "IT DATA", type: "read", access: "page" },
  IT_SETTINGS: {
    value: "it_settings_card",
    title: "IT SETTINGS",
    type: "write",
    access: "page",
  },

  // 🔵 IT Data Cards
  IT_OFFICES_UNDER_MANAGEMENT: {
    value: "it_offices_under_management_card",
    title: "OFFICES UNDER MANAGEMENT",
    type: "read",
  },
  IT_DUE_TASKS_THIS_MONTH: {
    value: "it_due_tasks_this_month_card",
    title: "DUE TASKS THIS MONTH",
    type: "read",
  },
  IT_INTERNET_EXPENSE_PER_SQFT: {
    value: "it_internet_expense_per_sqft_card",
    title: "INTERNET EXPENSE PER SQFT",
    type: "read",
  },
  IT_EXPENSE_PER_SQFT: {
    value: "it_expense_per_sqft_card",
    title: "EXPENSE PER SQFT",
    type: "read",
  },
  IT_MONTHLY_EXPENSE: {
    value: "it_monthly_expense_card",
    title: "MONTHLY EXPENSE",
    type: "read",
  },
  IT_MONTHLY_KPA: { value: "it_monthly_kpa_card", title: "MONTHLY KPA", type: "read" },

  // 🔵 IT Tables
  IT_TOP_10_HIGH_PRIORITY_DUE_TASKS: {
    value: "it_top_10_high_priority_due_tasks_chart",
    title: "TOP 10 HIGH PRIORITY DUE TASKS",
    type: "read",
  },
  IT_WEEKLY_EXECUTIVE_SHIFT_TIMING: {
    value: "it_weekly_executive_shift_timing_chart",
    title: "WEEKLY EXECUTIVE SHIFT TIMING",
    type: "read",
  },

  // 🔵 IT Pie Charts

  IT_UNIT_WISE_DUE_TASKS: {
    value: "it_unit_wise_due_tasks_chart",
    title: "UNIT WISE DUE TASKS",
    type: "read",
  },
  IT_EXECUTIVE_WISE_DUE_TASKS: {
    value: "it_executive_wise_due_tasks_chart",
    title: "EXECUTIVE WISE DUE TASKS",
    type: "read",
  },
  IT_UNIT_WISE_IT_EXPENSES: {
    value: "it_unit_wise_it_expenses_chart",
    title: "UNIT WISE IT EXPENSES",
    type: "read",
  },
  IT_BIOMETRICS_GENDER_DATA: {
    value: "it_biometrics_gender_data_chart",
    title: "BIOMETRICS GENDER DATA",
    type: "read",
  },
  IT_CLIENT_WISE_COMPLAINTS: {
    value: "it_client_wise_complaints_chart",
    title: "CLIENT WISE COMPLAINTS",
    type: "read",
  },
  IT_TYPE_OF_IT_COMPLAINTS: {
    value: "it_type_of_it_complaints_chart",
    title: "TYPE OF IT COMPLAINTS",
    type: "read",
  },

  //Finance
  IT_BUDGET: {
    value: "it_budget_tab",
    title: "BUDGET",
    type: "read",
    route: "/app/dashboard/IT-dashboard/finance/budget",
  },

  IT_PAYMENT_SCHEDULE: {
    value: "it_payment_schedule_tab",
    title: "PAYMENT SCHEDULE",
    type: "read",
    route: "/app/dashboard/IT-dashboard/finance/payment-schedule",
  },

  IT_VOUCHER: {
    value: "it_voucher_tab",
    title: "VOUCHER",
    type: "read",
    route: "/app/dashboard/IT-dashboard/finance/voucher",
  },

  //Data
  IT_AMC_RECORDS: {
    value: "it_amc_records_tab",
    title: "AMC RECORDS",
    type: "read",
    route: "/app/dashboard/IT-dashboard/data/amc-records",
  },
  IT_ASSET_LIST: {
    value: "it_asset_list_tab",
    title: "ASSET LIST",
    type: "read",
    route: "/app/dashboard/IT-dashboard/data/asset-list",
  },
  IT_MONTHLY_INVOICE_REPORTS: {
    value: "it_monthly_invoice_reports_tab",
    title: "MONTHLY INVOICE REPORTS",
    type: "read",
    route: "/app/dashboard/IT-dashboard/data/monthly-invoice-reports",
  },
  IT_VENDOR: {
    value: "it_vendor_tab",
    title: "VENDOR",
    type: "read",
    route: "/app/dashboard/IT-dashboard/data/vendor",
  },
  //Settings
  IT_BULK_UPLOAD: {
    value: "it_bulk_upload_tab",
    title: "BULK UPLOAD",
    type: "read",
    route: "/app/dashboard/IT-dashboard/settings/bulk-upload",
  },

  IT_SOPS: {
    value: "it_sops_tab",
    title: "SOPS",
    type: "read",
    route: "/app/dashboard/IT-dashboard/settings/sops",
  },

  IT_POLICIES: {
    value: "it_policies_tab",
    title: "POLICIES",
    type: "read",
    route: "/app/dashboard/IT-dashboard/settings/policies",
  },

  // 🟣 Frontend Dashboard

  //Graphs
  FRONTEND_SITE_VISITORS: {
    value: "frontend_site_visitors_chart",
    title: "SITE VISITORS",
    type: "read",
  },
  FRONTEND_DEPARTMENT_EXPENSE: {
    value: "frontend_department_expense_chart",
    title: "DEPARTMENT EXPENSE",
    type: "read",
  },
  FRONTEND_WEBSITE_ISSUES_RAISED: {
    value: "frontend_website_issues_raised_chart",
    title: "WEBSITE ISSUES RAISED",
    type: "read",
  },

  //Nav cards
  FRONTEND_CREATE_WEBSITE: {
    value: "frontend_create_website_card",
    title: "CREATE WEBSITE",
    type: "read",
    access: "page",
  },
  FRONTEND_EDIT_WEBSITE: {
    value: "frontend_edit_website_card",
    title: "EDIT WEBSITE",
    type: "read",
    access: "page",
  },
  FRONTEND_ACTIVE_WEBSITES: {
    value: "frontend_active_websites_tab",
    title: "ACTIVE WEBSITES",
    type: "read",
    route: "/app/dashboard/frontend-dashboard/websites/active",
  },
  FRONTEND_INACTIVE_WEBSITES: {
    value: "frontend_inactive_websites_tab",
    title: "INACTIVE WEBSITES",
    type: "read",
    route: "/app/dashboard/frontend-dashboard/websites/inactive",
  },
  FRONTEND_NEW_THEMES: {
    value: "frontend_new_themes_card",
    title: "NEW THEMES",
    type: "read",
    access: "page",
  },
  FRONTEND_FINANCE: {
    value: "frontend_finance_card",
    title: "FINANCE",
    type: "read",
    access: "page",
  },
  FRONTEND_DATA: { value: "frontend_data_card", title: "DATA", type: "read", access: "page" },
  FRONTEND_SETTINGS: {
    value: "frontend_settings_card",
    title: "SETTINGS",
    type: "write",
    access: "page",
  },

  //Pie charts
  FRONTEND_NATION_WISE_SITE_VISITORS: {
    value: "frontend_nation_wise_site_visitors_chart",
    title: "NATION WISE SITE VISITORS",
    type: "read",
  },
  FRONTEND_STATE_WISE_SITE_VISITORS: {
    value: "frontend_state_wise_site_visitors_chart",
    title: "STATE WISE SITE VISITORS",
    type: "read",
  },
  //finance
  FRONTEND_BUDGET: {
    value: "frontend_budget_tab",
    title: "BUDGET",
    type: "read",
    route: "/app/dashboard/frontend-dashboard/finance/budget",
  },

  FRONTEND_PAYMENT_SCHEDULE: {
    value: "frontend_payment_schedule_tab",
    title: "PAYMENT SCHEDULE",
    type: "read",
    route: "/app/dashboard/frontend-dashboard/finance/payment-schedule",
  },

  FRONTEND_VOUCHER: {
    value: "frontend_voucher_tab",
    title: "VOUCHER",
    type: "read",
    route: "/app/dashboard/frontend-dashboard/finance/voucher",
  },

  //Data
  FRONTEND_LEADS: {
    value: "frontend_leads_tab",
    title: "LEADS",
    type: "read",
    route: "/app/dashboard/frontend-dashboard/data/leads",
  },
  FRONTEND_WEBSITE_ISSUE_REPORTS: {
    value: "frontend_website_issue_reports_tab",
    title: "WEBSITE ISSUE REPORTS",
    type: "read",
    route: "/app/dashboard/frontend-dashboard/data/website-issue-reports",
  },
  FRONTEND_ASSET_LIST: {
    value: "frontend_asset_list_tab",
    title: "ASSET LIST",
    type: "read",
    route: "/app/dashboard/frontend-dashboard/data/asset-list",
  },
  FRONTEND_MONTHLY_INVOICE_REPORTS: {
    value: "frontend_monthly_invoice_reports_tab",
    title: "MONTHLY INVOICE REPORTS",
    type: "read",
    route: "/app/dashboard/frontend-dashboard/data/monthly-invoice-reports",
  },
  FRONTEND_VENDOR: {
    value: "frontend_vendor_tab",
    title: "VENDOR",
    type: "read",
    route: "/app/dashboard/frontend-dashboard/data/vendor",
  },

  //Settings
  FRONTEND_BULK_UPLOAD: {
    value: "frontend_bulk_upload_tab",
    title: "BULK UPLOAD",
    type: "read",
    route: "/app/dashboard/frontend-dashboard/settings/bulk-upload",
  },

  FRONTEND_SOPS: {
    value: "frontend_sops_tab",
    title: "SOPS",
    type: "read",
    route: "/app/dashboard/frontend-dashboard/settings/sops",
  },

  FRONTEND_POLICIES: {
    value: "frontend_policies_tab",
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

  //PROFILE
  PROFILE_MY_PROFILE: {
    value: "my_profile",
    title: "MY PROFILE",
    route: "/app/profile/my-profile",
    type: "read",
  },

  PROFILE_CHANGE_PASSWORD: {
    value: "change_password",
    title: "CHANGE PASSWORD",
    route: "/app/profile/change-password",
    type: "read",
  },

  PROFILE_PERMISSIONS: {
    value: "permissions",
    title: "PERMISSIONS",
    route: "/app/profile/permissions",
    type: "read",
  },
  PROFILE_HR: {
    value: "hr",
    title: "HR",
    route: "/app/profile/hr",
    type: "read",
  },
  PROFILE_ASSETS: {
    value: "assets",
    title: "ASSETS",
    route: "/app/profile/assets",
    type: "read",
  },

  PROFILE_MY_MEETINGS: {
    value: "my_meetings",
    title: "MY MEETINGS",
    route: "/app/profile/my-meetings",
    type: "read",
  },

  PROFILE_TICKETS_HISTORY: {
    value: "tickets_history",
    title: "TICKETS HISTORY",
    route: "/app/profile/tickets-history",
    type: "read",
  },
};
