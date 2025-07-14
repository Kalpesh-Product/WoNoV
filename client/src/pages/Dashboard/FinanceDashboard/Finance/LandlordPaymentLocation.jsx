import { useState } from "react";
import AgTable from "../../../../components/AgTable";
import { useLocation, useSearchParams } from "react-router-dom";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import MuiModal from "../../../../components/MuiModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import WidgetSection from "../../../../components/WidgetSection";
import humanDate from "../../../../utils/humanDateForamt";
import { inrFormat } from "../../../../utils/currencyFormat";
import YearlyGraph from "../../../../components/graphs/YearlyGraph";
import dayjs from "dayjs";
import { calculateMonthTotal } from "../../../../utils/calculateMonthTotal";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";

const LandlordPaymentLocation = () => {
  const axios = useAxiosPrivate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { unitId } = location.state || {};
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [rangeTotal, setRangeTotal] = useState(0);

  const building = searchParams.get("location") || "";
  const rawUnit = searchParams.get("floor") || "";
  const unit = rawUnit?.replace(/[()]/g, "") || "Unknown Unit";

  const {
    data: landlordPayments = {},
    isLoading: landlordPaymentsLoading,
    isError: landlordPaymentsError,
  } = useQuery({
    queryKey: ["landlordPayments", unit],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/budget/landlord-payments?unit=${unit}`
        );
        return response.data || {};
      } catch (error) {
        console.error("Error fetching landlord payments:", error);
        return {};
      }
    },
  });

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

  const monthlyRentMap = {};
  const payments = Array.isArray(landlordPayments?.allBudgets)
    ? landlordPayments.allBudgets
    : [];

  payments.forEach((item) => {
    if (!item.dueDate || !dayjs(item.dueDate).isValid()) return;
    const monthKey = dayjs(item.dueDate).format("MMM-YY");
    monthlyRentMap[monthKey] =
      (monthlyRentMap[monthKey] || 0) + (item.actualAmount || 0);
  });

  const graphData = Object.entries(yearCategories).map(
    ([fiscalYear, months]) => ({
      name: "Monthly Rent",
      group: fiscalYear,
      data: months.map((month) => monthlyRentMap[month] || 0),
    })
  );

  const totalUnitRent = payments.reduce(
    (sum, item) => sum + (item.actualAmount || 0),
    0
  );

  const currentMonthTotal = calculateMonthTotal(
    payments,
    "dueDate", // date key
    "actualAmount", // amount key
    selectedMonth // from MonthWiseTable
  );

  const barGraphOptions = {
    chart: {
      id: "unit-wise-rent",
      type: "bar",
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 4,
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => inrFormat(val),
      offsetY: -24,
      style: {
        fontSize: "12px",
        colors: ["#000"],
      },
    },
    xaxis: {
      categories: [], // Injected by YearlyGraph
    },
    yaxis: {
      max: 500000,
      labels: {
        formatter: (val) => `${Math.round(val / 100000)}L`,
      },
      title: {
        text: "Amount in INR (Lakhs)",
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `INR ${val.toLocaleString("en-IN")}`,
      },
    },
    colors: ["#54C4A7"],
    noData: {
      text: "No rent data available",
      align: "center",
      verticalAlign: "middle",
      style: {
        color: "#888",
        fontSize: "14px",
        fontFamily: "Poppins-Regular",
      },
    },
  };

  const paymentColumns = [
    { field: "srNo", headerName: "Sr No", width: 100, flex: 1 },
    {
      field: "expanseName",
      headerName: "Expanse Name",
      flex: 1,
      cellRenderer: (params) => (
        <span
          onClick={() => handleViewModal(params.data)}
          className="text-primary underline cursor-pointer"
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

  const handleViewModal = (rowData) => {
    setViewDetails(rowData);
    setViewModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      {landlordPaymentsError ? (
        <div className="text-red-500 text-center mb-6">
          Failed to fetch landlord payments.
        </div>
      ) : landlordPaymentsLoading ? (
        <div className="text-gray-500 text-center mb-6">
          Loading landlord payments...
        </div>
      ) : payments.length === 0 ? (
        <div className="text-gray-500 text-center mb-6">
          No landlord payment data found for this unit.
        </div>
      ) : (
        <>
          <YearlyGraph
            title={`(${unit}) RENT DETAILS `}
            chartId="unit-wise-rent"
            data={graphData}
            options={barGraphOptions}
            titleAmount={`INR ${inrFormat(totalUnitRent)}`}
          />

          <WidgetSection
            layout={1}
            title={`Landlord Payments (${unit})`}
            TitleAmount={`INR ${inrFormat(rangeTotal)}`}
            border
          >
            <YearWiseTable
              dateColumn={"dueDate"}
              data={payments.map((payment, index) => ({
                ...payment,
                projectedAmount: inrFormat(payment.projectedAmount),
                actualAmount: inrFormat(payment.actualAmount),
              }))}
              columns={paymentColumns}
              onMonthChange={setRangeTotal}
              TitleAmount={`INR ${inrFormat(rangeTotal)}`}
            />
          </WidgetSection>
        </>
      )}

      {viewDetails && (
        <MuiModal
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title="Landlord Payment Details"
        >
          <div className="space-y-3">
            <div className="font-bold">Basic Information</div>
            <DetalisFormatted
              title="Expanse Name"
              detail={viewDetails.expanseName}
            />
            <DetalisFormatted
              title="Department"
              detail={viewDetails.department.name}
            />
            <DetalisFormatted title="Status" detail={viewDetails.status} />
            <DetalisFormatted
              title="Extra Budget"
              detail={viewDetails.isExtraBudget ? "Yes" : "No"}
            />
            <br />
            <div className="font-bold">Financial Details</div>
            <DetalisFormatted
              title="Projected Amount"
              detail={`INR ${viewDetails.projectedAmount}`}
            />
            <DetalisFormatted
              title="Actual Amount"
              detail={`INR ${viewDetails.actualAmount}`}
            />
            <DetalisFormatted
              title="Due Date"
              detail={humanDate(viewDetails.dueDate)}
            />
          </div>
        </MuiModal>
      )}
    </div>
  );
};

export default LandlordPaymentLocation;
