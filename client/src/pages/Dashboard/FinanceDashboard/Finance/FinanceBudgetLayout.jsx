import TabLayout from "../../../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../../../constants/permissions";

const FinanceBudgetLayout = () => {
  // Map routes to tabs
  const tabs = [
    {
      label: "Budget",
      path: "budget",
      permission: PERMISSIONS.FINANCE_BUDGET.value,
    },
    {
      label: "Payment Schedule",
      path: "payment-schedule",
      permission: PERMISSIONS.FINANCE_PAYMENT_SCHEDULE.value,
    },
    {
      label: "Voucher",
      path: "voucher",
      permission: PERMISSIONS.FINANCE_VOUCHER.value,
    },
    {
      label: "Dept. Wise Budget",
      path: "dept-wise-budget",
      permission: PERMISSIONS.FINANCE_DEPT_WISE_BUDGET.value,
    },
    {
      label: "Collections",
      path: "collections",
      permission: PERMISSIONS.FINANCE_COLLECTIONS.value,
    },
    {
      label: "Statutory Payments",
      path: "statutory-payments",
      permission: PERMISSIONS.FINANCE_STATUTORY_PAYMENTS.value,
    },
    {
      label: "Landlord Payments",
      path: "landlord-payments",
      permission: PERMISSIONS.FINANCE_LANDLORD_PAYMENTS.value,
    },
  ];

  return (
    <TabLayout
      tabs={tabs}
      basePath={"/app/dashboard/finance-dashboard/finance"}
      defaultTabPath={"budget"}
      scrollable={true}
      hideTabsOnPaths={[
        "/app/dashboard/finance-dashboard/finance/dept-wise-budget/:id",
        "/app/dashboard/finance-dashboard/finance/landlord-payments-unit",
      ]}
    />
  );
};

export default FinanceBudgetLayout;
