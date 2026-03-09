import React from "react";
import { useLocation } from "react-router-dom";
import { PERMISSIONS } from "../../../constants/permissions";
import TabLayout from "../../../components/Tabs/TabLayout";

const TotalRevenueLayout = () => {
  const location = useLocation();
  const isMixBagRoute = location.pathname.includes("/mix-bag/");
  const basePath = isMixBagRoute
    ? "/app/dashboard/sales-dashboard/mix-bag/revenue"
    : "/app/dashboard/sales-dashboard/revenue";

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


  return (
    <TabLayout
      basePath={basePath}
      defaultTabPath="total-revenue"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("total-revenue/")}
    />
  );
};

export default TotalRevenueLayout;