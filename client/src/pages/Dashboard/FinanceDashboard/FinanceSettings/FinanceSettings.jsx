import React from "react";
import TabLayout from "../../../../components/Tabs/TabLayout"; // Adjust path as needed

const FinanceSettings = () => {
  const tabs = [
    { label: "Bulk Upload", path: "bulk-upload" },
    { label: "SOPs", path: "sops" },
    { label: "Policies", path: "policies" },
  ];

  return (
    <TabLayout
      basePath="/app/dashboard/finance-dashboard/settings"
      defaultTabPath="bulk-upload"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("bulk-upload/")}
    />
  );
};

export default FinanceSettings;
