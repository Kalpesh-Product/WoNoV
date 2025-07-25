import { inrFormat } from "../../../utils/currencyFormat";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import WidgetTable from "../../../components/Tables/WidgetTable";
import StatusChip from "../../../components/StatusChip";
import FyBarGraph from "../../../components/graphs/FyBarGraph";

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
    colors: ["#54C4A7", "#EB5C45"],
    // noData: {
    //   text: "", // Text to show when no data is available
    //   align: "center", // Position of the text
    //   verticalAlign: "middle", // Vertical alignment of the text
    //   offsetX: 0, // Horizontal offset
    //   offsetY: 0, // Vertical offset
    //   style: {
    //     fontSize: "20px",
    //     fontWeight: "bold",
    //     color: "#888", // Text color
    //   },
    // },
  };

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
      <FyBarGraph
        graphTitle="ANNUAL MONTHLY WORKATION REVENUES"
        data={isWorkationLoading ? [] : workationData}
        chartOptions={options}
        dateKey="date"
        valueKey="taxableAmount"
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
