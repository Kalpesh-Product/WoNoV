import React, { useState } from "react";
import WidgetSection from "../../../../components/WidgetSection";
import BarGraph from "../../../../components/graphs/BarGraph";
import AgTable from "../../../../components/AgTable";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import MuiModal from "../../../../components/MuiModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import YearlyGraph from "../../../../components/graphs/YearlyGraph";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import humanDate from "../../../../utils/humanDateForamt";
import { inrFormat } from "../../../../utils/currencyFormat";

const StatutoryPayments = () => {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);
  const axios = useAxiosPrivate();
  const { data: hrFinance = [], isPending: isHrLoading } = useQuery({
    queryKey: ["hrFinance"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/budget/company-budget?departmentId=6798bab0e469e809084e249a`
        );
        const budgets = response.data.allBudgets;
        return Array.isArray(budgets) ? budgets : [];
      } catch (error) {
        console.error("Error fetching budget:", error);
        return [];
      }
    },
  });

  const transformToCollectionData = (expenses) => {
    const monthMap = {};

    expenses.forEach((item) => {
      const monthKey = dayjs(item.dueDate).format("MMM-YY");

      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { total: 0, approved: 0 };
      }

      monthMap[monthKey].total += 1;
      if (item.status === "Approved") {
        monthMap[monthKey].approved += 1;
      }
    });

    // Convert into desired array format
    return Object.entries(monthMap).map(([month, { total, approved }]) => {
      const paid = Math.round((approved / total) * 100);
      return {
        month,
        paid,
        unpaid: 100 - paid,
      };
    });
  };

  const statutoryRaw = hrFinance.filter(
    (item) => item.expanseType === "Statutory Payments"
  );
  const statutoryFormatted = transformToCollectionData(statutoryRaw);

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
      data: statutoryFormatted.map((item) => item.paid),
    },
    {
      name: "Unpaid",
      data: statutoryFormatted.map((item) => item.unpaid),
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
    { field: "srNo", headerName: "Sr No", width: 100 },
    { field: "expanseName", headerName: "Client", flex: 1 },
    { field: "projectedAmount", headerName: "Projected Amount (INR)", flex: 1 },
    { field: "actualAmount", headerName: "Actual Amount (INR)", flex: 1 },
    { field: "dueDate", headerName: "Due Date", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => {
        console.log("Data : ", params.data);
        return (
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
        );
      },
    },
  ];

  const formattedRows = statutoryRaw.map((row, index) => ({
    ...row,
    srNo: index + 1,
    projectedAmount: inrFormat(row.projectedAmount),
    actualAmount: inrFormat(row.actualAmount),
    dueDate: row.dueDate,
  }));

  const handleViewModal = (rowData) => {
    setViewDetails(rowData);
    setViewModalOpen(true);
  };
  //--------------------------------------------------------TableData----------------------------------------------------//

  return (
    <div className="flex flex-col gap-4">
      <WidgetSection titleLabel={"FY 2024-25"} border>
        <BarGraph data={barGraphData} options={barGraphOptions} />
      </WidgetSection>
      {/* <YearlyGraph title={"Statutory Payments".toUpperCase()} /> */}

      <WidgetSection title={"Statutory Payments FY 2024-25"} border>
        <YearWiseTable
          data={formattedRows}
          dateColumn={"dueDate"}
          columns={kraColumn}
        />
      </WidgetSection>
      {viewDetails && (
        <MuiModal
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title="Statutory Payment Detail"
        >
          <div className="space-y-3">
            <DetalisFormatted
              title="Expense Name"
              detail={viewDetails.expanseName}
            />
            <DetalisFormatted
              title="Expense Type"
              detail={viewDetails.expanseType}
            />
            <DetalisFormatted
              title="Department"
              detail={viewDetails.department?.name || "-"}
            />
            <DetalisFormatted
              title="Projected Amount"
              detail={`INR ${viewDetails.projectedAmount}`}
            />
            <DetalisFormatted
              title="Actual Amount Paid"
              detail={`INR ${viewDetails.actualAmount}`}
            />
            <DetalisFormatted
              title="Due Date"
              detail={
                viewDetails.dueDate
                  ? humanDate(viewDetails.dueDate)
                  : "-"
              }
            />
            <DetalisFormatted
              title="Payment Date"
              detail={viewDetails.date || "-"}
            />
            <DetalisFormatted
              title="Extra Budget?"
              detail={viewDetails.isExtraBudget ? "Yes" : "No"}
            />
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

export default StatutoryPayments;
