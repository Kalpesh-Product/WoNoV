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
import { Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "../../../context/SideBarContext";
import { useEffect, useState } from "react";
import YearlyGraph from "../../../components/graphs/YearlyGraph";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { inrFormat } from "../../../utils/currencyFormat";

const FinanceDashboard = () => {
  const { setIsSidebarOpen } = useSidebar();

  useEffect(() => {
    setIsSidebarOpen(true);
  }, []); // Empty dependency array ensures this runs once on mount

  const navigate = useNavigate();

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
   
  const { data: budgetData = [], isLoading: isBudgetDataLoading } =
    useQuery({
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



  //----------INCOME-EXPENSE GRAPH conversion------------------//
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
  //-----------------IncomeData---------------//
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

  //-----------------IncomeData---------------//

  //------------------Expensedata----------------------//
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

  const lastMonthRaw = expenseData.filter(
    (item) => item.group === "FY 2024-25"
  );
  const lastMonthData = lastMonthRaw.map(
    (item) => item.data[item.data.length - 1]
  );
  //----------INCOME-EXPENSE GRAPH conversion------------------//

  //-----------------------------------------------------Graph------------------------------------------------------//
  const incomeExpenseData = [
    ...incomeData,
    // {
    //   name: "Income",
    //   group: "FY 2025-26",
    //   data: [
    //     1650000, // Jan - slight growth
    //     1720000, // Feb
    //     1850000, // Mar
    //     2000000, // Apr
    //     2200000, // May
    //     2400000, // Jun
    //     2600000, // Jul
    //     2550000, // Aug
    //     2450000, // Sep
    //     2800000, // Oct
    //     3000000, // Nov
    //     3300000, // Dec
    //   ],
    // },
    ...expenseData,
  ];

  console.log("income expense in graph : ",incomeExpenseData)

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
        value:  `INR ${inrFormat(totalIncomeAmount / 12)}` ,
        route: "annual-average-profit-loss",
      },
      {
        title: "Overall",
        value: `INR ${inrFormat(totalIncomeAmount)}`,
        route: "overall-profit-loss",
      },
      { title: "Per Sq. Ft.", value: `INR ${inrFormat(totalIncomeAmount / totalSqft)}`, route: "sqft-wise-data" },
    ],
  };

  const expenseCardData = {
    cardTitle: "Expense",
    timePeriod: "FY 2024-25",
    descriptionData: [
      { title: "March 2025", value: `INR ${inrFormat(lastMonthData)}` },
      { title: "Annual Average", value: `INR ${inrFormat(totalExpense / 12)}` },
      { title: "Overall", value: `INR ${inrFormat(totalExpense)}` },
      {
        title: "Per Sq. Ft.",
        value: `INR ${inrFormat(totalExpense / totalSqft)}`,
      },
    ],
  };

  const netSavingsCardData = {
    cardTitle: "Profit & Loss",
    timePeriod: "FY 2024-25",
    descriptionData: [
      { title: "March 2025", value: `INR ${inrFormat(  (lastMonthDataIncome - lastMonthData))}`   },
      { title: "Annual Average", value: `INR ${inrFormat((totalIncomeAmount - totalExpense) / 12)}`  },
      { title: "Overall", value: `INR ${inrFormat( (totalIncomeAmount - totalExpense))}` },
      { title: "Per Sq. Ft.", value: `INR ${inrFormat( (totalIncomeAmount - totalExpense) / totalSqft)}` },
    ],
  };

  //-----------------------------------------------------DataCards------------------------------------------------------//
  //-----------------------------------------------------Pie Monthly Payout------------------------------------------------------//
  const availableMonths = sortedExpenses.map((e) => e.month);
  const todayMonth = dayjs().format("MMM-YY");

  // 2. Determine the latest applicable month
  let selectedMonth = todayMonth;
  if (!availableMonths.includes(todayMonth)) {
    const todayIndex = availableMonths.indexOf(todayMonth);
    selectedMonth =
      availableMonths[Math.max(0, todayIndex - 1)] || availableMonths.at(-1);
  }

  // 3. Get that month's data
  const selectedMonthData = sortedExpenses.find(
    (item) => item.month === selectedMonth
  );

  // 4. Transform to `clientPayouts`

  const clientPayouts = (selectedMonthData?.expenses || []).map((expense) => ({
    clientName: expense.expanseName,
    amount: expense.actualAmount,
    status: expense.status === "Approved" ? "paid" : "unpaid",
    date: dayjs(expense.dueDate).format("DD-MMM-YYYY"), // e.g., "15-May-2024"
  }));

  // Group and sum by status
  const paidClients = clientPayouts.filter((c) => c.status === "paid");
  const unpaidClients = clientPayouts.filter((c) => c.status === "unpaid");

  const pieMonthlyPayoutData = [
    {
      label: "Paid",
      value: paidClients.reduce((sum, client) => sum + client.amount, 0),
      clients: paidClients,
    },
    {
      label: "Unpaid",
      value: unpaidClients.reduce((sum, client) => sum + client.amount, 0),
      clients: unpaidClients,
    },
  ];

  const pieMonthlyPayoutOptions = {
    chart: {
      fontFamily: "Poppins-Regular",
    },
    colors: ["#4CAF50", "#F44336"],
    labels: pieMonthlyPayoutData.map((item) => item.label),
    legend: {
      show: true,
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

        if (!category || !category.clients) return "";

        const rows = category.clients
          .map(
            (client) =>
              `<div style="display: flex; justify-content: space-between;">
                <span>${client.clientName}</span>
                <span>INR ${client.amount.toLocaleString()}</span>
              </div>`
          )
          .join("");

        return `
          <div style="padding: 8px; font-size: 13px;">
            <strong>${category.label} Clients:</strong>
            <div style="margin-top: 4px;">${rows}</div>
          </div>
        `;
      },
    },
  };

  //-----------------------------------------------------Pie Monthly Payout------------------------------------------------------//
  //-----------------------------------------------------Pie Monthly Collections------------------------------------------------------//
  const clientCollections = [
    { clientName: "Axis", amount: 15000, status: "collected" },
    { clientName: "HDFC", amount: 30000, status: "collected" },
    { clientName: "ICICI", amount: 10000, status: "pending" },
    { clientName: "Kotak", amount: 25000, status: "collected" },
    { clientName: "SBI", amount: 8000, status: "pending" },
  ];

  const collectedClients = clientCollections.filter(
    (c) => c.status === "collected"
  );
  const pendingClients = clientCollections.filter(
    (c) => c.status === "pending"
  );

  const pieMonthlyCollectionData = [
    {
      label: "Collected",
      value: collectedClients.reduce((sum, c) => sum + c.amount, 0),
      clients: collectedClients,
    },
    {
      label: "Pending",
      value: pendingClients.reduce((sum, c) => sum + c.amount, 0),
      clients: pendingClients,
    },
  ];

  const pieMonthlyCollectionOptions = {
    chart: {
      fontFamily: "Poppins-Regular",
    },
    colors: ["#2196F3", "#FF9800"], // Blue for collected, orange for pending
    labels: pieMonthlyCollectionData.map((item) => item.label),
    legend: {
      show: true,
    },
    dataLabels: {
      formatter: (val) => `${val.toFixed(1)}%`,
      style: {
        fontSize: "14px",
      },
    },
    tooltip: {
      custom: function ({ seriesIndex }) {
        const category = pieMonthlyCollectionData[seriesIndex];

        if (!category || !category.clients) return "";

        const rows = category.clients
          .map(
            (client) =>
              `<div style="display: flex; justify-content: space-between;">
              <span>${client.clientName}</span>
              <span>INR ${client.amount.toLocaleString()}</span>
            </div>`
          )
          .join("");

        return `
        <div style="padding: 8px; font-size: 13px;">
          <strong>${category.label} Clients:</strong>
          <div style="margin-top: 4px;">${rows}</div>
        </div>
      `;
      },
    },
  };

  //-----------------------------------------------------Pie Monthly Collections------------------------------------------------------//
  //-----------------------------------------------------Donut Statutory Payments------------------------------------------------------//

  const statutoryPaymentsData = isBudgetDataLoading ? [] : budgetData.filter((budget)=> {
    
    return budget.expanseType === "Statutory"
  })
 
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

  const donutStatutorylabels = statutoryPayments.map((item) => item.label);
  const donutStatutorySeries = statutoryPayments.map((item) => item.amount);
  const donutStatutoryTooltipValue = statutoryPayments.map(
    (item) => `INR ${item.amount.toLocaleString()}`
  );
  const donutStatutoryColors = ["#4CAF50", "#2196F3", "#FFC107", "#FF5722"]; // Custom color palette
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

  const priorityTasks = [
    { taskName: "GST Filing Report", type: "Daily", endTime: "12:00 PM" },
    {
      taskName: "Collection Report",
      type: "Daily",
      endTime: "03:00 PM",
    },
    { taskName: "Tally Update", type: "Monthly", endTime: "10:00 AM" },
    { taskName: "TDS Query Update", type: "Daily", endTime: "02:30 PM" },
    { taskName: "Audit Report Update", type: "Daily", endTime: "08:00 AM" },
    { taskName: "Check Approvals", type: "Daily", endTime: "09:00 AM" },
    {
      taskName: "Check Statutory Payments",
      type: "Daily",
      endTime: "03:00 PM",
    },
  ];

  const priorityTasksColumns = [
    { id: "id", label: "Sr No", align: "left" },
    { id: "taskName", label: "Task Name", align: "left" },
    {
      id: "type",
      label: "Type",
      renderCell: (data) => {
        return (
          <>
            <Chip sx={{ color: "#1E3D73" }} label={data.type} />
          </>
        );
      },
      align: "left",
    },
    { id: "endTime", label: "End Time", align: "left" },
  ];

  const executiveTimings = [
    {
      paymentName: "ChatGPT Pro",
      department: "Tech",
      amount: "5,000",
    },
    {
      paymentName: "AWS Subscription",
      department: "Tech",
      amount: "12,000",
    },
    {
      paymentName: "Zoom Enterprise",
      department: "Finance",
      amount: "3,500",
    },
    {
      paymentName: "Notion Team Plan",
      department: "Admin",
      amount: "2,400",
    },
    {
      paymentName: "Figma Professional",
      department: "Tech",
      amount: "4,200",
    },
    {
      paymentName: "Slack Premium",
      department: "Tech",
      amount: "3,000",
    },
    {
      paymentName: "Google Workspace",
      department: "IT",
      amount: "6,800",
    },
    {
      paymentName: "Sumo Payroll",
      department: "HR",
      amount: "7,500",
    },
    {
      paymentName: "Pet Pooja",
      department: "Cafe",
      amount: "5,300",
    },
  ];

  const executiveTimingsColumns = [
    { id: "id", label: "Sr No", align: "left" },
    { id: "paymentName", label: "Payment Name", align: "left" },
    { id: "department", label: "Department", align: "left" },
    { id: "amount", label: "Amount (INR)", align: "left" },
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
          TitleAmountGreen={`INR ${inrFormat(totalIncomeAmount)} `}
          TitleAmountRed={`INR ${inrFormat(totalExpense)}`}
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
        <WidgetSection title={`Payouts ${selectedMonthData?.month} `} border>
          <PieChartMui
            data={pieMonthlyPayoutData}
            options={pieMonthlyPayoutOptions}
            width={500}
            height={350}
          />
        </WidgetSection>,
        <WidgetSection title={`Customer Collections - ${monthYear} `} border>
          <PieChartMui
            data={[]}
            options={pieMonthlyCollectionOptions}
            width={500}
            height={350}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 2,
      widgets: [
        <WidgetSection title={`Statutory Payments Due - ${monthYear}`} border>
          <DonutChart
            centerLabel="Payments Due"
            labels={donutStatutorylabels}
            colors={donutStatutoryColors}
            series={donutStatutorySeries}
            tooltipValue={donutStatutoryTooltipValue}
            isMonetary={true}
          />
        </WidgetSection>,
        <WidgetSection title={`Rental Payments Due - ${monthYear}`} border>
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
      layout: 2,
      widgets: [
        <MuiTable
          key={priorityTasks.length}
          scroll
          rowsToDisplay={4}
          Title={`KPA - ${monthYear} `}
          rows={[
           
          ]}
          columns={priorityTasksColumns}
        />,
        <MuiTable
          key={executiveTimings.length}
          Title={`This Weeks Payouts - ${monthYear} `}
          rows={[
            // ...executiveTimings.map((timing, index) => ({
            //   id: index + 1,
            //   paymentName: timing.paymentName,
            //   department: timing.department,
            //   amount: timing.amount,
            // })),
            []
          ]}
          columns={executiveTimingsColumns}
          scroll
          rowsToDisplay={4}
        />,
      ],
    },
  ];


  return (
    <div>
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
