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
