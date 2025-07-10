import TabLayout from "../../../../components/Tabs/TabLayout"; // Adjust path

const Cashflow = () => {
  const tabs = [
    { label: "Projections", path: "projections" },
    { label: "Historical P&L", path: "historical-P&L" },
  ];

  return (
    <TabLayout
      basePath="/app/dashboard/finance-dashboard/cashflow"
      defaultTabPath="projections"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("projections/")} // Optional, can be false
    />
  );
};

export default Cashflow;
