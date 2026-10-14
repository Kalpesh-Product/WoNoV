import { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Card from "../../../../components/Card";
import WidgetSection from "../../../../components/WidgetSection";
import { PERMISSIONS } from "../../../../constants/permissions";
import useAuth from "../../../../hooks/useAuth";

const BILLING_BASE_PATH = "/app/dashboard/finance-dashboard/billing";

const BillingsLayout = () => {
  const location = useLocation();
  const billingBasePath = location.pathname.startsWith("/app/dashboard/finance-dashboard1/")
    ? "/app/dashboard/finance-dashboard1/billing"
    : BILLING_BASE_PATH;
  const { auth } = useAuth();

  const userPermissions = useMemo(
    () => auth?.user?.permissions?.permissions || [],
    [auth?.user?.permissions?.permissions]
  );

  const cards = useMemo(
    () => [
      {
        title: "Client Invoicing",
        route: `${billingBasePath}/client-invoicing`,
        permission: PERMISSIONS.FINANCE_BILLING_CLIENT_INVOICE.value,
      },
      {
        title: "Voucher Request",
        route: `${billingBasePath}/voucher-request`,
        permission: [
           PERMISSIONS.FINANCE_BILLING_VOUCHER_REQUEST.value,
          // PERMISSIONS.FINANCE_BILLING_DEPARTMENT_INVOICE.value,
          // PERMISSIONS.FINANCE_BILLING_PENDING_APPROVALS.value,
          // PERMISSIONS.FINANCE_BILLING_VOUCHER_HISTORY.value,
        ],
      },
      {
        title: "Budget Request",
        route: `${billingBasePath}/budget-request`,
        permission: [
          PERMISSIONS.FINANCE_BILLING_BUDGET_REQUEST.value,
          // PERMISSIONS.FINANCE_BILLING_DEPARTMENT_INVOICE.value,
          // PERMISSIONS.FINANCE_BILLING_PENDING_APPROVALS.value,
          // PERMISSIONS.FINANCE_BILLING_VOUCHER_HISTORY.value,
        ],
      },
    ],
    [billingBasePath]
  );

  const allowedCards = cards.filter((card) => {
    const requiredPermissions = Array.isArray(card.permission)
      ? card.permission
      : [card.permission];

    return requiredPermissions.some((permission) => userPermissions.includes(permission));
  });

  if (location.pathname.replace(/\/+$/, "") !== billingBasePath) {
    return <Outlet />;
  }

  return (
    <div className="p-4">
      <div className="h-[50vh] uppercase">
        <WidgetSection layout={2} padding>
          {allowedCards.map((card) => (
            <Card key={card.title} fullHeight title={card.title} route={card.route} />
          ))}
        </WidgetSection>
      </div>
    </div>
  );
};

export default BillingsLayout;
// import React from "react";
// import TabLayout from "../../../../components/Tabs/TabLayout"; // Adjust path if needed
// import { PERMISSIONS } from "../../../../constants/permissions";

// const BillingsLayout = () => {
//   const tabs = [
//     {
//       label: "Client-Invoice",
//       path: "client-invoice",
//       permission: PERMISSIONS.FINANCE_BILLING_CLIENT_INVOICE.value,
//     },
//     {
//       label: "Department-Invoice",
//       path: "department-invoice",
//       permission: PERMISSIONS.FINANCE_BILLING_DEPARTMENT_INVOICE.value,
//     },
//     {
//       label: "Pending Approvals",
//       path: "pending-approvals",
//       permission: PERMISSIONS.FINANCE_BILLING_PENDING_APPROVALS.value,
//     },
//     {
//       label: "Voucher History",
//       path: "voucher-history",
//       permission: PERMISSIONS.FINANCE_BILLING_VOUCHER_HISTORY.value,
//     },
//   ];

//   return (
//     <TabLayout
//       basePath="/app/dashboard/finance-dashboard/billing"
//       defaultTabPath="client-invoice"
//       tabs={tabs}
//       hideTabsCondition={(pathname) => pathname.includes("view-clients/")}
//     />
//   );
// };

// export default BillingsLayout;
