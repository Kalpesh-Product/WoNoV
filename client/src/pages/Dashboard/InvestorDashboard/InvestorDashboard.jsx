import AgTable from "../../../components/AgTable";
import WidgetSection from "../../../components/WidgetSection";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
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
import LeadsLayout from "../SalesDashboard/ViewClients/LeadsLayout";
import CheckAvailability from "../SalesDashboard/CoWorkingSeats/CheckAvailability";
import InvestorOperationalCharts from "./InvestorOperationalCharts";
import { useCurrency } from "../../../context/CurrencyContext";
import investorBanner from "../../../assets/investor/banner-investor.png";
import bizNestLogo from "../../../assets/biznest/biznest_logo.jpg";
import {
  MdBarChart,
  MdCalendarMonth,
  MdCalculate,
  MdGroups,
  MdMapsHomeWork,
  MdReceiptLong,
  MdTrendingDown,
  MdTrendingUp,
} from "react-icons/md";
import { BsFillDatabaseFill } from "react-icons/bs";
import { PiDesktopTowerFill } from "react-icons/pi";

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
const APPRECIATION_MONTHLY_INCREMENT = 700_000;
const APPRECIATION_PROJECTION_START_INDEX = 5;

const BizNestTitle = ({ children, prefix, monochrome = false }) => (
  <span className="normal-case">
    {prefix ? (
      <span className={`mr-1 ${monochrome ? "text-[#1E3D73]" : "text-[#1234c9]"}`}>
        {prefix}
      </span>
    ) : null}
    <span className={monochrome ? "text-[#1E3D73]" : "text-[#1234c9]"}>BI</span>
    <span className={monochrome ? "text-[#1E3D73]" : "text-[#e33434]"}>Z</span>
    <span className={monochrome ? "text-[#1E3D73]" : "text-[#1234c9]"}> Nest</span>
    {children ? (
      <span className={`ml-1 ${monochrome ? "text-[#1E3D73]" : "text-[#1234c9]"}`}>
        {children}
      </span>
    ) : null}
  </span>
);

const InvestorBarsIcon = ({ className = "" }) => (
  <span className={`flex h-8 w-8 items-end justify-center gap-1 ${className}`}>
    <span className="h-3 w-1.5 rounded-full bg-current" />
    <span className="h-5 w-1.5 rounded-full bg-current" />
    <span className="h-7 w-1.5 rounded-full bg-current" />
  </span>
);

