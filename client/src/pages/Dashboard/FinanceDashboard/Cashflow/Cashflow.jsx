import TabLayout from "../../../../components/Tabs/TabLayout"; // Adjust path
import { PERMISSIONS } from "../../../../constants/permissions";

const Cashflow = () => {
  const tabs = [
    {
      label: "Projections",
      path: "projections",
      permission: PERMISSIONS.FINANCE_CASHFLOW_PROJECTIONS.value,
    },
    {
      label: "Historical P&L",
      path: "historical-P&L",
      permission: PERMISSIONS.FINANCE_CASHFLOW_HISTORICAL.value,
    },
  ];

  return (
    <TabLayout
      basePath="/app/dashboard/finance-dashboard/cashflow"
      defaultTabPath="projections"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("projections/")} // Optional, can be false
    />
  );
};

export default Cashflow;
