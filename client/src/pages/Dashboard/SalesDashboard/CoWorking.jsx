import { CircularProgress } from "@mui/material";
import { inrFormat } from "../../../utils/currencyFormat";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import YearlyGraph from "../../../components/graphs/YearlyGraph";
import YearWiseTable from "../../../components/Tables/YearWiseTable";
import PageFrame from "../../../components/Pages/PageFrame";
import StatusChip from "../../../components/StatusChip";

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

  const revenueArray = isCoWorkingLoading
    ? []
    : coWorkingData.flatMap((item) =>
        item.clients?.map((item) => ({
          ...item,
          deskRate: inrFormat(item.deskRate || 0),
          totalTerm: item.totalTerm || 0,
          noOfDesks: item.noOfDesks || 0,
          annualIncrement: item.annualIncrement || 0,
          revenue: inrFormat(item.revenue || 0),
        }))
      );

  const fiscalOrder = [
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
  ];
  const sortedCoWorkingData = [...coWorkingData].sort(
    (a, b) => fiscalOrder.indexOf(a.month) - fiscalOrder.indexOf(b.month)
  );
  const series = [
    {
      name: "Actual Revenue",
      group: "FY 2024-25",
      data: sortedCoWorkingData.map((item) =>
        item.clients?.reduce((sum, c) => sum + c.revenue, 0)
      ),
    },
  ];

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
    xaxis: {
      categories: sortedCoWorkingData.map((item) => item.month),
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
  const totalActual = coWorkingData.reduce((sum, c) => sum + c.totalRevenue, 0);

  return (
    <div className="flex flex-col gap-4">
      {!isCoWorkingLoading ? (
        <YearlyGraph
          title={"ANNUAL MONTHLY CO WORKING REVENUES"}
          titleAmount={`INR ${inrFormat(totalActual)}`}
          data={series}
          options={options}
        />
      ) : (
        <div className="h-72 flex justify-center items-center">
          <CircularProgress />
        </div>
      )}
      <PageFrame>
        <YearWiseTable
          data={revenueArray}
          tableTitle={"MONTHLY REVENUE WITH CLIENT DETAILS"}
          columns={[
            { headerName: "Sr No", field: "srNo", width: 100 },
            { headerName: "Client Name", field: "clientName", width: 350 },
            { headerName: "Channel", field: "channel" },
            { headerName: "Revenue (INR)", field: "revenue" },
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
              pinned : 'right',
              cellRenderer: (params) => <StatusChip status={params.value} />,
            },
          ]}
          dateColumn={"rentDate"}
        />
      </PageFrame>
    </div>
  );
};

export default CoWorking;
