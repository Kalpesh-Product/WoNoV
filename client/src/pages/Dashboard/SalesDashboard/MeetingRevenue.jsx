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

  const graphData = isMeetingsLoading
    ? []
    : meetingsData.flatMap((item) => item.revenue);

  const hasData = Array.isArray(meetingsData) && meetingsData.length > 0;

  const options = {
    yaxis: {
      title: { text: "Amount (INR)" },
      labels: {
        formatter: (val) => inrFormat(val),
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `INR ${inrFormat(val)}`,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "40%",
        borderRadius: 5,
      },
    },
    colors: ["#2196F3", "#4CAF50", "#FF9800", "#9C27B0", "#F44336"],
  };


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
      remarks: client.remarks || "-",
    })),
  }));

  const flattenedRevenueData = tableData.flatMap((month) => month.revenue);

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
            totalKey="taxable"
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
              { headerName: "Date", field: "date" },
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
