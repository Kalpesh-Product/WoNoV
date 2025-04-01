const masterPermissions = [
  {
    departmentId: "6798bab9e469e809084e249e",
    departmentName: "HR",
    modules: [
      {
        name: "Employee",
        submodules: [
          {
            submoduleName: "Employee Onboarding",
            actions: ["View", "Edit"],
          },
          {
            submoduleName: "View Employee",
            actions: ["View", "Edit"],
          },
          {
            submoduleName: "Edit Employee",
            actions: ["View", "Edit"],
          },
          {
            submoduleName: "Attendance",
            actions: ["View", "Edit"],
          },
          {
            submoduleName: "Leaves",
            actions: ["View", "Edit"],
          },
          {
            submoduleName: "Agreements",
            actions: ["View", "Edit"],
          },
          {
            submoduleName: "KPI",
            actions: ["View", "Edit"],
          },
          {
            submoduleName: "KRA",
            actions: ["View", "Edit"],
          },
          {
            submoduleName: "Payslip",
            actions: ["View", "Edit"],
          },
        ],
      },
      {
        name: "Company",
        submodules: [
          {
            submoduleName: "Company Logo",
            actions: ["View", "Edit"],
          },
          {
            submoduleName: "Holidays / Events",
            actions: ["View", "Edit"],
          },
          {
            submoduleName: "Departments",
            actions: ["View", "Edit"],
          },
          {
            submoduleName: "Work Locations",
            actions: ["View", "Edit"],
          },
          {
            submoduleName: "Leave Type",
            actions: ["View", "Edit"],
          },
          {
            submoduleName: "Policies",
            actions: ["View", "Edit"],
          },
          {
            submoduleName: "SOP",
            actions: ["View", "Edit"],
          },
          {
            submoduleName: "Employee Types",
            actions: ["View", "Edit"],
          },
          {
            submoduleName: "Shifts",
            actions: ["View", "Edit"],
          },
          {
            submoduleName: "Templates",
            actions: ["View", "Edit"],
          },
          {
            submoduleName: "Vendor",
            actions: ["View", "Edit"],
          },
        ],
      },
      {
        name: "Finance",
        submodules: [
          {
            submoduleName: "Budget",
            actions: ["View", "Edit"],
          },
          {
            submoduleName: "Payment Schedule",
            actions: ["View", "Edit"],
          },
          {
            submoduleName: "Payroll",
            actions: ["View", "Edit"],
          },
        ],
      },
      {
        name: "Data",
        submodules: [
          {
            submoduleName: "Job Application List",
            actions: ["View", "Edit"],
          },
          {
            submoduleName: "Reports",
            actions: ["View", "Edit"],
          },
        ],
      },
      {
        name: "Settings",
        submodules: [
          {
            submoduleName: "Bulk Insert",
            actions: ["View", "Edit"],
          },
        ],
      },
    ],
  },
  {
    departmentId: "6798ba9de469e809084e2494",
    departmentName: "Tech",
    modules: [
      {
        name: "Create Website",
        submodules: [
          {
            submoduleName: "Select Theme",
            actions: ["View", "Edit"],
          },
          {
            submoduleName: "View Theme",
            actions: ["View", "Edit"],
          },
          {
            submoduleName: "Live Demo",
            actions: ["View", "Edit"],
          },
        ],
      },
      {
        name: "Edit Website",
        submodules: [
          {
            submoduleName: "Edit Website",
            actions: ["View", "Edit"],
          },
        ],
      },
      {
        name: "Finance",
        submodules: [
          {
            submoduleName: "Budget",
            actions: ["View", "Edit"],
          },
          {
            submoduleName: "Payment Schedule",
            actions: ["View", "Edit"],
          },
        ],
      },
      {
        name: "Data",
        submodules: [
          {
            submoduleName: "New Leads",
            actions: ["View", "Edit"],
          },
          {
            submoduleName: "Website Issue Reports",
            actions: ["View", "Edit"],
          },
        ],
      },
      {
        name: "Settings",
        submodules: [
          {
            submoduleName: "Bulk Insert",
            actions: ["View", "Edit"],
          },
        ],
      },
    ],
  },
  {
    departmentId: "6798bacce469e809084e24a1",
    departmentName: "Sales",
    modules: [
      {
        name: "Turnover",
        submodules: [
          {
            submoduleName: "Actual Business",
            actions: ["View", "Edit"],
          },
          {
            submoduleName: "Revenue Target",
            actions: ["View", "Edit"],
          },
        ],
      },
      {
        name: "Finance",
        submodules: [
          {
            submoduleName: "Budget",
            actions: ["View", "Edit"],
          },
          {
            submoduleName: "Payment Schedule",
            actions: ["View", "Edit"],
          },
        ],
      }
    ],
  },
];

module.exports = masterPermissions;
