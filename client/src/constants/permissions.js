export const PERMISSIONS = {
  // =========================
  // ASSETS MODULE
  // =========================
  ASSETS_VIEW_ASSETS: {
    value: "view_assets",
    type: "read",
    title: "VIEW ASSETS",
  },
  ASSETS_MANAGE_ASSETS: {
    value: "manage_assets",
    type: "read",
    title: "MANAGE ASSETS",
  },
  ASSETS_ASSIGNED_UNASSIGNED: {
    value: "assigned_unassigned",
    type: "read",
    title: "ASSIGNED AND UNASSIGNED ASSETS",
  },
  ASSETS_ASSIGNED_ASSETS: {
    value: "assigned_assets",
    type: "read",
    title: "ASSIGNED ASSETS",
  },

  // =========================
  // TICKETS MODULE
  // =========================
  TICKETS_RAISE_TICKET: {
    value: "raise_ticket",
    type: "read",
    route: "/app/tickets/raise-ticket",
    title: "RAISE TICKET",
  },
  TICKETS_MANAGE_TICKETS: {
    value: "manage_tickets",
    type: "read",
    route: "/app/tickets/manage-tickets",
    title: "MANAGE TICKETS",
  },
  TICKETS_RECIEVED_TICKETS: {
    value: "recieved_tickets",
    type: "read",
    route: "/app/tickets/manage-tickets",
    title: "RECEIVED TICKETS",
  },
  TICKETS_ACCEPTED_TICKETS: {
    value: "accepted_tickets",
    type: "read",
    route: "/app/tickets/manage-tickets",
    title: "ACCEPTED TICKETS",
  },
  TICKETS_ASSIGNED_TICKETS: {
    value: "assigned_tickets",
    type: "read",
    route: "/app/tickets/manage-tickets",
    title: "ASSIGNED TICKETS",
  },
  TICKETS_SUPPORT_TICKETS: {
    value: "support_tickets",
    type: "read",
    route: "/app/tickets/manage-tickets",
    title: "SUPPORT TICKETS",
  },
  TICKETS_ESCALATED_TICKETS: {
    value: "escalated_tickets",
    type: "read",
    route: "/app/tickets/manage-tickets",
    title: "ESCALATED TICKETS",
  },
  TICKETS_CLOSED_TICKETS: {
    value: "closed_tickets",
    type: "read",
    route: "/app/tickets/manage-tickets",
    title: "CLOSED TICKETS",
  },
  TICKETS_TICKET_SETTINGS: {
    value: "ticket_settings",
    type: "read",
    route: "/app/tickets/settings",
    title: "TICKET SETTINGS",
  },
  TICKETS_REPORTS: {
    value: "ticket_reports",
    type: "read",
    route: "/app/tickets/reports",
    title: "TICKET REPORTS",
  },
  TICKETS_TEAM_MEMBERS: {
    value: "tickets_team_members",
    type: "read",
    route: "/app/tickets/team-members",
    title: "TICKET TEAM MEMBERS",
  },

  TICKETS_TOTAL_TICKETS_DONUT: {
    value: "total_tickets_donut",
    type: "read",
    title: "TOTAL TICKETS DONUT",
  },
  TICKETS_DEPARTMENT_TICKETS_DONUT: {
    value: "department_tickets_donut",
    type: "read",
    title: "DEPARTMENT TICKETS DONUT",
  },
  TICKETS_PRIORITY_WISE_TICKETS_DATA_CARD: {
    value: "priority_wise_tickets_data_card",
    type: "read",
    title: "PRIORITY WISE TICKETS",
  },
  TICKETS_DEPARTMENT_TICKETS_DATA_CARD: {
    value: "department_tickets_data_card",
    type: "read",
    title: "DEPARTMENT TICKETS",
  },
  TICKETS_PERSONAL_TICKETS_DATA_CARD: {
    value: "personal_tickets_data_card",
    type: "read",
    title: "PERSONAL TICKETS",
  },
  TICKETS_OVERALL_DEPARTMENT_WISE_TICKETS: {
    value: "overall_department_wise_tickets",
    type: "read",
    title: "OVERALL DEPARTMENT WISE TICKETS",
  },

  // =========================
  // PERFORMANCE MODULE
  // =========================
  PERFORMANCE_DAILY_KRA: {
    value: "daily_kra",
    type: "read",
    route: "daily-KRA",
    title: "DAILY KRA",
  },
  PERFORMANCE_MONTHLY_KPA: {
    value: "monthly_kpa",
    type: "read",
    route: "monthly-KPA",
    title: "MONTHLY KPA",
  },

  // =========================
  // TASKS MODULE
  // =========================
  TASKS_OVERALL_AVERAGE_COMPLETION: {
    value: "overall_average_task_completion",
    type: "read",
    title: "OVERALL TASK COMPLETION",
  },
  TASKS_MY_TASKS: {
    value: "my_tasks",
    type: "read",
    title: "MY TASKS",
  },
  TASKS_DEPARTMENT_TASKS: {
    value: "department_tasks",
    type: "read",
    title: "DEPARTMENT TASKS",
  },
  TASKS_TEAM_MEMBERS: {
    value: "task_team_members",
    type: "read",
    title: "TASK TEAM MEMBERS",
  },
  TASKS_REPORTS: {
    value: "task_reports",
    type: "read",
    title: "TASK REPORTS",
  },
  TASKS_SETTINGS: {
    value: "task_settings",
    type: "read",
    title: "TASK SETTINGS",
  },
  TASKS_TOTAL_DEPARTMENT_TASKS: {
    value: "total_department_tasks",
    type: "read",
    title: "TOTAL DEPARTMENT TASKS",
  },
  TASKS_TOTAL_DEPARTMENT_PENDING_TASKS: {
    value: "total_department_pending_tasks",
    type: "read",
    title: "PENDING DEPARTMENT TASKS",
  },
  TASKS_TOTAL_DEPARTMENT_COMPLETED_TASKS: {
    value: "total_department_completed_tasks",
    type: "read",
    title: "COMPLETED DEPARTMENT TASKS",
  },
  TASKS_OVERALL_PENDING_VS_COMPLETED: {
    value: "overall_pending_vs_completed",
    type: "read",
    title: "PENDING VS COMPLETED TASKS",
  },
  TASKS_DEPARTMENT_WISE_PENDING: {
    value: "department_wise_pending",
    type: "read",
    title: "DEPARTMENT WISE PENDING TASKS",
  },
  TASKS_HIGH_PRIORITY_DUE: {
    value: "high_priority_due",
    type: "read",
    title: "HIGH PRIORITY DUE TASKS",
  },
  TASKS_MY_MEETINGS_TODAY: {
    value: "my_meetings_today",
    type: "read",
    title: "MY MEETINGS TODAY",
  },
  TASKS_RECENTLY_ADDED: {
    value: "recently_added",
    type: "read",
    title: "RECENTLY ADDED TASKS",
  },
  TASKS_MY_TASK_REPORTS: {
    value: "my_task_reports",
    type: "read",
    route: "/app/tasks/reports/my-task-reports",
    title: "MY TASK REPORTS",
  },
  TASKS_ASSIGNED_TASKS_REPORTS: {
    value: "assigned_tasks_reports",
    type: "read",
    route: "/app/tasks/reports/assigned-task-reports",
    title: "ASSIGNED TASK REPORTS",
  },

  // =========================
  // VISITORS MODULE
  // =========================
  VISITORS_MONTHLY_TOTAL_VISITORS: {
    value: "visitors_monthly_total_visitors",
    type: "read",
    title: "MONTHLY TOTAL VISITORS",
  },
  VISITORS_ADD_VISITOR: {
    value: "add_visitor",
    type: "read",
    route: "/app/visitors/add-visitor",
    title: "ADD VISITOR",
  },
  VISITORS_ADD_CLIENT: {
    value: "add_client",
    type: "read",
    route: "/app/visitors/add-client",
    title: "ADD CLIENT",
  },
  VISITORS_MANAGE_VISITORS: {
    value: "manage_visitors",
    type: "read",
    route: "/app/visitors/manage-visitors",
    title: "MANAGE VISITORS",
  },
  VISITORS_TEAM_MEMBERS: {
    value: "visitor_team_members",
    type: "read",
    route: "/app/visitors/team-members",
    title: "VISITOR TEAM MEMBERS",
  },
  VISITORS_REPORTS: {
    value: "visitor_reports",
    type: "read",
    route: "/app/visitors/reports",
    title: "VISITOR REPORTS",
  },
  // =========================
  // MEETINGS MODULE
  // =========================

  // Graphs
  MEETINGS_AVERAGE_ROOM_UTILIZATION: {
    value: "average_room_utilization",
    type: "read",
    title: "AVERAGE ROOM UTILIZATION",
  },
  MEETINGS_EXTERNAL_GUESTS_VISITED: {
    value: "external_guests_visited",
    type: "read",
    title: "EXTERNAL GUESTS VISITED",
  },
  MEETINGS_AVERAGE_OCCUPANCY: {
    value: "average_occupancy",
    type: "read",
    title: "AVERAGE OCCUPANCY",
  },
  MEETINGS_BUSY_TIME_WEEK: {
    value: "busy_time_week",
    type: "read",
    title: "BUSY TIME OF THE WEEK",
  },

  // Cards
  MEETINGS_BOOK_MEETING: {
    value: "book_meeting",
    type: "read",
    access: "page",
    route: "/app/meetings/book-meeting",
    title: "BOOK MEETING",
  },
  MEETINGS_MANAGE_MEETINGS: {
    value: "manage_meetings",
    type: "read",
    title: "MANAGE MEETINGS",
  },
  MEETINGS_CALENDAR: {
    value: "calendar",
    type: "read",
    title: "MEETINGS CALENDAR",
  },
  MEETINGS_REPORTS: {
    value: "reports",
    type: "read",
    title: "MEETING REPORTS",
  },
  MEETINGS_REVIEWS: {
    value: "reviews",
    type: "read",
    title: "MEETING REVIEWS",
  },
  MEETINGS_SETTINGS: {
    value: "settings",
    type: "read",
    title: "MEETING SETTINGS",
  },

  // Pie Charts
  MEETINGS_ROOM_STATUS: {
    value: "room_status",
    type: "read",
    title: "ROOM STATUS",
  },
  MEETINGS_HOUSEKEEPING_STATUS: {
    value: "housekeeping_status",
    type: "read",
    title: "HOUSEKEEPING STATUS",
  },
  MEETINGS_DURATION_BREAKDOWN: {
    value: "duration_breakdown",
    type: "read",
    title: "MEETING DURATION BREAKDOWN",
  },

  // Tabs
  MEETINGS_MEETINGS_INTERNAL: {
    value: "manage_meetings_internal",
    type: "read",
    access: "page",
    route: "/app/meetings/manage-meetings/internal-meetings",
    title: "INTERNAL MEETINGS",
  },
  MEETINGS_MEETINGS_EXTERNAL: {
    value: "manage_meetings_external",
    type: "read",
    access: "page",
    route: "/app/meetings/manage-meetings/external-meetings",
    title: "EXTERNAL MEETINGS",
  },

  // Data Cards
  MEETINGS_HOURS_BOOKED: {
    value: "hours_booked",
    type: "read",
    title: "HOURS BOOKED",
  },
  MEETINGS_UNIQUE_BOOKINGS: {
    value: "unique_bookings",
    type: "read",
    title: "UNIQUE BOOKINGS",
  },
  MEETINGS_BIZ_NEST_BOOKINGS: {
    value: "biz_nest_bookings",
    type: "read",
    title: "BIZ NEST BOOKINGS",
  },
  MEETINGS_GUEST_BOOKINGS: {
    value: "guest_bookings",
    type: "read",
    title: "GUEST BOOKINGS",
  },
  MEETINGS_AVERAGE_HOURS_BOOKED: {
    value: "average_hours_booked",
    type: "read",
    title: "AVERAGE HOURS BOOKED",
  },
  MEETINGS_HOURS_CANCELLED: {
    value: "hours_cancelled",
    type: "read",
    title: "HOURS CANCELLED",
  },

  // Tables
  MEETINGS_INTERNAL_ONGOING_MEETINGS: {
    value: "internal_ongoing_meetings",
    type: "read",
    title: "ONGOING INTERNAL MEETINGS",
  },
  MEETINGS_EXTERNAL_ONGOING_MEETINGS: {
    value: "external_ongoing_meetings",
    type: "read",
    title: "ONGOING EXTERNAL MEETINGS",
  },

  // Buttons
  MEETINGS_ADD_ROOM: {
    value: "add_room",
    type: "write",
    access: "button",
    title: "ADD MEETING ROOM",
  },

  // =========================
  // FINANCE MODULE
  // =========================
  FINANCE_CASHFLOW: {
    value: "cashflow",
    type: "read",
    title: "CASHFLOW",
  },
  FINANCE_FINANCE: {
    value: "finance_finance",
    type: "read",
    title: "FINANCE OVERVIEW",
  },
  FINANCE_BILLING: {
    value: "billing",
    type: "read",
    title: "BILLING",
  },
  FINANCE_MIX_BAG: {
    value: "finance_mix_bag",
    type: "read",
    title: "FINANCE MIX BAG",
  },
  FINANCE_DATA: {
    value: "finance_data",
    type: "read",
    title: "FINANCE DATA",
  },
  FINANCE_SETTINGS: {
    value: "finance_settings",
    type: "read",
    title: "FINANCE SETTINGS",
  },

  FINANCE_PAYOUTS: {
    value: "finance_payouts_pie_chart",
    type: "read",
    title: "PAYOUTS BREAKDOWN",
  },
  FINANCE_CUSTOMER_COLLECTIONS: {
    value: "finance_customer_collections_pie_chart",
    type: "read",
    title: "CUSTOMER COLLECTIONS",
  },
  FINANCE_STATUTORY_PAYMENTS_DONUT: {
    value: "finance_statutory_payments_donut_chart",
    type: "read",
    title: "STATUTORY PAYMENTS",
  },
  FINANCE_RENTAL_PAYMENTS_DONUT: {
    value: "finance_rental_payments_donut_chart",
    type: "read",
    title: "RENTAL PAYMENTS",
  },
  FINANCE_PAYOUTS_MUI_TABLE: {
    value: "finance_payouts_table",
    type: "read",
    title: "PAYOUTS TABLE",
  },
  FINANCE_INCOME_EXPENSE_YEARLY_GRAPH: {
    value: "finance_income_expense_yearly_graph",
    type: "read",
    title: "YEARLY INCOME VS EXPENSE",
  },
  FINANCE_INCOME_DATA_CARD: {
    value: "finance_income_data_card",
    type: "read",
    title: "TOTAL INCOME",
  },
  FINANCE_EXPENSE_DATA_CARD: {
    value: "finance_expense_data_card",
    type: "read",
    title: "TOTAL EXPENSE",
  },
  FINANCE_PL_DATA_CARD: {
    value: "finance_pl_data_card",
    type: "read",
    title: "PROFIT AND LOSS",
  },

  // =========================
  // SALES DASHBOARD
  // =========================
  SALES_TURNOVER: {
    value: "turnover",
    type: "read",
    title: "TURNOVER",
  },
  SALES_FINANCE: {
    value: "finance",
    type: "read",
    title: "SALES FINANCE",
  },
  SALES_MIX_BAG: {
    value: "mix_bag",
    type: "read",
    title: "SALES MIX BAG",
  },
  SALES_DATA: {
    value: "data",
    type: "read",
    title: "SALES DATA",
  },
  SALES_SETTINGS: {
    value: "settings",
    type: "read",
    title: "SALES SETTINGS",
  },

  SALES_REVENUE: {
    value: "revenue",
    type: "read",
    title: "REVENUE",
  },
  SALES_KEY_STATS: {
    value: "key_stats",
    type: "read",
    title: "KEY STATISTICS",
  },
  SALES_AVERAGE: {
    value: "average",
    type: "read",
    title: "AVERAGE PERFORMANCE",
  },

  SALES_DEPARTMENT_REVENUES: {
    value: "department_revenues",
    type: "read",
    title: "DEPARTMENT REVENUES",
  },
  SALES_MONTHLY_UNIQUE_LEADS: {
    value: "monthly_unique_leads",
    type: "read",
    title: "MONTHLY UNIQUE LEADS",
  },
  SALES_SOURCING_CHANNELS: {
    value: "sourcing_channels",
    type: "read",
    title: "SOURCING CHANNELS",
  },
  // =========================
  // HR MODULE
  // =========================

  // Graphs
  HR_DEPARTMENT_EXPENSE: {
    value: "hr_department_expense",
    type: "read",
    title: "HR DEPARTMENT EXPENSE",
  },

  // Cards
  HR_EMPLOYEE: {
    value: "employee",
    type: "read",
    title: "HR EMPLOYEE",
  },
  HR_COMPANY: {
    value: "company",
    type: "read",
    title: "HR COMPANY",
  },
  HR_FINANCE: {
    value: "hr_finance",
    type: "read",
    title: "HR FINANCE",
  },
  HR_MIX_BAG: {
    value: "hr_mix_bag",
    type: "read",
    title: "HR MIX BAG",
  },
  HR_DATA: {
    value: "hr_data",
    type: "read",
    title: "HR DATA",
  },
  HR_SETTINGS: {
    value: "hr_settings",
    type: "read",
    title: "HR SETTINGS",
  },

  // Data Cards
  HR_EXPENSES: {
    value: "expenses",
    type: "read",
    title: "HR EXPENSES",
  },
  HR_AVERAGES: {
    value: "averages",
    type: "read",
    title: "HR AVERAGES",
  },

  // Tables
  HR_ANNUAL_KPA_VS_ACHIEVEMENTS: {
    value: "annual_kpa_vs_achievements",
    type: "read",
    title: "ANNUAL KPA VS ACHIEVEMENTS",
  },
  HR_ANNUAL_TASKS_VS_ACHIEVEMENTS: {
    value: "annual_tasks_vs_achievements",
    type: "read",
    title: "ANNUAL TASKS VS ACHIEVEMENTS",
  },
  HR_CURRENT_MONTH_BIRTHDAY_LIST: {
    value: "current_month_birthday_list",
    type: "read",
    title: "CURRENT MONTH BIRTHDAYS",
  },
  HR_CURRENT_MONTH_HOLIDAY_LIST: {
    value: "current_month_holiday_list",
    type: "read",
    title: "CURRENT MONTH HOLIDAYS",
  },

  // Buttons
  HR_EMPLOYEE_EDIT: {
    value: "hr_employee_edit",
    type: "write",
    access: "button",
    title: "EDIT EMPLOYEE",
  },

  // Pie Charts
  HR_EMPLOYEE_GENDER_DISTRIBUTION_PIE: {
    value: "gender_distribution_pie_chart",
    type: "read",
    title: "EMPLOYEE GENDER DISTRIBUTION",
  },
  HR_CITY_WISE_EMPLOYEES_PIE: {
    value: "city_wise_employees_pie_chart",
    type: "read",
    title: "CITY WISE EMPLOYEES",
  },

  // Employee
  HR_EMPLOYEE_LIST: {
    value: "employee_list",
    type: "read",
    route: "/app/dashboard/HR-dashboard/employee/employee-list",
    title: "EMPLOYEE LIST",
  },
  HR_PAST_EMPLOYEES: {
    value: "past_employees",
    type: "read",
    route: "/app/dashboard/HR-dashboard/employees/past-employees",
    title: "PAST EMPLOYEES",
  },
  HR_ATTENDANCE: {
    value: "attendance",
    type: "read",
    route: "/app/dashboard/HR-dashboard/attendance",
    title: "ATTENDANCE",
  },
  HR_LEAVES: {
    value: "leaves",
    type: "read",
    route: "/app/dashboard/HR-dashboard/leaves",
    title: "LEAVES",
  },
  HR_EMPLOYEE_ONBOARDING: {
    value: "employee_onboarding",
    type: "read",
    route: "/app/dashboard/HR-dashboard/employees/employee-onboarding",
    title: "EMPLOYEE ONBOARDING",
  },

  // Company
  HR_COMPANY_LOGO: {
    value: "company_logo",
    type: "read",
    title: "COMPANY LOGO",
  },
  HR_COMPANY_HANDBOOK: {
    value: "company_handbook",
    type: "read",
    title: "COMPANY HANDBOOK",
  },
  HR_DEPARTMENTS: {
    value: "departments",
    type: "read",
    route: "/app/dashboard/HR-dashboard/company/departments",
    title: "DEPARTMENTS",
  },
  HR_WORK_LOCATIONS: {
    value: "work_locations",
    type: "read",
    route: "/app/dashboard/HR-dashboard/company/work-locations",
    title: "WORK LOCATIONS",
  },
  HR_HOLIDAYS: {
    value: "holidays",
    type: "read",
    route: "/app/dashboard/HR-dashboard/company/holidays",
    title: "HOLIDAYS",
  },
  HR_EVENTS: {
    value: "events",
    type: "read",
    route: "/app/dashboard/HR-dashboard/company/events",
    title: "EVENTS",
  },
  HR_COMPANY_POLICIES: {
    value: "company_policies",
    type: "read",
    route: "/app/dashboard/HR-dashboard/company/policies",
    title: "COMPANY POLICIES",
  },
  HR_COMPANY_SOPS: {
    value: "company_sops",
    type: "read",
    route: "/app/dashboard/HR-dashboard/company/sops",
    title: "COMPANY SOPS",
  },
  HR_EMPLOYEE_TYPES: {
    value: "employee_types",
    type: "read",
    route: "/app/dashboard/HR-dashboard/company/employee-type",
    title: "EMPLOYEE TYPES",
  },
  HR_SHIFTS: {
    value: "shifts",
    type: "read",
    route: "/app/dashboard/HR-dashboard/company/shifts",
    title: "SHIFTS",
  },
  HR_TEMPLATES: {
    value: "templates",
    type: "read",
    route: "/app/dashboard/HR-dashboard/company/templates",
    title: "HR TEMPLATES",
  },

  // =========================
  // ADMIN DASHBOARD
  // =========================
  ADMIN_ANNUAL_EXPENSES: {
    value: "annual_expenses",
    type: "read",
    title: "ANNUAL EXPENSES",
  },
  ADMIN_INVENTORY: {
    value: "inventory",
    type: "read",
    title: "ADMIN INVENTORY",
  },
  ADMIN_FINANCE: {
    value: "finance",
    type: "read",
    title: "ADMIN FINANCE",
  },
  ADMIN_MIX_BAG: {
    value: "mix_bag",
    type: "read",
    title: "ADMIN MIX BAG",
  },
  ADMIN_DATA: {
    value: "data",
    type: "read",
    title: "ADMIN DATA",
  },
  ADMIN_SETTINGS: {
    value: "settings",
    type: "read",
    title: "ADMIN SETTINGS",
  },

  ADMIN_DEPARTMENT_EXPENSE: {
    value: "department_expense",
    type: "read",
    title: "ADMIN DEPARTMENT EXPENSE",
  },

  // =========================
  // MAINTENANCE DASHBOARD
  // =========================
  MAINTENANCE_DEPARTMENT_EXPENSES: {
    value: "department_expenses",
    type: "read",
    title: "MAINTENANCE DEPARTMENT EXPENSES",
  },
  MAINTENANCE_ANNUAL_EXPENSES: {
    value: "annual_expenses",
    type: "read",
    title: "MAINTENANCE ANNUAL EXPENSES",
  },
  MAINTENANCE_INVENTORY: {
    value: "inventory",
    type: "read",
    title: "MAINTENANCE INVENTORY",
  },
  MAINTENANCE_FINANCE: {
    value: "finance",
    type: "read",
    title: "MAINTENANCE FINANCE",
  },
  MAINTENANCE_MIX_BAG: {
    value: "mix_bag",
    type: "read",
    title: "MAINTENANCE MIX BAG",
  },
  MAINTENANCE_DATA: {
    value: "data",
    type: "read",
    title: "MAINTENANCE DATA",
  },
  MAINTENANCE_SETTINGS: {
    value: "settings",
    type: "read",
    title: "MAINTENANCE SETTINGS",
  },
  // =========================
  // ADMIN DASHBOARD (CONT.)
  // =========================

  ADMIN_TOTAL_ADMIN_OFFICES: {
    value: "total_admin_offices",
    type: "read",
    title: "TOTAL ADMIN OFFICES",
  },
  ADMIN_MONTHLY_DUE_TASKS: {
    value: "monthly_due_tasks",
    type: "read",
    title: "MONTHLY DUE TASKS",
  },
  ADMIN_MONTHLY_EXPENSE: {
    value: "monthly_expense",
    type: "read",
    title: "MONTHLY EXPENSE",
  },
  ADMIN_TOP_EXECUTIVE: {
    value: "top_executive",
    type: "read",
    title: "TOP EXECUTIVE",
  },
  ADMIN_EXPENSE_PER_SQFT: {
    value: "expense_per_sqft",
    type: "read",
    title: "EXPENSE PER SQFT",
  },
  ADMIN_ELECTRICITY_EXPENSE_PER_SQFT: {
    value: "electricity_expense_per_sqft",
    type: "read",
    title: "ELECTRICITY EXPENSE PER SQFT",
  },

  ADMIN_WEEKLY_EXECUTIVE_SHIFT_TIMING: {
    value: "weekly_executive_shift_timing",
    type: "read",
    title: "WEEKLY EXECUTIVE SHIFT TIMING",
  },
  ADMIN_UPCOMING_EVENTS_LIST: {
    value: "upcoming_events_list",
    type: "read",
    title: "UPCOMING EVENTS",
  },
  ADMIN_UPCOMING_CLIENT_MEMBER_BIRTHDAYS: {
    value: "upcoming_client_member_birthdays",
    type: "read",
    title: "UPCOMING CLIENT MEMBER BIRTHDAYS",
  },
  ADMIN_UPCOMING_CLIENT_ANNIVERSARIES: {
    value: "upcoming_client_anniversaries",
    type: "read",
    title: "UPCOMING CLIENT ANNIVERSARIES",
  },
  ADMIN_NEWLY_JOINED_HOUSE_KEEPING_MEMBERS: {
    value: "newly_joined_house_keeping_members",
    type: "read",
    title: "NEWLY JOINED HOUSEKEEPING MEMBERS",
  },

  ADMIN_UNIT_WISE_DUE_TASKS: {
    value: "unit_wise_due_tasks",
    type: "read",
    title: "UNIT WISE DUE TASKS",
  },
  ADMIN_EXECUTIVE_WISE_DUE_TASKS: {
    value: "executive_wise_due_tasks",
    type: "read",
    title: "EXECUTIVE WISE DUE TASKS",
  },
  ADMIN_TOTAL_DESKS_COMPANY_WISE: {
    value: "total_desks_company_wise",
    type: "read",
    title: "TOTAL DESKS COMPANY WISE",
  },
  ADMIN_BIOMETRICS_GENDER_DATA: {
    value: "biometrics_gender_data",
    type: "read",
    title: "BIOMETRICS GENDER DATA",
  },

  // =========================
  // MAINTENANCE DASHBOARD (CONT.)
  // =========================

  MAINTENANCE_OFFICES_UNDER_MANAGEMENT: {
    value: "offices_under_management",
    type: "read",
    title: "OFFICES UNDER MANAGEMENT",
  },
  MAINTENANCE_MONTHLY_DUE_TASKS: {
    value: "monthly_due_tasks",
    type: "read",
    title: "MONTHLY DUE TASKS",
  },
  MAINTENANCE_MONTHLY_EXPENSE: {
    value: "monthly_expense",
    type: "read",
    title: "MONTHLY EXPENSE",
  },
  MAINTENANCE_EXPENSE_PER_SQFT: {
    value: "expense_per_sqft",
    type: "read",
    title: "EXPENSE PER SQFT",
  },
  MAINTENANCE_ASSETS_UNDER_MANAGEMENT: {
    value: "assets_under_management",
    type: "read",
    title: "ASSETS UNDER MANAGEMENT",
  },
  MAINTENANCE_MONTHLY_KPA: {
    value: "monthly_kpa",
    type: "read",
    title: "MONTHLY KPA",
  },

  MAINTENANCE_TOP_HIGH_PRIORITY_TASKS: {
    value: "top_high_priority_tasks",
    type: "read",
    title: "TOP HIGH PRIORITY TASKS",
  },
  MAINTENANCE_WEEKLY_EXECUTIVE_SHIFT_TIMING: {
    value: "weekly_executive_shift_timing",
    type: "read",
    title: "WEEKLY EXECUTIVE SHIFT TIMING",
  },

  MAINTENANCE_CATEGORY_WISE_MAINTENANCE: {
    value: "category_wise_maintenance",
    type: "read",
    title: "CATEGORY WISE MAINTENANCE",
  },
  MAINTENANCE_DUE_MAINTENANCE: {
    value: "due_maintenance",
    type: "read",
    title: "DUE MAINTENANCE",
  },
  MAINTENANCE_UNIT_WISE_MAINTENANCE: {
    value: "unit_wise_maintenance",
    type: "read",
    title: "UNIT WISE MAINTENANCE",
  },
  MAINTENANCE_EXECUTION_CHANNEL: {
    value: "execution_channel",
    type: "read",
    title: "EXECUTION CHANNEL",
  },
  MAINTENANCE_AVERAGE_MONTHLY_DUE: {
    value: "average_monthly_due",
    type: "read",
    title: "AVERAGE MONTHLY DUE",
  },
  MAINTENANCE_AVERAGE_YEARLY_DUE: {
    value: "average_yearly_due",
    type: "read",
    title: "AVERAGE YEARLY DUE",
  },

  // =========================
  // IT DASHBOARD
  // =========================

  IT_DEPARTMENT_EXPENSES: {
    value: "it_department_expenses",
    title: "IT DEPARTMENT EXPENSE",
    type: "read",
    access: "page",
  },
  IT_ANNUAL_EXPENSES: {
    value: "it_annual_expenses",
    type: "read",
    access: "page",
    title: "IT ANNUAL EXPENSES",
  },
  IT_INVENTORY: {
    value: "it_inventory",
    type: "read",
    access: "page",
    title: "IT INVENTORY",
  },
  IT_FINANCE: {
    value: "it_finance",
    type: "read",
    access: "page",
    title: "IT FINANCE",
  },
  IT_MIX_BAG: {
    value: "it_mix_bag",
    type: "read",
    access: "page",
    title: "IT MIX BAG",
  },
  IT_DATA: {
    value: "it_data",
    type: "read",
    access: "page",
    title: "IT DATA",
  },
  IT_SETTINGS: {
    value: "it_settings",
    type: "write",
    access: "page",
    title: "IT SETTINGS",
  },

  // =========================
  // FRONTEND DASHBOARD
  // =========================

  FRONTEND_SITE_VISITORS: {
    value: "site_visitors",
    type: "read",
    title: "SITE VISITORS",
  },
  FRONTEND_DEPARTMENT_EXPENSE: {
    value: "department_expense",
    type: "read",
    title: "FRONTEND DEPARTMENT EXPENSE",
  },
  FRONTEND_WEBSITE_ISSUES_RAISED: {
    value: "website_issues_raised",
    type: "read",
    title: "WEBSITE ISSUES RAISED",
  },

  FRONTEND_CREATE_WEBSITE: {
    value: "create_website",
    type: "read",
    access: "page",
    title: "CREATE WEBSITE",
  },
  FRONTEND_EDIT_WEBSITE: {
    value: "edit_website",
    type: "read",
    access: "page",
    title: "EDIT WEBSITE",
  },
  FRONTEND_NEW_THEMES: {
    value: "new_themes",
    type: "read",
    access: "page",
    title: "NEW THEMES",
  },
  FRONTEND_FINANCE: {
    value: "finance",
    type: "read",
    access: "page",
    title: "FRONTEND FINANCE",
  },
  FRONTEND_DATA: {
    value: "data",
    type: "read",
    access: "page",
    title: "FRONTEND DATA",
  },
  FRONTEND_SETTINGS: {
    value: "settings",
    type: "write",
    access: "page",
    title: "FRONTEND SETTINGS",
  },

  // =========================
  // ACCESS
  // =========================

  ACCESS_PERMISSIONS: {
    value: "access_permissions",
    access: "page",
    type: "write",
    title: "ACCESS PERMISSIONS",
  },
};
