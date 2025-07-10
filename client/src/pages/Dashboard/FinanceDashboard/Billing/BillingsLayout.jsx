import React from "react";
import TabLayout from "../../../../components/Tabs/TabLayout"; // Adjust path if needed

const BillingsLayout = () => {
  const tabs = [
    { label: "Client-Invoice", path: "client-invoice" },
    { label: "Department-Invoice", path: "department-invoice" },
    { label: "Pending Approvals", path: "pending-approvals" },
    { label: "Voucher History", path: "voucher-history" },
  ];

  return (
    <TabLayout
      basePath="/app/dashboard/finance-dashboard/billing"
      defaultTabPath="client-invoice"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("view-clients/")}
    />
  );
};

export default BillingsLayout;
