import { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Tabs } from "@mui/material";
import { PERMISSIONS } from "../../../constants/permissions";
import TabLayout from "../../../components/Tabs/TabLayout";

const TaskReportLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Map routes to tabs
  const tabs = [
    { label: "My Task Reports", path: "my-task-reports",permission:PERMISSIONS.TASKS_MY_TASK_REPORTS.value },
    { label: "Assigned Task Reports", path: "assigned-task-reports",permission:PERMISSIONS.TASKS_ASSIGNED_TASKS_REPORTS.value },
    // { label: "Department Task Reports", path: "department-task-reports" },
  ];

  // Redirect to "assets-categories" if the current path is "/assets/categories"
  // useEffect(() => {
  //   if (location.pathname === "/app/tasks/reports") {
  //     navigate("/app/tasks/reports/my-task-reports", {
  //       replace: true,
  //     });
  //   }
  // }, [location, navigate]);

  // // Determine active tab based on location
  // const activeTab = tabs.findIndex((tab) =>
  //   location.pathname.includes(tab.path)
  // );

  return (
     <TabLayout
      basePath="/app/tasks/reports"
      defaultTabPath="my-task-reports"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("my-task-reports/")}
    />
  );
};

export default TaskReportLayout;
