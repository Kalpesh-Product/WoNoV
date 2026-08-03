import TabLayout from "../../../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../../../constants/permissions";

const tabs = [
  {
    label: "Asset List",
    path: "asset-list",
    permission: PERMISSIONS.LEGAL_ASSET_LIST.value,
  },
  {
    label: "Monthly Budget Reports",
    path: "monthly-budget-report",
    permission: PERMISSIONS.LEGAL_MONTHLY_BUDGET_REPORT.value,
  },
  {
    label: "Monthly Invoice Reports",
    path: "monthly-invoice-reports",
    permission: PERMISSIONS.LEGAL_MONTHLY_INVOICE_REPORTS.value,
  },
  {
    label: "Vendor",
    path: "vendor",
    permission: PERMISSIONS.LEGAL_VENDOR.value,
  },
];

const LegalDataCard = () => {
  return (
    <TabLayout
      basePath="/app/dashboard/legal-dashboard/data"
      defaultTabPath="asset-list"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("vendor/")}
    />
  );
};

export default LegalDataCard;