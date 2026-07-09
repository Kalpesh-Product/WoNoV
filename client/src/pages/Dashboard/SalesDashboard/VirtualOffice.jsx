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
import FyBarGraph from "../../../components/graphs/FyBarGraph";

const getNormalizedPaymentStatus = (status) => {
  if (typeof status === "string") return status.trim().toLowerCase();
  return status ? "paid" : "unpaid";
};

const getNumericAmount = (value) =>
  parseFloat(String(value || "0").replace(/,/g, "")) || 0;

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

  const options = {
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
    yaxis: {
      title: { text: "Amount In Lakhs (INR)" },
      labels: {
        formatter: (val) => val / 100000, // Display in Lakhs
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
          w?.globals?.seriesNames?.[seriesIndex] || "Virtual Office";
        const value = series?.[seriesIndex]?.[dataPointIndex] || 0;
        const color = w?.globals?.colors?.[seriesIndex] || "#11daf5";

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

  const tableData = isLoadingVirtualOfficeRevenue
    ? []
    : virtualOfficeRevenue.map((item) => ({
        ...item,
        clientName: item.client?.clientName,
        normalizedStatus: getNormalizedPaymentStatus(item.status),
      }));
  const graphData = isLoadingVirtualOfficeRevenue
    ? []
    : tableData
        .filter((item) => item.normalizedStatus === "paid")
        .map((item) => ({
          ...item,
          revenue: getNumericAmount(item.revenue),
          vertical: "Virtual Office",
        }));

  return (
    <div className="flex flex-col gap-4">
      {!isLoadingVirtualOfficeRevenue ? (
        <FyBarGraph
          graphTitle="ANNUAL MONTHLY VIRTUAL OFFICE REVENUES"
          data={graphData}
          dateKey="rentDate"
          valueKey="revenue"
          chartOptions={options}
        />
      ) : (
        <Skeleton height={"500px"} width={"100%"} />
      )}

      {!isLoadingVirtualOfficeRevenue ? (
        <WidgetTable
          tableTitle={"Monthly Revenue with Client Details"}
          data={tableData}
          totalKey="revenue"
          exportData
          dateColumn={"rentDate"}
          titleAmountOverride=""
          titleAmountGreen={({ filteredData }) =>
            `INR ${inrFormat(
              filteredData.reduce((sum, item) => {
                if (item.normalizedStatus !== "paid") return sum;
                return sum + getNumericAmount(item.revenue);
              }, 0)
            )}`
          }
          titleAmountRed={({ filteredData }) =>
            `INR ${inrFormat(
              filteredData.reduce((sum, item) => {
                if (item.normalizedStatus !== "unpaid") return sum;
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
              cellRenderer: (params) => (
                <StatusChip status={params.value ? "Paid" : "Unpaid"} />
              ),
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
