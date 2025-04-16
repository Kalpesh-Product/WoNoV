import { MdOutlineRemoveRedEye } from "react-icons/md";
import AgTable from "../../../../components/AgTable";
import BarGraph from "../../../../components/graphs/BarGraph";
import WidgetSection from "../../../../components/WidgetSection";
import { inrFormat } from "../../../../utils/currencyFormat";
import { useState } from "react";
import ViewDetailsModal from "../../../../components/ViewDetailsModal";

const AverageProfitLoss = () => {
  //-----------------------------------------------------Graph------------------------------------------------------//
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);
  const incomeExpenseData = [
    {
      name: "Income",
      data: [
        1550000, // Jan - stable start
        1620000, // Feb
        1750000, // Mar
        1900000, // Apr
        2100000, // May
        2250000, // Jun
        2450000, // Jul - mid year peak
        2400000, // Aug
        2300000, // Sep
        2650000, // Oct - festive boost
        2850000, // Nov - big sales
        3100000, // Dec - year end peak
      ],
    },
    {
      name: "Expense",
      data: [
        950000,  // Jan
        1000000, // Feb
        1080000, // Mar
        1200000, // Apr
        1350000, // May
        1450000, // Jun
        1550000, // Jul
        1500000, // Aug
        1480000, // Sep
        1600000, // Oct
        1750000, // Nov
        1850000, // Dec
      ],
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
        columnWidth: "70%",
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
              onClick={() => handleViewModal(params.data)}>
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
      expense: inrFormat(2200000),
      pnl: inrFormat(100000),
    }
  ];

  const totalPnL = monthlyProfitLossData.reduce((sum, item) => {
    const numericalPnL = parseInt(item.pnl.replace(/,/g, ""), 10);
    return sum + numericalPnL;
  }, 0);

  //-----------------------------------------------------Table columns/Data------------------------------------------------------//
  const techWidgets = [
    {
      layout: 1,
      widgets: [
        <WidgetSection border title={"Income v/s Expenses"}
          titleLabel={"FY 2024-25"}>
          <BarGraph
            data={incomeExpenseData}
            options={incomeExpenseOptions}

          />
        </WidgetSection>,
      ],
    },
  ];


  const handleViewModal = (rowData) => {
    setViewDetails(rowData);
    setViewModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {techWidgets.map((section, index) => (
        <WidgetSection key={index} layout={section?.layout} padding>
          {section?.widgets}
        </WidgetSection>
      ))}

      <div>
        <WidgetSection border titleLabel={"FY 2024-25"} title={"Total Monthly P&L"}>
          <AgTable
            data={monthlyProfitLossData}
            columns={monthlyProfitLossColumns}
            search={true}
          />
        </WidgetSection>
      </div>
      {viewDetails && (
        <ViewDetailsModal
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          data={{
            ...viewDetails,
            income:
              "INR " +
              Number(
                viewDetails.income.toLocaleString("en-IN").replace(/,/g, "")
              ).toLocaleString("en-IN", { maximumFractionDigits: 0 }),
            expense:
              "INR " +
              Number(
                viewDetails.expense.toLocaleString("en-IN").replace(/,/g, "")
              ).toLocaleString("en-IN", { maximumFractionDigits: 0 }),
            pnl:
              "INR " +
              Number(
                viewDetails.pnl.toLocaleString("en-IN").replace(/,/g, "")
              ).toLocaleString("en-IN", { maximumFractionDigits: 0 }),
          }}
          title="Monthly P&L Detail"
          fields={[
            { label: "Month", key: "month" },
            { label: "Income", key: "income" },
            { label: "Expense", key: "expense" },
            { label: "P&L", key: "pnl" },
          ]}
        />
      )}
    </div>
  );
};

export default AverageProfitLoss;
