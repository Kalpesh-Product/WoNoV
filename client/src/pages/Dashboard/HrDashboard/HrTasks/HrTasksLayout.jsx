import TabLayout from "../../../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../../../constants/permissions";
import { useLocation, useMatch } from "react-router-dom";

const HrTasksLayout = () => {
 const { pathname } = useLocation();
 const isMixBagKpaKraRoute = pathname.includes("/mix-bag/department-kpa-kra");
  const isMixBagDepartmentTasksRoute = pathname.includes("/mix-bag/department-tasks");
  const isMixBagRoute = isMixBagKpaKraRoute || isMixBagDepartmentTasksRoute;
  const kpaTabPermission = isMixBagKpaKraRoute
    ? PERMISSIONS.HR_DEPARTMENT_KPA_KRA_MIX_BAG_TAB.value
    : isMixBagDepartmentTasksRoute
      ? PERMISSIONS.HR_DEPARTMENT_TASK_MIX_BAG_KPA_KRA_TAB.value
      : undefined;
   const kraTabPermission = isMixBagKpaKraRoute
    ? PERMISSIONS.HR_DEPARTMENT_KPA_KRA_MIX_BAG_KRA_TAB.value
    : isMixBagDepartmentTasksRoute
      ? PERMISSIONS.HR_DEPARTMENT_TASK_MIX_BAG_KRA_TAB.value
      : undefined;
    
  const taskTabPermission = isMixBagKpaKraRoute
    ? PERMISSIONS.HR_DEPARTMENT_KPA_KRA_MIX_BAG_TASK_TAB.value
    : isMixBagDepartmentTasksRoute
      ? PERMISSIONS.HR_DEPARTMENT_TASK_MIX_BAG_TASK_TAB.value
      : undefined;
  
  const matchKPA = useMatch(
    "/app/dashboard/HR-dashboard/overall-KPA/department-KPA/:department"
  );
  const matchTasks = useMatch(
    "/app/dashboard/HR-dashboard/overall-KPA/department-tasks/:department"
  );

  const matchKpaMixBag = useMatch(
    "/app/dashboard/HR-dashboard/mix-bag/department-kpa-kra/department-KPA/:department"
  );
  const matchKpaMixBagDepartmentTasks = useMatch(
    "/app/dashboard/HR-dashboard/mix-bag/department-tasks/department-KPA/:department"
  );
  const matchTaskMixBag = useMatch(
    "/app/dashboard/HR-dashboard/mix-bag/department-kpa-kra/department-task/:department"
  );
  const matchTaskMixBagDepartmentTasks = useMatch(
    "/app/dashboard/HR-dashboard/mix-bag/department-tasks/department-task/:department"
  );
  const matchTasksMixBag = useMatch(
    "/app/dashboard/HR-dashboard/mix-bag/department-kpa-kra/department-tasks/:department"
  );
  const matchTasksMixBagDepartmentTasks = useMatch(
    "/app/dashboard/HR-dashboard/mix-bag/department-tasks/department-tasks/:department"
  );

   const isDepartmentView =
    !!matchKPA ||
    !!matchTasks ||
    !!matchKpaMixBag ||
    !!matchKpaMixBagDepartmentTasks ||
    !!matchTaskMixBag ||
    !!matchTaskMixBagDepartmentTasks ||
    !!matchTasksMixBag ||
    !!matchTasksMixBagDepartmentTasks;

  const tabs = [
    {
      label: "Department KPA",
      path: "department-KPA",
      permission: kpaTabPermission,
    },
    //{ label: "Department Tasks", path: "department-tasks" },
     {
      label: "Department KRA",
      path: "department-KRA",
      permission: kraTabPermission,
    },
    {
      label: "Department Tasks",
      path: isMixBagRoute ? "department-task" : "department-tasks",
      permission: taskTabPermission,
    },
  ];

  return (
    <TabLayout
     // basePath="/app/dashboard/HR-dashboard/overall-KPA"
       basePath={
        isMixBagKpaKraRoute
          ? "/app/dashboard/HR-dashboard/mix-bag/department-kpa-kra"
          : isMixBagDepartmentTasksRoute
            ? "/app/dashboard/HR-dashboard/mix-bag/department-tasks"
            : "/app/dashboard/HR-dashboard/overall-KPA"
      }
      defaultTabPath="department-KPA"
      tabs={tabs}
      hideTabsCondition={() => isDepartmentView}
    />
  );
};

export default HrTasksLayout;
