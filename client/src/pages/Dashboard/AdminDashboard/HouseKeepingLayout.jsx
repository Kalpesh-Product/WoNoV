import { Tab, Tabs } from "@mui/material";
import React, { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import TabLayout from "../../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../../constants/permissions";

const HouseKeepingLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Map routes to tabs
const tabs = [
  {
    label: "Housekeeping Members List",
    path: "members-list",
    permission: PERMISSIONS.ADMIN_HOUSEKEEPING_MEMBERS_LIST.value,
  },
  {
    label: "Housekeeping Member Onboard",
    path: "member-onboard",
    permission: PERMISSIONS.ADMIN_HOUSEKEEPING_MEMBER_ONBOARD.value,
  },
  {
    label: "Housekeeping Assign Rotation",
    path: "member-schedule",
    permission: PERMISSIONS.ADMIN_HOUSEKEEPING_ASSIGN_ROTATION.value,
  },
];


  // useEffect(() => {
  //   if (
  //     location.pathname ===
  //     "/app/dashboard/admin-dashboard/mix-bag/housekeeping-members"
  //   ) {
  //     navigate(
  //       "/app/dashboard/admin-dashboard/mix-bag/housekeeping-members/members-list",
  //       {
  //         replace: true,
  //       }
  //     );
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
      basePath="/app/dashboard/admin-dashboard/mix-bag/housekeeping-members"
      defaultTabPath="internal-visitors"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("internal-visitors/")}
    />
  );
};

export default HouseKeepingLayout;
