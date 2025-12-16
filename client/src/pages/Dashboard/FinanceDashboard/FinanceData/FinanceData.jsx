import TabLayout from "../../../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../../../constants/permissions";

const FinanceData = () => {
  const tabs = [
    {
      label: "Asset List",
      path: "asset-list",
      permission: PERMISSIONS.FINANCE_DATA_ASSET_LIST.value,
    },
    {
      label: "Monthly Invoice Reports",
      path: "monthly-invoice-reports",
      permission: PERMISSIONS.FINANCE_DATA_MONTHLY_INVOICE_REPORTS.value,
    },
    {
      label: "Vendor",
      path: "vendor",
      permission: PERMISSIONS.FINANCE_DATA_VENDORS.value,
    },
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
