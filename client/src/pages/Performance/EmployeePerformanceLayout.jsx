import TabLayout from "../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../constants/permissions";

const EmployeePerformanceLayout = () => {
  const basePath = "/app/performance/employee-KRA-KPA";

  const tabs = [
    {
      label: "Department Daily KRA",
      path: "daily-KRA",
      permission: PERMISSIONS.PERFORMANCE_EMPLOYEE_DEPARTMENT_DAILY_KRA.value,
    },
    {
      label: "Individual Daily KRA",
      path: "individual-Daily-KRA",
      permission: PERMISSIONS.PERFORMANCE_EMPLOYEE_INDIVIDUAL_DAILY_KRA.value,
    },
    {
      label: "Individual Monthly KPA",
      path: "individual-Monthly-KPA",
      permission: PERMISSIONS.PERFORMANCE_EMPLOYEE_INDIVIDUAL_MONTHLY_KPA.value,
    },
  ];

  return <TabLayout basePath={basePath} defaultTabPath="daily-KRA" tabs={tabs} />;
};

export default EmployeePerformanceLayout;