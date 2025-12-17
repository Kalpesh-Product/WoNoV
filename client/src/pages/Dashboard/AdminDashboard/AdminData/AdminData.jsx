import { Tab, Tabs } from "@mui/material";
import React, { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { PERMISSIONS } from "../../../../constants/permissions";
import TabLayout from "../../../../components/Tabs/TabLayout";

const AdminData = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Map routes to tabs
 const tabs = [
  {
    label: "Electricity Consumption & Expenses",
    path: "electricity-expenses",
    permission: PERMISSIONS.ADMIN_ELECTRICITY_EXPENSES.value,
  },
  {
    label: "Asset List",
    path: "asset-list",
    permission: PERMISSIONS.ADMIN_ASSET_LIST.value,
  },
  {
    label: "Monthly Invoice Reports",
    path: "monthly-invoice-reports",
    permission: PERMISSIONS.ADMIN_MONTHLY_INVOICE_REPORTS.value,
  },
  {
    label: "Vendor",
    path: "vendor",
    permission: PERMISSIONS.ADMIN_VENDOR.value,
  },
];


  // Redirect to "view-employees" if the current path is "/hr-dashboard/compliances"
  // useEffect(() => {
  //   if (location.pathname === "/app/dashboard/admin-dashboard/data") {
  //     navigate("/app/dashboard/admin-dashboard/data/electricity-expenses", {
  //       replace: true,
  //     });
  //   }
  // }, [location, navigate]);

  // Determine whether to show the tabs
  const showTabs = !location.pathname.includes("asset-list/");

  // Determine active tab based on location
  const activeTab = tabs.findIndex((tab) =>
    location.pathname.includes(tab.path)
  );

  return (
   <TabLayout
      basePath="/app/dashboard/admin-dashboard/data"
      defaultTabPath="electricity-expenses"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("electricity-expenses/")}
    />
  );
};

export default AdminData;
