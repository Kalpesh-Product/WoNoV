import WidgetSection from "../../../components/WidgetSection";
import { inrFormat } from "../../../utils/currencyFormat";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import NormalBarGraph from "../../../components/graphs/NormalBarGraph";
import MonthWiseAgTable from "../../../components/Tables/MonthWiseAgTable";
import WidgetTable from "../../../components/Tables/WidgetTable";
import StatusChip from "../../../components/StatusChip";
import YearlyGraph from "../../../components/graphs/YearlyGraph";

const Workations = () => {
  const axios = useAxiosPrivate();
  const { data: workationData = [], isLoading: isWorkationLoading } = useQuery({
    queryKey: ["workationData"],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/sales/get-workation-revenue`);
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const transformRevenues = (revenues) => {
    const monthlyMap = new Map();

    revenues.forEach((item, index) => {
      const rentDate = new Date(item.date);
      const monthKey = `${rentDate.toLocaleString("default", {
        month: "short",
      })}-${rentDate.getFullYear().toString().slice(-2)}`;

      const actual = parseFloat(item.taxableAmount);

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: monthKey,
          actual: 0,
          clients: [],
        });
      }

      const monthData = monthlyMap.get(monthKey);
      monthData.actual += actual;

      monthData.clients.push({
        clientName: item.nameOfClient,
        revenue: actual,
        particulars: item.particulars,
        taxableAmount: item.taxableAmount,
        gst: item.gst,
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
    if (isWorkationLoading || !workationData) return [];
    return transformRevenues(workationData);
  }, [workationData, isWorkationLoading]);
  const graphNumbers = transformRevenuesData?.map((item) => {
    // Remove commas and convert the value to a number
    return parseFloat(item?.actual.replace(/,/g, ""));
  });

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
      categories: [
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
      ],
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
    colors: ["#54C4A7", "#EB5C45"],
    noData: {
      text: "", // Text to show when no data is available
      align: "center", // Position of the text
      verticalAlign: "middle", // Vertical alignment of the text
      offsetX: 0, // Horizontal offset
      offsetY: 0, // Vertical offset
      style: {
        fontSize: "20px",
        fontWeight: "bold",
        color: "#888", // Text color
      },
    },
  };

  const series = [
    {
      name: "Actual Revenue",
      group: "FY 2024-25",
      data: [
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
      ].map((month) => {
        const monthData = transformRevenuesData.find(
          (item) => item.month === month
        );

        // If no data for the month, return null, else calculate the revenue
        return monthData
          ? monthData.clients.reduce((sum, client) => sum + client.revenue, 0)
          : null; // Return `null` for months with no data
      }),
    },
    {
      name: "Actual Revenue",
      group: "FY 2025-26",
      data: [],
    },
  ];

  const totalActual = transformRevenuesData.reduce(
    (sum, month) =>
      sum +
      month.clients.reduce((monthSum, client) => monthSum + client.revenue, 0),
    0
  );

  const tableData = isWorkationLoading
    ? []
    : workationData?.map((monthData) => ({
        ...monthData,
        clientName: monthData.nameOfClient,
        revenue: monthData.revenue,
        status: monthData.status,
        taxableAmount: inrFormat(monthData.taxableAmount),
        gst: inrFormat(monthData.gst),
      }));

  return (
    <div className="flex flex-col gap-4">
      <YearlyGraph
        title={"ANNUAL MONTHLY WORKATION REVENUES"}
        titleAmount={`INR ${inrFormat(totalActual)}`}
        data={series}
        options={options}
        dateKey={"dateKey"}
      />
      <WidgetTable
        data={tableData}
        tableTitle={"Monthly Revenue with Client Details"}
        totalKey="taxableAmount"
        dateColumn={"date"}
        columns={[
          { headerName: "Sr No", field: "srNo", flex: 1 },
          { headerName: "Client Name", field: "clientName", flex: 1 },

          {
            headerName: "Taxable (INR)",
            field: "taxableAmount",
            flex: 1,
            valueFormatter: ({ value }) =>
              typeof value === "number"
                ? value.toLocaleString()
                : `${value ?? ""}`,
          },
          {
            headerName: "GST (INR)",
            field: "gst",
            flex: 1,
            valueFormatter: ({ value }) =>
              typeof value === "number"
                ? value.toLocaleString()
                : `${value ?? ""}`,
          },
          {
            headerName: "Total (INR)",
            field: "totalAmount",
            flex: 1,
            valueFormatter: ({ value }) =>
              typeof value === "number"
                ? value.toLocaleString()
                : `${value ?? ""}`,
          },
          {
            headerName: "Status",
            field: "status",
            flex: 1,
            pinned: "right",
            cellRenderer: (params) => (
              <StatusChip status={params.value ? params.value : "Unpaid"} />
            ),
          },
        ]}
      />
    </div>
  );
};

export default Workations;
