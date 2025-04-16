import React, { useState } from "react";
import WidgetSection from "../../../../components/WidgetSection";
import BarGraph from "../../../../components/graphs/BarGraph";
import AgTable from "../../../../components/AgTable";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { IoIosArrowDown } from "react-icons/io";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import MuiModal from "../../../../components/MuiModal";
import ViewDetailsModal from "../../../../components/ViewDetailsModal";
import dayjs from "dayjs";

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
            onClick={() => handleViewModal(params.data)}>
            <MdOutlineRemoveRedEye />
          </span>
        </div>
      ),
    },
  ];

  const rows = [
    {
      srNo: 1,
      client: "Zomato",
      status: "Unpaid",
      amount: "1,25,000",
      date: "10-04-2025",
    },
    {
      srNo: 2,
      client: "Turtlemint",
      status: "Unpaid",
      amount: "98,500",
      date: "11-04-2025",
    },
    {
      srNo: 3,
      client: "Zimetrics",
      status: "Unpaid",
      amount: "1,15,300",
      date: "12-04-2025",
    },
    {
      srNo: 4,
      client: "SquadStack",
      status: "Unpaid",
      amount: "1,40,000",
      date: "13-04-2025",
    },
    {
      srNo: 5,
      client: "Uber",
      status: "Unpaid",
      amount: "1,22,750",
      date: "14-04-2025",
    },
  ];

  const handleViewModal = (rowData) => {
    setViewDetails(rowData);
    setViewModalOpen(true);
  };

  // Create dummy tableData per month — you can replace this with actual filtered rows
  const generateMonthlyRows = (monthIndex) => {
    const clients = ["Zomato", "Turtlemint", "Zimetrics", "SquadStack", "Uber", "Ola", "Swiggy"];
    const baseDate = new Date(2025, monthIndex, 10);

    return Array.from({ length: 4 }, (_, i) => {
      const amount = Math.floor(Math.random() * 900000) + 100000; // Between 1L and 10L
      const date = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + i);

      return {
        srNo: i + 1,
        client: clients[(i + monthIndex) % clients.length],
        status: Math.random() > 0.5 ? "Paid" : "Unpaid",
        amount: amount.toLocaleString("en-IN"),
        date: date.toLocaleDateString("en-GB"),
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

  const grandTotal = financialData.reduce((acc, item) => acc + item.totalAmount, 0);

  console.log(grandTotal)

  return (
    <div className="flex flex-col gap-8">
      <WidgetSection title={"COLLECTIONS"} titleLabel={"FY 2024-25"} border>
        <BarGraph data={barGraphData} options={barGraphOptions} />
      </WidgetSection>

      <WidgetSection
        border
        title="Collections"
        titleLabel={"FY 2024-25"}
        TitleAmount={`INR ${grandTotal.toLocaleString("en-IN")}`}
        className="bg-white rounded-md shadow-sm">
        {financialData.map((data, index) => (
          <Accordion key={index} className="py-2">
            <AccordionSummary
              expandIcon={<IoIosArrowDown />}
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
              className="border-b-[1px] border-borderGray">
              <div className="flex justify-between items-center w-full">
                <span className="text-subtitle font-pmedium">{data.month}</span>
                <span className="text-subtitle font-pmedium">
                  INR {data.totalAmount.toLocaleString("en-IN")}&nbsp;
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
        <ViewDetailsModal
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          data={{
            ...viewDetails,
            amount:
              "INR " +
              Number(
                viewDetails.amount.toLocaleString("en-IN").replace(/,/g, "")
              ).toLocaleString("en-IN", { maximumFractionDigits: 0 }),
              date:dayjs(viewDetails.date).format("DD-MM-YYYY")
          }}
          title="Collection Detail"
          fields={[
            { label: "Client", key: "client" },
            { label: "Amount Paid", key: "amount" },
            { label: "Payment Date", key: "date" },
            { label: "Payment Status", key: "status" },
          ]}
        />
      )}
    </div>
  );
};

export default Collections;
