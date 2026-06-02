import { Outlet, useLocation, useParams } from "react-router-dom";

import TabLayout from "../../../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../../../constants/permissions";

const HrDepartmentKpaOverviewLayout = () => {
  const { department } = useParams();
  const { pathname } = useLocation();
  const basePath = pathname.includes("/mix-bag/department-kpa-kra/")
    ? `/app/dashboard/HR-dashboard/mix-bag/department-kpa-kra/department-KPA/${encodeURIComponent(department)}`
    : `/app/dashboard/HR-dashboard/overall-KPA/department-KPA/${encodeURIComponent(department)}`;
  const isMemberDetailsRoute =
    pathname.includes("/member-wise/monthly-KPA") ||
    pathname.includes("/member-wise/individual-Monthly-KPA") ||
    pathname.includes("/member-wise/team-Monthly-KPA");
  const consistentSpacingClass = "-mt-8 -mx-5 -mb-3";

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

  if (isMemberDetailsRoute) {
    return (
      <div className={consistentSpacingClass}>
        <Outlet />
      </div>
    );
  }

  return (
    <div className={consistentSpacingClass}>
      <TabLayout
        basePath={basePath}
        defaultTabPath="department-wise"
        tabs={tabs}
      />
    </div>
  );
};

export default HrDepartmentKpaOverviewLayout;
