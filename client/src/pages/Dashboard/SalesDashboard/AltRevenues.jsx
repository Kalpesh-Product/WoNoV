import { inrFormat } from "../../../utils/currencyFormat";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { CircularProgress } from "@mui/material";
import WidgetTable from "../../../components/Tables/WidgetTable";
import StatusChip from "../../../components/StatusChip";
import FyBarGraph from "../../../components/graphs/FyBarGraph";

const getNormalizedPaymentStatus = (status) =>
  String(status || "").trim().toLowerCase();

const getNumericAmount = (value) =>
  parseFloat(String(value || "0").replace(/,/g, "")) || 0;

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
          w?.globals?.seriesNames?.[seriesIndex] || "Alternate Revenue";
        const value = series?.[seriesIndex]?.[dataPointIndex] || 0;
        const color = w?.globals?.colors?.[seriesIndex] || "#1976D2";

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
        normalizedStatus: getNormalizedPaymentStatus(client.status),
      })),
    };
  });

  const flattenedRevenueData = tableData.flatMap((month) => month.clients);
  const graphData = isLoadingAlternateRevenue
    ? []
    : flattenedRevenueData
        .filter((item) => item.normalizedStatus === "paid")
        .map((item) => ({
          ...item,
          taxableAmount: getNumericAmount(item.taxableAmount),
          vertical: "Alternate Revenue",
        }));
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
          exportData
          titleAmountOverride=""
          titleAmountGreen={({ filteredData }) =>
            `INR ${inrFormat(
              filteredData.reduce((sum, item) => {
                if (item.normalizedStatus !== "paid") return sum;
                return sum + getNumericAmount(item.taxableAmount);
              }, 0)
            )}`
          }
          titleAmountRed={({ filteredData }) =>
            `INR ${inrFormat(
              filteredData.reduce((sum, item) => {
                if (item.normalizedStatus !== "unpaid") return sum;
                return sum + getNumericAmount(item.taxableAmount);
              }, 0)
            )}`
          }
          titleAmountTotal={({ rangeTotal }) => `INR ${inrFormat(rangeTotal)}`}
          greenTitle="Paid"
          redTitle="Unpaid"
          totalTitle="Total"
          summaryChipVariant="ticket"
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
