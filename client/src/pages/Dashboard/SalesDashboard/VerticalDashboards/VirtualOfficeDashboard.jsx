import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import dayjs from "dayjs";
import {
  MdAutorenew,
  MdGroups,
  MdFormatListBulleted,
  MdOutlineRemoveRedEye,
  MdPersonAddAlt1,
  MdPersonOff,
  MdSettings,
  MdAssignmentInd,
  MdTrendingDown,
  MdTrendingUp,
} from "react-icons/md";
import {
  LuChartPie as ChartPie,
  LuChartNoAxesCombined as ChartNoAxesCombined,
} from "react-icons/lu";
import { SiGoogleadsense } from "react-icons/si";
import virtualOfficeBanner from "../../../../assets/virtual-office-banner.png";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import useUserPermissions from "../../../../hooks/useUserPermissions";
import { PERMISSIONS } from "../../../../constants/permissions";
import { inrFormat } from "../../../../utils/currencyFormat";
import WidgetSection from "../../../../components/WidgetSection";
import Card from "../../../../components/Card";
import PieChartMui from "../../../../components/graphs/PieChartMui";
import AgTable from "../../../../components/AgTable";
import StatusChip from "../../../../components/StatusChip";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";
import MuiModal from "../../../../components/MuiModal";
import humanDate from "../../../../utils/humanDateForamt";
import InvestorOperationalCharts from "../../InvestorDashboard/InvestorOperationalCharts";
import LeadsLayout from "../ViewClients/LeadsLayout";
import VirtualOffice from "../VirtualOffice";
import { setSelectedClient } from "../../../../redux/slices/clientSlice";

const getNumericAmount = (value) =>
  Number(String(value ?? "0").replace(/,/g, "")) || 0;

const getPaymentStatus = (row) => {
  const rentStatus = String(row?.rentStatus ?? "")
    .trim()
    .toLowerCase();

  if (rentStatus) return rentStatus;
  if (typeof row?.status === "boolean") {
    return row.status ? "paid" : "unpaid";
  }

  return String(row?.status ?? "")
    .trim()
    .toLowerCase();
};

const getRevenueDate = (row) =>
  row?.rentDate ||
  row?.invoiceUploadedAt ||
  row?.invoice?.date ||
  row?.createdAt;

const getFiscalYearLabel = (dateValue = dayjs()) => {
  const value = dayjs(dateValue);
  const startYear = value.month() >= 3 ? value.year() : value.year() - 1;
  return `FY ${startYear}-${String(startYear + 1).slice(-2)}`;
};

const getRevenueFiscalYear = (row) => {
  const value = dayjs(getRevenueDate(row));
  return value.isValid() ? getFiscalYearLabel(value) : null;
};

const getReportingAmount = (row) => {
  const reportingDate = dayjs(getRevenueDate(row));
  const usesHistoricalRevenue =
    reportingDate.isValid() && reportingDate.isBefore(dayjs("2026-09-01"), "month");

  return usesHistoricalRevenue
    ? getNumericAmount(row?.revenue)
    : getNumericAmount(row?.receivedAmount);
};

const getRenewalRevenueAmount = (client) => {
  const totalDesks =
    Number(client?.totalDesks) ||
    Number(client?.openDesks || 0) + Number(client?.cabinDesks || 0);
  const currentRate = Number(
    client?.currentRate ||
      client?.openDeskRate ||
      client?.cabinDeskRate ||
      0,
  );

  return Number(
    client?.revenue ||
      client?.receivedAmount ||
      Number(client?.openTotal || 0) + Number(client?.cabinTotal || 0) ||
      totalDesks * currentRate,
  );
};

const getPaidRenewalAmount = (revenue) =>
  getNumericAmount(revenue?.revenue) ||
  getNumericAmount(revenue?.receivedAmount) ||
  getNumericAmount(revenue?.taxableAmount);

const getRevenueClientId = (revenue) =>
  typeof revenue?.client === "object"
    ? revenue.client?._id
    : revenue?.client;

const isRevenueForClientMonth = (revenue, client, month) => {
  const revenueDate = dayjs(getRevenueDate(revenue));
  const clientIdMatches =
    getRevenueClientId(revenue) &&
    client?._id &&
    String(getRevenueClientId(revenue)) === String(client._id);
  const clientNameMatches =
    String(revenue?.client?.clientName || revenue?.clientName || "")
      .trim()
      .toLowerCase() ===
    String(client?.clientName || "").trim().toLowerCase();

  return (
    revenueDate.isValid() &&
    revenueDate.isSame(month, "month") &&
    (clientIdMatches || clientNameMatches)
  );
};

const isActiveRenewalClient = (client) => {
  const activeValue = client?.isActive ?? client?.clientStatus;
  const normalizedActiveValue = String(activeValue ?? "")
    .trim()
    .toLowerCase();

  return (
    activeValue === true ||
    normalizedActiveValue === "true" ||
    normalizedActiveValue === "active"
  );
};

const isInactiveRenewalClient = (client) => {
  const activeValue = client?.isActive ?? client?.clientStatus;
  const normalizedActiveValue = String(activeValue ?? "")
    .trim()
    .toLowerCase();
  const normalizedRentStatus = String(client?.rentStatus || "")
    .trim()
    .toLowerCase();

  return (
    activeValue === false ||
    normalizedActiveValue === "false" ||
    normalizedActiveValue === "inactive" ||
    normalizedActiveValue === "not active" ||
    normalizedRentStatus === "inactive" ||
    normalizedRentStatus === "not active"
  );
};

const hasPaidRenewal = (revenues, client, month) =>
  revenues.some(
    (revenue) =>
      getPaymentStatus(revenue) === "paid" &&
      isRevenueForClientMonth(revenue, client, month),
  );

