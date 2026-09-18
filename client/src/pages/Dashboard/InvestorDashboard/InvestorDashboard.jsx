import AgTable from "../../../components/AgTable";
import WidgetSection from "../../../components/WidgetSection";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { inrFormat } from "../../../utils/currencyFormat";
import NormalBarGraph from "../../../components/graphs/NormalBarGraph";
import YearlyGraph from "../../../components/graphs/YearlyGraph";
import FyBarGraphPercentage from "../../../components/graphs/FyBarGraphPercentage";
import dayjs from "dayjs";
import { CircularProgress, Popover } from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PERMISSIONS } from "../../../constants/permissions";
import useUserPermissions from "../../../hooks/useUserPermissions";
import FinanceCard from "../../../components/FinanceCard";
import LeadsLayout from "../SalesDashboard/ViewClients/LeadsLayout";
import CheckAvailability from "../SalesDashboard/CoWorkingSeats/CheckAvailability";
import BarGraph from "../../../components/graphs/BarGraph";
import HeatMap from "../../../components/graphs/HeatMap";
import InvestorOperationalCharts from "./InvestorOperationalCharts";
import { useCurrency } from "../../../context/CurrencyContext";
import investorBanner from "../../../assets/investor/banner-investor.png";
import {
  MdApartment,
  MdBarChart,
  MdCalendarMonth,
  MdCalculate,
  MdChair,
  MdGroups,
  MdReceiptLong,
} from "react-icons/md";
import { BsDatabaseFill } from "react-icons/bs";

const fiscalYearLabel = (date) => {
  const value = dayjs(date);
  const startYear = value.month() >= 3 ? value.year() : value.year() - 1;
  return `FY ${startYear}-${String(startYear + 1).slice(-2)}`;
};

const fiscalMonthIndex = (date) => {
  const month = dayjs(date).month();
  return month >= 3 ? month - 3 : month + 9;
};

const APPRECIATION_BASE_VALUATION = 60_000_000;
const APPRECIATION_MONTHLY_GROWTH_RATE = 0.07;

const BizNestTitle = ({ children }) => (
  <span className="normal-case">
    <span className="text-[#1234c9]">BI</span>
    <span className="text-[#e33434]">Z</span>
    <span className="text-[#1234c9]"> Nest</span>
    {children ? <span className="ml-1 text-[#1234c9]">{children}</span> : null}
  </span>
);

const InvestorBarsIcon = ({ className = "" }) => (
  <span className={`flex h-8 w-8 items-end justify-center gap-1 ${className}`}>
    <span className="h-3 w-1.5 rounded-full bg-current" />
    <span className="h-5 w-1.5 rounded-full bg-current" />
    <span className="h-7 w-1.5 rounded-full bg-current" />
  </span>
);

