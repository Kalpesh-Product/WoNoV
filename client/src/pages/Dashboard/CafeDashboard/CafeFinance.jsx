import TabLayout from "../../../components/Tabs/TabLayout";
import { PERMISSIONS } from "../../../constants/permissions";

const tabs = [
  {
    label: "Budget",
    path: "budget",
    permission: PERMISSIONS.CAFE_BUDGET.value,
  },
  {
    label: "Budget History",
    path: "budget-history",
    permission: PERMISSIONS.CAFE_BUDGET_HISTORY.value,
  },
  {
    label: "Payment Schedule",
    path: "payment-schedule",
    permission: PERMISSIONS.CAFE_PAYMENT_SCHEDULE.value,
  },
  {
    label: "Voucher",
    path: "voucher",
    permission: PERMISSIONS.CAFE_VOUCHER.value,
  },
  {
    label: "Reject Voucher",
    path: "reject-voucher",
    permission: PERMISSIONS.CAFE_REJECT_VOUCHER.value,
  },
  {
    label: "Voucher History",
    path: "voucher-history",
    permission: PERMISSIONS.CAFE_VOUCHER_HISTORY.value,
  },
];

const CafeFinance = () => (
  <TabLayout
    basePath="/app/dashboard/cafe-dashboard/finance"
    defaultTabPath="budget"
    tabs={tabs}
    hideTabsCondition={(pathname) => pathname.includes("budget/")}
  />
);

export default CafeFinance;