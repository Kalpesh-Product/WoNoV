import { useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { FiArrowRight, FiChevronRight } from "react-icons/fi";
import { FaFileInvoiceDollar, FaReceipt, FaWallet } from "react-icons/fa6";
import Card from "../../../../components/Card";
import WidgetSection from "../../../../components/WidgetSection";
import { PERMISSIONS } from "../../../../constants/permissions";
import useAuth from "../../../../hooks/useAuth";

const BILLING_BASE_PATH = "/app/dashboard/finance-dashboard/billing";

const BillingCardIcon = ({ type }) => {
  const icons = {
    invoicing: <FaFileInvoiceDollar size={48} />,
    voucher: <FaReceipt size={48} />,
    budget: <FaWallet size={50} />,
  };

  return (
    <span
      className="relative inline-flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-full bg-[#1b4d80] text-white"
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
        description: "Create and manage client invoices.",
        action: "View Invoices",
        icon: "invoicing",
        route: `${billingBasePath}/client-invoicing`,
        permission: PERMISSIONS.FINANCE_BILLING_CLIENT_INVOICE.value,
      },
      {
        title: "Voucher Request",
        description: "Create and review voucher requests.",
        action: "Manage Vouchers",
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
        description: "Submit and track budget requests.",
        action: "Manage Budgets",
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
        <div
          className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
          style={{ maxWidth: 1600 }}
        >
          {allowedCards.map((card) => (
            <button
              key={card.route}
              type="button"
              onClick={() => navigate(card.route)}
              className="group relative flex min-h-[300px] w-full flex-col overflow-hidden rounded-[24px] border border-[#edf1f6] bg-white p-6 text-left shadow-[0_8px_30px_rgba(30,61,115,0.06)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(30,61,115,0.11)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3D73] focus-visible:ring-offset-2 lg:p-8"
            >
              <span
                className="absolute right-6 top-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#f5f8fc] text-[#071445] transition-colors duration-200 group-hover:bg-[#edf3fa] lg:right-7 lg:top-7"
                aria-hidden="true"
              >
                <FiChevronRight className="text-xl" />
              </span>

              <BillingCardIcon type={card.icon} />

              <h2 className="mt-5 whitespace-nowrap text-base font-pbold uppercase leading-tight tracking-[-0.02em] text-[#1b4d80] sm:text-lg xl:text-base 2xl:text-lg">
                {card.title}
              </h2>
              <p className="mt-2 max-w-[350px] text-sm font-pregular normal-case leading-6 text-[#53698f] lg:text-base">
                {card.description}
              </p>

              <span className="mt-auto flex items-center gap-4 pt-6 text-base font-pmedium normal-case text-[#1b4d80]">
                {card.action}
                <FiArrowRight
                  className="text-xl transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
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
