import BarGraph from "../../../components/graphs/BarGraph";
import WidgetSection from "../../../components/WidgetSection";
import { inrFormat } from "../../../utils/currencyFormat";
import humanDate from "../../../utils/humanDateForamt";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { CircularProgress } from "@mui/material";
import WidgetTable from "../../../components/Tables/WidgetTable";
import StatusChip from "../../../components/StatusChip";
import YearlyGraph from "../../../components/graphs/YearlyGraph";
import FyBarGraphPercentage from "../../../components/graphs/FyBarGraphPercentage";
import FyBarGraph from "../../../components/graphs/FyBarGraph";

// const MeetingRevenue = () => {
//   const axios = useAxiosPrivate();

//   const {
//     data: meetingsData = [],
//     isLoading: isMeetingsLoading,
//     isError,
//     error,
//   } = useQuery({
//     queryKey: ["meetings-revenue"],
//     queryFn: async () => {
//       const response = await axios.get("/api/sales/get-meeting-revenue");
//       return Array.isArray(response.data) ? response.data : [];
//     },
//   });

//   const graphData = isMeetingsLoading
//     ? []
//     : meetingsData.flatMap((item) => item.revenue);

//   const hasData = Array.isArray(meetingsData) && meetingsData.length > 0;

const MONTH_INDEX_MAP = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

const getNormalizedPaymentStatus = (status) =>
  String(status || "").trim().toLowerCase();

const getNumericAmount = (value) =>
  parseFloat(String(value || "0").replace(/,/g, "")) || 0;

