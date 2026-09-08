import TabLayout from "../../../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../../../constants/permissions";

const BASE_PATH = "/app/dashboard/finance-dashboard/billing/client-invoicing";

const ClientInvoicingLayout = () => {
  const tabs = [
    {
      label: "Co-Working",
      path: "co-working-revenue-invoicing",
      permission: PERMISSIONS.FINANCE_BILLING_COWORKING_REVENUE_INVOICING.value,
    },
    {
      label: "Meeting",
      path: "meeting-revenue-invoicing",
      permission: PERMISSIONS.FINANCE_BILLING_MEETING_REVENUE_INVOICING.value,
    },
    {
      label: "Virtual Office ",
      path: "virtual-office-revenue-invoicing",
      permission:
        PERMISSIONS.FINANCE_BILLING_VIRTUAL_OFFICE_REVENUE_INVOICING.value,
    },
    {
      label: "Workation",
      path: "workation-revenue-invoicing",
      permission: PERMISSIONS.FINANCE_BILLING_WORKATION_REVENUE_INVOICING.value,
    },
    {
      label: "Alternate",
      path: "alternate-revenue-invoicing",
      permission: PERMISSIONS.FINANCE_BILLING_ALTERNATE_REVENUE_INVOICING.value,
    },
  ];

  return (
    <TabLayout
      basePath={BASE_PATH}
      defaultTabPath="co-working-revenue-invoicing"
      tabs={tabs}
    />
  );
};

export default ClientInvoicingLayout;