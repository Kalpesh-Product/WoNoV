import AgTable from "../../../components/AgTable";
import { toast } from "sonner";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import ThreeDotMenu from "../../../components/ThreeDotMenu";
import MuiModal from "../../../components/MuiModal";
import InvestorDashboard from "../InvestorDashboard/InvestorDashboard";
import FyBarGraphPercentage from "../../../components/graphs/FyBarGraphPercentage";
import NormalBarGraph from "../../../components/graphs/NormalBarGraph";
import LeadsLayout from "../SalesDashboard/ViewClients/LeadsLayout";
import { useCurrency } from "../../../context/CurrencyContext";
import { CircularProgress, TextField } from "@mui/material";
import { Menu, MenuItem } from "@mui/material";
import FinanceDashboard1Summary from "./FinanceDashboard1Summary";
import { MdSettings, MdCalendarMonth, MdChevronRight } from "react-icons/md";
import financeBanner from "../../../assets/finance-banner.png";
import Card from "../../../components/Card";
import {
  MdFormatListBulleted,
  MdOutlineMiscellaneousServices,
} from "react-icons/md";
import { SiCashapp, SiGoogleadsense } from "react-icons/si";
import WidgetSection from "../../../components/WidgetSection";
import FinanceCard from "../../../components/FinanceCard";
import PieChartMui from "../../../components/graphs/PieChartMui";
import DonutChart from "../../../components/graphs/DonutChart";
import MuiTable from "../../../components/Tables/MuiTable";
import {
  Navigate,
  useLocation,
  useNavigate as useRouterNavigate,
} from "react-router-dom";
import { useSidebar } from "../../../context/SideBarContext";
import { useCallback, useEffect, useMemo, useState } from "react";
import YearlyGraph from "../../../components/graphs/YearlyGraph";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { inrFormat } from "../../../utils/currencyFormat";
import { useDispatch } from "react-redux";
import {
  setTotalExpense,
  setTotalIncome,
} from "../../../redux/slices/financeSlice";
import humanDate from "../../../utils/humanDateForamt";
import { PERMISSIONS } from "../../../constants/permissions";
import useAuth from "../../../hooks/useAuth";
import usePageDepartment from "../../../hooks/usePageDepartment";
import StatusChip from "../../../components/StatusChip";
import DetalisFormatted from "../../../components/DetalisFormatted";

export function useFinanceNavigate() {
  const navigate = useRouterNavigate();
  const { pathname } = useLocation();
  return useCallback(
    (to, options) => {
      const mapPath = (value) =>
        pathname.startsWith("/app/dashboard/finance-dashboard1") &&
        typeof value === "string"
          ? value.replace(
              /^\/app\/dashboard\/finance-dashboard(?=\/|$)/,
              "/app/dashboard/finance-dashboard1",
            )
          : value;
      const target =
        typeof to === "string"
          ? mapPath(to)
          : to && typeof to === "object"
            ? { ...to, pathname: mapPath(to.pathname) }
            : to;
      return navigate(target, options);
    },
    [navigate, pathname],
  );
}

const PayoutDetail = ({ detail, ...props }) => {
  const isMissing =
    detail == null ||
    (typeof detail === "string" &&
      ["", "-", "--", "\u2013", "\u2014"].includes(detail.trim()));
  return <DetalisFormatted {...props} detail={isMissing ? "\u2014" : detail} />;
};

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
const INVESTOR_HARDCODED_DESKS = 750;
const INVESTOR_PROJECTED_INCOME_UPLIFT_BY_FISCAL_MONTH = {
  10: 1_500_000,
  11: 1_500_000,
};
const INVESTOR_PROJECTED_EXPENSE_UPLIFT_BY_FISCAL_MONTH = {
  10: 750_000,
  11: 750_000,
};
const getInvestorProjectedMonthValue = (average, monthIndex, upliftByMonth) =>
  average + (upliftByMonth[monthIndex] || 0);
const INVESTOR_INVENTORY_OCCUPANCY_DATA = [
  {
    name: "Apr-26",
    occupied: 627,
    remaining: 123,
    total: 750,
    isUpcoming: false,
  },
  {
    name: "May-26",
    occupied: 634,
    remaining: 116,
    total: 750,
    isUpcoming: false,
  },
  {
    name: "Jun-26",
    occupied: 626,
    remaining: 124,
    total: 750,
    isUpcoming: false,
  },
  {
    name: "Jul-26",
    occupied: 624,
    remaining: 126,
    total: 750,
    isUpcoming: false,
  },
  {
    name: "Aug-26",
    occupied: 690,
    remaining: 60,
    total: 750,
    isUpcoming: false,
  },
  {
    name: "Sep-26",
    occupied: 640,
    remaining: 110,
    total: 750,
    isUpcoming: false,
  },
  {
    name: "Oct-26",
    occupied: 640,
    remaining: 110,
    total: 750,
    isUpcoming: true,
  },
  {
    name: "Nov-26",
    occupied: 640,
    remaining: 110,
    total: 750,
    isUpcoming: true,
  },
  {
    name: "Dec-26",
    occupied: 640,
    remaining: 110,
    total: 750,
    isUpcoming: true,
  },
  {
    name: "Jan-27",
    occupied: 640,
    remaining: 110,
    total: 750,
    isUpcoming: true,
  },
  {
    name: "Feb-27",
    occupied: 900,
    remaining: 100,
    total: 1000,
    isUpcoming: true,
  },
  {
    name: "Mar-27",
    occupied: 900,
    remaining: 100,
    total: 1000,
    isUpcoming: true,
  },
];
// Project October-January from the six hardcoded actual months.
const completedInventoryMonths = INVESTOR_INVENTORY_OCCUPANCY_DATA.filter(
  (item) => !item.isUpcoming,
);
const projectedOccupiedDesks = Math.round(
  completedInventoryMonths.reduce((sum, item) => sum + item.occupied, 0) /
    completedInventoryMonths.length,
);
INVESTOR_INVENTORY_OCCUPANCY_DATA.forEach((item, index) => {
  if (index >= 6 && index <= 9) {
    item.occupied = projectedOccupiedDesks;
    item.remaining = item.total - projectedOccupiedDesks;
  }
});
const formatGraphAmount = (amount, currency, convert, options = {}) =>
  new Intl.NumberFormat("en-IN", {
    ...options,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.trunc(convert(amount)));

const INVESTOR_CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
};

const AED_TOOLTIP_SYMBOL = `<span role="img" aria-label="AED" style="position:relative;display:inline-block;width:1em;height:1em;flex:0 0 1em;align-self:center;">
  <span style="position:absolute;left:0.2em;top:0.06em;width:0.7em;height:0.88em;border:0.13em solid currentColor;border-left-width:0.18em;border-radius:0 0.55em 0.55em 0;box-sizing:border-box;"></span>
  <span style="position:absolute;left:0;top:0.34em;width:1em;height:0.12em;border-radius:0.12em;background:currentColor;"></span>
  <span style="position:absolute;left:0;top:0.62em;width:1em;height:0.12em;border-radius:0.12em;background:currentColor;"></span>
</span>`;

const AedCurrencySymbol = () => (
  <span
    role="img"
    aria-label="AED"
    className="relative inline-block shrink-0 self-center"
    style={{ width: "1em", height: "1em" }}
  >
    <span
      className="absolute box-border"
      style={{
        left: "0.2em",
        top: "0.06em",
        width: "0.7em",
        height: "0.88em",
        border: "0.13em solid currentColor",
        borderLeftWidth: "0.18em",
        borderRadius: "0 0.55em 0.55em 0",
      }}
    />
    <span
      className="absolute left-0 rounded"
      style={{
        top: "0.34em",
        width: "1em",
        height: "0.12em",
        background: "currentColor",
      }}
    />
    <span
      className="absolute left-0 rounded"
      style={{
        top: "0.62em",
        width: "1em",
        height: "0.12em",
        background: "currentColor",
      }}
    />
  </span>
);

const InvestorCurrencyAmount = ({ currency, value, suffix = "" }) => (
  <span className="inline-flex items-center gap-[0.3em] whitespace-nowrap leading-none">
    {currency === "AED" ? (
      <AedCurrencySymbol />
    ) : (
      <span>{INVESTOR_CURRENCY_SYMBOLS[currency] || currency}</span>
    )}
    <span>
      {value}
      {suffix}
    </span>
  </span>
);

const formatGraphScaleAmount = (
  amount,
  convert,
  scale,
  fractionDigits,
  locale = "en-IN",
) => {
  const scaledAmount = convert(amount) / scale;
  const precision = 10 ** fractionDigits;
  const truncatedAmount = Math.trunc(scaledAmount * precision) / precision;

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(truncatedAmount);
};

const BizNestTitle = ({ children, prefix, monochrome = false }) => (
  <span className="normal-case">
    {prefix ? (
      <span
        className={`mr-1 ${monochrome ? "text-[#1E3D73]" : "text-[#1234c9]"}`}
      >
        {prefix}
      </span>
    ) : null}
    <span className={monochrome ? "text-[#1E3D73]" : "text-[#1234c9]"}>BI</span>
    <span className={monochrome ? "text-[#1E3D73]" : "text-[#e33434]"}>Z</span>
    <span className={monochrome ? "text-[#1E3D73]" : "text-[#1234c9]"}>
      {" "}
      Nest
    </span>
    {children ? (
      <span
        className={`ml-1 ${monochrome ? "text-[#1E3D73]" : "text-[#1234c9]"}`}
      >
        {children}
      </span>
    ) : null}
  </span>
);

const InvestorHeaderLogo = ({ compact = false }) => (
  <span
    aria-label={compact ? "BIZNEST" : "BIZ NEST"}
    className="inline-flex items-baseline whitespace-nowrap text-[1em] normal-case leading-none text-[#2a2525]"
  >
    <span>BI</span>
    <span className="text-[#e33434]">Z</span>
    <span>{compact ? "NEST" : "\u00a0NEST"}</span>
  </span>
);

const InvestorBarsIcon = ({ className = "" }) => (
  <span className={`flex h-8 w-8 items-end justify-center gap-1 ${className}`}>
    <span className="h-3 w-1.5 rounded-full bg-current" />
    <span className="h-5 w-1.5 rounded-full bg-current" />
    <span className="h-7 w-1.5 rounded-full bg-current" />
  </span>
);

const InvestorAnnualMonthlyMixIncome = ({ hasPermission }) => {
  const axios = useAxiosPrivate();
  const [currentMonth, setCurrentMonth] = useState(() =>
    dayjs().format("YYYY-MM"),
  );
  useEffect(() => {
    const timer = window.setInterval(
      () => setCurrentMonth(dayjs().format("YYYY-MM")),
      60000,
    );
    return () => window.clearInterval(timer);
  }, []);
  const { currency, convert } = useCurrency();

  const formatMixIncomeTooltipAmount = (amount) => {
    const formattedValue = formatGraphAmount(amount, currency, convert);

    if (currency === "AED") {
      return `<span style="display:inline-flex;align-items:center;gap:0.3em;direction:ltr;white-space:nowrap;font-size:inherit;line-height:1;vertical-align:middle;">${AED_TOOLTIP_SYMBOL}<span style="display:inline-block;line-height:1;">${formattedValue}</span></span>`;
    }

    return `${INVESTOR_CURRENCY_SYMBOLS[currency] || currency} ${formattedValue}`;
  };

  const { data: simpleRevenue = [], isLoading } = useQuery({
    queryKey: ["finance1-monthly-income-breakdown"],
    queryFn: async () => {
      const response = await axios.get(
        "/api/sales/simple-consolidated-revenue",
      );
      return response.data;
    },
    enabled: hasPermission(PERMISSIONS.FINANCE1_MONTHLY_INCOME_BREAKDOWN.value),
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
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
    const today = dayjs(`${currentMonth}-01`);
    const fiscalStartYear =
      today.month() >= 3 ? today.year() : today.year() - 1;
    const fiscalStart = dayjs(`${fiscalStartYear}-04-01`).startOf("month");
    const fiscalEnd = fiscalStart.add(11, "month");
    const delayedProjectionStart = today.startOf("month").subtract(1, "month");
    const projectionStart = delayedProjectionStart.isBefore(
      fiscalStart,
      "month",
    )
      ? fiscalStart
      : delayedProjectionStart;
    const completedMonthCount = projectionStart.diff(fiscalStart, "month");
    const projectedVerticals = [
      "Co-Working",
      "Virtual Office",
      "Meeting",
      "Alternate",
    ];

    const historicalFiscalData = paidRevenueData.filter((item) => {
      const date = dayjs(item.date);
      return date.isValid() && date.isBefore(fiscalStart, "month");
    });

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

    // Historical fiscal years remain actual-only. The current year follows
    // Investor projection logic, while Workation stays a separate actual-only
    // vertical in every available fiscal year.
    return [
      ...historicalFiscalData,
      ...completedFiscalYearData,
      ...projectedRecords,
    ];
  }, [paidRevenueData, currentMonth]);
  if (!hasPermission(PERMISSIONS.FINANCE1_MONTHLY_INCOME_BREAKDOWN.value)) {
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
        <span className="inline-flex items-baseline gap-2 leading-none text-[#1E3D73]">
          <InvestorHeaderLogo />
          <span className="inline-flex items-baseline leading-none">
            Monthly Income Breakdown Distribution -
          </span>
        </span>
      }
      chartOptions={options}
      investorVariant
      hideHeaderAmounts
      includeWorkation
      balanceTooltipPercentages
      tooltipValueFormatter={formatMixIncomeTooltipAmount}
      showFiscalYearInTitle
    />
  );
};

