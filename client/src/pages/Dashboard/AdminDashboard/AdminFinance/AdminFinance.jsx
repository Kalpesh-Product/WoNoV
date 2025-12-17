import { Tab, Tabs } from "@mui/material";
import React, { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import TabLayout from "../../../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../../../constants/permissions";

const AdminFinance = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Map routes to tabs
const tabs = [
  {
    label: "Budget",
    path: "budget",
    permission: PERMISSIONS.ADMIN_BUDGET.value,
  },
  {
    label: "Payment Schedule",
    path: "payment-schedule",
    permission: PERMISSIONS.ADMIN_PAYMENT_SCHEDULE.value,
  },
  {
    label: "Voucher",
    path: "voucher",
    permission: PERMISSIONS.ADMIN_VOUCHER.value,
  },
];


  // Redirect to "view-employees" if the current path is "/hr-dashboard/compliances"
  // useEffect(() => {
  //   if (location.pathname === "/app/dashboard/admin-dashboard/finance") {
  //     navigate("/app/dashboard/admin-dashboard/finance/budget", {
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
      basePath="/app/dashboard/admin-dashboard/finance"
      defaultTabPath="budget"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("budget/")}
    />
  );
};

export default AdminFinance;
