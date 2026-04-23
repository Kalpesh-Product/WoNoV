import TabLayout from "../../../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../../../constants/permissions";

const VoucherRequest = () => {
  const tabs = [
    {
      label: "Department Invoice Voucher",
      path: "department-invoice-voucher",
      permission: PERMISSIONS.FINANCE_BILLING_DEPARTMENT_INVOICE.value,
    },
    {
      label: "Pending Approvals Voucher",
      path: "pending-approvals-voucher",
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
      basePath="/app/dashboard/finance-dashboard/billing/voucher-request"
      defaultTabPath="department-invoice-voucher"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("review-request")}
    />
  );
};

export default VoucherRequest;