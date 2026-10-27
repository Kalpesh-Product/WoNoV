import { FiChevronRight } from "react-icons/fi";
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
      className="relative inline-flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-[#1b4d80] min-[1800px]:h-[88px] min-[1800px]:w-[88px]"
    >
      <span className="relative flex h-[88px] w-[88px] shrink-0 scale-[0.82] items-center justify-center min-[1800px]:scale-100">
        {icons[type]}
      </span>
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
    <div className="p-4 lg:p-5 min-[1800px]:p-6">
      <div className="flex w-full flex-wrap gap-4 min-[1800px]:gap-5">
        {allowedRoutes.map((route) => {
          return (
            <button
              key={route.route}
              type="button"
              onClick={() => navigate(route.route)}
              className="group relative flex min-h-[150px] w-full grow basis-full overflow-hidden rounded-[24px] border border-[#dfe8f2] bg-white text-left shadow-[0_10px_24px_rgba(30,61,115,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(30,61,115,0.13)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3D73] focus-visible:ring-offset-2 md:basis-[calc(50%-0.625rem)] xl:basis-[calc(25%-0.9375rem)] min-[1800px]:min-h-[185px] min-[1800px]:rounded-[28px] min-[1800px]:shadow-[0_12px_30px_rgba(30,61,115,0.08)] min-[1800px]:hover:shadow-[0_16px_36px_rgba(30,61,115,0.13)]"
            >
              <span
                className="absolute inset-y-0 left-0 z-10 w-2 bg-[#0d6eb8] min-[1800px]:w-2.5"
                aria-hidden="true"
              />

              <div className="flex w-[30%] min-w-[90px] shrink-0 items-center justify-center px-2 py-5 sm:min-w-[100px] sm:px-3 min-[1800px]:min-w-[120px] min-[1800px]:px-4">
                <FinanceCardIcon type={route.icon} />
              </div>

              <div className="relative min-w-0 flex-1 px-3 sm:px-4">
                <div className="absolute left-3 right-2 top-[39px] flex h-[72px] flex-col items-start justify-between sm:left-4 sm:right-3 min-[1800px]:left-5 min-[1800px]:right-4 min-[1800px]:top-[49px] min-[1800px]:h-[88px]">
                  <h2 className="max-w-full whitespace-normal break-words text-xs font-pbold uppercase leading-tight tracking-[-0.02em] text-[#073f77] sm:text-[13px] min-[1800px]:text-base">
                    {route.title}
                  </h2>
                  <span className="flex items-center gap-2 whitespace-nowrap text-xs font-pmedium normal-case text-[#073f77] sm:text-[13px] min-[1800px]:gap-2.5 min-[1800px]:text-base">
                    {route.action}
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
          );
        })}
      </div>
    </div>
  );
};

export default MixBag;
