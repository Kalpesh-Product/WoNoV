import { MdOutlineRemoveRedEye } from "react-icons/md";
import WidgetSection from "../../../../components/WidgetSection";
import { useMemo, useState } from "react";
import MuiModal from "../../../../components/MuiModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import { inrFormat } from "../../../../utils/currencyFormat";
import YearlyGraph from "../../../../components/graphs/YearlyGraph";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import { CircularProgress } from "@mui/material";

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

const getFiscalYear = (dateInput) => {
  const date = dayjs(dateInput);

  if (!date.isValid()) return null;

  const month = date.month();
  const year = date.year();
  const startYear = month >= 3 ? year : year - 1;

  return `FY ${startYear}-${String(startYear + 1).slice(-2)}`;
};

const Projections = () => {
  const axios = useAxiosPrivate();

  const { data: budgetData = [], isLoading: isBudgetDataLoading } = useQuery({
    queryKey: ["budgetData"],
    queryFn: async () => {
      const response = await axios.get("/api/budget/company-budget");
      return Array.isArray(response.data?.allBudgets)
        ? response.data.allBudgets
        : [];
    },
  });

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);
  const [selectedFY, setSelectedFY] = useState("FY 2025-26");

  const projectionData = useMemo(
    () =>
      Object.entries(yearCategories).map(([fiscalYear, months]) => {
        const monthlyTotals = months.reduce((acc, month) => {
          acc[month] = 0;
          return acc;
        }, {});

        budgetData.forEach((entry) => {
          if (entry.status !== "Approved") return;

          const date = dayjs(entry.dueDate);
          if (!date.isValid()) return;

          const entryFY = getFiscalYear(date);
          if (entryFY !== fiscalYear) return;

          const monthKey = date.format("MMM-YY");
          if (!(monthKey in monthlyTotals)) return;

          monthlyTotals[monthKey] += Number(entry.projectedAmount) || 0;
        });

        return {
          name: "Projections",
          group: fiscalYear,
          data: months.map((month) => monthlyTotals[month]),
        };
      }),
    [budgetData]
  );

  const projectionOptions = {
    chart: {
      id: "projection-bar",
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },
    colors: ["#54C4A7"],
    legend: {
      show: false,
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
      min: 0,
      labels: {
        formatter: (val) => (val / 100000).toFixed(0),
      },
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

  const monthlyProfitLossColumns = [
    { field: "srNo", headerName: "Sr No", flex: 1 },
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

  const monthlyProfitLossData = useMemo(
    () =>
      budgetData
        .filter((item) => getFiscalYear(item.dueDate) === selectedFY)
        .map((item) => {
          const projectedAmount = Number(item.projectedAmount) || 0;
          const actualAmount = Number(item.actualAmount) || 0;
          const pnl = projectedAmount - actualAmount;

          return {
            ...item,
            projectedAmount: inrFormat(projectedAmount),
            actualAmount: inrFormat(actualAmount),
            pnl: inrFormat(pnl),
            income: inrFormat(projectedAmount),
            expense: inrFormat(actualAmount),
            month: dayjs(item.dueDate).isValid()
              ? dayjs(item.dueDate).format("MMM YYYY")
              : "N/A",
          };
        }),
    [budgetData, selectedFY]
  );

  const totalPnL = useMemo(
    () =>
      monthlyProfitLossData.reduce((sum, item) => {
        const numericalPnL = parseFloat(String(item.pnl).replace(/,/g, ""));
        return sum + (Number.isNaN(numericalPnL) ? 0 : numericalPnL);
      }, 0),
    [monthlyProfitLossData]
  );

  const handleViewModal = (rowData) => {
    setViewDetails(rowData);
    setViewModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <WidgetSection padding>
        <YearlyGraph
          options={projectionOptions}
          data={projectionData}
          title={"PROJECTIONS"}
          currentYear
          onYearChange={setSelectedFY}
        />
      </WidgetSection>

      {!isBudgetDataLoading ? (
        <div>
          <WidgetSection
            border
            title={`Total Monthly P&L`}
            titleLabel={selectedFY}
            TitleAmount={`INR ${inrFormat(totalPnL)}`}
          >
            <YearWiseTable
              dateColumn={"dueDate"}
              data={monthlyProfitLossData}
              columns={monthlyProfitLossColumns}
            />
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
                String(viewDetails.income || 0).replace(/,/g, "")
              ).toLocaleString("en-IN")}`}
            />
            <DetalisFormatted
              title="Expense"
              detail={`INR ${Number(
                String(viewDetails.expense || 0).replace(/,/g, "")
              ).toLocaleString("en-IN")}`}
            />
            <DetalisFormatted
              title="P&L"
              detail={`INR ${Number(
                String(viewDetails.pnl || 0).replace(/,/g, "")
              ).toLocaleString("en-IN")}`}
            />
          </div>
        </MuiModal>
      )}
    </div>
  );
};

export default Projections;