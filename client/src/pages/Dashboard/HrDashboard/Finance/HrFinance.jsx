import TabLayout from "../../../../components/Tabs/TabLayout"; // Adjust the path

const HrFinance = () => {
  const tabs = [
    { label: "Budget", path: "budget" },
    { label: "Payment Schedule", path: "payment-schedule" },
    { label: "Voucher", path: "voucher" },
    { label: "Payroll", path: "payroll" },
  ];

  const hideTabsCondition = (pathname) => pathname.includes("budget/");

  return (
    <TabLayout
      basePath={"/app/dashboard/HR-dashboard/finance"}
      tabs={tabs}
      defaultTabPath="budget"
      hideTabsCondition={hideTabsCondition}
    />
  );
};

export default HrFinance;