const getMonthlyRenewalRevenue = (clients, revenues, month) =>
  clients.reduce((total, client) => {
    const endDate = dayjs(client?.termEnd);
    if (
      !isActiveRenewalClient(client) ||
      !endDate.isValid() ||
      !endDate.isSame(month, "month")
    ) {
      return total;
    }

    const paidRevenue = revenues
      .filter(
        (revenue) =>
          getPaymentStatus(revenue) === "paid" &&
          isRevenueForClientMonth(revenue, client, month),
      )
      .reduce(
        (clientTotal, revenue) =>
          clientTotal + getPaidRenewalAmount(revenue),
        0,
      );

    return total + (paidRevenue || getRenewalRevenueAmount(client));
  }, 0);

const useLiveCurrentMonth = () => {
  const [currentMonth, setCurrentMonth] = useState(() =>
    dayjs().startOf("month"),
  );

  useEffect(() => {
    let timeoutId;
    const scheduleNextDayRefresh = () => {
      const now = dayjs();
      const nextDay = now.add(1, "day").startOf("day").add(1, "second");

      timeoutId = window.setTimeout(() => {
        const nextMonth = dayjs().startOf("month");
        setCurrentMonth((previousMonth) =>
          previousMonth.isSame(nextMonth, "month")
            ? previousMonth
            : nextMonth,
        );
        scheduleNextDayRefresh();
      }, Math.max(nextDay.diff(now), 1000));
    };

    scheduleNextDayRefresh();
    return () => window.clearTimeout(timeoutId);
  }, []);

  return currentMonth;
};

const VirtualBarsIcon = () => (
  <span className="flex h-8 w-8 items-end justify-center gap-1">
    <span className="h-3 w-1.5 rounded-full bg-current" />
    <span className="h-5 w-1.5 rounded-full bg-current" />
    <span className="h-7 w-1.5 rounded-full bg-current" />
  </span>
);

