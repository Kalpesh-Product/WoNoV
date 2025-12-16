import { Tab, Tabs } from "@mui/material";
import React, { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { PERMISSIONS } from "../../../../constants/permissions";
import TabLayout from "../../../../components/Tabs/TabLayout";

const ItFinance = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Map routes to tabs
 const tabs = [
  {
    label: "Budget",
    path: "budget",
    permission: PERMISSIONS.IT_BUDGET.value,
  },
  {
    label: "Payment Schedule",
    path: "payment-schedule",
    permission: PERMISSIONS.IT_PAYMENT_SCHEDULE.value,
  },
  {
    label: "Voucher",
    path: "voucher",
    permission: PERMISSIONS.IT_VOUCHER.value,
  },
];


  // Redirect to "view-employees" if the current path is "/hr-dashboard/compliances"
  // useEffect(() => {
  //   if (location.pathname === "/app/dashboard/IT-dashboard/finance") {
  //     navigate("/app/dashboard/IT-dashboard/finance/budget", {
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
      basePath="/app/dashboard/IT-dashboard/finance"
      defaultTabPath="budget"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("budget/")}
    />
  );
};

export default ItFinance;
