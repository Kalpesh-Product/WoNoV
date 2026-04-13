import TabLayout from "../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../constants/permissions";

const PerformanceDepartmentWiseLayout = () => {
  const tabs = [
    {
      label: "Overall Department Wise KPA",
      path: "overall-department-kpa",
      permission: [
        PERMISSIONS.PERFORMANCE_OVERALL_DEPARTMENT_WISE_KPA.value ,
       // PERMISSIONS.PERFORMANCE_DEPARTMENT_WISE_KRA_KPA.value,
      ],
    },
    {
      label: "Overall Department Wise KRA",
      path: "overall-department-kra",
      permission: [
        PERMISSIONS.PERFORMANCE_OVERALL_DEPARTMENT_WISE_KRA.value,
       // PERMISSIONS.PERFORMANCE_DEPARTMENT_WISE_KRA_KPA.value,
      ],
    },
  ];

  return (
    <TabLayout
      basePath="/app/performance/department-wise"
      defaultTabPath="overall-department-kpa"
      tabs={tabs}
    />
  );
};

export default PerformanceDepartmentWiseLayout;