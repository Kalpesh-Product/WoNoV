import { inrFormat } from "../../../utils/currencyFormat";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import WidgetTable from "../../../components/Tables/WidgetTable";
import StatusChip from "../../../components/StatusChip";
import FyBarGraph from "../../../components/graphs/FyBarGraph";

const getNormalizedPaymentStatus = (status) =>
  String(status || "").trim().toLowerCase();

const getNumericAmount = (value) =>
  parseFloat(String(value || "0").replace(/,/g, "")) || 0;

const getCurrentFinancialYearLabel = () => {
  const today = new Date();
  const startYear =
    today.getMonth() < 3 ? today.getFullYear() - 1 : today.getFullYear();

  return `FY ${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
};

const getFinancialYear = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;

  const startYear =
    date.getMonth() < 3 ? date.getFullYear() - 1 : date.getFullYear();

  return `FY ${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
};

const Workations = () => {
  const axios = useAxiosPrivate();
  const [selectedFY, setSelectedFY] = useState(
    getCurrentFinancialYearLabel(),
  );
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

  const tableData = useMemo(
    () =>
      isWorkationLoading
        ? []
        : workationData?.map((monthData) => ({
            ...monthData,
            clientName: monthData.nameOfClient,
            revenue: monthData.revenue,
            status: monthData.status,
            taxableAmount: getNumericAmount(monthData.taxableAmount),
            gst: getNumericAmount(monthData.gst),
            normalizedStatus: getNormalizedPaymentStatus(monthData.status),
          })),
    [isWorkationLoading, workationData],
  );

  const graphData = useMemo(
    () =>
      isWorkationLoading
        ? []
        : tableData
            .filter((item) => item.normalizedStatus === "paid")
            .map((item) => ({
              ...item,
              taxableAmount: getNumericAmount(item.taxableAmount),
              vertical: "Workation",
            })),
    [isWorkationLoading, tableData],
  );

  const selectedFiscalYearRevenue = useMemo(
    () =>
      graphData.filter((item) => getFinancialYear(item.date) === selectedFY),
    [graphData, selectedFY],
  );

  const maxWorkationAmount = useMemo(
    () =>
      selectedFiscalYearRevenue.reduce(
        (max, item) => Math.max(max, getNumericAmount(item.taxableAmount)),
        0,
      ),
    [selectedFiscalYearRevenue],
  );

  const useLakhsScale = maxWorkationAmount >= 100000;

  const options = useMemo(
    () => ({
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
        min: 0,
        title: {
          text: useLakhsScale ? "Amount In Lakhs (INR)" : "Amount (INR)",
        },
        labels: {
          formatter: (val) =>
            useLakhsScale
              ? `${Number(val / 100000).toLocaleString("en-IN", {
                  maximumFractionDigits: 1,
                })}`
              : `${Number(val).toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}`,
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
            w?.globals?.seriesNames?.[seriesIndex] || "Workation";
          const value = series?.[seriesIndex]?.[dataPointIndex] || 0;
          const color = w?.globals?.colors?.[seriesIndex] || "#54C4A7";

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
    }),
    [useLakhsScale],
  );

  return (
    <div className="flex flex-col gap-4">
      <FyBarGraph
        graphTitle="ANNUAL MONTHLY WORKATION REVENUES"
        data={graphData}
        chartOptions={options}
        dateKey="date"
        valueKey="taxableAmount"
        selectedFY={selectedFY}
        onSelectedFYChange={setSelectedFY}
      />
      <WidgetTable
        data={tableData}
        tableTitle={"Monthly Revenue with Client Details"}
        totalKey="taxableAmount"
        dateColumn={"date"}
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
