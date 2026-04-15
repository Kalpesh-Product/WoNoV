import React, { useState, useMemo } from "react";
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
import WidgetTable from "../../../../components/Tables/WidgetTable";
import SecondaryButton from "../../../../components/SecondaryButton";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";

const fiscalYears = ["FY 2024-25", "FY 2025-26"];

const fiscalYearMonthMap = {
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

const StatutoryPayments = () => {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);
  const [selectedMonthData, setSelectedMonthData] = useState([]);
  const [selectedMonthLabel, setSelectedMonthLabel] = useState("");
  const [selectedYearIndex, setSelectedYearIndex] = useState(1);

  const axios = useAxiosPrivate();
  const { data: hrFinance = [], isPending: isHrLoading } = useQuery({
    queryKey: ["financeBudget"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/budget/company-budget?departmentId=6798bab0e469e809084e249a`,
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
        monthMap[monthKey] = { total: 0, approved: 0, amount: 0 };
      }

      monthMap[monthKey].total += 1;
      monthMap[monthKey].amount += item.projectedAmount || 0;

      if (item.status === "Approved") {
        monthMap[monthKey].approved += 1;
      }
    });

    return Object.entries(monthMap).map(
      ([month, { total, approved, amount }]) => {
        const paid = Math.round((approved / total) * 100);
        return {
          month,
          paid,
          unpaid: 100 - paid,
          approved,
          unapproved: total - approved,
          total,
          amount,
        };
      },
    );
  };

  const statutoryRaw = isHrLoading
    ? []
    : hrFinance.filter((item) => item.expanseType === "Statutory Payments");
  const statutoryFormatted = transformToCollectionData(statutoryRaw);

  const fiscalGraphData = useMemo(() => {
    const fyBuckets = {
      "FY 2024-25": fiscalYearMonthMap["FY 2024-25"].map((month) => ({
        month,
        paid: 0,
        unpaid: 0,
        meta: null,
      })),
      "FY 2025-26": fiscalYearMonthMap["FY 2025-26"].map((month) => ({
        month,
        paid: 0,
        unpaid: 0,
        meta: null,
      })),
    };

    statutoryFormatted.forEach((item) => {
      const monthIndex = dayjs(`01-${item.month}`, "DD-MMM-YY").month();
      const yearSuffix = Number(item.month.split("-")[1]);
      const fullYear = 2000 + yearSuffix;

      let fiscalYear = null;
      if (
        (fullYear === 2024 && monthIndex >= 3) ||
        (fullYear === 2025 && monthIndex <= 2)
      ) {
        fiscalYear = "FY 2024-25";
      } else if (
        (fullYear === 2025 && monthIndex >= 3) ||
        (fullYear === 2026 && monthIndex <= 2)
      ) {
        fiscalYear = "FY 2025-26";
      }

      if (!fiscalYear) return;

      const targetMonthIndex = fiscalYearMonthMap[fiscalYear].indexOf(
        item.month,
      );
      if (targetMonthIndex === -1) return;

      fyBuckets[fiscalYear][targetMonthIndex] = {
        month: item.month,
        paid: item.paid,
        unpaid: item.unpaid,
        meta: item,
      };
    });

    return fiscalYears.reduce((acc, fy) => {
      acc[fy] = {
        chartData: [
          { name: "Paid", data: fyBuckets[fy].map((entry) => entry.paid) },
          { name: "Unpaid", data: fyBuckets[fy].map((entry) => entry.unpaid) },
        ],
        meta: fyBuckets[fy].map((entry) => entry.meta),
      };
      return acc;
    }, {});
  }, [statutoryFormatted]);

  const selectedFiscalYear = fiscalYears[selectedYearIndex];
  const selectedGraph = fiscalGraphData[selectedFiscalYear] || {
    chartData: [
      { name: "Paid", data: Array(12).fill(0) },
      { name: "Unpaid", data: Array(12).fill(0) },
    ],
    meta: Array(12).fill(null),
  };
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
      categories: fiscalYearMonthMap[selectedFiscalYear],
    },
    yaxis: {
      max: 100,
      labels: {
        formatter: (val) => `${val}%`,
      },
      title: {
        text: "Statutory Payments %",
      },
    },
    legend: {
      position: "top",
    },
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex }) {
        const item = selectedGraph.meta[dataPointIndex];
        if (!item) return "";

        return `
      <div style="padding:10px;font-family:Poppins-Regular;font-size:13px; width: 220px">
        <div style="display:flex; justify-content:space-between;"><strong>Month</strong> ${
          item.month
        }</div>
        <div style="display:flex; justify-content:space-between;"><strong>Total Payments</strong> ${
          item.total
        }</div>
        <div style="display:flex; justify-content:space-between;"><strong>Amount</strong> INR ${item.amount.toLocaleString()}</div>
        <div style="color:#54C4A7; display:flex; justify-content:space-between;"><strong>Approved</strong> ${
          item.approved
        }</div>
        <div style="color:#EB5C45; display:flex; justify-content:space-between;"><strong>Unapproved</strong> ${
          item.unapproved
        }</div>
      </div>
    `;
      },
    },

    colors: ["#54C4A7", "#EB5C45"], // Green for paid, red for unpaid
  };
  //--------------------------------------------------------TableData----------------------------------------------------//
  const kraColumn = [
    { field: "srNo", headerName: "Sr No", width: 100 },
    {
      field: "expanseName",
      headerName: "Client",
      flex: 1,
      cellRenderer: (params) => (
        <span
          className="text-primary underline cursor-pointer"
          onClick={() => handleViewModal(params.data)}
        >
          {params.value}
        </span>
      ),
    },
    { field: "projectedAmount", headerName: "Projected Amount (INR)", flex: 1 },
    { field: "actualAmount", headerName: "Actual Amount (INR)", flex: 1 },
    { field: "dueDate", headerName: "Due Date", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
  ];

  const selectedFiscalYearMonths = fiscalYearMonthMap[selectedFiscalYear] || [];
  const selectedFiscalYearRows = statutoryRaw.filter((item) =>
    selectedFiscalYearMonths.includes(dayjs(item.dueDate).format("MMM-YY")),
  );

  const formattedRows = selectedFiscalYearRows.map((row, index) => ({
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

  const handleMonthChange = (monthLabel) => {
    setSelectedMonthLabel(monthLabel);

    const monthData = statutoryRaw.filter((item) => {
      const itemMonth = dayjs(item.dueDate).format("MMM-YYYY");
      return itemMonth === monthLabel;
    });

    setSelectedMonthData(monthData);
  };

  const grandTotal = useMemo(() => {
    return selectedFiscalYearRows.reduce(
      (sum, item) => sum + (item.projectedAmount || 0),
      0,
    );
  }, [selectedFiscalYearRows]);

  const currentMonthTotal = useMemo(() => {
    return selectedMonthData.reduce(
      (sum, item) => sum + (item.projectedAmount || 0),
      0,
    );
  }, [selectedMonthData]);

  //--------------------------------------------------------TableData----------------------------------------------------//

  return (
    <div className="flex flex-col gap-4">
      <WidgetSection
        border
        title={`Statutory Payments ${selectedFiscalYear}`}
        TitleAmount={`INR ${inrFormat(grandTotal)}`}
      >
        <BarGraph data={selectedGraph.chartData} options={barGraphOptions} />

        <div className="flex justify-center items-center mt-4">
          <div className="flex items-center gap-4">
            <SecondaryButton
              title={<MdNavigateBefore />}
              handleSubmit={() =>
                setSelectedYearIndex((prev) => Math.max(0, prev - 1))
              }
              disabled={selectedYearIndex === 0}
            />
            <div className="text-primary text-content font-semibold">
              {selectedFiscalYear}
            </div>
            <SecondaryButton
              title={<MdNavigateNext />}
              handleSubmit={() =>
                setSelectedYearIndex((prev) =>
                  Math.min(fiscalYears.length - 1, prev + 1),
                )
              }
              disabled={selectedYearIndex === fiscalYears.length - 1}
            />
          </div>
        </div>
      </WidgetSection>
      {/* <YearlyGraph title={"Statutory Payments".toUpperCase()} /> */}

      <WidgetTable
        data={formattedRows}
        dateColumn={"dueDate"}
        totalKey="actualAmount"
        columns={kraColumn}
        tableTitle={`Statutory Payments ${selectedFiscalYear}`}
      />

      {viewDetails && (
        <MuiModal
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title="Statutory Payment Detail"
        >
          <div className="space-y-3">
            <div className="font-bold">General Information</div>
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
              title="Extra Budget"
              detail={viewDetails.isExtraBudget ? "Yes" : "No"}
            />
            <DetalisFormatted
              title="Payment Status"
              detail={viewDetails.status}
            />
            <br />
            <div className="font-bold">Financial Overview</div>
            <DetalisFormatted
              title="Projected Amount"
              detail={`INR ${viewDetails.projectedAmount}`}
            />
            <DetalisFormatted
              title="Actual Amount Paid"
              detail={`INR ${viewDetails.actualAmount}`}
            />
            <br />
            <div className="font-bold">Payment Timeline</div>
            <DetalisFormatted
              title="Due Date"
              detail={
                viewDetails.dueDate ? humanDate(viewDetails.dueDate) : "-"
              }
            />
            {/* <DetalisFormatted
              title="Payment Date"
              detail={viewDetails.date ? humanDate(viewDetails.date) : "-"}
            /> */}
          </div>
        </MuiModal>
      )}
    </div>
  );
};

export default StatutoryPayments;
