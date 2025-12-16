import { useEffect, useState } from "react";
import {
  matchPath,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Tabs } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { PERMISSIONS } from "./../../constants/permissions";
import TabLayout from "../../components/Tabs/TabLayout";
import { useSelector } from "react-redux";

const DepartmentPerformanceLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
   const departmentName = useSelector((state) => state.performance.selectedDepartmentName);
   console.log("dep : ", departmentName);

  // Map routes to tabs
  const tabs = [
    {
      label: "Daily KRA",
      path: "daily-KRA",
      permission: PERMISSIONS.PERFORMANCE_DAILY_KRA.value,
    },
    {
      label: "Monthly KPA",
      path: "monthly-KPA",
      permission: PERMISSIONS.PERFORMANCE_MONTHLY_KPA.value,
    },
    // { label: "Annual KPA", path: "annual-KPA" },
  ];

  return (
    <TabLayout
      basePath={`/app/performance/${departmentName}`}
      defaultTabPath="daily-KRA"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("vendor/")}
    />
  );
};

export default DepartmentPerformanceLayout;
