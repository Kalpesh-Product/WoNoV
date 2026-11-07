import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { FaChair, FaChartLine, FaFilter } from "react-icons/fa";
import {
  MdCalculate,
  MdOutlineDesk,
  MdGroups,
  MdTrendingDown,
  MdTrendingUp,
} from "react-icons/md";
import { BsFillDatabaseFill } from "react-icons/bs";
import { PiDesktopTowerFill } from "react-icons/pi";
import {
  LuChartNoAxesCombined as ChartNoAxesCombined,
  LuChartPie as ChartPie,
} from "react-icons/lu";
import DashboardPopupMenu from "../../../components/DashboardPopupMenu";
import FyBarGraphPercentage from "../../../components/graphs/FyBarGraphPercentage";
import salesDashboardBanner from "../../../assets/sales-dashboard-banner.png";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import useUserPermissions from "../../../hooks/useUserPermissions";
import { PERMISSIONS } from "../../../constants/permissions";
import { inrFormat } from "../../../utils/currencyFormat";

const dashboardLinks = [
  "Annual KPA",
  "KRA",
  "Handbook",
  "Performance Summary",
];

const menuCards = [
  {
    title: "Sales Dashboard",
    icon: FaChartLine,
    items: [],
  },
];

const MONTHLY_REVENUE_PROJECTION = 500000;
const TOTAL_INVENTORY = 750;
const OCCUPIED_INVENTORY = 640;
const OCCUPIED_INVENTORY_PERCENTAGE = 85;

const getNumericAmount = (value) =>
  Number(String(value ?? "0").replace(/,/g, "")) || 0;

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

const getPaymentStatus = (row) => {
  const rentStatus = String(row?.rentStatus ?? "").trim().toLowerCase();
  if (rentStatus) return rentStatus;
  if (typeof row?.status === "boolean") return row.status ? "paid" : "unpaid";
  return String(row?.status ?? "").trim().toLowerCase();
};

const getReportingAmount = (row) => {
  const reportingDate = dayjs(getRevenueDate(row));
  const usesHistoricalRevenue =
    reportingDate.isValid() &&
    reportingDate.isBefore(dayjs("2026-09-01"), "month");

  return usesHistoricalRevenue
    ? getNumericAmount(row?.revenue)
    : getNumericAmount(row?.receivedAmount);
};

const asArray = (value) => (Array.isArray(value) ? value : []);

const getAverageUniqueClients = (revenueInvoices) => {
  const clients = [];
  const addClient = (date) => {
    const invoiceDate = dayjs(date);
    if (invoiceDate.isValid()) clients.push(invoiceDate);
  };

  asArray(revenueInvoices?.coworkingRevenues).forEach((invoice) =>
    addClient(invoice?.rentDate),
  );
  asArray(revenueInvoices?.virtualOfficeRevenues).forEach((invoice) =>
    addClient(invoice?.rentDate),
  );
  asArray(revenueInvoices?.meetingRevenue).forEach((invoice) =>
    addClient(invoice?.date),
  );

  const currentDate = dayjs().startOf("month");
  const currentFinancialYear =
    currentDate.month() >= 3 ? currentDate.year() : currentDate.year() - 1;
  const financialYears = clients.map((date) =>
    date.month() >= 3 ? date.year() : date.year() - 1,
  );
  const financialYear = financialYears.length
    ? Math.max(...financialYears)
    : currentFinancialYear;
  const count = clients.filter((date) => {
    const year = date.month() >= 3 ? date.year() : date.year() - 1;
    return (
      year === financialYear &&
      (financialYear !== currentFinancialYear ||
        !currentDate.isBefore(date.startOf("month").add(2, "month"), "month"))
    );
  }).length;
  const elapsedMonths =
    financialYear === currentFinancialYear
      ? Array.from({ length: 12 }, (_, index) =>
          dayjs().year(financialYear).month(3 + index).startOf("month"),
        ).filter(
          (month) =>
            !currentDate.isBefore(month.add(2, "month"), "month"),
        ).length
      : financialYear < currentFinancialYear
        ? 12
        : 1;

  return {
    value: Math.round(count / Math.max(elapsedMonths, 1)),
    fiscalYear: `FY ${financialYear}-${String(financialYear + 1).slice(-2)}`,
  };
};

