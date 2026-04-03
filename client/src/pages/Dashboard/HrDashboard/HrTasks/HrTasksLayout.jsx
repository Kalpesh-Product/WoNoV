import TabLayout from "../../../../components/Tabs/TabLayout";
import { useLocation, useMatch } from "react-router-dom";

const HrTasksLayout = () => {
 const { pathname } = useLocation();
  const isMixBagRoute = pathname.includes("/mix-bag/overall-KPA");
  const matchKPA = useMatch(
    "/app/dashboard/HR-dashboard/overall-KPA/department-KPA/:department"
  );
  const matchTasks = useMatch(
    "/app/dashboard/HR-dashboard/overall-KPA/department-tasks/:department"
  );

  const matchKpaMixBag = useMatch(
    "/app/dashboard/HR-dashboard/mix-bag/overall-KPA/department-KPA/:department"
  );
  const matchTaskMixBag = useMatch(
    "/app/dashboard/HR-dashboard/mix-bag/overall-KPA/department-task/:department"
  );
  const matchTasksMixBag = useMatch(
    "/app/dashboard/HR-dashboard/mix-bag/overall-KPA/department-tasks/:department"
  );

   const isDepartmentView =
    !!matchKPA ||
    !!matchTasks ||
    !!matchKpaMixBag ||
    !!matchTaskMixBag ||
    !!matchTasksMixBag;

  const tabs = [
    { label: "Department KPA", path: "department-KPA" },
    //{ label: "Department Tasks", path: "department-tasks" },
    { label: "Department Tasks", path: isMixBagRoute ? "department-task" : "department-tasks" },
  ];

  return (
    <TabLayout
     // basePath="/app/dashboard/HR-dashboard/overall-KPA"
       basePath={
        isMixBagRoute
          ? "/app/dashboard/HR-dashboard/mix-bag/overall-KPA"
          : "/app/dashboard/HR-dashboard/overall-KPA"
      }
      defaultTabPath="department-KPA"
      tabs={tabs}
      hideTabsCondition={() => isDepartmentView}
    />
  );
};

export default HrTasksLayout;
