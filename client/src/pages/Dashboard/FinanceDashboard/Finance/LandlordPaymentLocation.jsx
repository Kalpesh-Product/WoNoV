import { useCallback, useMemo, useState } from "react";
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
import StatusChip from "../../../../components/StatusChip";

const fiscalMonths = [
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
];

const parseAmount = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const normalizedValue = value.replace(/,/g, "").trim();
    const parsedValue = Number(normalizedValue);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }
  return 0;
};

const getFiscalYearStart = (dateInput) => {
  const parsedDate = dayjs(dateInput);
  if (!parsedDate.isValid()) return null;
  return parsedDate.month() >= 3 ? parsedDate.year() : parsedDate.year() - 1;
};

const formatFiscalYear = (startYear) =>
  `FY ${startYear}-${String(startYear + 1).slice(-2)}`;

const getFiscalYearMonths = (startYear) =>
  fiscalMonths.map((month, index) => {
    const year = index < 9 ? startYear : startYear + 1;
    return `${month}-${String(year).slice(-2)}`;
  });

const getPaymentSignature = (payment = {}) =>
  [
    payment?._id,
    payment?.id,
    payment?.expanseName,
    payment?.dueDate,
    payment?.actualAmount,
    payment?.isPaid,
  ].join("|");

const LandlordPaymentLocation = () => {
  const axios = useAxiosPrivate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { unitId } = location.state || {};
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [rangeTotal, setRangeTotal] = useState(0);
  const [visiblePayments, setVisiblePayments] = useState(null);

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

  const payments = Array.isArray(landlordPayments?.allBudgets)
    ? landlordPayments.allBudgets
    : [];
  const effectivePayments = visiblePayments ?? payments;
  const tablePayments = useMemo(
    () =>
      payments.map((payment) => ({
        ...payment,
        projectedAmount: inrFormat(payment.projectedAmount),
        actualAmount: inrFormat(payment.actualAmount),
      })),
    [payments],
  );
  const monthlyRentMap = {};
  const fiscalYearStarts = new Set();

  payments.forEach((item) => {
    if (!item.dueDate || !dayjs(item.dueDate).isValid()) return;
    const paymentStatus = String(item.isPaid || "")
      .trim()
      .toLowerCase();
    if (paymentStatus !== "paid") return;

    const monthKey = dayjs(item.dueDate).format("MMM-YY");
    monthlyRentMap[monthKey] =
      (monthlyRentMap[monthKey] || 0) + parseAmount(item.actualAmount);

    const fiscalYearStart = getFiscalYearStart(item.dueDate);
    if (fiscalYearStart !== null) {
      fiscalYearStarts.add(fiscalYearStart);
    }
  });

  const graphData = [...fiscalYearStarts]
    .sort((a, b) => a - b)
    .map((startYear) => ({
      name: "Monthly Rent",
      group: formatFiscalYear(startYear),
      data: getFiscalYearMonths(startYear).map(
        (month) => monthlyRentMap[month] || 0,
      ),
    }));

  const totalUnitRent = effectivePayments.reduce(
    (sum, item) => sum + parseAmount(item.actualAmount),
    0
  );
  const paidAmount = effectivePayments
    .filter((item) => String(item?.isPaid || "").trim().toLowerCase() === "paid")
    .reduce((sum, item) => sum + parseAmount(item.actualAmount), 0);
  const unpaidAmount = effectivePayments
    .filter((item) => String(item?.isPaid || "").trim().toLowerCase() === "unpaid")
    .reduce((sum, item) => sum + parseAmount(item.actualAmount), 0);

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
    {
      field: "department",
      headerName: "Department",
      flex: 1,
      hide: true,
      valueGetter: (params) => params.data?.department?.name || "-",
    },
    {
      field: "isExtraBudget",
      headerName: "Extra Budget",
      flex: 1,
      hide: true,
      valueGetter: (params) => (params.data?.isExtraBudget ? "Yes" : "No"),
    },
    { field: "projectedAmount", headerName: "Projected Amount (INR)", flex: 1 },
    { field: "actualAmount", headerName: "Actual Amount (INR)", flex: 1 },
    { field: "dueDate", headerName: "Due Date", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      cellRenderer: (params) => <StatusChip status={params.value} />,
    },
  ];

  const handleViewModal = (rowData) => {
    setViewDetails(rowData);
    setViewModalOpen(true);
  };

  const handleDateFilterChange = useCallback(({ filteredData }) => {
    const nextPayments = filteredData || [];

    setVisiblePayments((prev) => {
      if (prev === null) return nextPayments;
      if (prev.length !== nextPayments.length) return nextPayments;

      const isSame = prev.every(
        (item, index) =>
          getPaymentSignature(item) === getPaymentSignature(nextPayments[index]),
      );

      return isSame ? prev : nextPayments;
    });
  }, []);

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
          />

          <WidgetSection
            layout={1}
            title={`Landlord Payments (${unit})`}
            TitleAmountTotal={`INR ${inrFormat(totalUnitRent)}`}
            TitleAmountGreen={`INR ${inrFormat(paidAmount)}`}
            TitleAmountRed={`INR ${inrFormat(unpaidAmount)}`}
            totalTitle="Total"
            greenTitle="Paid"
            redTitle="Unpaid"
            summaryChipVariant="ticket"
            border
          >
            <YearWiseTable
              dateColumn={"dueDate"}
              data={tablePayments}
              columns={paymentColumns}
              onMonthChange={setRangeTotal}
              onDateFilterChange={handleDateFilterChange}
              TitleAmount={`INR ${inrFormat(rangeTotal)}`}
              exportData
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
