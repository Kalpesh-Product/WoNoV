import React from "react";
import WidgetSection from "../../../../components/WidgetSection";
import BarGraph from "../../../../components/graphs/BarGraph";
import AgTable from "../../../../components/AgTable";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { IoIosArrowDown } from "react-icons/io";
import { MdOutlineRemoveRedEye } from "react-icons/md";

const Collections = () => {
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
        columnWidth: "60%",
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val}%`,
    },
    xaxis: {
      categories: collectionData.map((item) => item.month),
      title: { text: "2024-2025" },
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
    colors: ["#4CAF50", "#F44336"],
  };

  const kraColumn = [
    { field: "srNo", headerName: "Sr No", flex: 1 },
    { field: "client", headerName: "Client", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: () => (
        <div className="p-2 mb-2 flex gap-2">
           <span
            className="text-subtitle cursor-pointer"
             
          >
            <MdOutlineRemoveRedEye />
          </span>
        </div>
      ),
    },
  ];

  const rows = [
    { srNo: 1, client: "Zomato", status: "Paid" },
    { srNo: 2, client: "Turtlemint", status: "Paid" },
    { srNo: 3, client: "Zimetrics", status: "Paid" },
    { srNo: 4, client: "SquadStack", status: "Paid" },
    { srNo: 5, client: "Uber", status: "Paid" },
  ];

  // Create dummy tableData per month — you can replace this with actual filtered rows
  const financialData = collectionData.map((item) => ({
    month: item.month,
    tableData: {
      columns: kraColumn,
      rows,
    },
  }));

  return (
    <div className="flex flex-col gap-4">
      <WidgetSection title={"Collections 2024-25".toUpperCase()} border>
        <BarGraph data={barGraphData} options={barGraphOptions} />
      </WidgetSection>

      <div className="bg-white rounded-md shadow-sm">
        {financialData.map((data, index) => (
          <Accordion key={index} className="py-2">
            <AccordionSummary
              expandIcon={<IoIosArrowDown />}
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
              className="border-b-[1px] border-borderGray"
            >
              <div className="flex justify-between items-center w-full px-4">
                <span className="text-subtitle font-pmedium">{data.month}</span>
                <span className="text-subtitle font-pmedium">
                  {data.amount}
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
      </div>
    </div>
  );
};

export default Collections;