const VirtualOfficeSummaryCards = ({
  fiscalYear,
  actualIncome,
  projectedIncome,
  activeUniqueCustomers,
  renewalClients,
  deadUniqueClients,
  averageShortfallSurplus = 0,
  hasPermission,
  isLoading,
}) => {
  const safeAverageShortfallSurplus = Number.isFinite(
    Number(averageShortfallSurplus),
  )
    ? Number(averageShortfallSurplus)
    : 0;
  const cards = [
    {
      title: "Annual Revenue Target",
      value: isLoading
        ? "—"
        : inrFormat(actualIncome + projectedIncome),
      permission:
        PERMISSIONS.SALES_VERTICAL_VIRTUAL_OFFICE_ANNUAL_REVENUE_TARGET_CARD
          .value,
      icon: MdTrendingUp,
      tone: "green",
      valueTone: "text-[#1E3D73]",
    },
    {
      title: "Revenue Booked",
      value: isLoading ? "—" : inrFormat(actualIncome),
      permission:
        PERMISSIONS.SALES_VERTICAL_VIRTUAL_OFFICE_REVENUE_BOOKED_CARD.value,
      icon: VirtualBarsIcon,
      tone: "booked",
      valueTone: "text-[#13a573]",
    },
    {
      title: "Revenue Due",
      value: isLoading ? "—" : inrFormat(projectedIncome),
      permission:
        PERMISSIONS.SALES_VERTICAL_VIRTUAL_OFFICE_REVENUE_DUE_CARD.value,
      icon: ChartNoAxesCombined,
      tone: "due",
      valueTone: "text-[#f04a4a]",
    },
    {
      title: "Average VO Price",
      value: isLoading
        ? "—"
        : inrFormat(
            activeUniqueCustomers > 0
              ? Math.round(actualIncome / activeUniqueCustomers)
              : 0,
          ),
      permission:
        PERMISSIONS.SALES_VERTICAL_VIRTUAL_OFFICE_AVERAGE_VO_PRICE_CARD.value,
      icon: ChartPie,
      tone: "lightNavy",
      valueTone: "text-[#1E3D73]",
    },
    {
      title: "Active Unique Customers",
      value: isLoading
        ? "—"
        : activeUniqueCustomers.toLocaleString("en-IN"),
      permission:
        PERMISSIONS
          .SALES_VERTICAL_VIRTUAL_OFFICE_ACTIVE_UNIQUE_CUSTOMERS_CARD.value,
      icon: MdGroups,
      tone: "lightNavy",
      valueTone: "text-[#1E3D73]",
    },
    {
      title: "Pipeline Renewal",
      value: isLoading ? "—" : String(renewalClients),
      permission:
        PERMISSIONS.SALES_VERTICAL_VIRTUAL_OFFICE_PIPELINE_RENEWAL_CARD.value,
      icon: MdAutorenew,
      tone: "lightNavy",
      valueTone: "text-[#1E3D73]",
    },
    {
      title: "Dead Unique Clients",
      value: isLoading
        ? "â€”"
        : deadUniqueClients.toLocaleString("en-IN"),
      permission:
        PERMISSIONS.SALES_VERTICAL_VIRTUAL_OFFICE_DEAD_UNIQUE_CLIENTS_CARD
          .value,
      icon: MdPersonOff,
      tone: "dead",
      valueTone: "text-[#f04a4a]",
    },
    {
      title: "Average Shortfall / Surplus",
      value: isLoading
        ? "—"
        : `${inrFormat(Math.abs(safeAverageShortfallSurplus))} ${
            safeAverageShortfallSurplus > 0
              ? "Surplus"
              : safeAverageShortfallSurplus < 0
                ? "Shortfall"
                : "On Target"
          }`,
      permission:
        PERMISSIONS
          .SALES_VERTICAL_VIRTUAL_OFFICE_AVERAGE_SHORTFALL_SURPLUS_CARD.value,
      icon: MdTrendingDown,
      tone: safeAverageShortfallSurplus >= 0 ? "green" : "red",
      valueTone:
        safeAverageShortfallSurplus >= 0
          ? "text-[#13a573]"
          : "text-[#f04a4a]",
    },
  ];

  const toneClasses = {
    blue: "bg-[#eaf4ff] text-[#1d7ed0]",
    green: "bg-[#eafbf3] text-[#12a573]",
    sky: "bg-[#ecf9ff] text-[#13a9e8]",
    booked: "bg-[#ecf9ff] text-[#13a573]",
    indigo: "bg-[#edf1ff] text-[#244ad8]",
    pink: "bg-[#fff0f5] text-[#f00068]",
    due: "bg-[#fff0f5] text-[#f04a4a]",
    purple: "bg-[#f3edff] text-[#6d28d9]",
    average: "bg-[#f3edff] text-[#1E3D73]",
    dead: "bg-[#fff0f5] text-[#f04a4a]",
    lightNavy: "bg-[#eaf0f8] text-[#3F6291]",
    red: "bg-[#fff0f0] text-[#f04a4a]",
  };

  const visibleCards = cards.filter((card) => hasPermission(card.permission));

  if (visibleCards.length === 0) return null;

  const gridColumnClass =
    visibleCards.length === 1
      ? "grid-cols-1"
      : visibleCards.length === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : visibleCards.length === 3
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={`grid gap-3 ${gridColumnClass}`}>
      {visibleCards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="relative flex min-h-[92px] items-center gap-4 rounded-lg border border-[#e8ecf4] bg-white px-5 py-4 text-left shadow-sm"
          >
            <span
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${toneClasses[card.tone]}`}
            >
              <Icon size={34} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex w-full items-center gap-2">
                <span className="mb-1 block whitespace-nowrap text-sm font-pregular leading-tight text-[#1E3D73]">
                  {card.title}
                </span>
                {card.suffix && (
                  <span
                    className={`ml-auto flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold ${
                      card.trendValue >= 0
                        ? "bg-[#e8f8ed] text-[#169b4d]"
                        : "bg-[#fdeaea] text-[#d64545]"
                    }`}
                  >
                    {card.trendValue >= 0 ? (
                      <MdTrendingUp size={18} aria-hidden="true" />
                    ) : (
                      <MdTrendingDown size={18} aria-hidden="true" />
                    )}
                    {card.suffix}
                  </span>
                )}
              </span>
              <span className="mb-2 block text-xs font-semibold text-[#58709A]">
                {fiscalYear}
              </span>
              <span
                className={`mt-1 block text-lg font-pmedium ${
                  card.valueTone || "text-[#1E3D73]"
                }`}
              >
                {card.value}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
};

const BiznestTitle = () => (
  <span
    aria-label="BIZNest"
    className="inline-flex shrink-0 items-baseline whitespace-nowrap leading-none text-[#2a2525]"
  >
    <span>BI</span>
    <span className="text-[#e33434]">Z</span>
    <span>&nbsp;N<span className="lowercase">est</span></span>
  </span>
);

const VirtualOfficeUniqueClientsGraph = ({ revenueRows }) => {
  const clientsByMonth = useMemo(() => {
    const grouped = {};

    revenueRows.forEach((row) => {
      const invoiceDate = dayjs(getRevenueDate(row));
      if (!invoiceDate.isValid()) return;

      const month = invoiceDate.format("MMMM");
      grouped[month] ||= [];
      grouped[month].push({
        client:
          row?.client?.clientName ||
          row?.clientName ||
          row?.clientInvoiceName ||
          "Unknown",
        typeOfClient: "Virtualoffice",
        date: invoiceDate.format("YYYY-MM-DD"),
        invoiceId: row?._id || row?.id,
      });
    });

    return Object.entries(grouped).map(([month, clients]) => ({
      month,
      clients,
    }));
  }, [revenueRows]);

  const totalUniqueClientsTitle = ({ count }) =>
    `TOTAL UNIQUE CLIENTS: ${count.toLocaleString("en-IN")}`;

  const currentDate = dayjs();
  const currentFinancialYear =
    currentDate.month() >= 3 ? currentDate.year() : currentDate.year() - 1;
  const financialYearLabel = `${currentFinancialYear}-${String(
    currentFinancialYear + 1,
  ).slice(-2)}`;

  return (
    <LeadsLayout
      data={clientsByMonth}
      hideAccordion
      title={
        <Link
          to="/app/dashboard/sales-dashboard/vertical/virtual-office/unique-client-count"
          className="inline-flex items-baseline gap-2 whitespace-nowrap leading-none text-[#1E3D73]"
        >
          <BiznestTitle />
          <span className="inline-flex items-baseline leading-none">
            VIRTUAL OFFICE FY {financialYearLabel} - UNIQUE CLIENT COUNT
          </span>
        </Link>
      }
      titleAmount={totalUniqueClientsTitle}
      hideMonthAxisTitle
      noOuterPadding
      investorBlueStyle
      investorTitleAmountChip
      hideFinancialYearControls
      virtualOfficeOnly
      actualMonthLag={2}
      virtualOfficeActualLegend="Actual Virtual Office Client"
      virtualOfficeProjectedLegend="Remaining KRA Target"
      virtualOfficeActualColor="#3cb37180"
      virtualOfficeProjectedColor="#787878"
      virtualOfficeTooltipLabel="Virtual Office Client"
      virtualOfficeDataLabelsAbove
    />
  );
};

const getClientDetailValue = (value) => {
  if (value === 0) return 0;
  if (value === true) return "Active";
  if (value === false) return "Inactive";
  return value || "—";
};

const getClientMoneyValue = (value) =>
  `INR ${inrFormat(Number(value) || 0)}`;

const RenewalClientDetailSection = ({ title, rows }) => (
  <section className="space-y-2">
    <h3 className="text-lg font-pmedium text-[#1E3D73]">{title}</h3>
    <div>
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-[220px_16px_1fr] gap-2 text-sm leading-7"
        >
          <span>{row.label}</span>
          <span>:</span>
          <span className="break-words">{getClientDetailValue(row.value)}</span>
        </div>
      ))}
    </div>
  </section>
);

const VirtualOfficeRenewalClientView = ({ client }) => {
  if (!client) return null;

  const startDate = client.termStartDate || client.startDate;
  const endDate = client.termEnd || client.endDate;
  const totalDesks =
    Number(client.totalDesks) ||
    Number(client.openDesks || 0) + Number(client.cabinDesks || 0);
  const currentRate = Number(client.currentRate || client.openDeskRate || 0);
  const revenue = Number(client.revenue || totalDesks * currentRate || 0);
  const buildingName =
    client.unit?.building?.buildingName ||
    client.building?.buildingName ||
    client.buildingName;
  const unitNo = client.unit?.unitNo || client.unitNo || client.unitName;
  const isActive =
    typeof client.isActive === "boolean"
      ? client.isActive
      : Boolean(client.clientStatus);

  const sections = [
    {
      title: "Customer Details",
      rows: [
        { label: "Client Name", value: client.clientName },
        { label: "Sector", value: client.sector },
        { label: "City", value: client.city || client.hoCity },
        { label: "State", value: client.state || client.hoState },
        { label: "Booking Type", value: client.bookingType || "Direct" },
        { label: "Revenue", value: getClientMoneyValue(revenue) },
        {
          label: "Sourcing",
          value: client.channel || client.sourcing,
        },
        {
          label: "Current Status",
          value: client.currentStatus || "In Progress",
        },
      ],
    },
    {
      title: "Company Details",
      rows: [
        { label: "Building Name", value: buildingName },
        { label: "Unit No", value: unitNo },
        {
          label: "Security Deposit",
          value: getClientMoneyValue(client.securityDeposit),
        },
        { label: "Billing Frequency", value: client.billingFrequency },
        { label: "Open Desks", value: client.openDesks },
        {
          label: "Open Desk Rate",
          value: getClientMoneyValue(client.openDeskRate),
        },
        { label: "No. of Desks", value: totalDesks },
        { label: "Current Rate", value: getClientMoneyValue(currentRate) },
        { label: "Company Status", value: isActive },
      ],
    },
    {
      title: "Agreement Details",
      rows: [
        {
          label: "Annual Increment",
          value: `${Number(client.annualIncrement) || 0}%`,
        },
        {
          label: "Per Desk Meeting Credits",
          value: client.perDeskMeetingCredits,
        },
        { label: "Total Meeting Credits", value: client.totalMeetingCredits },
        { label: "Start Date", value: startDate ? humanDate(startDate) : "—" },
        { label: "End Date", value: endDate ? humanDate(endDate) : "—" },
        {
          label: "Lock-in Period",
          value: `${Number(client.lockInPeriodMonths || client.lockinPeriod) || 0} months`,
        },
        {
          label: "Rent Date",
          value: client.rentDate ? humanDate(client.rentDate) : "—",
        },
        {
          label: "Next Increment",
          value:
            client.nextIncrementDate || client.nextIncrement
              ? humanDate(client.nextIncrementDate || client.nextIncrement)
              : "—",
        },
        { label: "Total Term", value: client.term || "0 Months" },
        { label: "Agreement Expiry", value: client.expiry },
      ],
    },
    {
      title: "POC Details",
      rows: [
        {
          label: "Local POC Name",
          value: client.localPoc?.name || client.localPocName,
        },
        {
          label: "Local POC Email",
          value: client.localPoc?.email || client.localPocEmail,
        },
        {
          label: "Local POC Phone",
          value: client.localPoc?.phone || client.localPocPhone,
        },
        {
          label: "HO POC Name",
          value: client.hoPoc?.name || client.hOPocName,
        },
        {
          label: "HO POC Email",
          value: client.hoPoc?.email || client.hOPocEmail,
        },
        {
          label: "HO POC Phone",
          value: client.hoPoc?.phone || client.hOPocPhone,
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {sections.map((section) => (
        <RenewalClientDetailSection key={section.title} {...section} />
      ))}
    </div>
  );
};

const VirtualOfficeRenewalTable = ({ clients, revenues = [] }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [viewClient, setViewClient] = useState(null);
  const renewalEndMonth = useLiveCurrentMonth();
  const renewalStartMonth = renewalEndMonth.subtract(1, "month");
  const renewalFiscalYear = getFiscalYearLabel(renewalEndMonth).replace(
    "FY ",
    "",
  );
  const renewalRows = useMemo(() => {
    const currentMonth = renewalEndMonth.startOf("month");
    const previousMonth = renewalStartMonth.startOf("month");
    return clients
      .filter((client) => {
        const endDate = dayjs(client?.termEnd);
        const isPreviousMonthEndDate =
          endDate.isValid() &&
          endDate.year() === previousMonth.year() &&
          endDate.month() === previousMonth.month();
        const isCurrentMonthEndDate =
          endDate.isValid() &&
          endDate.year() === currentMonth.year() &&
          endDate.month() === currentMonth.month();
        const renewalMonth = isPreviousMonthEndDate
          ? previousMonth
          : currentMonth;

        return (
          isActiveRenewalClient(client) &&
          (isPreviousMonthEndDate || isCurrentMonthEndDate) &&
          !hasPaidRenewal(revenues, client, renewalMonth)
        );
      })
      .sort((first, second) =>
        dayjs(first?.termEnd).diff(dayjs(second?.termEnd)),
      )
      .map((client, index) => {
        const startDate = dayjs(client?.termStartDate || client?.startDate);
        const endDate = dayjs(client?.termEnd);
        const configuredTerm = Number(client?.totalTerm);
        const calculatedTerm =
          startDate.isValid() && endDate.isValid()
            ? Math.max(endDate.diff(startDate, "month"), 0)
            : 0;
        const remainingDays = endDate.diff(dayjs().startOf("day"), "day");
        const revenue = getRenewalRevenueAmount(client);
        return {
          ...client,
          clientId: client?._id,
          srNo: index + 1,
          term: `${configuredTerm || calculatedTerm} Months`,
          formattedEndDate: endDate.format("DD-MMM-YYYY"),
          daysDue: Math.abs(remainingDays),
          channelLabel: client?.channel || client?.sourcing || "—",
          renewalRevenue: revenue,
          formattedRevenue: inrFormat(revenue),
          statusLabel: client?.currentStatus || "In Progress",
        };
      });
  }, [clients, renewalEndMonth, renewalStartMonth, revenues]);
  const previousMonthRenewalRevenue = useMemo(
    () => getMonthlyRenewalRevenue(clients, revenues, renewalStartMonth),
    [clients, renewalStartMonth, revenues],
  );
  const currentMonthRenewalRevenue = useMemo(
    () => getMonthlyRenewalRevenue(clients, revenues, renewalEndMonth),
    [clients, renewalEndMonth, revenues],
  );

  const columns = [
    { field: "srNo", headerName: "SR.NO.", width: 90 },
    { field: "clientName", headerName: "Customer Name", flex: 1.2 },
    { field: "formattedEndDate", headerName: "Expiry Date", flex: 0.9 },
    { field: "daysDue", headerName: "Days Due", flex: 0.7 },
    { field: "channelLabel", headerName: "Channel", flex: 0.8 },
    { field: "formattedRevenue", headerName: "Revenue (INR)", flex: 0.8 },
    {
      field: "statusLabel",
      headerName: "Status",
      flex: 0.7,
      cellRenderer: (params) => <StatusChip status={params.value} />,
    },
    {
      field: "actions",
      headerName: "Action",
      width: 140,
      pinned: "right",
      sortable: false,
      filter: false,
      cellRenderer: (params) => (
        <div className="flex h-full items-center gap-2">
          <button
            type="button"
            aria-label={`View ${params.data?.clientName || "client"} details`}
            onClick={() => setViewClient(params.data)}
            className="rounded-lg bg-[#eaf4ff] p-2 text-[#1E3D73]"
          >
            <MdOutlineRemoveRedEye size={18} />
          </button>
          <ThreeDotMenu
            rowId={params.data?._id || params.data?.srNo}
            menuItems={[
              {
                label: "Renew",
                onClick: () => {
                  const clientIdentifier =
                    params.data?.clientId ||
                    params.data?._id ||
                    params.data?.clientName;

                  dispatch(setSelectedClient(params.data));
                  navigate(
                    `/app/dashboard/sales-dashboard/vertical/virtual-office/client/${encodeURIComponent(clientIdentifier)}/client-details`,
                    { state: { editMode: true, renewal: true } },
                  );
                },
              },
            ]}
            buttonSx={{
              color: "#1E3D73",
              backgroundColor: "#eaf4ff",
              borderRadius: 2,
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <WidgetSection
      border
      normalCase
      borderColor="#1E3D73"
      bodyBorderColor="#9FB2CF"
      title={
        <Link
          to="/app/dashboard/sales-dashboard/vertical/virtual-office/pipeline-renewal"
          className="inline-flex items-baseline gap-2 leading-none text-[#1E3D73]"
        >
          <BiznestTitle />
          <span>
            VIRTUAL OFFICE FY {renewalFiscalYear} - RENEWALS IN{" "}
            {renewalStartMonth.format("MMMM").toUpperCase()} -{" "}
            {renewalEndMonth.format("MMMM").toUpperCase()}
          </span>
        </Link>
      }
      headerRightContent={
        <div className="flex flex-wrap items-center justify-end gap-3 text-sm font-pmedium uppercase">
          <span className="rounded-lg border border-[#a9ddba] bg-[#d8f0df] px-3 py-2 text-[#16784d]">
            {renewalStartMonth.format("MMM").toUpperCase()}: {" "}
            {inrFormat(previousMonthRenewalRevenue)}
          </span>
          <span className="rounded-lg border border-[#aec6fb] bg-[#dbe4ff] px-3 py-2 text-[#274784]">
            {renewalEndMonth.format("MMM").toUpperCase()}: {" "}
            {inrFormat(currentMonthRenewalRevenue)}
          </span>
        </div>
      }
    >
      <div
        className="text-[#1E3D73] [&_.ag-cell]:!text-[#1E3D73] [&_.ag-header-cell-text]:!text-[#1E3D73] [&_.ag-icon]:!text-[#1E3D73] [&_.ag-paging-panel]:!text-[#1E3D73] [&_.MuiChip-label]:!text-[#1E3D73] [&_.MuiInputBase-input]:!text-[#1E3D73] [&_.MuiInputLabel-root]:!text-[#1E3D73] [&_button]:!text-[#1E3D73]"
        style={{
          "--ag-foreground-color": "#1E3D73",
          "--ag-header-foreground-color": "#1E3D73",
          "--ag-icon-color": "#1E3D73",
        }}
      >
        <AgTable
          hideTitle
          data={renewalRows}
          columns={columns}
          search
          hideFilter
          showDateControls={false}
        />
      </div>
      </WidgetSection>
      <MuiModal
        open={Boolean(viewClient)}
        onClose={() => setViewClient(null)}
        title={<span className="text-[#1E3D73]">View Client Details</span>}
        widthClass="w-[min(92vw,820px)]"
      >
        <div className="text-[#1E3D73]">
          <VirtualOfficeRenewalClientView client={viewClient} />
        </div>
      </MuiModal>
    </>
  );
};

const VirtualOfficeActionCards = ({ hasPermission }) => {
  const cards = [
    {
      title: "Onboard New VO Customer",
      icon: <MdPersonAddAlt1 />,
      route:
        "/app/dashboard/sales-dashboard/vertical/virtual-office/client-onboarding",
      permission:
        PERMISSIONS.SALES_VERTICAL_VIRTUAL_OFFICE_ADD_CLIENT_CARD.value,
    },
    {
      title: "Overall VO Summary",
      icon: <MdAssignmentInd />,
      route:
        "/app/dashboard/sales-dashboard/vertical/virtual-office/client-details",
      permission:
        PERMISSIONS.SALES_VERTICAL_VIRTUAL_OFFICE_CLIENT_DETAILS_CARD.value,
    },
    {
      title: "Mix Bag",
      icon: <MdFormatListBulleted />,
      route:
        "/app/dashboard/sales-dashboard/vertical/virtual-office/mix-bag",
      permission:
        PERMISSIONS.SALES_VERTICAL_VIRTUAL_OFFICE_MIX_BAG_CARD.value,
    },
    {
      title: "Data",
      icon: <SiGoogleadsense />,
      route: "/app/dashboard/sales-dashboard/vertical/virtual-office/data",
      permission: PERMISSIONS.SALES_VERTICAL_VIRTUAL_OFFICE_DATA_CARD.value,
    },
  ].filter((card) => hasPermission(card.permission));

  if (!cards.length) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.title}
          title={card.title}
          icon={card.icon}
          route={card.route}
          fontColor="#1E3D73"
          titleColor="#1E3D73"
        />
      ))}
    </div>
  );
};

const channelChartConfig = {
  sourcing: {
    title: "Sourcing Channels",
    colors: [
      "#1687F8",
      "#F72585",
      "#00C853",
      "#84CC16",
      "#FB7185",
      "#4A79B8",
      "#F97316",
    ],
  },
  directPaid: {
    title: "Direct vs Paid",
    colors: ["#1687F8", "#00D846"],
  },
};

const VirtualOfficeChannelCharts = ({ visibleCharts, clients = [] }) => {
  const sourcingData = useMemo(() => {
    const sourcingCounts = new Map();

    clients.forEach((client) => {
      const rawSourcing = String(client?.channel || client?.sourcing || "").trim();
      if (!rawSourcing) return;

      const sourcing = rawSourcing.toLowerCase() === "bfc" ? "IPC" : rawSourcing;
      const sourcingKey = sourcing.toLowerCase();
      const existing = sourcingCounts.get(sourcingKey);

      sourcingCounts.set(sourcingKey, {
        label: existing?.label || sourcing,
        value: Number(existing?.value || 0) + 1,
      });
    });

    return Array.from(sourcingCounts.values()).sort((first, second) =>
      second.value === first.value
        ? first.label.localeCompare(second.label)
        : second.value - first.value,
    );
  }, [clients]);

  const directPaidData = useMemo(() => {
    const today = dayjs();
    const fiscalStartYear = today.month() >= 3 ? today.year() : today.year() - 1;
    const aprilStart = dayjs(`${fiscalStartYear}-04-01`).startOf("day");
    const septemberEnd = dayjs(`${fiscalStartYear}-09-30`).endOf("day");
    const counts = { Direct: 0, Paid: 0 };

    clients.forEach((client) => {
      const clientDate = dayjs(
        client?.termStartDate || client?.startDate || client?.createdAt,
      );

      if (
        !clientDate.isValid() ||
        clientDate.isBefore(aprilStart) ||
        clientDate.isAfter(septemberEnd)
      ) {
        return;
      }

      const bookingType = String(client?.bookingType || "Direct")
        .trim()
        .toLowerCase();

      if (bookingType === "paid" || bookingType.includes("spv")) {
        counts.Paid += 1;
      } else if (bookingType === "direct" || !bookingType) {
        counts.Direct += 1;
      }
    });

    return [
      { label: "Direct", value: counts.Direct },
      { label: "Paid", value: counts.Paid },
    ].filter((item) => item.value > 0);
  }, [clients]);

  return (
    <WidgetSection layout={2} gridGap="gap-x-4 gap-y-4" padding>
      {visibleCharts.map((key) => {
        const chartData = key === "sourcing" ? sourcingData : directPaidData;
        const chart = { ...channelChartConfig[key], data: chartData };
        const labels = chart.data.map((item) => item.label);
        const chartColors = chart.data.map(
          (_item, index) => chart.colors[index % chart.colors.length],
        );
        const chartLegend = (
          <div className="w-full max-w-full select-none px-2 pb-1">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              {labels.map((label, index) => (
                <div
                  key={label}
                  className="flex min-w-0 items-center gap-1 text-xs text-[#1E3D73]"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: chartColors[index] }}
                  />
                  <span className="max-w-28 truncate" title={label}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

        return (
          <WidgetSection
            key={key}
            title={
              <span className="inline-flex items-baseline gap-2 text-[#1E3D73]">
                <span
                  aria-label="BIZ Nest"
                  className="inline-flex items-baseline whitespace-nowrap normal-case leading-none text-[#2a2525]"
                >
                  <span>BI</span>
                  <span className="text-[#e33434]">Z</span>
                  <span>&nbsp;Nest</span>
                </span>
                <span>{chart.title}</span>
              </span>
            }
            border
            borderColor="#1E3D73"
            bodyBorderColor="#9FB2CF"
          >
            <div>
              {chart.data.length > 0 ? (
                <PieChartMui
                  data={chart.data}
                  options={{
                    chart: { type: "pie", fontFamily: "Poppins-Regular" },
                    labels,
                    colors: chartColors,
                    legend: {
                      show: false,
                      position: "bottom",
                      horizontalAlign: "center",
                    },
                    tooltip: {
                      y: {
                        formatter: (value) =>
                          `${value} ${Number(value) === 1 ? "Client" : "Clients"}`,
                      },
                    },
                  }}
                  width={500}
                  height={350}
                  customLegend={chartLegend}
                  centerAlign
                />
              ) : (
                <div className="flex h-[350px] items-center justify-center text-sm text-[#1E3D73]">
                  No chart data available
                </div>
              )}
            </div>
          </WidgetSection>
        );
      })}
    </WidgetSection>
  );
};

const VirtualOfficeDashboard = ({
  occupancyView = null,
  channelView = null,
  uniqueClientsOnly = false,
  pipelineRenewalOnly = false,
  emptyView = false,
}) => {
  const axios = useAxiosPrivate();
  const { hasPermission } = useUserPermissions();
  const liveCurrentMonth = useLiveCurrentMonth();
  const fiscalYear = getFiscalYearLabel(liveCurrentMonth);
  const [isBrowserZoomedOut, setIsBrowserZoomedOut] = useState(false);

  useEffect(() => {
    const updateBrowserZoom = () => {
      const viewportZoomRatio = window.outerWidth / window.innerWidth;
      setIsBrowserZoomedOut(
        viewportZoomRatio < 0.9 || window.devicePixelRatio < 0.9,
      );
    };

    updateBrowserZoom();
    window.addEventListener("resize", updateBrowserZoom);
    return () => window.removeEventListener("resize", updateBrowserZoom);
  }, []);

  const {
    data: virtualOfficeRevenue = [],
    isLoading: isRevenueLoading,
  } = useQuery({
    queryKey: ["virtualOfficeRevenue", { useClientDetails: true }],
    queryFn: async () => {
      const response = await axios.get("/api/sales/get-virtual-office-revenue", {
        params: { useClientDetails: true },
      });
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const {
    data: virtualOfficeClients = [],
    isLoading: areClientsLoading,
  } = useQuery({
    queryKey: ["virtualOfficeClientOptions"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/consolidated-clients");
      return Array.isArray(response.data?.virtualOfficeClients)
        ? response.data.virtualOfficeClients
        : [];
    },
    staleTime: 0,
    refetchOnMount: "always",
  });

  const summary = useMemo(() => {
    const currentYearRevenue = virtualOfficeRevenue.filter(
      (row) => getRevenueFiscalYear(row) === fiscalYear,
    );
    const isActualRevenue = (row) => {
      const revenueDate = dayjs(getRevenueDate(row));
      const isAvailableWithReportingLag =
        revenueDate.isValid() &&
        !liveCurrentMonth.isBefore(
          revenueDate.startOf("month").add(2, "month"),
          "month",
        );

      return (
        isAvailableWithReportingLag &&
        (row?.isHistoricalBilling === true || getPaymentStatus(row) === "paid")
      );
    };
    const actualRevenueRows = currentYearRevenue.filter(isActualRevenue);
    const actualIncome = actualRevenueRows
      .reduce((total, row) => total + getReportingAmount(row), 0);
    const fiscalYearStart = Number(fiscalYear.match(/\d{4}/)?.[0]);
    const fiscalMonths = Number.isFinite(fiscalYearStart)
      ? Array.from({ length: 12 }, (_, index) =>
          dayjs().year(fiscalYearStart).month(3 + index).startOf("month"),
        )
      : [];
    const latestActualMonthIndex = fiscalMonths.reduce(
      (latest, month, index) =>
        !liveCurrentMonth.isBefore(month.add(2, "month"), "month")
          ? index
          : latest,
      -1,
    );
    const projectedMonthlyAverage =
      latestActualMonthIndex >= 0
        ? actualIncome / (latestActualMonthIndex + 1)
        : 0;
    const projectedIncome =
      projectedMonthlyAverage * Math.max(11 - latestActualMonthIndex, 0);
    const latestActualMonthRevenue =
      latestActualMonthIndex >= 0
        ? actualRevenueRows.reduce((total, row) => {
            const revenueDate = dayjs(getRevenueDate(row));
            if (!revenueDate.isValid()) return total;

            const fiscalMonthIndex =
              revenueDate.month() >= 3
                ? revenueDate.month() - 3
                : revenueDate.month() + 9;

            return fiscalMonthIndex === latestActualMonthIndex
              ? total + getReportingAmount(row)
              : total;
          }, 0)
        : 0;
    const averageShortfallSurplus = Math.round(
      latestActualMonthRevenue - projectedMonthlyAverage,
    );
    const activeUniqueCustomers = currentYearRevenue.filter((row) => {
      const revenueMonth = dayjs(getRevenueDate(row)).startOf("month");

      return (
        revenueMonth.isValid() &&
        !liveCurrentMonth.isBefore(
          revenueMonth.add(2, "month"),
          "month",
        )
      );
    }).length;
    const renewalPeriodStart = dayjs()
      .year(fiscalYearStart)
      .month(3)
      .startOf("month");
    const renewalPeriodEnd = liveCurrentMonth.endOf("month");
    const renewalClients = virtualOfficeClients.filter((client) => {
      const renewalDate = dayjs(client?.termEnd || client?.endDate);

      return (
        isActiveRenewalClient(client) &&
        renewalDate.isValid() &&
        !renewalDate.isBefore(renewalPeriodStart, "day") &&
        !renewalDate.isAfter(renewalPeriodEnd, "day")
      );
    }).length;
    const deadUniqueClients = virtualOfficeClients.filter((client) => {
      const endDate = dayjs(client?.termEnd || client?.endDate);

      return (
        isInactiveRenewalClient(client) &&
        endDate.isValid() &&
        !endDate.isBefore(renewalPeriodStart, "day") &&
        !endDate.isAfter(renewalPeriodEnd, "day")
      );
    }).length;

    return {
      actualIncome,
      projectedIncome,
      activeUniqueCustomers,
      renewalClients,
      deadUniqueClients,
      averageShortfallSurplus,
    };
  }, [
    fiscalYear,
    liveCurrentMonth,
    virtualOfficeClients,
    virtualOfficeRevenue,
  ]);

  const isSummaryLoading = isRevenueLoading || areClientsLoading;
  const canViewRevenueGraph = hasPermission(
    PERMISSIONS.SALES_VERTICAL_VIRTUAL_OFFICE_REVENUES_GRAPH.value,
  );
  const canViewUniqueClientsGraph = hasPermission(
    PERMISSIONS.SALES_VERTICAL_VIRTUAL_OFFICE_UNIQUE_CLIENT_COUNT_GRAPH.value,
  );
  const canViewPipelineRenewalTable = hasPermission(
    PERMISSIONS.SALES_VERTICAL_VIRTUAL_OFFICE_PIPELINE_RENEWAL_TABLE.value,
  );
  const occupancyRoutes = {
    india:
      "/app/dashboard/sales-dashboard/vertical/virtual-office/india-wise-occupancy",
    sector:
      "/app/dashboard/sales-dashboard/vertical/virtual-office/sector-wise-occupancy",
  };
  const occupancyPermissions = {
    india:
      PERMISSIONS.SALES_VERTICAL_VIRTUAL_OFFICE_INDIA_WISE_OCCUPANCY.value,
    sector:
      PERMISSIONS.SALES_VERTICAL_VIRTUAL_OFFICE_SECTOR_WISE_OCCUPANCY.value,
  };
  const visibleOccupancyCharts = ["india", "sector"].filter((chart) =>
    hasPermission(occupancyPermissions[chart]),
  );
  const occupancyTitleOverrides = {
    india: "Nationwise Bookings",
    sector: "Sectorwise Bookings",
  };
  const channelPermissions = {
    sourcing:
      PERMISSIONS.SALES_VERTICAL_VIRTUAL_OFFICE_SOURCING_CHANNELS.value,
    directPaid:
      PERMISSIONS.SALES_VERTICAL_VIRTUAL_OFFICE_DIRECT_VS_PAID.value,
  };
  const visibleChannelCharts = ["sourcing", "directPaid"].filter((chart) =>
    hasPermission(channelPermissions[chart]),
  );
  const activeOccupancyClients = useMemo(
    () =>
      virtualOfficeClients.filter((client) =>
        typeof client?.isActive === "boolean"
          ? client.isActive
          : Boolean(client?.clientStatus),
      ),
    [virtualOfficeClients],
  );

  if (emptyView) return null;

  if (occupancyView) {
    return (
      <div className="p-3 pt-3">
        <InvestorOperationalCharts
          visibleCharts={[occupancyView]}
          routes={occupancyRoutes}
          showDetails
          noOuterPadding
          clientsOverride={activeOccupancyClients}
          biznestMixedCase
          titleOverrides={occupancyTitleOverrides}
        />
      </div>
    );
  }

  if (channelView) {
    return (
      <div className="p-3 pt-3">
        <VirtualOfficeChannelCharts
          visibleCharts={[channelView]}
          clients={virtualOfficeClients}
        />
      </div>
    );
  }

  if (uniqueClientsOnly) {
    return (
      <div className="p-3 pt-3">
        <VirtualOfficeUniqueClientsGraph revenueRows={virtualOfficeRevenue} />
      </div>
    );
  }

  if (pipelineRenewalOnly) {
    return (
      <div className="p-3 pt-3">
        <VirtualOfficeRenewalTable
          clients={virtualOfficeClients}
          revenues={virtualOfficeRevenue}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-3 pt-3">
      <div className="overflow-hidden rounded-lg">
        <div className="relative h-56 w-full md:h-[17rem] xl:h-[19rem]">
          <img
            src={virtualOfficeBanner}
            alt="Virtual Office dashboard banner"
            className="h-full w-full object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-[61%] bg-white/95"
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, black 0%, black 84%, transparent 100%)",
              maskImage:
                "linear-gradient(to right, black 0%, black 84%, transparent 100%)",
            }}
          />
          <div className="absolute inset-y-0 left-0 flex w-[55%] flex-col px-3 py-4 sm:px-4 sm:py-6">
            <p
              className={`font-pregular text-xs uppercase tracking-[0.02em] text-[#1E3D73] sm:text-base ${
                isBrowserZoomedOut ? "lg:text-lg" : "lg:text-[15px]"
              }`}
            >
              Virtual Office Dashboard
            </p>
            <h1
              className={`mt-6 max-w-full whitespace-nowrap font-serif text-3xl font-semibold leading-[0.9] text-[#1E3D73] drop-shadow-sm sm:mt-10 sm:text-5xl ${
                isBrowserZoomedOut
                  ? "lg:text-[45px] xl:text-[50px]"
                  : "lg:origin-left lg:scale-x-90 lg:text-[38px] xl:text-[42px]"
              }`}
            >
              VIRTUAL OFFICE{" "}
              <span className="text-[#E64B4B]">DASHBOARD</span>
            </h1>
            <p
              className={`mt-5 max-w-full font-pmedium text-xl leading-[0.94] text-[#1E3D73] sm:mt-8 sm:text-3xl md:whitespace-nowrap ${
                isBrowserZoomedOut ? "lg:text-[58px]" : "lg:text-[46px]"
              }`}
            >
              Virtual Office Customers
            </p>
          </div>
          <nav
            aria-label="Virtual Office dashboard navigation"
            className={`absolute bottom-0 left-0 z-10 flex items-center overflow-x-auto px-3 sm:px-4 ${
              isBrowserZoomedOut
                ? "w-[46.5%] justify-between gap-0"
                : "w-[61%] gap-4 sm:gap-5 lg:gap-5"
            }`}
          >
            {["Annual KPA", "KRA", "Handbook", "Performance Summary"].map(
              (item) => (
                <Link
                  key={item}
                  to=""
                  className="group relative shrink-0 py-3 font-pmedium text-xs text-[#1E3D73] sm:text-sm lg:text-base"
                >
                  {item}
                  <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-[#E64B4B] transition-transform duration-200 group-hover:scale-x-100" />
                </Link>
              ),
            )}
            <Link
              to=""
              className="my-1.5 flex shrink-0 items-center gap-2 rounded-full border border-[#CBD5E1] bg-white/90 px-2.5 py-1.5 font-pmedium text-xs text-[#1E3D73] shadow-sm sm:text-sm lg:text-base"
            >
              <MdSettings className="text-lg sm:text-xl" aria-hidden="true" />
              Settings
            </Link>
          </nav>
        </div>
      </div>
      <VirtualOfficeSummaryCards
        fiscalYear={fiscalYear}
        {...summary}
        hasPermission={hasPermission}
        isLoading={isSummaryLoading}
      />
      {canViewRevenueGraph && (
        <VirtualOffice graphOnly dashboardProjectionMode />
      )}
      {canViewUniqueClientsGraph && (
        <VirtualOfficeUniqueClientsGraph revenueRows={virtualOfficeRevenue} />
      )}
      <VirtualOfficeActionCards hasPermission={hasPermission} />
      {visibleOccupancyCharts.length > 0 && (
        <InvestorOperationalCharts
          visibleCharts={visibleOccupancyCharts}
          routes={occupancyRoutes}
          investorInventoryStyle
          clientsOverride={activeOccupancyClients}
          biznestMixedCase
          titleOverrides={occupancyTitleOverrides}
        />
      )}
      {visibleChannelCharts.length > 0 && (
        <VirtualOfficeChannelCharts
          visibleCharts={visibleChannelCharts}
          clients={virtualOfficeClients}
        />
      )}
      {canViewPipelineRenewalTable && (
        <VirtualOfficeRenewalTable
          clients={virtualOfficeClients}
          revenues={virtualOfficeRevenue}
        />
      )}
    </div>
  );
};

export default VirtualOfficeDashboard;
