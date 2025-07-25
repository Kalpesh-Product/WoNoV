import { inrFormat } from "../../../utils/currencyFormat";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { CircularProgress } from "@mui/material";
import WidgetTable from "../../../components/Tables/WidgetTable";
import StatusChip from "../../../components/StatusChip";
import FyBarGraph from "../../../components/graphs/FyBarGraph";

const AltRevenues = () => {
  const axios = useAxiosPrivate();
  const { data: alternateRevenue = [], isLoading: isLoadingAlternateRevenue } =
    useQuery({
      queryKey: ["alternateRevenue"],
      queryFn: async () => {
        try {
          const response = await axios.get(`/api/sales/get-alternate-revenue`);
          return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
          throw new Error(error.response.data.message);
        }
      },
    });

  const graphData = isLoadingAlternateRevenue
    ? []
    : alternateRevenue.flatMap((item) => item.revenue);

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
        formatter: (val) => `${val.toLocaleString()} INR`,
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
    colors: ["#1976D2"],
  };

  const tableData = alternateRevenue.map((monthData, index) => {
    return {
      // revenue: `INR ${totalRevenue.toLocaleString()}`,
      clients: monthData.revenue.map((client, i) => ({
        ...client,
      })),
    };
  });

  const flattenedRevenueData = tableData.flatMap((month) => month.clients);
  return (
    <div className="flex flex-col gap-4">
      {isLoadingAlternateRevenue ? (
        <div className="flex h-72 justify-center items-center">
          <CircularProgress />
        </div>
      ) : (
        <FyBarGraph
          graphTitle="ANNUAL MONTHLY ALTERNATE REVENUES"
          chartOptions={options}
          data={graphData}
          dateKey="invoiceCreationDate"
          valueKey="taxableAmount"
        />
      )}

      {!isLoadingAlternateRevenue ? (
        <WidgetTable
          tableTitle={"Monthly Revenue with Source Details"}
          data={flattenedRevenueData}
          dateColumn={"invoiceCreationDate"}
          totalKey="taxableAmount"
          columns={[
            { headerName: "Sr No", field: "srNo", width: 100 },
            { headerName: "Particulars", field: "particulars", width: 350 },
            {
              headerName: "Taxable Amount (INR)",
              field: "taxableAmount",
              cellRenderer: (params) => inrFormat(params.value),
            },
            {
              headerName: "Invoice Creation Date",
              field: "invoiceCreationDate",
            },

            { headerName: "Invoice Paid Date", field: "invoicePaidDate" },
            {
              headerName: "GST (INR)",
              field: "gst",
              cellRenderer: (params) => inrFormat(params.value || 0),
            },

            {
              headerName: "Status",
              field: "status",
              pinned: "right",
              cellRenderer: (params) => <StatusChip status={params.value} />,
            },
          ]}
        />
      ) : (
        <div className="flex h-72 justify-center items-center">
          <CircularProgress />
        </div>
      )}
    </div>
  );
};

export default AltRevenues;
