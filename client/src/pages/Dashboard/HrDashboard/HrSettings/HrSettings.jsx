import { Tab, Tabs } from "@mui/material";
import React, { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { PERMISSIONS } from "../../../../constants/permissions";
import TabLayout from "../../../../components/Tabs/TabLayout";

const HrSettings = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Map routes to tabs
const tabs = [
  {
    label: "Bulk Upload",
    path: "bulk-upload",
    permission: PERMISSIONS.HR_BULK_UPLOAD.value,
  },
  {
    label: "SOPs",
    path: "sops",
    permission: PERMISSIONS.HR_SOPS.value,
  },
  {
    label: "Policies",
    path: "policies",
    permission: PERMISSIONS.HR_POLICIES.value,
  },
];


  // Redirect to "view-employees" if the current path is "/hr-dashboard/compliances"
  // useEffect(() => {
  //   if (location.pathname === "/app/dashboard/HR-dashboard/settings") {
  //     navigate("/app/dashboard/HR-dashboard/settings/bulk-upload", {
  //       replace: true,
  //     });
  //   }
  // }, [location, navigate]);

  // Determine whether to show the tabs
  const showTabs = !location.pathname.includes("budget/");

  // Determine active tab based on location
  const activeTab = tabs.findIndex((tab) =>
    location.pathname.includes(tab.path)
  );

  return (
      <TabLayout
      basePath="/app/dashboard/sales-dashboard/settings"
      defaultTabPath="bulk-upload"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("bulk-upload/")}
    />
  );
};

export default HrSettings;
