import { FiArrowRight, FiChevronRight } from "react-icons/fi";
import { useLocation } from "react-router-dom";
import {
  FaArrowTrendUp,
  FaBuilding,
  FaCalendarDays,
  FaChartColumn,
  FaCircleCheck,
  FaCreditCard,
  FaFileContract,
  FaFileLines,
  FaHouse,
  FaIndianRupeeSign,
  FaShieldHalved,
  FaUserGroup,
  FaWallet,
} from "react-icons/fa6";

import { PERMISSIONS } from "../../../../constants/permissions";
import Card from "../../../../components/Card";
import WidgetSection from "../../../../components/WidgetSection";
import useAuth from "../../../../hooks/useAuth";
import { useFinanceNavigate as useNavigate } from "../financeDashboard1";

const routes = [
  {
    title: "Revenue",
    description: "Review income across revenue streams.",
    action: "View Revenue",
    icon: "revenue",
    route: "/app/dashboard/finance-dashboard/mix-bag/revenue",
    permission: PERMISSIONS.FINANCE_REVENUE_MIX_BAG.value,
  },
  {
    title: "Manage Meetings",
    description: "Manage bookings and meeting records.",
    action: "Manage Meetings",
    icon: "meetings",
    route: "/app/dashboard/finance-dashboard/mix-bag/manage-meetings",
    permission: PERMISSIONS.FINANCE_MANAGE_MEETINGS_MIX_BAG.value,
  },
  {
    title: "Department Wise Budget",
    description: "Track budgets across departments.",
    action: "View Budgets",
    icon: "budget",
    route: "/app/dashboard/finance-dashboard/mix-bag/department-wise-budget",
    permission: PERMISSIONS.FINANCE_DEPARTMENT_WISE_BUDGET_MIX_BAG.value,
  },
  {
    title: "Collection & Payments",
    description: "Manage collections and outgoing payments.",
    action: "View Transactions",
    icon: "collections",
    route: "/app/dashboard/finance-dashboard/mix-bag/collection-payments",
    permission: PERMISSIONS.FINANCE_COLLECTION_PAYMENTS_MIX_BAG.value,
  },
  {
    title: "Directors & Company KYC",
    description: "Access director and company KYC records.",
    action: "View KYC",
    icon: "kyc",
    route: "/app/dashboard/finance-dashboard/mix-bag/directors-company-KYC",
    permission: PERMISSIONS.FINANCE_DIRECTORS_COMPANY_KYC_MIX_BAG.value,
  },
  {
    title: "Compliance Documents",
    description: "Organize and access compliance documents.",
    action: "View Documents",
    icon: "compliance",
    route: "/app/dashboard/finance-dashboard/mix-bag/compliance-documents",
    permission: PERMISSIONS.FINANCE_COMPLIANCE_DOCUMENTS_MIX_BAG.value,
  },
  {
    title: "Landlord Agreements",
    description: "Review and manage landlord agreements.",
    action: "View Agreements",
    icon: "landlord",
    route: "/app/dashboard/finance-dashboard/mix-bag/landlord-agreements",
    permission: PERMISSIONS.FINANCE_LANDLORD_AGREEMENTS_MIX_BAG.value,
  },
  {
    title: "Client Agreements",
    description: "Review and manage client agreements.",
    action: "View Agreements",
    icon: "client",
    route: "/app/dashboard/finance-dashboard/mix-bag/client-agreements",
    permission: PERMISSIONS.FINANCE_CLIENT_AGREEMENTS_MIX_BAG.value,
  },
];