const inventoryGraphSummary = () => {
  const completedMonths = INVESTOR_INVENTORY_OCCUPANCY_DATA.filter(
    (item) => !item.isUpcoming && item.total > 0,
  );
  const divisor = completedMonths.length || 1;
  return {
    total: Math.round(
      completedMonths.reduce((sum, item) => sum + item.total, 0) / divisor,
    ),
    occupied: Math.round(
      completedMonths.reduce((sum, item) => sum + item.occupied, 0) / divisor,
    ),
    percentage: Math.round(
      completedMonths.reduce(
        (sum, item) => sum + (item.occupied / item.total) * 100,
        0,
      ) / divisor,
    ),
  };
};
const InvestorOccupiedInventoryGraph = ({ hasPermission, className = "" }) => {
  const averageOccupancyPercent = inventoryGraphSummary().percentage;
  const isProjectedInventoryPoint = (item) =>
    item?.isUpcoming || item?.name === "Sep-26";

  const inventorySeries = [
    {
      name: "Occupied",
      data: INVESTOR_INVENTORY_OCCUPANCY_DATA.map((item) => item.occupied),
    },
    {
      name: "Unoccupied",
      data: INVESTOR_INVENTORY_OCCUPANCY_DATA.map((item) => item.remaining),
    },
  ];

  const inventoryOptions = {
    chart: {
      type: "bar",
      fontFamily: "Poppins-Regular",
      stacked: true,
      stackType: "100%",
      toolbar: { show: false },
    },
    states: {
      hover: { filter: { type: "none" } },
      active: { filter: { type: "none" } },
    },
    xaxis: {
      categories: INVESTOR_INVENTORY_OCCUPANCY_DATA.map((item) => item.name),
      labels: { style: { colors: "#1E3D73" } },
    },
    yaxis: {
      min: 0,
      max: 100,
      title: { text: "Inventory", style: { color: "#1E3D73" } },
      labels: {
        style: { colors: "#1E3D73" },
        formatter: (value) => `${Math.round(value)}%`,
      },
    },
    legend: {
      position: "top",
      labels: { colors: "#1E3D73" },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 2,
        dataLabels: {
          total: {
            enabled: true,
            formatter: (_value, options) =>
              INVESTOR_INVENTORY_OCCUPANCY_DATA[options.dataPointIndex]
                ?.total || "",
            style: {
              color: "#1E3D73",
              fontSize: "12px",
              fontWeight: 700,
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (_value, { dataPointIndex, seriesIndex }) => {
        const item = INVESTOR_INVENTORY_OCCUPANCY_DATA[dataPointIndex] || {};
        const value = [item.occupied, item.remaining][seriesIndex];
        return Number.isFinite(value) && item.total > 0
          ? `${Math.round((value / item.total) * 100)}%`
          : "";
      },
      style: {
        colors: ["#ffffff"],
        fontSize: "12px",
        fontWeight: 700,
      },
    },
    colors: [
      ({ dataPointIndex }) =>
        isProjectedInventoryPoint(
          INVESTOR_INVENTORY_OCCUPANCY_DATA[dataPointIndex],
        )
          ? "#b4b4b4"
          : "#3cb37180",
      ({ dataPointIndex }) =>
        isProjectedInventoryPoint(
          INVESTOR_INVENTORY_OCCUPANCY_DATA[dataPointIndex],
        )
          ? "#616161"
          : "#ff000080",
    ],
    tooltip: {
      custom: ({ dataPointIndex }) => {
        const item = INVESTOR_INVENTORY_OCCUPANCY_DATA[dataPointIndex] || {};
        const isProjected = isProjectedInventoryPoint(item);
        const prefix = isProjected ? "Projected " : "";
        const occupiedColor = isProjected ? "#b4b4b4" : "#9bd8ba";
        const unoccupiedColor = isProjected ? "#616161" : "#ff7f83";
        const total = Number(item.total) || 0;
        const occupied = Math.round(Number(item.occupied) || 0);
        const unoccupied = Math.round(Number(item.remaining) || 0);
        const occupiedPercentage =
          total > 0 ? Math.round((occupied / total) * 100) : 0;
        const unoccupiedPercentage = total > 0 ? 100 - occupiedPercentage : 0;
        return `
          <div style="min-width:155px;font-family:Poppins-Regular,sans-serif;font-size:12px;line-height:1.4;">
            <div class="apexcharts-tooltip-title" style="margin-bottom:8px;font-size:12px;font-weight:400;">${item.name || ""}</div>
            <div style="padding:0 10px 10px;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:7px;">
                <span style="width:10px;height:10px;flex:0 0 10px;border-radius:50%;background:${occupiedColor};display:inline-block;"></span>
                <div style="white-space:nowrap;">
                  <span>${occupiedPercentage}% = ${prefix}Occupied =</span>&nbsp;
                  <strong style="font-weight:600;">${occupied.toLocaleString("en-IN")}</strong>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="width:10px;height:10px;flex:0 0 10px;border-radius:50%;background:${unoccupiedColor};display:inline-block;"></span>
                <div style="white-space:nowrap;">
                  <span>${unoccupiedPercentage}% = ${prefix}Unoccupied =</span>&nbsp;
                  <strong style="font-weight:600;">${unoccupied.toLocaleString("en-IN")}</strong>
                </div>
              </div>
              <hr style="margin:7px 0 0;border:0;border-top:1px solid #e5e7eb;" />
              <div style="display:flex;align-items:center;gap:8px;margin-top:7px;">
                <span style="width:10px;height:10px;flex:0 0 10px;border-radius:50%;background:${isProjected ? "#778899" : "#1E3D73"};display:inline-block;"></span>
                <div style="white-space:nowrap;">
                  <span>100% = ${prefix}Overall Inventory =</span>&nbsp;
                  <strong style="font-weight:600;">${total.toLocaleString("en-IN")}</strong>
                </div>
              </div>
            </div>
          </div>`;
      },
    },
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Live API-based CheckAvailability graph is temporarily disabled for the Investor Dashboard. */}
      <WidgetSection
        border
        borderColor="#1E3D73"
        bodyBorderColor="#9FB2CF"
        normalCase
        title={
          <span className="inline-flex items-baseline gap-2 leading-none text-[#1E3D73]">
            <InvestorHeaderLogo />
            <span className="inline-flex items-baseline leading-none">
              - INVENTORY VS OCCUPANCY
            </span>
          </span>
        }
        headerRightContent={
          <span className="rounded-lg border border-[#aec6fb] bg-[#dbe4ff] px-3 py-2 text-body font-pmedium uppercase text-[#274784]">
            AVERAGE OCCUPANCY - {averageOccupancyPercent}%
          </span>
        }
      >
        <div className="w-full min-w-0 overflow-hidden">
          <NormalBarGraph
            data={inventorySeries}
            options={inventoryOptions}
            height={390}
          />
        </div>
      </WidgetSection>
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
  const { currency, convert } = useCurrency();
  const [valuationAsOf, setValuationAsOf] = useState(() => dayjs());
  const [valuationTooltip, setValuationTooltip] = useState(null);
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
  const currentValuation =
    valuationMonths.find(
      ({ month }) => month === valuationAsOf.format("MMM-YY"),
    ) || valuationMonths[0];
  const maximumConvertedValuation = Math.max(
    0,
    ...valuationMonths.map(({ amount }) => convert(amount)),
  );
  const valuationDisplayScale =
    maximumConvertedValuation >= 10_000_000
      ? 10_000_000
      : maximumConvertedValuation >= 100_000
        ? 100_000
        : 1_000;
  const valuationScaleLabel =
    valuationDisplayScale === 10_000_000
      ? "Crores"
      : valuationDisplayScale === 100_000
        ? "Lakhs"
        : "Thousands";
  const graphData = useMemo(
    () => [
      {
        group: currentFiscalYear,
        name: "Amount Valuation",
        data: valuationMonths.map(
          ({ amount }) => convert(amount) / valuationDisplayScale,
        ),
      },
    ],
    [convert, currentFiscalYear, valuationDisplayScale, valuationMonths],
  );
  const maximumScaledValuation =
    maximumConvertedValuation / valuationDisplayScale;
  const valuationAxisStep = Math.max(1, Math.ceil(maximumScaledValuation / 4));
  const valuationScaleMaximum = valuationAxisStep * 4;

  const updateValuationTooltip = (event) => {
    const container = event.currentTarget;
    // Read the rendered bar bounds so hover remains accurate after scrolling,
    // resizing, or currency changes, independently of ApexCharts' listeners.
    const bar = Array.from(
      container.querySelectorAll(".apexcharts-bar-area"),
    ).find((element) => {
      const bounds = element.getBoundingClientRect();
      return (
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom
      );
    });
    const index = bar ? Number(bar.getAttribute("j")) : -1;
    if (!valuationMonths[index]) {
      setValuationTooltip(null);
      return;
    }

    const bounds = container.getBoundingClientRect();
    const tooltipWidth = Math.min(175, bounds.width);
    const cursorX = event.clientX - bounds.left;
    setValuationTooltip({
      index,
      left: Math.max(0, Math.min(cursorX + 12, bounds.width - tooltipWidth)),
      top: Math.max(0, event.clientY - bounds.top - 90),
    });
  };
  const hoveredValuation = valuationMonths[valuationTooltip?.index];

  const options = useMemo(
    () => ({
      chart: {
        type: "bar",
        id: "investor-real-estate-owned",
        animations: { enabled: false },
        toolbar: { show: false },
        fontFamily: "Poppins-Regular",
      },

      colors: ["#0BDA51"],

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
          return formatGraphScaleAmount(
            amount,
            convert,
            valuationDisplayScale,
            2,
          );
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
        tickAmount: 4,
        title: {
          text: `Property Owned ${valuationScaleLabel} (${currency})`,
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

      tooltip: { enabled: false },
    }),
    [
      convert,
      currency,
      valuationDisplayScale,
      valuationMonths,
      valuationScaleLabel,
      valuationScaleMaximum,
    ],
  );

  return (
    <div
      className="investor-real-estate-chart relative"
      onPointerMoveCapture={updateValuationTooltip}
      onPointerDownCapture={updateValuationTooltip}
      onPointerLeave={() => setValuationTooltip(null)}
    >
      <YearlyGraph
        title={
          <span className="inline-flex items-baseline gap-2 leading-none text-[#1E3D73]">
            <InvestorHeaderLogo />
            <span className="inline-flex items-baseline leading-none">
              {`REAL ESTATE OWNED — ${currentFiscalYear.replace("-", "–")}`}
            </span>
          </span>
        }
        data={graphData}
        options={options}
        currentYear={currentFiscalYear}
        categories={valuationMonths.map(({ month }) => month)}
        headerRightContent={
          currentValuation ? (
            <div className="flex items-center justify-center gap-1 rounded-lg border border-[#aec6fb] bg-[#dbe4ff] px-3 py-2 text-body font-pmedium text-[#274784]">
              <span>REAL ESTATE VALUE :</span>
              <span>
                {formatGraphAmount(currentValuation.amount, currency, convert)}
              </span>
            </div>
          ) : null
        }
        hideYearNavigation
        chartHeight={360}
        sectionBorderColor="#1E3D73"
        sectionBodyBorderColor="#9FB2CF"
      />
      {hoveredValuation && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-50 w-[175px] max-w-full overflow-hidden rounded-lg border border-[#e5e7eb] bg-white text-xs text-[#111827] shadow-lg"
          style={{ left: valuationTooltip.left, top: valuationTooltip.top }}
        >
          <div className="border-b border-[#dbe1e8] bg-[#eef2f6] px-3 py-2 text-[#1f2937]">
            {hoveredValuation.month}
          </div>
          <div className="flex items-center gap-2 px-3 py-2.5">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#0BDA51]" />
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <span>Asset:</span>
              <strong className="pr-1">
                <InvestorCurrencyAmount
                  currency={currency}
                  value={formatGraphAmount(
                    hoveredValuation.amount,
                    currency,
                    convert,
                  )}
                />
              </strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const groupUniqueClientInvoices = (revenueInvoices) => {
  const grouped = {};
  const addInvoice = ({ invoice, typeOfClient, date, client }) => {
    const invoiceDate = dayjs(date);
    if (!invoiceDate.isValid()) return;

    const normalizedInvoice = {
      client: client || "Unknown",
      typeOfClient,
      date: invoiceDate.format("YYYY-MM-DD"),
      invoiceId: invoice?._id || invoice?.id,
    };
    const month = invoiceDate.format("MMMM");
    grouped[month] ||= [];
    grouped[month].push(normalizedInvoice);
  };

  asArray(revenueInvoices.coworkingRevenues).forEach((invoice) => {
    addInvoice({
      invoice,
      typeOfClient: "Coworking",
      date: invoice.rentDate,
      client: invoice.clientName || invoice.clientInvoiceName,
    });
  });

  asArray(revenueInvoices.virtualOfficeRevenues).forEach((invoice) => {
    addInvoice({
      invoice,
      typeOfClient: "Virtualoffice",
      date: invoice.rentDate,
      client:
        invoice.client?.clientName ||
        invoice.clientName ||
        invoice.clientInvoiceName,
    });
  });

  asArray(revenueInvoices.meetingRevenue).forEach((invoice) => {
    const meetingType = String(
      invoice.meetingType ||
        invoice.particulars ||
        invoice.visitorDetails?.purposeOfVisit ||
        "",
    )
      .trim()
      .toLowerCase();
    const isDayPass =
      invoice.source === "day-pass" ||
      meetingType.includes("half-day") ||
      meetingType.includes("half day") ||
      meetingType.includes("full-day") ||
      meetingType.includes("full day");

    addInvoice({
      invoice,
      typeOfClient: isDayPass ? "Open Desk" : "External Meetings",
      date: invoice.date,
      client: invoice.clientName || invoice.client,
    });
  });

  return Object.entries(grouped).map(([month, clients]) => ({
    month,
    clients,
  }));
};

const averageMonthlyUniqueClients = ({ count, financialYear }) => {
  const currentDate = dayjs().startOf("month");
  const currentFinancialYear =
    currentDate.month() >= 3 ? currentDate.year() : currentDate.year() - 1;
  const elapsedMonths =
    financialYear === currentFinancialYear
      ? Array.from({ length: 12 }, (_, index) =>
          dayjs()
            .year(financialYear)
            .month(3 + index)
            .startOf("month"),
        ).filter(
          (month) => !currentDate.isBefore(month.add(2, "month"), "month"),
        ).length
      : financialYear < currentFinancialYear
        ? 12
        : 1;
  return Math.round(count / Math.max(elapsedMonths, 1));
};

const uniqueClientGraphSummary = (revenueInvoices) => {
  const clients = groupUniqueClientInvoices(revenueInvoices).flatMap(
    (month) => month.clients,
  );
  const now = dayjs().startOf("month");
  const currentYear = now.month() >= 3 ? now.year() : now.year() - 1;
  const years = clients.map((client) => {
    const date = dayjs(client.date);
    return date.month() >= 3 ? date.year() : date.year() - 1;
  });
  const financialYear = years.length ? Math.max(...years) : currentYear;
  const count = clients.filter((client) => {
    const date = dayjs(client.date);
    const year = date.month() >= 3 ? date.year() : date.year() - 1;
    return (
      year === financialYear &&
      (financialYear !== currentYear ||
        !now.isBefore(date.startOf("month").add(2, "month"), "month"))
    );
  }).length;
  return {
    value: averageMonthlyUniqueClients({ count, financialYear }),
    period: `FY ${financialYear}-${String(financialYear + 1).slice(-2)}`,
  };
};

const InvestorUniqueClientsGraph = () => {
  const axios = useAxiosPrivate();
  const { data: revenueInvoices = {} } = useQuery({
    queryKey: ["simpleRevenue"],
    queryFn: async () => {
      const response = await axios.get(
        "/api/sales/simple-consolidated-revenue",
      );
      return response.data && typeof response.data === "object"
        ? response.data
        : {};
    },
  });

  const clientsByMonth = useMemo(
    () => groupUniqueClientInvoices(revenueInvoices),
    [revenueInvoices],
  );

  const averageMonthlyUniqueClientTitle = (summary) =>
    `AVERAGE MONTHLY UNIQUE CLIENT : ${averageMonthlyUniqueClients(summary).toLocaleString("en-IN")}`;

  return (
    <LeadsLayout
      data={clientsByMonth}
      hideAccordion
      title={
        <span className="inline-flex items-baseline gap-2 leading-none text-[#1E3D73]">
          <InvestorHeaderLogo />
          <span className="inline-flex items-baseline leading-none">
            ACTIVE UNIQUE CLIENTS
          </span>
        </span>
      }
      titleAmount={averageMonthlyUniqueClientTitle}
      hideMonthAxisTitle
      noOuterPadding
      investorBlueStyle
      investorTitleAmountChip
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

const getGraphNormalizedPaymentStatus = (value) => {
  if (typeof value === "string") return value.trim().toLowerCase();
  return value ? "paid" : "unpaid";
};

const getGraphNumericAmount = (value) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsedValue = parseFloat(value.replace(/,/g, ""));
    return Number.isNaN(parsedValue) ? 0 : parsedValue;
  }
  return 0;
};

const isGraphMeetingFinancePaid = (item) =>
  getGraphNormalizedPaymentStatus(item?.financeStatus) === "verified";

const isBeforeGraphVirtualOfficeUploadLogicStart = (value) => {
  const date = dayjs(value);
  return date.isValid() && date.isBefore(dayjs("2026-09-01"), "month");
};

const getGraphVirtualOfficeReportingAmount = (item) =>
  isBeforeGraphVirtualOfficeUploadLogicStart(
    item?.rentDate || item?.invoiceUploadedAt || item?.createdAt,
  )
    ? getGraphNumericAmount(item?.revenue ?? item?.taxableAmount)
    : getGraphNumericAmount(
        item?.reportingAmount ??
          item?.receivedAmount ??
          item?.revenue ??
          item?.taxableAmount,
      );

// Keep Finance projections aligned with the Investor dashboard calculation.
const getFinanceProjectionStartIndex = (now = new Date()) =>
  Math.max(fiscalMonthIndex(now) - 1, 0);

const projectFinanceSeries = (
  values,
  fiscalYear,
  seriesName,
  now = new Date(),
) => {
  const actual = Array.from(
    { length: 12 },
    (_, index) => Number(values?.[index]) || 0,
  );
  const currentFiscalYear = fiscalYearLabel(now);
  const isCurrentFiscalYear = fiscalYear === currentFiscalYear;
  const projectionStartIndex = isCurrentFiscalYear
    ? getFinanceProjectionStartIndex(now)
    : 12;
  const average = projectionStartIndex
    ? Math.round(
        actual
          .slice(0, projectionStartIndex)
          .reduce((sum, value) => sum + value, 0) / projectionStartIndex,
      )
    : 0;
  const projected = actual.map(
    (_, index) => isCurrentFiscalYear && index >= projectionStartIndex,
  );
  const upliftByMonth =
    seriesName === "Expense"
      ? INVESTOR_PROJECTED_EXPENSE_UPLIFT_BY_FISCAL_MONTH
      : INVESTOR_PROJECTED_INCOME_UPLIFT_BY_FISCAL_MONTH;

  return {
    data: actual.map((value, index) =>
      projected[index]
        ? getInvestorProjectedMonthValue(average, index, upliftByMonth)
        : value,
    ),
    projected,
  };
};
const calculateCashflowRows = (
  income = [],
  expenses = [],
  openingBalance = 0,
) => {
  let closing = openingBalance;
  return Array.from({ length: 12 }, (_, index) => {
    const opening = closing;
    const monthIncome = Number(income[index]) || 0;
    const monthExpenses = Number(expenses[index]) || 0;
    closing = opening + monthIncome - monthExpenses;
    return { opening, income: monthIncome, expenses: monthExpenses, closing };
  });
};

const projectCashflowRows = (
  income = [],
  expenses = [],
  completedMonths = 0,
  openingBalance = 0,
) => {
  const count = Math.max(0, Math.min(12, Math.trunc(completedMonths)));
  const actualRows = calculateCashflowRows(income, expenses, openingBalance);
  const completed = actualRows.slice(0, count);
  const averageExpenses = count
    ? completed.reduce((sum, row) => sum + row.expenses, 0) / count
    : 0;
  const averageClosing = count
    ? completed.reduce((sum, row) => sum + row.closing, 0) / count
    : 0;
  return actualRows.map((row, index) =>
    index < count
      ? { ...row, projected: false }
      : { expenses: averageExpenses, closing: averageClosing, projected: true },
  );
};

const cashflowOpeningForYear = (financialSeries, startYear) => {
  let opening = 0;
  for (let year = 2024; year < startYear; year += 1) {
    const group = `FY ${year}-${String(year + 1).slice(-2)}`;
    const income =
      financialSeries.find(
        (series) => series.group === group && series.name === "Income",
      )?.data || [];
    const expenses =
      financialSeries.find(
        (series) => series.group === group && series.name === "Expense",
      )?.data || [];
    opening = calculateCashflowRows(income, expenses, opening)[11].closing;
  }
  return opening;
};

const getCashflowActualMonthCount = (startYear, now = new Date()) => {
  const currentFiscalYearStart = Number(
    fiscalYearLabel(now).match(/\d{4}/)?.[0],
  );

  if (startYear < currentFiscalYearStart) return 12;
  if (startYear > currentFiscalYearStart) return 0;

  return getFinanceProjectionStartIndex(now);
};

const FinanceCashflow = ({ financialSeries, now }) => {
  const [fiscalYear, setFiscalYear] = useState("FY 2026-27");
  const [hiddenLegendItems, setHiddenLegendItems] = useState([]);
  useEffect(() => {
    setHiddenLegendItems([]);
  }, [fiscalYear]);
  const toggleLegend = (label) =>
    setHiddenLegendItems((current) =>
      current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label],
    );
  const income =
    financialSeries.find(
      (item) => item.group === fiscalYear && item.name === "Income",
    )?.data || [];
  const expenses =
    financialSeries.find(
      (item) => item.group === fiscalYear && item.name === "Expense",
    )?.data || [];
  const startYear = Number(fiscalYear.match(/\d{4}/)?.[0]);
  const completedMonths = getCashflowActualMonthCount(startYear, now);
  const openingBalance = cashflowOpeningForYear(financialSeries, startYear);
  const rows = projectCashflowRows(income, expenses, completedMonths, openingBalance);
  const amountLabel = (value) => new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.trunc(Number(value) / 100000 * 100) / 100);
  const cashflowBalance = completedMonths ? rows[completedMonths - 1].closing : openingBalance;
  const visibleAmount = (row, field, label) => hiddenLegendItems.includes(label) || (row.projected && hiddenLegendItems.includes("Projected")) ? null : field === "closing" ? Math.max(0, row.closing) : row[field];
  const availableFiscalYears = financialSeries.map((series) => Number(series.group?.match(/\d{4}/)?.[0])).filter(Number.isFinite);
  const earliestFiscalYear = availableFiscalYears.length ? Math.min(...availableFiscalYears) : 2026;
  const chartData = [...new Set(financialSeries.map((series) => series.group))].map((group) => {
    const yearStart = Number(group.match(/\d{4}/)?.[0]);
    const completed = getCashflowActualMonthCount(yearStart, now);
    const yearRows = projectCashflowRows(
      financialSeries.find((series) => series.group === group && series.name === "Income")?.data,
      financialSeries.find((series) => series.group === group && series.name === "Expense")?.data,
      completed,
      cashflowOpeningForYear(financialSeries, yearStart),
    );
    return [
      { name: "Expenses", group, data: yearRows.map((row) => visibleAmount(row, "expenses", "Expenses")) },
      { name: "Closing Balance", group, data: yearRows.map((row) => visibleAmount(row, "closing", "Closing Balance")) },
    ];
  }).flat();
  const options = {
    states: {
      hover: { filter: { type: "none" } },
      active: { filter: { type: "none" } },
    },
    chart: {
      type: "bar",
      stacked: true,
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
      animations: { enabled: false },
      foreColor: "#1E3D73",
    },
    colors: [
      ({ dataPointIndex }) =>
        rows[dataPointIndex]?.projected ? "#b4b9c5" : "#ff000080",
      ({ dataPointIndex }) =>
        rows[dataPointIndex]?.projected ? "#686f7f" : "#3cb37180",
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "48%",
        borderRadius: 2,
        dataLabels: {
          total: {
            enabled: true,
            formatter: (_value, { dataPointIndex }) => {
              const row = rows[dataPointIndex];
              if (
                !row ||
                (row.projected && hiddenLegendItems.includes("Projected"))
              )
                return "";
              const total =
                (hiddenLegendItems.includes("Expenses") ? 0 : row.expenses) +
                (hiddenLegendItems.includes("Closing Balance")
                  ? 0
                  : row.closing);
              return total === 0 ? "" : amountLabel(total);
            },
            style: { color: "#1E3D73", fontSize: "12px", fontWeight: 600 },
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (value) => (value === 0 ? "" : amountLabel(value)),
      style: { colors: ["#ffffff"], fontSize: "12px", fontWeight: 600 },
    },
    stroke: { show: false },
    fill: { opacity: 1 },
    legend: { show: false },
    grid: { borderColor: "#dbe5f1" },
    xaxis: {
      crosshairs: { show: false },
      labels: { style: { colors: "#1E3D73" } },
      axisBorder: { color: "#e5e7eb" },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      crosshairs: { show: false },
      title: { text: "Cashflow (INR)", style: { color: "#1E3D73" } },
      labels: { formatter: (value) => Math.round(value / 100000).toString() },
    },
    tooltip: {
      shared: true,
      intersect: false,
      custom: ({ dataPointIndex }) => {
        const row = rows[dataPointIndex];
        if (!row) return "";
        const amount = (value) =>
          value == null ? "\u2014" : `\u20b9 ${inrFormat(Math.trunc(value))}`;
        const line = (sign, value, label) => {
          const color =
            label === "Revenue"
              ? "#3cb37180"
              : ["Less: Payables", "Less Payable"].includes(label)
                ? "#ff000080"
                : "#1E3D73";
          return `<div style="display:flex;align-items:center;gap:5px;padding:5px 0;font-family:Poppins-Regular;font-size:12px;font-weight:400;white-space:nowrap;">${["Opening Balance", "Cash in Bank", "Closing Balance"].includes(label) ? '<span style="width:10px;margin-right:3px;"></span>' : `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${row.projected ? "#787878" : color};margin-right:3px;"></span>`}<span style="font-weight:700;">${sign ? sign + " " : ""}${amount(value)}</span><span>= ${label}</span></div>`;
        };
        const divider =
          '<div style="border-top:1px solid #cbd5e1;margin:4px 0;"></div>';
        if (row.projected) {
          const projectedLine = (label, value, color) =>
            `<div style="display:flex;align-items:center;gap:5px;padding:5px 0;font-family:Poppins-Regular;font-size:12px;white-space:nowrap;"><span style="width:10px;height:10px;border-radius:50%;background:${color};margin-right:3px;"></span><span>${label}:</span><span style="font-weight:700;">${amount(value)}</span></div>`;
          return `<div style="background:white;color:#373d3f;font-family:Poppins-Regular;font-size:12px;font-weight:400;min-width:240px;">
            <div class="apexcharts-tooltip-title" style="font-family:Poppins-Regular;font-size:12px;font-weight:400;">${dayjs(`${startYear}-04-01`).add(dataPointIndex, "month").format("MMM-YY")}</div>
            <div style="padding:4px 10px 8px;">
              ${projectedLine("Expenses", row.expenses, "#b4b9c5")}
              ${projectedLine("Closing Balance", row.closing, "#686f7f")}
              ${divider}
              ${projectedLine("Total Cashflow", row.expenses + row.closing, "#616161")}
            </div>
          </div>`;
        }
        const cashInBank = row.projected
          ? row.expenses + row.closing
          : row.opening + row.income;
        return `<div style="background:white;color:#373d3f;font-family:Poppins-Regular;font-size:12px;font-weight:400;line-height:normal;min-width:240px;">
          <div class="apexcharts-tooltip-title" style="font-family:Poppins-Regular;font-size:12px;font-weight:400;">${dayjs(`${startYear}-04-01`).add(dataPointIndex, "month").format("MMM-YY")}${row.projected ? " (Projected)" : ""}</div>
          <div style="padding:4px 10px 8px;">
          ${line("", row.projected ? null : row.opening, "Opening Balance")}
          ${line("+", row.projected ? null : row.income, "Revenue")}
          ${divider}
          ${line("", cashInBank, "Cash in Bank")}
          ${line("-", row.expenses, "Less: Payables")}
          ${divider}
          ${line("", row.closing, "Closing Balance")}
          ${divider}
          ${line("", row.expenses, "Less Payable")}
          ${line("+", row.closing, "Closing Balance")}
          ${divider}
          ${line("", row.expenses + row.closing, "Total Cashflow")}
          </div>
        </div>`;
      },
    },
  };
  return (
    <YearlyGraph
      data={chartData}
      options={options}
      title={
        <span className="inline-flex items-baseline gap-2 leading-none text-[#1E3D73]">
          <InvestorHeaderLogo />
          <span>{`CASHFLOW ${fiscalYear}`}</span>
        </span>
      }
      headerRightContent={
        <span className="flex items-center justify-center gap-1 rounded-lg border border-[#aec6fb] bg-[#dbe4ff] px-3 py-2 text-body font-pmedium text-[#274784]">
          CASHFLOW : INR {inrFormat(cashflowBalance)}
        </span>
      }
      chartTopContent={
        <div className="flex flex-wrap justify-center gap-4 text-xs text-[#1E3D73]">
          {[
            ["Expenses", "#ff000080"],
            ["Closing Balance", "#3cb37180"],
            ["Projected", "#787878"],
          ].map(([label, color]) => (
            <button
              key={label}
              type="button"
              aria-pressed={!hiddenLegendItems.includes(label)}
              onClick={() => toggleLegend(label)}
              className={`inline-flex items-center gap-1 font-pregular ${hiddenLegendItems.includes(label) ? "opacity-40" : ""}`}
            >
              <span className="h-3 w-3" style={{ backgroundColor: color }} />
              {label}
            </button>
          ))}
        </div>
      }
      chartId="finance1-cashflow"
      chartHeight={360}
      currentYear={fiscalYear}
      minFiscalYear={earliestFiscalYear}
      onYearChange={setFiscalYear}
      refreshOnDataChange
      sectionBorderColor="#1E3D73"
      sectionBodyBorderColor="#9FB2CF"
    />
  );
};

const Finance1Snapshot = ({
  incomeData,
  expenseData,
  fiscalYear,
  projectedFinancials,
  totalSqft,
  assetValueOwned,
  totalInventory,
}) => {
  const navigate = useFinanceNavigate();
  const { currency, convert } = useCurrency();
  const startYear = Number(fiscalYear.match(/\d{4}/)?.[0]);
  const money = (value) =>
    value === null ? (
      "—"
    ) : (
      <InvestorCurrencyAmount
        currency={currency}
        value={formatGraphAmount(value, currency, convert)}
      />
    );
  return (
    <WidgetSection
      border
      normalCase
      borderColor="#1E3D73"
      bodyBorderColor="#9FB2CF"
      title={
        <button
          type="button"
          onClick={() =>
            navigate(
              "/app/dashboard/finance-dashboard1/finance-3-years-snapshot",
            )
          }
          className="inline-flex flex-wrap items-baseline gap-2 text-left text-[#1E3D73]"
        >
          <InvestorHeaderLogo compact />
          <span>
            3 YEARS SNAPSHOT - FY {startYear - 2}-
            {String(startYear - 1).slice(-2)} TO {fiscalYear}
          </span>
        </button>
      }
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((offset) => {
          const year = startYear - offset;
          const label = `FY ${year}-${String(year + 1).slice(-2)}`;
          const incomes =
            incomeData.find((series) => series.group === label)?.data ||
            Array(12).fill(0);
          const expenses =
            expenseData.find((series) => series.group === label)?.data ||
            Array(12).fill(0);
          const isCurrent = offset === 0;
          const actualIncome = incomes.reduce(
            (sum, value) => sum + (Number(value) || 0),
            0,
          );
          const actualExpense = expenses.reduce(
            (sum, value) => sum + (Number(value) || 0),
            0,
          );
          const income = isCurrent
            ? Number(projectedFinancials?.revenue) || 0
            : actualIncome;
          const expense = isCurrent
            ? Number(projectedFinancials?.expense) || 0
            : actualExpense;
          const fiscalYearSqft = Math.max(
            (Number(totalSqft) || 0) -
              (offset === 1 ? 5_000 : offset === 2 ? 7_500 : 0),
            0,
          );
          const profitLoss = income - expense;
          const yearInventory = isCurrent ? Number(totalInventory) || 0 : 580;
          const yearAssetOwned = isCurrent
            ? Number(assetValueOwned) || 0
            : offset === 1
              ? 4_885_986
              : 4_427_360;
          const perSqFtIncome = fiscalYearSqft ? income / fiscalYearSqft : 0;
          const perSqFtExpense = fiscalYearSqft ? expense / fiscalYearSqft : 0;
          const perSqFtProfitLoss = perSqFtIncome - perSqFtExpense;
          const cards = [
            {
              title: null,
              rows: [
                {
                  label: "Income",
                  value: money(income),
                  tone: "text-[#12a573]",
                },
                {
                  label: "Expenses",
                  value: money(expense),
                  tone: "text-[#f04a4a]",
                },
                {
                  label: "Profit/Loss",
                  value: money(profitLoss),
                  tone: profitLoss >= 0 ? "text-[#12a573]" : "text-[#f04a4a]",
                },
                {
                  label: "Exit Inventory",
                  value: `${yearInventory.toLocaleString("en-IN")} Desks`,
                  tone: "text-[#12a573]",
                },
                {
                  label: "Asset Owned",
                  value: money(yearAssetOwned),
                  tone: "text-[#12a573]",
                },
              ],
            },
            {
              title: `${label} - TOTAL SQ FT`,
              totalSqFt: Math.round(fiscalYearSqft).toLocaleString("en-IN"),
              rows: [
                {
                  label: "Per Sq. Ft. Income",
                  value: money(Math.round(perSqFtIncome)),
                  tone: "text-[#12a573]",
                },
                {
                  label: "Per Sq. Ft. Expense",
                  value: money(Math.round(perSqFtExpense)),
                  tone: "text-[#f04a4a]",
                },
                {
                  label: "Per Sq. Ft. Profit/Loss",
                  value: money(Math.round(perSqFtProfitLoss)),
                  tone:
                    perSqFtProfitLoss >= 0
                      ? "text-[#12a573]"
                      : "text-[#f04a4a]",
                },
              ],
            },
          ];
          return (
            <div key={label} className="flex flex-col gap-3">
              {cards.map((card, cardIndex) => (
                <div
                  key={card.title}
                  className="rounded-lg border border-[#e0e8f5] bg-white px-5 py-4 shadow-sm"
                >
                  {cardIndex === 0 && (
                    <div className="mb-4 flex items-center gap-4">
                      <span
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${offset === 0 ? "bg-[#eafbf3] text-[#12a573]" : "bg-[#eaf0f8] text-[#3F6291]"}`}
                        aria-hidden="true"
                      >
                        {offset === 1 ? (
                          <MdCalendarMonth size={28} />
                        ) : (
                          <span className="flex h-8 w-8 items-end justify-center gap-1">
                            <span className="h-3 w-1.5 rounded-full bg-current" />
                            <span className="h-5 w-1.5 rounded-full bg-current" />
                            <span className="h-7 w-1.5 rounded-full bg-current" />
                          </span>
                        )}
                      </span>
                      <h3 className="font-pmedium text-base uppercase text-[#1E3D73]">
                        FY - {year}-{String(year + 1).slice(-2)} - PROJECTIONS
                      </h3>
                    </div>
                  )}
                  {card.title && (
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-pmedium text-[#1E3D73]">
                      <h4 className="uppercase">{card.title}</h4>
                      {card.totalSqFt !== undefined && (
                        <span>{card.totalSqFt}</span>
                      )}
                    </div>
                  )}
                  {card.rows.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between gap-3 border-b border-[#edf1f6] py-2 text-sm last:border-b-0"
                    >
                      <span className="text-[#3F6291]">{row.label}</span>
                      <span className={`shrink-0 ${row.tone}`}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </WidgetSection>
  );
};

const FinanceDashboard1 = () => {
  const [payoutDetails, setPayoutDetails] = useState(null);
  const payoutInvoiceFiles =
    Array.isArray(payoutDetails?.invoices) &&
    payoutDetails.invoices.some((file) => file.link)
      ? payoutDetails.invoices.filter((file) => file.link)
      : payoutDetails?.invoice?.link
        ? [payoutDetails.invoice]
        : [];
  const [payoutRejectRow, setPayoutRejectRow] = useState(null);
  const [payoutRejectReason, setPayoutRejectReason] = useState("");
  const payoutQueryClient = useQueryClient();

  const { setIsSidebarOpen } = useSidebar();
  const dispatch = useDispatch();
  const department = usePageDepartment("finance");
  const { currency, convert } = useCurrency();

  useEffect(() => {
    setIsSidebarOpen(true);
  }, []); // Empty dependency array ensures this runs once on mount

  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions?.permissions || [];
  const currentApproverName =
    [auth?.user?.firstName, auth?.user?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || auth?.user?.name || "";

  const location = useLocation();
  const navigate = useFinanceNavigate();
  const currentFiscalYearLabel = useMemo(() => {
    const today = dayjs();
    const startYear = today.month() >= 3 ? today.year() : today.year() - 1;

    return `FY ${startYear}-${String(startYear + 1).slice(-2)}`;
  }, []);

  const [selectedFiscalYear, setSelectedFiscalYear] = useState(
    currentFiscalYearLabel,
  );

  //------------------------PAGE ACCESS CARD START-------------------//
  const cardsConfig = [
    {
      route: "/app/dashboard/finance-dashboard1/cashflow",
      title: "Cashflow",
      icon: <MdFormatListBulleted />,
      permission: PERMISSIONS.FINANCE1_CASHFLOW.value,
    },
    {
      route: "/app/dashboard/finance-dashboard1/finance",
      title: "Finance",
      icon: <SiCashapp />,
      permission: PERMISSIONS.FINANCE1_FINANCE.value,
    },
    {
      route: "/app/dashboard/finance-dashboard1/billing",
      title: "Billing",
      icon: <SiCashapp />,
      permission: PERMISSIONS.FINANCE1_BILLING.value,
    },
    {
      route: "/app/dashboard/finance-dashboard1/mix-bag",
      title: "Mix-Bag",
      icon: <SiGoogleadsense />,
      permission: PERMISSIONS.FINANCE1_MIX_BAG.value,
    },
    {
      route: "/app/dashboard/finance-dashboard1/data",
      title: "Data",
      icon: <SiGoogleadsense />,
      permission: PERMISSIONS.FINANCE1_DATA.value,
    },
    {
      route: "/app/dashboard/finance-dashboard1/settings",
      title: "Settings",
      icon: <MdOutlineMiscellaneousServices />,
      permission: PERMISSIONS.FINANCE1_SETTINGS.value,
    },
  ];

  const allowedCards = cardsConfig.filter(
    (card) => !card.permission || userPermissions.includes(card.permission),
  );
  const dashboardCards = allowedCards.filter((card) =>
    ["Finance", "Billing", "Mix-Bag", "Data"].includes(card.title),
  );
  const settingsCards = allowedCards.filter(
    (card) => !["Finance", "Billing", "Mix-Bag", "Data"].includes(card.title),
  );
  const [settingsAnchor, setSettingsAnchor] = useState(null);
  //------------------------PAGE ACCESS CARD END-------------------//

  const axios = useAxiosPrivate();
  const { data: selectedDepartments = [] } = useQuery({
    queryKey: ["finance-selectedDepartments"],
    queryFn: async () => {
      const response = await axios.get(
        "api/company/get-company-data?field=selectedDepartments",
      );
      return Array.isArray(response.data?.selectedDepartments)
        ? response.data.selectedDepartments
        : [];
    },
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["finance-dashboard1-tasks", department?._id],
    queryFn: async () => {
      const response = await axios.get(
        `/api/tasks/get-tasks?dept=${department?._id}`,
      );
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: Boolean(department?._id),
  });

  const { data: financeTickets = [], isLoading: isFinanceTicketsLoading } =
    useQuery({
      queryKey: ["finance-dashboard1-tickets", department?._id],
      queryFn: async () => {
        if (!department?._id) {
          return [];
        }

        try {
          const response = await axios.get(
            `/api/tickets/department-tickets/${department._id}`,
          );
          return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
          console.error("Error fetching finance tickets:", error);
          return [];
        }
      },
      enabled: !!department?._id,
    });

  const { data: revenueExpenseData = [], isLoading: isRevenueExpenseLoading } =
    useQuery({
      queryKey: ["revenueExpenseData"],
      queryFn: async () => {
        try {
          const response = await axios.get("/api/finance/income-expense");
          return response.data?.response;
        } catch (error) {
          console.error(error);
        }
      },
      staleTime: 0,
      refetchOnMount: "always",
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    });

  const { data: budgetData = [], isLoading: isBudgetDataLoading } = useQuery({
    queryKey: ["budgetData", "finance-dashboard1"],
    queryFn: async () => {
      const res = await axios.get("/api/budget/company-budget", {
        params: { view: "dashboard" },
      });
      return res.data?.allBudgets;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const { data: simpleRevenue = {} } = useQuery({
    queryKey: ["finance-dashboard1-simpleRevenue"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          "/api/sales/simple-consolidated-revenue",
        );
        return response.data || {};
      } catch (error) {
        console.error(error);
        return {};
      }
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const uniqueClientsSummary = useMemo(
    () => uniqueClientGraphSummary(simpleRevenue),
    [simpleRevenue],
  );

  const selectedPayoutMonth = dayjs().format("MMM-YY");
  const chartPayoutMonth = dayjs().subtract(1, "month").format("MMM-YY");

  const payoutMonthPayments = isBudgetDataLoading
    ? []
    : budgetData.filter(
      (item) =>
        item?.dueDate &&
        dayjs(item.dueDate).format("MMM-YY") === selectedPayoutMonth,
    );
  const payoutSummary = payoutMonthPayments.reduce(
    (summary, item) => {
      const status = String(item?.status || "").trim().toLowerCase();
      const amount = Number(item?.projectedAmount) || 0;

      summary.total.count += 1;
      summary.total.amount += amount;

      if (summary[status]) {
        summary[status].count += 1;
        summary[status].amount += amount;
      }

      return summary;
    },
    {
      total: { count: 0, amount: 0 },
      approved: { count: 0, amount: 0 },
      pending: { count: 0, amount: 0 },
      rejected: { count: 0, amount: 0 },
    },
  );

  const chartPayoutMonthPayments = isBudgetDataLoading
    ? []
    : budgetData.filter(
        (item) =>
          item?.dueDate &&
          dayjs(item.dueDate).format("MMM-YY") === chartPayoutMonth,
      );

  const financeBudgetsRaw = isBudgetDataLoading
    ? []
    : budgetData.filter(
        (item) => item.department?._id === "6798bab0e469e809084e249a",
      );

  const financeBudgets = financeBudgetsRaw.filter(
    (item) => item.expanseType === "Statutory Payments",
  );

  const currentMonthStatutoryPayments = financeBudgets.filter(
    (item) =>
      item?.dueDate &&
      dayjs(item.dueDate).format("MMM-YY") === chartPayoutMonth,
  );

  const testExpense = Array.isArray(budgetData) ? budgetData : [];

  const testIncome = revenueExpenseData.filter((item) => item.income);

  const testUnits = revenueExpenseData
    .filter((item) => item.units)
    .flatMap((item) => item.units);

  const totalSqft = testUnits.reduce(
    (sum, item) => sum + (Number(item?.sqft) || 0),
    0,
  );
  const managerByDepartmentName = useMemo(() => {
    const map = new Map();

    selectedDepartments.forEach((item) => {
      const departmentName = item?.department?.name?.trim();
      if (departmentName) {
        map.set(departmentName.toLowerCase(), item?.admin || "Unassigned");
      }
    });

    return map;
  }, [selectedDepartments]);

  const pendingDepartmentTasks = useMemo(
    () =>
      tasks.filter(
        (task) => task?.taskType === "Department" && task?.status === "Pending",
      ),
    [tasks],
  );

  const unitWiseTaskData = useMemo(() => {
    const groupedTasks = pendingDepartmentTasks.reduce((acc, task) => {
      const unitName = task?.location?.unitNo || "Unassigned";

      if (!acc[unitName]) {
        acc[unitName] = {
          unit: unitName,
          tasks: 0,
        };
      }

      acc[unitName].tasks += 1;
      return acc;
    }, {});

    return Object.values(groupedTasks).sort((a, b) =>
      a.unit.localeCompare(b.unit, undefined, { numeric: true }),
    );
  }, [pendingDepartmentTasks]);

  const unitWisePieData = unitWiseTaskData.map((item) => ({
    label: item.unit,
    value: item.tasks,
  }));

  const unitPieChartOptions = {
    labels: unitWisePieData.map((item) => item.label),
    chart: {
      fontFamily: "Poppins-Regular",
      events: {
        dataPointSelection: () => {
          navigate("/app/tasks");
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} Due tasks`,
      },
    },
  };

  const executiveTasks = useMemo(() => {
    const groupedTasks = pendingDepartmentTasks.reduce((acc, task) => {
      const departmentName =
        typeof task?.department === "object"
          ? task?.department?.name
          : task?.department || department?.name || "Unknown Department";
      const managerName =
        managerByDepartmentName.get(departmentName.toLowerCase()) ||
        "Unassigned";
      if (!acc[managerName]) {
        acc[managerName] = {
          name: managerName,
          tasks: 0,
        };
      }

      acc[managerName].tasks += 1;
      return acc;
    }, {});

    return Object.values(groupedTasks).sort((a, b) => b.tasks - a.tasks);
  }, [department?.name, managerByDepartmentName, pendingDepartmentTasks]);

  const executiveTaskLabels = executiveTasks.map((item) => item.name);
  const executiveTasksCount = executiveTasks.map((item) => item.tasks);
  const executiveTaskColors = [
    "#FF5733",
    "#FFC300",
    "#28B463",
    "#5B6CFF",
    "#9B59B6",
    "#17A2B8",
    "#E67E22",
    "#E91E63",
  ];

  const financeCategoryWiseTickets = useMemo(() => {
    if (isFinanceTicketsLoading || !Array.isArray(financeTickets)) return [];

    const categoryCountMap = financeTickets.reduce((acc, item) => {
      const category = String(item?.ticket || "Others").trim() || "Others";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const sortedCategories = Object.entries(categoryCountMap)
      .map(([label, value]) => ({ label, value }))
      .sort((first, second) => second.value - first.value);

    if (sortedCategories.length <= 5) {
      return sortedCategories;
    }

    const topCategories = sortedCategories.slice(0, 5);
    const othersCount = sortedCategories
      .slice(5)
      .reduce((sum, item) => sum + item.value, 0);

    return [...topCategories, { label: "Others", value: othersCount }];
  }, [financeTickets, isFinanceTicketsLoading]);

  const financeCategoryWiseTicketsData = financeCategoryWiseTickets.map(
    (item) => ({
      label: item.label,
      value: item.value,
    }),
  );

  const financeCategoryWiseTicketsOptions = {
    labels: financeCategoryWiseTickets.map((item) => item.label),
    chart: {
      fontFamily: "Poppins-Regular",
    },
    legend: {
      horizontalAlign: "center",
      itemMargin: {
        horizontal: 4,
        vertical: 2,
      },
      formatter: (seriesName) =>
        `<span title="${seriesName}" style="display:inline-block;max-width:92px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;vertical-align:bottom;font-size:12px;line-height:1.2;">${seriesName}</span>`,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["#ffffff"],
    },
    colors: ["#274C77", "#6096BA", "#A3CEF1", "#8B5E3C", "#5B8E7D", "#D08C60"],
    tooltip: {
      fillSeriesColor: false,
      custom: ({ series, seriesIndex, w }) => {
        const category =
          financeCategoryWiseTickets?.[seriesIndex]?.label ||
          w?.globals?.labels?.[seriesIndex] ||
          "Unknown";
        const count = series?.[seriesIndex] ?? 0;
        const color =
          w?.globals?.colors?.[seriesIndex] ||
          financeCategoryWiseTicketsOptions.colors[
            seriesIndex % financeCategoryWiseTicketsOptions.colors.length
          ];

        return `<div style="
          padding:8px 12px;
          font-size:12px;
          font-family:Poppins-Regular;
          font-weight:600;
          background:${color};
          color:#fff;
          border-radius:6px;
        ">
          ${category} : ${count}
        </div>`;
      },
    },
  };

  const financePendingStatuses = new Set([
    "open",
    "pending",
    "in progress",
    "escalated",
  ]);

  const financePendingTicketsCount = (
    Array.isArray(financeTickets) ? financeTickets : []
  ).filter((ticket) =>
    financePendingStatuses.has(String(ticket?.status || "").toLowerCase()),
  ).length;

  const financeCompletedTicketsCount = (
    Array.isArray(financeTickets) ? financeTickets : []
  ).filter(
    (ticket) => String(ticket?.status || "").toLowerCase() === "closed",
  ).length;

  const financeDueTicketsData = [
    { label: "Completed", value: financeCompletedTicketsCount },
    { label: "Pending", value: financePendingTicketsCount },
  ];

  const financeDueTicketsOptions = {
    labels: financeDueTicketsData.map((item) => item.label),
    chart: {
      fontFamily: "Poppins-Regular",
    },
    legend: {
      horizontalAlign: "center",
      itemMargin: {
        horizontal: 8,
        vertical: 4,
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["#ffffff"],
    },
    colors: ["#59C9A5", "#FCA5A5"],
    tooltip: {
      fillSeriesColor: false,
      custom: ({ series, seriesIndex, w }) => {
        const label = w?.globals?.labels?.[seriesIndex] || "Unknown";
        const count = series?.[seriesIndex] ?? 0;
        const color =
          w?.globals?.colors?.[seriesIndex] ||
          financeDueTicketsOptions.colors[
            seriesIndex % financeDueTicketsOptions.colors.length
          ];

        return `<div style="
          padding:8px 12px;
          font-size:12px;
          font-family:Poppins-Regular;
          font-weight:600;
          background:${color};
          color:#fff;
          border-radius:6px;
        ">
          ${label} : ${count}
        </div>`;
      },
    },
  };

  // const yearCategories = {
  //   "FY 2024-25": [
  //     "Apr-24",
  //     "May-24",
  //     "Jun-24",
  //     "Jul-24",
  //     "Aug-24",
  //     "Sep-24",
  //     "Oct-24",
  //     "Nov-24",
  //     "Dec-24",
  //     "Jan-25",
  //     "Feb-25",
  //     "Mar-25",
  //   ],
  //   "FY 2025-26": [
  //     "Apr-25",
  //     "May-25",
  //     "Jun-25",
  //     "Jul-25",
  //     "Aug-25",
  //     "Sep-25",
  //     "Oct-25",
  //     "Nov-25",
  //     "Dec-25",
  //     "Jan-26",
  //     "Feb-26",
  //     "Mar-26",
  //   ],
  // };
  const excludedMonths = ["Jan-24", "Feb-24", "Mar-24"];

  const incomeSources = useMemo(() => {
    if (!simpleRevenue) return [];
    const flatten = [];

    simpleRevenue.meetingRevenue?.forEach((item) => {
      flatten.push({
        revenue: getGraphNumericAmount(item.taxable),
        date: item.date,
        normalizedStatus: isGraphMeetingFinancePaid(item) ? "paid" : "unpaid",
      });
    });

    simpleRevenue.alternateRevenues?.forEach((item) => {
      flatten.push({
        revenue: getGraphNumericAmount(item.taxableAmount),
        date: item.invoiceCreationDate,
        normalizedStatus: getGraphNormalizedPaymentStatus(item.status),
      });
    });

    simpleRevenue.virtualOfficeRevenues?.forEach((item) => {
      flatten.push({
        revenue: getGraphVirtualOfficeReportingAmount(item),
        date: item.rentDate,
        normalizedStatus: getGraphNormalizedPaymentStatus(
          item.rentStatus ?? item.status,
        ),
      });
    });

    simpleRevenue.workationRevenues?.forEach((item) => {
      flatten.push({
        revenue: getGraphNumericAmount(item.taxableAmount),
        date: item.date,
        normalizedStatus: getGraphNormalizedPaymentStatus(item.status),
      });
    });

    simpleRevenue.coworkingRevenues?.forEach((item) => {
      flatten.push({
        revenue: getGraphNumericAmount(item.revenue),
        date: item.rentDate,
        normalizedStatus: getGraphNormalizedPaymentStatus(item.rentStatus),
      });
    });

    return flatten;
  }, [simpleRevenue]);

  const getFiscalYearLabel = (dateInput) => {
    const parsedDate = dayjs(dateInput);
    if (!parsedDate.isValid()) return null;

    const startYear =
      parsedDate.month() >= 3 ? parsedDate.year() : parsedDate.year() - 1;

    return `FY ${startYear}-${String(startYear + 1).slice(-2)}`;
  };

  const buildFiscalYearMonths = (fiscalYear) => {
    const startYear = Number(String(fiscalYear).match(/\d{4}/)?.[0]);
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
    ].map((month, index) => {
      const year = index < 9 ? startYear : startYear + 1;
      return `${month}-${String(year).slice(-2)}`;
    });
  };

  const yearCategories = useMemo(() => {
    const fiscalYears = new Set([
      "FY 2024-25",
      "FY 2025-26",
      currentFiscalYearLabel,
    ]);

    incomeSources.forEach((income) => {
      const fiscalYear = getFiscalYearLabel(income.date);
      if (fiscalYear) fiscalYears.add(fiscalYear);
    });

    testExpense.forEach((expense) => {
      const fiscalYear = getFiscalYearLabel(expense.dueDate);
      if (fiscalYear) fiscalYears.add(fiscalYear);
    });

    return [...fiscalYears]
      .sort(
        (a, b) =>
          Number(a.match(/\d{4}/)?.[0] || 0) -
          Number(b.match(/\d{4}/)?.[0] || 0),
      )
      .reduce((acc, fiscalYear) => {
        acc[fiscalYear] = buildFiscalYearMonths(fiscalYear);
        return acc;
      }, {});
  }, [currentFiscalYearLabel, incomeSources, testExpense]);

  const monthWiseIncome = {};
  incomeSources.forEach((income) => {
    const rawDate = income.date;
    if (!rawDate) return;
    const monthKey = dayjs(rawDate).format("MMM-YY");
    if (excludedMonths.includes(monthKey)) return;

    if (income.normalizedStatus !== "paid") return;

    const amount = income.revenue || 0;
    if (!monthWiseIncome[monthKey]) {
      monthWiseIncome[monthKey] = {
        month: monthKey,
        actualIncome: 0,
        incomes: [],
      };
    }
    monthWiseIncome[monthKey].actualIncome += amount;
    monthWiseIncome[monthKey].incomes.push(income);
  });

  const incomeMap = {};
  Object.values(monthWiseIncome).forEach((item) => {
    incomeMap[item.month] = item.actualIncome;
  });

  const incomeData = Object.entries(yearCategories).map(
    ([fiscalYear, months]) => ({
      name: "Income",
      group: fiscalYear,
      data: months.map((month) => incomeMap[month] || 0),
    }),
  );

  const selectedYearMonths = yearCategories[selectedFiscalYear] || [];
  const previousCalendarMonthLabel = dayjs()
    .subtract(1, "month")
    .format("MMM-YY");
  const summaryMonthLabel = selectedYearMonths.includes(
    previousCalendarMonthLabel,
  )
    ? previousCalendarMonthLabel
    : selectedYearMonths[selectedYearMonths.length - 1] || "-";
  const summaryMonthIndex = selectedYearMonths.findIndex(
    (month) => month === summaryMonthLabel,
  );

  const monthWiseExpenses = {};
  testExpense.forEach((exp) => {
    const monthKey = dayjs(exp.dueDate).format("MMM-YY");
    if (excludedMonths.includes(monthKey)) return;

    if (!monthWiseExpenses[monthKey]) {
      monthWiseExpenses[monthKey] = {
        month: monthKey,
        actualExpense: 0,
        projectedExpense: 0,
        expenses: [],
      };
    }

    monthWiseExpenses[monthKey].actualExpense += exp.actualAmount || 0;
    monthWiseExpenses[monthKey].projectedExpense += exp.projectedAmount || 0;
    monthWiseExpenses[monthKey].expenses.push(exp);
  });
  const transformedExpenses = Object.values(monthWiseExpenses);
  const sortedExpenses = transformedExpenses.sort((a, b) =>
    dayjs(a.month, "MMM-YY").isAfter(dayjs(b.month, "MMM-YY")) ? 1 : -1,
  );

  const expenseMap = {};
  Object.values(monthWiseExpenses).forEach((item) => {
    expenseMap[item.month] = item.actualExpense;
  });

  const expenseData = Object.entries(yearCategories).map(
    ([fiscalYear, months]) => ({
      name: "Expense",
      group: fiscalYear,
      data: months.map((month) => expenseMap[month] || 0),
    }),
  );

  const currentIncomeSeries = incomeData.find(
    (item) => item.group === selectedFiscalYear,
  );

  const currentExpenseSeries = expenseData.find(
    (item) => item.group === selectedFiscalYear,
  );

  const snapshotFinancialsByYear = Object.fromEntries(
    incomeData.map((series) => {
      const income = series.data.reduce(
        (sum, value) => sum + (Number(value) || 0),
        0,
      );
      const expense = (
        expenseData.find((item) => item.group === series.group)?.data || []
      ).reduce((sum, value) => sum + (Number(value) || 0), 0);
      return [series.group, { income, expense, profitLoss: income - expense }];
    }),
  );
  const previousFiscalStartYear =
    Number(selectedFiscalYear.match(/\d{4}/)?.[0]) - 1;
  const previousIncomeSeries = incomeData.find(
    (series) =>
      Number(series.group.match(/\d{4}/)?.[0]) === previousFiscalStartYear,
  );
  const previousYearIncome =
    previousIncomeSeries?.data.reduce(
      (sum, value) => sum + (Number(value) || 0),
      0,
    ) || 0;
  const totalIncomeAmount = currentIncomeSeries
    ? currentIncomeSeries.data.reduce((acc, val) => acc + val, 0)
    : 0;

  const totalExpense = currentExpenseSeries
    ? currentExpenseSeries.data.reduce((acc, val) => acc + val, 0)
    : 0;

  useEffect(() => {
    if (totalIncomeAmount) {
      dispatch(setTotalIncome(totalIncomeAmount));
    }

    if (totalExpense) {
      dispatch(setTotalExpense(totalExpense));
    }
  }, [totalIncomeAmount, totalExpense, dispatch, setIsSidebarOpen]);

  //------------------Expensedata----------------------//

  const summaryMonthIncome =
    summaryMonthIndex >= 0
      ? currentIncomeSeries?.data?.[summaryMonthIndex] || 0
      : 0;
  const summaryMonthExpense =
    summaryMonthIndex >= 0
      ? currentExpenseSeries?.data?.[summaryMonthIndex] || 0
      : 0;
  //----------INCOME-EXPENSE GRAPH conversion------------------//

  //-----------------------------------------------------Graph------------------------------------------------------//
  const [projectionMonth, setProjectionMonth] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = new Date();
      setProjectionMonth((previous) =>
        previous.getMonth() === now.getMonth() &&
        previous.getFullYear() === now.getFullYear()
          ? previous
          : now,
      );
    }, 60000);
    return () => window.clearInterval(timer);
  }, []);
  const incomeExpenseData = [...incomeData, ...expenseData].map((series) => ({
    ...series,
    data: projectFinanceSeries(
      series.data,
      series.group,
      series.name,
      projectionMonth,
    ).data,
  }));
  const projectionFlags = projectFinanceSeries(
    [],
    selectedFiscalYear,
    "Income",
    projectionMonth,
  ).projected;
  const [hiddenFinanceLegendItems, setHiddenFinanceLegendItems] = useState([]);
  useEffect(() => {
    setHiddenFinanceLegendItems([]);
  }, [selectedFiscalYear]);
  const toggleFinanceLegend = (label) =>
    setHiddenFinanceLegendItems((current) =>
      current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label],
    );
  const visibleIncomeExpenseData = incomeExpenseData.map((series) => {
    const flags = projectFinanceSeries(
      [],
      series.group,
      series.name,
      projectionMonth,
    ).projected;
    return {
      ...series,
      data: series.data.map((value, index) =>
        hiddenFinanceLegendItems.includes(
          flags[index] ? "Projected" : series.name,
        )
          ? null
          : value,
      ),
    };
  });
  const financeProjectionLegend = (
    <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#1E3D73]">
      {[
        { label: "Income", color: INVESTOR_INCOME_COLOR },
        { label: "Expense", color: INVESTOR_EXPENSE_COLOR },
        { label: "Projected", color: INVESTOR_PROJECTED_COLOR },
      ].map(({ label, color }) => (
        <button
          key={label}
          type="button"
          aria-pressed={!hiddenFinanceLegendItems.includes(label)}
          onClick={() => toggleFinanceLegend(label)}
          className={`flex items-center gap-1.5 ${hiddenFinanceLegendItems.includes(label) ? "opacity-40" : ""}`}
        >
          <span
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: color }}
          />
          {label}
        </button>
      ))}
    </div>
  );
  const displayedIncomeSeries = incomeExpenseData.find(
    (series) => series.name === "Income" && series.group === selectedFiscalYear,
  );
  const displayedExpenseSeries = incomeExpenseData.find(
    (series) =>
      series.name === "Expense" && series.group === selectedFiscalYear,
  );
  const projectedIncomeTotal = Math.round(
    (displayedIncomeSeries?.data || []).reduce(
      (sum, value) => sum + (Number(value) || 0),
      0,
    ),
  );
  const projectedExpenseTotal = Math.round(
    (displayedExpenseSeries?.data || []).reduce(
      (sum, value) => sum + (Number(value) || 0),
      0,
    ),
  );
  const projectedProfitLoss = projectedIncomeTotal - projectedExpenseTotal;
  const projectedSnapshotFinancialsByYear = {
    ...snapshotFinancialsByYear,
    [currentFiscalYearLabel]: {
      income: projectedIncomeTotal,
      expense: projectedExpenseTotal,
      profitLoss: projectedProfitLoss,
    },
  };
  const projectedIncomeGrowth = previousYearIncome
    ? ((projectedIncomeTotal - previousYearIncome) / previousYearIncome) * 100
    : 0;
  const projectionAxisStep = 2_500_000;
  const highestProjectionValue = Math.max(
    0,
    ...(displayedIncomeSeries?.data || []),
    ...(displayedExpenseSeries?.data || []),
  );
  const incomeExpenseAxisMax = Math.max(
    7_500_000,
    Math.ceil(highestProjectionValue / projectionAxisStep) * projectionAxisStep,
  );
  const highestConvertedProjectionValue = convert(highestProjectionValue);
  const projectionDisplayScale =
    currency === "INR" || highestConvertedProjectionValue >= 100_000
      ? 100_000
      : 1_000;
  const projectionScaleLabel =
    projectionDisplayScale === 100_000 ? "Lakhs" : "Thousands";
  const projectionBarFractionDigits =
    currency === "INR" || projectionDisplayScale === 100_000 ? 2 : 1;
  const applyFinanceProjectionGradients = () => {
    window.requestAnimationFrame(() => {
      const chart = document.querySelector("#bargraph-finance-income");
      const svg = chart?.querySelector("svg");
      if (!svg) return;

      let defs = svg.querySelector("defs");
      if (!defs) {
        defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        svg.prepend(defs);
      }

      const ensureGradient = (id, startColor, endColor) => {
        let gradient = svg.querySelector(`#${id}`);
        if (gradient) return;

        gradient = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "linearGradient",
        );
        gradient.setAttribute("id", id);
        gradient.setAttribute("x1", "0%");
        gradient.setAttribute("y1", "0%");
        gradient.setAttribute("x2", "100%");
        gradient.setAttribute("y2", "0%");

        const start = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "stop",
        );
        start.setAttribute("offset", "0%");
        start.setAttribute("stop-color", startColor);
        const end = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "stop",
        );
        end.setAttribute("offset", "100%");
        end.setAttribute("stop-color", endColor);
        gradient.append(start, end);
        defs.append(gradient);
      };

      ensureGradient(
        "finance-income-gradient",
        INVESTOR_INCOME_COLOR,
        INVESTOR_INCOME_GRADIENT_END,
      );
      ensureGradient(
        "finance-expense-gradient",
        INVESTOR_EXPENSE_COLOR,
        INVESTOR_EXPENSE_GRADIENT_END,
      );

      svg.querySelectorAll("path, rect").forEach((bar) => {
        bar.style.transform = "";
        bar.style.transformBox = "";
        bar.style.transformOrigin = "";

        const fill = bar.getAttribute("fill")?.toLowerCase();
        if (fill === INVESTOR_INCOME_COLOR.toLowerCase()) {
          bar.setAttribute("fill", "url(#finance-income-gradient)");
        } else if (
          fill === INVESTOR_EXPENSE_COLOR.toLowerCase() ||
          fill === "#ff0000"
        ) {
          bar.setAttribute("fill", "url(#finance-expense-gradient)");
        }
      });

      const hideIncome = hiddenFinanceLegendItems.includes("Income");
      const hideExpense = hiddenFinanceLegendItems.includes("Expense");
      const visibleActualSeries =
        hideIncome !== hideExpense ? (hideIncome ? "Expense" : "Income") : null;

      if (!visibleActualSeries) return;

      const seriesGroup = svg.querySelector(
        `.apexcharts-series[seriesName="${visibleActualSeries}"]`,
      );
      if (!seriesGroup) return;

      seriesGroup.querySelectorAll("path, rect").forEach((bar) => {
        const dataPointIndex = Number(
          bar.getAttribute("j") ??
            bar.getAttribute("data:realIndex") ??
            bar.getAttribute("data-realIndex"),
        );

        if (
          !Number.isInteger(dataPointIndex) ||
          projectionFlags[dataPointIndex]
        ) {
          return;
        }

        bar.style.transformBox = "fill-box";
        bar.style.transformOrigin = "center";
        bar.style.transform = "scaleX(1.95)";
      });
    });
  };

  const incomeExpenseOptions = {
    states: {
      hover: { filter: { type: "none" } },
      active: { filter: { type: "none" } },
    },
    chart: {
      id: "income-vs-expense-bar",
      animations: {
        enabled: false, // ✅ disables all animations
      },
      events: {
        mounted: applyFinanceProjectionGradients,
        updated: applyFinanceProjectionGradients,
        dataPointSelection: () => {
          navigate("/app/dashboard/finance-dashboard1/monthly-profit-loss");
        },
      },
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
      foreColor: "#1E3D73",
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
        dataLabels: {
          position: "top",
        },
      },
    },
    legend: {
      show: false,
      position: "top",
      labels: { colors: "#1E3D73" },
    },
    dataLabels: {
      enabled: true,
      formatter: (value) =>
        Number(value) > 0
          ? formatGraphScaleAmount(
              value,
              convert,
              projectionDisplayScale,
              projectionBarFractionDigits,
              "de-DE",
            )
          : "",
      offsetY: -20,
      style: { colors: ["#1E3D73"], fontSize: "12px", fontWeight: 600 },
      background: { enabled: false },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["#ffffff"],
    },
    grid: { padding: { left: 24, right: 24 } },
    xaxis: {
      tickPlacement: "between",
      crosshairs: { show: false },
      labels: { style: { colors: "#1E3D73" } },
    },
    yaxis: {
      min: 0,
      max: incomeExpenseAxisMax,
      tickAmount: incomeExpenseAxisMax / projectionAxisStep,
      forceNiceScale: false,
      title: {
        text: `Amount In ${projectionScaleLabel} (${currency})`,
        style: { color: "#1E3D73" },
      },
      labels: {
        formatter: (value) =>
          currency === "INR"
            ? `${Math.round(value / 100_000)}`
            : `${Math.round(convert(value) / 1_000)}`,
        style: { colors: "#1E3D73" },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      theme: "light",
      shared: false,
      intersect: true,
      style: { fontSize: "12px", fontFamily: "Poppins-Regular" },
      y: {
        formatter: (value) => {
          const formattedValue = formatGraphAmount(value, currency, convert);
          if (currency === "AED") {
            return `<span style="display:inline-flex;align-items:center;gap:0.3em;direction:ltr;white-space:nowrap;font-size:inherit;line-height:1;vertical-align:middle;">${AED_TOOLTIP_SYMBOL}<span style="display:inline-block;line-height:1;">${formattedValue}</span></span>`;
          }
          return `${INVESTOR_CURRENCY_SYMBOLS[currency] || currency} ${formattedValue}`;
        },
      },
    },
  };

  //-----------------------------------------------------Graph------------------------------------------------------//
  //-----------------------------------------------------DataCards------------------------------------------------------//
  const incomeCardData = {
    cardTitle: "Income",
    timePeriod: selectedFiscalYear,
    descriptionData: [
      {
        title: summaryMonthLabel,
        value: `INR ${inrFormat(summaryMonthIncome)}`,
        route: "monthly-profit-loss",
      },
      {
        title: "Annual Average",
        value: `INR ${inrFormat(totalIncomeAmount / 12)}`,
        route: "annual-average-profit-loss",
      },
      {
        title: "Overall",
        value: `INR ${inrFormat(totalIncomeAmount)}`,
        route: "overall-profit-loss",
      },
      {
        title: "Per Sq. Ft.",
        value: `INR ${inrFormat(totalIncomeAmount / totalSqft)}`,
        route: "sqft-wise-data",
      },
    ],
  };

  const expenseCardData = {
    cardTitle: "Expense",
    timePeriod: selectedFiscalYear,
    descriptionData: [
      {
        title: summaryMonthLabel,
        value: `INR ${inrFormat(summaryMonthExpense)}`,
        route: "monthly-profit-loss",
      },
      {
        title: "Annual Average",
        value: `INR ${inrFormat(totalExpense / 12)}`,
        route: "annual-average-profit-loss",
      },
      {
        title: "Overall",
        value: `INR ${inrFormat(totalExpense)}`,
        route: "overall-profit-loss",
      },
      {
        title: "Per Sq. Ft.",
        value: `INR ${inrFormat(totalExpense / totalSqft)}`,
        route: "sqft-wise-data",
      },
    ],
  };

  const netSavingsCardData = {
    cardTitle: "Profit & Loss",
    timePeriod: selectedFiscalYear,
    descriptionData: [
      {
        title: summaryMonthLabel,
        value: `INR ${inrFormat(summaryMonthIncome - summaryMonthExpense)}`,
        route: "monthly-profit-loss",
      },
      {
        title: "Annual Average",
        value: `INR ${inrFormat((totalIncomeAmount - totalExpense) / 12)}`,
        route: "annual-average-profit-loss",
      },
      {
        title: "Overall",
        value: `INR ${inrFormat(totalIncomeAmount - totalExpense)}`,
        route: "overall-profit-loss",
      },
      {
        title: "Per Sq. Ft.",
        value: `INR ${inrFormat(
          (totalIncomeAmount - totalExpense) / totalSqft,
        )}`,
        route: "sqft-wise-data",
      },
    ],
  };

  //-----------------------------------------------------DataCards------------------------------------------------------//
  //-----------------------------------------------------Pie Monthly Payout------------------------------------------------------//
  const clientPayouts = chartPayoutMonthPayments.map((expense) => ({
    clientName: expense.expanseName,
    amount: expense.actualAmount || 0,
    status: expense.status === "Approved" ? "approved" : "pending",
    date: dayjs(expense.dueDate).format("DD-MMM-YYYY"), // e.g., "15-May-2024"
  }));

  const approvedClients = clientPayouts.filter((c) => c.status === "approved");
  const pendingClients = clientPayouts.filter((c) => c.status === "pending");
  const approvedPayoutValue = approvedClients.reduce(
    (sum, client) => sum + client.amount,
    0,
  );
  const pendingPayoutValue = pendingClients.reduce(
    (sum, client) => sum + client.amount,
    0,
  );
  const totalPayoutValue = approvedPayoutValue + pendingPayoutValue;
  const payoutPieStartAngle = totalPayoutValue
    ? 180 - (approvedPayoutValue / totalPayoutValue) * 180
    : 90;

  const pieMonthlyPayoutData = [
    {
      label: "Approved",
      value: Math.round(approvedPayoutValue),
      clients: approvedClients,
    },
    {
      label: "Pending",
      value: Math.round(pendingPayoutValue),
      clients: pendingClients,
    },
  ];

  const pieMonthlyPayoutOptions = {
    chart: {
      fontFamily: "Poppins-Regular",
      events: {
        dataPointSelection: function (event, chartContext, config) {
          const dataPointIndex = config.dataPointIndex;
          const selectedCategory = pieMonthlyPayoutData[dataPointIndex];

          // Perform navigation or logic
          if (selectedCategory) {
            // Example: navigate or log the label/value

            // Replace with actual navigation logic
            navigate(`finance`);
          }
        },
      },
    },
    colors: ["#4CAF50", "#FDE3A7"],
    labels: pieMonthlyPayoutData.map((item) => item.label),
    legend: {
      show: true,
      position: "right",
    },
    dataLabels: {
      formatter: (val) => `${val.toFixed(1)}%`,
      style: {
        fontSize: "14px",
      },
    },
    tooltip: {
      custom: function ({ seriesIndex }) {
        const category = pieMonthlyPayoutData[seriesIndex];
        const isPending = category?.label === "Pending";

        return `
          <div style="
            padding: 6px 10px;
            border-radius: 4px;
            background: ${isPending ? "#FDE3A7" : "#4CAF50"};
            color: ${isPending ? "#000000" : "#FFFFFF"};
            font-family: Poppins-Regular;
            font-size: 12px;
            font-weight: 600;
          ">
            ${category?.label || ""}: INR ${category?.value?.toLocaleString("en-IN") || 0}
          </div>
        `;
      },
    },
    plotOptions: {
      pie: {
        // startAngle: payoutPieStartAngle,
        // endAngle: payoutPieStartAngle + 180,
        expandOnClick: true,
      },
    },
  };

  //-----------------------------------------------------Pie Monthly Payout------------------------------------------------------//
  //-----------------------------------------------------Pie Monthly Collections------------------------------------------------------//
  // 1. Safe data access from the array structure
  const incomeEntry = Array.isArray(revenueExpenseData)
    ? revenueExpenseData.find((entry) => entry.income)
    : null;

  const income = incomeEntry?.income;
  const currentCollectionsMonth = dayjs().subtract(1, "month").format("MMM-YY");

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

  const unifiedRevenueData = useMemo(() => {
    const flatten = [];

    simpleRevenue.meetingRevenue?.forEach((item) => {
      flatten.push({
        revenue: getNumericAmount(item.taxable),
        date: item.date,
        normalizedStatus: getNormalizedPaymentStatus(item.status),
      });
    });

    simpleRevenue.alternateRevenues?.forEach((item) => {
      flatten.push({
        revenue: getNumericAmount(item.taxableAmount),
        date: item.invoiceCreationDate,
        normalizedStatus: getNormalizedPaymentStatus(item.status),
      });
    });

    simpleRevenue.virtualOfficeRevenues?.forEach((item) => {
      flatten.push({
        revenue: getNumericAmount(item.revenue ?? item.taxableAmount),
        date: item.rentDate,
        normalizedStatus: getNormalizedPaymentStatus(
          item.status ?? item.rentStatus,
        ),
      });
    });

    simpleRevenue.workationRevenues?.forEach((item) => {
      flatten.push({
        revenue: getNumericAmount(item.taxableAmount),
        date: item.date,
        normalizedStatus: getNormalizedPaymentStatus(item.status),
      });
    });

    simpleRevenue.coworkingRevenues?.forEach((item) => {
      flatten.push({
        revenue: getNumericAmount(item.revenue),
        date: item.rentDate,
        normalizedStatus: getNormalizedPaymentStatus(item.rentStatus),
      });
    });

    return flatten;
  }, [simpleRevenue]);

  // 2. Calculation function (unchanged but included for completeness)
  const calculatePaidVsUnpaid = (revenueData = []) => {
    let paid = 0;
    let unpaid = 0;

    revenueData.forEach((item) => {
      if (!item.date || !dayjs(item.date).isValid()) return;

      const monthKey = dayjs(item.date).format("MMM-YY");
      if (monthKey !== currentCollectionsMonth) return;

      const amount = getNumericAmount(item.revenue);

      if (item.normalizedStatus === "paid") {
        paid += amount;
      } else {
        unpaid += amount;
      }
    });

    return { paid, unpaid };
  };

  // 3. Safely calculate paid and unpaid values
  const { paid, unpaid } = unifiedRevenueData.length
    ? calculatePaidVsUnpaid(unifiedRevenueData)
    : { paid: 0, unpaid: 0 };

  // 4. Prepare pie chart data
  const pieChartData = [
    { label: "Paid", value: paid },
    { label: "Unpaid", value: unpaid },
  ];

  const pieChartOptions = {
    chart: {
      fontFamily: "Poppins-Regular",
    },
    labels: ["Paid", "Unpaid"],
    colors: ["#66DB66", "#EA9A87"],
    legend: {
      position: "right",
    },
    dataLabels: {
      formatter: function (val) {
        return `${val.toFixed(0)}%`;
      },
    },
    tooltip: {
      y: {
        formatter: function (value) {
          return `INR ${inrFormat(value.toFixed(0))}`;
        },
      },
    },
  };

  // const pieMonthlyCollectionOptions = {
  //   chart: {
  //     fontFamily: "Poppins-Regular",
  //   },
  //   colors: ["#2196F3", "#FF9800"], // Blue for collected, orange for pending
  //   labels: pieMonthlyCollectionData.map((item) => item.label),
  //   legend: {
  //     show: true,
  //   },
  //   dataLabels: {
  //     formatter: (val) => `${val.toFixed(1)}%`,
  //     style: {
  //       fontSize: "14px",
  //     },
  //   },
  //   tooltip: {
  //     custom: function ({ seriesIndex }) {
  //       const category = pieMonthlyCollectionData[seriesIndex];

  //       if (!category || !category.clients) return "";

  //       const rows = category.clients
  //         .map(
  //           (client) =>
  //             `<div style="display: flex; justify-content: space-between;">
  //             <span>${client.clientName}</span>
  //             <span>INR ${client.amount.toLocaleString()}</span>
  //           </div>`
  //         )
  //         .join("");

  //       return `
  //       <div style="padding: 8px; font-size: 13px;">
  //         <strong>${category.label} Clients:</strong>
  //         <div style="margin-top: 4px;">${rows}</div>
  //       </div>
  //     `;
  //     },
  //   },
  // };

  //-----------------------------------------------------Pie Monthly Collections------------------------------------------------------//
  //-----------------------------------------------------Donut Statutory Payments------------------------------------------------------//

  const statutoryPaymentsData = isBudgetDataLoading
    ? []
    : budgetData.filter((budget) => {
        return budget.expanseType === "Statutory";
      });

  const statutoryPaymentsMap = new Map();

  statutoryPaymentsData.forEach((payment) => {
    const amount = payment.actualAmount;
    const label = payment.expanseName;

    if (!statutoryPaymentsMap.has(label)) {
      statutoryPaymentsMap.set(label, 0);
    }

    const currentAmount = statutoryPaymentsMap.get(label);
    statutoryPaymentsMap.set(label, currentAmount + amount);
  });

  const statutoryPayments = Array.from(statutoryPaymentsMap.entries()).map(
    ([label, amount]) => ({ label, amount }),
  );

  // const statutoryPayments = [
  //   { label: "PF", amount: 30000 },
  //   { label: "ESIC", amount: 20000 },
  //   { label: "TDS", amount: 15000 },
  //   { label: "PT", amount: 10000 },
  // ];

  const approvedPayments = currentMonthStatutoryPayments.filter(
    (item) => item.status === "Approved",
  );
  const pendingPayments = currentMonthStatutoryPayments.filter(
    (item) => item.status !== "Approved",
  );

  const statutoryDonutSeries = [
    Math.round(
      approvedPayments.reduce(
        (sum, item) => sum + Number(item.actualAmount || 0),
        0,
      ),
    ),
    Math.round(
      pendingPayments.reduce(
        (sum, item) => sum + Number(item.actualAmount || 0),
        0,
      ),
    ),
  ];

  const statutoryDonutLabels = ["Approved", "Pending"];
  const statutoryDonutColors = ["#4CAF50", "#FDE3A7"];
  const statutoryTooltipValues = statutoryDonutSeries.map(
    (amount, i) => `${statutoryDonutLabels[i]}: ₹ ${amount}`,
  );
  //-----------------------------------------------------Donut Statutory Payments------------------------------------------------------//
  //-----------------------------------------------------Donut Rental Payments------------------------------------------------------//
  // const currentMonthRentalPayments = isBudgetDataLoading
  //   ? []
  //   : budgetData.filter(
  //     (item) =>
  //       item?.expanseType === "Monthly Rent" &&
  //       item?.dueDate &&
  //       dayjs(item.dueDate).format("MMM-YY") === chartPayoutMonth
  //   );

  // const totalPaid = currentMonthRentalPayments
  //   .filter((item) => item.status === "Approved")
  //   .reduce((sum, item) => sum + Number(item.actualAmount || 0), 0);

  // const totalUnpaid = currentMonthRentalPayments
  //   .filter((item) => item.status !== "Approved")
  //   .reduce((sum, item) => sum + Number(item.actualAmount || 0), 0);

  // // Donut chart props
  // const donutRentalLabels = ["Paid", "Unpaid"];
  // const donutRentalSeries = [totalPaid, totalUnpaid];
  // const donutRentalTooltipValue = [
  //   ` INR ${totalPaid.toLocaleString()}`,
  //   ` INR ${totalUnpaid.toLocaleString()}`,
  // ];
  // const donutRentalColors = ["#4CAF50", "#F44336"];

  //-----------------------------------------------------Donut Rental Payments------------------------------------------------------//
  const currentMonthRentalPayments = isBudgetDataLoading
    ? []
    : budgetData.filter(
        (item) =>
          item?.expanseType === "Monthly Rent" &&
          item?.dueDate &&
          dayjs(item.dueDate).format("MMM-YY") === chartPayoutMonth,
      );

  const totalPaid = currentMonthRentalPayments
    .filter(
      (item) =>
        String(item.isPaid || "")
          .trim()
          .toLowerCase() === "paid",
    )
    .reduce((sum, item) => sum + Number(item.actualAmount || 0), 0);

  const totalUnpaid = currentMonthRentalPayments
    .filter(
      (item) =>
        String(item.isPaid || "")
          .trim()
          .toLowerCase() === "unpaid",
    )
    .reduce((sum, item) => sum + Number(item.actualAmount || 0), 0);

  // Donut chart props
  const donutRentalLabels = ["Paid", "Unpaid"];
  const donutRentalSeries = [totalPaid, totalUnpaid];
  const donutRentalTooltipValue = [
    ` INR ${totalPaid.toLocaleString("en-IN")}`,
    ` INR ${totalUnpaid.toLocaleString("en-IN")}`,
  ];
  const donutRentalColors = ["#66DB66", "#EA9A87"];

  //-----------------------------------------------------Donut Rental Payments------------------------------------------------------//

  //-----------------------------------------------------Donut Rental Payments------------------------------------------------------//
  //-----------------------------------------------------Table Priority Tasks------------------------------------------------------//

  const { mutate: updatePayoutApproval, isPending: isPayoutApprovalPending } = useMutation({
    mutationFn: async ({ row, action, reason }) => {
      if (!row.canApproveBudget || row.status !== "Pending") throw new Error("This budget is not eligible for approval actions");
      return action === "approve"
        ? axios.patch("/api/budget/approve-budget", { budgetId: row._id })
        : axios.patch(`/api/budget/reject-budget/${row._id}`, { reason });
    },
    onSuccess: async (_response, { row, action }) => {
      const status = action === "approve" ? "Approved" : "Rejected";
      payoutQueryClient.setQueryData(["budgetData", "finance-dashboard1"], (rows) => Array.isArray(rows)
        ? rows.map((item) => item._id === row._id
          ? {
              ...item,
              status,
              ...(action === "approve" && currentApproverName
                ? { approverName: currentApproverName }
                : {}),
            }
          : item) : rows);
      payoutQueryClient.setQueryData(["pendingApprovalsBudget"], (rows) => Array.isArray(rows)
        ? rows.filter((item) => item._id !== row._id) : rows);
      setPayoutDetails((current) => current?._id === row._id
        ? {
            ...current,
            status,
            ...(action === "approve" && currentApproverName
              ? { approverName: currentApproverName }
              : {}),
          }
        : current);
      setPayoutRejectRow(null);
      setPayoutRejectReason("");
      toast.success(`Budget ${status.toLowerCase()} successfully`);
      await Promise.all([
        ["budgetData", "finance-dashboard1"], ["pendingApprovalsBudget"], ["budgetHistory"], ["allBudgets"],
      ].map((queryKey) => payoutQueryClient.invalidateQueries({ queryKey, refetchType: "all" })));
    },
    onError: (error) => toast.error(error.response?.data?.message || error.message || "Unable to update budget"),
  });
  const viewPayout = async (row) => {
    setPayoutDetails(row);
    try {
      const response = await axios.get("/api/budget/company-budget");
      const details = response.data?.allBudgets?.find(
        (item) => item._id === row._id,
      );
      if (details)
        setPayoutDetails((current) =>
          current?._id === row._id ? { ...row, ...details } : current,
        );
    } catch (error) {
      console.error("Unable to fetch payment details", error);
    }
  };
  const payoutInvoiceFilesForRow = (row) => Array.isArray(row?.invoices) && row.invoices.some((file) => file?.link)
    ? row.invoices.filter((file) => file?.link)
    : row?.invoice?.link ? [row.invoice] : [];
  const validPayoutName = (value) => {
    const name = String(value || "").trim();
    return name && !["-", "--", "\u2013", "\u2014"].includes(name) ? name : "";
  };
  const payoutApproverName = (row) => {
    if (row.status === "Rejected") {
      return validPayoutName(row.rejectedByName) || "\u2014";
    }

    if (row.status === "Approved") {
      return validPayoutName(row.approverName) ||
        validPayoutName(row.requiredApprover) || "\u2014";
    }

    return validPayoutName(row.requiredApprover) ||
      validPayoutName(row.approverName) || "\u2014";
  };
  const marchPaymentColumns = [
    { id: "srNo", label: "Sr No", width: 70 },
    { id: "expanseName", label: "Expense Name", width: 200 },
    {
      id: "department",
      label: "Expense Department",
      width: 170,
      valueGetter: ({ data }) =>
        data.department?.name || data.department || "\u2014",
      renderCell: (row) => row.department?.name || row.department || "\u2014",
    },
    {
      id: "projectedAmount",
      label: "Amount",
      width: 120,
      renderCell: (row) => inrFormat(row.projectedAmount || 0),
    },
    {
      id: "dueDate",
      label: "Due Date",
      width: 130,
      valueGetter: ({ data }) =>
        data.dueDate ? humanDate(data.dueDate) : "\u2014",
      renderCell: (row) => (row.dueDate ? humanDate(row.dueDate) : "\u2014"),
    },
    {
      id: "approvalLevel",
      label: "Level",
      width: 100,
      renderCell: (row) => row.approvalLevel || "--",
    },
    {
      id: "requiredApprover",
      label: "Approver Name",
      width: 140,
      valueGetter: ({ data }) => payoutApproverName(data),
      renderCell: payoutApproverName,
    },
    {
      id: "status",
      label: "Status",
      width: 120,
      renderCell: (row) => <StatusChip status={row.status} />,
    },
    { id: "expanseType", label: "Expense Type", hide: true },
    { id: "paymentType", label: "Payment Type", hide: true },
    { id: "actualAmount", label: "Actual Amount", hide: true },
    {
      id: "unitName",
      label: "Unit",
      hide: true,
      valueGetter: ({ data }) => data.unit?.unitName || "\u2014",
    },
    {
      id: "unitNo",
      label: "Unit No",
      hide: true,
      valueGetter: ({ data }) => data.unit?.unitNo || "\u2014",
    },
    {
      id: "buildingName",
      label: "Building",
      hide: true,
      valueGetter: ({ data }) => data.unit?.building?.buildingName || "\u2014",
    },
    {
      id: "invoiceName",
      label: "Invoice Name",
      hide: true,
      valueGetter: ({ data }) => {
        const files = payoutInvoiceFilesForRow(data);
        return `${files.length} ${files.length === 1 ? "file" : "files"} uploaded`;
      },
    },
    {
      id: "invoiceDate",
      label: "Invoice Date",
      hide: true,
      valueGetter: ({ data }) => {
        const files = payoutInvoiceFilesForRow(data);
        const date = data.invoice?.date || data.invoiceDate || files[0]?.date;
        return date ? humanDate(date) : "\u2014";
      },
    },
    { id: "isPaid", label: "Paid Status", hide: true },
    {
      id: "invoiceFile",
      label: "Invoice File",
      hide: true,
      valueGetter: ({ data }) =>
        payoutInvoiceFilesForRow(data)
          .map((file) => file.link)
          .join(", ") || "\u2014",
    },
    { id: "rejectedByName", label: "Rejected By", hide: true },
    { id: "category", label: "Category", hide: true },
    {
      id: "actions",
      label: "Action",
      width: 115,
      renderCell: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="View payment"
            onClick={() => viewPayout(row)}
            className="rounded-lg bg-[#eaf4ff] p-2 text-[#1E3D73]"
          >
            <MdOutlineRemoveRedEye size={18} />
          </button>
          <ThreeDotMenu
            buttonSx={{
              color: "#1E3D73",
              backgroundColor: "#eaf4ff",
              borderRadius: 2,
            }}
            disabled={
              isPayoutApprovalPending ||
              row.status !== "Pending" ||
              !row.canApproveBudget ||
              row.expanseType === "Reimbursement"
            }
            menuItems={[
              {
                label: "Approve",
                onClick: () => updatePayoutApproval({ row, action: "approve" }),
              },
              {
                label: "Reject",
                onClick: () => {
                  setPayoutRejectReason("");
                  setPayoutRejectRow(row);
                },
              },
            ]}
          />
        </div>
      ),
    },
  ];
  const now = new Date();
  const monthYear = now.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  //-----------------------------------------------------Table Rental Payments------------------------------------------------------//

  //------------------------PAGE ACCESS PIE START-------------------//
  const pieChartConfigs = [
    {
      key: "financePayouts",
      title: `Payouts ${chartPayoutMonth} `,
      layout: 1,
      border: true,
      data: pieMonthlyPayoutData,
      options: pieMonthlyPayoutOptions,
      permission: PERMISSIONS.FINANCE1_PAYOUTS.value,
    },
    {
      key: "financeCustomerCollections",
      title: `Customer Collections ${currentCollectionsMonth} `,
      layout: 1,
      border: true,
      data: pieChartData,
      options: pieChartOptions,
      permission: PERMISSIONS.FINANCE1_CUSTOMER_COLLECTIONS.value,
    },
  ];

  const allowedPieCharts = pieChartConfigs.filter(
    (widget) =>
      !widget.permission || userPermissions.includes(widget.permission),
  );
  //------------------------PAGE ACCESS PIE END-------------------//

  //------------------------PAGE ACCESS DONUT START-------------------//
  const donutChartConfigs = [
    {
      layout: 1,
      key: "financeStatutory",
      title: `Statutory Payments Due ${chartPayoutMonth} `,
      border: true,
      centerLabel: "Statutory",
      labels: statutoryDonutLabels,
      colors: statutoryDonutColors,
      series: statutoryDonutSeries,
      tooltipValue: statutoryTooltipValues,
      isMonetary: true,
      permission: PERMISSIONS.FINANCE1_STATUTORY_PAYMENTS_DONUT.value,
    },
    {
      layout: 1,
      key: "financeRental",
      title: `Rental Payments Due ${chartPayoutMonth} `,
      border: true,
      centerLabel: "Rental Status",
      labels: donutRentalLabels,
      colors: donutRentalColors,
      series: donutRentalSeries,
      tooltipValue: donutRentalTooltipValue,
      isMonetary: true,
      permission: PERMISSIONS.FINANCE1_RENTAL_PAYMENTS_DONUT.value,
    },
  ];

  const allowedDonutCharts = donutChartConfigs.filter(
    (widget) =>
      !widget.permission || userPermissions.includes(widget.permission),
  );
  //------------------------PAGE ACCESS DONUT END-------------------//

  //------------------------PAGE ACCESS MUI START-------------------//
  const muiTableConfigs = [
    {
      layout: 1,
      key: "financePayouts",
      Title: (
        <span className="inline-flex items-baseline gap-2 leading-none text-[#1E3D73]">
          <InvestorHeaderLogo />
          <span className="inline-flex items-baseline leading-none">
            {`PAYMENTS - ${dayjs().format("MMMM YYYY").toUpperCase()}`}
          </span>
        </span>
      ),
      columns: marchPaymentColumns,
      rows: payoutMonthPayments.map((item, index) => ({
        srNo: index + 1,
        ...item,
        dueDate: item.dueDate,
      })),
      rowKey: "_id",
      scroll: true,
      rowsToDisplay: payoutMonthPayments.length,
      scrollHeight: 780,

      permission: PERMISSIONS.FINANCE1_PAYOUTS_MUI_TABLE.value,
    },
  ];

  const allowedMuiTables = muiTableConfigs.filter(
    (widget) =>
      !widget.permission || userPermissions.includes(widget.permission),
  );
  //------------------------PAGE ACCESS MUI END-------------------//
  //------------------------PAGE ACCESS YEARLY GRAPH START-------------------//
  const yearlyGraphConfigs = [
    {
      layout: 1,
      key: "financeIncomeExpense",
      data: visibleIncomeExpenseData,
      options: incomeExpenseOptions,
      chartId: "bargraph-finance-income",
      title: (
        <span className="inline-flex flex-wrap items-baseline gap-2 leading-none text-[#1E3D73]">
          <span
            aria-label="BIZ NEST"
            className="inline-flex items-baseline whitespace-nowrap normal-case leading-none text-[#2a2525]"
          >
            <span>BI</span>
            <span className="text-[#e33434]">Z</span>
            <span>{"\u00a0NEST"}</span>
          </span>
          <span>FINANCE INCOME V/S EXPENSE</span>
        </span>
      ),
      onYearChange: setSelectedFiscalYear,

      permission: PERMISSIONS.FINANCE1_INCOME_EXPENSE_YEARLY_GRAPH.value,
    },
  ];

  const allowedYearlyGraphs = yearlyGraphConfigs.filter(
    (widget) =>
      !widget.permission || userPermissions.includes(widget.permission),
  );
  //------------------------PAGE ACCESS YEARLY GRAPH END-------------------//
  //------------------------PAGE ACCESS FINANCE DATA CARD START-------------------//
  // const DataCardConfigs = [
  //   {
  //     layout: 1,
  //     key: "financeIncomeDataCard",
  //     data: {
  //       ...incomeCardData,
  //     },
  //     highlightNegativePositive: false,
  //     permission: PERMISSIONS.FINANCE1_INCOME_DATA_CARD.value,
  //   },
  //   {
  //     layout: 1,
  //     key: "financeExpenseDataCard",
  //     data: {
  //       ...expenseCardData,
  //     },
  //     highlightNegativePositive: false,
  //     permission: PERMISSIONS.FINANCE1_EXPENSE_DATA_CARD.value,
  //   },
  //   {
  //     layout: 1,
  //     key: "financePlDataCard",
  //     data: {
  //       ...netSavingsCardData,
  //     },
  //     highlightNegativePositive: true,
  //     permission: PERMISSIONS.FINANCE1_PL_DATA_CARD.value,
  //   },
  // ];

  // const allowedDataCards = DataCardConfigs.filter(
  //   (widget) =>
  //     !widget.permission || userPermissions.includes(widget.permission)
  // );

  //------------------------PAGE ACCESS FINANCE CARDS START-------------------//
  const financeCardConfigs = [
    {
      layout: 3,
      key: "financeIncomeCard",
      component: FinanceCard,
      props: incomeCardData,
      permission: PERMISSIONS.FINANCE1_INCOME_DATA_CARD.value,
    },
    {
      layout: 3,
      key: "financeExpenseCard",
      component: FinanceCard,
      props: expenseCardData,
      permission: PERMISSIONS.FINANCE1_EXPENSE_DATA_CARD.value,
    },
    {
      layout: 3,
      key: "financeNetSavingsCard",
      component: FinanceCard,
      props: {
        ...netSavingsCardData,
        highlightNegativePositive: true,
      },
      permission: PERMISSIONS.FINANCE1_PL_DATA_CARD.value,
    },
  ];

  const allowedFinanceCards = financeCardConfigs.filter(
    (card) => !card.permission || userPermissions.includes(card.permission),
  );
  //------------------------PAGE ACCESS FINANCE CARDS END-------------------//

  const dueTasksConfigs = [
    {
      key: PERMISSIONS.FINANCE1_UNIT_WISE_DUE_TASKS.value,
      type: "PieChartMui",
      border: true,
      title: "Overall Unit Wise Due Tasks",
      data: unitWisePieData,
      options: unitPieChartOptions,
      centerAlign: true,
      height: 320,
      width: 500,
    },
    {
      key: PERMISSIONS.FINANCE1_EXECUTIVE_WISE_DUE_TASKS.value,
      type: "DonutChart",
      border: true,
      title: "Overall Executive Wise Due Tasks",
      centerLabel: "Tasks",
      labels: executiveTaskLabels,
      colors: executiveTaskColors,
      series: executiveTasksCount,
      tooltipValue: executiveTasksCount,
      tooltipFormatter: (label, value) =>
        `${label}: ${value || 0} pending tasks`,
    },
  ];

  const allowedDueTasks = dueTasksConfigs.filter(
    (widget) => !widget.key || userPermissions.includes(widget.key),
  );

  const financeTicketChartConfigs = [
    {
      key: PERMISSIONS.FINANCE1_CATEGORY_WISE_TICKETS.value,
      type: "PieChartMui",
      border: true,
      title: "Category Wise Tickets",
      data: financeCategoryWiseTicketsData,
      options: financeCategoryWiseTicketsOptions,
      centerAlign: true,
      height: 320,
      width: 500,
    },
    {
      key: PERMISSIONS.FINANCE1_DUE_TICKETS.value,
      type: "PieChartMui",
      border: true,
      title: "Due Tickets",
      data: financeDueTicketsData,
      options: financeDueTicketsOptions,
      centerAlign: true,
      height: 320,
      width: 500,
    },
  ];

  const allowedFinanceTicketCharts = financeTicketChartConfigs.filter(
    (widget) => !widget.key || userPermissions.includes(widget.key),
  );

  //------------------------PAGE ACCESS FINANCE DATA CARD END-------------------//

  // LIST OF WIDGETS

  const finance1ExtraGraphs = [
    {
      path: "monthly-income-breakdown",
      permission: PERMISSIONS.FINANCE1_MONTHLY_INCOME_BREAKDOWN.value,
      Component: InvestorAnnualMonthlyMixIncome,
    },
    {
      path: "inventory-vs-occupancy",
      permission: PERMISSIONS.FINANCE1_INVENTORY_VS_OCCUPANCY.value,
      Component: InvestorOccupiedInventoryGraph,
    },
    {
      path: "active-unique-clients",
      permission: PERMISSIONS.FINANCE1_ACTIVE_UNIQUE_CLIENTS.value,
      Component: InvestorUniqueClientsGraph,
    },
    {
      path: "real-estate-owned",
      permission: PERMISSIONS.FINANCE1_REAL_ESTATE_OWNED.value,
      Component: InvestorAppreciationCenter,
    },
  ];
  const allowedExtraGraphs = finance1ExtraGraphs.filter((graph) =>
    userPermissions.includes(graph.permission),
  );
  const renderExtraGraph = ({ path, Component }) => (
    <div key={path} className="flex flex-col gap-2">
      <Component
        hasPermission={(permission) => userPermissions.includes(permission)}
      />
    </div>
  );
  const techWidgets = [
    // {
    //   layout: 1,
    //   widgets: [
    //     <YearlyGraph
    //       data={incomeExpenseData}
    //       options={incomeExpenseOptions}
    //       chartId={"bargraph-finance-income"}
    //       title={"BIZNest FINANCE INCOME V/S EXPENSE"}
    //       TitleAmountGreen={`INR ${inrFormat(totalIncomeAmount)}`}
    //       TitleAmountRed={`INR ${inrFormat(totalExpense)}`}
    //       onYearChange={setSelectedFiscalYear}
    //     />,
    //   ],
    // },

    {
      layout: allowedYearlyGraphs.length,
      widgets: allowedYearlyGraphs.map((item) => (
        <YearlyGraph
          layout={item.layout}
          key={item.key}
          data={item.data}
          options={item.options}
          chartId={item.chartId}
          chartHeight={360}
          chartTopContent={financeProjectionLegend}
          title={item.title}
          sectionBorderColor="#1E3D73"
          sectionBodyBorderColor="#9FB2CF"
          headerRightContent={
            <div className="flex items-center justify-center gap-2 rounded-lg border border-[#aec6fb] bg-[#dbe4ff] px-3 py-2 text-body font-pmedium uppercase text-[#274784]">
              <span>Projection:</span>
              <span>
                {formatGraphAmount(projectedIncomeTotal, currency, convert)}
              </span>
            </div>
          }
          onYearChange={item.onYearChange}
          currentYear={selectedFiscalYear}
          refreshOnDataChange
        />
      )),
    },
    // {
    //   layout: 3,
    //   widgets: [
    //     <FinanceCard {...incomeCardData} />,
    //     <FinanceCard {...expenseCardData} />,
    //     <FinanceCard
    //       {...netSavingsCardData}
    //       highlightNegativePositive={true}
    //     />,
    //   ],
    // },
    {
      layout: 1,
      compactTop: true,
      widgets: userPermissions.includes(
        PERMISSIONS.FINANCE1_BIZNEST_THREE_YEARS_SNAPSHOT.value,
      )
        ? [
            <InvestorDashboard
              key="finance1-investor-snapshot"
              snapshotOnly
              snapshotFinancialsByYear={projectedSnapshotFinancialsByYear}
              snapshotRoute="/app/dashboard/finance-dashboard1/biznest-3-years-snapshot"
            />,
          ]
        : [],
    },
    {
      layout: 1,
      compactTop: true,
      widgets: userPermissions.includes(
        PERMISSIONS.FINANCE1_FINANCE_THREE_YEARS_SNAPSHOT.value,
      )
        ? [
            <Finance1Snapshot
              key="finance1-snapshot"
              incomeData={incomeData}
              expenseData={expenseData}
              fiscalYear={selectedFiscalYear}
              projectedFinancials={{
                revenue: projectedIncomeTotal,
                expense: projectedExpenseTotal,
                profitLoss: projectedProfitLoss,
              }}
              totalSqft={totalSqft}
              assetValueOwned={
                APPRECIATION_BASE_VALUATION +
                APPRECIATION_MONTHLY_INCREMENT *
                  Math.max(
                    0,
                    fiscalMonthIndex(projectionMonth) -
                      APPRECIATION_PROJECTION_START_INDEX,
                  )
              }
              totalInventory={inventoryGraphSummary().total}
            />,
          ]
        : [],
    },

    // {
    //   layout: allowedDataCards.length,
    //   widgets: allowedDataCards.map((item) => (
    //     <FinanceCard
    //       layout={item.layout}
    //       key={item.key}
    //       data={item.data}
    //       highlightNegativePositive={item.highlightNegativePositive}
    //     />
    //   )),
    // },
    // {
    //   layout: 6,
    //   widgets: [
    //     <Card
    //       icon={<MdFormatListBulleted />}
    //       title="Cashflow"
    //       route={"cashflow"}
    //     />,
    //     <Card icon={<SiCashapp />} title="Finance" route={"finance"} />,
    //     <Card icon={<SiCashapp />} title="Billing" route={"billing"} />,
    //     <Card icon={<SiGoogleadsense />} title="Mix-Bag" route={"mix-bag"} />,
    //     <Card
    //       icon={<SiGoogleadsense />}
    //       title="Data"
    //       route={"/app/dashboard/finance-dashboard1/data"}
    //     />,
    //     <Card
    //       icon={<MdOutlineMiscellaneousServices />}
    //       title="Settings"
    //       route={"/app/dashboard/finance-dashboard1/settings"}
    //     />,
    //   ],
    // },
    {
      layout: dashboardCards.length,
      compactTop: true,
      widgets: dashboardCards.map((card) => (
        <Card
          key={card.title}
          route={card.route}
          title={card.title === "Mix-Bag" ? "Mix Bag" : card.title}
          icon={card.icon}
          fontColor="#1E3D73"
          titleColor="#1E3D73"
        />
      )),
    },

    {
      layout: 1,
      compactTop: true,
      widgets: userPermissions.includes(
        PERMISSIONS.FINANCE1_CASHFLOW_YEARLY_GRAPH.value,
      )
        ? [
            <FinanceCashflow
              key="finance1-cashflow"
              financialSeries={[...incomeData, ...expenseData]}
              now={projectionMonth}
            />,
          ]
        : [],
    },

    // {
    //   layout: 2,
    //   widgets: [
    //     <WidgetSection title={`Payouts MAR-25 `} border>
    //       <PieChartMui
    //         data={pieMonthlyPayoutData}
    //         options={pieMonthlyPayoutOptions}
    //       />
    //     </WidgetSection>,
    //     <WidgetSection title={`Customer Collections MAR-25 `} border>
    //       <PieChartMui data={pieChartData} options={pieChartOptions} />
    //     </WidgetSection>,
    //   ],
    // },

    {
      layout: 1,
      compactTop: true,
      widgets: allowedExtraGraphs.map(renderExtraGraph),
    },
    {
      layout: allowedPieCharts.length,
      widgets: allowedPieCharts.map((item) => (
        <WidgetSection
          key={item.key}
          layout={item.layout}
          title={item.title}
          border={item.border}
        >
          <PieChartMui
            data={item.data}
            options={item.options}
            // width={item.width}
            centerAlign
          />
        </WidgetSection>
      )),
    },
    // {
    //   layout: 2,
    //   widgets: [
    //     <WidgetSection title={`Statutory Payments Due MAR-25`} border>
    //       <DonutChart
    //         centerLabel="Statutory"
    //         labels={statutoryDonutLabels}
    //         colors={statutoryDonutColors}
    //         series={statutoryDonutSeries}
    //         tooltipValue={statutoryTooltipValues}
    //         isMonetary={true}
    //       />
    //     </WidgetSection>,
    //     <WidgetSection title={`Rental Payments Due MAR-25`} border>
    //       <DonutChart
    //         centerLabel="Rental Status"
    //         labels={donutRentalLabels}
    //         colors={donutRentalColors}
    //         series={donutRentalSeries}
    //         tooltipValue={donutRentalTooltipValue}
    //         isMonetary={true}
    //       />
    //     </WidgetSection>,
    //   ],
    // },
    {
      layout: allowedDonutCharts.length,
      widgets: allowedDonutCharts.map((item) => (
        <WidgetSection
          key={item.key}
          layout={item.layout}
          title={item.title}
          border={item.border}
        >
          <DonutChart
            centerLabel={item.centerLabel}
            labels={item.labels}
            colors={item.colors}
            series={item.series}
            tooltipValue={item.tooltipValue}
            isMonetary={item.isMonetary}
          />
        </WidgetSection>
      )),
    },
    // {
    //   layout: 1,
    //   widgets: [
    //     <MuiTable
    //       Title="Payouts Mar-25"
    //       columns={marchPaymentColumns}
    //       rows={march2025Payments.map((item, index) => {
    //         return {
    //           srNo: index + 1,
    //           ...item,
    //           dueDate: item.dueDate,
    //         };
    //       })}
    //       rowKey="_id"
    //       scroll={true}
    //       rowsToDisplay={march2025Payments.length}
    //     />,
    //   ],
    // },

    {
      layout: allowedDueTasks.length,
      widgets: allowedDueTasks.map((config) => (
        <WidgetSection key={config.key} border title={config.title}>
          {config.type === "PieChartMui" ? (
            <PieChartMui
              data={config.data}
              options={config.options}
              centerAlign={config.centerAlign}
              height={config.height}
              width={config.width}
            />
          ) : (
            <DonutChart
              centerLabel={config.centerLabel}
              labels={config.labels}
              colors={config.colors}
              series={config.series}
              tooltipValue={config.tooltipValue}
              tooltipFormatter={config.tooltipFormatter}
            />
          )}
        </WidgetSection>
      )),
    },
    {
      layout: allowedFinanceTicketCharts.length,
      widgets: allowedFinanceTicketCharts.map((config) => (
        <WidgetSection key={config.title} border title={config.title}>
          <PieChartMui
            data={config.data}
            options={config.options}
            centerAlign={config.centerAlign}
            height={config.height}
            width={config.width}
          />
        </WidgetSection>
      )),
    },

    {
      layout: allowedMuiTables.length,
      compactTop: true,
      widgets: allowedMuiTables.map((item) => (
        <WidgetSection
          key={item.key}
          title={item.Title}
          border
          normalCase
          borderColor="#1E3D73"
          bodyBorderColor="#9FB2CF"
          headerContentClassName="min-h-[42px]"
          headerRightContent={(
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span className="inline-flex items-center rounded-lg border border-[#aec6fb] bg-[#dbe4ff] px-3 py-2 text-sm font-pmedium uppercase text-[#274784]">
                TOTAL: {payoutSummary.total.count} | INR {inrFormat(payoutSummary.total.amount)}
              </span>
              <span className="inline-flex items-center rounded-lg border border-[#9bd8ba] bg-[#eafbf3] px-3 py-2 text-sm font-pmedium uppercase text-[#16875d]">
                APPROVAL: {payoutSummary.approved.count} | INR {inrFormat(payoutSummary.approved.amount)}
              </span>
              <span className="inline-flex items-center rounded-lg border border-[#f2cf83] bg-[#fff7df] px-3 py-2 text-sm font-pmedium uppercase text-[#b7791f]">
                PENDING: {payoutSummary.pending.count} | INR {inrFormat(payoutSummary.pending.amount)}
              </span>
              <span className="inline-flex items-center rounded-lg border border-[#f3aaaa] bg-[#fff0f0] px-3 py-2 text-sm font-pmedium uppercase text-[#d64545]">
                REJECTED: {payoutSummary.rejected.count} | INR {inrFormat(payoutSummary.rejected.amount)}
              </span>
            </div>
          )}
        >
        <div className="text-[#1E3D73] [&_.ag-icon]:!text-[#1E3D73]" style={{ "--ag-foreground-color": "#1E3D73", "--ag-header-foreground-color": "#1E3D73", "--ag-icon-color": "#1E3D73" }}>
        <AgTable

          hideTitle
          data={item.rows}
          columns={item.columns.map(({ id, label, width, hide, valueGetter, renderCell }) => ({
            field: id,
            headerName: label,
            width,
            hide,
            valueGetter,
            minWidth: id === "actions" ? 115 : 80,
            flex: id === "srNo" ? undefined : 1,
            cellStyle: { color: "#1E3D73" },
            headerClass: "!text-[#1E3D73]",
            sortable: id !== "actions",
            filter: ["department", "projectedAmount", "status"].includes(id),
            pinned: id === "actions" ? "right" : undefined,
            cellRenderer: (params) => {
              const value = renderCell ? renderCell(params.data) : params.value;
              return value == null || value === "" || value === "--" ? "\u2014" : value;
            },
          }))}
          search
        />
        </div>
        </WidgetSection>
      )),
    },
  ];

  const visibleTechWidgets = techWidgets.filter(
    (section) => Array.isArray(section?.widgets) && section.widgets.length > 0,
  );

  const extraGraphPage = finance1ExtraGraphs.find(
    (graph) =>
      location.pathname === `/app/dashboard/finance-dashboard1/${graph.path}`,
  );
  if (extraGraphPage) {
    return userPermissions.includes(extraGraphPage.permission) ? (
      <div className="px-4">{renderExtraGraph(extraGraphPage)}</div>
    ) : (
      <Navigate to="/unauthorized" replace />
    );
  }
  if (location.pathname.endsWith("/biznest-3-years-snapshot")) {
    return userPermissions.includes(
      PERMISSIONS.FINANCE1_BIZNEST_THREE_YEARS_SNAPSHOT.value,
    ) ? (
      <div className="px-4">
        <InvestorDashboard
          snapshotOnly
          snapshotFinancialsByYear={projectedSnapshotFinancialsByYear}
          snapshotRoute="/app/dashboard/finance-dashboard1/biznest-3-years-snapshot"
        />
      </div>
    ) : (
      <Navigate to="/unauthorized" replace />
    );
  }
  if (location.pathname.endsWith("/finance-3-years-snapshot")) {
    return userPermissions.includes(
      PERMISSIONS.FINANCE1_FINANCE_THREE_YEARS_SNAPSHOT.value,
    ) ? (
      <div className="px-4">
        <Finance1Snapshot
          incomeData={incomeData}
          expenseData={expenseData}
          fiscalYear={selectedFiscalYear}
          projectedFinancials={{
            revenue: projectedIncomeTotal,
            expense: projectedExpenseTotal,
            profitLoss: projectedProfitLoss,
          }}
          totalSqft={totalSqft}
          assetValueOwned={
            APPRECIATION_BASE_VALUATION +
            APPRECIATION_MONTHLY_INCREMENT *
              Math.max(
                0,
                fiscalMonthIndex(projectionMonth) -
                  APPRECIATION_PROJECTION_START_INDEX,
              )
          }
          totalInventory={inventoryGraphSummary().total}
        />
      </div>
    ) : (
      <Navigate to="/unauthorized" replace />
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <MuiModal
        title={
          <span className="text-subtitle font-pmedium text-primary uppercase">
            Pending Approvals Budget Summary
          </span>
        }
        widthClass="w-[94vw] max-w-[768px]"
        open={Boolean(payoutRejectRow)}
        onClose={() => {
          if (!isPayoutApprovalPending) setPayoutRejectRow(null);
        }}
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (payoutRejectReason.trim() && !isPayoutApprovalPending)
              updatePayoutApproval({
                row: payoutRejectRow,
                action: "reject",
                reason: payoutRejectReason.trim(),
              });
          }}
        >
          <TextField
            id="payout-reject-reason"
            label="Reason"
            placeholder="Enter the reason"
            multiline
            fullWidth
            rows={4}
            required
            value={payoutRejectReason}
            onChange={(event) => setPayoutRejectReason(event.target.value)}
            disabled={isPayoutApprovalPending}
          />
          <button
            type="submit"
            disabled={isPayoutApprovalPending || !payoutRejectReason.trim()}
            className="w-full rounded-md bg-[#1E3D73] px-4 py-2 text-white"
          >
            {isPayoutApprovalPending ? "Submitting..." : "Submit"}
          </button>
        </form>
      </MuiModal>
      <MuiModal
        title={
          <span className="font-pbold font-bold text-[#345580]">
            {payoutDetails?.status === "Pending"
              ? "Pending Approvals Budget Summary"
              : payoutDetails?.status === "Approved"
                ? "Department-Invoice Approval Budget Summary"
                : "Budget Summary"}
          </span>
        }
        widthClass="w-[94vw] max-w-[768px]"
        open={Boolean(payoutDetails)}
        onClose={() => setPayoutDetails(null)}
      >
        {payoutDetails?.status === "Approved" ? (
          <div className="space-y-3 text-[#345580]">
            <PayoutDetail title="Sr No" detail={payoutDetails.srNo} />
            {[
              [
                "Department",
                payoutDetails.department?.name || payoutDetails.department,
              ],
              ["Expense Name", payoutDetails.expanseName],
              ["Expense Type", payoutDetails.expanseType],
              ["Payment Type", payoutDetails.paymentType],
              [
                "Projected Amount",
                `INR ${inrFormat(payoutDetails.projectedAmount || 0)}`,
              ],
              [
                "Actual Amount",
                `INR ${inrFormat(payoutDetails.actualAmount || 0)}`,
              ],
              ["Unit", payoutDetails.unit?.unitName],
              ["Unit No", payoutDetails.unit?.unitNo],
              ["Building", payoutDetails.unit?.building?.buildingName],
              [
                "Due Date",
                payoutDetails.dueDate
                  ? humanDate(payoutDetails.dueDate)
                  : "\u2014",
              ],
              [
                "Invoice Name",
                `${payoutInvoiceFiles.length} ${payoutInvoiceFiles.length === 1 ? "file" : "files"} uploaded`,
              ],
              [
                "Invoice Date",
                payoutDetails.invoice?.date ||
                payoutDetails.invoiceDate ||
                payoutInvoiceFiles[0]?.date
                  ? humanDate(
                      payoutDetails.invoice?.date ||
                        payoutDetails.invoiceDate ||
                        payoutInvoiceFiles[0]?.date,
                    )
                  : "\u2014",
              ],
              ["Approval Status", payoutDetails.status],
              [
                "Approver Name",
                payoutDetails.approverName || payoutDetails.requiredApprover,
              ],
              ["Paid Status", payoutDetails.isPaid],
            ].map(([title, detail]) => (
              <PayoutDetail
                key={title}
                title={title}
                detail={detail ?? "\u2014"}
              />
            ))}
            <PayoutDetail
              title="Invoice File"
              detail={
                payoutInvoiceFiles.length ? (
                  <span className="flex max-w-full flex-wrap gap-2">
                    {payoutInvoiceFiles.map((file, index) => (
                      <a
                        key={file.id || index}
                        href={file.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-[#345580] px-3 py-1 text-[#345580] text-xs break-all"
                      >
                        {file.name || `Invoice ${index + 1}`}
                      </a>
                    ))}
                  </span>
                ) : (
                  "\u2014"
                )
              }
            />
            <PayoutDetail title="Level" detail={payoutDetails.approvalLevel} />
          </div>
        ) : (
          payoutDetails && (
            <div className="flex flex-col gap-4 text-[#345580]">
              <PayoutDetail title="Sr No" detail={payoutDetails.srNo} />
              <PayoutDetail
                title="Department"
                detail={
                  payoutDetails.department?.name || payoutDetails.department
                }
              />
              <PayoutDetail
                title="Expense Name"
                detail={payoutDetails.expanseName}
              />
              <PayoutDetail
                title="Expense Type"
                detail={payoutDetails.expanseType}
              />
              <PayoutDetail
                title="Payment Type"
                detail={payoutDetails.paymentType}
              />
              <PayoutDetail
                title="Projected Amount"
                detail={`INR ${inrFormat(payoutDetails.projectedAmount || 0)}`}
              />
              <PayoutDetail
                title="Actual Amount"
                detail={`INR ${inrFormat(payoutDetails.actualAmount || 0)}`}
              />
              <PayoutDetail
                title="Approval Status"
                detail={payoutDetails.status}
              />
              {payoutDetails.status === "Rejected" && (
                <PayoutDetail
                  title="Rejected By"
                  detail={payoutDetails.rejectedByName}
                />
              )}
              <PayoutDetail title="Paid Status" detail={payoutDetails.isPaid} />
              <PayoutDetail
                title="Due Date"
                detail={
                  payoutDetails.dueDate
                    ? humanDate(payoutDetails.dueDate)
                    : undefined
                }
              />
              <PayoutDetail
                title="Level"
                detail={payoutDetails.approvalLevel}
              />
              {payoutDetails.status === "Approved" && (
                <PayoutDetail
                  title="Approver Name"
                  detail={
                    payoutDetails.approverName || payoutDetails.requiredApprover
                  }
                />
              )}
              {payoutDetails.unit?.unitNo && (
                <PayoutDetail
                  title="Unit No"
                  detail={payoutDetails.unit.unitNo}
                />
              )}
              {payoutDetails.category && (
                <PayoutDetail
                  title="Category"
                  detail={payoutDetails.category}
                />
              )}
            </div>
          )
        )}
      </MuiModal>
      <Menu
        anchorEl={settingsAnchor}
        open={Boolean(settingsAnchor)}
        onClose={() => setSettingsAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 240,
              borderRadius: 2,
              border: "1px solid #e0e8f5",
              mt: 1,
            },
          },
        }}
      >
        {settingsCards.map((card) => (
          <MenuItem
            key={card.title}
            onClick={() => {
              setSettingsAnchor(null);
              navigate(card.route);
            }}
            sx={{ gap: 2, py: 1.5, color: "#1E3D73" }}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eff6fc] text-xl">
              {card.icon}
            </span>
            <span className="font-pmedium text-sm">{card.title}</span>
            <MdChevronRight className="ml-auto" size={20} />
          </MenuItem>
        ))}
      </Menu>
      <div className="flex flex-col gap-4 px-4">
        <div className="overflow-hidden rounded-lg">
          <div className="relative h-44 w-full md:h-56 xl:h-64">
            <img
              src={financeBanner}
              alt="Finance dashboard banner"
              className="h-full w-full object-cover object-left"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center gap-5 px-5 sm:px-8">
              <h1 className="max-w-[80%] font-pbold text-3xl leading-tight text-[#173B78] sm:text-4xl lg:text-5xl">
                FINANCE DASHBOARD
              </h1>
              {settingsCards.length > 0 && (
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={Boolean(settingsAnchor)}
                  onClick={(event) => setSettingsAnchor(event.currentTarget)}
                  className="mt-4 flex w-fit items-center gap-2 rounded-md border border-[#cbd5e1] bg-white/95 px-3 py-2 text-sm font-pmedium text-[#173B78] transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173B78] sm:text-base"
                >
                  <MdSettings size={20} /> Settings
                </button>
              )}
            </div>
          </div>
        </div>
        <FinanceDashboard1Summary
          assetValueOwned={
            APPRECIATION_BASE_VALUATION +
            APPRECIATION_MONTHLY_INCREMENT *
              Math.max(
                0,
                fiscalMonthIndex(projectionMonth) -
                  APPRECIATION_PROJECTION_START_INDEX,
              )
          }
          inventorySummary={inventoryGraphSummary()}
          uniqueClientsSummary={uniqueClientsSummary}
          income={projectedIncomeTotal}
          expense={projectedExpenseTotal}
          profitLoss={projectedProfitLoss}
          incomeGrowth={projectedIncomeGrowth}
          totalSqft={totalSqft}
          fiscalYear={selectedFiscalYear}
          userPermissions={userPermissions}
        />
      </div>
      {visibleTechWidgets.map((section, index) => (
        <div
          key={index}
          className={index === 0 ? "-mt-4" : section.compactTop ? "-mt-8" : ""}
        >
          <WidgetSection layout={section?.layout}>
            {section?.widgets}
          </WidgetSection>
        </div>
      ))}
    </div>
  );
};

export default FinanceDashboard1;
