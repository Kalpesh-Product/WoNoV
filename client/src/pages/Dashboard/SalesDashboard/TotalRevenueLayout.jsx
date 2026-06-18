import React from "react";
import { useLocation } from "react-router-dom";
import { PERMISSIONS } from "../../../constants/permissions";
import TabLayout from "../../../components/Tabs/TabLayout";

const TotalRevenueLayout = () => {
  const location = useLocation();
   const isFinanceRoute = location.pathname.includes("/finance-dashboard/");
  const isMixBagRoute = location.pathname.includes("/mix-bag/");
  // const basePath = isMixBagRoute
  //   ? "/app/dashboard/sales-dashboard/mix-bag/revenue"
  //   : "/app/dashboard/sales-dashboard/revenue";

  // // Map routes to tabs
  // const tabs = [
  //   {
  //     label: "Total Revenue",
  //     path: "total-revenue",
  //     permission: PERMISSIONS.SALES_TOTAL_REVENUE.value,
  //   },
  //   {
  //     label: "Co-Working",
  //     path: "co-working",
  //     permission: PERMISSIONS.SALES_COWORKING.value,
  //   },
  //   {
  //     label: "Meetings",
  //     path: "meetings",
  //     permission: PERMISSIONS.SALES_MEETINGS.value,
  //   },
  //   {
  //     label: "Virtual Office",
  //     path: "virtual-office",
  //     permission: PERMISSIONS.SALES_VIRTUAL_OFFICE.value,
  //   },
  //   {
  //     label: "Workations",
  //     path: "workation",
  //     permission: PERMISSIONS.SALES_WORKATIONS.value,
  //   },
  //   {
  //     label: "Alt. Revenues",
  //     path: "alt-revenue",
  //     permission: PERMISSIONS.SALES_ALT_REVENUE.value,
  //   },
  // ];

  const basePath = isFinanceRoute
    ? "/app/dashboard/finance-dashboard/mix-bag/revenue"
    : isMixBagRoute
      ? "/app/dashboard/sales-dashboard/mix-bag/revenue"
      : "/app/dashboard/sales-dashboard/revenue";
  const revenuePermissions = isFinanceRoute
    ? {
        totalRevenue: PERMISSIONS.FINANCE_TOTAL_REVENUE,
        coworking: PERMISSIONS.FINANCE_COWORKING_REVENUE,
        meetings: PERMISSIONS.FINANCE_MEETINGS_REVENUE,
        virtualOffice: PERMISSIONS.FINANCE_VIRTUAL_OFFICE_REVENUE,
        workations: PERMISSIONS.FINANCE_WORKATIONS_REVENUE,
        altRevenue: PERMISSIONS.FINANCE_ALT_REVENUE,
      }
    : {
        totalRevenue: PERMISSIONS.SALES_TOTAL_REVENUE,
        coworking: PERMISSIONS.SALES_COWORKING,
        meetings: PERMISSIONS.SALES_MEETINGS,
        virtualOffice: PERMISSIONS.SALES_VIRTUAL_OFFICE,
        workations: PERMISSIONS.SALES_WORKATIONS,
        altRevenue: PERMISSIONS.SALES_ALT_REVENUE,
      };

  // Map routes to tabs
  const tabs = [
    {
      label: "Total Revenue",
      path: "total-revenue",
      permission: revenuePermissions.totalRevenue.value,
    },
    {
      label: "Co-Working",
      path: "co-working",
      permission: revenuePermissions.coworking.value,
    },
    {
      label: "Meetings",
      path: "meetings",
      permission: revenuePermissions.meetings.value,
    },
    {
      label: "Virtual Office",
      path: "virtual-office",
      permission: revenuePermissions.virtualOffice.value,
    },
    {
      label: "Workations",
      path: "workation",
      permission: revenuePermissions.workations.value,
    },
    {
      label: "Alt. Revenues",
      path: "alt-revenue",
      permission: revenuePermissions.altRevenue.value,
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