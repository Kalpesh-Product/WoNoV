import { Tab, Tabs } from "@mui/material";
import React, { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { PERMISSIONS } from "../../../constants/permissions";
import TabLayout from "../../../components/Tabs/TabLayout";

const TotalRevenueLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Map routes to tabs
  const tabs = [
  {
    label: "Total Revenue",
    path: "total-revenue",
    permission: PERMISSIONS.SALES_TOTAL_REVENUE.value,
  },
  {
    label: "Co-Working",
    path: "co-working",
    permission: PERMISSIONS.SALES_COWORKING.value,
  },
  {
    label: "Meetings",
    path: "meetings",
    permission: PERMISSIONS.SALES_MEETINGS.value,
  },
  {
    label: "Virtual Office",
    path: "virtual-office",
    permission: PERMISSIONS.SALES_VIRTUAL_OFFICE.value,
  },
  {
    label: "Workations",
    path: "workation",
    permission: PERMISSIONS.SALES_WORKATIONS.value,
  },
  {
    label: "Alt. Revenues",
    path: "alt-revenue",
    permission: PERMISSIONS.SALES_ALT_REVENUE.value,
  },
];


  // Redirect to "view-employees" if the current path is "/hr-dashboard/compliances"
  // useEffect(() => {
  //   const isMixBag = location.pathname.includes("mix-bag");
  //   const isRevenueBasePath = location.pathname.endsWith("/revenue") || location.pathname.endsWith("/revenue/");
  
  //   if (isMixBag && isRevenueBasePath) {
  //     navigate("/app/dashboard/sales-dashboard/mix-bag/revenue/total-revenue", { replace: true });
  //   } else if (!isMixBag && isRevenueBasePath) {
  //     navigate("/app/dashboard/sales-dashboard/revenue/total-revenue", { replace: true });
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
      basePath="/app/dashboard/sales-dashboard/revenue/total-revenue"
      defaultTabPath="total-revenue"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("total-revenue/")}
    />
  );
};

export default TotalRevenueLayout;
