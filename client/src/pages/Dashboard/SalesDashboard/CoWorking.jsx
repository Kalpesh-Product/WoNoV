import {
  CircularProgress,
} from "@mui/material";
import { inrFormat } from "../../../utils/currencyFormat";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import WidgetTable from "../../../components/Tables/WidgetTable";
import StatusChip from "../../../components/StatusChip";
import FyBarGraph from "../../../components/graphs/FyBarGraph";

const getNormalizedRentStatus = (status) =>
  String(status || "").trim().toLowerCase();

const getNumericAmount = (value) =>
  parseFloat(String(value || "0").replace(/,/g, "")) || 0;

const CoWorking = () => {
  const axios = useAxiosPrivate();
  const { data: coWorkingData = [], isLoading: isCoWorkingLoading } = useQuery({
    queryKey: ["coWorkingData"],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/sales/fetch-coworking-revenues`);
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });
  const graphData = isCoWorkingLoading
    ? []
    : coWorkingData.flatMap((item) =>
      (item.clients || []).filter(
        (client) => getNormalizedRentStatus(client.rentStatus) === "paid"
      ).map((client) => ({
        ...client,
        vertical: "Co-Working",
      }))
    );

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
      title: { text: "Amount In Lakhs (INR)" },
      labels: {
        formatter: (val) => `${(val / 100000).toLocaleString()}`,
      },
    },
    tooltip: {
      enabled: true,
      custom: ({ series, seriesIndex, dataPointIndex, w }) => {
        const label =
          w?.globals?.categoryLabels?.[dataPointIndex] ||
          w?.config?.xaxis?.categories?.[dataPointIndex] ||
          "";
        const seriesName =
          w?.globals?.seriesNames?.[seriesIndex] || "Co-Working";
        const value = series?.[seriesIndex]?.[dataPointIndex] || 0;
        const color = w?.globals?.colors?.[seriesIndex] || "#1E88E5";

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
        formatter: (val) => `INR ${val.toLocaleString()}`,
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
    colors: ["#1E3D73"],
  };

  let serialNumber = 1;
  const tableData = isCoWorkingLoading
    ? []
    : coWorkingData.map((monthData) => ({
      revenue: monthData?.clients?.map((client) => ({
        id: serialNumber++,
        clientName: client.clientName,
        channel: client.channel,
        noOfDesks: client.noOfDesks,
        deskRate: inrFormat(client.deskRate),
        revenue: client.revenue,
        totalTerm: client.totalTerm || 0,
        rentDate: client.rentDate,
        rentStatus: client.rentStatus,
        normalizedRentStatus: getNormalizedRentStatus(client.rentStatus),
        pastDueDate: client.pastDueDate,
        annualIncrement: client.annualIncrement || 0,
        nextIncrementDate: client.nextIncrementDate,
      })),
    }));

  const flattenedRevenueData = tableData.flatMap((month) => month.revenue);

  return (
    <div className="flex flex-col gap-4">
      {!isCoWorkingLoading ? (
        // <YearlyGraph
        //   title={"ANNUAL MONTHLY CO WORKING REVENUES"}
        //   titleAmount={`INR ${inrFormat(totalActual)}`}
        //   data={series}
        //   options={options}
        // />
        <FyBarGraph
          data={graphData}
          chartOptions={options}
          dateKey="rentDate"
          valueKey="revenue"
          graphTitle="ANNUAL MONTHLY CO WORKING REVENUES"
        />
      ) : (
        <div className="h-72 flex justify-center items-center">
          <CircularProgress />
        </div>
      )}

      {!isCoWorkingLoading ? (
        <WidgetTable
          data={flattenedRevenueData}
          dateColumn={"rentDate"}
          exportData
          formatDate
          tableTitle={"MONTHLY REVENUE WITH CLIENT DETAILS"}
          totalKey="revenue"
          titleAmountOverride=""
          titleAmountGreen={({ filteredData }) =>
            `INR ${inrFormat(
              filteredData.reduce((sum, item) => {
                if (item.normalizedRentStatus !== "paid") return sum;
                return sum + getNumericAmount(item.revenue);
              }, 0)
            )}`
          }
          titleAmountRed={({ filteredData }) =>
            `INR ${inrFormat(
              filteredData.reduce((sum, item) => {
                if (item.normalizedRentStatus !== "unpaid") return sum;
                return sum + getNumericAmount(item.revenue);
              }, 0)
            )}`
          }
          titleAmountTotal={({ rangeTotal }) => `INR ${inrFormat(rangeTotal)}`}
          greenTitle="Paid"
          redTitle="Unpaid"
          totalTitle="Total"
          summaryChipVariant="ticket"
          columns={[
            { headerName: "Sr No", field: "id", width: 100 },
            { headerName: "Client Name", field: "clientName", width: 350 },
            { headerName: "Channel", field: "channel" },
            {
              headerName: "Revenue (INR)",
              field: "revenue",
              cellRenderer: (params) => inrFormat(params.value),
            },
            { headerName: "No. of Desks", field: "noOfDesks" },
            { headerName: "Desk Rate", field: "deskRate" },
            { headerName: "Total Term", field: "totalTerm" },
            { headerName: "Rent Date", field: "rentDate" },

            { headerName: "Past Due Date", field: "pastDueDate" },
            {
              headerName: "Annual Increment (%)",
              field: "annualIncrement",
            },
            {
              headerName: "Next Increment Date",
              field: "nextIncrementDate",
            },
            {
              headerName: "Rent Status",
              field: "rentStatus",
              pinned: "right",
              cellRenderer: (params) => <StatusChip status={params.value} />,
            },
          ]}
        />
      ) : (
        <div className="h-72 flex justify-center items-center">
          <CircularProgress />
        </div>
      )}
    </div>
  );
};

export default CoWorking;
