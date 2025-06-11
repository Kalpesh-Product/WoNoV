import { useState } from "react";
import AgTable from "../../../../components/AgTable";
import BarGraph from "../../../../components/graphs/BarGraph";
import MuiModal from "../../../../components/MuiModal";
import WidgetSection from "../../../../components/WidgetSection";
import { inrFormat } from "../../../../utils/currencyFormat";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import dayjs from "dayjs";
import YearlyGraph from "../../../../components/graphs/YearlyGraph";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";

const MonthlyProfitLoss = () => {
  const axios = useAxiosPrivate();

  //-----------------API-----------------//
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
    });

  const { data: budgetData = [], isLoading: isBudgetDataLoading } = useQuery({
    queryKey: ["budgetData"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/budget/company-budget");
        return response.data?.allBudgets;
      } catch (error) {
        console.error(error);
      }
    },
  });
  //-----------------API-----------------//

  //-----------------------------------------------------Graph------------------------------------------------------//

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);

  const excludedMonths = ["Jan-24", "Feb-24", "Mar-24"];
  const monthWiseExpenses = {};
  const yearCategories = {
    "FY 2024-25": [
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
    "FY 2025-26": [
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

  //-------INCOME-------//
  const monthWiseIncome = {};

  // Flatten all income arrays from all sources
  const incomeSources = revenueExpenseData.flatMap((item) => {
    const income = item.income || {};
    return [
      ...(income.meetingRevenue || []),
      ...(income.alternateRevenues || []),
      ...(income.virtualOfficeRevenues || []),
      ...(income.workationRevenues || []),
      ...(income.coworkingRevenues || []),
    ];
  });

  // Process each income item
  incomeSources.forEach((income) => {
    // Pick the most relevant date for grouping by month
    const rawDate =
      income.date || income.rentDate || income.invoiceCreationDate;
    // income.paDueDate ||
    // income.dueTerm;

    if (!rawDate) return;

    const monthKey = dayjs(rawDate).format("MMM-YY");

    // Skip excluded months
    if (excludedMonths.includes(monthKey)) return;

    const amount = income.taxableAmount || income.revenue || 0;

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

  // Convert to array and sort
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
      data: months.map((month) => incomeMap[month] || 0),
    })
  );

  const lastMonthRawIncome = incomeData.filter(
    (item) => item.group === "FY 2024-25"
  );
  const lastMonthDataIncome = lastMonthRawIncome.map(
    (item) => item.data[item.data.length - 1]
  );

  //-------INCOME-------//

  //------------------Expensedata----------------------//
    const testExpense = revenueExpenseData
    .filter((item) => item.expense)
    .flatMap((item) => item.expense);
  const testIncome = revenueExpenseData.filter((item) => item.income);
  const testUnits = revenueExpenseData
    .filter((item) => item.units)
    .flatMap((item) => item.units);
  const totalSqft = testUnits.reduce((sum, item) => (item.sqft || 0) + sum, 0);
  const totalExpense = testExpense.reduce(
    (sum, item) => (item.actualAmount || 0) + sum,
    0
  );
  const totalIncomeAmount = testIncome.reduce((grandTotal, item, index) => {
    const incomeSources = item.income || {};

    const incomeValues = Object.values(incomeSources);

    const allRevenues = incomeValues.flat();

    const sourceTotals = allRevenues.reduce((sum, revenueItem, i) => {
      const value = revenueItem.taxableAmount ?? revenueItem.revenue ?? 0;
      return sum + value;
    }, 0);

    return grandTotal + sourceTotals;
  }, 0);
  testExpense.forEach((exp) => {
    const monthKey = dayjs(exp.dueDate).format("MMM-YY"); // e.g., "Apr-24"

    // Skip excluded months
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
    dayjs(a.month, "MMM-YY").isAfter(dayjs(b.month, "MMM-YY")) ? 1 : -1
  );

  // Build map of month => actualExpense
  const expenseMap = {};
  sortedExpenses.forEach((item) => {
    expenseMap[item.month] = item.actualExpense;
  });

  // Generate expenseData for all fiscal years defined in `yearCategories`
  const expenseData = Object.entries(yearCategories).map(
    ([fiscalYear, months]) => ({
      name: "Expense",
      group: fiscalYear,
      data: months.map((month) => expenseMap[month] || 0),
    })
  );
  //------------------Expensedata----------------------//

  //-----------------------------------------------------Graph------------------------------------------------------//
  //-----------------------------------------------------Table columns/Data------------------------------------------------------//
  const monthlyProfitLossColumns = [
    { field: "id", headerName: "Sr No", flex: 1 },
    { field: "month", headerName: "Month", flex: 1 },
    { field: "income", headerName: "Income (INR)", flex: 1 },
    { field: "expense", headerName: "Expense (INR)", flex: 1 },
    { field: "pnl", headerName: "P&L (INR)", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <>
          <div className="p-2 mb-2 flex gap-2">
            <span
              className="text-subtitle cursor-pointer"
              onClick={() => handleViewModal(params.data)}
            >
              <MdOutlineRemoveRedEye />
            </span>
          </div>
        </>
      ),
    },
  ];

  const monthlyProfitLossData = [
    {
      id: 1,
      month: "Apr-24",
      income: inrFormat(1250000),
      expense: inrFormat(750000),
      pnl: inrFormat(500000),
    },
    {
      id: 2,
      month: "May-24",
      income: inrFormat(1400000),
      expense: inrFormat(800000),
      pnl: inrFormat(600000),
    },
    {
      id: 3,
      month: "Jun-24",
      income: inrFormat(1600000),
      expense: inrFormat(1700000),
      pnl: inrFormat(-100000),
    },
    {
      id: 4,
      month: "Jul-24",
      income: inrFormat(1800000),
      expense: inrFormat(950000),
      pnl: inrFormat(850000),
    },
    {
      id: 5,
      month: "Aug-24",
      income: inrFormat(2000000),
      expense: inrFormat(2100000),
      pnl: inrFormat(-100000),
    },
    {
      id: 6,
      month: "Sep-24",
      income: inrFormat(1700000),
      expense: inrFormat(1100000),
      pnl: inrFormat(600000),
    },
    {
      id: 7,
      month: "Oct-24",
      income: inrFormat(1900000),
      expense: inrFormat(1300000),
      pnl: inrFormat(600000),
    },
    {
      id: 8,
      month: "Nov-24",
      income: inrFormat(2100000),
      expense: inrFormat(1600000),
      pnl: inrFormat(500000),
    },
    {
      id: 9,
      month: "Dec-24",
      income: inrFormat(2200000),
      expense: inrFormat(2100000),
      pnl: inrFormat(100000),
    },
  ];
  const handleViewModal = (rowData) => {
    setViewDetails(rowData);
    setViewModalOpen(true);
  };

  const totalPnL = monthlyProfitLossData.reduce((sum, item) => {
    const numericalPnL = parseInt(item.pnl.replace(/,/g, ""), 10);
    return sum + numericalPnL;
  }, 0);



    const incomeExpenseData = [
    ...incomeData,
    ...expenseData,
  ];

  const incomeExpenseOptions = {
    chart: {
      id: "income-vs-expense-bar",
      animations: {
        enabled: false, // ✅ disables all animations
      },
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },
    colors: ["#54C4A7", "#EB5C45"], // Green for income, Red for expense
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "70%",
        borderRadius: 6, // Adds rounded corners to the top of bars
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
        const income = w.globals.initialSeries.find((s) => s.name === "Income")
          ?.data[monthIndex];
        const expense = w.globals.initialSeries.find(
          (s) => s.name === "Expense"
        )?.data[monthIndex];

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

  //-----------------------------------------------------Table columns/Data------------------------------------------------------//
  const techWidgets = [
    {
      layout: 1,
      widgets: [
        <YearlyGraph
          data={incomeExpenseData}
          options={incomeExpenseOptions}
          chartId={"bargraph-finance-income"}
          title={"BIZNest FINANCE INCOME V/S EXPENSE"}
          TitleAmountGreen={`INR ${inrFormat(totalIncomeAmount)} `}
          TitleAmountRed={`INR ${inrFormat(totalExpense)}`}
        />,
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      {techWidgets.map((section, index) => (
        <WidgetSection key={index} layout={section?.layout} padding>
          {section?.widgets}
        </WidgetSection>
      ))}

      <div>
        <WidgetSection
          border
          TitleAmount={``}
          titleLabel={"FY 2024-25"}
          title={`Total Monthly P&L`}
        >
          <AgTable data={[]} columns={monthlyProfitLossColumns} search={true} />
        </WidgetSection>
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

export default MonthlyProfitLoss;