const InvestorDashboardCards = ({ format, hasPermission, navigate }) => {
  const cards = [
    {
      title: "Projected Revenue",
      period: "FY 2026-27",
      value: format(70_000_000),
      suffix: "49.1%",
      permission: PERMISSIONS.INVESTOR_PROJECTED_REVENUE_CARD.value,
      route: "/app/dashboard/investor-dashboard/income-expense",
      icon: InvestorBarsIcon,
      tone: "blue",
    },
    {
      title: "Projected Expense",
      period: "FY 2026-27",
      value: format(-63_000_000),
      permission: PERMISSIONS.INVESTOR_PROJECTED_EXPENSE_CARD.value,
      route: "/app/dashboard/investor-dashboard/income-expense",
      icon: MdReceiptLong,
      tone: "red",
      valueTone: "text-[#f04a4a]",
    },
    {
      title: "Projected Profit",
      period: "FY 2026-27",
      value: format(-7_000_000),
      permission: PERMISSIONS.INVESTOR_PROJECTED_PROFIT_CARD.value,
      route: "/app/dashboard/investor-dashboard/income-expense",
      icon: InvestorBarsIcon,
      tone: "green",
      valueTone: "text-[#12a573]",
    },
    {
      title: "Average Unique Clients",
      period: "FY 2026-27",
      value: "106",
      permission: PERMISSIONS.INVESTOR_AVERAGE_UNIQUE_CLIENTS_CARD.value,
      route: "/app/dashboard/investor-dashboard/unique-clients",
      icon: MdGroups,
      tone: "sky",
    },
    {
      title: "Total Inventory",
      value: "770",
      permission: PERMISSIONS.INVESTOR_TOTAL_INVENTORY_CARD.value,
      route: "/app/dashboard/investor-dashboard/inventory",
      icon: BsDatabaseFill,
      tone: "indigo",
    },
    {
      title: "Occupied Inventory",
      value: "700",
      suffix: "90%",
      permission: PERMISSIONS.INVESTOR_OCCUPIED_INVENTORY_CARD.value,
      route: "/app/dashboard/investor-dashboard/inventory",
      icon: MdChair,
      tone: "blue",
    },
    {
      title: "Pre-SeR M&M",
      metrics: [
        { label: "Revenue - 106", tone: "text-[#13a573]" },
        { label: "Expense - 81", tone: "text-[#f04a4a]" },
      ],
      permission: PERMISSIONS.INVESTOR_PRE_SER_MM_CARD.value,
      route: "/app/dashboard/investor-dashboard/meeting-room-utilization",
      icon: MdCalculate,
      tone: "indigo",
    },
    {
      title: "Asset Value Owned",
      value: `${format(100_000_000)}+`,
      permission: PERMISSIONS.INVESTOR_ASSET_VALUE_OWNED_CARD.value,
      route: "/app/dashboard/investor-dashboard/appreciation-center",
      icon: MdApartment,
      tone: "sky",
    },
  ];

  const toneClasses = {
    blue: "bg-[#eaf4ff] text-[#1d7ed0]",
    pink: "bg-[#fff0f6] text-[#e63875]",
    red: "bg-[#fff0f0] text-[#f04a4a]",
    green: "bg-[#eafbf3] text-[#12a573]",
    sky: "bg-[#ecf9ff] text-[#13a9e8]",
    indigo: "bg-[#edf1ff] text-[#244ad8]",
  };

  const visibleCards = cards.filter((card) => hasPermission(card.permission));

  if (visibleCards.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {visibleCards.map((card) => {
        const Icon = card.icon;

        return (
          <button
            key={card.title}
            type="button"
            onClick={() => navigate(card.route)}
            className="relative flex min-h-[92px] items-center gap-4 rounded-lg border border-[#e8ecf4] bg-white px-5 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {card.suffix && (
              <span className="absolute right-4 top-4 text-sm font-psemibold text-[#13a573]">
                {card.suffix}
              </span>
            )}
            <span
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${
                toneClasses[card.tone]
              }`}
            >
              <Icon size={34} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-pmedium text-[#1234c9]">
                {card.title}
              </span>
              {card.period && (
                <span className="block text-xs font-pregular text-[#1234c9]">
                  {card.period}
                </span>
              )}
              {card.metrics ? (
                <span className="mt-2 flex items-center gap-2 text-sm font-psemibold">
                  {card.metrics.map((metric, index) => (
                    <span key={metric.label} className="flex items-center gap-2">
                      {index > 0 && (
                        <span className="h-4 w-px bg-[#d7dce8]" aria-hidden="true" />
                      )}
                      <span className={metric.tone}>{metric.label}</span>
                    </span>
                  ))}
                </span>
              ) : (
                <span
                  className={`mt-1 block text-xl font-pbold ${
                    card.valueTone || "text-[#0035d4]"
                  }`}
                >
                  {card.value}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};

const InvestorSnapshotSection = ({ format, hasPermission, navigate }) => {
  const [calendarAnchorEl, setCalendarAnchorEl] = useState(null);
  const [calendarValue, setCalendarValue] = useState(() => dayjs("2025-04-01"));
  const isCalendarOpen = Boolean(calendarAnchorEl);
  const cards = [
    {
      title: "FY - 2026-27 - PROJECTIONS",
      icon: InvestorBarsIcon,
      tone: "text-[#12a573] bg-[#eafbf3]",
      rows: [
        { label: "Revenues", value: format(-70_000_000), tone: "text-[#12a573]" },
        { label: "Expenses", value: format(-63_000_000), tone: "text-[#f04a4a]" },
        { label: "Profit/Loss", value: format(-7_000_000), tone: "text-[#12a573]" },
        { label: "Exit Inventory", value: "-1,000 Desks", tone: "text-[#12a573]" },
        { label: "Asset Owned", value: `${format(-100_000_000)}+`, tone: "text-[#12a573]" },
      ],
    },
    {
      title: "FY - 2025-26",
      icon: MdCalendarMonth,
      tone: "text-[#244ad8] bg-[#edf1ff]",
      hasCalendar: true,
      rows: [
        { label: "Revenues", value: format(-53_000_000), tone: "text-[#12a573]" },
        { label: "Expenses", value: format(-45_000_000), tone: "text-[#f04a4a]" },
        { label: "Profit/Loss", value: format(-13_000_000), tone: "text-[#f04a4a]" },
        { label: "Exit Inventory", value: "-850 Desks", tone: "text-[#12a573]" },
        { label: "Asset Owned", value: `${format(-35_000_000)}+`, tone: "text-[#12a573]" },
      ],
    },
    {
      title: "FY - 2024-25",
      icon: InvestorBarsIcon,
      tone: "text-[#244ad8] bg-[#edf1ff]",
      rows: [
        { label: "Revenues", value: format(-43_000_000), tone: "text-[#12a573]" },
        { label: "Expenses", value: format(-38_000_000), tone: "text-[#f04a4a]" },
        { label: "Profit/Loss", value: format(-15_000_000), tone: "text-[#f04a4a]" },
        { label: "Exit Inventory", value: "-500 Desks", tone: "text-[#12a573]" },
        { label: "Asset Owned", value: `${format(-25_000_000)}+`, tone: "text-[#12a573]" },
      ],
    },
  ];

  if (!hasPermission(PERMISSIONS.INVESTOR_BIZNEST_3_YEARS_SNAPSHOT.value)) {
    return null;
  }

  return (
    <WidgetSection border title={<BizNestTitle>3 YEARS SNAPSHOT</BizNestTitle>}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              role="button"
              tabIndex={0}
              onClick={() =>
                navigate(PERMISSIONS.INVESTOR_BIZNEST_3_YEARS_SNAPSHOT.route)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  navigate(PERMISSIONS.INVESTOR_BIZNEST_3_YEARS_SNAPSHOT.route);
                }
              }}
              className="rounded-lg border border-[#e8ecf4] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-4 flex items-center gap-4">
                {card.hasCalendar ? (
                  <button
                    type="button"
                    aria-label="Open FY 2025-26 calendar"
                    onClick={(event) => {
                      event.stopPropagation();
                      setCalendarAnchorEl(event.currentTarget);
                    }}
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${card.tone}`}
                  >
                    <Icon size={28} />
                  </button>
                ) : (
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${card.tone}`}
                  >
                    <Icon size={28} />
                  </span>
                )}
                <span className="text-base font-pmedium text-[#1234c9]">
                  {card.title}
                </span>
              </div>
              <div className="flex flex-col divide-y divide-[#edf1f6]">
                {card.rows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-4 py-2 text-sm"
                  >
                    <span className="text-sm font-pmedium text-[#1234c9]">
                      {row.label}
                    </span>
                    <span className={`font-pbold text-base ${row.tone}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <Popover
        open={isCalendarOpen}
        anchorEl={calendarAnchorEl}
        onClose={() => setCalendarAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar
            value={calendarValue}
            onChange={(newValue) => setCalendarValue(newValue)}
          />
        </LocalizationProvider>
      </Popover>
    </WidgetSection>
  );
};

const InvestorAnnualMonthlyMixIncome = ({ hasPermission }) => {
  const axios = useAxiosPrivate();

  const { data: simpleRevenue = [], isLoading } = useQuery({
    queryKey: ["investor-simple-revenue"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/simple-consolidated-revenue");
      return response.data;
    },
    enabled: hasPermission(PERMISSIONS.INVESTOR_ANNUAL_MONTHLY_MIX_INCOME.value),
  });

  const paidRevenueData = useMemo(() => {
    if (!simpleRevenue) return [];

    const flatten = [];

    simpleRevenue.meetingRevenue?.forEach((item) => {
      flatten.push({
        vertical: "Meeting",
        revenue: getNumericAmount(item.taxable),
        date: item.date,
        normalizedStatus: getNormalizedPaymentStatus(item.status),
      });
    });

    simpleRevenue.alternateRevenues?.forEach((item) => {
      flatten.push({
        vertical: "Alternate",
        revenue: getNumericAmount(item.taxableAmount),
        date: item.invoiceCreationDate,
        normalizedStatus: getNormalizedPaymentStatus(item.status),
      });
    });

    simpleRevenue.virtualOfficeRevenues?.forEach((item) => {
      flatten.push({
        vertical: "Virtual Office",
        revenue: getNumericAmount(item.revenue ?? item.taxableAmount),
        date: item.rentDate,
        normalizedStatus: getNormalizedPaymentStatus(
          item.status ?? item.rentStatus,
        ),
      });
    });

    simpleRevenue.workationRevenues?.forEach((item) => {
      flatten.push({
        vertical: "Workation",
        revenue: getNumericAmount(item.taxableAmount),
        date: item.date,
        normalizedStatus: getNormalizedPaymentStatus(item.status),
      });
    });

    simpleRevenue.coworkingRevenues?.forEach((item) => {
      flatten.push({
        vertical: "Co-Working",
        revenue: getNumericAmount(item.revenue),
        date: item.rentDate,
        normalizedStatus: getNormalizedPaymentStatus(item.rentStatus),
      });
    });

    return flatten.filter((item) => item.normalizedStatus === "paid");
  }, [simpleRevenue]);

  const investorMixIncomeData = useMemo(() => {
    const actualMonthKeys = new Set(
      paidRevenueData
        .map((item) => dayjs(item.date))
        .filter((date) => date.isValid())
        .map((date) => date.format("YYYY-MM")),
    );

    const projectedRecords = INVESTOR_ANNUAL_MIX_PROJECTED_MONTHS.flatMap(
      ({ monthKey, date, total, split }) => {
        if (actualMonthKeys.has(monthKey)) return [];

        return split.map(
          ({ vertical, percent }) => ({
            vertical,
            revenue: Math.round((total * percent) / 100),
            date,
            normalizedStatus: "projected",
            isProjected: true,
          }),
        );
      },
    );

    return [...paidRevenueData, ...projectedRecords];
  }, [paidRevenueData]);

  if (!hasPermission(PERMISSIONS.INVESTOR_ANNUAL_MONTHLY_MIX_INCOME.value)) {
    return null;
  }

  const options = {};

  return isLoading ? (
    <div className="flex h-72 items-center justify-center">
      <CircularProgress />
    </div>
  ) : (
    <FyBarGraphPercentage
      data={investorMixIncomeData}
      dateKey="date"
      valueKey="revenue"
      graphTitle={<BizNestTitle>ANNUAL MONTHLY MIX INCOME</BizNestTitle>}
      chartOptions={options}
      hideYearNavigation
      investorVariant
    />
  );
};

const InvestorOccupiedInventoryGraph = ({ hasPermission, className = "" }) => {
  if (!hasPermission(PERMISSIONS.INVESTOR_INVENTORY_OVERVIEW.value)) {
    return null;
  }

  const occupancyGraphRoutes = {
    sector: "/app/dashboard/investor-dashboard/sector-wise-occupancy",
    india: "/app/dashboard/investor-dashboard/india-wise-members",
  };
  const visibleOccupancyGraphs = [
    hasPermission(PERMISSIONS.INVESTOR_SECTOR_WISE_OCCUPANCY.value) && "sector",
    hasPermission(PERMISSIONS.INVESTOR_INDIA_WISE_MEMBERS.value) && "india",
  ].filter(Boolean);

  return (
    <div className={className}>
      <CheckAvailability
        disableCardLinks
        hideCheckInventory
        graphHeight={390}
        cardsBorder
        hideInventoryLastDivider
        noOuterPadding
        investorGraphStyle
        cardsTitle={<BizNestTitle>INVENTORY DETAILS</BizNestTitle>}
        graphTitle={
          <BizNestTitle>- INVENTORY VS OCCUPANCY</BizNestTitle>
        }
        monthlyView
        middleContent={
          <>
            {visibleOccupancyGraphs.length > 0 && (
              <InvestorOperationalCharts
                visibleCharts={visibleOccupancyGraphs}
                routes={occupancyGraphRoutes}
                investorInventoryStyle
              />
            )}
            {hasPermission(PERMISSIONS.INVESTOR_UNIQUE_CLIENTS_GRAPH.value) && (
              <InvestorUniqueClientsGraph />
            )}
          </>
        }
      />
    </div>
  );
};

const asArray = (value) => (Array.isArray(value) ? value : []);
const getNormalizedPaymentStatus = (value) => {
  if (typeof value === "string") return value.trim().toLowerCase();
  return value ? "paid" : "unpaid";
};
const getNumericAmount = (value) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsedValue = parseFloat(value.replace(/,/g, ""));
    return Number.isNaN(parsedValue) ? 0 : parsedValue;
  }
  return 0;
};
const INVESTOR_PROJECTED_MONTHLY_INCOME_AMOUNT = 70_000_000 / 12;
const INVESTOR_PROJECTED_MONTHLY_EXPENSE_AMOUNT = 63_000_000 / 12;
const INVESTOR_ANNUAL_MIX_PROJECTED_MONTHS = [
  {
    monthKey: "2026-10",
    date: "2026-10-01",
    total: 5_800_000,
    split: [
      { vertical: "Co-Working", percent: 55 },
      { vertical: "Meeting", percent: 4 },
      { vertical: "Alternate", percent: 21 },
      { vertical: "Virtual Office", percent: 20 },
    ],
  },
  {
    monthKey: "2026-11",
    date: "2026-11-01",
    total: 5_650_000,
    split: [
      { vertical: "Co-Working", percent: 58 },
      { vertical: "Meeting", percent: 5 },
      { vertical: "Alternate", percent: 19 },
      { vertical: "Virtual Office", percent: 18 },
    ],
  },
  {
    monthKey: "2026-12",
    date: "2026-12-01",
    total: 5_900_000,
    split: [
      { vertical: "Co-Working", percent: 54 },
      { vertical: "Meeting", percent: 6 },
      { vertical: "Alternate", percent: 22 },
      { vertical: "Virtual Office", percent: 18 },
    ],
  },
  {
    monthKey: "2027-01",
    date: "2027-01-01",
    total: 5_720_000,
    split: [
      { vertical: "Co-Working", percent: 52 },
      { vertical: "Meeting", percent: 8 },
      { vertical: "Alternate", percent: 20 },
      { vertical: "Virtual Office", percent: 20 },
    ],
  },
  {
    monthKey: "2027-02",
    date: "2027-02-01",
    total: 5_860_000,
    split: [
      { vertical: "Co-Working", percent: 57 },
      { vertical: "Meeting", percent: 5 },
      { vertical: "Alternate", percent: 18 },
      { vertical: "Virtual Office", percent: 20 },
    ],
  },
  {
    monthKey: "2027-03",
    date: "2027-03-01",
    total: 6_050_000,
    split: [
      { vertical: "Co-Working", percent: 53 },
      { vertical: "Meeting", percent: 7 },
      { vertical: "Alternate", percent: 22 },
      { vertical: "Virtual Office", percent: 18 },
    ],
  },
];
const INVESTOR_INCOME_COLOR = "#3cb37180";
const INVESTOR_INCOME_GRADIENT_END = "#3cb37145";
const INVESTOR_EXPENSE_COLOR = "#ff000080";
const INVESTOR_EXPENSE_GRADIENT_END = "#ff000045";
const INVESTOR_PROJECTED_INCOME_COLOR = "#787878";
const INVESTOR_PROJECTED_EXPENSE_COLOR = "#b4b4b4";
const INVESTOR_PROJECTED_COLOR = INVESTOR_PROJECTED_INCOME_COLOR;
const visitorTypes = [
  "Half-Day Pass",
  "Full-Day Pass",
  "Walk In",
  "Meeting",
  "Scheduled",
];

