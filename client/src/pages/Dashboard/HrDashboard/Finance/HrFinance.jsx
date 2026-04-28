import TabLayout from "../../../../components/Tabs/TabLayout"; // Adjust the path
import { PERMISSIONS } from "../../../../constants/permissions";

const HrFinance = () => {
  const tabs = [
    {
      label: "Budget",
      path: "budget",
      permission: PERMISSIONS.HR_BUDGET.value,
    },
     {
      label: "Budget History",
      path: "budget-history",
      permission: PERMISSIONS.HR_BUDGET_HISTORY.value,
    },
    {
      label: "Payment Schedule",
      path: "payment-schedule",
      permission: PERMISSIONS.HR_PAYMENT_SCHEDULE.value,
    },
    {
      label: "Voucher",
      path: "voucher",
      permission: PERMISSIONS.HR_VOUCHER.value,
    },
     {
    label: "Reject Voucher",
    path: "reject-voucher",
    permission: PERMISSIONS.HR_REJECT_VOUCHER.value,
  },
       {
      label: "Voucher History",
      path: "voucher-history",
      permission: PERMISSIONS.HR_VOUCHER_HISTORY.value,
    },
    // {
    //   label: "Payroll",
    //   path: "payroll",
    //   permission: PERMISSIONS.HR_PAYROLL.value,
    // },
  ];

  const hideTabsCondition = (pathname) => pathname.includes("budget/");

  return (
    <TabLayout
      basePath={"/app/dashboard/HR-dashboard/finance"}
      tabs={tabs}
      defaultTabPath="budget"
      hideTabsCondition={hideTabsCondition}
    />
  );
};

export default HrFinance;
