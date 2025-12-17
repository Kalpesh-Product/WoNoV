import { Tab, Tabs } from "@mui/material";
import React, { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { PERMISSIONS } from "../../../../constants/permissions";
import TabLayout from "../../../../components/Tabs/TabLayout";

const MaintenanceSettings = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Map routes to tabs
  const tabs = [
    {
    label: "Bulk Upload",
    path: "bulk-upload",
    permission: PERMISSIONS.MAINTENANCE_BULK_UPLOAD.value,
  },
  {
    label: "SOPs",
    path: "sops",
    permission: PERMISSIONS.MAINTENANCE_SOPS.value,
  },
  {
    label: "Policies",
    path: "policies",
    permission: PERMISSIONS.MAINTENANCE_POLICIES.value,
  },
  ];

  // Redirect to "bulk-upload" if the current path is "/maintenance-dashboard/settings"
  // useEffect(() => {
  //   if (location.pathname === "/app/dashboard/maintenance-dashboard/settings") {
  //     navigate("/app/dashboard/maintenance-dashboard/settings/bulk-upload", {
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
      basePath="/app/dashboard/maintenance-dashboard/settings"
      defaultTabPath="bulk-upload"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("bulk-upload/")}
    />
  );
};

export default MaintenanceSettings;
