import { useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { FaFileInvoiceDollar, FaReceipt, FaWallet } from "react-icons/fa6";
import Card from "../../../../components/Card";
import WidgetSection from "../../../../components/WidgetSection";
import { PERMISSIONS } from "../../../../constants/permissions";
import useAuth from "../../../../hooks/useAuth";

const BILLING_BASE_PATH = "/app/dashboard/finance-dashboard/billing";

const BillingCardIcon = ({ type }) => {
  const icons = {
    invoicing: <FaFileInvoiceDollar className="h-[34px] w-[34px] min-[1800px]:h-10 min-[1800px]:w-10" />,
    voucher: <FaReceipt className="h-9 w-9 min-[1800px]:h-[42px] min-[1800px]:w-[42px]" />,
    budget: <FaWallet className="h-9 w-9 min-[1800px]:h-[42px] min-[1800px]:w-[42px]" />,
  };

  return (
    <span
      className="relative inline-flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-[#1b4d80] text-white min-[1800px]:h-[88px] min-[1800px]:w-[88px]"
      aria-hidden="true"
    >
      {icons[type]}
    </span>
  );
};

const BillingsLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isFinanceDashboard1 = location.pathname.startsWith(
    "/app/dashboard/finance-dashboard1/"
  );
  const billingBasePath = isFinanceDashboard1
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
        action: "View Invoice",
        icon: "invoicing",
        route: `${billingBasePath}/client-invoicing`,
        permission: PERMISSIONS.FINANCE_BILLING_CLIENT_INVOICE.value,
      },
      {
        title: "Voucher Request",
        action: "View Voucher",
        icon: "voucher",
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
        action: "View Budget",
        icon: "budget",
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

  if (isFinanceDashboard1) {
    return (
      <div className="p-4 lg:p-6">
        <div className="flex w-full flex-wrap gap-5">
          {allowedCards.map((card) => (
            <button
              key={card.route}
              type="button"
              onClick={() => navigate(card.route)}
              className="group relative flex min-h-[150px] w-full grow basis-full overflow-hidden rounded-[24px] border border-[#dfe8f2] bg-white text-left shadow-[0_10px_24px_rgba(30,61,115,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(30,61,115,0.13)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3D73] focus-visible:ring-offset-2 md:basis-[calc(50%-0.625rem)] xl:basis-[calc(33.333%-0.833rem)] min-[1800px]:min-h-[185px] min-[1800px]:rounded-[28px] min-[1800px]:shadow-[0_12px_30px_rgba(30,61,115,0.08)] min-[1800px]:hover:shadow-[0_16px_36px_rgba(30,61,115,0.13)]"
            >
              <span
                className="absolute inset-y-0 left-0 z-10 w-2 bg-[#0d6eb8] min-[1800px]:w-2.5"
                aria-hidden="true"
              />

              <div className="flex w-[32%] min-w-[112px] shrink-0 items-center justify-center px-3 py-5 sm:min-w-[140px] sm:px-4 min-[1800px]:w-[36%] min-[1800px]:min-w-[165px] min-[1800px]:px-5">
                <BillingCardIcon type={card.icon} />
              </div>

              <div className="relative min-w-0 flex-1 px-4 sm:px-8">
                <div className="absolute left-4 top-[39px] flex h-[72px] flex-col items-start justify-between sm:left-6 min-[1800px]:left-8 min-[1800px]:top-[49px] min-[1800px]:h-[88px]">
                  <h2 className="whitespace-nowrap text-sm font-pbold uppercase leading-tight tracking-[-0.02em] text-[#073f77] min-[1800px]:text-lg">
                    {card.title}
                  </h2>
                  <span className="flex items-center gap-2.5 whitespace-nowrap text-sm font-pmedium normal-case text-[#073f77] min-[1800px]:gap-3 min-[1800px]:text-base">
                    {card.action}
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#eff5fb] transition-all duration-200 group-hover:translate-x-1 group-hover:bg-[#e5eff9] min-[1800px]:h-7 min-[1800px]:w-7">
                      <FiChevronRight
                        className="text-sm min-[1800px]:text-base"
                        aria-hidden="true"
                      />
                    </span>
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
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
