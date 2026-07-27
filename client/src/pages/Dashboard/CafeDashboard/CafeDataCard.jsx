import TabLayout from "../../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../../constants/permissions";

const CafeDataCard = () => {
  const tabs = [
    {
      label: "Asset List",
      path: "asset-list",
      permission: PERMISSIONS.CAFE_ASSET_LIST.value,
    },
    {
      label: "Monthly Budget Reports",
      path: "monthly-budget-report",
      permission: PERMISSIONS.CAFE_MONTHLY_BUDGET_REPORT.value,
    },
    {
      label: "Monthly Invoice Reports",
      path: "monthly-invoice-reports",
      permission: PERMISSIONS.CAFE_MONTHLY_INVOICE_REPORTS.value,
    },
    {
      label: "Vendor",
      path: "vendor",
      permission: PERMISSIONS.CAFE_VENDOR.value,
    },
  ];

  return (
    <TabLayout
      basePath="/app/dashboard/cafe-dashboard/data"
      defaultTabPath="asset-list"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("vendor/")}
    />
  );
};

export default CafeDataCard;