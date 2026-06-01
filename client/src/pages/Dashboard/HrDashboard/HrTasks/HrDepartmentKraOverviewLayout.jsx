import { useParams } from "react-router-dom";

import TabLayout from "../../../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../../../constants/permissions";

const HrDepartmentKraOverviewLayout = () => {
  const { department } = useParams();
  const basePath = `/app/dashboard/HR-dashboard/mix-bag/department-kpa-kra/department-KRA/${encodeURIComponent(department)}`;

  const tabs = [
    {
      label: "Department Wise KRA Overview",
      path: "department-wise",
      permission:
        PERMISSIONS.HR_DEPARTMENT_KRA_DEPARTMENT_WISE_OVERVIEW_TAB.value,
    },
    {
      label: "Member Wise KRA Overview",
      path: "member-wise",
      permission: PERMISSIONS.HR_DEPARTMENT_KRA_MEMBER_WISE_OVERVIEW_TAB.value,
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

export default HrDepartmentKraOverviewLayout;

// import { useParams } from "react-router-dom";

// import TabLayout from "../../../../components/Tabs/TabLayout";
// import { PERMISSIONS } from "../../../../constants/permissions";

// const HrDepartmentKraOverviewLayout = () => {
//   const { department } = useParams();
//   const basePath = `/app/dashboard/HR-dashboard/mix-bag/department-kpa-kra/department-KRA/${encodeURIComponent(department)}`;

//   const tabs = [
//     {
//       label: "Department Wise KRA Overview",
//       path: "department-wise",
//       permission:
//         PERMISSIONS.HR_DEPARTMENT_KRA_DEPARTMENT_WISE_OVERVIEW_TAB.value,
//     },
//     {
//       label: "Member Wise KRA Overview",
//       path: "member-wise",
//       permission: PERMISSIONS.HR_DEPARTMENT_KRA_MEMBER_WISE_OVERVIEW_TAB.value,
//     },
//   ];

//   return (
//     <TabLayout
//       basePath={basePath}
//       defaultTabPath="department-wise"
//       tabs={tabs}
//     />
//   );
// };

// export default HrDepartmentKraOverviewLayout;