const MeetingRevenue = () => {
  const axios = useAxiosPrivate();

  const {
    data: meetingsData = [],
    isLoading: isMeetingsLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["meetings-revenue"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/get-meeting-revenue");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const hasData = Array.isArray(meetingsData) && meetingsData.length > 0;
  const tableData = meetingsData.map((monthData) => ({
    revenue: monthData?.revenue?.map((client) => ({
      ...client,
      particulars: client.particulars || "-",
      unitsOrHours: client.unitsOrHours ?? "-",
      taxable: client.taxable ?? 0,
      gst: client.gst ?? 0,
      totalAmount: client.totalAmount ?? 0,
      date: client.date,
      paymentDate: client.paymentDate,
      normalizedStatus: getNormalizedPaymentStatus(client.status),
      remarks: client.remarks || "-",
    })),
  }));

  const flattenedRevenueData = tableData.flatMap((month) => month.revenue);
  const maxMeetingAmount = flattenedRevenueData.reduce(
    (max, item) => Math.max(max, getNumericAmount(item?.taxable)),
    0
  );
  const useLakhsScale = maxMeetingAmount >= 100000;
  const graphData = isMeetingsLoading
    ? []
    : flattenedRevenueData
        .filter((item) => item.normalizedStatus === "paid")
        .map((item) => ({
          date: item.date,
          taxable: getNumericAmount(item.taxable),
          vertical: "Meeting",
        }));
  const options = {
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return `${inrFormat(val)}`;
      },
      style: {
        fontSize: "10px",
        fontWeight: "bold",
        colors: ["#000"],
      },
      offsetY: -22,
    },
    yaxis: {
      title: { text: useLakhsScale ? "Amount In Lakhs (INR)" : "Amount (INR)" },
      labels: {
        formatter: (val) =>
          useLakhsScale
            ? `${(val / 100000).toLocaleString("en-IN")}`
            : inrFormat(val),
      },
    },
    tooltip: {
      enabled: true,
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        const label =
          w?.globals?.categoryLabels?.[dataPointIndex] ||
          w?.config?.xaxis?.categories?.[dataPointIndex] ||
          "";
        const seriesName = w?.globals?.seriesNames?.[seriesIndex] || "Meeting";
        const value = series?.[seriesIndex]?.[dataPointIndex] || 0;
        const color = w?.globals?.colors?.[seriesIndex] || "#2196F3";

        return `
          <div style="min-width: 160px; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 14px rgba(15, 23, 42, 0.18); border: 1px solid #e5e7eb;">
            <div style="background: #eef2f6; color: #1f2937; font-size: 12px; padding: 8px 12px; border-bottom: 1px solid #dbe1e8;">
              ${label}
            </div>
            <div style="display: flex; align-items: center; gap: 8px; padding: 10px 12px; font-size: 12px; color: #111827;">
              <span style="width: 12px; height: 12px; border-radius: 999px; background: ${color}; display: inline-block;"></span>
              <span>${seriesName}:</span>
              <span style="font-weight: 700;">INR ${inrFormat(value)}</span>
            </div>
          </div>
        `;
      },
      y: {
        formatter: (val) => `INR ${inrFormat(val)}`,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "40%",
        borderRadius: 5,
        dataLabels: {
          position: "top",
        },
      },
    },
    colors: ["#2196F3", "#4CAF50", "#FF9800", "#9C27B0", "#F44336"],
  };

  return (
    <div className="flex flex-col gap-4">
      {isMeetingsLoading ? (
        <div className="flex h-72 justify-center items-center">
          <CircularProgress />
        </div>
      ) : isError ? (
        <div className="text-red-600 text-center py-8">
          Failed to fetch meeting revenue data. {error?.message || ""}
        </div>
      ) : !hasData ? (
        <div className="text-gray-500 text-center py-8">
          No meeting revenue data available.
        </div>
      ) : (
        <>
          <FyBarGraph
            data={graphData}
            dateKey="date"
            valueKey="taxable"
            graphTitle="ANNUAL MONTHLY MEETINGS REVENUES"
            chartOptions={options}
          />

          <WidgetTable
            data={flattenedRevenueData}
            tableTitle={"Monthly Revenue with Client Details"}
            dateColumn={"date"}
            formatDate
            exportData
            totalKey="taxable"
            titleAmountOverride=""
            titleAmountGreen={({ filteredData }) =>
              `INR ${inrFormat(
                filteredData.reduce((sum, item) => {
                  if (item.normalizedStatus !== "paid") return sum;
                  return sum + getNumericAmount(item.taxable);
                }, 0)
              )}`
            }
            titleAmountRed={({ filteredData }) =>
              `INR ${inrFormat(
                filteredData.reduce((sum, item) => {
                  if (item.normalizedStatus !== "unpaid") return sum;
                  return sum + getNumericAmount(item.taxable);
                }, 0)
              )}`
            }
            titleAmountTotal={({ rangeTotal }) => `INR ${inrFormat(rangeTotal)}`}
            greenTitle="Paid"
            redTitle="Unpaid"
            totalTitle="Total"
            summaryChipVariant="ticket"
            columns={[
              { headerName: "Sr No", field: "srNo", width: 100 },
              // { headerName: "Particulars", field: "particulars", width: 200 },
              // { headerName: "Units / Hours", field: "unitsOrHours" },
              { headerName: "Client Name", field: "clientName" },
              {
                headerName: "Taxable (INR)",
                field: "taxable",
                valueFormatter: ({ value }) =>
                  typeof value === "number"
                    ? value.toLocaleString("en-IN")
                    : `${value ?? ""}`,
              },
              {
                headerName: "GST (INR)",
                field: "gst",
                valueFormatter: ({ value }) =>
                  typeof value === "number"
                    ? value.toLocaleString("en-IN")
                    : `${value ?? ""}`,
              },
              {
                headerName: "Total Amount (INR)",
                field: "totalAmount",
                valueFormatter: ({ value }) =>
                  typeof value === "number"
                    ? value.toLocaleString("en-IN")
                    : `${value ?? ""}`,
              },
              //{ headerName: "Date", field: "date" },
             { headerName: "Payment Date", field: "paymentDate" },
              { headerName: "Remarks", field: "remarks" },
              {
                headerName: "Status",
                field: "status",
                pinned: "right",
                cellRenderer: (params) => <StatusChip status={params.value} />,
              },
            ]}
          />
        </>
      )}
    </div>
  );
};

export default MeetingRevenue;
