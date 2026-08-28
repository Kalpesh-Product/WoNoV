import AgTable from "../../../components/AgTable";
import WidgetSection from "../../../components/WidgetSection";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { inrFormat } from "../../../utils/currencyFormat";
import NormalBarGraph from "../../../components/graphs/NormalBarGraph";
import YearlyGraph from "../../../components/graphs/YearlyGraph";
import dayjs from "dayjs";
import { CircularProgress } from "@mui/material";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PERMISSIONS } from "../../../constants/permissions";
import useUserPermissions from "../../../hooks/useUserPermissions";
import FinanceCard from "../../../components/FinanceCard";

const fiscalYearLabel = (date) => {
  const value = dayjs(date);
  const startYear = value.month() >= 3 ? value.year() : value.year() - 1;
  return `FY ${startYear}-${String(startYear + 1).slice(-2)}`;
};

const fiscalMonthIndex = (date) => {
  const month = dayjs(date).month();
  return month >= 3 ? month - 3 : month + 9;
};

const asArray = (value) => (Array.isArray(value) ? value : []);

const InvestorIncomeExpenseGraph = ({ showSummaryCards }) => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const currentFiscalYear = fiscalYearLabel(dayjs());
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(currentFiscalYear);

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

 const { series, totals, selectedIncome, selectedExpense } = useMemo(() => {
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
    const graphSeries = [...years].flatMap((group) => [
      { name: "Income", group, data: incomeByYear.get(group) || Array(12).fill(0) },
      { name: "Expense", group, data: expenseByYear.get(group) || Array(12).fill(0) },
    ]);
    const income = incomeByYear.get(selectedFiscalYear) || [];
    const expense = expenseByYear.get(selectedFiscalYear) || [];

    return {
      series: graphSeries,
      totals: {
        income: income.reduce((sum, value) => sum + value, 0),
        expense: expense.reduce((sum, value) => sum + value, 0),
      },
    selectedIncome: income,
      selectedExpense: expense,
    };
  }, [budgetData, currentFiscalYear, revenueExpenseData, selectedFiscalYear]);
   const totalSqft = useMemo(
    () =>
      revenueExpenseData
        .filter((item) => item?.units)
        .flatMap((item) => asArray(item.units))
        .reduce((sum, item) => sum + (Number(item?.sqft) || 0), 0),
    [revenueExpenseData],
  );

  const previousMonthIndex = fiscalMonthIndex(dayjs().subtract(1, "month"));
  const selectedYearStart = Number(selectedFiscalYear.match(/\d{4}/)?.[0]);
  const selectedMonthDate = Number.isFinite(selectedYearStart)
    ? dayjs(`${selectedYearStart}-04-01`).add(previousMonthIndex, "month")
    : null;
  const summaryMonthLabel = selectedMonthDate?.format("MMM-YY") || "-";
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
        value: `INR ${inrFormat(values.month)}`,
        route: "/app/dashboard/investor-dashboard/monthly-profit-loss",
      },
      {
        title: "Annual Average",
        value: `INR ${inrFormat(values.total / 12)}`,
        route: "/app/dashboard/investor-dashboard/annual-average-profit-loss",
      },
      {
        title: "Overall",
        value: `INR ${inrFormat(values.total)}`,
        route: "/app/dashboard/investor-dashboard/overall-profit-loss",
      },
      {
        title: "Per Sq. Ft.",
        value: `INR ${inrFormat(perSqft(values.total))}`,
        route: "/app/dashboard/investor-dashboard/sqft-wise-data",
      },
    ],
  });

  const options = {
    chart: {
      id: "investor-income-vs-expense",
      animations: { enabled: false },
      events: {
        dataPointSelection: () =>
          navigate("/app/dashboard/investor-dashboard/monthly-profit-loss"),
      },
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },
    colors: ["#54C4A7", "#EB5C45"],
    plotOptions: { bar: { horizontal: false, columnWidth: "70%", borderRadius: 6 } },
    dataLabels: { enabled: false },
    legend: { show: true, position: "top" },
    yaxis: {
      min: 0,
      title: { text: "Amount In Lakhs (INR)" },
      labels: { formatter: (value) => `${Math.round(value / 100000)}` },
    },
    tooltip: { y: { formatter: (value) => `INR ${inrFormat(value)}` } },
  };

  return (
   <div className="flex flex-col gap-8">
      <YearlyGraph
        data={series}
        options={options}
        chartId="bargraph-investor-income-expense"
        title="BIZNest FINANCE INCOME V/S EXPENSE"
        TitleAmountGreen={`INR ${inrFormat(totals.income)}`}
        TitleAmountRed={`INR ${inrFormat(totals.expense)}`}
        currentYear={selectedFiscalYear}
        onYearChange={setSelectedFiscalYear}
        refreshOnDataChange
      />
      {showSummaryCards && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <FinanceCard
            {...buildCardData("Income", {
              month: summaryMonthIncome,
              total: totals.income,
            })}
          />
          <FinanceCard
            {...buildCardData("Expense", {
              month: summaryMonthExpense,
              total: totals.expense,
            })}
          />
          <FinanceCard
            {...buildCardData(
              "Profit & Loss",
              {
                month: summaryMonthIncome - summaryMonthExpense,
                total: totals.income - totals.expense,
              },
              true,
            )}
          />
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
  const axios = useAxiosPrivate();
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission } = useUserPermissions();
  const showDetails = location.pathname.endsWith("/historical-P&L");
 const showIncomeExpensePage = location.pathname.endsWith("/income-expense");
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
        text: "Amount In Crores (INR)",
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
        formatter: (val) => `INR ${val.toLocaleString()}`,
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
      totalIncome: inrFormat(income),
      totalExpense: inrFormat(expense),
      totalProfitLoss: inrFormat(profitLoss),
    };
  });

  return (
    <div className="flex flex-col gap-8">
      {showDashboardHome && canViewHistoricalPnlGraph && (
        <WidgetSection layout={1}>
          <WidgetSection border title={"Historical P&L"}>
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
                />
              </div>
            )}
          </WidgetSection>
        </WidgetSection>
      )}

      {(showDashboardHome || showIncomeExpensePage) && canViewIncomeExpenseGraph && (
        <WidgetSection layout={1}>
          <InvestorIncomeExpenseGraph
            showSummaryCards={canViewFinanceSummaryCards}
          />
        </WidgetSection>
      )}

      {showDetails && (
        <WidgetSection layout={1}>
          <WidgetSection title={"Historical P&L Details"} border>
            <AgTable
              columns={[
                { field: "srNo", headerName: "Sr No", sort: "desc" },
                { field: "name", headerName: "Financial Year", flex: 1 },
                { field: "totalIncome", headerName: "Total Income (INR)" },
                { field: "totalExpense", headerName: "Total Expense (INR)" },
                {
                  field: "totalProfitLoss",
                  headerName: "Total Profit / Loss (INR)",
                },
              ]}
              hideFilter
              data={historicalTableData}
              exportData
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
