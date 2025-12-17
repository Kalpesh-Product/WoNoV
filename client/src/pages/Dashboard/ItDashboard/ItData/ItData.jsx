import { Tab, Tabs } from "@mui/material";
import React, { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { PERMISSIONS } from "../../../../constants/permissions";
import TabLayout from "../../../../components/Tabs/TabLayout";

const ItData = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Map routes to tabs
  const tabs = [
     {
    label: "AMC Records",
    path: "amc-records",
    permission: PERMISSIONS.IT_AMC_RECORDS.value,
  },
  {
    label: "Asset List",
    path: "asset-list",
    permission: PERMISSIONS.IT_ASSET_LIST.value,
  },
  {
    label: "Monthly Invoice Reports",
    path: "monthly-invoice-reports",
    permission: PERMISSIONS.IT_MONTHLY_INVOICE_REPORTS.value,
  },
  {
    label: "Vendor",
    path: "vendor",
    permission: PERMISSIONS.IT_VENDOR.value,
  },
  ];

  // Redirect to "view-employees" if the current path is "/hr-dashboard/compliances"
  // useEffect(() => {
  //   if (location.pathname === "/app/dashboard/IT-dashboard/data") {
  //     navigate("/app/dashboard/IT-dashboard/data/amc-records", {
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
      basePath="/app/dashboard/IT-dashboard/data"
      defaultTabPath="amc-records"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("amc-records/")}
    />
  );
};

export default ItData;
