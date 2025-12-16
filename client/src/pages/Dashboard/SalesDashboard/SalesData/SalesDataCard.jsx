import TabLayout from "../../../../components/Tabs/TabLayout"; // adjust path as needed
import { PERMISSIONS } from "../../../../constants/permissions";

const SalesDataCard = () => {
const tabs = [
  {
    label: "Asset List",
    path: "asset-list",
    permission: PERMISSIONS.SALES_ASSET_LIST.value,
  },
  {
    label: "Monthly Invoice Reports",
    path: "monthly-invoice-reports",
    permission: PERMISSIONS.SALES_MONTHLY_INVOICE_REPORTS.value,
  },
  {
    label: "Vendor",
    path: "vendor",
    permission: PERMISSIONS.SALES_VENDOR.value,
  },
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
