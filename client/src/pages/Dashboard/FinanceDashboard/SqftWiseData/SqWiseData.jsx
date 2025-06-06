import { useState } from "react";
import AgTable from "../../../../components/AgTable";
import BarGraph from "../../../../components/graphs/BarGraph";
import ViewDetailsModal from "../../../../components/ViewDetailsModal";
import WidgetSection from "../../../../components/WidgetSection";
import { inrFormat } from "../../../../utils/currencyFormat";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import MuiModal from "../../../../components/MuiModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import dayjs from "dayjs";

const SqWiseData = () => {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);
  //-----------------------------------------------------Graph------------------------------------------------------//
  const incomeExpenseData = [
    {
      name: "Income",
      data: [
        12000, 15000, 10000, 18000, 20000, 16000, 17000, 19000, 14000, 21000,
        22000, 25000,
      ],
    },
    {
      name: "Expense",
      data: [
        8000, 10000, 7000, 12000, 13000, 11000, 12000, 12500, 25000, 15000,
        16000, 17000,
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
      ]
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
    legend: {
      show: true,
      position: "top",
    },
  };
  //-----------------------------------------------------Graph------------------------------------------------------//
  //-----------------------------------------------------Table columns/Data------------------------------------------------------//
  const monthlyProfitLossColumns = [
    { field: "srNo", headerName: "Sr No", flex: 1 },
    { field: "month", headerName: "Month", flex: 1 },
    { field: "income", headerName: "Income (INR)", flex: 1 },
    { field: "sqft", headerName: " Sq. Ft. (INR)", flex: 1 },
    { field: "perSqFt", headerName: "Per Sq. Ft. income (INR)", flex: 1 },
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
      srNo: 1,
      month: "April-24",
      income: "1,20,000",
      sqft: "30,000",
      perSqFt: "15",
      pnl: "40,000",
    },
    {
      srNo: 2,
      month: "May-24",
      income: "1,10,000",
      sqft: "45,000",
      perSqFt: "18",
      pnl: "20,000",
    },
    {
      srNo: 3,
      month: "June-24",
      income: "95,000",
      sqft: "38,000",
      perSqFt: "12",
      pnl: "-10,000",
    },
    {
      srNo: 4,
      month: "July-24",
      income: "1,50,000",
      sqft: "50,000",
      perSqFt: "20",
      pnl: "80,000",
    },
    {
      srNo: 5,
      month: "August-24",
      income: "1,00,000",
      sqft: "40,000",
      perSqFt: "10",
      pnl: "-20,000",
    },
  ];


  const formatMonthlyProfitLoss = monthlyProfitLossData.map((item) => ({ ...item, month: dayjs(item.month, "MMMM-YY").format("MMM-YY") }))



  const totalPnL = monthlyProfitLossData.reduce((sum, item) => {
    const numericalPnL = parseInt(item.perSqFt.replace(/,/g, ""), 10);
    return sum + numericalPnL;
  }, 0);

  //-----------------------------------------------------Table columns/Data------------------------------------------------------//
  const techWidgets = [
    {
      layout: 1,
      widgets: [
        <WidgetSection border titleLabel={"FY 2024-25"} title={"Budget v/s Achievements"}>
          <BarGraph
            data={[]}
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
        <WidgetSection border titleLabel={"FY 2024-25"} title={"Total Monthly P&L"}
          TitleAmount={``}>
          <AgTable
            data={[]}
            columns={monthlyProfitLossColumns}
            search={true}
          />
        </WidgetSection>
      </div>
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
              detail={`INR ${Number(viewDetails.income.replace(/,/g, "")).toLocaleString("en-IN")}`}
            />
            <DetalisFormatted
              title="Sq. Ft."
              detail={`INR ${Number(viewDetails.sqft.replace(/,/g, "")).toLocaleString("en-IN")}`}
            />
            <DetalisFormatted
              title="Per Sq. Ft."
              detail={`INR ${inrFormat(Number(viewDetails.perSqFt.replace(/,/g, "")))}`}
            />
          </div>
        </MuiModal>
      )}


    </div>
  );
};

export default SqWiseData;
