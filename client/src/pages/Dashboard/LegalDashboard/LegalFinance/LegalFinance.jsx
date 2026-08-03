import TabLayout from "../../../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../../../constants/permissions";

const tabs = [
  {
    label: "Budget",
    path: "budget",
    permission: PERMISSIONS.LEGAL_BUDGET.value,
  },
  {
    label: "Budget History",
    path: "budget-history",
    permission: PERMISSIONS.LEGAL_BUDGET_HISTORY.value,
  },
  {
    label: "Payment Schedule",
    path: "payment-schedule",
    permission: PERMISSIONS.LEGAL_PAYMENT_SCHEDULE.value,
  },
  {
    label: "Voucher",
    path: "voucher",
    permission: PERMISSIONS.LEGAL_VOUCHER.value,
  },
  {
    label: "Reject Voucher",
    path: "reject-voucher",
    permission: PERMISSIONS.LEGAL_REJECT_VOUCHER.value,
  },
  {
    label: "Voucher History",
    path: "voucher-history",
    permission: PERMISSIONS.LEGAL_VOUCHER_HISTORY.value,
  },
];

const LegalFinance = () => {
  return (
    <TabLayout
      basePath="/app/dashboard/legal-dashboard/finance"
      defaultTabPath="budget"
      tabs={tabs}
      hideTabsCondition={(pathname) => pathname.includes("budget/")}
    />
  );
};

export default LegalFinance;