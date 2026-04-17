
import TabLayout from "../../../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../../../constants/permissions";

const ManageMeetingsFinanceLayout = () => {

  // Map routes to tabs
const tabs = [
  {
    label: "Internal Meetings",
    path: "internal-meetings",
    permission: PERMISSIONS.FINANCE_MEETINGS_INTERNAL.value,
  },
  {
    label: "External Clients",
    path: "external-clients",
    permission: PERMISSIONS.FINANCE_MEETINGS_EXTERNAL.value,
  },
  {
    label: "Day Pass",
    path: "day-pass",
    permission: PERMISSIONS.FINANCE_VISITORS_DAY_PASS.value,
  },
];

  return (
    <TabLayout
      basePath="/app/dashboard/finance-dashboard/mix-bag/manage-meetings"
      defaultTabPath="internal-meetings"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("internal-meetings/")}
    />
  );
};

export default ManageMeetingsFinanceLayout;
