import React, { useState } from "react";
import WidgetSection from "../../../../components/WidgetSection";
import BarGraph from "../../../../components/graphs/BarGraph";
import AgTable from "../../../../components/AgTable";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { IoIosArrowDown } from "react-icons/io";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import MuiModal from "../../../../components/MuiModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import dayjs from "dayjs";
import DataCard from "../../../../components/DataCard";

const Collections = () => {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);

  const collectionData = [
    { month: "Apr-24", paid: 80, unpaid: 20 },
    { month: "May-24", paid: 90, unpaid: 10 },
    { month: "Jun-24", paid: 75, unpaid: 25 },
    { month: "Jul-24", paid: 95, unpaid: 5 },
    { month: "Aug-24", paid: 85, unpaid: 15 },
    { month: "Sep-24", paid: 70, unpaid: 30 },
    { month: "Oct-24", paid: 60, unpaid: 40 },
    { month: "Nov-24", paid: 88, unpaid: 12 },
    { month: "Dec-24", paid: 92, unpaid: 8 },
    { month: "Jan-25", paid: 76, unpaid: 24 },
    { month: "Feb-25", paid: 89, unpaid: 11 },
    { month: "Mar-25", paid: 100, unpaid: 0 },
  ];

  const barGraphData = [
    {
      name: "Paid",
      data: collectionData.map((item) => item.paid),
    },
    {
      name: "Unpaid",
      data: collectionData.map((item) => item.unpaid),
    },
  ];

  const barGraphOptions = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: "40%",
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val}%`,
    },
    xaxis: {
      categories: collectionData.map((item) => item.month),
    },
    yaxis: {
      max: 100,
      labels: {
        formatter: (val) => `${val}%`,
      },
      title: {
        text: "Client Collection %",
      },
    },
    legend: {
      position: "top",
    },
    tooltip: {
      y: {
        formatter: (val) => `${val}%`,
      },
    },
    colors: ["#54C4A7", "#EB5C45"],
  };

  const kraColumn = [
    { field: "srNo", headerName: "Sr No", flex: 1 },
    { field: "client", headerName: "Client", flex: 1 },
    { field: "amount", headerName: "Amount (INR)", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <div className="p-2 mb-2 flex gap-2">
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

  const handleViewModal = (rowData) => {
    setViewDetails(rowData);
    setViewModalOpen(true);
  };

  // Create dummy tableData per month — you can replace this with actual filtered rows
  const generateMonthlyRows = (monthIndex) => {
    const clients = [
      "Zomato",
      "Turtlemint",
      "Zimetrics",
      "SquadStack",
      "Uber",
      "Ola",
      "Swiggy",
    ];
    const baseDate = new Date(2025, monthIndex, 10);

    return Array.from({ length: 4 }, (_, i) => {
      const amount = Math.floor(Math.random() * 900000) + 100000; // Between 1L and 10L
      const date = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth(),
        baseDate.getDate() + i
      );

      return {
        srNo: i + 1,
        client: clients[(i + monthIndex) % clients.length],
        status: Math.random() > 0.5 ? "Unpaid" : "Unpaid",
        amount: amount.toLocaleString("en-IN"),
        // date: date.toLocaleDateString("en-GB"),
        date: date.toLocaleDateString("en-GB").replace(/\//g, "-"),
      };
    });
  };

  const financialData = collectionData.map((item, index) => {
    const rows = generateMonthlyRows(index);
    const totalAmount = rows.reduce((acc, curr) => {
      const cleanAmount = parseFloat(curr.amount.replace(/,/g, ""));
      return acc + cleanAmount;
    }, 0);

    return {
      month: item.month,
      totalAmount,
      tableData: {
        columns: kraColumn,
        rows,
      },
    };
  });

  const grandTotal = financialData.reduce(
    (acc, item) => acc + item.totalAmount,
    0
  );

  return (
    <div className="p-4 flex flex-col gap-8">
      <WidgetSection
        layout={1}
        title={"COLLECTIONS"}
        titleLabel={"FY 2024-25"}
        border
      >
        <BarGraph data={barGraphData} options={barGraphOptions} />
        <hr />
        <WidgetSection layout={2}>
          <DataCard title={"Paid"} description={"Current Month :Apr-24"} route={"paid"}/>
          <DataCard title={"Unpaid"} description={"Current Month :Apr-24"} data={40} />
        </WidgetSection>
      </WidgetSection>
      <WidgetSection
        border
        title="Collections"
        titleLabel={"FY 2024-25"}
        TitleAmount={`INR ${grandTotal.toLocaleString("en-IN")}`}
        className="bg-white rounded-md shadow-sm"
      >
        <div className="px-4 py-2 border-b border-borderGray bg-gray-50">
          <div className="flex flex-wrap justify-between items-center py-2 text-sm text-muted font-pmedium text-title">
            <span className="w-1/2 sm:w-1/5">FINANCIAL YEAR</span>
            <span className="w-1/2 sm:w-1/5 flex items-center gap-1">
              AMOUNT
            </span>
          </div>
        </div>

        {financialData.map((data, index) => (
          <Accordion key={index} className="py-2">
            <AccordionSummary
              expandIcon={<IoIosArrowDown />}
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
              className="border-b border-borderGray"
            >
              <div className="flex flex-wrap justify-between items-center w-full px-2 text-subtitle font-pmedium">
                <span className="w-1/2 sm:w-1/5">{data.month}</span>
                <span className="w-1/2 sm:w-1/5 px-4">
                  INR {data.totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </AccordionSummary>
            <AccordionDetails sx={{ borderTop: "1px solid #d1d5db" }}>
              <AgTable
                search={true}
                data={data.tableData.rows}
                columns={data.tableData.columns}
                tableHeight={250}
              />
            </AccordionDetails>
          </Accordion>
        ))}
      </WidgetSection>

      {viewDetails && (
        <MuiModal
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title="Collection Details"
        >
          <div className="space-y-3">
            <DetalisFormatted title="Client" detail={viewDetails.client} />
            <DetalisFormatted
              title="Amount Paid"
              detail={`INR ${Number(
                viewDetails.amount.replace(/,/g, "")
              ).toLocaleString("en-IN")}`}
            />
            <DetalisFormatted title="Payment Date" detail={viewDetails.date} />
            <DetalisFormatted
              title="Payment Status"
              detail={viewDetails.status}
            />
          </div>
        </MuiModal>
      )}
    </div>
  );
};

export default Collections;
