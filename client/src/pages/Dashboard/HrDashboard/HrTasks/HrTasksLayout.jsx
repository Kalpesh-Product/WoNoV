import TabLayout from "../../../../components/Tabs/TabLayout";
import { useMatch } from "react-router-dom";

const HrTasksLayout = () => {
  const matchKPA = useMatch(
    "/app/dashboard/HR-dashboard/overall-KPA/department-KPA/:department"
  );
  const matchTasks = useMatch(
    "/app/dashboard/HR-dashboard/overall-KPA/department-tasks/:department"
  );

  const isDepartmentView = !!matchKPA || !!matchTasks;

  const tabs = [
    { label: "Department KPA", path: "department-KPA" },
    { label: "Department Tasks", path: "department-tasks" },
  ];

  return (
    <TabLayout
      basePath="/app/dashboard/HR-dashboard/overall-KPA"
      defaultTabPath="department-KPA"
      tabs={tabs}
      hideTabsCondition={() => isDepartmentView}
    />
  );
};

export default HrTasksLayout;