const getNormalizedStatus = (value) => {
  if (typeof value === "string") return value.trim().toLowerCase();
  return value ? "paid" : "unpaid";
};

const getFiscalMonthIndex = (date = dayjs()) => {
  const month = dayjs(date).month();
  return month >= 3 ? month - 3 : month + 9;
};

const getPerSqFtSummary = ({ simpleRevenue, budgets, financeData }) => {
  const currentFiscalYear = getFiscalYearLabel();
  const fiscalStartYear = Number(currentFiscalYear.match(/\d{4}/)?.[0]);
  const months = Array.from({ length: 12 }, (_, index) =>
    dayjs().year(fiscalStartYear).month(3 + index).format("MMM-YY"),
  );
  const incomeByMonth = Object.fromEntries(months.map((month) => [month, 0]));
  const expenseByMonth = Object.fromEntries(months.map((month) => [month, 0]));
  const addIncome = (date, amount, status) => {
    const month = dayjs(date).format("MMM-YY");
    if (month in incomeByMonth && status === "paid") {
      incomeByMonth[month] += getNumericAmount(amount);
    }
  };

  asArray(simpleRevenue?.meetingRevenue).forEach((item) =>
    addIncome(
      item?.date,
      item?.taxable,
      getNormalizedStatus(item?.financeStatus) === "verified"
        ? "paid"
        : "unpaid",
    ),
  );
  asArray(simpleRevenue?.alternateRevenues).forEach((item) =>
    addIncome(
      item?.invoiceCreationDate,
      item?.taxableAmount,
      getNormalizedStatus(item?.status),
    ),
  );
  asArray(simpleRevenue?.virtualOfficeRevenues).forEach((item) =>
    addIncome(
      item?.rentDate,
      getReportingAmount(item),
      getNormalizedStatus(item?.rentStatus ?? item?.status),
    ),
  );
  asArray(simpleRevenue?.workationRevenues).forEach((item) =>
    addIncome(
      item?.date,
      item?.taxableAmount,
      getNormalizedStatus(item?.status),
    ),
  );
  asArray(simpleRevenue?.coworkingRevenues).forEach((item) =>
    addIncome(
      item?.rentDate,
      item?.revenue,
      getNormalizedStatus(item?.rentStatus),
    ),
  );
  asArray(budgets).forEach((item) => {
    const month = dayjs(item?.dueDate).format("MMM-YY");
    if (month in expenseByMonth) {
      expenseByMonth[month] += getNumericAmount(item?.actualAmount);
    }
  });

  const projectionStartIndex = Math.max(getFiscalMonthIndex() - 1, 0);
  const project = (values, upliftByMonth = {}) => {
    const average = projectionStartIndex
      ? Math.round(
          values
            .slice(0, projectionStartIndex)
            .reduce((sum, value) => sum + value, 0) / projectionStartIndex,
        )
      : 0;
    return values.map((value, index) =>
      index >= projectionStartIndex
        ? average + (upliftByMonth[index] || 0)
        : value,
    );
  };
  const projectedRevenue = project(months.map((month) => incomeByMonth[month]), {
    10: 1500000,
    11: 1500000,
  }).reduce((sum, value) => sum + value, 0);
  const projectedExpense = project(months.map((month) => expenseByMonth[month]), {
    10: 750000,
    11: 750000,
  }).reduce((sum, value) => sum + value, 0);
  const totalSqft = asArray(financeData)
    .filter((item) => item?.units)
    .flatMap((item) => item.units)
    .reduce((sum, unit) => sum + getNumericAmount(unit?.sqft), 0);

  return {
    revenue: Math.round(totalSqft ? projectedRevenue / totalSqft : 0),
    expense: Math.round(totalSqft ? projectedExpense / totalSqft : 0),
  };
};

