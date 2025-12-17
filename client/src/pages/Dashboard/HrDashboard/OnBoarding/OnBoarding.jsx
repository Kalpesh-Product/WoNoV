import { Tab, Tabs } from "@mui/material";
import React, { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { PERMISSIONS } from "../../../../constants/permissions";
import TabLayout from "../../../../components/Tabs/TabLayout";

const OnBoarding = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Map routes to tabs
const tabs = [
  {
    label: "Employee-List",
    path: "employee-list",
    permission: PERMISSIONS.HR_EMPLOYEE_LIST.value,
  },
  {
    label: "Past-Employees",
    path: "past-employees",
    permission: PERMISSIONS.HR_PAST_EMPLOYEES.value,
  },
  {
    label: "Attendance",
    path: "attendance",
    permission: PERMISSIONS.HR_ATTENDANCE.value,
  },
  {
    label: "Leaves",
    path: "leaves",
    permission: PERMISSIONS.HR_LEAVES.value,
  },
  {
    label: "Employee On-Boarding",
    path: "employee-onboarding",
    permission: PERMISSIONS.HR_EMPLOYEE_ONBOARDING.value,
  },
];


  // Redirect to "view-employees" if the current path is "/hr-dashboard/compliances"
  // useEffect(() => {
  //   if (location.pathname === "/app/dashboard/HR-dashboard/employee") {
  //     navigate("/app/dashboard/HR-dashboard/employee/employee-list", {
  //       replace: true,
  //     });
  //   }
  // }, [location, navigate]);

  // Determine whether to show the tabs
  const showTabs = !location.pathname.includes(
    "employee-list/"
  );

  // Determine active tab based on location
  const activeTab = tabs.findIndex((tab) =>
    location.pathname.includes(tab.path)
  );

  return (
     <TabLayout
      basePath="/app/dashboard/HR-dashboard/employee"
      defaultTabPath="employee-list"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("employee-list/")}
    />
  );
};

export default OnBoarding;