const fiscalYearMonths = (fiscalYear) => {
  const startYear = Number(String(fiscalYear || "").match(/\d{4}/)?.[0]);

  if (!startYear) return [];

  return [
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
    "Jan",
    "Feb",
    "Mar",
  ].map(
    (month, index) =>
      `${month}-${String(index < 9 ? startYear : startYear + 1).slice(-2)}`,
  );
};

const InvestorAppreciationCenter = () => {
  const { currency, format } = useCurrency();
  const location = useLocation();
  const isAppreciationCenterPage = location.pathname.endsWith(
    "/appreciation-center",
  );
  const [valuationAsOf, setValuationAsOf] = useState(() => dayjs());
  const currentFiscalYear = fiscalYearLabel(valuationAsOf);
  const currentFiscalYearStart = Number(
    currentFiscalYear.match(/\d{4}/)?.[0],
  );
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(
    currentFiscalYear,
  );

  useEffect(() => {
    const nextMonth = valuationAsOf.add(1, "month").startOf("month");
    const timer = window.setTimeout(
      () => setValuationAsOf(dayjs()),
      nextMonth.diff(dayjs()) + 1000,
    );

    return () => window.clearTimeout(timer);
  }, [valuationAsOf]);

  useEffect(() => {
    setSelectedFiscalYear(currentFiscalYear);
  }, [currentFiscalYear]);

  const valuationMonths = useMemo(
    () =>
      fiscalYearMonths(currentFiscalYear).map((month, index) => ({
        month,
        amount: Math.round(
          APPRECIATION_BASE_VALUATION *
            Math.pow(1 + APPRECIATION_MONTHLY_GROWTH_RATE, index),
        ),
      })),
    [currentFiscalYear],
  );
  const currentMonthIndex = fiscalMonthIndex(valuationAsOf);
  const currentMonthValuation =
    valuationMonths[currentMonthIndex]?.amount || APPRECIATION_BASE_VALUATION;
  const selectedYearSupportsData = selectedFiscalYear === currentFiscalYear;
  const graphData = useMemo(
    () => [
      {
        group: currentFiscalYear,
        name: "Amount Valuation",
        data: valuationMonths.map(({ amount }) => amount / 10_000_000),
      },
    ],
    [currentFiscalYear, valuationMonths],
  );
  const yAxisMax = Math.ceil(
    Math.max(...valuationMonths.map(({ amount }) => amount / 10_000_000)) + 1,
  );
  const barColors = valuationMonths.map((_, index) =>
    selectedYearSupportsData && index <= currentMonthIndex
      ? "#24467E"
      : "#C4C4C4",
  );

  const options = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },

    colors: barColors,

    legend: {
      show: false,
    },

    plotOptions: {
      bar: {
        borderRadius: 5,
        columnWidth: "40%",
        distributed: true,
        dataLabels: {
          position: "top",
        },
      },
    },

    fill: {
      opacity: 1,
    },

    stroke: {
      show: false,
    },

    dataLabels: {
      enabled: false,
    },

    states: {
      hover: { filter: { type: "none" } },
      active: { filter: { type: "none" } },
    },

    xaxis: {
      crosshairs: { show: false },
    },

    yaxis: {
      min: 0,
      max: yAxisMax,
      title: {
        text: `Amount In Crores (${currency})`,
      },

      labels: {
        formatter: (value) => Number(value).toFixed(1),
      },
    },

    tooltip: {
      custom: ({ dataPointIndex }) => {
        const valuation = selectedYearSupportsData
          ? valuationMonths[dataPointIndex]
          : null;
        const month =
          valuation?.month || fiscalYearMonths(selectedFiscalYear)[dataPointIndex];

        return (
          `<div style="min-width:160px;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 14px rgba(15, 23, 42, 0.18);border:1px solid #e5e7eb;">` +
          `<div style="background:#eef2f6;color:#1f2937;font-size:12px;padding:8px 12px;border-bottom:1px solid #dbe1e8;white-space:nowrap;">${month || ""}</div>` +
          `<div style="padding:10px 12px;font-size:12px;color:#111827;">Asset:&nbsp;&nbsp;<span style="font-weight:700;">${valuation ? format(valuation.amount) : "-"}</span></div>` +
          `</div>`
        );
      },
    },
  };

  return (
    <div className="h-[425px]">
      <YearlyGraph
        title={<BizNestTitle>APPRECIATION CENTER</BizNestTitle>}
        headerRightContent={
          <span
            className={`flex items-center border border-[#1e3d73] bg-[#24467E] font-pmedium text-white ${
              isAppreciationCenterPage
                ? "gap-1 rounded-lg px-3 py-1.5 text-body"
                : "gap-0.5 rounded-md px-2 py-1 text-xs"
            }`}
          >
            <span>CURRENT AMOUNT VALUATION :</span>
            <span>{format(currentMonthValuation)}</span>
          </span>
        }
        data={graphData}
        options={options}
        currentYear={currentFiscalYear}
        onYearChange={setSelectedFiscalYear}
        minFiscalYear={currentFiscalYearStart}
        chartHeight={280}
        sectionHeight="h-[425px]"
        refreshOnDataChange
      />
    </div>
  );
};

