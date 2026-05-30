import TabLayout from "../../../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../../../constants/permissions";
import { useLocation, useMatch } from "react-router-dom";

const HrTasksLayout = () => {
 const { pathname } = useLocation();
 const isOverallKpaRoute = pathname.includes("/overall-KPA");
 const isOverallDepartmentTasksRoute =
   pathname.includes("/overall-KPA/department-tasks");
 const isMixBagKpaKraRoute = pathname.includes("/mix-bag/department-kpa-kra");
 const isMixBagDepartmentTasksRoute = pathname.includes("/mix-bag/department-tasks");
  const kpaTabPermission = isMixBagKpaKraRoute
    ? PERMISSIONS.HR_DEPARTMENT_KPA_KRA_MIX_BAG_TAB.value
    : undefined;
   const kraTabPermission = isMixBagKpaKraRoute
    ? PERMISSIONS.HR_DEPARTMENT_KPA_KRA_MIX_BAG_KRA_TAB.value
    : undefined;
    
  const taskTabPermission = isMixBagDepartmentTasksRoute
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
  const matchTaskMixBagDepartmentTasks = useMatch(
    "/app/dashboard/HR-dashboard/mix-bag/department-tasks/department-task/:department"
  );
  const matchTasksMixBagDepartmentTasks = useMatch(
    "/app/dashboard/HR-dashboard/mix-bag/department-tasks/department-tasks/:department"
  );

   const isDepartmentView =
    !!matchKPA ||
    !!matchTasks ||
    !!matchKpaMixBag ||
    !!matchTaskMixBagDepartmentTasks ||
    !!matchTasksMixBagDepartmentTasks;

  const tabs = [
    ...(isOverallDepartmentTasksRoute || isMixBagDepartmentTasksRoute
      ? [
          {
            label: "Department Tasks",
            path: isMixBagDepartmentTasksRoute ? "department-task" : "department-tasks",
            permission: taskTabPermission,
          },
        ]
      : [
          {
            label: "Department KPA",
            path: "department-KPA",
            permission: kpaTabPermission,
          },
          {
            label: "Department KRA",
            path: "department-KRA",
            permission: kraTabPermission,
          },
          ...(isOverallKpaRoute || isMixBagKpaKraRoute
            ? []
            : [
                {
                  label: "Department Tasks",
                  path: "department-tasks",
                  permission: taskTabPermission,
                },
              ]),
        ]),
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
      defaultTabPath={
        isOverallDepartmentTasksRoute
          ? "department-tasks"
          : isMixBagDepartmentTasksRoute
            ? "department-task"
            : "department-KPA"
      }
      tabs={tabs}
      hideTabsCondition={() =>
        isDepartmentView ||
        isMixBagDepartmentTasksRoute ||
        isOverallDepartmentTasksRoute
      }
    />
  );
};

export default HrTasksLayout;
