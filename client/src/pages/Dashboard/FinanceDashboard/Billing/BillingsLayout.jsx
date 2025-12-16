import React from "react";
import TabLayout from "../../../../components/Tabs/TabLayout"; // Adjust path if needed
import { PERMISSIONS } from "../../../../constants/permissions";

const BillingsLayout = () => {
  const tabs = [
    {
      label: "Client-Invoice",
      path: "client-invoice",
      permission: PERMISSIONS.FINANCE_BILLING_CLIENT_INVOICE.value,
    },
    {
      label: "Department-Invoice",
      path: "department-invoice",
      permission: PERMISSIONS.FINANCE_BILLING_DEPARTMENT_INVOICE.value,
    },
    {
      label: "Pending Approvals",
      path: "pending-approvals",
      permission: PERMISSIONS.FINANCE_BILLING_PENDING_APPROVALS.value,
    },
    {
      label: "Voucher History",
      path: "voucher-history",
      permission: PERMISSIONS.FINANCE_BILLING_VOUCHER_HISTORY.value,
    },
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