const InvestorUniqueClientsGraph = () => {
  const axios = useAxiosPrivate();
  const { data: consolidatedClients = {} } = useQuery({
    queryKey: ["investor-unique-clients"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/consolidated-clients");
      return response.data && typeof response.data === "object"
        ? response.data
        : {};
    },
  });
  const { data: coWorkingClients = [] } = useQuery({
    queryKey: ["investor-unique-clients-coworking"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/co-working-clients");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const clientsByMonth = useMemo(() => {
    const grouped = {};
    const toTitleCase = (value) =>
      value
        .toLowerCase()
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("-");
    const serviceMapping = {
      coworking: "Coworking",
      virtualOffice: "Virtualoffice",
      externalMeeting: "External Meetings",
      openDesk: "Open Desk",
      workation: "Workations",
      coliving: "Co-Living",
    };

    const unifiedClients = Object.entries(consolidatedClients).flatMap(
      ([key, clients]) =>
        asArray(clients).map((client) => ({
          ...client,
          clientType: key.replace(/Clients$/, ""),
        })),
    );

    unifiedClients.forEach((client) => {
      let rawServiceName = client.clientType || "Unknown";

      if (rawServiceName === "meeting") {
        const purpose = String(client.purposeOfVisit || "").trim().toLowerCase();
        if (purpose === "meeting room booking") {
          rawServiceName = "externalMeeting";
        } else if (purpose === "half-day pass" || purpose === "full-day pass") {
          rawServiceName = "openDesk";
        }
      }

      if (rawServiceName === "coworking" && client.service?.serviceName) {
        const serviceName = client.service.serviceName.toLowerCase();
        if (serviceName.includes("workation")) {
          rawServiceName = "workation";
        } else if (
          serviceName.includes("living") ||
          serviceName.includes("coliving")
        ) {
          rawServiceName = "coliving";
        }
      }

      const typeOfClient =
        serviceMapping[rawServiceName] || toTitleCase(rawServiceName);

      let date = null;
      if (rawServiceName === "coworking") {
        date = client.startDate ? new Date(client.startDate) : null;
      } else if (rawServiceName === "virtualOffice") {
        date = client.termStartDate
          ? new Date(client.termStartDate)
          : client.rentDate
            ? new Date(client.rentDate)
            : null;
      } else if (
        rawServiceName === "externalMeeting" ||
        rawServiceName === "openDesk"
      ) {
        date = client.dateOfVisit
          ? new Date(client.dateOfVisit)
          : client.scheduledDate
            ? new Date(client.scheduledDate)
            : null;
      } else {
        date =
          client.startDate || client.dateOfVisit || client.termStartDate
            ? new Date(
                client.startDate || client.dateOfVisit || client.termStartDate,
              )
            : null;
      }

      if (!date || Number.isNaN(date.getTime())) return;

      const transformedClient = {
        client:
          client.clientName ||
          [client.firstName, client.lastName].filter(Boolean).join(" ") ||
          "Unknown",
        typeOfClient,
        date: date.toISOString().split("T")[0],
      };
      const month = date.toLocaleString("default", { month: "long" });
      grouped[month] ||= [];
      grouped[month].push(transformedClient);
    });

    return Object.entries(grouped).map(([month, clients]) => ({
      month,
      clients,
    }));
  }, [consolidatedClients]);

  const clientSummaryCards = useMemo(() => {
    const virtualOfficeClients = asArray(
      consolidatedClients.virtualOfficeClients,
    );
    const meetingClients = asArray(consolidatedClients.meetingClients);
    const externalVisitors = meetingClients.filter(
      (client) =>
        String(client?.visitorFlag || "").trim().toLowerCase() === "client",
    );
    const externalMeetings = externalVisitors.filter(
      (client) =>
        String(client?.purposeOfVisit || "").trim().toLowerCase() ===
        "meeting room booking",
    );
    const openDesk = externalVisitors.filter((client) => {
      const purpose = String(client?.purposeOfVisit || "")
        .trim()
        .toLowerCase();

      return (
        purpose === "half-day pass" ||
        purpose === "full-day pass" ||
        purpose === "half day pass" ||
        purpose === "full day pass" ||
        Boolean(client?.convertedFromInternal)
      );
    });

    const buildSummary = (clients) => {
      const active = clients.filter((client) =>
        typeof client?.isActive === "boolean"
          ? client.isActive
          : Boolean(client?.clientStatus),
      ).length;

      return {
        active,
        inactive: Math.max(0, clients.length - active),
      };
    };

    return [
      {
        id: "coworking",
        name: "Co-Working",
        clients: coWorkingClients,
      },
      {
        id: "virtual-office",
        name: "Virtual-Office",
        clients: virtualOfficeClients,
      },
      {
        id: "external-meetings",
        name: "External Meetings",
        clients: externalMeetings,
      },
      {
        id: "open-desk",
        name: "Open Desk",
        clients: openDesk,
      },
    ].map((item) => ({
      ...item,
      statusSummary: buildSummary(item.clients),
    }));
  }, [coWorkingClients, consolidatedClients]);

  const averageMonthlyUniqueClientTitle = ({ count, financialYear }) => {
    const currentDate = dayjs();
    const currentFinancialYear =
      currentDate.month() >= 3 ? currentDate.year() : currentDate.year() - 1;
    const elapsedMonths =
      financialYear === currentFinancialYear
        ? currentDate.month() >= 3
          ? currentDate.month() - 2
          : 12
        : financialYear < currentFinancialYear
          ? 12
          : 1;

    return `AVERAGE MONTHLY UNIQUE CLIENT : ${(count / elapsedMonths).toFixed(2)}`;
  };

  return (
    <LeadsLayout
      data={clientsByMonth}
      hideAccordion
      title={<BizNestTitle>UNIQUE CLIENTS</BizNestTitle>}
      titleAmount={averageMonthlyUniqueClientTitle}
      hideMonthAxisTitle
      noOuterPadding
      investorBlueStyle
      hideFinancialYearControls
    >
      {/*
      <div className="border-b border-borderGray px-4 pb-4">
        <h2 className="text-mobileTitle lg:text-widgetTitle text-primary font-pmedium uppercase">
          BIZNEST Overall Clients
        </h2>
      </div>
      <div className="pt-4">
        <WidgetSection layout={2}>
          {clientSummaryCards.map((item) => (
            <DataCard
              key={item.id}
              data={item.clients.length}
              title={item.name}
              statusSummary={item.statusSummary}
            />
          ))}
        </WidgetSection>
      </div>
      */}
    </LeadsLayout>
  );
};

//Meetings
const parseMeetingMinutes = (duration = "") => {
  // const hours = Number(duration.match(/(\d+(?:\.\d+)?)h/)?.[1] || 0);
  // const minutes = Number(duration.match(/(\d+(?:\.\d+)?)m/)?.[1] || 0);

  // return hours * 60 + minutes;
    const match = String(duration).match(/(\d+)(m|h)/);
  if (!match) return 0;

  const value = Number(match[1]);
  return match[2] === "h" ? value * 60 : value;
};

const InvestorMeetingAnalytics = ({ visibleGraphs }) => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const showDurationDetails =
    visibleGraphs.length === 1 && visibleGraphs[0] === "duration";

  const now = dayjs();
  const currentMonthLabel = now.format("MMM-YY");

  const fiscalStartYear = now.month() >= 3 ? now.year() : now.year() - 1;

  const fiscalLabel = `FY ${fiscalStartYear}-${String(
    fiscalStartYear + 1,
  ).slice(-2)}`;

  const months = Array.from({ length: 12 }, (_, index) =>
   dayjs(`${fiscalStartYear}-04-01`)
      .add(index, "month")
      .format("MMM-YY"),
  );

  const { data: meetings = [] } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () =>
      (await axios.get("/api/meetings/get-meetings")).data,
     refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () =>
      (await axios.get("/api/meetings/get-rooms")).data,
     refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const { data: visitors = [] } = useQuery({
     queryKey: ["investor-visitors"],
    queryFn: async () => {
      const response = await axios.get("/api/visitors/fetch-visitors");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const analytics = useMemo(() => {
     const activeRooms = rooms.filter((room) => room.isActive === true);
    //const activeRooms = rooms.filter((room) => room.isActive !== false);

    const activeRoomNames = new Set(
      activeRooms.map((room) => room.name),
    );

    const workingDays = (date) => {
      let count = 0;

      for (let day = 1; day <= date.daysInMonth(); day += 1) {
        const weekday = date.date(day).day();

        if (weekday >= 1 && weekday <= 6) {
          count += 1;
        }
      }

      return count;
    };

    const bookedByMonth = Object.fromEntries(
      months.map((month) => [month, 0]),
    );

    meetings.forEach((meeting) => {
      if (
        activeRoomNames.size &&
        !activeRoomNames.has(meeting.roomName)
      ) {
        return;
      }

      const date = dayjs(meeting.date || meeting.startTime);
      const label = date.format("MMM-YY");

      if (date.isValid() && label in bookedByMonth) {
        bookedByMonth[label] +=
          parseMeetingMinutes(meeting.duration) / 60;
      }
    });

    const bookedHours = Object.values(bookedByMonth).reduce(
      (sum, value) => sum + value,
      0,
    );

    const utilization = [
      {
        group: fiscalLabel,
        data: months.map((month) => {
          const date = dayjs(month, "MMM-YY");
          const capacity =
            activeRooms.length * 9 * workingDays(date);

          return {
            x: month,
            y: capacity
              ? (bookedByMonth[month] / capacity) * 100
              : 0,
          };
        }),
      },
    ];

    const guestMonths = [];
    const monthlyGuestMap = {};
    for (let i = 0; i < 12; i += 1) {
      const month = now.subtract(11 - i, "month");
      const label = month.format("MMM-YY");
      guestMonths.push(label);
      monthlyGuestMap[label] = 0;
    }

    const guestCounts = Object.fromEntries(months.map((month) => [month, 0]));
    const visitorTypeCounts = Object.fromEntries(
      visitorTypes.map((type) => [
        type,
        Object.fromEntries(months.map((month) => [month, 0])),
      ]),
    );

    visitors.forEach((visitor) => {
      const date = dayjs(visitor.dateOfVisit || visitor.checkIn || visitor.createdAt);
      const label = date.format("MMM-YY");
      const visitorType = visitor.visitorType;

      if (date.isValid() && label in guestCounts) {
        guestCounts[label] += 1;
        if (visitorType && visitorTypeCounts[visitorType]) {
          visitorTypeCounts[visitorType][label] += 1;
        }
      }

      if (date.isValid() && monthlyGuestMap[label] !== undefined) {
        monthlyGuestMap[label] += 1;
      }
    });

    // const roomNames = activeRooms
    //   .map((room) => room.name)
    //   .sort();

    const roomNames = rooms.map((room) => room.name).sort();


    const roomHours = Object.fromEntries(
      roomNames.map((name) => [name, 0]),
    );

    meetings.forEach((meeting) => {
      const date = dayjs(meeting.date || meeting.startTime);

      if (
        date.isSame(now, "month") &&
        meeting.roomName in roomHours
      ) {
        roomHours[meeting.roomName] +=
          parseMeetingMinutes(meeting.duration) / 60;
      }
    });

    const monthlyCapacity = 9 * workingDays(now);

    const occupancy = [
      {
        name: "Average Occupancy",
        data: roomNames.map((name) => ({
          x: name,
          y: monthlyCapacity
            ? (roomHours[name] / monthlyCapacity) * 100
            : 0,
        })),
      },
    ];

    const dayNames = [
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
    ];

    const timeSlots = Array.from({ length: 12 }, (_, index) => {
      const start = dayjs()
        .hour(index + 8)
        .minute(0);

      return `${start.format("hA")}-${start
        .add(1, "hour")
        .format("hA")}`;
    });

    // const weekStart = now.startOf("week");

   const matrix = timeSlots.map(() => Array(7).fill(0));

    const monday = now
      .subtract((now.day() + 6) % 7, "day")
      .startOf("day");
    const meetingWeekDays = Array.from({ length: 6 }, (_, index) =>
      monday.add(index, "day").format("YYYY-MM-DD"),
    );

    meetings.forEach((meeting) => {
      const date = dayjs(meeting.startTime);
      const slot = date.hour() - 8;
      const dayIndex = meetingWeekDays.indexOf(date.format("YYYY-MM-DD"));

      if (
        date.isValid() &&
        dayIndex !== -1 &&
        slot >= 0 &&
        slot < 12
      ) {
        matrix[slot][dayIndex] += 1;
      }
    });

    const heatmap = timeSlots.map((name, index) => ({
      name,
      data: dayNames.map((day, dayIndex) => ({
        x: day,
        y: matrix[index][dayIndex],
      })),
    }));

    const durationBuckets = [15, 30, 60, 90, 120, 150, "Others"];
    const durationCounts = Array(durationBuckets.length).fill(0);
    const longerDurationCounts = {};

    meetings.forEach((meeting) => {
      const minutes = parseMeetingMinutes(meeting.duration);
      const bucketIndex = [15, 30, 60, 90, 120, 150].findIndex(
        (limit) => minutes <= limit,
      );
      if (bucketIndex === -1) {
        longerDurationCounts[minutes] = (longerDurationCounts[minutes] || 0) + 1;
      }
      durationCounts[bucketIndex === -1 ? 6 : bucketIndex] += 1;
    });

    const externalGuestsData = [
      {
        name: "Visitors",
        data: guestMonths.map((month) => monthlyGuestMap[month]),
      },
    ];
    const externalGuestsMax = Math.max(
      120,
      Math.ceil(
        Math.max(...guestMonths.map((month) => monthlyGuestMap[month]), 0) / 20,
      ) * 20,
    );

    const externalGuestsOptions = {
      chart: {
        type: "bar",
        fontFamily: "Poppins-Regular",
        toolbar: {
          show: false,
        },
      },
      xaxis: {
        categories: guestMonths,
        title: {
          text: "",
        },
        labels: {
          style: {
            fontSize: "8px",
            fontFamily: "Poppins-Regular",
            colors: "#333",
          },
        },
      },
      yaxis: {
        max: externalGuestsMax,
        min: 0,
        tickAmount: 4,
        forceNiceScale: false,
        title: {
          text: "Guest Count",
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "65%",
          borderRadius: 5,
          dataLabels: {
            position: "top",
          },
        },
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: "12px",
          colors: ["#000"],
        },
        offsetY: -22,
      },
      colors: ["#08b6bc"],
    };

    // const bucketLabels = [
    //   "15",
    //   "30",
    //   "60",
    //   "90",
    //   "120",
    //   "Others",
    // ];

    // const bucketCounts = Array(6).fill(0);

    // meetings.forEach((meeting) => {
    //   const minutes = parseMeetingMinutes(meeting.duration);

    //   const index = [15, 30, 60, 90, 120].findIndex(
    //     (limit) => minutes <= limit,
    //   );

    //   bucketCounts[index < 0 ? 5 : index] += 1;
    // });

    return {
      bookedHours,
      utilization,
      guestCounts,
      visitorTypeCounts,
      externalGuestsData,
      externalGuestsOptions,
      totalVisitors: Object.values(guestCounts).reduce(
        (total, count) => total + count,
        0,
      ),
      roomNames,
      roomHours,
      occupancy,
      heatmap,
      duration: durationBuckets.map((bucket, index) => ({
        label: bucket === "Others" ? bucket : `${bucket} min`,
        value: durationCounts[index],
      })),
      durationDetails: [
        ...durationBuckets.slice(0, -1).map((bucket, index) => ({
          label: `${bucket} min`,
          value: durationCounts[index],
        })),
        ...Object.entries(longerDurationCounts)
          .sort(([minutesA], [minutesB]) => Number(minutesA) - Number(minutesB))
          .map(([minutes, value]) => ({
            label: `${minutes} min`,
            value,
          })),
      ],
    };
  }, [fiscalLabel, meetings, months, now, rooms, visitors]);

  const goTo = (route) => () =>
    navigate(`/app/dashboard/investor-dashboard/${route}`);

  const utilizationOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },
    xaxis: {
      categories: months,
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 4,
      forceNiceScale: false,
      title: {
        text: "Utilization (%)",
      },
      labels: {
        formatter: (value) => Math.round(value),
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (value) => `${value.toFixed(1)}%`,
    },
    plotOptions: {
      bar: {
        borderRadius: 5,
        columnWidth: "40%",
      },
    },
  };

  const barOptions = (categories, yTitle, formatter, showDataLabels = true) => {
    const isOccupancy = yTitle.includes("Occupancy");

    return {
      chart: {
        type: "bar",
        toolbar: { show: false },
        fontFamily: "Poppins-Regular",
      },
      xaxis: {
        categories,
        labels: {
          rotate: isOccupancy ? -45 : 0,
          trim: true,
          hideOverlappingLabels: true,
          style: {
            fontSize: isOccupancy ? "10px" : "12px",
          },
        },
      },
      yaxis: {
        max: isOccupancy ? 100 : undefined,
        min: 0,
        tickAmount: isOccupancy ? 5 : undefined,
        forceNiceScale: false,
        title: {
          text: yTitle,
        },
        labels: {
          formatter: (value) =>
            isOccupancy ? `${Math.round(value)}%` : Math.round(value),
        },
      },
      colors: ["#2DC1C6"],
      dataLabels: {
        enabled: showDataLabels,
        formatter,
        offsetY: -18,
        style: {
          colors: ["#111"],
        },
      },
      plotOptions: {
        bar: {
          borderRadius: 5,
          columnWidth: "55%",
          dataLabels: {
            position: "top",
          },
        },
      },
    };
  };

  const heatmapOptions = {
    chart: {
      type: "heatmap",
      toolbar: { show: false },
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      heatmap: {
        colorScale: {
          ranges: [
            {
              from: 0,
              to: 0,
              color: "#d1d5db",
              name: "No Bookings",
            },
            {
              from: 1,
              to: 5,
              color: "#B2FFB2",
              name: "Low (1-5)",
            },
            {
              from: 6,
              to: 10,
              color: "#4CAF50",
              name: "Moderate (6-10)",
            },
            {
              from: 11,
              to: 15,
              color: "#2E7D32",
              name: "High (11-15)",
            },
            {
              from: 16,
              to: 999,
              color: "#1B5E20",
              name: "Very High (16-20)",
            },
          ],
        },
      },
    },
  };
  const visitorOptions = {
    ...barOptions(
      months,
      "No. of Visitors",
      (value) => value.toFixed(0),
      false,
    ),
    colors: ["#2196F3", "#16B8C4", "#3498DB", "#174EA6", "#5C6BC0"],
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "center",
    },
    tooltip: {
      y: {
        formatter: (value) => `${Number(value || 0).toFixed(0)}`,
      },
    },
  };

  const meetingDurationOptions = {
    ...barOptions(
      analytics.duration.map((item) => item.label),
      "Meeting Count",
      (value) => Math.round(value),
    ),
    xaxis: {
      ...barOptions(
        analytics.duration.map((item) => item.label),
        "Meeting Count",
        (value) => Math.round(value),
      ).xaxis,
      title: {
        text: "Minutes",
      },
      crosshairs: {
        show: false,
      },
    },
    yaxis: {
      ...barOptions(
        analytics.duration.map((item) => item.label),
        "Meeting Count",
        (value) => Math.round(value),
      ).yaxis,
      crosshairs: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 5,
        columnWidth: "35%",
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (value) => Math.round(value),
      offsetY: -26,
      style: {
        colors: ["#111"],
      },
    },
    colors: ["#9FA1FF"],
  };

  // const pieOptions = {
  //   labels: analytics.duration.map((item) => item.label),
  //   legend: {
  //     position: "bottom",
  //   },
  //   colors: [
  //     "#1E3D73",
  //     "#34528A",
  //     "#4A68A1",
  //     "#608DB8",
  //     "#76A2CF",
  //     "#8CB8E6",
  //   ],
  //   dataLabels: {
  //     enabled: true,
  //     formatter: (value) => `${value.toFixed(1)}%`,
  //   },
  // };

  const show = (key) => visibleGraphs.includes(key);

  return (
    <div className="flex flex-col gap-6">
      {show("utilization") && (
        <div
          onClick={goTo("meeting-room-utilization")}
          className="cursor-pointer"
        >
          <YearlyGraph
            title={<BizNestTitle>AVERAGE MEETING ROOM UTILIZATION</BizNestTitle>}
            data={analytics.utilization}
            options={utilizationOptions}
            currentYear={fiscalLabel}
          />
        </div>
      )}

      {(show("guests") || show("occupancy")) && (
        <WidgetSection
          layout={Number(show("guests")) + Number(show("occupancy"))}
           padding
          gridGap="gap-x-6 gap-y-6"
        >
          {show("guests") && (
            <WidgetSection
              border
              padding
              height="min-h-[430px]"
              title="EXTERNAL GUESTS VISITED"
              titleLabel={currentMonthLabel}
            >
              <div
                onClick={goTo("external-guests-visited")}
                className="cursor-pointer"
              >
                <BarGraph
                  data={analytics.externalGuestsData}
                  options={analytics.externalGuestsOptions}
                  height={450}
                />
              </div>
            </WidgetSection>
          )}

          {show("occupancy") && (
            <WidgetSection
              border
              padding
              height="min-h-[430px]"
              title="AVERAGE OCCUPANCY OF ROOMS IN %"
              titleLabel={currentMonthLabel}
            >
              <div
                onClick={goTo("average-room-occupancy")}
                className="cursor-pointer"
              >
                <BarGraph
                  data={analytics.occupancy}
                  options={barOptions(
                    analytics.roomNames,
                    "Occupancy (%)",
                    (value) => `${value.toFixed(0)}%`,
                  )}
                  height={450}
                />
              </div>
            </WidgetSection>
          )}
        </WidgetSection>
      )}

      {show("busy") && (
        <WidgetSection
          border
          title={<BizNestTitle>BUSY TIME DURING THE WEEK</BizNestTitle>}
        >
          <div
            onClick={goTo("busy-time-during-week")}
            className="cursor-pointer"
          >
            <HeatMap
              data={analytics.heatmap}
              options={heatmapOptions}
              height={500}
            />
          </div>
        </WidgetSection>
      )}
      {show("duration") && (
        <WidgetSection
          border
          title={<BizNestTitle>MEETING DURATION BREAKDOWN</BizNestTitle>}
        >
          <div
            onClick={goTo("meeting-duration-breakdown")}
            className="cursor-pointer"
          >
            <BarGraph
              data={[
                {
                  name: "Meetings",
                  data: analytics.duration.map((item) => item.value),
                },
              ]}
              options={meetingDurationOptions}
              height={450}
            />
          </div>
        </WidgetSection>
      )}
      {showDurationDetails && (
        <WidgetSection
          border
          title={<BizNestTitle>MEETING DURATION BREAKDOWN DETAILS</BizNestTitle>}
        >
          <AgTable
            data={analytics.durationDetails.map((item, index) => ({
              id: index + 1,
              minute: item.label,
              meeting: item.value,
            }))}
            columns={[
              { field: "id", headerName: "Sr No", flex: 1.5 },
              { field: "minute", headerName: "Minute", flex: 1.5 },
              { field: "meeting", headerName: "Meeting Count", flex: 1 },
                ]}
            search
              />
        </WidgetSection>
      )}
      {show("visitors") && (
        <div
          onClick={goTo("monthly-total-visitors")}
          className="cursor-pointer"
        >
          <YearlyGraph
            title={<BizNestTitle>{`MONTHLY TOTAL VISITORS ${fiscalLabel}`}</BizNestTitle>}
            headerRightContent={
              <span className="text-mobileTitle lg:text-widgetTitle text-primary font-pmedium">
                TOTAL COUNT: {analytics.totalVisitors}
              </span>
            }
            data={[
              ...visitorTypes.map((type) => ({
                name: type,
                group: fiscalLabel,
                data: months.map((month) => analytics.visitorTypeCounts[type][month]),
              })),
            ]}
            options={visitorOptions}
            chartHeight={380}
            currentYear={fiscalLabel}
          />
        </div>
      )}
    </div>
  );
};


