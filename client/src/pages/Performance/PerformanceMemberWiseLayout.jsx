import { useLocation, useParams } from "react-router-dom";
import TabLayout from "../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../constants/permissions";

const PerformanceMemberWiseLayout = () => {
  const { overallType } = useParams();
  const location = useLocation();

  const isKraEntry =
    overallType === "overall-department-kra" ||
    location.pathname.includes("/overall-department-kra/");

  const tabs = [
    {
      label: "Member Wise KPA",
      path: "member-wise-kpa",
      permission: PERMISSIONS.PERFORMANCE_MEMBER_WISE_KPA.value,
    },
    {
      label: "Member Wise KRA",
      path: "member-wise-kra",
      permission: PERMISSIONS.PERFORMANCE_MEMBER_WISE_KRA.value,
    },
  ];

  return (
    <TabLayout
      basePath={`/app/performance/department-wise/${isKraEntry ? "overall-department-kra" : "overall-department-kpa"}`}
      defaultTabPath={isKraEntry ? "member-wise-kra" : "member-wise-kpa"}
      tabs={tabs}
    />
  );
};

export default PerformanceMemberWiseLayout;