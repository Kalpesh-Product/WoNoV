import { useParams } from "react-router-dom";

import TabLayout from "../../../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../../../constants/permissions";

const HrDepartmentKpaOverviewLayout = () => {
  const { department } = useParams();
  const basePath = `/app/dashboard/HR-dashboard/mix-bag/department-kpa-kra/department-KPA/${encodeURIComponent(department)}`;

  const tabs = [
    {
      label: "Department Wise KPA Overview",
      path: "department-wise",
      permission:
        PERMISSIONS.HR_DEPARTMENT_KPA_DEPARTMENT_WISE_OVERVIEW_TAB.value,
    },
    {
      label: "Member Wise KPA Overview",
      path: "member-wise",
      permission: PERMISSIONS.HR_DEPARTMENT_KPA_MEMBER_WISE_OVERVIEW_TAB.value,
    },
  ];

  return (
    <TabLayout
      basePath={basePath}
      defaultTabPath="department-wise"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("/member-wise/member")}
    />
  );
};

export default HrDepartmentKpaOverviewLayout;