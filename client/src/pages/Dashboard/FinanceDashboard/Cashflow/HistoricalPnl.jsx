import { useState } from "react";
import AgTable from "../../../../components/AgTable";
import WidgetSection from "../../../../components/WidgetSection";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { inrFormat } from "../../../../utils/currencyFormat";
import NormalBarGraph from "../../../../components/graphs/NormalBarGraph";

const HistoricalPnl = () => {
  const axios = useAxiosPrivate();
  const { data: revenueData = [], isPending: isRevenuePending } = useQuery({
    queryKey: ["revenueData"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/sales/fetch-revenues");
        console.log("Revenue Data", response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching clients data:", error);
      }
    },
  });

  //-----------------------------------------------------Graph------------------------------------------------------//
  const incomeExpenseData = [
    {
      name: "Income",
      data: [25174680, 31929380, 31929380, 42222284], // in ₹
    },
    {
      name: "Expense",
      data: [24168780, 33899540, 33899540, 58672272], // in ₹
    },
  ];

  const incomeExpenseOptions = {
    chart: {
      id: "income-vs-expense-bar",
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },
    colors: ["#54C4A7", "#EB5C45"], // Green for income, Red for expense
    legend: {
      show: true,
      position: "top",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 6, // Adds rounded corners to the top of bars
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
      categories: [
        "2021 - 22",
        "2022 - 23",
        "2023 - 24",
        "2024 - 25",
        // "Oct-24",
        // "Nov-24",
        // "Dec-24",
        // "Jan-25",
        // "Feb-25",
        // "Mar-25",
      ],
    },
    yaxis: {
      title: {
        text: "Amount (INR)",
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

  const historicalTableData = incomeExpenseOptions.xaxis.categories.map(
    (year, index) => {
      const income = incomeExpenseData[0].data[index] || 0;
      const expense = incomeExpenseData[1].data[index] || 0;
      const profitLoss = income - expense;

      return {
        id: index + 1,
        srNo: index + 1,
        name: year,
        totalIncome: inrFormat(income),
        totalExpense: inrFormat(expense),
        totalProfitLoss: inrFormat(profitLoss),
      };
    }
  );

  //-----------------------------------------------------Graph------------------------------------------------------//

  const techWidgets = [
    {
      layout: 1,
      widgets: [
        <WidgetSection border title={"Historical P&L 2021-25"}>
          <NormalBarGraph
            data={incomeExpenseData}
            options={incomeExpenseOptions}
          />
        </WidgetSection>,
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {techWidgets.map((section, index) => (
        <WidgetSection key={index} layout={section?.layout} padding>
          {section?.widgets}
        </WidgetSection>
      ))}

      <WidgetSection title={"Historical P&L Details"} border>
        <AgTable
          columns={[
             { field: "srNo", headerName: "Sr No" },
            { field: "name", headerName: "Financial Year", flex: 1 },
            { field: "totalIncome", headerName: "Total Income (INR)" },
            { field: "totalExpense", headerName: "Total Expense (INR)" },
            {
              field: "totalProfitLoss",
              headerName: "Total Profit / Loss (INR)",
            },
          ]}
          data={historicalTableData}
        />
      </WidgetSection>
    </div>
  );
};

export default HistoricalPnl;
