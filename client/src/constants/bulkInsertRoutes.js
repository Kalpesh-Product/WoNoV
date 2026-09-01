const bulkInsertRoutes = [
  {
    department: "6798bae6e469e809084e24a4", //Admin Department
    bulkInsertRoutes: [
      {
        name: "assets",
        fileKey: "assets",
        route: "/api/assets/bulk-insert-assets/6798bae6e469e809084e24a4",
      },
      // {
      //   name: "budget",
      //   fileKey: "budgets",
      //   route: "/api/budget/bulk-insert-budget/6798bae6e469e809084e24a4",
      // },
      // {
      //   name: "performance",
      //   fileKey: "performance-tasks",
      //   route:
      //     "/api/performance/bulk-insert-performance-tasks/6798bae6e469e809084e24a4",
      // },
      {
        name: "vendors",
        fileKey: "vendors",
        route: "/api/vendors/bulk-insert-vendors/6798bae6e469e809084e24a4",
      },
      // {
      //   name: "weekly shift",
      //   fileKey: "schedule",
      //   route: "/api/administration/bulk-insert-weekly-shift-schedule",
      // },
      {
        name: "client events",
        fileKey: "client-events",
        route: "/api/administration/bulk-insert-client-events",
      },
      // {
      //   name: "co-working members",
      //   fileKey: "members",
      //   route: "/api/sales/bulk-insert-co-working-client-members",
      // },
      // {
      //   name: "house-keeping schedule",
      //   route: "/api/company/bulk-insert-housekeeping-schedule",
      // },
      {
        name: "inventory",
        route: "/api/invenotry/bulk-insert-inventory/6798bae6e469e809084e24a4",
      },
    ],
  },
  {
    department: "6798ba9de469e809084e2494", // Tech / Frontend Department
    bulkInsertRoutes: [
      {
        name: "performance",
        aliases: [
          "KRA",
          "KPA",
          "KRA KPA",
          "KRA/KPA",
          "KRA And KPA",
          "performance",
        ],
        fileKey: "performance",
        route:
          "/api/performance/bulk-upload-performance-tasks",
      },
      {
        name: "tasks",    
        fileKey: "file",
        route:
          "api/tasks/bulk-insert",
      },
      {
        name: "assets",
        aliases: ["Asset - Overall"],
        fileKey: "assets",
        route: "/api/assets/bulk-insert-assets/6798ba9de469e809084e2494",
      },
      {
        name: "vendors",
        aliases: ["Vendor - Overall"],
        fileKey: "vendors",
        route: "/api/vendors/bulk-insert-vendors/6798ba9de469e809084e2494",
      },
      {
        name: "inventory",
        aliases: ["Inventory - Overall"],
        fileKey: "inventory",
        route: "/api/invenotry/bulk-insert-inventory/6798ba9de469e809084e2494",
      },
      {
        name: "Expense And Budget",
        aliases: [
          "Expense And Budget - Overall",
          "Expense & Budget",
          "Budget",
          "Budgets",
        ],
        fileKey: "budgets",
        sourceDepartmentId: "6798bab0e469e809084e249a",
        route: "/api/budget/bulk-insert-budget/6798ba9de469e809084e2494",
      },
      {
        name: "Coworking Revenue",
        aliases: ["Coworking Revenue - Finance & Sales"],
        fileKey: "coworking-revenues",
        sourceDepartmentId: "6798bab0e469e809084e249a",
        route: "/api/sales/bulk-insert-coworking-client-revenue",
      },
      {
        name: "Virtual Office Revenue",
        aliases: ["Virtual Office Revenue - Finance & Sales"],
        fileKey: "virtual-office-revenue",
        sourceDepartmentId: "6798bab0e469e809084e249a",
        route: "/api/sales/bulk-insert-virtual-office-revenue",
      },
      {
        name: "Alternate Revenue",
        aliases: ["Alternate Revenue - Finance & Sales"],
        fileKey: "alternate-revenue",
        sourceDepartmentId: "6798bab0e469e809084e249a",
        route: "/api/sales/bulk-insert-alternate-revenue",
      },
      {
        name: "Workation Revenue",
        aliases: [
          "Workation Revenues",
          "Workation Revenue - Finance & Sales",
          "Workation Revenues - Finance & Sales",
        ],
        fileKey: "workation-revenue",
        sourceDepartmentId: "6798bab0e469e809084e249a",
        route: "/api/sales/bulk-insert-workation-revenue",
      },
      {
        name: "Virtual Office Clients",
        aliases: ["Virtual Office Client", "Virtual Office Clients - Sales"],
        fileKey: "virtualoffice",
        sourceDepartmentId: "6798bacce469e809084e24a1",
        route: "/api/sales/bulk-insert-virtual-office-clients",
      },
      {
        name: "Leads",
        aliases: ["Lead", "Leads - Sales"],
        fileKey: "leads",
        sourceDepartmentId: "6798bacce469e809084e24a1",
        route: "/api/sales/bulk-insert-leads",
      },
      {
        name: "weekly shift",
        aliases: [
          "weekly shift schedule",
          "admin weekly shift schedule",
          "weekly shift schedule - admin",
        ],
        fileKey: "schedule",
        sourceDepartmentId: "6798bae6e469e809084e24a4",
        route: "/api/administration/bulk-insert-weekly-shift-schedule/6798bae6e469e809084e24a4",
      },
      {
        name: "Holidays And Events",
        aliases: [
          "Holidays / Events",
          "Holiday Events",
          "Holidays and Events",
          "Events",
        ],
        fileKey: "events",
        sourceDepartmentId: "6798bab9e469e809084e249e",
        route: "/api/events/bulk-insert-events",
      },
      {
        name: "client events",
        aliases: ["Client Events -Admin"],
        fileKey: "client-events",
        sourceDepartmentId: "6798bae6e469e809084e24a4",
        route: "/api/administration/bulk-insert-client-events",
      },
      {
        name: "co-working client members",
        aliases: [
          "client member details",
          "client member details -admin",
          "co-working members",
        ],
        fileKey: "members",
        sourceDepartmentId: "6798bae6e469e809084e24a4",
        route: "/api/sales/bulk-insert-co-working-client-members",
      },
      {
        name: "Housekeeping Weekly Shift Schedule - Admin",
        aliases: [
          "house-keeping schedule",
          "housekeeping weekly shift schedule",
          "housekeeping weekly shift schedule -admin",
          "housekeeping weekly shift schedule - admin",
          "housekeeping schedule",
        ],
        fileKey: "housekeeping-schedule",
        sourceDepartmentId: "6798bae6e469e809084e24a4",
        route: "/api/company/bulk-insert-housekeeping-schedule",
      },
      {
        name: "unitwise data",
        aliases: ["unitwise", "unitwise data -admin"],
        fileKey: "units",
        sourceDepartmentId: "6798bae6e469e809084e24a4",
        route: "/api/company/bulk-add-locations",
      },
      {
        name: "AMC Records - IT & Maintainence",
        aliases: [
          "AMC Records",
          "AMC Records - IT & Maintainence",
          "AMC Records - IT & Maintenance",
          "AMC Records - Maintenance",
          "AMC Records - IT",
          "AMC",
        ],
        fileKey: "amc-records",
        sourceDepartmentId: "6798baa8e469e809084e2497",
        route: "/api/amc/bulk-insert-amc-records/6798baa8e469e809084e2497",
      },
      {
        name: "Maintenance Weekly Shift Schedule",
        aliases: [
          "Maintenance Weekly Shift Schedule - Maintainence",
          "Maintenance Weekly Shift Schedule - Maintenance",
          "Maintenance Weekly Shift",
          "Maintenance Weekly Schedule",
          "Maintenance Shift Schedule",
        ],
        fileKey: "schedule",
        sourceDepartmentId: "6798bafbe469e809084e24a7",
        route:
          "/api/administration/bulk-insert-weekly-shift-schedule/6798bafbe469e809084e24a7",
      },
      {
        name: "Housekeeping Weekly Shift Schedule",
        aliases: [
          "Housekeeping Weekly Shift Schedule - Hr",
          "Housekeeping Weekly Shift Schedule - HR",
          "Housekeeping Weekly Shift",
          "Housekeeping Schedule - Hr",
          "Housekeeping Schedule",
        ],
        fileKey: "housekeeping-schedule",
        sourceDepartmentId: "6798bab9e469e809084e249e",
        route: "/api/company/bulk-insert-housekeeping-schedule",
      },
      {
        name: "IT Weekly Shift Timings",
        aliases: [
          "IT Weekly Shift Timings - IT",
          "IT Weekly Shift Timing - IT",
          "weekly shift timings",
          "weekly shift timing",
          "IT Weekly Shift",
        ],
        fileKey: "schedule",
        sourceDepartmentId: "6798baa8e469e809084e2497",
        route:
          "/api/administration/bulk-insert-weekly-shift-schedule/6798baa8e469e809084e2497",
      },
      {
        name: "Employee Leaves",
        aliases: ["Leaves", "Leave", "Employee Leaves - Hr"],
        fileKey: "leaves",
        sourceDepartmentId: "6798bab9e469e809084e249e",
        route: "/api/leaves/bulk-insert-leaves",
      },
      {
        name: "Attendance",
        aliases: ["Attandance", "Attendance - Hr"],
        fileKey: "attandance",
        sourceDepartmentId: "6798bab9e469e809084e249e",
        route: "/api/attendance/bulk-insert-attandance",
      },
      {
        name: "Employee Data",
        aliases: ["Users", "Employee", "Employee Data -Hr"],
        fileKey: "users",
        sourceDepartmentId: "6798bab9e469e809084e249e",
        route: "/api/users/bulk-insert-users",
      },
    ],
  },
  {
    department: "6798bab0e469e809084e249a", // Finance Department
    bulkInsertRoutes: [
      {
        name: "Alternate Revenue",
        aliases: ["Alternate Revenue - Finance & Sales"],
        fileKey: "alternate-revenue",
        route: "/api/sales/bulk-insert-alternate-revenue",
      },
      {
        name: "Coworking Revenue",
        aliases: ["Coworking Revenue - Finance & Sales"],
        fileKey: "coworking-revenues",
        route: "/api/sales/bulk-insert-coworking-client-revenue",
      },
      {
        name: "Virtual Office Revenue",
        aliases: ["Virtual Office Revenue - Finance & Sales"],
        fileKey: "virtual-office-revenue",
        route: "/api/sales/bulk-insert-virtual-office-revenue",
      },
      {
        name: "Workation Revenue",
        aliases: [
          "Workation Revenues",
          "Workation Revenue - Finance & Sales",
          "Workation Revenues - Finance & Sales",
        ],
        fileKey: "workation-revenue",
        route: "/api/sales/bulk-insert-workation-revenue",
      },
      {
        name: "Expense And Budget",
        fileKey: "budgets",
        route: "/api/budget/bulk-insert-budget/6798bab0e469e809084e249a",
      },
    ],
  },
  {
    department: "6798bacce469e809084e24a1", //sales Department
    bulkInsertRoutes: [
      {
        name: "assets",
        fileKey: "assets",
        route: "/api/assets/bulk-insert-assets/6798bacce469e809084e24a1",
      },
      // {
      //   name: "budget", //working
      //   fileKey: "budgets",
      //   route: "/api/budget/bulk-insert-budget/6798bacce469e809084e24a1",
      // },
      // {
      //   name: "performance", //working
      //   fileKey: "performance-tasks",
      //   route:
      //     "/api/performance/bulk-insert-performance-tasks/6798bacce469e809084e24a1",
      // },
      {
        name: "vendors",
        fileKey: "vendors",
        route: "/api/vendors/bulk-insert-vendors/6798bacce469e809084e24a1",
      },
      // {
      //   name: "co-working members",
      //   fileKey: "members",
      //   route: "/api/sales/bulk-insert-co-working-client-members",
      // },
      {
        name: "Virtual Office Clients",
        aliases: ["Virtual Office Client"],
        fileKey: "virtualoffice",
        route: "/api/sales/bulk-insert-virtual-office-clients",
      },
      {
        name: "Virtual Office Revenue",
        aliases: [
          "Virtual Office Revenues",
          "Virtual Office Revenue - Finance & Sales",
        ],
        fileKey: "virtual-office-revenue",
        route: "/api/sales/bulk-insert-virtual-office-revenue",
      },
      {
        name: "inventory",
        route: "/api/invenotry/bulk-insert-inventory/6798bacce469e809084e24a1",
      },
    ],
  },
];

export default bulkInsertRoutes;
