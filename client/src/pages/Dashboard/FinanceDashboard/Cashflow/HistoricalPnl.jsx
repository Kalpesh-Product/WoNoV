import AgTable from "../../../../components/AgTable";
import WidgetSection from "../../../../components/WidgetSection";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { inrFormat } from "../../../../utils/currencyFormat";
import NormalBarGraph from "../../../../components/graphs/NormalBarGraph";
import dayjs from "dayjs";
import { CircularProgress } from "@mui/material";
import { useMemo } from "react";

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

const HistoricalPnl = () => {
  const axios = useAxiosPrivate();

  const { data: revenueExpenseData = [], isLoading } = useQuery({
    queryKey: ["historicalIncomeExpense"],
    queryFn: async () => {
      const response = await axios.get("/api/finance/income-expense");
      return Array.isArray(response.data?.response) ? response.data.response : [];
    },
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
      <WidgetSection layout={1} padding>
        <WidgetSection border title={"Historical P&L"}>
          {isLoading ? (
            <div className="h-72 flex items-center justify-center">
              <CircularProgress />
            </div>
          ) : (
            <NormalBarGraph
              data={incomeExpenseData}
              options={incomeExpenseOptions}
            />
          )}
        </WidgetSection>
      </WidgetSection>

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
        />
      </WidgetSection>
    </div>
  );
};

export default HistoricalPnl;