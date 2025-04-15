import React, { useState } from "react";
import WidgetSection from "../../../../components/WidgetSection";
import BarGraph from "../../../../components/graphs/BarGraph";
import AgTable from "../../../../components/AgTable";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import ViewDetailsModal from "../../../../components/ViewDetailsModal";

const StatutoryPayments = () => {

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
    colors: ["#54C4A7", "#EB5C45"], // Green for paid, red for unpaid
  };
  //--------------------------------------------------------TableData----------------------------------------------------//
  const kraColumn = [
    { field: "srNo", headerName: "Sr No", flex: 1 },
    { field: "client", headerName: "Client", flex: 1 },
    { field: "amount", headerName: "Amount (INR)", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <>
          <div className="p-2 mb-2 flex gap-2">
            <span
                      className="text-subtitle cursor-pointer"
                      onClick={() => handleViewModal(params.data)}
                    >
                      <MdOutlineRemoveRedEye />
                    </span>
          </div>
        </>
      ),
    },
  ];

  const rows = [
    {
      srNo: 1,
      client: "GST",
      status: "Paid",
      amount: "18,000",
      date: "10-04-2025",
    },
    {
      srNo: 2,
      client: "TDS",
      status: "Paid",
      amount: "12,500",
      date: "11-04-2025",
    },
    {
      srNo: 3,
      client: "Income Tax",
      status: "Paid",
      amount: "22,750",
      date: "12-04-2025",
    },
    {
      srNo: 4,
      client: "Professional Tax",
      status: "Paid",
      amount: "6,000",
      date: "13-04-2025",
    },
    {
      srNo: 5,
      client: "ROC Filing",
      status: "Paid",
      amount: "14,200",
      date: "14-04-2025",
    },
    {
      srNo: 6,
      client: "Advance Tax",
      status: "Paid",
      amount: "30,000",
      date: "15-04-2025",
    },
  ];

  
  const handleViewModal = (rowData) => {
    setViewDetails(rowData);
    setViewModalOpen(true);
  };
  //--------------------------------------------------------TableData----------------------------------------------------//

  return (
    <div className="flex flex-col gap-4">
      <WidgetSection titleLabel={"FY 2024-25"} title={"Statutory Payments".toUpperCase()} border>
        <BarGraph data={barGraphData} options={barGraphOptions} />
      </WidgetSection>

      <div>
        <AgTable
          data={rows}
          columns={kraColumn}
          search
          tableTitle={"Statutory Payments"}
        />
      </div>
     { viewDetails && <ViewDetailsModal
  open={viewModalOpen}
  onClose={() => setViewModalOpen(false)}
  data={{...viewDetails,amount:"INR " + Number(
    viewDetails.amount.toLocaleString("en-IN").replace(/,/g, "")
  ).toLocaleString("en-IN", { maximumFractionDigits: 0 })
}}
  title="Statutory Payment Detail"
  fields={[
    { label: "Client", key: "client" },
    { label: "Amount Paid", key: "amount" },
    { label: "Payment Date", key: "date" },
    { label: "Payment Status", key: "status" },
  ]}
/>}

    </div>
  );
};

export default StatutoryPayments;
