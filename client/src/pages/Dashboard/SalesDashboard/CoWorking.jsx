import {
  CircularProgress,
} from "@mui/material";
import { inrFormat } from "../../../utils/currencyFormat";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import WidgetTable from "../../../components/Tables/WidgetTable";
import StatusChip from "../../../components/StatusChip";
import FyBarGraph from "../../../components/graphs/FyBarGraph";

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
    : coWorkingData.flatMap((item) => item.clients);

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
      enabled: false,
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

  const tableData = isCoWorkingLoading
    ? []
    : coWorkingData.map((monthData, index) => ({
        revenue: monthData?.clients?.map((client, i) => ({
          id: i + 1,
          clientName: client.clientName,
          channel: client.channel,
          noOfDesks: client.noOfDesks,
          deskRate: inrFormat(client.deskRate),
          revenue: client.revenue,
          totalTerm: client.totalTerm || 0,
          rentDate: client.rentDate,
          rentStatus: client.rentStatus,
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
          formatDate
          tableTitle={"MONTHLY REVENUE WITH CLIENT DETAILS"}
          totalKey="revenue"
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
