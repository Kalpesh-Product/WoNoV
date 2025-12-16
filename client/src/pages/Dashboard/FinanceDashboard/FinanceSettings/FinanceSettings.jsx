import React from "react";
import TabLayout from "../../../../components/Tabs/TabLayout"; // Adjust path as needed
import { PERMISSIONS } from "../../../../constants/permissions";

const FinanceSettings = () => {
  const tabs = [
    {
      label: "Bulk Upload",
      path: "bulk-upload",
      permission: PERMISSIONS.FINANCE_SETTINGS_BULK_UPLOAD.value,
    },
    {
      label: "SOPs",
      path: "sops",
      permission: PERMISSIONS.FINANCE_SETTINGS_SOPS.value,
    },
    {
      label: "Policies",
      path: "policies",
      permission: PERMISSIONS.FINANCE_SETTINGS_POLICIES.value,
    },
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
