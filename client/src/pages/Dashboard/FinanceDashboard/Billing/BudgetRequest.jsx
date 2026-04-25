
import TabLayout from "../../../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../../../constants/permissions";

const BudgetRequest = () => {
  const tabs = [
    {
      label: "Department Invoice Budget",
      path: "department-invoice-budget",
      permission: PERMISSIONS.FINANCE_BILLING_DEPARTMENT_INVOICE.value,
    },
    {
      label: "Pending Approvals Budget",
      path: "pending-approvals-budget",
      permission: PERMISSIONS.FINANCE_BILLING_PENDING_APPROVALS.value,
    },
    {
      label: "Budget History",
      path: "budget-history",
      permission: PERMISSIONS.FINANCE_BILLING_VOUCHER_HISTORY.value,
    },
  ];

  return (
    <TabLayout
      basePath="/app/dashboard/finance-dashboard/billing/budget-request"
      defaultTabPath="department-invoice-budget"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("review-request")}
    />
  );
};

export default BudgetRequest;