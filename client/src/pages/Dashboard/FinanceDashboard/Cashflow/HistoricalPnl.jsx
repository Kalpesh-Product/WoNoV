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

const getVirtualOfficeReportingAmount = (item) => {
  const reportingDate = dayjs(
    item?.rentDate || item?.invoiceUploadedAt || item?.createdAt
  );
  const usesHistoricalRevenue =
    reportingDate.isValid() &&
    reportingDate.isBefore(dayjs("2026-09-01"), "month");

  return usesHistoricalRevenue
    ? getNumericAmount(item?.revenue ?? item?.taxableAmount)
    : getNumericAmount(
        item?.reportingAmount ??
          item?.receivedAmount ??
          item?.revenue ??
          item?.taxableAmount
      );
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

  const { data: simpleRevenue = {}, isLoading: isSimpleRevenueLoading } =
    useQuery({
      queryKey: ["simpleRevenue"],
      queryFn: async () => {
        const response = await axios.get(
          "/api/sales/simple-consolidated-revenue"
        );
        return response.data || {};
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

    const incomeItems = [];

    simpleRevenue.meetingRevenue?.forEach((item) => {
      incomeItems.push({
        amount: getNumericAmount(item.taxable),
        date: item.date,
        paid: isMeetingFinancePaid(item),
      });
    });

    simpleRevenue.alternateRevenues?.forEach((item) => {
      incomeItems.push({
        amount: getNumericAmount(item.taxableAmount),
        date: item.invoiceCreationDate,
        paid: getNormalizedPaymentStatus(item.status) === "paid",
      });
    });

    simpleRevenue.virtualOfficeRevenues?.forEach((item) => {
      incomeItems.push({
        amount: getVirtualOfficeReportingAmount(item),
        date: item.rentDate,
        paid:
          getNormalizedPaymentStatus(item.rentStatus ?? item.status) ===
          "paid",
      });
    });

    simpleRevenue.workationRevenues?.forEach((item) => {
      incomeItems.push({
        amount: getNumericAmount(item.taxableAmount),
        date: item.date,
        paid: getNormalizedPaymentStatus(item.status) === "paid",
      });
    });

    simpleRevenue.coworkingRevenues?.forEach((item) => {
      incomeItems.push({
        amount: getNumericAmount(item.revenue),
        date: item.rentDate,
        paid: getNormalizedPaymentStatus(item.rentStatus) === "paid",
      });
    });

    const summary = Object.entries(yearCategories).map(([fiscalYear, months]) => {
      const income = incomeItems.reduce((sum, item) => {
        if (!item.paid) return sum;

        const rawDate = item.date;
        if (!rawDate || !dayjs(rawDate).isValid()) return sum;
        if (!months.includes(dayjs(rawDate).format("MMM-YY"))) return sum;

        return sum + item.amount;
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
  }, [revenueExpenseData, simpleRevenue]);

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
          {isLoading || isSimpleRevenueLoading ? (
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
          exportData
        />
      </WidgetSection>
    </div>
  );
};

export default HistoricalPnl;
