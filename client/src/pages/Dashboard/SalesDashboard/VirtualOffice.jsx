import { inrFormat } from "../../../utils/currencyFormat";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import NormalBarGraph from "../../../components/graphs/NormalBarGraph";
import { parseRevenue } from "../../../utils/removeCommaInNum";
import { Skeleton } from "@mui/material";
import MonthWiseAgTable from "../../../components/Tables/MonthWiseAgTable";
import WidgetTable from "../../../components/Tables/WidgetTable";
import YearlyGraph from "../../../components/graphs/YearlyGraph";
import StatusChip from "../../../components/StatusChip";
import humanDate from "../../../utils/humanDateForamt";

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
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const monthShortNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const transformRevenues = (revenues) => {
    const monthlyMap = new Map();

    revenues.forEach((item, index) => {
      const rentDate = new Date(item.rentDate);
      const year = rentDate.getFullYear();
      const month = rentDate.getMonth(); // 0-indexed

      const monthKey = `${monthShortNames[month]}-${year.toString().slice(-2)}`;
      const keyDate = new Date(year, month, 1); // Used for sorting

      const actual = item.taxableAmount;

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          id: index + 1,
          month: monthKey,
          keyDate, // store for sorting
          taxable: 0,
          revenue: [],
        });
      }

      const monthData = monthlyMap.get(monthKey);
      monthData.taxable += actual;

      monthData.revenue.push({
        id: index + 1,
        clientName: item.client?.clientName || "N/A",
        revenue: inrFormat(actual),
        channel: item.Channel || item.channel,
        status: item.status === true ? "Paid" : "Unpaid",
      });
    });

    return Array.from(monthlyMap.values())
      .sort((a, b) => a.keyDate - b.keyDate)
      .map(({ keyDate, ...monthData }) => ({
        ...monthData,
        actual: inrFormat(monthData.taxable),
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

  console.log("graph numbers : ", graphNumbers);

  const series = [
    {
      name: "Revenue",
      group: "FY 2024-25",
      data: graphNumbers,
      dateKey: virtualOfficeRevenue?.[0]?.rentDate, // 👈 add this
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
      enabled: false,
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

  const tableData = isLoadingVirtualOfficeRevenue
    ? []
    : virtualOfficeRevenue.map((item) => ({
        ...item,
        clientName: item.client?.clientName,
      }));

  console.log("tableData : ", humanDate("2025-04-10T00:00:00.000Z"));

  return (
    <div className="flex flex-col gap-4">
      {!isLoadingVirtualOfficeRevenue ? (
        <YearlyGraph
          title={"ANNUAL MONTHLY VIRTUAL OFFICE REVENUES"}
          titleAmount={`INR ${inrFormat(totalActual)}`}
          data={series}
          options={options}
          dateKey={"dateKey"}
        />
      ) : (
        <Skeleton height={"500px"} width={"100%"} />
      )}

      {!isLoadingVirtualOfficeRevenue ? (
        <WidgetTable
          tableTitle={"Monthly Revenue with Client Details"}
          data={tableData}
          totalKey="revenue"
          dateColumn={"rentDate"}
          columns={[
            { headerName: "Sr No", field: "srNo", flex: 1 },
            { headerName: "Client Name", field: "clientName", flex: 1 },
            {
              headerName: "Revenue (INR)",
              field: "revenue",
              flex: 1,
              cellRenderer: (params) => inrFormat(params.value || 0),
            },
            {
              headerName: "Status",
              field: "status",
              flex: 1,
              cellRenderer: (params) => <StatusChip status={params.value ? "Paid" : "Unpaid"} />,
            },
          ]}
        />
      ) : (
        <Skeleton height={"500px"} width={"100%"} />
      )}
    </div>
  );
};

export default VirtualOffice;
