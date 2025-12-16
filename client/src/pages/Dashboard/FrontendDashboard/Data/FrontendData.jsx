import { Tabs } from "@mui/material";
import React, { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { PERMISSIONS } from "../../../../constants/permissions";
import TabLayout from "../../../../components/Tabs/TabLayout";

const FrontendData = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Map routes to tabs
const tabs = [
  {
    label: "New Leads",
    path: "leads",
    permission: PERMISSIONS.FRONTEND_LEADS.value,
  },
  {
    label: "Website Issue Reports",
    path: "website-issue-reports",
    permission: PERMISSIONS.FRONTEND_WEBSITE_ISSUE_REPORTS.value,
  },
  {
    label: "Asset List",
    path: "asset-list",
    permission: PERMISSIONS.FRONTEND_ASSET_LIST.value,
  },
  {
    label: "Monthly Invoice Reports",
    path: "monthly-invoice-reports",
    permission: PERMISSIONS.FRONTEND_MONTHLY_INVOICE_REPORTS.value,
  },
  {
    label: "Vendor",
    path: "vendor",
    permission: PERMISSIONS.FRONTEND_VENDOR.value,
  },
];


  // Redirect to "leads" if the current path is "/frontend-dashboard/data"
  // useEffect(() => {
  //   if (location.pathname === "/app/dashboard/frontend-dashboard/data") {
  //     navigate("/app/dashboard/frontend-dashboard/data/leads", {
  //       replace: true,
  //     });
  //   }
  // }, [location, navigate]);

  // Determine active tab based on location
  const activeTab = tabs.findIndex((tab) =>
    location.pathname.includes(tab.path)
  );

  return (
      <TabLayout
      basePath="/app/dashboard/frontend-dashboard/data"
      defaultTabPath="leads"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("leads/")}
    />
  );
};

export default FrontendData;