const FinanceCardIcon = ({ type }) => {
  const iconColor = "#ffffff";
  const accent = "#07386b";

  const icons = {
    revenue: (
      <>
        <FaChartColumn
          className="absolute"
          size={38}
          style={{ color: iconColor, bottom: 21, left: 20 }}
        />
        <FaArrowTrendUp
          className="absolute"
          size={36}
          style={{ color: iconColor, right: 17, top: 16 }}
        />
      </>
    ),
    meetings: (
      <>
        <FaCalendarDays size={52} style={{ color: iconColor }} />
        <span
          className="absolute rounded-full bg-white"
          style={{ left: 27, top: 19, width: 8, height: 8 }}
        />
        <span
          className="absolute rounded-full bg-white"
          style={{ right: 27, top: 19, width: 8, height: 8 }}
        />
      </>
    ),
    budget: (
      <>
        <FaWallet size={54} style={{ color: iconColor }} />
        <span
          className="absolute -rotate-12 rounded-full bg-white"
          style={{ right: 19, top: 23, width: 34, height: 12 }}
        />
      </>
    ),
    collections: (
      <>
        <FaCreditCard size={54} style={{ color: iconColor }} />
        <span
          className="absolute flex items-center justify-center rounded-full bg-white text-[#07386b] shadow-sm"
          style={{ bottom: 12, right: 10, width: 32, height: 32 }}
        >
          <FaIndianRupeeSign size={15} />
        </span>
      </>
    ),
    kyc: (
      <>
        <FaUserGroup size={52} style={{ color: iconColor }} />
        <span
          className="absolute flex items-center justify-center rounded-full bg-white text-[#07386b] shadow-sm"
          style={{ bottom: 12, right: 10, width: 32, height: 32 }}
        >
          <FaShieldHalved size={17} />
        </span>
      </>
    ),
    compliance: (
      <>
        <FaFileLines size={52} style={{ color: iconColor }} />
        <FaCircleCheck
          className="absolute rounded-full bg-white"
          size={29}
          style={{ color: accent, bottom: 12, right: 10 }}
        />
      </>
    ),
    landlord: (
      <>
        <FaHouse size={50} style={{ color: iconColor }} />
        <span
          className="absolute flex items-center justify-center rounded-md bg-white"
          style={{ bottom: 10, right: 8, width: 32, height: 34 }}
        >
          <FaFileContract size={23} style={{ color: accent }} />
        </span>
      </>
    ),
    client: (
      <>
        <FaBuilding size={50} style={{ color: iconColor }} />
        <span
          className="absolute flex items-center justify-center rounded-md bg-white"
          style={{ bottom: 10, right: 8, width: 32, height: 34 }}
        >
          <FaFileContract size={23} style={{ color: accent }} />
        </span>
      </>
    ),
  };

  return (
    <span
      className="relative inline-flex items-center justify-center self-start rounded-full bg-[#1b4d80]"
      style={{
        width: 88,
        height: 88,
        minWidth: 88,
        minHeight: 88,
        flex: "0 0 88px",
      }}
    >
      {icons[type]}
    </span>
  );
};

const MixBag = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions?.permissions || [];
  const allowedRoutes = routes.filter(
    (route) => !route.permission || userPermissions.includes(route.permission)
  );
  const isFinanceDashboard1 = pathname.startsWith(
    "/app/dashboard/finance-dashboard1"
  );

  if (!isFinanceDashboard1) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="min-h-[50vh] uppercase pt-2">
          <WidgetSection layout={2} padding>
            {allowedRoutes.map((route) => (
              <Card
                fullHeight
                key={route.route}
                title={route.title}
                route={route.route}
              />
            ))}
          </WidgetSection>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div
        className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4"
        style={{ maxWidth: 1600 }}
      >
        {allowedRoutes.map((route) => {
          return (
            <button
              key={route.route}
              type="button"
              onClick={() => navigate(route.route)}
              className="group relative flex w-full flex-col overflow-hidden rounded-[24px] border border-[#edf1f6] bg-white p-6 text-left shadow-[0_8px_30px_rgba(30,61,115,0.06)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(30,61,115,0.11)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3D73] focus-visible:ring-offset-2 lg:p-8"
              style={{ minHeight: 300 }}
            >
              <span
                className="absolute right-6 top-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#f5f8fc] text-[#071445] transition-colors duration-200 group-hover:bg-[#edf3fa] lg:right-7 lg:top-7"
                aria-hidden="true"
              >
                <FiChevronRight className="text-xl" />
              </span>

              <FinanceCardIcon type={route.icon} />

              <h2 className="mt-5 whitespace-nowrap text-base font-pbold uppercase leading-tight tracking-[-0.02em] text-[#1b4d80] sm:text-lg xl:text-base 2xl:text-lg">
                {route.title}
              </h2>
              <p className="mt-2 max-w-[350px] text-sm font-pregular normal-case leading-6 text-[#53698f] lg:text-base">
                {route.description}
              </p>

              <span className="mt-auto flex items-center gap-4 pt-6 text-base font-pmedium normal-case text-[#1b4d80]">
                {route.action}
                <FiArrowRight
                  className="text-xl transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MixBag;
