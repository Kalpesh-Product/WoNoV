import { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Tabs } from "@mui/material";
import { PERMISSIONS } from "../../constants/permissions";
import TabLayout from "../../components/Tabs/TabLayout";

const ManageVisitorLayout = () => {
  // const location = useLocation();
  // const navigate = useNavigate();

  // Map routes to tabs
  const tabs = [
    {
      label: "Internal Visitors",
      path: "internal-visitors",
      permission: PERMISSIONS.VISITORS_MANAGE_INTERNAL_VISITORS.value,
    },
    {
      label: "External Clients",
      path: "external-clients",
      permission: PERMISSIONS.VISITORS_MANAGE_EXTERNAL_CLIENTS.value,
    },
  ];

  // Redirect to "assets-categories" if the current path is "/assets/categories"
  // useEffect(() => {
  //   if (location.pathname === "/app/visitors/manage-visitors") {
  //     navigate("/app/visitors/manage-visitors/internal-visitors", {
  //       replace: true,
  //     });
  //   }
  // }, [location, navigate]);

  // Determine active tab based on location
  // const activeTab = tabs.findIndex((tab) =>
  //   location.pathname.includes(tab.path)
  // );

  return (
    <TabLayout
      basePath="/app/visitors/manage-visitors"
      defaultTabPath="internal-visitors"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("internal-visitors/")}
    />
  );
};

export default ManageVisitorLayout;
