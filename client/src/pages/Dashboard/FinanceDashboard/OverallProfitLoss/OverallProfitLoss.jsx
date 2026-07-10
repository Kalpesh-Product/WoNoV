import { useMemo, useState } from "react";
import AgTable from "../../../../components/AgTable";
import MuiModal from "../../../../components/MuiModal";
import WidgetSection from "../../../../components/WidgetSection";
import { inrFormat } from "../../../../utils/currencyFormat";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import dayjs from "dayjs";
import YearlyGraph from "../../../../components/graphs/YearlyGraph";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";

const OverallProfitLoss = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();

  const { data: revenueExpenseData = [], isLoading: isRevenueExpenseLoading } =
    useQuery({
      queryKey: ["revenueExpenseData"],
      queryFn: async () => {
        try {
          const response = await axios.get("/api/finance/income-expense");
          return Array.isArray(response.data?.response)
            ? response.data.response
            : [];
        } catch (error) {
          console.error(error);
        }
      },
    });

  const { data: budgetData = [], isLoading: isBudgetDataLoading } = useQuery({
    queryKey: ["budgetData"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/budget/company-budget");
        return Array.isArray(response.data?.allBudgets)
          ? response.data.allBudgets
          : [];
      } catch (error) {
        console.error(error);
      }
    },
  });

  const { data: simpleRevenue = [], isLoading: isSimpleRevenueLoading } =
    useQuery({
      queryKey: ["simpleRevenue"],
      queryFn: async () => {
        try {
          const response = await axios.get(
            "/api/sales/simple-consolidated-revenue"
          );
          return response.data;
        } catch (error) {
          console.error(error);
        }
      },
    });

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);

  const currentFiscalYearLabel = useMemo(() => {
    const today = dayjs();
    const startYear = today.month() >= 3 ? today.year() : today.year() - 1;
    return `FY ${startYear}-${String(startYear + 1).slice(-2)}`;
  }, []);

  const [selectedFY, setSelectedFY] = useState(currentFiscalYearLabel);

  const handleYearChange = (fiscalYear) => {
    setSelectedFY(fiscalYear);
  };

  const excludedMonths = ["Jan-24", "Feb-24", "Mar-24"];
  const monthWiseExpenses = {};

  const getFiscalYearLabel = (dateInput) => {
    const parsedDate = dayjs(dateInput);
    if (!parsedDate.isValid()) return null;

    const startYear = parsedDate.month() >= 3
      ? parsedDate.year()
      : parsedDate.year() - 1;

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

  const monthWiseIncome = {};

  const incomeSources = useMemo(() => {
    if (!simpleRevenue) return [];
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
          item.status ?? item.rentStatus
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

  const testExpense = Array.isArray(budgetData) ? budgetData : [];

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
          Number(b.match(/\d{4}/)?.[0] || 0)
      )
      .reduce((acc, fiscalYear) => {
        acc[fiscalYear] = buildFiscalYearMonths(fiscalYear);
        return acc;
      }, {});
  }, [currentFiscalYearLabel, incomeSources, testExpense]);

  incomeSources.forEach((income) => {
    const rawDate = income.date;

    if (!rawDate || !dayjs(rawDate).isValid()) return;

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

  const transformedIncomes = Object.values(monthWiseIncome).sort((a, b) =>
    dayjs(a.month, "MMM-YY").isAfter(dayjs(b.month, "MMM-YY")) ? 1 : -1
  );

  const incomeMap = {};
  transformedIncomes.forEach((item) => {
    incomeMap[item.month] = item.actualIncome;
  });

  const incomeData = Object.entries(yearCategories).map(
    ([fiscalYear, months]) => ({
      name: "Income",
      group: fiscalYear,
      data: months.map((month) => (incomeMap ? incomeMap[month] || 0 : 0)),
    })
  );

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

  const sortedExpenses = transformedExpenses
    .filter((e) => e.month && dayjs(e.month, "MMM-YY").isValid())
    .sort((a, b) =>
      dayjs(a.month, "MMM-YY").isAfter(dayjs(b.month, "MMM-YY")) ? 1 : -1
    );

  const expenseMap = {};
  sortedExpenses.forEach((item) => {
    expenseMap[item.month] = item.actualExpense;
  });

  const expenseData = Object.entries(yearCategories).map(
    ([fiscalYear, months]) => ({
      name: "Expense",
      group: fiscalYear,
      data: months.map((month) => (expenseMap ? expenseMap[month] || 0 : 0)),
    })
  );

  const currentIncomeSeries = incomeData.find((item) => item.group === selectedFY);
  const currentExpenseSeries = expenseData.find((item) => item.group === selectedFY);

  const monthlyProfitLossColumns = [
    { field: "id", headerName: "Sr No", width: 100 },
    { field: "month", headerName: "Month", flex: 1 },
    {
      field: "income",
      headerName: "Income (INR)",
      flex: 1,
      cellRenderer: (params) => (
        <span
          role="button"
          onClick={() =>
            navigate(
              "/app/dashboard/finance-dashboard/overall-profit-loss/income-details"
            )
          }
          className="text-primary underline cursor-pointer"
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "expense",
      headerName: "Expense (INR)",
      flex: 1,
      cellRenderer: (params) => (
        <span
          role="button"
          onClick={() =>
            navigate(
              "/app/dashboard/finance-dashboard/mix-bag/department-wise-budget"
            )
          }
          className="text-primary underline cursor-pointer"
        >
          {params.value}
        </span>
      ),
    },
    { field: "pnl", headerName: "P&L (INR)", flex: 1 },
  ];

  const handleViewModal = (rowData) => {
    setViewDetails(rowData);
    setViewModalOpen(true);
  };

  const incomeExpenseData = [...incomeData, ...expenseData];
  const incomeExpenseAxisMax = useMemo(() => {
    const visibleSeries = [currentIncomeSeries, currentExpenseSeries].filter(
      Boolean
    );
    const maxValue = visibleSeries.reduce((currentMax, series) => {
      const seriesMax = (series?.data || []).reduce(
        (max, value) => Math.max(max, Number(value) || 0),
        0
      );

      return Math.max(currentMax, seriesMax);
    }, 0);

    if (maxValue <= 0) return 100000;

    const paddedMax = maxValue * 1.15;
    const magnitude = 10 ** Math.floor(Math.log10(paddedMax));

    return Math.ceil(paddedMax / magnitude) * magnitude;
  }, [currentExpenseSeries, currentIncomeSeries]);

  const incomeExpenseOptions = {
    chart: {
      id: "income-vs-expense-bar",
      animations: {
        enabled: false,
      },
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },
    colors: ["#54C4A7", "#EB5C45"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "70%",
        borderRadius: 6,
        dataLabels: {
          position: "top",
        },
      },
    },
    legend: {
      show: true,
      position: "top",
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    yaxis: {
      min: 0,
      max: incomeExpenseAxisMax,
      title: {
        text: "Amount In Lakhs (INR)",
      },
      labels: {
        formatter: (val) => `${Math.round(val / 100000)}`,
      },
      tickAmount: 4,
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      custom: ({ dataPointIndex, w }) => {
        const monthIndex = dataPointIndex;
        const income =
          w.globals.initialSeries.find((s) => s.name === "Income")?.data[
            monthIndex
          ] ?? 0;
        const expense =
          w.globals.initialSeries.find((s) => s.name === "Expense")?.data[
            monthIndex
          ] ?? 0;

        const monthLabel =
          w.globals.labels && w.globals.labels[monthIndex]
            ? w.globals.labels[monthIndex]
            : `Month ${monthIndex + 1}`;

        return `
          <div style="padding: 10px; font-family: Poppins, sans-serif; font-size: 13px; width : 180px">
            <strong>${monthLabel}</strong><br/>
            <hr />
            <div style="margin-top: 6px;">
              <div style="display: flex; justify-content: space-between;">
                <strong>Income</strong>
                <span>INR ${income?.toLocaleString() || "0"}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <strong>Expense</strong>
                <span>INR ${inrFormat(expense) || "0"}</span>
              </div>
            </div>
          </div>
        `;
      },
    },
  };

  const selectedFYMonths = yearCategories[selectedFY] || [];

  const selectedFYIncome = selectedFYMonths.reduce(
    (sum, month) => sum + (incomeMap[month] || 0),
    0
  );

  const selectedFYExpense = selectedFYMonths.reduce(
    (sum, month) => sum + (expenseMap[month] || 0),
    0
  );

  const monthlyProfitLossData = selectedFYMonths.map((month, index) => {
    const income = incomeMap[month] || 0;
    const expense = expenseMap[month] || 0;
    const pnl = income - expense;

    return {
      id: index + 1,
      month,
      income: inrFormat(income),
      expense: inrFormat(expense),
      pnl: inrFormat(pnl),
    };
  });

  const totalPnL = selectedFYIncome - selectedFYExpense;

  const techWidgets = [
    {
      layout: 1,
      widgets: [
        <YearlyGraph
          data={incomeExpenseData}
          options={incomeExpenseOptions}
          chartId={"bargraph-finance-income"}
          title={"BIZNest FINANCE INCOME V/S EXPENSE"}
          TitleAmountGreen={`INR ${inrFormat(selectedFYIncome)}`}
          TitleAmountRed={`INR ${inrFormat(selectedFYExpense)}`}
          onYearChange={handleYearChange}
          currentYear={selectedFY}
        />,
      ],
    },
  ];

  if (
    isRevenueExpenseLoading ||
    isBudgetDataLoading ||
    isSimpleRevenueLoading
  ) {
    return (
      <div className="p-4 h-72 flex justify-center items-center text-center text-gray-500">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {techWidgets.map((section, index) => (
        <WidgetSection key={index} layout={section?.layout} padding>
          {section?.widgets}
        </WidgetSection>
      ))}

      <div>
        {monthlyProfitLossData.length > 0 ? (
          <WidgetSection
            border
            TitleAmount={`P&L :  INR ${inrFormat(totalPnL)}`}
            titleLabel={selectedFY}
            title={`Total Monthly P&L`}
          >
            <AgTable
              data={monthlyProfitLossData}
              columns={monthlyProfitLossColumns}
              search={true}
              exportData
            />
          </WidgetSection>
        ) : (
          <WidgetSection title="Monthly P&L">
            <p className="text-center text-gray-500 py-8">
              No data available for {selectedFY}
            </p>
          </WidgetSection>
        )}
      </div>
      {viewDetails && (
        <MuiModal
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title="Tax Payment Detail"
        >
          <div className="space-y-3">
            <DetalisFormatted title="Month" detail={viewDetails.month} />
            <DetalisFormatted
              title="Income"
              detail={`INR ${Number(
                viewDetails.income.replace(/,/g, "")
              ).toLocaleString("en-IN")}`}
            />
            <DetalisFormatted
              title="Expense"
              detail={`INR ${Number(
                viewDetails.expense.replace(/,/g, "")
              ).toLocaleString("en-IN")}`}
            />
            <DetalisFormatted
              title="P&L"
              detail={`INR ${Number(
                viewDetails.pnl.replace(/,/g, "")
              ).toLocaleString("en-IN")}`}
            />
          </div>
        </MuiModal>
      )}
    </div>
  );
};

export default OverallProfitLoss;
