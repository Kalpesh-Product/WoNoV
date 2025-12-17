import { Tab, Tabs } from "@mui/material";
import React, { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import TabLayout from "../../../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../../../constants/permissions";

const MaintenanceData = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Map routes to tabs
  const tabs = [
   {
    label: "AMC Records",
    path: "amc-records",
    permission: PERMISSIONS.MAINTENANCE_AMC_RECORDS.value,
  },
  {
    label: "Asset List",
    path: "asset-list",
    permission: PERMISSIONS.MAINTENANCE_ASSET_LIST.value,
  },
  {
    label: "Monthly Invoice Reports",
    path: "monthly-invoice-reports",
    permission: PERMISSIONS.MAINTENANCE_MONTHLY_INVOICE_REPORTS.value,
  },
  {
    label: "Vendor",
    path: "vendor",
    permission: PERMISSIONS.MAINTENANCE_VENDOR.value,
  },
  ];

  // Redirect to "view-employees" if the current path is "/hr-dashboard/compliances"
  // useEffect(() => {
  //   if (location.pathname === "/app/dashboard/maintenance-dashboard/data") {
  //     navigate("/app/dashboard/maintenance-dashboard/data/amc-records", {
  //       replace: true,
  //     });
  //   }
  // }, [location, navigate]);

  // Determine whether to show the tabs
  const showTabs = !location.pathname.includes("asset-list/");

  // Determine active tab based on location
  const activeTab = tabs.findIndex((tab) =>
    location.pathname.includes(tab.path)
  );

  return (
      <TabLayout
      basePath="/app/dashboard/maintenance-dashboard/data"
      defaultTabPath="amc-records"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("amc-records/")}
    />
  );
};

export default MaintenanceData;
