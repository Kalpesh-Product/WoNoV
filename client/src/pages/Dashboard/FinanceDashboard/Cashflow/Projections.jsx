import {
  MdNavigateBefore,
  MdNavigateNext,
  MdOutlineRemoveRedEye,
} from "react-icons/md";
import AgTable from "../../../../components/AgTable";
import BarGraph from "../../../../components/graphs/BarGraph";
import WidgetSection from "../../../../components/WidgetSection";
import { useState } from "react";
import MuiModal from "../../../../components/MuiModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import { inrFormat } from "../../../../utils/currencyFormat";
import SecondaryButton from "../../../../components/SecondaryButton";
import YearlyGraph from "../../../../components/graphs/YearlyGraph";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import YearWiseTable from "../../../../components/Tables/YearWiseTable"
import { CircularProgress } from "@mui/material";

const Projections = () => {
  const axios = useAxiosPrivate();

  //-----------------------------------------------------API------------------------------------------------------//
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
  //-----------------------------------------------------API------------------------------------------------------//
  //-----------------------------------------------------Graph------------------------------------------------------//

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);
  const fiscalYears = ["FY 2024-25", "FY 2025-26"];
  const [selectedYearIndex, setSelectedYearIndex] = useState(0);
  const selectedYear = fiscalYears[selectedYearIndex];

  // Initialize array of 12 months from April to March
  const monthlyIncomeExpense = Array(12)
    .fill(0)
    .map(() => ({ income: 0, expense: 0 }));

  const fyStart = dayjs("2024-04-01");
  const fyEnd = dayjs("2025-03-31");

  budgetData.forEach((entry) => {
    const date = dayjs(entry.dueDate);

    if (
      entry.status === "Approved" &&
      date.isValid() &&
      date.isAfter(fyStart.subtract(1, "day")) &&
      date.isBefore(fyEnd.add(1, "day"))
    ) {
      const month = date.month(); // 0 = Jan, 3 = Apr, 11 = Dec
      const fyMonthIndex = (month + 9) % 12; // remaps: Apr=0, May=1, ..., Mar=11

      // Assuming all entries are expenses for now — customize as needed
      monthlyIncomeExpense[fyMonthIndex].expense += entry.projectedAmount || 0;
    }
  });

  const projectionData = [
    {
      name: "Projections",
      group: "FY 2024-25",
      data: monthlyIncomeExpense.map((m) => m.expense), // or .income if needed
    },
  ];

  const projectionOptions = {
    chart: {
      id: "projection-bar",
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },
    colors: ["#54C4A7"], // Pick your color
    legend: {
      show: false, // Hide legend for single bar
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
      categories: [
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
      ],
    },
    yaxis: {
      title: {
        text: "Amount in Lakhs (INR)",
      },
      min: 1,
        max: 10_00_000, // Adjust based on expected scale (e.g., 10 lakhs)
      labels: {
        formatter: (val) => (val / 100000).toFixed(0),
      },
      tickAmount: 4,
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val) => `INR ${inrFormat(val)}`,
      },
    },
  };

  //-----------------------------------------------------Graph------------------------------------------------------//
  //-----------------------------------------------------Table columns/Data------------------------------------------------------//
  const monthlyProfitLossColumns = [
    { field: "id", headerName: "Sr No", flex: 1 },
    { field: "projectedAmount", headerName: "Projected (INR)", flex: 1 },
    { field: "actualAmount", headerName: "Actual (INR)", flex: 1 },
    { field: "pnl", headerName: "P&L (INR)", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <div className="hover:bg-gray-200 cursor-pointer p-2 rounded-full transition-all mb-2 inline-flex gap-2">
          <span
            className="text-subtitle cursor-pointer"
            onClick={() => handleViewModal(params.data)}
          >
            <MdOutlineRemoveRedEye />
          </span>
        </div>
      ),
    },
  ];

  const monthlyProfitLossData = isBudgetDataLoading ? [] : budgetData.map((item,index) => {
    const pnl = item.projectedAmount - item.actualAmount;
    return {
      ...item,
      id : index + 1,
      projectedAmount: inrFormat(item.projectedAmount),
      actualAmount: inrFormat(item.actualAmount),
      pnl: inrFormat(pnl),
    };
  });

  const handleViewModal = (rowData) => {
    setViewDetails(rowData);
    setViewModalOpen(true);
  };

  // const totalPnL = monthlyProfitLossData.reduce((sum, item) => {
  //   const numericalPnL = parseInt(item.pnl.replace(/,/g, ""), 10);
  //   return sum + numericalPnL;
  // }, 0);

  //-----------------------------------------------------Table columns/Data------------------------------------------------------//
  const techWidgets = [
    {
      layout: 1,
      widgets: [
        <WidgetSection padding>
          <YearlyGraph
            options={projectionOptions}
            data={[]}
            // data={projectionData}
            title={"PROJECTIONS"}
            currentYear
          />
        </WidgetSection>,
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {techWidgets.map((section, index) => (
        <WidgetSection key={index} layout={section?.layout} padding>
          {section?.widgets}
        </WidgetSection>
      ))}

      {!isBudgetDataLoading ? (

      <div>
        <WidgetSection
          border
          title={`Total Monthly P&L`}
          titleLabel={"FY 2024-25"}
          // TitleAmount={`INR ${totalPnL.toLocaleString()}`}
          TitleAmount={`INR 0`}
        >
          <YearWiseTable dateColumn={"dueDate"} data={[]} columns={monthlyProfitLossColumns}  />
          {/* <YearWiseTable dateColumn={"dueDate"} data={monthlyProfitLossData} columns={monthlyProfitLossColumns}  /> */}
        </WidgetSection>
      </div>
      ) : (
        <div className="h-72 flex items-center justify-center">
          <CircularProgress />
        </div>
      )}


      {viewDetails && (
        <MuiModal
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title="Monthly P&L Detail"
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

export default Projections;
