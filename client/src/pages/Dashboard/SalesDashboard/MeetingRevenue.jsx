import BarGraph from "../../../components/graphs/BarGraph";
import WidgetSection from "../../../components/WidgetSection";
import MonthWiseAgTable from "../../../components/Tables/MonthWiseAgTable";
import { inrFormat } from "../../../utils/currencyFormat";
import humanDate from "../../../utils/humanDateForamt";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { CircularProgress } from "@mui/material";

const MeetingRevenue = () => {
  const axios = useAxiosPrivate();

  const {
    data: meetingsData = [],
    isLoading: isMeetingsLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/get-meeting-revenue");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const hasData = Array.isArray(meetingsData) && meetingsData.length > 0;

  const series = hasData
    ? [
        {
          name: "Actual Revenue",
          data: meetingsData.map((item) =>
            item?.revenue?.reduce((sum, c) => sum + (c.taxable || 0), 0)
          ),
        },
      ]
    : [];

  const options = {
    chart: {
      stacked: false,
      toolbar: false,
      fontFamily: "Poppins-Regular",
    },
    legend: {
      show: true,
      position: "top",
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${inrFormat(val)}`,
      style: {
        fontSize: "10px",
        fontWeight: "bold",
        colors: ["#000"],
      },
      offsetY: -22,
    },
    xaxis: {
      categories: meetingsData.map((item) => item.month ?? "N/A"),
    },
    yaxis: {
      title: { text: "Amount In Lakhs (INR)" },
      labels: {
        formatter: (val) => `${(val / 100000).toLocaleString()}`,
      },
    },
    tooltip: {
      enabled: false,
      y: {
        formatter: (val) => `INR ${val.toLocaleString()}`,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "40%",
        borderRadius: 5,
        dataLabels: { position: "top" },
      },
    },
    colors: ["#2196F3"],
  };

  const totalActual = meetingsData.reduce(
    (sum, month) =>
      sum + month?.revenue?.reduce((s, c) => s + (c.taxable || 0), 0),
    0
  );

  const tableData = meetingsData.map((monthData, index) => {
    const actual = monthData?.revenue?.reduce((sum, c) => sum + (c.totalAmount || 0), 0);
    return {
      id: index,
      month: monthData.month || "N/A",
      actual: `INR ${actual?.toLocaleString()}`,
      revenue: monthData?.revenue?.map((client, i) => ({
        id: i + 1,
        particulars: client.particulars || "-",
        unitsOrHours: client.unitsOrHours ?? "-",
        taxable: client.taxable ?? 0,
        gst: client.gst ?? 0,
        totalAmount: client.totalAmount ?? 0,
        date: humanDate(client.date),
        paymentDate: humanDate(client.paymentDate),
        remarks: client.remarks || "-",
      })) ?? [],
    };
  });

  return (
    <div className="flex flex-col gap-4">
      { isMeetingsLoading ? (
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
          <WidgetSection
            title={"Annual Monthly Meetings Revenues"}
            titleLabel={"FY 2024-25"}
            TitleAmount={`INR ${inrFormat(totalActual)}`}
            border
          >
            <BarGraph data={series} options={options} height={400} />
          </WidgetSection>

          <MonthWiseAgTable
            financialData={tableData}
            title={"Monthly Revenue with Client Details"}
            passedColumns={[
              { headerName: "Sr No", field: "id", width: 100 },
              { headerName: "Particulars", field: "particulars", width: 200 },
              { headerName: "Units / Hours", field: "unitsOrHours" },
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
            ]}
          />
        </>
      )}
    </div>
  );
};

export default MeetingRevenue;
