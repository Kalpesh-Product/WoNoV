import BarGraph from "../../../components/graphs/BarGraph";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CircularProgress,
} from "@mui/material";
import { IoIosArrowDown } from "react-icons/io";
import AgTable from "../../../components/AgTable";
import WidgetSection from "../../../components/WidgetSection";
import dayjs from "dayjs";
import CollapsibleTable from "../../../components/Tables/MuiCollapsibleTable";
import { inrFormat } from "../../../utils/currencyFormat";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import MonthWiseAgTable from "../../../components/Tables/MonthWiseAgTable";
import YearlyGraph from "../../../components/graphs/YearlyGraph";

const CoWorking = () => {
  const axios = useAxiosPrivate();
  const { data: coWorkingData = [], isLoading: isCoWorkingLoading } = useQuery({
    queryKey: ["workationData"],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/sales/fetch-coworking-revenues`);
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });
  const series = [
    {
      name: "Actual Revenue",
      group: "FY 2024-25",
      data: coWorkingData.map((item) =>
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
      categories: coWorkingData.map((item) => item.month),
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

  const tableData = isCoWorkingLoading
    ? []
    : coWorkingData.map((monthData, index) => {
        const totalRevenue = monthData?.clients?.reduce(
          (sum, c) => sum + c.revenue,
          0
        );
        return {
          id: index,
          month: monthData.month,
          acutal: `INR ${totalRevenue}`,
          revenue: monthData?.clients?.map((client, i) => ({
            id: i + 1,
            clientName: client.clientName,
            channel: client.channel,
            noOfDesks: client.noOfDesks,
            deskRate: client.deskRate,
            revenue: `${client.revenue.toLocaleString()}`,
            totalTerm: client.totalTerm,
            rentDate: dayjs(client.rentDate).format("DD-MM-YYYY"),
            rentStatus: client.rentStatus,
            pastDueDate: dayjs(client.pastDueDate).format("DD-MM-YYYY"),
            annualIncrement: client.annualIncrement,
            nextIncrementDate: dayjs(client.nextIncrementDate).format(
              "DD-MM-YYYY"
            ),
          })),
        };
      });
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

      {!isCoWorkingLoading ? (
        <MonthWiseAgTable
          financialData={tableData}
          title={"MONTHLY REVENUE WITH CLIENT DETAILS"}
          passedColumns={[
            { headerName: "Sr No", field: "id", width: 100 },
            { headerName: "Client Name", field: "clientName", width: 350 },
            { headerName: "Channel", field: "channel" },
            { headerName: "Revenue (INR)", field: "revenue" },
            { headerName: "No. of Desks", field: "noOfDesks" },
            { headerName: "Desk Rate", field: "deskRate" },
            { headerName: "Total Term", field: "totalTerm" },
            { headerName: "Rent Date", field: "rentDate" },
            { headerName: "Rent Status", field: "rentStatus" },
            { headerName: "Past Due Date", field: "pastDueDate" },
            {
              headerName: "Annual Increment (%)",
              field: "annualIncrement",
            },
            {
              headerName: "Next Increment Date",
              field: "nextIncrementDate",
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
