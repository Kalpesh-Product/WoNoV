const bulkInsertRoutes = [
  {
    department: "6798bae6e469e809084e24a4", //Admin Department
    bulkInsertRoutes: [
      {
        name: "assets",
        fileKey: "assets",
        route: "/api/assets/bulk-insert-assets/6798bae6e469e809084e24a4",
      },
      {
        name: "budget",
        fileKey: "budgets",
        route: "/api/budget/bulk-insert-budget/6798bae6e469e809084e24a4",
      },
      {
        name: "performance",
        fileKey: "performance-tasks",
        route:
          "/api/performance/bulk-insert-performance-tasks/6798bae6e469e809084e24a4",
      },
      {
        name: "vendors",
        fileKey: "vendors",
        route: "/api/vendors/bulk-insert-vendors/6798bae6e469e809084e24a4",
      },
      {
        name: "weekly shift",
        fileKey: "schedule",
        route: "/api/administration/bulk-insert-weekly-shift-schedule",
      },
      {
        name: "client events",
        fileKey: "client-events",
        route: "/api/administration/bulk-insert-client-events",
      },
      {
        name: "co-working members",
        fileKey: "members",
        route: "/api/sales/bulk-insert-co-working-client-members",
      },
      {
        name: "house-keeping schedule",
        route: "/api/company/bulk-insert-housekeeping-schedule",
      },
      {
        name: "inventory",
        route: "/api/invenotry/bulk-insert-inventory/6798bae6e469e809084e24a4",
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
      {
        name: "budget", //working
        fileKey: "budgets",
        route: "/api/budget/bulk-insert-budget/6798bacce469e809084e24a1",
      },
      {
        name: "performance", //working
        fileKey: "performance-tasks",
        route:
          "/api/performance/bulk-insert-performance-tasks/6798bacce469e809084e24a1",
      },
      {
        name: "vendors",
        fileKey: "vendors",
        route: "/api/vendors/bulk-insert-vendors/6798bacce469e809084e24a1",
      },
      {
        name: "co-working members",
        fileKey: "members",
        route: "/api/sales/bulk-insert-co-working-client-members",
      },
      {
        name: "inventory",
        route: "/api/invenotry/bulk-insert-inventory/6798bacce469e809084e24a1",
      },
    ],
  },
];

export default bulkInsertRoutes;
