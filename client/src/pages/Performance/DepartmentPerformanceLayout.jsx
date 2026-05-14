import { useLocation, useParams } from "react-router-dom";
import { PERMISSIONS } from "./../../constants/permissions";
import TabLayout from "../../components/Tabs/TabLayout";
import { useSelector } from "react-redux";
import useAuth from "../../hooks/useAuth";

const DepartmentPerformanceLayout = () => {
  const location = useLocation();
  const { overallType, department, memberWiseType } = useParams();
  const { auth } = useAuth();
  const selectedMember = useSelector((state) => state.performance.selectedMember);
   const isDepartmentKraMemberWiseRoute = location.pathname.includes("/department-KRA/member-wise-KRA");
  const isDepartmentKpaMemberWiseRoute = location.pathname.includes("/department-KPA/member-wise-KPA");
  const isMemberHierarchyRoute = Boolean(overallType && memberWiseType);
  const isAssignRoute = location.pathname.includes("/assign-KRA-KPA");
  const basePath = isDepartmentKraMemberWiseRoute
       ? "/app/performance/department-KRA/member-wise-KRA"
    : isDepartmentKpaMemberWiseRoute
      ? "/app/performance/department-KPA/member-wise-KPA"
    : isMemberHierarchyRoute
    ? `/app/performance/department-wise/${overallType}/${memberWiseType}`
    : isAssignRoute
      ? "/app/performance/assign-KRA-KPA"
    : `/app/performance/${department}`;

const isMemberWiseKpaFlow = location.pathname.includes("/department-KPA/member-wise-KPA");
  const isMemberWiseKraFlow = location.pathname.includes("/department-KRA/member-wise-KRA");
  const userPermissions = auth?.user?.permissions?.permissions || [];
  const canManageTeam =
    userPermissions.includes(PERMISSIONS.PERFORMANCE_TEAM_KRA.value) ||
    userPermissions.includes(PERMISSIONS.PERFORMANCE_TEAM_KPA.value);
  const loggedInUserId = auth?.user?._id?.toString();
  const selectedMemberId = selectedMember?.memberId?.toString();
  const isManagerViewingOwnMemberRow =
    !!loggedInUserId && !!selectedMemberId && loggedInUserId === selectedMemberId;

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

//  const visibleTabs = isMemberWiseKpaFlow
//     ? tabs.filter((tab) => tab.path.toLowerCase().includes("kpa"))
//     : isMemberWiseKraFlow
//       ? tabs.filter((tab) => tab.path.toLowerCase().includes("kra"))
//       : tabs;

//   const defaultTabPath = isMemberWiseKpaFlow
//     ? "monthly-KPA"
//     : isMemberWiseKraFlow
//       ? "daily-KRA"
//       : visibleTabs[0]?.path || "daily-KRA";
 const visibleTabs = isAssignRoute
    ? tabs.filter(
        (tab) => tab.path === "team-Daily-KRA" || tab.path === "team-Monthly-KPA"
      )
   : isMemberWiseKpaFlow && canManageTeam && selectedMemberId && !isManagerViewingOwnMemberRow
      ? tabs.filter((tab) => tab.path === "individual-Monthly-KPA")
    : isMemberWiseKraFlow && canManageTeam && selectedMemberId && !isManagerViewingOwnMemberRow
      ? tabs.filter((tab) => tab.path === "daily-KRA" || tab.path === "individual-Daily-KRA")    
    : isMemberWiseKpaFlow
      ? tabs.filter((tab) => tab.path.toLowerCase().includes("kpa"))
      : isMemberWiseKraFlow
        ? tabs.filter((tab) => tab.path.toLowerCase().includes("kra"))
        : tabs;

  const defaultTabPath = isAssignRoute
    ? "team-Daily-KRA"
       : isMemberWiseKpaFlow && canManageTeam && selectedMemberId && !isManagerViewingOwnMemberRow
      ? "individual-Monthly-KPA"
    : isMemberWiseKraFlow && canManageTeam && selectedMemberId && !isManagerViewingOwnMemberRow
      ? "daily-KRA"
    : isMemberWiseKpaFlow
      ? "monthly-KPA"
      : isMemberWiseKraFlow
        ? "daily-KRA"
        : visibleTabs[0]?.path || "daily-KRA";

  return (
    <TabLayout
      basePath={basePath}
      defaultTabPath={defaultTabPath}
      tabs={visibleTabs}
      hideTabsCondition={(pathname) =>
        pathname.includes("vendor/") || pathname.endsWith("/assign-KRA-KPA")
      }
    />
  );
};

export default DepartmentPerformanceLayout;



// import { useLocation, useParams } from "react-router-dom";
// import { PERMISSIONS } from "./../../constants/permissions";
// import TabLayout from "../../components/Tabs/TabLayout";

// const DepartmentPerformanceLayout = () => {
//   const location = useLocation();
//   const { overallType, department, memberWiseType } = useParams();
//   const isMemberHierarchyRoute = Boolean(overallType && memberWiseType);
//   const isAssignRoute = location.pathname.includes("/assign-kra-kpa");
//   const basePath = isMemberHierarchyRoute
//     ? `/app/performance/department-wise/${overallType}/${memberWiseType}`
//     : isAssignRoute
//       ? "/app/performance/assign-kra-kpa"
//     : `/app/performance/${department}`;

//   // Map routes to tabs
//   const tabs = [
//     {
//       label: "Department Daily KRA",
//       path: "daily-KRA",
//       permission: PERMISSIONS.PERFORMANCE_DAILY_KRA.value,
//     },
//     {
//       label: "Department Monthly KPA",
//       path: "monthly-KPA",
//       permission: PERMISSIONS.PERFORMANCE_MONTHLY_KPA.value,
//     },
//     {
//       label: "Individual Daily KRA",
//       path: "individual-Daily-KRA",
//       permission: PERMISSIONS.PERFORMANCE_INDIVIDUAL_KRA.value,
//     },
//     {
//       label: "Individual Monthly KPA",
//       path: "individual-Monthly-KPA",
//       permission: PERMISSIONS.PERFORMANCE_INDIVIDUAL_KPA.value,
//     },
//     {
//       label: "Team Daily KRA",
//       path: "team-Daily-KRA",
//       permission: PERMISSIONS.PERFORMANCE_TEAM_KRA.value,
//     },
//     {
//       label: "Team Monthly KPA",
//       path: "team-Monthly-KPA",
//       permission: PERMISSIONS.PERFORMANCE_TEAM_KPA.value,
//     },

//     // { label: "Annual KPA", path: "annual-KPA" },
//   ];

//   return (
//     <TabLayout
//       basePath={basePath}
//       defaultTabPath="daily-KRA"
//       tabs={tabs}
//       hideTabsCondition={(pathname) =>
//         pathname.includes("vendor/") || pathname.endsWith("/assign-kra-kpa")
//       }
//     />
//   );
// };

// export default DepartmentPerformanceLayout;