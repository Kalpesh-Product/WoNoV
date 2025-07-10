import TabLayout from "../../../../components/Tabs/TabLayout"; // adjust path as needed

const SalesDataCard = () => {
  const tabs = [
    { label: "Asset List", path: "asset-list" },
    { label: "Monthly Invoice Reports", path: "monthly-invoice-reports" },
    { label: "Vendor", path: "vendor" },
  ];

  return (
    <TabLayout
      basePath="/app/dashboard/sales-dashboard/data"
      defaultTabPath="asset-list"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("vendor/")}
    />
  );
};

export default SalesDataCard;
