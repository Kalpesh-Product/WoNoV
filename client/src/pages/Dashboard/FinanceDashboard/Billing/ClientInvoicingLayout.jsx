import TabLayout from "../../../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../../../constants/permissions";
import { useLocation } from "react-router-dom";

const ClientInvoicingLayout = () => {
  const location = useLocation();
  const basePath = location.pathname.includes("/finance-dashboard1/")
    ? "/app/dashboard/finance-dashboard1/billing/client-invoicing"
    : "/app/dashboard/finance-dashboard/billing/client-invoicing";
  const tabs = [
    {
      label: "Co-Working",
      path: "co-working-revenue-invoicing",
      permission: PERMISSIONS.FINANCE_BILLING_COWORKING_REVENUE_INVOICING.value,
    },
    {
      label: "Flexible Desk Clients",
      path: "flexible-desk-revenue-invoicing",
      permission: PERMISSIONS.FINANCE_BILLING_COWORKING_REVENUE_INVOICING.value,
    },
    {
      label: "Meeting",
      path: "meeting-revenue-invoicing",
      permission: PERMISSIONS.FINANCE_BILLING_MEETING_REVENUE_INVOICING.value,
    },
    {
      label: "Day Pass",
      path: "day-pass-revenue-invoicing",
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
      basePath={basePath}
      defaultTabPath="co-working-revenue-invoicing"
      tabs={tabs}
    />
  );
};

export default ClientInvoicingLayout;
