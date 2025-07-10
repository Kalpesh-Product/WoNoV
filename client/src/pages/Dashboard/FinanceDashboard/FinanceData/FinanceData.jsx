import TabLayout from "../../../../components/Tabs/TabLayout";

const FinanceData = () => {
  const tabs = [
    { label: "Asset List", path: "asset-list" },
    {
      label: "Monthly Invoice Reports",
      path: "monthly-invoice-reports",
    },
    { label: "Vendor", path: "vendor" },
    // {
    //   label: "Monthly Vouchers",
    //   path: "finance-monthly-vouchers",
    // },
  ];

  return (
    <div>
      <TabLayout
        basePath={"/app/dashboard/finance-dashboard/data"}
        defaultTabPath={"asset-list"}
        tabs={tabs}
        hideTabsCondition={(pathname) => pathname.includes("asset-list/")}
      />
    </div>
  );
};

export default FinanceData;
