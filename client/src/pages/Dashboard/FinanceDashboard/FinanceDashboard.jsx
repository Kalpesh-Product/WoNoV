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
import { useNavigate } from "react-router-dom";
import { useSidebar } from "../../../context/SideBarContext";
import { useEffect, useState } from "react";
import YearlyGraph from "../../../components/graphs/YearlyGraph";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { inrFormat } from "../../../utils/currencyFormat";
import { useDispatch } from "react-redux";
import {
  setTotalExpense,
  setTotalIncome,
} from "../../../redux/slices/financeSlice";
import humanDate from "../../../utils/humanDateForamt";

const FinanceDashboard = () => {
  const { setIsSidebarOpen } = useSidebar();
  const dispatch = useDispatch();

  useEffect(() => {
    setIsSidebarOpen(true);
  }, []); // Empty dependency array ensures this runs once on mount

  const navigate = useNavigate();
  const [selectedFiscalYear, setSelectedFiscalYear] = useState("FY 2024-25");

  const axios = useAxiosPrivate();
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
      const res = await axios.get("/api/budget/company-budget");
      return res.data?.allBudgets;
    },
  });

  const march2025Payments = isBudgetDataLoading
    ? []
    : budgetData.filter((item) => {
        const due = new Date(item.dueDate);
        return due.getFullYear() === 2025 && due.getMonth() === 2;
      });

  const financeBudgetsRaw = isBudgetDataLoading
    ? []
    : budgetData.filter(
        (item) => item.department?._id === "6798bab0e469e809084e249a"
      );

  const financeBudgets = financeBudgetsRaw.filter(
    (item) => item.expanseType === "Statutory Payments"
  );

  const testExpense = revenueExpenseData
    .filter((item) => item.expense)
    .flatMap((item) => item.expense);

  const testIncome = revenueExpenseData.filter((item) => item.income);

  const testUnits = revenueExpenseData
    .filter((item) => item.units)
    .flatMap((item) => item.units);

  const totalSqft = testUnits.reduce((sum, item) => (item.sqft || 0) + sum, 0);

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
  const excludedMonths = ["Jan-24", "Feb-24", "Mar-24"];

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

  const monthWiseIncome = {};
  incomeSources.forEach((income) => {
    const rawDate =
      income.date || income.rentDate || income.invoiceCreationDate;
    if (!rawDate) return;
    const monthKey = dayjs(rawDate).format("MMM-YY");
    if (excludedMonths.includes(monthKey)) return;

    const amount =
      income.taxableAmount || income.revenue || income.taxable || 0;
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
    })
  );

  const lastMonthRawIncome = incomeData.filter(
    (item) => item.group === "FY 2024-25"
  );
  const lastMonthDataIncome = lastMonthRawIncome.map(
    (item) => item.data[item.data.length - 1]
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
    dayjs(a.month, "MMM-YY").isAfter(dayjs(b.month, "MMM-YY")) ? 1 : -1
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
    })
  );

  const currentIncomeSeries = incomeData.find(
    (item) => item.group === selectedFiscalYear
  );

  const currentExpenseSeries = expenseData.find(
    (item) => item.group === selectedFiscalYear
  );

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

  const lastMonthRaw = expenseData.filter(
    (item) => item.group === "FY 2024-25"
  );
  const lastMonthData = lastMonthRaw.map(
    (item) => item.data[item.data.length - 1]
  );
  //----------INCOME-EXPENSE GRAPH conversion------------------//

  //-----------------------------------------------------Graph------------------------------------------------------//
  const incomeExpenseData = [...incomeData, ...expenseData];

  const incomeExpenseOptions = {
    chart: {
      id: "income-vs-expense-bar",
      animations: {
        enabled: false, // ✅ disables all animations
      },
      events: {
        dataPointSelection: () => {
          navigate("/app/dashboard/finance-dashboard/monthly-profit-loss");
        },
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
      max: 8000000,
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

  //-----------------------------------------------------Graph------------------------------------------------------//
  //-----------------------------------------------------DataCards------------------------------------------------------//
  const incomeCardData = {
    cardTitle: "Income",
    timePeriod: "FY 2024-25",
    descriptionData: [
      {
        title: "March 2025",
        value: `INR ${inrFormat(lastMonthDataIncome)}`,
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
    timePeriod: "FY 2024-25",
    descriptionData: [
      {
        title: "March 2025",
        value: `INR ${inrFormat(lastMonthData)}`,
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
    timePeriod: "FY 2024-25",
    descriptionData: [
      {
        title: "March 2025",
        value: `INR ${inrFormat(lastMonthDataIncome - lastMonthData)}`,
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
          (totalIncomeAmount - totalExpense) / totalSqft
        )}`,
        route: "sqft-wise-data",
      },
    ],
  };

  //-----------------------------------------------------DataCards------------------------------------------------------//
  //-----------------------------------------------------Pie Monthly Payout------------------------------------------------------//
  const availableMonths = sortedExpenses.map((e) => e.month);
  const todayMonth = dayjs().format("MMM-YY");

  // 1. Filter available months where actualAmount > 0 exists
  const monthsWithPositiveAmount = sortedExpenses
    .filter((monthData) =>
      (monthData.expenses || []).some((exp) => Number(exp.actualAmount) > 0)
    )
    .map((e) => e.month);

  // 2. Determine the latest applicable month (closest to today)
  let selectedMonth = todayMonth;
  if (!monthsWithPositiveAmount.includes(todayMonth)) {
    const todayIndex = monthsWithPositiveAmount.indexOf(todayMonth);
    selectedMonth =
      monthsWithPositiveAmount[Math.max(0, todayIndex - 1)] ||
      monthsWithPositiveAmount.at(-1);
  }

  // 3. Get that month's data
  const selectedMonthData = sortedExpenses.find(
    (item) => item.month === selectedMonth
  );

  // 4. Transform to `clientPayouts`

  const clientPayouts = (selectedMonthData?.expenses || []).map((expense) => ({
    clientName: expense.expanseName,
    amount: expense.actualAmount || 0,
    status: expense.status === "Approved" ? "paid" : "unpaid",
    date: dayjs(expense.dueDate).format("DD-MMM-YYYY"), // e.g., "15-May-2024"
  }));

  // Group and sum by status
  const paidClients = clientPayouts.filter((c) => c.status === "paid");
  const unpaidClients = clientPayouts.filter((c) => c.status === "unpaid");

  const pieMonthlyPayoutData = [
    {
      label: "Paid",
      value: Math.round(
        paidClients.reduce((sum, client) => sum + client.amount, 0)
      ),
      clients: paidClients,
    },
    {
      label: "Unpaid",
      value: Math.round(
        unpaidClients.reduce((sum, client) => sum + client.amount, 0)
      ),
      clients: unpaidClients,
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
    colors: ["#4CAF50", "#F44336"],
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
      y: {
        formatter: function (value, { seriesIndex }) {
          const category = pieMonthlyPayoutData[seriesIndex];
          return `INR ${category?.value?.toLocaleString("en-IN") || 0}`;
        },
      },
    },
    plotOptions: {
      pie: {
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

  // 2. Calculation function (unchanged but included for completeness)
  const calculatePaidVsUnpaid = (income = {}) => {
    const revenueSources = [
      income.meetingRevenue || [],
      income.alternateRevenues || [],
      income.virtualOfficeRevenues || [],
      income.workationRevenues || [],
      income.coworkingRevenues || [],
    ];

    let paid = 0;
    let unpaid = 0;

    revenueSources.forEach((source) => {
      source.forEach((item) => {
        const amount = item.revenue || item.taxableAmount || 0;

        if (item.status === "paid") {
          paid += amount;
        } else {
          unpaid += amount;
        }
      });
    });

    return { paid, unpaid };
  };

  // 3. Safely calculate paid and unpaid values
  const { paid, unpaid } = income
    ? calculatePaidVsUnpaid(income)
    : { paid: 0, unpaid: 0 };

  // 4. Prepare pie chart data
  const pieChartData = [
    { label: "Collected", value: paid },
    { label: "Due", value: unpaid },
  ];

  const pieChartOptions = {
    chart: {
      fontFamily: "Poppins-Regular",
    },
    labels: ["Collected", "Due"],
    colors: ["#2196F3", "#FF9800"],
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
    ([label, amount]) => ({ label, amount })
  );

  // const statutoryPayments = [
  //   { label: "PF", amount: 30000 },
  //   { label: "ESIC", amount: 20000 },
  //   { label: "TDS", amount: 15000 },
  //   { label: "PT", amount: 10000 },
  // ];

  const approvedPayments = financeBudgets.filter(
    (item) => item.status === "Approved"
  );
  const pendingPayments = financeBudgets.filter(
    (item) => item.status !== "Approved"
  );

  const statutoryDonutSeries = [
    Math.round(
      approvedPayments.reduce(
        (sum, item) => sum + Number(item.actualAmount || 0),
        0
      )
    ),
    Math.round(
      pendingPayments.reduce(
        (sum, item) => sum + Number(item.actualAmount || 0),
        0
      )
    ),
  ];

  const statutoryDonutLabels = ["Approved", "Pending"];
  const statutoryDonutColors = ["#4CAF50", "#FF9800"];
  const statutoryTooltipValues = statutoryDonutSeries.map(
    (amount, i) => `${statutoryDonutLabels[i]}: ₹ ${amount}`
  );
  //-----------------------------------------------------Donut Statutory Payments------------------------------------------------------//
  //-----------------------------------------------------Donut Rental Payments------------------------------------------------------//
  const rentalPayments = sortedExpenses.map((monthData) => {
    // Filter only Monthly Rent
    const rentExpenses = monthData.expenses.filter(
      (exp) => exp.expanseType === "Monthly Rent"
    );

    // Sum actualAmount
    const amount = rentExpenses.reduce(
      (sum, exp) => sum + (exp.actualAmount || 0),
      0
    );

    // Determine status
    const status =
      rentExpenses.length > 0 &&
      rentExpenses.every((exp) => exp.status === "Approved")
        ? "paid"
        : "unpaid";

    return {
      month: monthData.month,
      amount,
      status,
    };
  });

  const totalPaid = rentalPayments
    .filter((item) => item.status === "paid")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalUnpaid = rentalPayments
    .filter((item) => item.status === "unpaid")
    .reduce((sum, item) => sum + item.amount, 0);

  // Donut chart props
  const donutRentalLabels = ["Paid", "Unpaid"];
  const donutRentalSeries = [totalPaid, totalUnpaid];
  const donutRentalTooltipValue = [
    ` INR ${totalPaid.toLocaleString()}`,
    ` INR ${totalUnpaid.toLocaleString()}`,
  ];
  const donutRentalColors = ["#4CAF50", "#F44336"];

  //-----------------------------------------------------Donut Rental Payments------------------------------------------------------//
  //-----------------------------------------------------Table Priority Tasks------------------------------------------------------//

  const marchPaymentColumns = [
    { id: "srNo", label: "Sr No", width: 100 },
    { id: "expanseName", label: "Expense Name", width: 200 },
    { id: "expanseType", label: "Type", width: 150 },
    {
      id: "actualAmount",
      label: "Actual Amount (INR)",
      width: 150,
      renderCell: (row) => `${row.actualAmount.toLocaleString("en-IN")}`,
    },
    { id: "status", label: "Status", width: 120 },
    {
      id: "dueDate",
      label: "Due Date",
      width: 130,
      renderCell: (row) => dayjs(row.dueDate).format("DD MMM YYYY"),
    },
    {
      id: "department",
      label: "Department",
      width: 140,
      renderCell: (row) => row.department?.name || "-",
    },
    {
      id: "unit",
      label: "Unit No",
      width: 100,
      renderCell: (row) => row.unit?.unitNo || "-",
    },
  ];

  const now = new Date();
  const monthYear = now.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  //-----------------------------------------------------Table Rental Payments------------------------------------------------------//

  const techWidgets = [
    {
      layout: 1,
      widgets: [
        <YearlyGraph
          data={incomeExpenseData}
          options={incomeExpenseOptions}
          chartId={"bargraph-finance-income"}
          title={"BIZNest FINANCE INCOME V/S EXPENSE"}
          TitleAmountGreen={`INR ${inrFormat(totalIncomeAmount)}`}
          TitleAmountRed={`INR ${inrFormat(totalExpense)}`}
          onYearChange={setSelectedFiscalYear}
        />,
      ],
    },
    {
      layout: 3,
      widgets: [
        <FinanceCard {...incomeCardData} />,
        <FinanceCard {...expenseCardData} />,
        <FinanceCard
          {...netSavingsCardData}
          highlightNegativePositive={true}
        />,
      ],
    },
    {
      layout: 6,
      widgets: [
        <Card
          icon={<MdFormatListBulleted />}
          title="Cashflow"
          route={"cashflow"}
        />,
        <Card icon={<SiCashapp />} title="Finance" route={"finance"} />,
        <Card icon={<SiCashapp />} title="Billing" route={"billing"} />,
        <Card icon={<SiGoogleadsense />} title="Mix-Bag" route={"mix-bag"} />,
        <Card
          icon={<SiGoogleadsense />}
          title="Data"
          route={"/app/dashboard/finance-dashboard/data"}
        />,
        <Card
          icon={<MdOutlineMiscellaneousServices />}
          title="Settings"
          route={"/app/dashboard/finance-dashboard/settings"}
        />,
      ],
    },

    {
      layout: 2,
      widgets: [
        <WidgetSection title={`Payouts MAR-25 `} border>
          <PieChartMui
            data={pieMonthlyPayoutData}
            options={pieMonthlyPayoutOptions}
          />
        </WidgetSection>,
        <WidgetSection title={`Customer Collections MAR-25 `} border>
          {/* <PieChartMui
            data={[]}
            options={pieMonthlyCollectionOptions}
            width={500}
            height={350}
          /> */}
          <PieChartMui data={pieChartData} options={pieChartOptions} />
        </WidgetSection>,
      ],
    },
    {
      layout: 2,
      widgets: [
        <WidgetSection title={`Statutory Payments Due MAR-25`} border>
          <DonutChart
            centerLabel="Statutory"
            labels={statutoryDonutLabels}
            colors={statutoryDonutColors}
            series={statutoryDonutSeries}
            tooltipValue={statutoryTooltipValues}
            isMonetary={true}
          />
        </WidgetSection>,
        <WidgetSection title={`Rental Payments Due MAR-25`} border>
          <DonutChart
            centerLabel="Rental Status"
            labels={donutRentalLabels}
            colors={donutRentalColors}
            series={donutRentalSeries}
            tooltipValue={donutRentalTooltipValue}
            isMonetary={true}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 1,
      widgets: [
        // <MuiTable
        //   key={priorityTasks.length}
        //   scroll
        //   rowsToDisplay={4}
        //   Title={`KPA - ${monthYear} `}
        //   rows={[

        //   ]}
        //   columns={priorityTasksColumns}
        // />,
        <MuiTable
          Title="Payouts Mar-25"
          columns={marchPaymentColumns}
          rows={march2025Payments.map((item, index) => {
            return {
            srNo: index + 1,
            ...item,
            dueDate: item.dueDate
          }})}
          rowKey="_id"
          scroll={true}
          rowsToDisplay={march2025Payments.length}
        />,
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {techWidgets.map((section, index) => (
        <WidgetSection key={index} layout={section?.layout}>
          {section?.widgets}
        </WidgetSection>
      ))}

      {/* <div
        onClick={() => {
          navigate(`monthly-P&L`);
        }}>
        Monthly P&L
      </div>
      <div
        onClick={() => {
          navigate(`annual-average-P&L`);
        }}>
        Annual Average P&L
      </div>
      <div
        onClick={() => {
          navigate(`overall-P&L`);
        }}>
        Overall P&L
      </div>
      <div
        onClick={() => {
          navigate(`monthly-per-sq-ft-P&L`);
        }}>
        Monthly Per Sq. Ft. P&L
      </div>
      <hr />
      <div
        onClick={() => {
          navigate(`cashflow`);
        }}>
        Cashflow
      </div>
      <hr />
      <div
        onClick={() => {
          navigate(`/app/dashboard/finance-dashboard/data`);
        }}>
        Data
      </div>
      <hr />
      <div
        onClick={() => {
          navigate(`/app/dashboard/finance-dashboard/settings`);
        }}>
        Settings
      </div> */}
    </div>
  );
};

export default FinanceDashboard;
