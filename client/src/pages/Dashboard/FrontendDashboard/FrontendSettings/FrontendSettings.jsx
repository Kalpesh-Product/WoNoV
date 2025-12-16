import { Tabs } from "@mui/material";
import React, { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import TabLayout from "../../../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../../../constants/permissions";

const FrontendSettings = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Map routes to tabs
const tabs = [
  {
    label: "Bulk Upload",
    path: "bulk-upload",
    permission: PERMISSIONS.FRONTEND_BULK_UPLOAD.value,
  },
  {
    label: "SOPs",
    path: "sops",
    permission: PERMISSIONS.FRONTEND_SOPS.value,
  },
  {
    label: "Policies",
    path: "policies",
    permission: PERMISSIONS.FRONTEND_POLICIES.value,
  },
];

 
  // Redirect to "bulk-upload" if the current path is "/frontend-dashboard/settings"
  // useEffect(() => {
  //   if (location.pathname === "/app/dashboard/frontend-dashboard/settings") {
  //     navigate("/app/dashboard/frontend-dashboard/settings/bulk-upload", {
  //       replace: true,
  //     });
  //   }
  // }, [location, navigate]);

  // Determine whether to show the tabs
  const showTabs = !location.pathname.includes("bulk-upload/");

  // Determine active tab based on location
  const activeTab = tabs.findIndex((tab) =>
    location.pathname.includes(tab.path)
  );

  return (
       <TabLayout
      basePath="/app/dashboard/frontend-dashboard/settings"
      defaultTabPath="bulk-upload"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("bulk-upload/")}
    />
  );
};

export default FrontendSettings;
