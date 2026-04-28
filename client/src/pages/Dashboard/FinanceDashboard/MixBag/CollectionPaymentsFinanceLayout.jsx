import TabLayout from "../../../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../../../constants/permissions";

const CollectionPaymentsFinanceLayout = () => {
  const tabs = [
    {
      label: "Collection",
      path: "collection",
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
      basePath="/app/dashboard/finance-dashboard/mix-bag/collection-payments"
      defaultTabPath="collection"
      tabs={tabs}
      hideTabsOnPaths={[
        "/app/dashboard/finance-dashboard/mix-bag/collection-payments/landlord-payments-unit",
      ]}
    />
  );
};

export default CollectionPaymentsFinanceLayout;