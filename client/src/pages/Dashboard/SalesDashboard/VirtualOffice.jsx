import BarGraph from "../../../components/graphs/BarGraph";
import WidgetSection from "../../../components/WidgetSection";
import AgTable from "../../../components/AgTable";
import CollapsibleTable from "../../../components/Tables/MuiCollapsibleTable";
import dayjs from "dayjs";
import { inrFormat } from "../../../utils/currencyFormat";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import NormalBarGraph from "../../../components/graphs/NormalBarGraph";
import { parseRevenue } from "../../../utils/removeCommaInNum";
import { Skeleton } from "@mui/material";
import MonthWiseAgTable from "../../../components/Tables/MonthWiseAgTable";

const VirtualOffice = () => {
  const axios = useAxiosPrivate();
  const {
    data: virtualOfficeRevenue,
    isLoading: isLoadingVirtualOfficeRevenue = [],
  } = useQuery({
    queryKey: ["virtualOfficeRevenue"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/sales/get-virtual-office-revenue`
        );
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const transformRevenues = (revenues) => {
    const monthlyMap = new Map();

    revenues.forEach((item, index) => {
      const rentDate = new Date(item.rentDate);
      const monthKey = `${rentDate.toLocaleString("default", {
        month: "short",
      })}-${rentDate.getFullYear().toString().slice(-2)}`;

      const actual = item.actualRevenue;

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          id : index + 1,
          month: monthKey,
          actual: 0,
          revenue: [],
        });
      }

      const monthData = monthlyMap.get(monthKey);
      monthData.actual += actual;

      monthData.revenue.push({
        id: index + 1,
        clientName: item.clientName.clientName,
        revenue: inrFormat(actual),
        channel: item.channel,
        status: item.status || "Paid",
      });
    });

    return Array.from(monthlyMap.values()).map((monthData) => ({
      ...monthData,
      actual: inrFormat(monthData.actual),
    }));
  };

  // Memoize or recompute transformed data only when API data is loaded
  const transformRevenuesData = useMemo(() => {
    if (isLoadingVirtualOfficeRevenue || !virtualOfficeRevenue) return [];
    return transformRevenues(virtualOfficeRevenue);
  }, [virtualOfficeRevenue, isLoadingVirtualOfficeRevenue]);

  const graphNumbers = transformRevenuesData?.map((item) => {
    // Remove commas and convert the value to a number
    return parseFloat(item?.actual.replace(/,/g, ""));
  });

  const series = [
    {
      name: "Revenue",
      data: graphNumbers,
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
        // Format the value here for display in the chart
        return `${inrFormat(val)}`; // Use inrFormat only for display
      },
      style: {
        fontSize: "10px",
        fontWeight: "bold",
        colors: ["#000"],
      },
      offsetY: -22,
    },
    xaxis: {
      categories: transformRevenuesData.map((item) => item.month),
    },
    yaxis: {
      title: { text: "Amount In Lakhs (INR)" },
      labels: {
        formatter: (val) => val / 100000, // Display in Lakhs
      },
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val) => `INR ${val.toLocaleString()}`, // Format tooltip
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
    colors: ["#11daf5"],
  };

  const totalActual = transformRevenuesData?.reduce(
    (sum, month) =>
      sum +
      month.revenue.reduce(
        (monthSum, client) => monthSum + parseRevenue(client.revenue),
        0
      ),
    0
  );

  return (
    <div className="flex flex-col gap-4">
      {!isLoadingVirtualOfficeRevenue ? (
        <WidgetSection
          title={"Annual Monthly Virtual Office Revenues"}
          titleLabel={"FY 2024-25"}
          border
          TitleAmount={`INR ${inrFormat(totalActual)}`}
        >
          <NormalBarGraph data={series} options={options} height={400} />
        </WidgetSection>
      ) : (
        <Skeleton height={"500px"} width={"100%"} />
      )}

      {!isLoadingVirtualOfficeRevenue ? (
        <WidgetSection
          border
          title={"Monthly Revenue with Client Details"}
          padding
          TitleAmount={`INR ${inrFormat(totalActual)}`}
        >
          <MonthWiseAgTable financialData={transformRevenuesData} passedColumns={[
                  { headerName: "Sr No", field: "id", flex: 1 },
                  { headerName: "Client Name", field: "clientName", flex: 1 },
                  { headerName: "Revenue (INR)", field: "revenue", flex: 1 },
                  { headerName: "Status", field: "status", flex: 1 },
                ]}/>
          {/* <CollapsibleTable
            columns={[
              { headerName: "Month", field: "month" },
              { headerName: "Revenue (INR)", field: "actual" },
            ]}
            data={transformRevenuesData}
            renderExpandedRow={(row) => (
              <AgTable
                data={row.clients.map((client, index) => {
                  return {
                    srNo: index + 1,
                    ...client,
                  };
                })}
                columns={[
                  { headerName: "Sr No", field: "srNo", flex: 1 },
                  { headerName: "Client Name", field: "clientName", flex: 1 },
                  { headerName: "Revenue (INR)", field: "revenue", flex: 1 },
                  { headerName: "Status", field: "status", flex: 1 },
                ]}
                tableHeight={300}
                hideFilter
              />
            )}
          /> */}
        </WidgetSection>
      ) : (
        <Skeleton height={"500px"} width={"100%"} />
      )}
    </div>
  );
};

export default VirtualOffice;