const getMonthlyIncomeBreakdownData = (simpleRevenue) => {
  const paidRevenue = [];
  const addRevenue = (vertical, revenue, date, status) => {
    if (status === "paid") {
      paidRevenue.push({ vertical, revenue: getNumericAmount(revenue), date });
    }
  };

  asArray(simpleRevenue?.meetingRevenue).forEach((item) =>
    addRevenue(
      "Meeting",
      item?.taxable,
      item?.date,
      getNormalizedStatus(item?.financeStatus) === "verified"
        ? "paid"
        : "unpaid",
    ),
  );
  asArray(simpleRevenue?.alternateRevenues).forEach((item) =>
    addRevenue(
      "Alternate",
      item?.taxableAmount,
      item?.invoiceCreationDate,
      getNormalizedStatus(item?.status),
    ),
  );
  asArray(simpleRevenue?.virtualOfficeRevenues).forEach((item) =>
    addRevenue(
      "Virtual Office",
      getReportingAmount(item),
      item?.rentDate,
      getNormalizedStatus(item?.rentStatus ?? item?.status),
    ),
  );
  asArray(simpleRevenue?.workationRevenues).forEach((item) =>
    addRevenue(
      "Workation",
      item?.taxableAmount,
      item?.date,
      getNormalizedStatus(item?.status),
    ),
  );
  asArray(simpleRevenue?.coworkingRevenues).forEach((item) =>
    addRevenue(
      "Co-Working",
      item?.revenue,
      item?.rentDate,
      getNormalizedStatus(item?.rentStatus),
    ),
  );

  const today = dayjs();
  const fiscalStartYear = today.month() >= 3 ? today.year() : today.year() - 1;
  const fiscalStart = dayjs(`${fiscalStartYear}-04-01`).startOf("month");
  const fiscalEnd = fiscalStart.add(11, "month");
  const delayedProjectionStart = today.startOf("month").subtract(1, "month");
  const projectionStart = delayedProjectionStart.isBefore(fiscalStart, "month")
    ? fiscalStart
    : delayedProjectionStart;
  const completedMonthCount = projectionStart.diff(fiscalStart, "month");
  const projectedVerticals = [
    "Co-Working",
    "Virtual Office",
    "Meeting",
    "Alternate",
  ];
  const historicalFiscalData = paidRevenue.filter((item) => {
    const date = dayjs(item.date);
    return date.isValid() && date.isBefore(fiscalStart, "month");
  });
  const completedFiscalYearData = paidRevenue.filter((item) => {
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

  return [
    ...historicalFiscalData,
    ...completedFiscalYearData,
    ...projectedRecords,
  ];
};

const BizNestGraphTitle = () => (
  <span className="inline-flex items-baseline gap-2 leading-none text-[#1E3D73]">
    <span
      aria-label="BIZ Nest"
      className="inline-flex shrink-0 items-baseline whitespace-nowrap leading-none text-[#2a2525]"
    >
      <span>BI</span>
      <span className="text-[#e33434]">Z</span>
      <span>&nbsp;N<span className="lowercase">est</span></span>
    </span>
    <span className="inline-flex items-baseline leading-none">
      Monthly Income Breakdown Distribution
    </span>
  </span>
);

const SalesBarsIcon = () => (
  <span className="flex h-8 w-8 items-end justify-center gap-1" aria-hidden="true">
    <span className="h-3 w-1.5 rounded-full bg-current" />
    <span className="h-5 w-1.5 rounded-full bg-current" />
    <span className="h-7 w-1.5 rounded-full bg-current" />
  </span>
);

const SalesDashboard1 = ({ cardView = null, graphOnly = false }) => {
  const axios = useAxiosPrivate();
  const { hasPermission } = useUserPermissions();
  const currentMonth = dayjs().startOf("month");
  const fiscalYear = getFiscalYearLabel(currentMonth);

  const { data: virtualOfficeRevenue = [], isLoading } = useQuery({
    queryKey: ["virtualOfficeRevenue", { useClientDetails: true }],
    queryFn: async () => {
      const response = await axios.get("/api/sales/get-virtual-office-revenue", {
        params: { useClientDetails: true },
      });
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const { data: simpleRevenue = {}, isLoading: isUniqueClientsLoading } =
    useQuery({
      queryKey: ["sales-dashboard1-simple-revenue"],
      queryFn: async () => {
        const response = await axios.get(
          "/api/sales/simple-consolidated-revenue",
        );
        return response.data && typeof response.data === "object"
          ? response.data
          : {};
      },
    });

  const averageUniqueClients = useMemo(
    () => getAverageUniqueClients(simpleRevenue),
    [simpleRevenue],
  );
  const monthlyIncomeBreakdownData = useMemo(
    () => getMonthlyIncomeBreakdownData(simpleRevenue),
    [simpleRevenue],
  );

  const canViewPerSqFt = hasPermission(PERMISSIONS.SALES1_PER_SQ_FT_CARD.value);
  const { data: budgetData = [], isLoading: isBudgetLoading } = useQuery({
    queryKey: ["budgetData", "sales-dashboard1"],
    queryFn: async () => {
      const response = await axios.get("/api/budget/company-budget", {
        params: { view: "dashboard" },
      });
      return Array.isArray(response.data?.allBudgets)
        ? response.data.allBudgets
        : [];
    },
    enabled: canViewPerSqFt,
  });
  const { data: financeData = [], isLoading: isFinanceDataLoading } = useQuery({
    queryKey: ["revenueExpenseData"],
    queryFn: async () => {
      const response = await axios.get("/api/finance/income-expense");
      return Array.isArray(response.data?.response)
        ? response.data.response
        : [];
    },
    enabled: canViewPerSqFt,
  });
  const perSqFt = useMemo(
    () =>
      getPerSqFtSummary({
        simpleRevenue,
        budgets: budgetData,
        financeData,
      }),
    [budgetData, financeData, simpleRevenue],
  );

  const canViewDeskCards =
    hasPermission(PERMISSIONS.SALES1_OCCUPIED_DESKS_CARD.value) ||
    hasPermission(PERMISSIONS.SALES1_CURRENT_FREE_DESKS_CARD.value);
  const { data: unitsData = [], isLoading: isUnitsLoading } = useQuery({
    queryKey: ["unitsData"],
    queryFn: async () => {
      const response = await axios.get("/api/company/fetch-units");
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: canViewDeskCards,
  });
  const activeUnits = useMemo(
    () =>
      unitsData.filter(
        (unit) =>
          unit?.isActive &&
          !unit?.isOnlyBudget &&
          unit?.building?.buildingName,
      ),
    [unitsData],
  );
  const { data: occupiedDesksByUnit = [], isLoading: isOccupancyLoading } =
    useQuery({
      queryKey: [
        "sales-dashboard1-co-working-occupancy",
        activeUnits.map((unit) => unit._id).sort().join("|"),
      ],
      queryFn: async () => {
        const results = await Promise.allSettled(
          activeUnits.map(async (unit) => {
            const response = await axios.get("/api/sales/co-working-members", {
              params: { unitId: unit._id, active: true },
            });
            return Number(response.data?.totalOccupiedDesks) || 0;
          }),
        );
        return results
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value);
      },
      enabled: canViewDeskCards && activeUnits.length > 0,
    });
  const deskSummary = useMemo(() => {
    const total = activeUnits.reduce(
      (sum, unit) =>
        sum +
        getNumericAmount(unit?.openDesks) +
        getNumericAmount(unit?.cabinDesks),
      0,
    );
    const occupied = occupiedDesksByUnit.reduce(
      (sum, value) => sum + getNumericAmount(value),
      0,
    );
    return { total, occupied, free: Math.max(total - occupied, 0) };
  }, [activeUnits, occupiedDesksByUnit]);

  const canViewLeads = hasPermission(PERMISSIONS.SALES1_LEADS_THIS_YEAR_CARD.value);
  const { data: leadsData = [], isLoading: isLeadsLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/leads");
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: canViewLeads,
  });
  const leadsSummary = useMemo(() => {
    const fiscalYearLeads = leadsData.filter(
      (lead) => getFiscalYearLabel(lead?.dateOfContact) === fiscalYear,
    );
    const converted = fiscalYearLeads.filter((lead) => {
      const status = String(lead?.leadStatus || lead?.status || "")
        .trim()
        .toLowerCase();
      return (
        lead?.isConverted === true ||
        lead?.converted === true ||
        status === "converted" ||
        status === "closed"
      );
    }).length;
    return {
      total: fiscalYearLeads.length,
      converted,
      percentage: fiscalYearLeads.length
        ? ((converted / fiscalYearLeads.length) * 100).toFixed(1)
        : "0.0",
    };
  }, [fiscalYear, leadsData]);

  const summary = useMemo(() => {
    const currentYearRevenue = virtualOfficeRevenue.filter(
      (row) => getFiscalYearLabel(getRevenueDate(row)) === fiscalYear,
    );
    const actualRevenueRows = currentYearRevenue.filter((row) => {
      const revenueDate = dayjs(getRevenueDate(row));
      const isAvailableWithReportingLag =
        revenueDate.isValid() &&
        !currentMonth.isBefore(
          revenueDate.startOf("month").add(2, "month"),
          "month",
        );

      return (
        isAvailableWithReportingLag &&
        (row?.isHistoricalBilling === true || getPaymentStatus(row) === "paid")
      );
    });
    const revenueBooked = actualRevenueRows.reduce(
      (total, row) => total + getReportingAmount(row),
      0,
    );
    const fiscalYearStart = Number(fiscalYear.match(/\d{4}/)?.[0]);
    const fiscalMonths = Array.from({ length: 12 }, (_, index) =>
      dayjs().year(fiscalYearStart).month(3 + index).startOf("month"),
    );
    const latestActualMonthIndex = fiscalMonths.reduce(
      (latest, month, index) =>
        !currentMonth.isBefore(month.add(2, "month"), "month")
          ? index
          : latest,
      -1,
    );
    const latestActualMonthRevenue = actualRevenueRows.reduce((total, row) => {
      const revenueDate = dayjs(getRevenueDate(row));
      if (!revenueDate.isValid()) return total;
      return getFiscalMonthIndex(revenueDate) === latestActualMonthIndex
        ? total + getReportingAmount(row)
        : total;
    }, 0);
    const revenueDue =
      MONTHLY_REVENUE_PROJECTION * Math.max(11 - latestActualMonthIndex, 0);
    const activeCustomers = currentYearRevenue.filter((row) => {
      const revenueMonth = dayjs(getRevenueDate(row)).startOf("month");
      return (
        revenueMonth.isValid() &&
        !currentMonth.isBefore(
          revenueMonth.add(2, "month"),
          "month",
        )
      );
    }).length;

    return {
      annualRevenueTarget: revenueBooked + revenueDue,
      revenueBooked,
      revenueDue,
      averagePrice:
        activeCustomers > 0 ? Math.round(revenueBooked / activeCustomers) : 0,
      averageShortfallSurplus: Math.round(
        latestActualMonthRevenue - MONTHLY_REVENUE_PROJECTION,
      ),
    };
  }, [currentMonth, fiscalYear, virtualOfficeRevenue]);

  const cards = [
    {
      key: "annualRevenueTarget",
      title: "Annual Revenue Target",
      permission: PERMISSIONS.SALES1_ANNUAL_REVENUE_TARGET_CARD.value,
      route: PERMISSIONS.SALES1_ANNUAL_REVENUE_TARGET_CARD.route,
      icon: MdTrendingUp,
      tone: "bg-[#eafbf3] text-[#12a573]",
      valueTone: "text-[#1E3D73]",
    },
    {
      key: "revenueBooked",
      title: "Revenue Booked",
      permission: PERMISSIONS.SALES1_REVENUE_BOOKED_CARD.value,
      route: PERMISSIONS.SALES1_REVENUE_BOOKED_CARD.route,
      icon: SalesBarsIcon,
      tone: "bg-[#ecf9ff] text-[#13a573]",
      valueTone: "text-[#13a573]",
    },
    {
      key: "revenueDue",
      title: "Revenue Due",
      permission: PERMISSIONS.SALES1_REVENUE_DUE_CARD.value,
      route: PERMISSIONS.SALES1_REVENUE_DUE_CARD.route,
      icon: ChartNoAxesCombined,
      tone: "bg-[#fff0f5] text-[#f04a4a]",
      valueTone: "text-[#f04a4a]",
    },
    {
      key: "averagePrice",
      title: "Average Price",
      permission: PERMISSIONS.SALES1_AVERAGE_PRICE_CARD.value,
      route: PERMISSIONS.SALES1_AVERAGE_PRICE_CARD.route,
      icon: ChartPie,
      tone: "bg-[#eaf0f8] text-[#3F6291]",
      valueTone: "text-[#1E3D73]",
    },
    {
      key: "averageUniqueClients",
      title: "Average Unique Clients",
      permission: PERMISSIONS.SALES1_AVERAGE_UNIQUE_CLIENTS_CARD.value,
      route: PERMISSIONS.SALES1_AVERAGE_UNIQUE_CLIENTS_CARD.route,
      icon: MdGroups,
      tone: "bg-sky-50 text-[#13a9e8]",
      valueTone: "text-[#1E3D73]",
      value: averageUniqueClients.value,
      period: averageUniqueClients.fiscalYear,
      isLoading: isUniqueClientsLoading,
    },
    {
      key: "totalInventory",
      title: "Total Inventory",
      permission: PERMISSIONS.SALES1_TOTAL_INVENTORY_CARD.value,
      route: PERMISSIONS.SALES1_TOTAL_INVENTORY_CARD.route,
      icon: BsFillDatabaseFill,
      tone: "bg-blue-50 text-[#1E3D73]",
      valueTone: "text-[#1E3D73]",
      value: TOTAL_INVENTORY,
      hidePeriod: true,
      isLoading: false,
    },
    {
      key: "occupiedInventory",
      title: "Occupied Inventory",
      permission: PERMISSIONS.SALES1_OCCUPIED_INVENTORY_CARD.value,
      route: PERMISSIONS.SALES1_OCCUPIED_INVENTORY_CARD.route,
      icon: PiDesktopTowerFill,
      tone: "bg-sky-50 text-[#13a9e8]",
      valueTone: "text-[#1E3D73]",
      value: OCCUPIED_INVENTORY,
      percentage: OCCUPIED_INVENTORY_PERCENTAGE,
      hidePeriod: true,
      isLoading: false,
    },
    {
      key: "perSqFt",
      title: "Per Sq. Ft.",
      permission: PERMISSIONS.SALES1_PER_SQ_FT_CARD.value,
      route: PERMISSIONS.SALES1_PER_SQ_FT_CARD.route,
      icon: MdCalculate,
      tone: "bg-blue-50 text-[#1d7ed0]",
      hidePeriod: true,
      perSqFt,
      isLoading: isUniqueClientsLoading || isBudgetLoading || isFinanceDataLoading,
    },
    {
      key: "occupiedDesks",
      title: "Occupied Desks",
      permission: PERMISSIONS.SALES1_OCCUPIED_DESKS_CARD.value,
      route: PERMISSIONS.SALES1_OCCUPIED_DESKS_CARD.route,
      icon: FaChair,
      tone: "bg-[#eafbf3] text-[#12a573]",
      valueTone: "text-[#13a573]",
      value: deskSummary.occupied,
      subtitle: `Co-Working · of ${inrFormat(deskSummary.total)}`,
      hidePeriod: true,
      isLoading: isUnitsLoading || isOccupancyLoading,
    },
    {
      key: "currentFreeDesks",
      title: "Current Free Desks",
      permission: PERMISSIONS.SALES1_CURRENT_FREE_DESKS_CARD.value,
      route: PERMISSIONS.SALES1_CURRENT_FREE_DESKS_CARD.route,
      icon: MdOutlineDesk,
      tone: "bg-[#fff8e8] text-[#d98a00]",
      valueTone: "text-[#d98a00]",
      value: deskSummary.free,
      subtitle: "Available to sell",
      hidePeriod: true,
      isLoading: isUnitsLoading || isOccupancyLoading,
    },
    {
      key: "leadsThisYear",
      title: "Leads This Year",
      permission: PERMISSIONS.SALES1_LEADS_THIS_YEAR_CARD.value,
      route: PERMISSIONS.SALES1_LEADS_THIS_YEAR_CARD.route,
      icon: FaFilter,
      tone: "bg-[#ecf9ff] text-[#13a9e8]",
      valueTone: "text-[#1E3D73]",
      value: leadsSummary.total,
      subtitle: `${leadsSummary.converted} converted · ${leadsSummary.percentage}%`,
      badge: "NEW",
      hidePeriod: true,
      isLoading: isLeadsLoading,
    },
    {
      key: "averageShortfallSurplus",
      title: "Average Shortfall / Surplus",
      permission: PERMISSIONS.SALES1_AVERAGE_SHORTFALL_SURPLUS_CARD.value,
      route: PERMISSIONS.SALES1_AVERAGE_SHORTFALL_SURPLUS_CARD.route,
      icon: MdTrendingDown,
      tone:
        summary.averageShortfallSurplus >= 0
          ? "bg-[#eafbf3] text-[#12a573]"
          : "bg-[#fff0f0] text-[#f04a4a]",
      valueTone:
        summary.averageShortfallSurplus >= 0
          ? "text-[#13a573]"
          : "text-[#f04a4a]",
      valueDisplay: `${inrFormat(Math.abs(summary.averageShortfallSurplus))} ${
        summary.averageShortfallSurplus > 0
          ? "Surplus"
          : summary.averageShortfallSurplus < 0
            ? "Shortfall"
            : "On Target"
      }`,
    },
  ];
  const visibleCards = cards.filter(
    (card) =>
      !graphOnly &&
      hasPermission(card.permission) &&
      (!cardView || card.key === cardView),
  );
  const canViewMonthlyIncomeBreakdown = hasPermission(
    PERMISSIONS.SALES1_MONTHLY_INCOME_BREAKDOWN_GRAPH.value,
  );

  return (
    <div className="flex flex-col gap-4 p-3 pt-3">
      <div className="overflow-hidden rounded-lg">
        <div className="relative h-56 w-full bg-[#02172d] md:h-[17rem] xl:h-[19rem]">
          <img
            src={salesDashboardBanner}
            alt="Sales dashboard banner"
            className="h-full w-full object-contain object-right"
          />
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-[52%]"
            style={{
              background:
                "linear-gradient(to right, #fff 0%, #fff 76%, rgba(255,255,255,0.94) 82%, rgba(255,255,255,0.62) 89%, rgba(255,255,255,0.22) 95%, transparent 100%)",
            }}
          />
          <div className="absolute inset-y-0 left-0 flex w-[58%] flex-col px-1 py-4 sm:py-6">
            <p className="font-pregular text-xs uppercase tracking-[0.02em] text-[#1E3D73] sm:text-base lg:text-[15px] min-[1700px]:text-base min-[1900px]:text-lg">
              Sales Dashboard
            </p>
            <h1 className="mt-6 max-w-full whitespace-nowrap font-serif text-3xl font-semibold leading-[0.9] text-[#1E3D73] drop-shadow-sm sm:mt-10 sm:text-5xl lg:origin-left lg:scale-x-90 lg:text-[38px] xl:text-[42px] min-[1700px]:text-[46px] min-[1900px]:scale-x-100 min-[1900px]:text-[50px]">
              <span className="inline-block whitespace-nowrap">
                SALES <span className="text-[#E64B4B]">DASHBOARD</span>
              </span>
            </h1>
            <p className="mt-5 max-w-full font-pmedium text-xl leading-[0.94] text-[#1E3D73] sm:mt-8 sm:text-3xl md:whitespace-nowrap lg:text-[35px] min-[1700px]:text-[39px] min-[1900px]:text-[46px]">
              Sales, Performance &amp; Insights
            </p>
          </div>
          <nav
            aria-label="Sales dashboard navigation"
            className="absolute bottom-0 left-0 z-10 flex w-fit max-w-[61%] items-end gap-6 overflow-x-auto px-1 sm:gap-8 lg:w-[44%] lg:max-w-none lg:justify-between lg:gap-2 min-[1700px]:w-fit min-[1700px]:max-w-[61%] min-[1700px]:gap-10"
          >
            {dashboardLinks.map((item) => (
              <button
                key={item}
                type="button"
                className="group relative inline-flex shrink-0 items-center pb-0 pt-6 font-pmedium text-xs text-[#1E3D73] focus-visible:outline-none sm:text-sm min-[1700px]:text-base"
              >
                {item}
                <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-[#E64B4B] transition-transform duration-200 group-hover:scale-x-100 group-focus-visible:scale-x-100" />
              </button>
            ))}
            <DashboardPopupMenu cards={menuCards} moduleLabel="Sales" />
          </nav>
        </div>
      </div>
      {visibleCards.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {visibleCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.key}
                to={card.route}
                className="relative flex min-h-[92px] items-center gap-4 rounded-lg border border-[#e8ecf4] bg-white px-5 py-4 text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3D73]"
              >
                <span
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${card.tone}`}
                >
                  <Icon size={34} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start gap-2">
                    <span className="mb-1 block whitespace-nowrap text-sm font-pregular leading-tight text-[#1E3D73]">
                      {card.title}
                    </span>
                    {card.percentage !== undefined && (
                      <span className="ml-auto flex shrink-0 items-center gap-0.5 rounded-full bg-[#e8f8ed] px-1.5 py-0.5 text-[10px] font-semibold text-[#169b4d]">
                        <MdTrendingUp size={12} aria-hidden="true" />
                        {card.percentage}%
                      </span>
                    )}
                    {card.badge && (
                      <span className="ml-auto shrink-0 rounded-full border border-[#9bc4ff] bg-[#eaf3ff] px-1.5 py-0.5 text-[9px] font-semibold text-[#2878e8]">
                        {card.badge}
                      </span>
                    )}
                  </span>
                  {card.subtitle && (
                    <span className="mb-1 block whitespace-nowrap text-[11px] font-pmedium text-[#58709A]">
                      {card.subtitle}
                    </span>
                  )}
                  {!card.hidePeriod && (
                    <span className="mb-2 block text-xs font-semibold text-[#58709A]">
                      {card.period || fiscalYear}
                    </span>
                  )}
                  {card.perSqFt ? (
                    <span className="mt-1 flex items-center gap-2 whitespace-nowrap text-sm font-pmedium">
                      {card.isLoading ? (
                        "—"
                      ) : (
                        <>
                          <span className="text-[#12a573]">
                            Revenue - ₹ {inrFormat(card.perSqFt.revenue)}
                          </span>
                          <span className="h-4 w-px bg-[#d7dce8]" aria-hidden="true" />
                          <span className="text-[#f04a4a]">
                            Expense - ₹ {inrFormat(card.perSqFt.expense)}
                          </span>
                        </>
                      )}
                    </span>
                  ) : (
                    <span className={`mt-1 block text-lg font-pmedium ${card.valueTone}`}>
                      {card.isLoading ||
                      (card.isLoading === undefined && isLoading)
                        ? "—"
                        : card.valueDisplay ||
                          inrFormat(card.value ?? summary[card.key])}
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </div>
      )}
      {canViewMonthlyIncomeBreakdown && !cardView && (
        isUniqueClientsLoading ? (
          <div className="flex h-72 items-center justify-center rounded-lg border border-[#e8ecf4] bg-white text-sm text-[#58709A]">
            Loading monthly income breakdown...
          </div>
        ) : (
          <FyBarGraphPercentage
            data={monthlyIncomeBreakdownData}
            dateKey="date"
            valueKey="revenue"
            graphTitle={<BizNestGraphTitle />}
            chartOptions={{}}
            investorVariant
            hideHeaderAmounts
            includeWorkation
            balanceTooltipPercentages
            showFiscalYearInTitle
          />
        )
      )}
    </div>
  );
};

export default SalesDashboard1;
