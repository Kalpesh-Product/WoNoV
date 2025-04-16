import { MdOutlineRemoveRedEye } from "react-icons/md";
import AgTable from "../../../../components/AgTable";
import BarGraph from "../../../../components/graphs/BarGraph";
import WidgetSection from "../../../../components/WidgetSection";
import { useState } from "react";
import ViewDetailsModal from "../../../../components/ViewDetailsModal";
import { inrFormat } from "../../../../utils/currencyFormat";

const Projections = () => {
  //-----------------------------------------------------Graph------------------------------------------------------//


  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);

  const incomeExpenseData = [
    {
      name: "Income",
      data: [
        1250000, // Jan
        1350000, // Feb
        1480000, // Mar
        1620000, // Apr
        1780000, // May
        1900000, // Jun
        2150000, // Jul
        2250000, // Aug
        2100000, // Sep
        2500000, // Oct
        2750000, // Nov
        3050000, // Dec
      ],
    },
    {
      name: "Expense",
      data: [
        750000,  // Jan
        820000,  // Feb
        900000,  // Mar
        970000,  // Apr
        1050000, // May
        1120000, // Jun
        1250000, // Jul
        1300000, // Aug
        1220000, // Sep
        1400000, // Oct
        1530000, // Nov
        1650000, // Dec
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
      tickAmount: 4
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val) => `INR ${val.toLocaleString("en-IN")}`,
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
  
  const rawMonthlyData = [
    { id: 1, month: "Apr-24", income: 1250000, expense: 750000 },
    { id: 2, month: "May-24", income: 1400000, expense: 800000 },
    { id: 3, month: "Jun-24", income: 1600000, expense: 1700000 },
    { id: 4, month: "Jul-24", income: 1800000, expense: 950000 },
    { id: 5, month: "Aug-24", income: 2000000, expense: 2100000 },
    { id: 6, month: "Sep-24", income: 1700000, expense: 1100000 },
    { id: 7, month: "Oct-24", income: 1900000, expense: 1300000 },
    { id: 8, month: "Nov-24", income: 2100000, expense: 1600000 },
    { id: 9, month: "Dec-24", income: 2200000, expense: 500000 },
  ];
  
  
  const monthlyProfitLossData = rawMonthlyData.map((item) => {
    const pnl = item.income - item.expense;
    return {
      ...item,
      income: inrFormat(item.income),
      expense: inrFormat(item.expense),
      pnl: inrFormat(pnl),
    };
  });
  



  const handleViewModal = (rowData) => {
    setViewDetails(rowData);
    setViewModalOpen(true);
  };

  const totalPnL = monthlyProfitLossData.reduce((sum, item) => {
    const numericalPnL = parseInt(item.pnl.replace(/,/g, ""), 10);
    return sum + numericalPnL;
  }, 0);

  //-----------------------------------------------------Table columns/Data------------------------------------------------------//
  const techWidgets = [
    {
      layout: 1,
      widgets: [
        <WidgetSection border titleLabel={"FY 2024-25"} title={"Projections"}>
          <BarGraph
            data={incomeExpenseData}
            options={incomeExpenseOptions}

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

      <div>
        <WidgetSection
          border
          title={`Total Monthly P&L`}
          titleLabel={"FY 2024-25"}
          TitleAmount={`INR ${totalPnL.toLocaleString()}`}>
          <AgTable
            data={monthlyProfitLossData}
            columns={monthlyProfitLossColumns}
            search={true}
          />
        </WidgetSection>
      </div>

      {viewDetails && <ViewDetailsModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        data={{
          ...viewDetails, expense: "INR " + Number(
            viewDetails.expense.toLocaleString("en-IN").replace(/,/g, "")
          ).toLocaleString("en-IN", { maximumFractionDigits: 0 }),
          pnl: "INR " + Number(
            viewDetails.expense.toLocaleString("en-IN").replace(/,/g, "")
          ).toLocaleString("en-IN", { maximumFractionDigits: 0 })
        }}
        title="Monthly P&L Detail"
        fields={[
          { label: "Month", key: "month" },
          { label: "Income", key: "income" },
          { label: "Expense", key: "expense" },
          { label: "P&L", key: "pnl" },
        ]}
      />}
    </div>
  );
};

export default Projections;