const InvestorIncomeExpenseGraph = ({ showSummaryCards }) => {
  const { currency, format } = useCurrency();
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const { hasPermission } = useUserPermissions();
  const currentFiscalYear = fiscalYearLabel(dayjs());
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(currentFiscalYear);
  const [hiddenProjectionLegendItems, setHiddenProjectionLegendItems] = useState([]);
  const applyProjectionGradients = () => {
    window.requestAnimationFrame(() => {
      const chart = document.querySelector("#bargraph-investor-income-expense");
      const svg = chart?.querySelector("svg");
      if (!svg) return;

      let defs = svg.querySelector("defs");
      if (!defs) {
        defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        svg.prepend(defs);
      }

      const ensureGradient = (id, startColor, endColor) => {
        let gradient = svg.querySelector(`#${id}`);
        if (gradient) return gradient;

        gradient = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "linearGradient",
        );
        gradient.setAttribute("id", id);
        gradient.setAttribute("x1", "0%");
        gradient.setAttribute("y1", "0%");
        gradient.setAttribute("x2", "100%");
        gradient.setAttribute("y2", "0%");

        const start = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        start.setAttribute("offset", "0%");
        start.setAttribute("stop-color", startColor);

        const end = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        end.setAttribute("offset", "100%");
        end.setAttribute("stop-color", endColor);

        gradient.append(start, end);
        defs.append(gradient);
        return gradient;
      };

      ensureGradient(
        "investor-income-gradient",
        INVESTOR_INCOME_COLOR,
        INVESTOR_INCOME_GRADIENT_END,
      );
      ensureGradient(
        "investor-expense-gradient",
        INVESTOR_EXPENSE_COLOR,
        INVESTOR_EXPENSE_GRADIENT_END,
      );

      svg.querySelectorAll("path, rect").forEach((bar) => {
        bar.style.transform = "";
        bar.style.transformBox = "";
        bar.style.transformOrigin = "";

        const fill = bar.getAttribute("fill")?.toLowerCase();
        if (fill === INVESTOR_INCOME_COLOR.toLowerCase()) {
          bar.setAttribute("fill", "url(#investor-income-gradient)");
        } else if (
          fill === INVESTOR_EXPENSE_COLOR.toLowerCase() ||
          fill === "#ff0000"
        ) {
          bar.setAttribute("fill", "url(#investor-expense-gradient)");
        }
      });

      const hideIncome = hiddenProjectionLegendItems.includes("Income");
      const hideExpense = hiddenProjectionLegendItems.includes("Expense");
      const visibleActualSeries = hideIncome !== hideExpense
        ? hideIncome
          ? "Expense"
          : "Income"
        : null;

      if (!visibleActualSeries) return;

      const seriesGroup = svg.querySelector(
        `.apexcharts-series[seriesName="${visibleActualSeries}"]`,
      );
      if (!seriesGroup) return;

      seriesGroup.querySelectorAll("path, rect").forEach((bar) => {
        const dataPointIndex = Number(
          bar.getAttribute("j") ??
          bar.getAttribute("data\\:realIndex") ??
          bar.getAttribute("data-realIndex"),
        );

        if (!Number.isInteger(dataPointIndex) || projectionFlags[dataPointIndex]) {
          return;
        }

        bar.style.transformBox = "fill-box";
        bar.style.transformOrigin = "center";
        bar.style.transform = "scaleX(1.95)";
      });
    });
  };

  const { data: revenueExpenseData = [] } = useQuery({
    queryKey: ["revenueExpenseData"],
    queryFn: async () => {
      const response = await axios.get("/api/finance/income-expense");
      return Array.isArray(response.data?.response) ? response.data.response : [];
    },
  });

  const { data: managedUnitsData = [] } = useQuery({
    queryKey: ["investor-managed-units"],
    queryFn: async () => {
      const response = await axios.get("/api/company/fetch-simple-units");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const { data: budgetData = [] } = useQuery({
    queryKey: ["budgetData", "investor-income-expense"],
    queryFn: async () => {
      const response = await axios.get("/api/budget/company-budget", {
        params: { view: "dashboard" },
      });
      return Array.isArray(response.data?.allBudgets) ? response.data.allBudgets : [];
    },
  });

 const {
    series,
    totals,
    selectedIncome,
    selectedExpense,
    projectionAmount,
    projectionFlags,
  } = useMemo(() => {
    const incomeByYear = new Map();
    const expenseByYear = new Map();
    const addAmount = (map, date, amount) => {
      if (!date || !dayjs(date).isValid()) return;
      const year = fiscalYearLabel(date);
      const values = map.get(year) || Array(12).fill(0);
      values[fiscalMonthIndex(date)] += Number(amount) || 0;
      map.set(year, values);
    };

    revenueExpenseData.forEach((entry) => {
      const income = entry?.income || {};
      [
        ...asArray(income.meetingRevenue),
        ...asArray(income.alternateRevenues),
        ...asArray(income.virtualOfficeRevenues),
        ...asArray(income.workationRevenues),
        ...asArray(income.coworkingRevenues),
      ].forEach((item) =>
        addAmount(
          incomeByYear,
          item.date || item.rentDate || item.invoiceCreationDate,
          item.taxableAmount || item.revenue || item.taxable,
        ),
      );
    });

    budgetData.forEach((item) =>
      addAmount(expenseByYear, item?.dueDate, item?.actualAmount),
    );

    const years = new Set([
      ...incomeByYear.keys(),
      ...expenseByYear.keys(),
      currentFiscalYear,
    ]);
    const projectedMonthsByYear = new Map();
    const graphSeries = [...years].flatMap((group) => {
      const incomeValues = incomeByYear.get(group) || Array(12).fill(0);
      const expenseValues = expenseByYear.get(group) || Array(12).fill(0);
      const projectedFlags = incomeValues.map(
        (incomeAmount, monthIndex) =>
          incomeAmount === 0 && expenseValues[monthIndex] === 0,
      );
      projectedMonthsByYear.set(group, projectedFlags);
      const incomeGraphValues = incomeValues.map((incomeAmount, monthIndex) =>
        projectedFlags[monthIndex]
          ? INVESTOR_PROJECTED_MONTHLY_INCOME_AMOUNT
          : incomeAmount,
      );
      const expenseGraphValues = expenseValues.map((expenseAmount, monthIndex) =>
        projectedFlags[monthIndex]
          ? INVESTOR_PROJECTED_MONTHLY_EXPENSE_AMOUNT
          : expenseAmount,
      );
      return [
        { name: "Income", group, data: incomeGraphValues },
        { name: "Expense", group, data: expenseGraphValues },
      ];
    });
    const income = incomeByYear.get(selectedFiscalYear) || [];
    const expense = expenseByYear.get(selectedFiscalYear) || [];
    const selectedProjectionFlags =
      projectedMonthsByYear.get(selectedFiscalYear) || Array(12).fill(false);

    return {
      series: graphSeries,
      totals: {
        income: income.reduce((sum, value) => sum + value, 0),
        expense: expense.reduce((sum, value) => sum + value, 0),
      },
      selectedIncome: income,
      selectedExpense: expense,
      projectionAmount: selectedProjectionFlags.reduce(
        (sum, isProjected, monthIndex) =>
          sum +
          (isProjected
            ? INVESTOR_PROJECTED_MONTHLY_INCOME_AMOUNT
            : income[monthIndex] || 0) -
          (isProjected
            ? INVESTOR_PROJECTED_MONTHLY_EXPENSE_AMOUNT
            : expense[monthIndex] || 0),
        0,
      ),
      projectionFlags: selectedProjectionFlags,
    };
  }, [budgetData, currentFiscalYear, revenueExpenseData, selectedFiscalYear]);
  const displayedProjectionSeries = useMemo(
    () =>
      series.map((item) => ({
        ...item,
        data: item.data.map((value, monthIndex) => {
          if (
            hiddenProjectionLegendItems.includes("Projected") &&
            projectionFlags[monthIndex]
          ) {
            return null;
          }

          if (
            hiddenProjectionLegendItems.includes(item.name) &&
            !projectionFlags[monthIndex]
          ) {
            return null;
          }

          return value;
        }),
      })),
    [hiddenProjectionLegendItems, projectionFlags, series],
  );
  const toggleProjectionLegendItem = (label) => {
    setHiddenProjectionLegendItems((current) =>
      current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label],
    );
  };
  const totalSqft = useMemo(
    () =>
      revenueExpenseData
        .filter((item) => item?.units)
        .flatMap((item) => asArray(item.units))
        .reduce((sum, item) => sum + (Number(item?.sqft) || 0), 0),
    [revenueExpenseData],
  );
  const annualManagedSqft = useMemo(() => {
    const managedBuildings = new Set(["sunteck kanaka", "dempo trade center"]);
    const totalManagedSqft = managedUnitsData
      .filter((unit) => {
        const buildingName = String(
          unit?.building?.buildingName || unit?.buildingName || "",
        )
          .trim()
          .toLowerCase()
          .replace(/centre/g, "center");

        return managedBuildings.has(buildingName);
      })
      .reduce((sum, unit) => sum + (Number(unit?.sqft) || 0), 0);

    return totalManagedSqft / 12;
  }, [managedUnitsData]);

  const previousMonthIndex = fiscalMonthIndex(dayjs().subtract(1, "month"));
  const selectedYearStart = Number(selectedFiscalYear.match(/\d{4}/)?.[0]);
  const selectedMonthDate = Number.isFinite(selectedYearStart)
    ? dayjs(`${selectedYearStart}-04-01`).add(previousMonthIndex, "month")
    : null;
  const summaryMonthLabel = selectedMonthDate
    ? `${selectedMonthDate.format("MMMM")} - ${selectedFiscalYear}`
    : "-";
  const summaryMonthIncome = selectedIncome[previousMonthIndex] || 0;
  const summaryMonthExpense = selectedExpense[previousMonthIndex] || 0;
  const perSqft = (value) => (totalSqft ? value / totalSqft : 0);
  const buildCardData = (cardTitle, values, highlightNegativePositive = false) => ({
    cardTitle,
    timePeriod: selectedFiscalYear,
    highlightNegativePositive,
    descriptionData: [
      {
        title: summaryMonthLabel,
        value: format(values.month),
        route: "#",
      },
      {
        title: "Annual Average",
        value: format(values.total / 12),
        route: "#",
      },
      {
        title: "Overall Manage Sq.Ft",
        value: `${inrFormat(annualManagedSqft)} Sq.Ft`,
        route: "#",
      },
      {
        title: "Per Sq. Ft.",
        value: format(perSqft(values.total)),
        route: "#",
      },
      ],
  });
  const options = {
    chart: {
      id: "investor-income-vs-expense",
      animations: { enabled: false },
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
      events: {
        mounted: applyProjectionGradients,
        updated: applyProjectionGradients,
      },
    },
     colors: [
      ({ dataPointIndex }) =>
        projectionFlags[dataPointIndex]
          ? INVESTOR_PROJECTED_INCOME_COLOR
          : INVESTOR_INCOME_COLOR,
      ({ dataPointIndex }) =>
        projectionFlags[dataPointIndex]
          ? INVESTOR_PROJECTED_EXPENSE_COLOR
          : INVESTOR_EXPENSE_COLOR,
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "70%",
        borderRadius: 5,
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["#ffffff"],
    },
    dataLabels: { enabled: false },
    legend: {
      show: false,
    },
    grid: {
      padding: {
        left: 24,
        right: 24,
      },
    },
    states: {
      hover: { filter: { type: "none" } },
      active: { filter: { type: "none" } },
    },
    xaxis: {
      tickPlacement: "between",
      crosshairs: { show: false },
      labels: {
        show: true,
        style: {
          colors: "#1234c9",
        },
      },
    },
    yaxis: {
      min: 0,
      max: 10_000_000,
      tickAmount: 5,
      forceNiceScale: false,
      title: {
        text: `Amount In Lakhs (${currency})`,
        style: {
          color: "#1234c9",
        },
      },
      labels: {
        show: true,
        style: {
          colors: "#1234c9",
        },
        formatter: (value) => `${Math.round(value / 100000)}`,
      },
    },
    tooltip: { y: { formatter: (value) => format(value) } },
  };

  const projectionLegend = (
    <div className="flex items-center justify-center gap-4 text-sm">
      {[
        { label: "Income", color: INVESTOR_INCOME_COLOR },
        { label: "Expense", color: INVESTOR_EXPENSE_COLOR },
        { label: "Projected", color: INVESTOR_PROJECTED_COLOR },
      ].map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => toggleProjectionLegendItem(item.label)}
          className={`flex items-center gap-1.5 text-[#1234c9] ${
            hiddenProjectionLegendItems.includes(item.label) ? "opacity-40" : ""
          }`}
        >
          <span
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: item.color }}
          />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );

  return (
   <div className="flex flex-col gap-4">
      <YearlyGraph
        data={displayedProjectionSeries}
        options={options}
        chartId="bargraph-investor-income-expense"
        title={
          <BizNestTitle>{`PROJECTIONS - ${selectedFiscalYear}`}</BizNestTitle>
        }
        chartHeight={450}
        chartTopContent={projectionLegend}
        headerRightContent={
          <div className="flex items-center justify-center gap-2 rounded-lg border border-[#aec6fb] bg-[#dbe4ff] px-3 py-2 text-body font-pmedium uppercase text-[#274784]">
            <span>Projection:</span>
            <span>{format(projectionAmount)}</span>
          </div>
        }
        currentYear={selectedFiscalYear}
        onYearChange={setSelectedFiscalYear}
        hideYearNavigation
      />
      <InvestorSnapshotSection
        format={format}
        hasPermission={hasPermission}
        navigate={navigate}
      />
      <InvestorAnnualMonthlyMixIncome hasPermission={hasPermission} />
      <InvestorOccupiedInventoryGraph hasPermission={hasPermission} />
      {showSummaryCards && (
        <div className="mt-2">
          <WidgetSection
            border
            height="min-h-[340px]"
            title={<BizNestTitle>PROFIT & LOSS - LAST MONTHS</BizNestTitle>}
          >
            <div className="mt-4 mb-4 grid grid-cols-1 gap-5 lg:grid-cols-3">
              {[
                {
                  title: "Income",
                  month: summaryMonthIncome,
                  total: totals.income,
                },
                {
                  title: "Expense",
                  month: summaryMonthExpense,
                  total: totals.expense,
                },
                {
                  title: "Profit & Loss",
                  month: summaryMonthIncome - summaryMonthExpense,
                  total: totals.income - totals.expense,
                  highlightNegativePositive: true,
                },
              ].map((card) => {
                const cardData = buildCardData(
                  card.title,
                  { month: card.month, total: card.total },
                  card.highlightNegativePositive,
                );
                return (
                  <div key={card.title} className="flex flex-col gap-3">
                    <FinanceCard
                      cardTitle={card.title}
                      timePeriod={selectedFiscalYear}
                      descriptionData={[]}
                      minHeight="min-h-[50px]"
                      hideHeaderDivider
                      centerContent
                      disableLinks
                    />
                    <FinanceCard
                      {...cardData}
                      descriptionData={cardData.descriptionData.slice(0, 2)}
                      minHeight="min-h-[110px]"
                      hideHeader
                      hideDividerAfter={["Annual Average", "Per Sq. Ft."]}
                      disableLinks
                    />
                    <FinanceCard
                      {...cardData}
                      descriptionData={cardData.descriptionData.slice(2)}
                      minHeight="min-h-[110px]"
                      hideHeader
                      hideDividerAfter={["Annual Average", "Per Sq. Ft."]}
                      disableLinks
                    />
                  </div>
                );
              })}
            </div>
          </WidgetSection>
        </div>
      )}
    </div>      
  );
};