const InvestorDashboardCards = ({
  format,
  hasPermission,
  navigate,
  totalInventory = 0,
  occupiedInventory = 0,
  inventoryOccupancyPercent = 0,
  assetValueOwned = APPRECIATION_BASE_VALUATION,
  incomePerSqFt = 0,
  expensePerSqFt = 0,
  averageUniqueClients = 0,
  currentFiscalYear = fiscalYearLabel(dayjs()),
  projectedRevenue = 0,
  projectedExpense = 0,
  projectedProfitLoss = 0,
  projectedRevenueGrowth = 0,
  compactPercentageChips = false,
}) => {
  const cards = [
    {
      title: "Projected Revenue",
      period: currentFiscalYear,
      value: format(projectedRevenue),
      suffix: `${projectedRevenueGrowth.toFixed(1)}%`,
      suffixTone: "text-[#13a573]",
      suffixChip: true,
      trendValue: projectedRevenueGrowth,
      permission: PERMISSIONS.INVESTOR_PROJECTED_REVENUE_CARD.value,
      clickable: false,
      icon: InvestorBarsIcon,
      tone: "blue",
      swapTitleValueStyle: true,
      titleClassName: "mb-1 whitespace-nowrap text-[15px] font-pregular",
      valueClassName: "text-lg font-pmedium",
      periodClassName: "mb-2",
      periodSemibold: true,
    },
    {
      title: "Projected Expense",
      period: currentFiscalYear,
      value: format(projectedExpense),
      permission: PERMISSIONS.INVESTOR_PROJECTED_EXPENSE_CARD.value,
      clickable: false,
      icon: MdReceiptLong,
      tone: "red",
      valueTone: "text-[#f04a4a]",
      swapTitleValueStyle: true,
      titleClassName: "mb-1 text-base font-pregular",
      valueClassName: "text-lg font-pmedium",
      periodClassName: "mb-2",
      periodSemibold: true,
    },
    {
      title: "Projected Profit/Loss",
      period: currentFiscalYear,
      value: format(projectedProfitLoss),
      permission: PERMISSIONS.INVESTOR_PROJECTED_PROFIT_CARD.value,
      clickable: false,
      icon: InvestorBarsIcon,
      tone: "green",
      valueTone:
        projectedProfitLoss >= 0 ? "text-[#12a573]" : "text-[#f04a4a]",
      swapTitleValueStyle: true,
      titleClassName: "mb-1 text-base font-pregular",
      valueClassName: "text-lg font-pmedium",
      periodClassName: "mb-2",
      periodSemibold: true,
    },
    {
      title: "Average Unique Clients",
      period: currentFiscalYear,
      value: averageUniqueClients.toFixed(2),
      permission: PERMISSIONS.INVESTOR_AVERAGE_UNIQUE_CLIENTS_CARD.value,
      clickable: false,
      icon: MdGroups,
      tone: "sky",
      swapTitleValueStyle: true,
      titleClassName: "mb-1 text-base font-pregular",
      valueClassName: "text-lg font-pmedium",
      periodClassName: "mb-2",
      periodSemibold: true,
    },
    {
      title: "Total Inventory",
      value: String(totalInventory),
      permission: PERMISSIONS.INVESTOR_TOTAL_INVENTORY_CARD.value,
      route: "/app/dashboard/investor-dashboard",
      icon: BsFillDatabaseFill,
      tone: "lightNavy",
      swapTitleValueStyle: true,
      titleClassName: "mb-1 text-base font-pregular",
      valueClassName: "text-lg font-pmedium",
    },
    {
      title: "Occupied Inventory",
      value: String(occupiedInventory),
      suffix: `${inventoryOccupancyPercent}%`,
      suffixChip: true,
      trendValue: inventoryOccupancyPercent,
      permission: PERMISSIONS.INVESTOR_OCCUPIED_INVENTORY_CARD.value,
      route: "/app/dashboard/investor-dashboard",
      icon: PiDesktopTowerFill,
      tone: "blue",
      swapTitleValueStyle: true,
      titleClassName: "mb-1 whitespace-nowrap text-[15px] font-pregular",
      valueClassName: "text-lg font-pmedium",
    },
    {
      title: "Per Sq. Ft.",
      metrics: [
        { label: `Revenue - ${format(incomePerSqFt)}`, tone: "text-[#13a573]" },
        { label: `Expense - ${format(expensePerSqFt)}`, tone: "text-[#f04a4a]" },
      ],
      permission: PERMISSIONS.INVESTOR_PER_SQ_FT_CARD.value,
      clickable: false,
      icon: MdCalculate,
      tone: "lightNavy",
      swapTitleValueStyle: true,
      titleClassName: "mb-1 text-base font-pregular",
      metricsClassName: "mt-1 flex items-center gap-2 text-sm font-pmedium",
    },
    {
      title: "Asset Value Owned",
      value: format(assetValueOwned),
      permission: PERMISSIONS.INVESTOR_ASSET_VALUE_OWNED_CARD.value,
      clickable: false,
      icon: MdMapsHomeWork,
      tone: "sky",
      swapTitleValueStyle: true,
      titleClassName: "mb-1 text-base font-pregular",
      valueClassName: "text-lg font-pmedium",
    },
  ];

  const toneClasses = {
    blue: "bg-[#eaf4ff] text-[#1d7ed0]",
    pink: "bg-[#fff0f6] text-[#e63875]",
    red: "bg-[#fff0f0] text-[#f04a4a]",
    green: "bg-[#eafbf3] text-[#12a573]",
    sky: "bg-[#ecf9ff] text-[#13a9e8]",
    indigo: "bg-[#edf1ff] text-[#244ad8]",
    navy: "bg-[#eaf0f8] text-[#1E3D73]",
    lightNavy: "bg-[#eaf0f8] text-[#3F6291]",
  };

  const visibleCards = cards.filter((card) => hasPermission(card.permission));

  if (visibleCards.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {visibleCards.map((card) => {
        const Icon = card.icon;
        const CardElement = card.clickable === false ? "div" : "button";

        return (
          <CardElement
            key={card.title}
            {...(card.clickable === false
              ? {}
              : { type: "button", onClick: () => navigate(card.route) })}
            className={`relative flex min-h-[92px] items-center rounded-lg border border-[#e8ecf4] bg-white px-5 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
              card.suffix ? "gap-2" : "gap-4"
            }`}
          >
            <span
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${
                toneClasses[card.tone]
              }`}
            >
              <Icon size={34} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex w-full items-center gap-2">
                <span
                  className={`block leading-tight text-[#1E3D73] ${
                    card.titleClassName ||
                    (card.swapTitleValueStyle
                      ? "text-base font-semibold"
                      : "text-sm font-pmedium")
                  }`}
                >
                  {card.title}
                </span>
                {card.suffix && (
                  <span
                    className={`flex shrink-0 items-center font-semibold ${
                      compactPercentageChips
                        ? "gap-0.5 text-[10px]"
                        : "ml-auto gap-1 text-sm"
                    } ${
                      card.suffixChip
                        ? card.trendValue >= 0
                          ? `rounded-full bg-[#e8f8ed] text-[#169b4d] ${
                              compactPercentageChips
                                ? "px-1.5 py-0.5"
                                : "px-2.5 py-1"
                            }`
                          : `rounded-full bg-[#fdeaea] text-[#d64545] ${
                              compactPercentageChips
                                ? "px-1.5 py-0.5"
                                : "px-2.5 py-1"
                            }`
                        : card.suffixTone || "text-[#13a573]"
                    }`}
                  >
                    {card.suffixChip &&
                      (card.trendValue >= 0 ? (
                        <MdTrendingUp
                          size={compactPercentageChips ? 12 : 18}
                          aria-hidden="true"
                        />
                      ) : (
                        <MdTrendingDown
                          size={compactPercentageChips ? 12 : 18}
                          aria-hidden="true"
                        />
                      ))}
                    {card.suffix}
                  </span>
                )}
              </span>
              {card.period && (
                <span
                  className={`block text-xs text-[#58709A] ${
                    card.periodSemibold ? "font-semibold" : "font-pregular"
                  } ${card.periodClassName || ""}`}
                >
                  {card.period}
                </span>
              )}
              {card.metrics ? (
                <span
                  className={
                    card.metricsClassName ||
                    "mt-2 flex items-center gap-2 text-sm font-semibold"
                  }
                >
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
                  className={`mt-1 block ${
                    card.valueClassName ||
                    (card.swapTitleValueStyle
                      ? "text-sm font-pmedium"
                      : "text-xl font-pbold")
                  } ${
                    card.valueTone || "text-[#1E3D73]"
                  }`}
                >
                  {card.value}
                </span>
              )}
            </span>
          </CardElement>
        );
      })}
    </div>
  );
};

const InvestorSnapshotSection = ({
  format,
  hasPermission,
  perSqFtFinancialsByYear = {},
  currentAssetValueOwned = APPRECIATION_BASE_VALUATION,
  currentProjectedFinancials = {},
  actualFinancialsByYear = {},
}) => {
  const [calendarAnchorEl, setCalendarAnchorEl] = useState(null);
  const [calendarValue, setCalendarValue] = useState(() => dayjs("2025-04-01"));
  const isCalendarOpen = Boolean(calendarAnchorEl);
  const getPerSqFtRows = (fiscalYear) => {
    const values = perSqFtFinancialsByYear[fiscalYear] || {};

    return [
      {
        label: "Per Sq. Ft. Income",
        value: format(values.income || 0),
        tone: "text-[#12a573]",
      },
      {
        label: "Per Sq. Ft. Expense",
        value: format(values.expense || 0),
        tone: "text-[#f04a4a]",
      },
      {
        label: "Per Sq. Ft. Profit/Loss",
        value: format(values.profitLoss || 0),
        tone:
          (values.profitLoss || 0) >= 0
            ? "text-[#12a573]"
            : "text-[#f04a4a]",
      },
    ];
  };
  const cards = [
    {
      title: "FY - 2026-27 - PROJECTIONS",
      icon: InvestorBarsIcon,
      tone: "text-[#12a573] bg-[#eafbf3]",
      rows: [
        { label: "Revenues", value: format(currentProjectedFinancials.revenue || 0), tone: "text-[#12a573]" },
        { label: "Expenses", value: format(currentProjectedFinancials.expense || 0), tone: "text-[#f04a4a]" },
        {
          label: "Profit/Loss",
          value: format(currentProjectedFinancials.profitLoss || 0),
          tone:
            (currentProjectedFinancials.profitLoss || 0) >= 0
              ? "text-[#12a573]"
              : "text-[#f04a4a]",
        },
        { label: "Exit Inventory", value: "1,000 Desks", tone: "text-[#12a573]" },
        { label: "Asset Owned", value: format(currentAssetValueOwned), tone: "text-[#12a573]" },
      ],
      perSqFtRows: getPerSqFtRows("FY 2026-27"),
    },
    {
      title: "FY - 2025-26 - PROJECTIONS",
      icon: MdCalendarMonth,
      tone: "text-[#3F6291] bg-[#eaf0f8]",
      hasCalendar: true,
      rows: [
        { label: "Revenues", value: format(actualFinancialsByYear["FY 2025-26"]?.income || 0), tone: "text-[#12a573]" },
        { label: "Expenses", value: format(actualFinancialsByYear["FY 2025-26"]?.expense || 0), tone: "text-[#f04a4a]" },
        {
          label: "Profit/Loss",
          value: format(actualFinancialsByYear["FY 2025-26"]?.profitLoss || 0),
          tone:
            (actualFinancialsByYear["FY 2025-26"]?.profitLoss || 0) >= 0
              ? "text-[#12a573]"
              : "text-[#f04a4a]",
        },
        { label: "Exit Inventory", value: "850 Desks", tone: "text-[#12a573]" },
        { label: "Asset Owned", value: `${format(35_000_000)}+`, tone: "text-[#12a573]" },
      ],
      perSqFtRows: getPerSqFtRows("FY 2025-26"),
    },
    {
      title: "FY - 2024-25 - PROJECTIONS",
      icon: InvestorBarsIcon,
      tone: "text-[#3F6291] bg-[#eaf0f8]",
      rows: [
        { label: "Revenues", value: format(actualFinancialsByYear["FY 2024-25"]?.income || 0), tone: "text-[#12a573]" },
        { label: "Expenses", value: format(actualFinancialsByYear["FY 2024-25"]?.expense || 0), tone: "text-[#f04a4a]" },
        {
          label: "Profit/Loss",
          value: format(actualFinancialsByYear["FY 2024-25"]?.profitLoss || 0),
          tone:
            (actualFinancialsByYear["FY 2024-25"]?.profitLoss || 0) >= 0
              ? "text-[#12a573]"
              : "text-[#f04a4a]",
        },
        { label: "Exit Inventory", value: "500 Desks", tone: "text-[#12a573]" },
        { label: "Asset Owned", value: `${format(25_000_000)}+`, tone: "text-[#12a573]" },
      ],
      perSqFtRows: getPerSqFtRows("FY 2024-25"),
    },
  ];

  if (!hasPermission(PERMISSIONS.INVESTOR_BIZNEST_3_YEARS_SNAPSHOT.value)) {
    return null;
  }

  return (
    <WidgetSection
      border
      borderColor="#1E3D73"
      bodyBorderColor="#9FB2CF"
      title={
        <span className="inline-flex h-5 items-center gap-2 text-[#1E3D73]">
          <img
            src={bizNestLogo}
            alt="BIZ Nest"
            className="block h-5 w-auto object-contain"
          />
          <span className="leading-5">3 YEARS SNAPSHOT</span>
        </span>
      }
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div key={card.title} className="flex flex-col gap-3">
              <div className="rounded-lg border border-[#e8ecf4] bg-white p-5 text-left shadow-sm">
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
                  <span className="text-base font-pmedium text-[#1E3D73]">
                    {card.title}
                  </span>
                </div>
                <div className="flex flex-col divide-y divide-[#edf1f6]">
                  {card.rows.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between gap-4 py-2 text-sm"
                    >
                      <span className="text-sm font-pregular text-[#1E3D73]">
                        {row.label}
                      </span>
                      <span className={`text-sm font-pregular ${row.tone}`}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-[#e8ecf4] bg-white px-5 py-3 text-left shadow-sm">
                <div className="flex flex-col divide-y divide-[#edf1f6]">
                  {card.perSqFtRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-4 py-2 text-sm"
                  >
                    <span className="text-sm font-pregular text-[#1E3D73]">
                      {row.label}
                    </span>
                    <span className={`text-sm font-pregular ${row.tone}`}>
                      {row.value}
                    </span>
                  </div>
                  ))}
                </div>
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
    queryKey: ["simpleRevenue"],
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
        normalizedStatus: isMeetingFinancePaid(item) ? "paid" : "unpaid",
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
        revenue: getVirtualOfficeReportingAmount(item),
        date: item.rentDate,
        normalizedStatus: getNormalizedPaymentStatus(
          item.rentStatus ?? item.status,
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
    const today = dayjs();
    const fiscalStartYear = today.month() >= 3 ? today.year() : today.year() - 1;
    const fiscalStart = dayjs(`${fiscalStartYear}-04-01`).startOf("month");
    const fiscalEnd = fiscalStart.add(11, "month");
    const projectionStart = today.startOf("month");
    const completedMonthCount = projectionStart.diff(fiscalStart, "month");
    const projectedVerticals = [
      "Co-Working",
      "Virtual Office",
      "Meeting",
      "Alternate",
    ];

    const completedFiscalYearData = paidRevenueData.filter((item) => {
      const date = dayjs(item.date);
      return (
        date.isValid() &&
        !date.isBefore(fiscalStart, "month") &&
        date.isBefore(projectionStart, "month")
      );
    });

    const averageByVertical = Object.fromEntries(
      projectedVerticals.map((vertical) => {
        const total = completedFiscalYearData
          .filter((item) => item.vertical === vertical)
          .reduce((sum, item) => sum + getNumericAmount(item.revenue), 0);

        return [
          vertical,
          completedMonthCount > 0 ? Math.round(total / completedMonthCount) : 0,
        ];
      }),
    );

    const projectedRecords = [];
    for (
      let month = projectionStart;
      !month.isAfter(fiscalEnd, "month");
      month = month.add(1, "month")
    ) {
      projectedVerticals.forEach((vertical) => {
        projectedRecords.push({
          vertical,
          revenue: averageByVertical[vertical],
          date: month.format("YYYY-MM-DD"),
          normalizedStatus: "projected",
          isProjected: true,
        });
      });
    }

    return [...completedFiscalYearData, ...projectedRecords].filter(
      (item) => item.vertical !== "Workation",
    );
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
      graphTitle={
        <span className="inline-flex h-5 items-center gap-2 text-[#1E3D73]">
          <img
            src={bizNestLogo}
            alt="BIZ Nest"
            className="block h-5 w-auto object-contain"
          />
          <span className="leading-5">
            {`Monthly Income Breakdown Distribution - ${fiscalYearLabel(dayjs())}`}
          </span>
        </span>
      }
      chartOptions={options}
      hideYearNavigation
      investorVariant
      hideHeaderAmounts
      showFiscalYearInTitle={false}
    />
  );
};

const InvestorOccupiedInventoryGraph = ({ hasPermission, className = "" }) => {
  const occupancyGraphRoutes = {
    sector: "/app/dashboard/investor-dashboard/sector-wise-occupancy",
    india: "/app/dashboard/investor-dashboard/india-wise-occupancy",
  };
  const visibleOccupancyGraphs = [
    hasPermission(PERMISSIONS.INVESTOR_SECTOR_WISE_OCCUPANCY.value) && "sector",
    hasPermission(PERMISSIONS.INVESTOR_INDIA_WISE_OCCUPANCY.value) && "india",
  ].filter(Boolean);

  return (
    <div className={className}>
      <CheckAvailability
        hideCheckInventory
        graphHeight={390}
        noOuterPadding
        investorGraphStyle
        hideSummaryCards
        graphTitle={
          <span className="inline-flex items-center gap-2 text-[#1E3D73]">
            <img
              src={bizNestLogo}
              alt="BIZ Nest"
              className="h-[1em] w-auto object-contain"
            />
            <span>- INVENTORY VS OCCUPANCY</span>
          </span>
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
const isMeetingFinancePaid = (item) =>
  getNormalizedPaymentStatus(item?.financeStatus) === "verified";
const isBeforeVirtualOfficeUploadLogicStart = (value) => {
  const date = dayjs(value);
  return date.isValid() && date.isBefore(dayjs("2026-09-01"), "month");
};
const getVirtualOfficeReportingAmount = (item) =>
  isBeforeVirtualOfficeUploadLogicStart(
    item?.rentDate || item?.invoiceUploadedAt || item?.createdAt,
  )
    ? getNumericAmount(item?.revenue ?? item?.taxableAmount)
    : getNumericAmount(
        item?.reportingAmount ??
          item?.receivedAmount ??
          item?.revenue ??
          item?.taxableAmount,
      );
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
  const [valuationAsOf, setValuationAsOf] = useState(() => dayjs());
  const currentFiscalYear = fiscalYearLabel(valuationAsOf);

  useEffect(() => {
    const nextMonth = valuationAsOf.add(1, "month").startOf("month");
    const timer = window.setTimeout(
      () => setValuationAsOf(dayjs()),
      nextMonth.diff(dayjs()) + 1000,
    );

    return () => window.clearTimeout(timer);
  }, [valuationAsOf]);

  const valuationMonths = useMemo(
    () =>
      fiscalYearMonths(currentFiscalYear)
        .slice(APPRECIATION_PROJECTION_START_INDEX)
        .map((month, index) => ({
          month,
          amount:
            APPRECIATION_BASE_VALUATION +
            APPRECIATION_MONTHLY_INCREMENT * index,
        })),
    [currentFiscalYear],
  );
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
  const marchValuation = valuationMonths.find(({ month }) =>
    month.startsWith("Mar-"),
  );
  const maximumValuationInCrores = Math.max(
    0,
    ...valuationMonths.map(({ amount }) => amount / 10_000_000),
  );
  const valuationScaleMaximum = Math.max(
    8,
    Math.ceil(maximumValuationInCrores / 2) * 2,
  );

  const options = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },

    colors: ["#3CB371"],

    legend: {
      show: false,
    },

    plotOptions: {
      bar: {
        borderRadius: 5,
        columnWidth: "38%",
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
      enabled: true,
      formatter: (_value, { dataPointIndex }) => {
        const amount = valuationMonths[dataPointIndex]?.amount || 0;
        return format(amount);
      },
      offsetY: -20,
      style: {
        colors: ["#1E3D73"],
        fontSize: "12px",
        fontWeight: 600,
      },
    },

    states: {
      hover: { filter: { type: "none" } },
      active: { filter: { type: "none" } },
    },

    xaxis: {
      crosshairs: { show: false },
      labels: {
        style: {
          colors: "#1E3D73",
        },
      },
    },

    yaxis: {
      min: 0,
      max: valuationScaleMaximum,
      tickAmount: valuationScaleMaximum / 2,
      title: {
        text: `Property Owned (${currency})`,
        style: {
          color: "#1E3D73",
        },
      },

      labels: {
        formatter: (value) => Number(value).toFixed(0),
        style: {
          colors: "#1E3D73",
        },
      },
    },

    tooltip: {
      custom: ({ dataPointIndex }) => {
        const valuation = valuationMonths[dataPointIndex];
        const month = valuation?.month;

        return (
          `<div style="min-width:160px;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 14px rgba(15, 23, 42, 0.18);border:1px solid #e5e7eb;">` +
          `<div style="background:#eef2f6;color:#1f2937;font-size:12px;padding:8px 12px;border-bottom:1px solid #dbe1e8;white-space:nowrap;">${month || ""}</div>` +
          `<div style="display:flex;align-items:center;gap:8px;padding:10px 12px;font-size:12px;color:#111827;"><span style="width:10px;height:10px;flex:0 0 10px;border-radius:50%;background:#3CB371;"></span><span>Asset:&nbsp;&nbsp;<span style="font-weight:700;">${valuation ? format(valuation.amount) : "-"}</span></span></div>` +
          `</div>`
        );
      },
    },
  };

  return (
    <div>
      <YearlyGraph
        title={
          <span className="inline-flex items-center gap-2 text-[#1E3D73]">
            <span>REAL ESTATE OWNED BY</span>
            <img
              src={bizNestLogo}
              alt="BIZ Nest"
              className="h-5 w-auto object-contain"
            />
            <span>{`- ${currentFiscalYear}`}</span>
          </span>
        }
        data={graphData}
        options={options}
        currentYear={currentFiscalYear}
        categories={valuationMonths.map(({ month }) => month)}
        headerRightContent={
          marchValuation ? (
            <div className="flex items-center justify-center gap-1 rounded-lg border border-[#aec6fb] bg-[#dbe4ff] px-3 py-2 text-body font-pmedium text-[#274784]">
              <span>REAL ESTATE VALUE :</span>
              <span>{format(marchValuation.amount)}</span>
            </div>
          ) : null
        }
        hideYearNavigation
        chartHeight={360}
        refreshOnDataChange
        sectionBorderColor="#1E3D73"
        sectionBodyBorderColor="#9FB2CF"
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
          ? currentDate.month() - 3
          : currentDate.month() + 9
        : financialYear < currentFinancialYear
          ? 12
          : 1;

    return `AVERAGE MONTHLY UNIQUE CLIENT : ${(
      count / Math.max(elapsedMonths, 1)
    ).toFixed(2)}`;
  };

  return (
    <LeadsLayout
      data={clientsByMonth}
      hideAccordion
      title={
        <span className="inline-flex items-center gap-2 text-[#1E3D73]">
          <img
            src={bizNestLogo}
            alt="BIZ Nest"
            className="h-[1em] w-auto object-contain"
          />
          <span>UNIQUE CLIENTS</span>
        </span>
      }
      titleAmount={averageMonthlyUniqueClientTitle}
      hideMonthAxisTitle
      noOuterPadding
      investorBlueStyle
      investorTitleAmountChip
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

const InvestorIncomeExpenseGraph = ({
  assetValueOwned,
  projectedFinancials,
  snapshotAssetValueOwned = assetValueOwned,
}) => {
  const { currency, convert, format } = useCurrency();
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

  const { data: budgetData = [] } = useQuery({
    queryKey: ["budgetData", "investor-income-expense"],
    queryFn: async () => {
      const response = await axios.get("/api/budget/company-budget", {
        params: { view: "dashboard" },
      });
      return Array.isArray(response.data?.allBudgets) ? response.data.allBudgets : [];
    },
  });
  const { data: snapshotRevenue = {} } = useQuery({
    queryKey: ["finance-dashboard-simpleRevenue"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/simple-consolidated-revenue");
      return response.data || {};
    },
  });
  const totalSqft = useMemo(
    () =>
      revenueExpenseData
        .filter((item) => item?.units)
        .flatMap((item) => asArray(item.units))
        .reduce((total, unit) => total + (Number(unit?.sqft) || 0), 0),
    [revenueExpenseData],
  );
  const snapshotIncomeSources = useMemo(
    () => [
      ...(snapshotRevenue.meetingRevenue || []).map((item) => ({
        amount: item.taxable,
        date: item.date,
        status: isMeetingFinancePaid(item) ? "paid" : "unpaid",
      })),
      ...(snapshotRevenue.alternateRevenues || []).map((item) => ({
        amount: item.taxableAmount,
        date: item.invoiceCreationDate,
        status: item.status,
      })),
      ...(snapshotRevenue.virtualOfficeRevenues || []).map((item) => ({
        amount: getVirtualOfficeReportingAmount(item),
        date: item.rentDate,
        status: item.rentStatus ?? item.status,
      })),
      ...(snapshotRevenue.workationRevenues || []).map((item) => ({
        amount: item.taxableAmount,
        date: item.date,
        status: item.status,
      })),
      ...(snapshotRevenue.coworkingRevenues || []).map((item) => ({
        amount: item.revenue,
        date: item.rentDate,
        status: item.rentStatus,
      })),
    ],
    [snapshotRevenue],
  );
  const actualFinancialsByYear = useMemo(() => {
    const yearlyFinancials = {};
    snapshotIncomeSources.forEach((item) => {
      if (
        !item.date ||
        !dayjs(item.date).isValid() ||
        getNormalizedPaymentStatus(item.status) !== "paid"
      ) {
        return;
      }

      const fiscalYear = fiscalYearLabel(item.date);
      yearlyFinancials[fiscalYear] ||= { income: 0, expense: 0 };
      yearlyFinancials[fiscalYear].income += getNumericAmount(item.amount);
    });
    budgetData.forEach((item) => {
      if (!item?.dueDate || !dayjs(item.dueDate).isValid()) return;
      const fiscalYear = fiscalYearLabel(item.dueDate);
      yearlyFinancials[fiscalYear] ||= { income: 0, expense: 0 };
      yearlyFinancials[fiscalYear].expense += Number(item.actualAmount) || 0;
    });

    return Object.fromEntries(
      Object.entries(yearlyFinancials).map(([fiscalYear, values]) => [
        fiscalYear,
        {
          ...values,
          profitLoss: values.income - values.expense,
        },
      ]),
    );
  }, [budgetData, snapshotIncomeSources]);
  const perSqFtFinancialsByYear = useMemo(() => {
    if (!totalSqft) return {};

    return Object.fromEntries(
      Object.entries(actualFinancialsByYear).map(([fiscalYear, values]) => [
        fiscalYear,
        {
          income: values.income / totalSqft,
          expense: values.expense / totalSqft,
          profitLoss: values.profitLoss / totalSqft,
        },
      ]),
    );
  }, [actualFinancialsByYear, totalSqft]);

 const {
    series,
    projectedIncomeTotal,
    projectedExpenseTotal,
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

    snapshotIncomeSources.forEach((item) => {
      if (getNormalizedPaymentStatus(item.status) !== "paid") return;
      addAmount(incomeByYear, item.date, item.amount);
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
    const projectionAveragesByYear = new Map();
    const currentFiscalMonthIndex = fiscalMonthIndex(dayjs());
    const graphSeries = [...years].flatMap((group) => {
      const incomeValues = incomeByYear.get(group) || Array(12).fill(0);
      const expenseValues = expenseByYear.get(group) || Array(12).fill(0);
      const isCurrentYear = group === currentFiscalYear;
      const completedMonthCount = isCurrentYear ? currentFiscalMonthIndex : 12;
      const averageIncome = completedMonthCount
        ? Math.round(
            incomeValues
              .slice(0, completedMonthCount)
              .reduce((sum, value) => sum + value, 0) / completedMonthCount,
          )
        : 0;
      const averageExpense = completedMonthCount
        ? Math.round(
            expenseValues
              .slice(0, completedMonthCount)
              .reduce((sum, value) => sum + value, 0) / completedMonthCount,
          )
        : 0;
      const projectedFlags = incomeValues.map(
        (_incomeAmount, monthIndex) =>
          isCurrentYear && monthIndex >= currentFiscalMonthIndex,
      );
      projectedMonthsByYear.set(group, projectedFlags);
      projectionAveragesByYear.set(group, {
        income: averageIncome,
        expense: averageExpense,
      });
      const incomeGraphValues = incomeValues.map((incomeAmount, monthIndex) =>
        projectedFlags[monthIndex] ? averageIncome : incomeAmount,
      );
      const expenseGraphValues = expenseValues.map((expenseAmount, monthIndex) =>
        projectedFlags[monthIndex] ? averageExpense : expenseAmount,
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
    const selectedProjectionAverages = projectionAveragesByYear.get(
      selectedFiscalYear,
    ) || { income: 0, expense: 0 };

    return {
      series: graphSeries,
      totals: {
        income: income.reduce((sum, value) => sum + value, 0),
        expense: expense.reduce((sum, value) => sum + value, 0),
      },
      projectedIncomeTotal: selectedProjectionFlags.reduce(
        (sum, isProjected, monthIndex) =>
          sum +
          (isProjected
            ? selectedProjectionAverages.income
            : income[monthIndex] || 0),
        0,
      ),
      projectedExpenseTotal: selectedProjectionFlags.reduce(
        (sum, isProjected, monthIndex) =>
          sum +
          (isProjected
            ? selectedProjectionAverages.expense
            : expense[monthIndex] || 0),
        0,
      ),
      projectionFlags: selectedProjectionFlags,
    };
  }, [budgetData, currentFiscalYear, selectedFiscalYear, snapshotIncomeSources]);
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
  const projectionAxisStep = 2_500_000;
  const highestProjectionValue = Math.max(
    0,
    ...series.flatMap((item) => item.data.map((value) => Number(value) || 0)),
  );
  const projectionAxisMax = Math.max(
    7_500_000,
    Math.ceil(highestProjectionValue / projectionAxisStep) * projectionAxisStep,
  );
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
        dataLabels: { position: "top" },
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["#ffffff"],
    },
    dataLabels: {
      enabled: true,
      formatter: (value) =>
        Number(value) > 0
          ? currency === "INR"
            ? `${format(value / 100_000, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}L`
            : format(value, {
                notation: "compact",
                maximumFractionDigits: 2,
              })
          : "",
      offsetY: -20,
      style: {
        colors: ["#1E3D73"],
        fontSize: "12px",
        fontWeight: 600,
      },
      background: { enabled: false },
    },
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
          colors: "#1E3D73",
        },
      },
    },
    yaxis: {
      min: 0,
      max: projectionAxisMax,
      tickAmount: projectionAxisMax / projectionAxisStep,
      forceNiceScale: false,
      title: {
        text:
          currency === "INR"
            ? "Amount In Lakhs (INR)"
            : `Amount In Thousands (${currency})`,
        style: {
          color: "#1E3D73",
        },
      },
      labels: {
        show: true,
        style: {
          colors: "#1E3D73",
        },
        formatter: (value) =>
          currency === "INR"
            ? `${Math.round(value / 100_000)}`
            : `${Math.round(convert(value) / 1_000)}`,
      },
    },
    tooltip: { y: { formatter: (value) => format(value) } },
  };

  const projectionLegend = (
    <div className="flex items-center justify-center gap-4 text-xs">
      {[
        { label: "Income", color: INVESTOR_INCOME_COLOR },
        { label: "Expense", color: INVESTOR_EXPENSE_COLOR },
        { label: "Projected", color: INVESTOR_PROJECTED_COLOR },
      ].map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => toggleProjectionLegendItem(item.label)}
          className={`flex items-center gap-1.5 text-[#1E3D73] ${
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
          <span className="inline-flex items-center gap-2 text-[#1E3D73]">
            <img
              src={bizNestLogo}
              alt="BIZ Nest"
              className="h-[1em] w-auto object-contain"
            />
            <span>{`PROJECTIONS - ${selectedFiscalYear}`}</span>
          </span>
        }
        chartHeight={360}
        chartTopContent={projectionLegend}
        headerRightContent={
          <div className="flex items-center justify-center gap-2 rounded-lg border border-[#aec6fb] bg-[#dbe4ff] px-3 py-2 text-body font-pmedium uppercase text-[#274784]">
            <span>Projection:</span>
            <span>{format(projectedIncomeTotal + projectedExpenseTotal)}</span>
          </div>
        }
        currentYear={selectedFiscalYear}
        onYearChange={setSelectedFiscalYear}
        hideYearNavigation
        sectionBorderColor="#1E3D73"
        sectionBodyBorderColor="#9FB2CF"
      />
      <InvestorSnapshotSection
        format={format}
        hasPermission={hasPermission}
        perSqFtFinancialsByYear={perSqFtFinancialsByYear}
        currentAssetValueOwned={snapshotAssetValueOwned}
        currentProjectedFinancials={projectedFinancials}
        actualFinancialsByYear={actualFinancialsByYear}
      />
      <InvestorAnnualMonthlyMixIncome hasPermission={hasPermission} />
      <InvestorOccupiedInventoryGraph hasPermission={hasPermission} />
    </div>      
  );
};

const InvestorDashboard = () => {
  const { format } = useCurrency();
  const axios = useAxiosPrivate();
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission } = useUserPermissions();
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

  const showIncomeExpensePage = location.pathname.endsWith("/income-expense");
  const showUniqueClientsPage = location.pathname.endsWith("/unique-clients");
  const showAppreciationCenterPage = location.pathname.endsWith(
    "/real-estate-owned-by-biznest",
  );
  const operationalGraphRoutes = {
    sector: "/app/dashboard/investor-dashboard/sector-wise-occupancy",
    gender: "/app/dashboard/investor-dashboard/gender-wise-occupancy",
    age: "/app/dashboard/investor-dashboard/age-wise-occupancy",
    india: "/app/dashboard/investor-dashboard/india-wise-occupancy",
  };
  const showDashboardHome = location.pathname.endsWith("/investor-dashboard");
  const { data: inventoryUnits = [] } = useQuery({
    queryKey: ["workLocations"],
    queryFn: async () => {
      const response = await axios.get("/api/company/fetch-units");
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: showDashboardHome,
  });
  const { data: dashboardUniqueClients = {} } = useQuery({
    queryKey: ["investor-unique-clients"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/consolidated-clients");
      return response.data && typeof response.data === "object"
        ? response.data
        : {};
    },
    enabled: showDashboardHome,
  });
  const averageUniqueClients = useMemo(() => {
    const currentDate = dayjs();
    const currentFiscalYear =
      currentDate.month() >= 3 ? currentDate.year() : currentDate.year() - 1;
    const elapsedMonths =
      currentDate.month() >= 3 ? currentDate.month() - 2 : 12;

    const count = Object.entries(dashboardUniqueClients).reduce(
      (total, [key, clients]) =>
        total +
        asArray(clients).filter((client) => {
          let clientType = key.replace(/Clients$/, "");
          if (clientType === "meeting") {
            const purpose = String(client?.purposeOfVisit || "")
              .trim()
              .toLowerCase();
            if (purpose === "meeting room booking") clientType = "externalMeeting";
            else if (purpose === "half-day pass" || purpose === "full-day pass") {
              clientType = "openDesk";
            }
          }
          if (clientType === "coworking" && client?.service?.serviceName) {
            const serviceName = client.service.serviceName.toLowerCase();
            if (serviceName.includes("workation")) clientType = "workation";
            else if (serviceName.includes("living")) clientType = "coliving";
          }
          if (
            !["coworking", "virtualOffice", "externalMeeting", "openDesk"].includes(
              clientType,
            )
          ) {
            return false;
          }

          const rawDate =
            clientType === "coworking"
              ? client.startDate
              : clientType === "virtualOffice"
                ? client.termStartDate || client.rentDate
                : client.dateOfVisit || client.scheduledDate;
          if (!rawDate || !dayjs(rawDate).isValid()) return false;

          const clientDate = dayjs(rawDate);
          const clientFiscalYear =
            clientDate.month() >= 3
              ? clientDate.year()
              : clientDate.year() - 1;
          return clientFiscalYear === currentFiscalYear;
        }).length,
      0,
    );

    return count / elapsedMonths;
  }, [dashboardUniqueClients]);
  const investorInventoryUnits = useMemo(
    () =>
      inventoryUnits.filter((unit) => {
        if (!unit?.isActive || unit?.isOnlyBudget) return false;

        const buildingName = String(
          unit?.building?.buildingName || "",
        ).toLowerCase();
        return (
          buildingName.includes("sunteck kanaka") ||
          buildingName.includes("dempo trade centre") ||
          buildingName.includes("dempo trade center")
        );
      }),
    [inventoryUnits],
  );
  const { data: investorOccupancyClients = [] } = useQuery({
    queryKey: ["co-working-monthly-occupancy", true],
    queryFn: async () => {
      const response = await axios.get("/api/sales/co-working-clients");
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: showDashboardHome,
  });
  const totalInventory = useMemo(
    () =>
      investorInventoryUnits.reduce(
        (total, unit) =>
          total +
          (Number(unit?.openDesks) || 0) +
          (Number(unit?.cabinDesks) || 0),
        0,
      ),
    [investorInventoryUnits],
  );
  const occupiedInventory = useMemo(
    () => {
      if (!totalInventory) return 0;

      const currentMonth = dayjs().startOf("month");
      const fiscalYearStart = dayjs()
        .year(currentMonth.month() >= 3 ? currentMonth.year() : currentMonth.year() - 1)
        .month(3)
        .startOf("month");
      const completedMonths = Array.from(
        { length: currentMonth.diff(fiscalYearStart, "month") + 1 },
        (_, index) => fiscalYearStart.add(index, "month"),
      );
      const monthlyOccupancy = completedMonths.map((monthStart) => {
        const monthEnd = monthStart.endOf("month");
        const occupied = investorOccupancyClients.reduce((total, client) => {
          const buildingName = String(
            client?.unit?.building?.buildingName || "",
          ).toLowerCase();
          const isInvestorBuilding =
            buildingName.includes("sunteck kanaka") ||
            buildingName.includes("dempo trade centre") ||
            buildingName.includes("dempo trade center");
          if (!isInvestorBuilding) return total;

          const startDate = dayjs(client?.startDate);
          if (!startDate.isValid()) return total;
          const endDate = client?.endDate ? dayjs(client.endDate) : currentMonth;
          const effectiveEndDate = endDate.isValid() ? endDate : currentMonth;
          const overlapsMonth =
            startDate.isBefore(monthEnd.add(1, "day")) &&
            effectiveEndDate.isAfter(monthStart.subtract(1, "day"));
          if (!overlapsMonth) return total;

          return (
            total +
            (Number(client?.openDesks) || 0) +
            (Number(client?.cabinDesks) || 0)
          );
        }, 0);

        return Math.min(occupied, totalInventory);
      });

      return Math.round(
        monthlyOccupancy.reduce((sum, value) => sum + value, 0) /
          monthlyOccupancy.length,
      );
    },
    [investorOccupancyClients, totalInventory],
  );
  const inventoryOccupancyPercent = totalInventory
    ? Math.round((occupiedInventory / totalInventory) * 100)
    : 0;
  const currentAppreciationMonthIndex = Math.max(
    0,
    Math.min(
      6,
      fiscalMonthIndex(dayjs()) - APPRECIATION_PROJECTION_START_INDEX,
    ),
  );
  const assetValueOwned =
    APPRECIATION_BASE_VALUATION +
    APPRECIATION_MONTHLY_INCREMENT * currentAppreciationMonthIndex;
  const marchAssetValueOwned =
    APPRECIATION_BASE_VALUATION + APPRECIATION_MONTHLY_INCREMENT * 6;
  const canViewIncomeExpenseGraph = hasPermission(
    PERMISSIONS.INVESTOR_INCOME_EXPENSE_GRAPH.value,
  );
 const canViewUniqueClientsGraph = hasPermission(
    PERMISSIONS.INVESTOR_UNIQUE_CLIENTS_GRAPH.value,
  );
  const canViewAppreciationCenter = hasPermission(
    PERMISSIONS.INVESTOR_REAL_ESTATE_OWNED_BY_BIZNEST_GRAPH.value,
  );
 const operationalGraphPermissions = {
    sector: PERMISSIONS.INVESTOR_SECTOR_WISE_OCCUPANCY.value,
    age: PERMISSIONS.INVESTOR_AGE_WISE_OCCUPANCY.value,
    gender: PERMISSIONS.INVESTOR_GENDER_WISE_OCCUPANCY.value,
    india: PERMISSIONS.INVESTOR_INDIA_WISE_OCCUPANCY.value,
  };
  const visibleOperationalGraphs = Object.keys(operationalGraphRoutes).filter(
    (key) =>
      hasPermission(operationalGraphPermissions[key]) &&
      (showDashboardHome || location.pathname.endsWith(operationalGraphRoutes[key])),
  );
  const operationalGraphsBeforeMeeting = [
    "sector",
    "age",
    "gender",
    "india",
  ];
  const { data: revenueExpenseData = [] } = useQuery({
    queryKey: ["historicalIncomeExpense"],
    queryFn: async () => {
      const response = await axios.get("/api/finance/income-expense");
      return Array.isArray(response.data?.response) ? response.data.response : [];
    },
     enabled: showDashboardHome,
  });
  const { data: investorSimpleRevenue = {} } = useQuery({
    queryKey: ["finance-dashboard-simpleRevenue"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/simple-consolidated-revenue");
      return response.data || {};
    },
    enabled: showDashboardHome,
  });
  const { data: investorBudgetData = [] } = useQuery({
    queryKey: ["budgetData", "finance-dashboard"],
    queryFn: async () => {
      const response = await axios.get("/api/budget/company-budget", {
        params: { view: "dashboard" },
      });
      return Array.isArray(response.data?.allBudgets)
        ? response.data.allBudgets
        : [];
    },
    enabled: showDashboardHome,
  });
  const { incomePerSqFt, expensePerSqFt } = useMemo(() => {
    const totalSqft = revenueExpenseData
      .filter((item) => item?.units)
      .flatMap((item) => (Array.isArray(item.units) ? item.units : []))
      .reduce((total, unit) => total + (Number(unit?.sqft) || 0), 0);

    if (!totalSqft) return { incomePerSqFt: 0, expensePerSqFt: 0 };

    const normalizeStatus = (value) =>
      typeof value === "string"
        ? value.trim().toLowerCase()
        : value
          ? "paid"
          : "unpaid";
    const numericAmount = (value) => {
      if (typeof value === "number") return value;
      const parsedValue = parseFloat(String(value || "").replace(/,/g, ""));
      return Number.isNaN(parsedValue) ? 0 : parsedValue;
    };
    const sources = [
      ...(investorSimpleRevenue.meetingRevenue || []).map((item) => ({
        amount: item.taxable,
        date: item.date,
        status: item.status,
      })),
      ...(investorSimpleRevenue.alternateRevenues || []).map((item) => ({
        amount: item.taxableAmount,
        date: item.invoiceCreationDate,
        status: item.status,
      })),
      ...(investorSimpleRevenue.virtualOfficeRevenues || []).map((item) => ({
        amount: item.revenue ?? item.taxableAmount,
        date: item.rentDate,
        status: item.status ?? item.rentStatus,
      })),
      ...(investorSimpleRevenue.workationRevenues || []).map((item) => ({
        amount: item.taxableAmount,
        date: item.date,
        status: item.status,
      })),
      ...(investorSimpleRevenue.coworkingRevenues || []).map((item) => ({
        amount: item.revenue,
        date: item.rentDate,
        status: item.rentStatus,
      })),
    ];
    const currentFiscalYear = fiscalYearLabel(dayjs());
    const totalIncome = sources.reduce((total, item) => {
      if (
        !item.date ||
        !dayjs(item.date).isValid() ||
        fiscalYearLabel(item.date) !== currentFiscalYear ||
        normalizeStatus(item.status) !== "paid"
      ) {
        return total;
      }
      return total + numericAmount(item.amount);
    }, 0);
    const totalExpense = investorBudgetData.reduce((total, item) => {
      if (
        !item?.dueDate ||
        !dayjs(item.dueDate).isValid() ||
        fiscalYearLabel(item.dueDate) !== currentFiscalYear
      ) {
        return total;
      }
      return total + (Number(item.actualAmount) || 0);
    }, 0);

    return {
      incomePerSqFt: totalIncome / totalSqft,
      expensePerSqFt: totalExpense / totalSqft,
    };
  }, [investorBudgetData, investorSimpleRevenue, revenueExpenseData]);
  const projectedFinancials = useMemo(() => {
    const income = Array(12).fill(0);
    const expense = Array(12).fill(0);
    const currentFiscalYear = fiscalYearLabel(dayjs());
    const previousFiscalYear = fiscalYearLabel(dayjs().subtract(1, "year"));
    let previousYearRevenue = 0;
    const addAmount = (values, date, amount) => {
      if (
        !date ||
        !dayjs(date).isValid() ||
        fiscalYearLabel(date) !== currentFiscalYear
      ) {
        return;
      }
      values[fiscalMonthIndex(date)] += Number(amount) || 0;
    };

    const incomeSources = [
      ...(investorSimpleRevenue.meetingRevenue || []).map((item) => ({
        amount: item.taxable,
        date: item.date,
        status: isMeetingFinancePaid(item) ? "paid" : "unpaid",
      })),
      ...(investorSimpleRevenue.alternateRevenues || []).map((item) => ({
        amount: item.taxableAmount,
        date: item.invoiceCreationDate,
        status: item.status,
      })),
      ...(investorSimpleRevenue.virtualOfficeRevenues || []).map((item) => ({
        amount: getVirtualOfficeReportingAmount(item),
        date: item.rentDate,
        status: item.rentStatus ?? item.status,
      })),
      ...(investorSimpleRevenue.workationRevenues || []).map((item) => ({
        amount: item.taxableAmount,
        date: item.date,
        status: item.status,
      })),
      ...(investorSimpleRevenue.coworkingRevenues || []).map((item) => ({
        amount: item.revenue,
        date: item.rentDate,
        status: item.rentStatus,
      })),
    ];

    incomeSources.forEach((item) => {
      if (getNormalizedPaymentStatus(item.status) !== "paid") return;

      const amount = getNumericAmount(item.amount);
      addAmount(income, item.date, amount);
      if (
        item.date &&
        dayjs(item.date).isValid() &&
        fiscalYearLabel(item.date) === previousFiscalYear
      ) {
        previousYearRevenue += amount;
      }
    });
    investorBudgetData.forEach((item) =>
      addAmount(expense, item?.dueDate, item?.actualAmount),
    );

    const completedMonthCount = fiscalMonthIndex(dayjs());
    const actualRevenue = income
      .slice(0, completedMonthCount)
      .reduce((sum, amount) => sum + amount, 0);
    const actualExpense = expense
      .slice(0, completedMonthCount)
      .reduce((sum, amount) => sum + amount, 0);
    const averageRevenue = completedMonthCount
      ? Math.round(actualRevenue / completedMonthCount)
      : 0;
    const averageExpense = completedMonthCount
      ? Math.round(actualExpense / completedMonthCount)
      : 0;
    const totals = {
      revenue: averageRevenue,
      expense: averageExpense,
    };
    const profitLoss = totals.revenue - totals.expense;

    return {
      revenue: totals.revenue,
      expense: totals.expense,
      profitLoss,
      revenueGrowth: previousYearRevenue
        ? (((averageRevenue * 12) - previousYearRevenue) / previousYearRevenue) * 100
        : 0,
    };
  }, [investorBudgetData, investorSimpleRevenue]);

  return (
    <div className="flex flex-col gap-4 p-3 pt-3">
      {showDashboardHome && (
        <div className="overflow-hidden rounded-lg">
          <div className="relative h-44 w-full md:h-56 xl:h-64">
            <img
              src={investorBanner}
              alt="Investor dashboard banner"
              className="h-full w-full object-cover object-left"
            />
            <div className="absolute inset-y-0 left-0 flex w-[58%] flex-col justify-between px-0 py-2">
              <p className="font-pregular text-xs uppercase tracking-[0.02em] text-[#58709A] sm:text-base lg:text-lg">
                Investor Dashboard
              </p>
              <h1
                className={`max-w-full font-serif text-3xl font-semibold leading-[0.88] text-[#1E3D73] sm:text-5xl md:whitespace-nowrap ${
                  isBrowserZoomedOut
                    ? "lg:text-7xl xl:text-[74px]"
                    : "lg:text-5xl xl:text-[56px]"
                }`}
              >
                MARKET LEADER
              </h1>
              <p
                className={`max-w-full font-pmedium text-xl leading-[0.94] text-[#1E3D73] sm:text-3xl md:whitespace-nowrap ${
                  isBrowserZoomedOut
                    ? "lg:text-[46px]"
                    : "lg:text-[35px]"
                }`}
              >
                Indian Destination Workspace
              </p>
              <p className="font-pregular text-xs uppercase text-[#3F6291] sm:text-lg md:whitespace-nowrap lg:text-xl min-[1800px]:text-2xl">
                <span className="relative inline-block after:absolute after:left-0 after:top-1/2 after:h-0.5 after:w-full after:-rotate-6 after:bg-[#E64B4B] after:content-['']">
                  WORK TO LIVE.
                </span>
                <span className="ml-3 text-[#E64B4B]">LIVE TO WORK</span>
              </p>
            </div>
          </div>
        </div>
      )}
      {showDashboardHome && (
        <InvestorDashboardCards
          format={format}
          hasPermission={hasPermission}
          navigate={navigate}
          totalInventory={totalInventory}
          occupiedInventory={occupiedInventory}
          inventoryOccupancyPercent={inventoryOccupancyPercent}
          assetValueOwned={marchAssetValueOwned}
          incomePerSqFt={incomePerSqFt}
          expensePerSqFt={expensePerSqFt}
          averageUniqueClients={averageUniqueClients}
          currentFiscalYear={fiscalYearLabel(dayjs())}
          projectedRevenue={projectedFinancials.revenue}
          projectedExpense={projectedFinancials.expense}
          projectedProfitLoss={projectedFinancials.profitLoss}
          projectedRevenueGrowth={projectedFinancials.revenueGrowth}
          compactPercentageChips={!isBrowserZoomedOut}
        />
      )}
      {(showDashboardHome || showIncomeExpensePage) && canViewIncomeExpenseGraph && (
        <div>
          <InvestorIncomeExpenseGraph
            assetValueOwned={assetValueOwned}
            projectedFinancials={projectedFinancials}
            snapshotAssetValueOwned={marchAssetValueOwned}
          />
        </div>
      )}
      {showUniqueClientsPage && canViewUniqueClientsGraph && (
          <div className="-mt-6">
            <InvestorUniqueClientsGraph />
          </div>
        )}

      {visibleOperationalGraphs.some((key) =>
        operationalGraphsBeforeMeeting.includes(key) &&
          !(showDashboardHome && ["sector", "india"].includes(key)),
      ) && (
        <div className={showDashboardHome ? "" : "mt-0.5"}>
            <InvestorOperationalCharts
              visibleCharts={visibleOperationalGraphs.filter((key) =>
              operationalGraphsBeforeMeeting.includes(key) &&
                !(showDashboardHome && ["sector", "india"].includes(key)),
              )}
              routes={operationalGraphRoutes}
              showDetails={!showDashboardHome}
              noOuterPadding={showDashboardHome}
            />
          </div>
        )}
      {(showDashboardHome || showAppreciationCenterPage) &&
        canViewAppreciationCenter && (
          <div className={showDashboardHome ? "" : "mt-0.5"}>
            <WidgetSection layout={1} padding>
              <InvestorAppreciationCenter />
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
