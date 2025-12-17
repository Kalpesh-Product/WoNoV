import React, { useEffect } from "react";
import { Tab, Tabs } from "@mui/material";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import TabLayout from "../../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../../constants/permissions";

const AdminClientLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

const tabs = [
  {
    label: "Clients",
    path: "client-members-data",
    permission: PERMISSIONS.ADMIN_CLIENT_MEMBERS_DATA.value,
  },
  {
    label: "Client-Member Onboarding",
    path: "client-members-onboard",
    permission: PERMISSIONS.ADMIN_CLIENT_MEMBERS_ONBOARD.value,
  },
];

  // useEffect(() => {
  //   if (location.pathname === "/app/dashboard/admin-dashboard/mix-bag/client-members") {
  //     navigate(
  //       "/app/dashboard/admin-dashboard/mix-bag/client-members/client-members-data",
  //       {
  //         replace: true,
  //       }
  //     );
  //   }
  // }, [location, navigate]);

  // Determine whether to show the tabs
  const showTabs = !location.pathname.includes("client-members-data/");

  // Determine active tab based on location
  const activeTab = tabs.findIndex((tab) =>
    location.pathname.includes(tab.path)
  );
  return (
     <TabLayout
      basePath="/app/dashboard/admin-dashboard/mix-bag/client-members"
      defaultTabPath="client-members-data"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("client-members-data/")}
    />
  );
};

export default AdminClientLayout;