const yearCategories = {
  "FY 2024-2025": [
    "Apr-24",
    "May-24",
    "Jun-24",
    "Jul-24",
    "Aug-24",
    "Sep-24",
    "Oct-24",
    "Nov-24",
    "Dec-24",
    "Jan-25",
    "Feb-25",
    "Mar-25",
  ],
  "FY 2025-2026": [
    "Apr-25",
    "May-25",
    "Jun-25",
    "Jul-25",
    "Aug-25",
    "Sep-25",
    "Oct-25",
    "Nov-25",
    "Dec-25",
    "Jan-26",
    "Feb-26",
    "Mar-26",
  ],
};

const InvestorDashboard = () => {
  const { currency, format } = useCurrency();
  const axios = useAxiosPrivate();
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission } = useUserPermissions();
  const showDetails = location.pathname.endsWith("/historical-P&L");
  const showIncomeExpensePage = location.pathname.endsWith("/income-expense");
  const showUniqueClientsPage = location.pathname.endsWith("/unique-clients");
  const showInventoryPage = location.pathname.endsWith("/inventory");
  const showAppreciationCenterPage = location.pathname.endsWith(
    "/appreciation-center",
  );
  const selectedHistoricalFiscalYear = fiscalYearLabel(dayjs());
   const meetingGraphRoutes = {
    utilization: "/meeting-room-utilization",
    guests: "/external-guests-visited",
    occupancy: "/average-room-occupancy",
    busy: "/busy-time-during-week",
    visitors: "/monthly-total-visitors",
    duration: "/meeting-duration-breakdown",
  };
   const operationalGraphRoutes = {
    sector: "/app/dashboard/investor-dashboard/sector-wise-occupancy",
    client: "/app/dashboard/investor-dashboard/client-wise-occupancy",
    gender: "/app/dashboard/investor-dashboard/client-member-gender-wise-data",
    india: "/app/dashboard/investor-dashboard/india-wise-members",
    desks: "/app/dashboard/investor-dashboard/total-desks-company-wise",
    visitorCategory: "/app/dashboard/investor-dashboard/overall-visitor-category",
    visitorClientType: "/app/dashboard/investor-dashboard/overall-visitor-client-type",
    visitorGender: "/app/dashboard/investor-dashboard/overall-visitor-gender-data",
  };
  const showDashboardHome = location.pathname.endsWith("/investor-dashboard");
  const canViewHistoricalPnlGraph = hasPermission(
    PERMISSIONS.INVESTOR_HISTORICAL_PNL_GRAPH.value,
  );
  const canViewIncomeExpenseGraph = hasPermission(
    PERMISSIONS.INVESTOR_INCOME_EXPENSE_GRAPH.value,
  );
   const canViewFinanceSummaryCards = hasPermission(
    PERMISSIONS.INVESTOR_FINANCE_SUMMARY_CARDS.value,
  );
 const canViewUniqueClientsGraph = hasPermission(
    PERMISSIONS.INVESTOR_UNIQUE_CLIENTS_GRAPH.value,
  );
  const canViewInventoryOverview = hasPermission(
    PERMISSIONS.INVESTOR_INVENTORY_OVERVIEW.value,
  );
  const canViewAppreciationCenter = hasPermission(
    PERMISSIONS.INVESTOR_APPRECIATION_CENTER.value,
  );
  const meetingGraphPermissions = {
    utilization: PERMISSIONS.INVESTOR_MEETING_ROOM_UTILIZATION.value,
    guests: PERMISSIONS.INVESTOR_EXTERNAL_GUESTS_VISITED.value,
    occupancy: PERMISSIONS.INVESTOR_AVERAGE_ROOM_OCCUPANCY.value,
    busy: PERMISSIONS.INVESTOR_BUSY_TIME_WEEK.value,
    duration: PERMISSIONS.INVESTOR_MEETING_DURATION_BREAKDOWN.value,
       visitors: PERMISSIONS.INVESTOR_MONTHLY_TOTAL_VISITORS.value,
  };
  const visibleMeetingGraphs = Object.keys(meetingGraphRoutes).filter(
    (key) =>
      hasPermission(meetingGraphPermissions[key]) &&
      (showDashboardHome || location.pathname.endsWith(meetingGraphRoutes[key])),
  );
 const operationalGraphPermissions = {
    sector: PERMISSIONS.INVESTOR_SECTOR_WISE_OCCUPANCY.value,
    client: PERMISSIONS.INVESTOR_CLIENT_WISE_OCCUPANCY.value,
    gender: PERMISSIONS.INVESTOR_CLIENT_MEMBER_GENDER_WISE_DATA.value,
    india: PERMISSIONS.INVESTOR_INDIA_WISE_MEMBERS.value,
    desks: PERMISSIONS.INVESTOR_TOTAL_DESKS_COMPANY_WISE.value,
    visitorCategory: PERMISSIONS.INVESTOR_OVERALL_VISITOR_CATEGORY.value,
    visitorClientType: PERMISSIONS.INVESTOR_OVERALL_VISITOR_CLIENT_TYPE.value,
    visitorGender: PERMISSIONS.INVESTOR_OVERALL_VISITOR_GENDER_DATA.value,
  };
  const visibleOperationalGraphs = Object.keys(operationalGraphRoutes).filter(
    (key) =>
      hasPermission(operationalGraphPermissions[key]) &&
      (showDashboardHome || location.pathname.endsWith(operationalGraphRoutes[key])),
  );
  const operationalGraphsBeforeMeeting = [
    "sector",
    "client",
    "gender",
    "india",
    "desks",
  ];
  const { data: revenueExpenseData = [], isLoading } = useQuery({
    queryKey: ["historicalIncomeExpense"],
    queryFn: async () => {
      const response = await axios.get("/api/finance/income-expense");
      return Array.isArray(response.data?.response) ? response.data.response : [];
    },
     enabled: showDetails || canViewHistoricalPnlGraph,
  });

  //-----------------------------------------------------Graph------------------------------------------------------//
  // Base data for first 3 years
  const baseIncomeData = [25174680, 31929380, 31929380];
  const baseExpenseData = [24168780, 33899540, 33899540];

  // Replace last year with Redux values (default to 0 if not available)
  const historicalData = useMemo(() => {
    const expenseItems = revenueExpenseData
      .filter((item) => item.expense)
      .flatMap((item) => item.expense || []);

    const incomeItems = revenueExpenseData.flatMap((item) => {
      const income = item.income || {};
      return [
        ...(Array.isArray(income.meetingRevenue) ? income.meetingRevenue : []),
        ...(Array.isArray(income.alternateRevenues)
          ? income.alternateRevenues
          : []),
        ...(Array.isArray(income.virtualOfficeRevenues)
          ? income.virtualOfficeRevenues
          : []),
        ...(Array.isArray(income.workationRevenues)
          ? income.workationRevenues
          : []),
        ...(Array.isArray(income.coworkingRevenues)
          ? income.coworkingRevenues
          : []),
      ];
    });

    const summary = Object.entries(yearCategories).map(([fiscalYear, months]) => {
      const income = incomeItems.reduce((sum, item) => {
        const rawDate = item.date || item.rentDate || item.invoiceCreationDate;
        if (!rawDate || !dayjs(rawDate).isValid()) return sum;
        if (!months.includes(dayjs(rawDate).format("MMM-YY"))) return sum;

        return sum + (Number(item.taxableAmount) || Number(item.revenue) || Number(item.taxable) || 0);
      }, 0);

      const expense = expenseItems.reduce((sum, item) => {
        if (!item?.dueDate || !dayjs(item.dueDate).isValid()) return sum;
        if (!months.includes(dayjs(item.dueDate).format("MMM-YY"))) return sum;

        return sum + (Number(item.actualAmount) || 0);
      }, 0);

      return {
        fiscalYear,
        income,
        expense,
        profitLoss: income - expense,
      };
    });

    return summary;
  }, [revenueExpenseData]);

  const incomeExpenseData = [
    {
      name: "Income",
      data: [...baseIncomeData, ...historicalData.map((item) => item.income)],
    },
    {
      name: "Expense",
      data: [...baseExpenseData, ...historicalData.map((item) => item.expense)],
    },
  ];

  const incomeExpenseOptions = {
    chart: {
      id: "income-vs-expense-bar",
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },
    colors: ["#54C4A7", "#EB5C45"],
    legend: {
      show: true,
      position: "top",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 6,
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories:
        ["FY 2021-22", "FY 2022-23", "FY 2023-24", ...historicalData.map((item) => item.fiscalYear)],
    },
     yaxis: {
      title: {
        text: `Amount In Crores (${currency})`,
      },
      labels: {
        formatter: (val) => `${Math.round(val / 10000000)}`,
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val) => format(val),
      },
    },
  };

  const historicalTableData = [
    ...baseIncomeData,
    ...historicalData.map(item => item.income),
  ].map((incomeValue, index) => {
    const isBaseYear = index < 3;

    const name = isBaseYear
      ? `FY ${2021 + index}-${2022 + index}`
      : historicalData[index - 3].fiscalYear;

    const income = isBaseYear
      ? baseIncomeData[index]
      : historicalData[index - 3].income;

    const expense = isBaseYear
      ? baseExpenseData[index]
      : historicalData[index - 3].expense;

    const profitLoss = income - expense;

    return {
      srNo: index + 1,           // ← this is the clean fix
      name,
      totalIncome: format(income),
      totalExpense: format(expense),
      totalProfitLoss: format(profitLoss),
    };
  });

  return (
    <div className="flex flex-col gap-4 p-3 pt-3">
      <div className="overflow-hidden rounded-lg">
        <div className="relative h-44 w-full md:h-56 xl:h-64">
          <img
            src={investorBanner}
            alt="Investor dashboard banner"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-y-0 left-0 flex w-[54%] flex-col justify-center px-5 py-3 sm:px-7 lg:px-9">
            <p className="font-pmedium text-xs uppercase tracking-[0.02em] text-[#6c7cff] sm:text-base lg:text-lg">
              Investor Dashboard
            </p>
            <h1 className="mt-1 font-serif text-3xl font-semibold leading-[0.88] text-[#1234c9] sm:text-5xl lg:text-6xl">
              MARKET LEADER
            </h1>
            <p className="mt-1 font-serif text-xl font-semibold leading-[0.94] text-[#1234c9] sm:text-4xl lg:text-5xl">
              Indian Destination Workspace.
            </p>
            <p className="mt-2 font-pmedium text-xs uppercase text-[#6c7cff] sm:text-lg lg:text-2xl">
              WORK TO LIVE.
              <span className="ml-3 text-[#f04a4a]">LIVE TO WORK</span>
            </p>
          </div>
        </div>
      </div>
      {(showDashboardHome || showDetails) && canViewHistoricalPnlGraph && (
        <WidgetSection layout={1}>
          <WidgetSection
            border
            title={
              <BizNestTitle>{`HISTORICAL P&L - ${selectedHistoricalFiscalYear}`}</BizNestTitle>
            }
          >
            {isLoading ? (
              <div className="h-72 flex items-center justify-center">
                <CircularProgress />
              </div>
            ) : (
              <div
                className="cursor-pointer"
                onClick={() =>
                  navigate(
                    "/app/dashboard/investor-dashboard/historical-P&L",
                  )
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(
                      "/app/dashboard/investor-dashboard/historical-P&L",
                    );
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="View historical profit and loss details"
              >
                <NormalBarGraph
                  data={incomeExpenseData}
                  options={incomeExpenseOptions}
                  height={450}
                />
              </div>
            )}
          </WidgetSection>
        </WidgetSection>
      )}

      {showDashboardHome && (
        <InvestorDashboardCards
          format={format}
          hasPermission={hasPermission}
          navigate={navigate}
        />
      )}
      {(showDashboardHome || showIncomeExpensePage) && canViewIncomeExpenseGraph && (
        <div>
          <InvestorIncomeExpenseGraph
            showSummaryCards={canViewFinanceSummaryCards}
          />
        </div>
      )}
      {showUniqueClientsPage && canViewUniqueClientsGraph && (
          <div className="-mt-6">
            <InvestorUniqueClientsGraph />
          </div>
        )}

      {showInventoryPage && canViewInventoryOverview && (
        <InvestorOccupiedInventoryGraph
          hasPermission={hasPermission}
          className="-mt-6"
        />
      )}

      {visibleOperationalGraphs.some((key) =>
        operationalGraphsBeforeMeeting.includes(key) &&
          !(showDashboardHome && ["sector", "india"].includes(key)),
      ) && (
        <div className={showDashboardHome ? "-mt-6" : "mt-0.5"}>
            <InvestorOperationalCharts
              visibleCharts={visibleOperationalGraphs.filter((key) =>
              operationalGraphsBeforeMeeting.includes(key) &&
                !(showDashboardHome && ["sector", "india"].includes(key)) &&
                (key !== "desks" || !showDashboardHome),
              )}
              routes={operationalGraphRoutes}
              showDetails={!showDashboardHome}
            />
          </div>
        )}
      {showDashboardHome && visibleOperationalGraphs.includes("desks") && (
        <div className="-mt-2 grid w-full grid-cols-1 items-stretch gap-x-4 gap-y-4 px-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-rows-[425px]">
          <div className="flex h-full min-w-0 w-full flex-col">
            <InvestorOperationalCharts
              visibleCharts={["desks"]}
              routes={operationalGraphRoutes}
               flushLayout  
            />
          </div>
          {canViewAppreciationCenter && (
            <div className="flex h-full min-w-0 w-full flex-col">
              <InvestorAppreciationCenter />
            </div>
          )}
        </div>
      )}
      {(showDashboardHome || showAppreciationCenterPage) &&
        canViewAppreciationCenter && (
          <div
            className={showDashboardHome ? "-mt-6" : "mt-0.5"}
            hidden={showDashboardHome && visibleOperationalGraphs.includes("desks")}
          >
            <WidgetSection layout={1}>
              <InvestorAppreciationCenter />
            </WidgetSection>
          </div>
        )}
      {visibleMeetingGraphs.length > 0 && (
        <div className={showDashboardHome ? "-mt-6" : "mt-0.5"}>
          <WidgetSection layout={1}>
            <InvestorMeetingAnalytics visibleGraphs={visibleMeetingGraphs} />
          </WidgetSection>
        </div>
      )}
      {visibleOperationalGraphs.some(
        (key) => !operationalGraphsBeforeMeeting.includes(key),
      ) && (
        <div className={showDashboardHome ? "-mt-6" : "mt-0.5"}>
          <InvestorOperationalCharts
            visibleCharts={visibleOperationalGraphs.filter(
              (key) => !operationalGraphsBeforeMeeting.includes(key),
            )}
            routes={operationalGraphRoutes}
          />
        </div>
      )}


      {showDetails && (
        <WidgetSection layout={1}>
          <WidgetSection
            title={
              <BizNestTitle>{`HISTORICAL P&L DETAILS ${selectedHistoricalFiscalYear}`}</BizNestTitle>
            }
            border
          >
            <AgTable
              columns={[
                { field: "srNo", headerName: "Sr No", sort: "desc" },
                { field: "name", headerName: "Financial Year", flex: 1 },
               { field: "totalIncome", headerName: `Total Income (${currency})` },
                { field: "totalExpense", headerName: `Total Expense (${currency})` },
                {
                  field: "totalProfitLoss",
                  headerName: `Total Profit / Loss (${currency})`,
                },
              ]}
              hideFilter
              data={historicalTableData}
            />
          </WidgetSection>
        </WidgetSection>
      )}
    </div>
  );
};

export default InvestorDashboard;


// const InvestorDashboard = () => {
//   return (
//     <section className="rounded-lg bg-white p-6 shadow-sm">
//       <h1 className="text-2xl font-semibold text-gray-800">
//         Investor Dashboard
//       </h1>
//     </section>
//   );
// };

// export default InvestorDashboard;
