import TabLayout from "../../../../components/Tabs/TabLayout";

const FinanceBudgetLayout = () => {
  // Map routes to tabs
  const tabs = [
    { label: "Budget", path: "budget" },
    { label: "Voucher", path: "voucher" },
    { label: "Payment Schedule", path: "payment-schedule" },
    { label: "Dept. Wise Budget", path: "dept-wise-budget" },
    { label: "Collections", path: "collections" },
    { label: "Statutory Payments", path: "statutory-payments" },
    { label: "Landlord Payments", path: "landlord-payments" },
  ];

  return (
    <TabLayout
      tabs={tabs}
      basePath={"/app/dashboard/finance-dashboard/finance"}
      defaultTabPath={"budget"}
      hideTabsOnPaths={[
        "/app/dashboard/finance-dashboard/finance/dept-wise-budget/:id",
        "/app/dashboard/finance-dashboard/finance/landlord-payments-unit",
      ]}
    />
  );
};

export default FinanceBudgetLayout;
