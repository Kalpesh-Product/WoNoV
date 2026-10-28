import { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Tabs } from "@mui/material";
import TabLayout from "../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../constants/permissions";

const ManageMeetingsLayout = ({
  basePath = "/app/meetings/manage-meetings",
  ignoreTabPermissions = false,
}) => {
  // Map routes to tabs
  const tabs = [
    {
      label: "Internal Meetings",
      path: "internal-meetings",
      permission: ignoreTabPermissions
        ? undefined
        : PERMISSIONS.MEETINGS_MEETINGS_INTERNAL.value,
    },
    {
      label: "External Clients",
      path: "external-clients",
      permission: ignoreTabPermissions
        ? undefined
        : PERMISSIONS.MEETINGS_MEETINGS_EXTERNAL.value,
    },
  ];

  return (
    <TabLayout
      basePath={basePath}
      defaultTabPath="internal-meetings"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("internal-meetings/")}
    />
  );
};

export default ManageMeetingsLayout;
