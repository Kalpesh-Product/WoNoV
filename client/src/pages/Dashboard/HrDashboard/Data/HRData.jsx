import React, { useEffect } from "react";
import { Tab, Tabs } from "@mui/material";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import TabLayout from "../../../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../../../constants/permissions";
const Data = () => {
  const location = useLocation();
  const navigate = useNavigate();

const tabs = [
  {
    label: "Job Application List",
    path: "job-application-list",
    permission: PERMISSIONS.HR_JOB_APPLICATION_LIST.value,
  },
  {
    label: "Payroll Reports",
    path: "payroll-reports",
    permission: PERMISSIONS.HR_PAYROLL_REPORTS.value,
  },
  {
    label: "Asset List",
    path: "asset-list",
    permission: PERMISSIONS.HR_ASSET_LIST.value,
  },
  {
    label: "Monthly Invoice Reports",
    path: "monthly-invoice-reports",
    permission: PERMISSIONS.HR_MONTHLY_INVOICE_REPORTS.value,
  },
  {
    label: "Vendor",
    path: "vendor",
    permission: PERMISSIONS.HR_VENDOR.value,
  },
];


  // Redirect to "view-employees" if the current path is "/hr-dashboard/compliances"
  // useEffect(() => {
  //   if (location.pathname === "/app/dashboard/HR-dashboard/data") {
  //     navigate("/app/dashboard/HR-dashboard/data/job-application-list", {
  //       replace: true,
  //     });
  //   }
  // }, [location, navigate]);

  // Determine whether to show the tabs
  const showTabs = !location.pathname.includes("job-application-list/");

  // Determine active tab based on location
  const activeTab = tabs.findIndex((tab) =>
    location.pathname.includes(tab.path)
  );
  return (
      <TabLayout
      basePath="/app/dashboard/HR-dashboard/data"
      defaultTabPath="job-application-list"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("job-application-list/")}
    />
  );
};

export default Data;
