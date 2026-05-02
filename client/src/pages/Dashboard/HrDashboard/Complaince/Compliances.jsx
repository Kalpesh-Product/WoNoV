import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Card from "../../../../components/Card";
import WidgetSection from "../../../../components/WidgetSection";
import { PERMISSIONS } from "../../../../constants/permissions";
import useAuth from "../../../../hooks/useAuth";
import Unauthorized from "../../../Unauthorized";

const Compliances = () => {
  const location = useLocation();
  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions?.permissions || [];

  const basePath = "/app/dashboard/HR-dashboard/company";
  const isBaseRoute = location.pathname === basePath;

  if (!userPermissions.includes(PERMISSIONS.HR_COMPANY.value)) {
    return <Unauthorized redirectTo="/app/dashboard/HR-dashboard" title="Access Denied" message="You do not have access to the Company module." />;
  }

  const cards = [
    {
      title: "COMPANY SETTINGS",
      route: `${basePath}/company-settings/company-logo`,
      permission: PERMISSIONS.HR_COMPANY_SETTINGS_CARD.value,
    },
    {
      title: "STRUCTURE & WORKFORCE",
      route: `${basePath}/company-structure-workforce/departments`,
      permission: PERMISSIONS.HR_COMPANY_STRUCTURE_WORKFORCE_CARD.value,
    },
    {
      title: "CALENDAR & ACTIVITIES",
      route: `${basePath}/company-calendar-activities/holidays`,
      permission: PERMISSIONS.HR_COMPANY_CALENDAR_ACTIVITIES_CARD.value,
    },
    {
      title: "TEMPLATES CONFIGURATION",
      route: `${basePath}/company-templates-configuration/templates`,
      permission: PERMISSIONS.HR_COMPANY_TEMPLATES_CONFIGURATION_CARD.value,
    },
  ].filter((card) => userPermissions.includes(card.permission));

  if (isBaseRoute && cards.length === 0) {
    return <Unauthorized redirectTo="/app/dashboard/HR-dashboard" title="Access Denied" message="You do not have access to any Company sections." />;
  }

  if (isBaseRoute) {
    return (
      <div className="p-4 flex flex-col gap-4">
        <div className="h-[50vh] uppercase">
          <WidgetSection key={cards.length} layout={2} padding>
            {cards.map((card) => (
              <Card fullHeight key={card.title} title={card.title} route={card.route} />
            ))}
          </WidgetSection>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default Compliances;



// import { Tab, Tabs } from "@mui/material";
// import React, { useEffect } from "react";
// import { Outlet, useLocation, useNavigate } from "react-router-dom";
// import { PERMISSIONS } from "../../../../constants/permissions";
// import TabLayout from "../../../../components/Tabs/TabLayout";

// const Compliances = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   // Map routes to tabs
//   const tabs = [
//     {
//       label: "Company Logo",
//       path: "company-logo",
//       permission: PERMISSIONS.HR_COMPANY_LOGO.value
//     },
//     {
//       label: "Company Handbook",
//       path: "company-handbook",
//       permission: PERMISSIONS.HR_COMPANY_HANDBOOK.value
//     },
//     {
//       label: "Departments",
//       path: "departments",
//       permission: PERMISSIONS.HR_DEPARTMENTS.value
//     },
//     {
//       label: "Work Locations",
//       path: "work-locations",
//       permission: PERMISSIONS.HR_WORK_LOCATIONS.value
//     },
//     {
//       label: "Holidays",
//       path: "holidays",
//       permission: PERMISSIONS.HR_HOLIDAYS.value
//     },
//     {
//       label: "Events",
//       path: "events",
//       permission: PERMISSIONS.HR_EVENTS.value
//     },
//     {
//       label: "Company Policies",
//       path: "policies",
//       permission: PERMISSIONS.HR_COMPANY_POLICIES.value
//     },
//     {
//       label: "Company SOP's",
//       path: "sops",
//       permission: PERMISSIONS.HR_COMPANY_SOPS.value
//     },
//     {
//       label: "Employee Types",
//       path: "employee-type",
//       permission: PERMISSIONS.HR_EMPLOYEE_TYPES.value
//     },
//     {
//       label: "Shifts",
//       path: "shifts",
//       permission: PERMISSIONS.HR_SHIFTS.value
//     },
//     {
//       label: "Templates",
//       path: "templates",
//       permission: PERMISSIONS.HR_TEMPLATES.value
//     },
//   ];


//   // Redirect to "company-logo" if the current path is "/app/dashboard/HR-dashboard/company"
//   // useEffect(() => {
//   //   if (location.pathname === "/app/dashboard/HR-dashboard/company") {
//   //     navigate("/app/dashboard/HR-dashboard/company/company-logo", {
//   //       replace: true,
//   //     });
//   //   }
//   // }, [location, navigate]);

//   // Determine active tab based on location
//   const activeTab = tabs.findIndex((tab) =>
//     location.pathname.includes(tab.path)
//   );

//   return (
//     // <div className="p-4">
//     //   {/* Render Tabs */}
//     //   <Tabs
//     //     value={activeTab}
//     //     onChange={(event, newValue) => {
//     //       navigate(
//     //         `/app/dashboard/HR-dashboard/company/${tabs[newValue].path}`
//     //       );
//     //     }}
//     //     variant="scrollable" // Makes tabs scrollable
//     //     scrollButtons="auto" // Show scroll buttons when needed
//     //     TabIndicatorProps={{ style: { display: "none" } }}
//     //     sx={{
//     //       overflow: "hidden", // Prevent overflow
//     //       width: "100%", // Ensure tabs fit within screen width
//     //       whiteSpace: "nowrap", // Prevent text from wrapping
//     //       backgroundColor: "white",
//     //       borderRadius: 2,
//     //       border: "1px solid #d1d5db",
//     //       "&:hover": {
//     //         backgroundColor: "#fffff",
//     //       },
//     //       "& .MuiTab-root": {
//     //         textTransform: "none",
//     //         fontWeight: "medium",
//     //         padding: "12px 15px",
//     //         minWidth: "20%", // Ensure tabs have a minimum width for responsiveness
//     //         borderRight: "0.1px solid #d1d5db",
//     //       },
//     //       "& .MuiTabs-scrollButtons": {
//     //         "&.Mui-disabled": { opacity: 0.3 }, // Style disabled scroll buttons
//     //       },
//     //     }}>
//     //     {tabs.map((tab, index) => (
//     //       <Tab
//     //         key={index}
//     //         label={tab.label}
//     //         sx={{
//     //           "&:hover": {
//     //             backgroundColor: "#e0e7ff",
//     //           },
//     //         }}
//     //       />
//     //     ))}
//     //   </Tabs>

//     //   <div className="py-4">
//     //     <Outlet />
//     //   </div>
//     // </div>

//     <TabLayout
//       basePath="/app/dashboard/HR-dashboard/company"
//       defaultTabPath="company-logo"
//       tabs={tabs}
//       hideTabsCondition={(pathname) => pathname.includes("company-logo/")}
//     />

//   );
// };

// export default Compliances;
