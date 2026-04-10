import { useLocation, useParams } from "react-router-dom";
import { PERMISSIONS } from "./../../constants/permissions";
import TabLayout from "../../components/Tabs/TabLayout";

const DepartmentPerformanceLayout = () => {
  const location = useLocation();
  const { overallType, department, memberWiseType } = useParams();
  const isMemberHierarchyRoute = Boolean(overallType && memberWiseType);
  const isAssignRoute = location.pathname.includes("/assign-kra-kpa");
  const basePath = isMemberHierarchyRoute
    ? `/app/performance/department-wise/${overallType}/${memberWiseType}`
    : isAssignRoute
      ? "/app/performance/assign-kra-kpa"
    : `/app/performance/${department}`;

  // Map routes to tabs
  const tabs = [
    {
      label: "Department Daily KRA",
      path: "daily-KRA",
      permission: PERMISSIONS.PERFORMANCE_DAILY_KRA.value,
    },
    {
      label: "Department Monthly KPA",
      path: "monthly-KPA",
      permission: PERMISSIONS.PERFORMANCE_MONTHLY_KPA.value,
    },
    {
      label: "Individual Daily KRA",
      path: "individual-Daily-KRA",
      permission: PERMISSIONS.PERFORMANCE_INDIVIDUAL_KRA.value,
    },
    {
      label: "Individual Monthly KPA",
      path: "individual-Monthly-KPA",
      permission: PERMISSIONS.PERFORMANCE_INDIVIDUAL_KPA.value,
    },
    {
      label: "Team Daily KRA",
      path: "team-Daily-KRA",
      permission: PERMISSIONS.PERFORMANCE_TEAM_KRA.value,
    },
    {
      label: "Team Monthly KPA",
      path: "team-Monthly-KPA",
      permission: PERMISSIONS.PERFORMANCE_TEAM_KPA.value,
    },

    // { label: "Annual KPA", path: "annual-KPA" },
  ];

  return (
    <TabLayout
      basePath={basePath}
      defaultTabPath="daily-KRA"
      tabs={tabs}
      hideTabsCondition={(pathname) =>
        pathname.includes("vendor/") || pathname.endsWith("/assign-kra-kpa")
      }
    />
  );
};

export default DepartmentPerformanceLayout;