import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@mui/material";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import {
  MdAssignmentInd,
  MdAutorenew,
  MdGroups,
  MdOutlineRemoveRedEye,
  MdPersonAddAlt1,
  MdPersonOff,
  MdShoppingBag,
  MdTrendingDown,
  MdTrendingUp,
} from "react-icons/md";
import { SiGoogleadsense } from "react-icons/si";
import {
  LuChartNoAxesCombined as ChartNoAxesCombined,
  LuChartPie as ChartPie,
} from "react-icons/lu";
import alternateChannelBanner from "../../../../assets/alternate-channel-banner.png";
import AgTable from "../../../../components/AgTable";
import DashboardPopupMenu from "../../../../components/DashboardPopupMenu";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import FyBarGraph from "../../../../components/graphs/FyBarGraph";
import MuiModal from "../../../../components/MuiModal";
import PieChartMui from "../../../../components/graphs/PieChartMui";
import StatusChip from "../../../../components/StatusChip";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";
import WidgetSection from "../../../../components/WidgetSection";
import LeadsLayout from "../ViewClients/LeadsLayout";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import useBannerMenuAlignment from "../../../../hooks/useBannerMenuAlignment";
import useUserPermissions from "../../../../hooks/useUserPermissions";
import { PERMISSIONS } from "../../../../constants/permissions";
import { inrFormat } from "../../../../utils/currencyFormat";

const getAmount = (value) =>
  Number(String(value ?? "0").replace(/,/g, "")) || 0;

const getClientName = (row) =>
  String(row?.name || row?.clientName || row?.clientInvoiceName || "")
    .trim()
    .toLowerCase();

const getRevenueDate = (row) =>
  row?.invoiceCreationDate || row?.invoicePaidDate || row?.date;

const getFiscalYear = () => {
  const now = dayjs();
  const startYear = now.month() >= 3 ? now.year() : now.year() - 1;

  return {
    label: `FY ${startYear}-${String(startYear + 1).slice(-2)}`,
    start: dayjs().year(startYear).month(3).startOf("month"),
    end: dayjs().year(startYear + 1).month(3).startOf("month"),
  };
};

const AlternateBarsIcon = () => (
  <span className="flex h-8 w-8 items-end justify-center gap-1">
    <span className="h-3 w-1.5 rounded-full bg-current" />
    <span className="h-5 w-1.5 rounded-full bg-current" />
    <span className="h-7 w-1.5 rounded-full bg-current" />
  </span>
);

const BiznestTitle = () => (
  <span
    aria-label="BIZNest"
    className="inline-flex shrink-0 items-baseline whitespace-nowrap leading-none text-[#2a2525]"
  >
    <span>BI</span>
    <span className="text-[#e33434]">Z</span>
    <span>
      &nbsp;N<span className="lowercase">est</span>
    </span>
  </span>
);

const buildAlternateRevenueGraphData = (revenueRows, fiscalYear) => {
  const currentMonth = dayjs().startOf("month");
  const fiscalMonths = Array.from({ length: 12 }, (_, index) =>
    fiscalYear.start.add(index, "month"),
  );
  const paidRevenueByMonth = new Map();

  revenueRows.forEach((row) => {
    const revenueDate = dayjs(
      row?.invoiceCreationDate || row?.invoicePaidDate || row?.date,
    );
    if (
      String(row?.status || "").trim().toLowerCase() !== "paid" ||
      !revenueDate.isValid() ||
      revenueDate.isBefore(fiscalYear.start) ||
      !revenueDate.isBefore(fiscalYear.end)
    ) {
      return;
    }

    const monthKey = revenueDate.format("YYYY-MM");
    paidRevenueByMonth.set(
      monthKey,
      (paidRevenueByMonth.get(monthKey) || 0) +
        getAmount(row?.taxableAmount),
    );
  });

  const isActualMonthAvailable = (month) =>
    !currentMonth.isBefore(month.startOf("month").add(2, "month"), "month");
  const latestActualIndex = fiscalMonths.reduce(
    (latest, month, index) =>
      isActualMonthAvailable(month) ? index : latest,
    -1,
  );
  if (latestActualIndex < 0) return [];

  const actualAmounts = fiscalMonths
    .slice(0, latestActualIndex + 1)
    .map((month) => paidRevenueByMonth.get(month.format("YYYY-MM")) || 0);
  const averageRevenue = actualAmounts.length
    ? actualAmounts.reduce((total, amount) => total + amount, 0) /
      actualAmounts.length
    : 0;

  return fiscalMonths.flatMap((month, index) => {
    const amount = paidRevenueByMonth.get(month.format("YYYY-MM")) || 0;
    if (index <= latestActualIndex && amount > 0) {
      return [
        {
          graphDate: month.toISOString(),
          reportingAmount: amount,
          vertical: "Revenue Booked",
        },
      ];
    }
    if (index > latestActualIndex && averageRevenue > 0) {
      return [
        {
          graphDate: month.toISOString(),
          reportingAmount: averageRevenue,
          vertical: "Balance KRA Target",
        },
      ];
    }
    return [];
  });
};

const AlternateRevenueGraph = ({
  graphData,
  revenueRows,
  fiscalYear,
  isLoading,
}) => {
  const projectionTotal = graphData.reduce(
    (total, row) => total + getAmount(row?.reportingAmount),
    0,
  );
  const axisUnit = useMemo(() => {
    const highestAmount = Math.max(
      0,
      ...graphData.map((row) => getAmount(row?.reportingAmount)),
    );

    if (highestAmount >= 10000000) {
      return { divisor: 10000000, label: "Crores" };
    }
    if (highestAmount >= 100000) {
      return { divisor: 100000, label: "Lakhs" };
    }
    if (highestAmount >= 1000) {
      return { divisor: 1000, label: "Thousands" };
    }
    return { divisor: 1, label: "INR" };
  }, [graphData]);
  const monthlyClientCounts = useMemo(() => {
    const currentMonth = dayjs().startOf("month");
    const fiscalMonths = Array.from({ length: 12 }, (_, index) =>
      fiscalYear.start.add(index, "month"),
    );
    const actualClientsByMonth = new Map(
      fiscalMonths.map((month) => [month.format("YYYY-MM"), new Set()]),
    );

    revenueRows.forEach((row) => {
      const revenueDate = dayjs(getRevenueDate(row));
      const clientName = getClientName(row);
      if (
        String(row?.status || "").trim().toLowerCase() !== "paid" ||
        !clientName ||
        !revenueDate.isValid() ||
        revenueDate.isBefore(fiscalYear.start) ||
        !revenueDate.isBefore(fiscalYear.end)
      ) {
        return;
      }

      actualClientsByMonth
        .get(revenueDate.format("YYYY-MM"))
        ?.add(clientName);
    });

    const isActualMonthAvailable = (month) =>
      !currentMonth.isBefore(month.add(2, "month"), "month");
    const elapsedMonths = fiscalMonths.filter(isActualMonthAvailable).length;
    const totalActualClients = fiscalMonths.reduce(
      (total, month) =>
        isActualMonthAvailable(month)
          ? total +
            (actualClientsByMonth.get(month.format("YYYY-MM"))?.size || 0)
          : total,
      0,
    );
    const projectedClientCount =
      elapsedMonths && totalActualClients
        ? Math.max(1, Math.round(totalActualClients / elapsedMonths))
        : 0;

    return fiscalMonths.map((month) =>
      isActualMonthAvailable(month)
        ? actualClientsByMonth.get(month.format("YYYY-MM"))?.size || 0
        : projectedClientCount,
    );
  }, [fiscalYear.end, fiscalYear.start, revenueRows]);
  const chartOptions = useMemo(
    () => ({
      dataLabels: {
        enabled: true,
        formatter: (value) =>
          Number(Number(value) / axisUnit.divisor).toLocaleString("en-IN", {
            maximumFractionDigits: 2,
          }),
        style: {
          fontSize: "10px",
          fontWeight: "bold",
          colors: ["#1E3D73"],
        },
        offsetY: -22,
      },
      yaxis: {
        min: 0,
        title: {
          text:
            axisUnit.label === "INR"
              ? "Amount (INR)"
              : `Amount In ${axisUnit.label} (INR)`,
          style: { color: "#1E3D73" },
        },
        labels: {
          style: { colors: "#1E3D73" },
          formatter: (value) =>
            Number(value / axisUnit.divisor).toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            }),
        },
      },
      xaxis: { labels: { style: { colors: "#1E3D73" } } },
      tooltip: {
        enabled: true,
        custom: ({ series, seriesIndex, dataPointIndex, w }) => {
          const label =
            w?.globals?.categoryLabels?.[dataPointIndex] ||
            w?.config?.xaxis?.categories?.[dataPointIndex] ||
            "";
          const seriesName =
            w?.globals?.seriesNames?.[seriesIndex] || "Alternate";
          const value = series?.[seriesIndex]?.[dataPointIndex] || 0;
          const color = w?.globals?.colors?.[seriesIndex] || "#3cb37180";
          const revenueLabel =
            seriesName === "Balance KRA Target"
              ? "Projected Revenue"
              : "Booked Revenue";

          return `<div style="min-width:160px;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 14px rgba(15,23,42,.18);border:1px solid #e5e7eb;"><div style="background:#eef2f6;color:#1f2937;font-size:12px;padding:8px 12px;border-bottom:1px solid #dbe1e8;">${label}</div><div style="display:flex;align-items:center;gap:8px;padding:10px 12px;font-size:12px;color:#111827;"><span style="width:12px;height:12px;border-radius:999px;background:${color};display:inline-block;"></span><span>${revenueLabel}:</span><span style="font-weight:700;">INR ${inrFormat(value)}</span></div><div style="display:flex;align-items:center;gap:8px;padding:0 12px 10px;font-size:12px;color:#111827;"><span aria-hidden="true">&#128101;</span><span>Alternate Client:</span><span style="font-weight:700;">${monthlyClientCounts[dataPointIndex] || 0}</span></div></div>`;
        },
      },
      plotOptions: {
        bar: {
          columnWidth: "40%",
          borderRadius: 5,
          dataLabels: { position: "top" },
        },
      },
      legend: { labels: { colors: "#1E3D73" } },
      colors: ["#3cb37180", "#787878"],
    }),
    [axisUnit, monthlyClientCounts],
  );

  if (isLoading) return <Skeleton height={500} width="100%" />;

  return (
    <FyBarGraph
      chartId="alternate-dashboard-revenues"
      graphTitle={
        <div className="inline-flex items-baseline gap-2 whitespace-nowrap leading-none text-[#1E3D73]">
          <BiznestTitle />
          <span>ALTERNATE REVENUES - {fiscalYear.label}</span>
        </div>
      }
      data={graphData}
      dateKey="graphDate"
      valueKey="reportingAmount"
      chartOptions={chartOptions}
      selectedFY={fiscalYear.label}
      disableHoverCrosshair
      hideYearNavigation
      borderColor="#1E3D73"
      bodyBorderColor="#9FB2CF"
      headerRightContent={
        <div className="flex items-center justify-center gap-2 rounded-lg border border-[#aec6fb] bg-[#dbe4ff] px-3 py-2 text-body font-pmedium uppercase text-[#274784]">
          <span>Projection:</span>
          <span>{inrFormat(projectionTotal)}</span>
        </div>
      }
    />
  );
};

const AlternateUniqueClientsGraph = ({
  revenueRows,
  fiscalYear,
  onCountChange,
}) => {
  const actualMonthLag = 2;
  const projectedClientsPerMonth = useMemo(() => {
    const currentMonth = dayjs().startOf("month");
    const actualMonths = Array.from({ length: 12 }, (_, index) =>
      fiscalYear.start.add(index, "month"),
    ).filter(
      (month) =>
        !currentMonth.isBefore(month.add(actualMonthLag, "month"), "month"),
    );
    const actualClientsByMonth = new Map(
      actualMonths.map((month) => [month.format("YYYY-MM"), new Set()]),
    );

    revenueRows.forEach((row) => {
      const revenueDate = dayjs(
        row?.invoiceCreationDate || row?.invoicePaidDate || row?.date,
      );
      const clientName = getClientName(row);
      const monthKey = revenueDate.format("YYYY-MM");
      if (
        String(row?.status || "").trim().toLowerCase() !== "paid" ||
        !clientName ||
        !revenueDate.isValid() ||
        !actualClientsByMonth.has(monthKey)
      ) {
        return;
      }

      actualClientsByMonth.get(monthKey).add(clientName);
    });

    const totalActualClients = [...actualClientsByMonth.values()].reduce(
      (total, clients) => total + clients.size,
      0,
    );
    if (!actualMonths.length || !totalActualClients) return 0;

    return Math.max(
      1,
      Math.round(totalActualClients / actualMonths.length),
    );
  }, [actualMonthLag, fiscalYear, revenueRows]);
  const clientsByMonth = useMemo(() => {
    const grouped = {};
    const seenClientsByMonth = new Map();
    const currentMonth = dayjs().startOf("month");
    const fiscalMonths = Array.from({ length: 12 }, (_, index) =>
      fiscalYear.start.add(index, "month"),
    );
    const isActualMonth = (month) =>
      !currentMonth.isBefore(month.add(actualMonthLag, "month"), "month");

    [...revenueRows]
      .sort((first, second) =>
        dayjs(first?.invoiceCreationDate || first?.invoicePaidDate).diff(
          dayjs(second?.invoiceCreationDate || second?.invoicePaidDate),
        ),
      )
      .forEach((row) => {
        const revenueDate = dayjs(
          row?.invoiceCreationDate || row?.invoicePaidDate || row?.date,
        );
        const clientName = getClientName(row);
        if (
          String(row?.status || "").trim().toLowerCase() !== "paid" ||
          !clientName ||
          !revenueDate.isValid() ||
          revenueDate.isBefore(fiscalYear.start) ||
          !revenueDate.isBefore(fiscalYear.end)
        ) {
          return;
        }

        const monthKey = revenueDate.format("YYYY-MM");
        if (!seenClientsByMonth.has(monthKey)) {
          seenClientsByMonth.set(monthKey, new Set());
        }
        if (seenClientsByMonth.get(monthKey).has(clientName)) return;
        seenClientsByMonth.get(monthKey).add(clientName);
        grouped[monthKey] ||= [];
        grouped[monthKey].push({
          client: row?.name || row?.clientName || row?.clientInvoiceName,
          typeOfClient: "Workation",
          date: revenueDate.format("YYYY-MM-DD"),
          paymentStatus: "Paid",
          invoiceId: row?._id || row?.id,
        });
      });

    fiscalMonths.forEach((month) => {
      if (isActualMonth(month) || projectedClientsPerMonth <= 0) return;
      const monthKey = month.format("YYYY-MM");
      grouped[monthKey] = Array.from(
        { length: projectedClientsPerMonth },
        (_, index) => ({
          client: `Projected Alternate Client ${index + 1}`,
          typeOfClient: "Workation",
          date: month.startOf("month").format("YYYY-MM-DD"),
          paymentStatus: "Projected",
          invoiceId: `projected-alternate-${monthKey}-${index + 1}`,
        }),
      );
    });

    return Object.entries(grouped).map(([month, clients]) => ({
      month,
      clients,
    }));
  }, [actualMonthLag, fiscalYear, projectedClientsPerMonth, revenueRows]);

  return (
    <LeadsLayout
      data={clientsByMonth}
      hideAccordion
      title={
        <div className="inline-flex items-baseline gap-2 whitespace-nowrap leading-none text-[#1E3D73]">
          <BiznestTitle />
          <span>ALTERNATE UNIQUE CLIENT COUNT - {fiscalYear.label}</span>
        </div>
      }
      titleAmount={({ count }) =>
        `TOTAL UNIQUE CLIENTS: ${count.toLocaleString("en-IN")}`
      }
      hideMonthAxisTitle
      noOuterPadding
      investorBlueStyle
      investorTitleAmountChip
      hideFinancialYearControls
      focusedClientSeries="Workation"
      virtualOfficeProjectedClientCount={projectedClientsPerMonth}
      actualMonthLag={actualMonthLag}
      virtualOfficeActualLegend="Actual Alternate Client"
      virtualOfficeProjectedLegend="Remaining KRA Target"
      virtualOfficeActualColor="#3cb37180"
      virtualOfficeProjectedColor="#787878"
      virtualOfficeTooltipLabel="Alternate Client"
      virtualOfficeDataLabelsAbove
      onSelectedFinancialYearClientsCountChange={onCountChange}
    />
  );
};

const AlternateOperationalCharts = ({
  revenueRows,
  fiscalYear,
  visibleCharts = ["newRepeat", "paymentStatus", "sector", "bookingSource"],
}) => {
  const actualCutoffLabel = dayjs()
    .startOf("month")
    .subtract(2, "month")
    .format("MMM-YY");
  const chartData = useMemo(() => {
    const currentMonth = dayjs().startOf("month");
    const financialYearRows = revenueRows.filter((row) => {
      const revenueDate = dayjs(getRevenueDate(row));
      return (
        revenueDate.isValid() &&
        !revenueDate.isBefore(fiscalYear.start) &&
        revenueDate.isBefore(fiscalYear.end)
      );
    });
    const paymentStatusRows = financialYearRows.filter((row) => {
      const revenueMonth = dayjs(getRevenueDate(row)).startOf("month");
      return !currentMonth.isBefore(revenueMonth.add(2, "month"), "month");
    });
    const isPaid = (row) =>
      String(row?.status || "Unpaid").trim().toLowerCase() === "paid";
    const paidAmount = paymentStatusRows.reduce(
      (total, row) =>
        isPaid(row) ? total + getAmount(row?.taxableAmount) : total,
      0,
    );
    const unpaidAmount = paymentStatusRows.reduce(
      (total, row) =>
        !isPaid(row) ? total + getAmount(row?.taxableAmount) : total,
      0,
    );
    const clientBookings = new Map();
    paymentStatusRows.forEach((row) => {
      const clientName = getClientName(row);
      if (!clientName) return;
      clientBookings.set(clientName, (clientBookings.get(clientName) || 0) + 1);
    });
    const groupRows = (fields) => {
      const grouped = new Map();
      financialYearRows.forEach((row) => {
        const value = fields
          .map((field) => row?.[field])
          .find((candidate) => String(candidate || "").trim());
        if (!value) return;
        const label = String(value).trim();
        grouped.set(label, (grouped.get(label) || 0) + 1);
      });
      return [...grouped.entries()].map(([label, value]) => ({ label, value }));
    };

    return {
      paymentStatus: [
        { label: "Paid", value: paidAmount },
        { label: "Unpaid", value: unpaidAmount },
      ],
      newRepeat: [
        {
          label: "New Clients",
          value: [...clientBookings.values()].filter((count) => count === 1)
            .length,
        },
        {
          label: "Repeat Clients",
          value: [...clientBookings.values()].filter((count) => count > 1)
            .length,
        },
      ],
      sector: groupRows(["sector", "clientSector", "businessSector"]),
      bookingSource: groupRows([
        "bookingSource",
        "source",
        "sourcingChannel",
        "channel",
      ]),
      totalPaid: paidAmount,
    };
  }, [fiscalYear.end, fiscalYear.start, revenueRows]);
  const definitions = {
    paymentStatus: {
      title: "ALTERNATE PAYMENT STATUS",
      data: chartData.paymentStatus,
      colors: ["#2186eb", "#f21f5b"],
      chip: `OVERALL PAID: ₹ ${inrFormat(chartData.totalPaid)}`,
    },
    newRepeat: {
      title: "ALTERNATE NEW VS REPEAT CLIENTS",
      data: chartData.newRepeat,
      colors: ["#13866f", "#ff8f1f"],
    },
    sector: {
      title: "ALTERNATE SECTOR WISE CLIENTS",
      data: chartData.sector,
      colors: ["#24467d", "#3385ee", "#22bba9", "#7548ce", "#9cb2cf"],
      needsData: chartData.sector.length === 0,
    },
    bookingSource: {
      title: "ALTERNATE BOOKING SOURCE",
      data: chartData.bookingSource,
      colors: ["#24467d", "#3385ee", "#ffba08", "#22bba9", "#7548ce"],
      needsData: chartData.bookingSource.length === 0,
    },
  };
  const renderChart = (key) => {
    const chart = definitions[key];
    const data = chart.data.filter((item) => Number(item.value) > 0);
    return (
      <WidgetSection
        key={key}
        title={
          <span className="inline-flex items-baseline gap-2 whitespace-nowrap text-[#1E3D73]">
            <BiznestTitle />
            <span>{chart.title}</span>
          </span>
        }
        border
        borderColor="#1E3D73"
        bodyBorderColor="#9FB2CF"
        autoHeight
        titleClassName="!text-[17px] min-[1700px]:!text-widgetTitle"
        headerContentClassName="lg:!h-10 !gap-4"
        headerRightContent={
          chart.chip ? (
            <span className="shrink-0 whitespace-nowrap rounded-lg border border-[#aec6fb] bg-[#dbe4ff] px-2 py-1.5 text-sm font-pmedium uppercase text-[#274784]">
              {chart.chip}
            </span>
          ) : null
        }
      >
        {data.length ? (
          <PieChartMui
            data={data}
            options={{
              chart: { type: "pie", fontFamily: "Poppins-Regular" },
              labels: data.map((item) => item.label),
              colors: chart.colors,
              legend: { show: true, labels: { colors: "#1E3D73" } },
              dataLabels: {
                formatter: (percentage) => `${percentage.toFixed(1)}%`,
              },
              tooltip: {
                y: {
                  formatter: (value) =>
                    key === "paymentStatus"
                      ? `INR ${inrFormat(value)} (Till ${actualCutoffLabel})`
                      : key === "newRepeat"
                        ? `${value} Clients (Till ${actualCutoffLabel})`
                        : `${value} Clients`,
                },
              },
            }}
            width={500}
            height={310}
            centerAlign
          />
        ) : (
          <div className="flex h-[310px] items-center justify-center text-sm text-[#7084a4]">
            {chart.needsData ? "Data field is not available yet" : "No data available"}
          </div>
        )}
      </WidgetSection>
    );
  };
  const selectedCharts = visibleCharts.filter((key) => definitions[key]);
  if (selectedCharts.length === 1) return renderChart(selectedCharts[0]);
  const leftCharts = selectedCharts.filter((key) =>
    ["paymentStatus", "newRepeat"].includes(key),
  );
  const rightCharts = selectedCharts.filter((key) =>
    ["sector", "bookingSource"].includes(key),
  );
  const columns = [leftCharts, rightCharts].filter((charts) => charts.length);

  return (
    <div className={`grid grid-cols-1 gap-4 ${columns.length > 1 ? "xl:grid-cols-2" : ""}`}>
      {columns.map((charts) => (
        <div key={charts.join("-")} className="flex flex-col gap-4">
          {charts.map(renderChart)}
        </div>
      ))}
    </div>
  );
};

const AlternateUnpaidInvoices = ({ revenueRows, fiscalYear, isLoading }) => {
  const [viewRow, setViewRow] = useState(null);
  const october = fiscalYear.start.add(6, "month");
  const november = fiscalYear.start.add(7, "month");
  const unpaidRows = useMemo(
    () =>
      revenueRows
        .filter((row) => {
          const date = dayjs(getRevenueDate(row));
          return (
            String(row?.status || "Unpaid").trim().toLowerCase() !== "paid" &&
            date.isValid() &&
            (date.isSame(october, "month") || date.isSame(november, "month"))
          );
        })
        .sort((a, b) => dayjs(getRevenueDate(a)).diff(dayjs(getRevenueDate(b))))
        .map((row, index) => ({
          ...row,
          srNo: index + 1,
          clientName: row?.name || row?.clientName || row?.clientInvoiceName || "-",
          taxableAmountLabel: inrFormat(getAmount(row?.taxableAmount)),
          gstLabel: inrFormat(getAmount(row?.gst)),
          totalAmountLabel: inrFormat(
            getAmount(row?.totalAmount) ||
              getAmount(row?.invoiceAmount) ||
              getAmount(row?.taxableAmount) + getAmount(row?.gst),
          ),
          revenueDateLabel: dayjs(getRevenueDate(row)).format("DD-MMM-YYYY"),
          statusLabel: "Unpaid",
        })),
    [november, october, revenueRows],
  );
  const getInvoiceTotal = (row) =>
    getAmount(row?.totalAmount) ||
    getAmount(row?.invoiceAmount) ||
    getAmount(row?.taxableAmount) + getAmount(row?.gst);
  const octoberTaxableTotal = unpaidRows
    .filter((row) => dayjs(getRevenueDate(row)).isSame(october, "month"))
    .reduce((total, row) => total + getAmount(row?.taxableAmount), 0);
  const novemberTaxableTotal = unpaidRows
    .filter((row) => dayjs(getRevenueDate(row)).isSame(november, "month"))
    .reduce((total, row) => total + getAmount(row?.taxableAmount), 0);
  const columns = [
    { field: "srNo", headerName: "Sr.No", width: 90 },
    { field: "clientName", headerName: "Client Name", flex: 1.1 },
    { field: "particulars", headerName: "Particulars", flex: 1.3 },
    { field: "taxableAmountLabel", headerName: "Taxable (INR)", flex: 0.9 },
    { field: "gstLabel", headerName: "GST (INR)", flex: 0.8 },
    { field: "totalAmountLabel", headerName: "Total (INR)", flex: 0.9 },
    { field: "revenueDateLabel", headerName: "Revenue Date", flex: 1 },
    {
      field: "statusLabel",
      headerName: "Status",
      pinned: "right",
      flex: 0.8,
      cellRenderer: (params) => <StatusChip status={params.value} />,
    },
    {
      field: "actions",
      headerName: "Action",
      width: 150,
      pinned: "right",
      sortable: false,
      filter: false,
      cellRenderer: (params) => (
        <div className="flex h-full items-center gap-2">
          <button
            type="button"
            onClick={() => setViewRow(params.data)}
            aria-label={`View ${params.data?.clientName || "client"} invoice`}
            className="rounded-lg bg-[#eaf4ff] p-2 text-[#1E3D73]"
          >
            <MdOutlineRemoveRedEye size={18} />
          </button>
          <ThreeDotMenu
            rowId={params.data?._id || params.data?.id}
            buttonSx={{
              color: "#1E3D73",
              backgroundColor: "#eaf4ff",
              borderRadius: 2,
            }}
            menuItems={[
              {
                label: "Update",
                onClick: () => {},
                disabled: true,
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <WidgetSection
        normalCase
        title={
          <Link
            to="/app/dashboard/sales-dashboard/alternate-channel/unpaid-invoices"
            className="inline-flex items-baseline gap-2 leading-none text-[#1E3D73]"
          >
            <BiznestTitle />
            <span>
              ALTERNATE {fiscalYear.label} - UNPAID INVOICES IN OCTOBER - NOVEMBER
            </span>
          </Link>
        }
        border
        borderColor="#1E3D73"
        bodyBorderColor="#9FB2CF"
        headerRightContent={
          <div className="flex flex-wrap items-center justify-end gap-3 text-sm font-pmedium uppercase">
            <span className="rounded-lg border border-[#a9ddba] bg-[#d8f0df] px-3 py-2 text-[#16784d]">
              OCT: {inrFormat(octoberTaxableTotal)}
            </span>
            <span className="rounded-lg border border-[#aec6fb] bg-[#dbe4ff] px-3 py-2 text-[#274784]">
              NOV: {inrFormat(novemberTaxableTotal)}
            </span>
          </div>
        }
      >
        <div
          className="text-[#1E3D73] [&_.ag-cell]:!text-[#1E3D73] [&_.ag-header-cell-text]:!text-[#1E3D73] [&_.ag-icon]:!text-[#1E3D73] [&_.ag-paging-panel]:!text-[#1E3D73] [&_.MuiChip-label]:!text-[#1E3D73] [&_.MuiInputBase-input]:!text-[#1E3D73] [&_.MuiInputLabel-root]:!text-[#1E3D73] [&_button]:!text-[#1E3D73]"
          style={{
            "--ag-foreground-color": "#1E3D73",
            "--ag-header-foreground-color": "#1E3D73",
            "--ag-icon-color": "#1E3D73",
          }}
        >
          <AgTable
            hideTitle
            data={unpaidRows}
            columns={columns}
            search
            hideFilter
            showDateControls={false}
            loading={isLoading}
          />
        </div>
      </WidgetSection>

      {viewRow && (
        <MuiModal
          open
          onClose={() => setViewRow(null)}
          title={
            <span className="text-[#1E3D73]">
              View Alternate Invoice Details
            </span>
          }
          widthClass="w-[min(92vw,820px)]"
        >
          <div className="flex flex-col gap-8 px-1 py-2 text-[#1E3D73]">
            <section className="space-y-3">
              <h3 className="text-lg font-pmedium">Customer Details</h3>
              <div className="space-y-2">
                <DetalisFormatted
                  gap="w-64 shrink-0"
                  title="Client Name"
                  detail={viewRow.clientName || "—"}
                />
                <DetalisFormatted
                  gap="w-64 shrink-0"
                  title="Client Invoice Name"
                  detail={viewRow.clientInvoiceName || viewRow.clientName || "—"}
                />
                <DetalisFormatted
                  gap="w-64 shrink-0"
                  title="Particulars"
                  detail={viewRow.particulars || "—"}
                />
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-pmedium">Payment Details</h3>
              <div className="space-y-2">
                <DetalisFormatted
                  gap="w-64 shrink-0"
                  title="Taxable Amount"
                  detail={`INR ${inrFormat(getAmount(viewRow.taxableAmount))}`}
                />
                <DetalisFormatted
                  gap="w-64 shrink-0"
                  title="GST %"
                  detail={
                    getAmount(viewRow.taxableAmount)
                      ? `${Number(
                          (
                            (getAmount(viewRow.gst) /
                              getAmount(viewRow.taxableAmount)) *
                            100
                          ).toFixed(2),
                        )}%`
                      : "—"
                  }
                />
                <DetalisFormatted
                  gap="w-64 shrink-0"
                  title="GST Amount"
                  detail={`INR ${inrFormat(getAmount(viewRow.gst))}`}
                />
                <DetalisFormatted
                  gap="w-64 shrink-0"
                  title="Total Amount"
                  detail={`INR ${inrFormat(getInvoiceTotal(viewRow))}`}
                />
                <DetalisFormatted
                  gap="w-64 shrink-0"
                  title="Revenue Collection Date"
                  detail={
                    dayjs(getRevenueDate(viewRow)).isValid()
                      ? dayjs(getRevenueDate(viewRow)).format("DD-MM-YYYY")
                      : "—"
                  }
                />
              </div>
            </section>
          </div>
        </MuiModal>
      )}
    </>
  );
};

const AlternateSummaryCards = ({
  cardView,
  fiscalYear,
  summary,
  isLoading,
  hasPermission,
}) => {
  const cards = [
    {
      key: "annualRevenueTarget",
      title: "Annual Revenue Target",
      value: inrFormat(summary.annualTarget),
      permission:
        PERMISSIONS.SALES_VERTICAL_ALTERNATE_ANNUAL_REVENUE_TARGET_CARD.value,
      icon: MdTrendingUp,
      iconClass: "bg-[#eafbf3] text-[#12a573]",
      valueClass: "text-[#1E3D73]",
    },
    {
      key: "revenueBooked",
      title: "Revenue Booked",
      value: inrFormat(summary.booked),
      permission:
        PERMISSIONS.SALES_VERTICAL_ALTERNATE_REVENUE_BOOKED_CARD.value,
      icon: AlternateBarsIcon,
      iconClass: "bg-[#ecf9ff] text-[#13a573]",
      valueClass: "text-[#13a573]",
    },
    {
      key: "revenueDue",
      title: "Revenue Due",
      value: inrFormat(summary.due),
      permission: PERMISSIONS.SALES_VERTICAL_ALTERNATE_REVENUE_DUE_CARD.value,
      icon: ChartNoAxesCombined,
      iconClass: "bg-[#fff0f5] text-[#f04a4a]",
      valueClass: "text-[#f04a4a]",
    },
    {
      key: "averagePrice",
      title: "Average Alternate Price",
      value: inrFormat(summary.averagePrice),
      permission:
        PERMISSIONS.SALES_VERTICAL_ALTERNATE_AVERAGE_PRICE_CARD.value,
      icon: ChartPie,
      iconClass: "bg-[#eaf0f8] text-[#3F6291]",
      valueClass: "text-[#1E3D73]",
    },
    {
      key: "activeUniqueCustomers",
      title: "Active Unique Customers",
      value: summary.activeUniqueCustomers.toLocaleString("en-IN"),
      permission:
        PERMISSIONS.SALES_VERTICAL_ALTERNATE_ACTIVE_UNIQUE_CUSTOMERS_CARD.value,
      icon: MdGroups,
      iconClass: "bg-[#eaf0f8] text-[#3F6291]",
      valueClass: "text-[#1E3D73]",
    },
    {
      key: "repeatClients",
      title: "Repeat Client",
      value: summary.repeatClients.toLocaleString("en-IN"),
      permission:
        PERMISSIONS.SALES_VERTICAL_ALTERNATE_REPEAT_CLIENT_CARD.value,
      icon: MdAutorenew,
      iconClass: "bg-[#eaf0f8] text-[#3F6291]",
      valueClass: "text-[#1E3D73]",
    },
    {
      key: "deadUniqueClients",
      title: "Dead Unique Clients",
      value: summary.deadUniqueClients.toLocaleString("en-IN"),
      permission:
        PERMISSIONS.SALES_VERTICAL_ALTERNATE_DEAD_UNIQUE_CLIENTS_CARD.value,
      icon: MdPersonOff,
      iconClass: "bg-[#fff0f5] text-[#f04a4a]",
      valueClass: "text-[#f04a4a]",
    },
    {
      key: "averageShortfallSurplus",
      title: "Average Shortfall / Surplus",
      value: `${inrFormat(Math.abs(summary.averageShortfallSurplus))} ${
        summary.averageShortfallSurplus > 0
          ? "Surplus"
          : summary.averageShortfallSurplus < 0
            ? "Shortfall"
            : "On Target"
      }`,
      permission:
        PERMISSIONS.SALES_VERTICAL_ALTERNATE_AVERAGE_SHORTFALL_SURPLUS_CARD
          .value,
      icon: MdTrendingDown,
      iconClass:
        summary.averageShortfallSurplus >= 0
          ? "bg-[#eafbf3] text-[#12a573]"
          : "bg-[#fff0f0] text-[#f04a4a]",
      valueClass:
        summary.averageShortfallSurplus >= 0
          ? "text-[#13a573]"
          : "text-[#f04a4a]",
    },
  ];
  const visibleCards = cards.filter(
    (card) =>
      hasPermission(card.permission) &&
      (!cardView || card.key === cardView),
  );

  if (!visibleCards.length) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {visibleCards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.key}
            className="flex min-h-[108px] items-center gap-4 rounded-lg border border-[#e8ecf4] bg-white px-5 py-4 text-left shadow-sm"
          >
            <span
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${card.iconClass}`}
            >
              <Icon size={34} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="mb-1 block text-sm font-pregular leading-tight text-[#1E3D73]">
                {card.title}
              </span>
              <span className="mb-2 block text-xs font-semibold text-[#58709A]">
                {fiscalYear.label}
              </span>
              <span
                className={`mt-1 block text-lg font-pmedium ${card.valueClass}`}
              >
                {isLoading ? "—" : card.value}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
};

const AlternateChannelDashboard = ({
  cardView = null,
  revenueOnly = false,
  uniqueClientsOnly = false,
  operationalChartView = null,
  unpaidInvoicesOnly = false,
}) => {
  const { headingRef, navigationRef, navigationStyle } =
    useBannerMenuAlignment();
  const axios = useAxiosPrivate();
  const { hasPermission } = useUserPermissions();
  const fiscalYear = useMemo(() => getFiscalYear(), []);
  const [graphUniqueClientCount, setGraphUniqueClientCount] = useState(null);
  const menuCards = [
    {
      title: "Onboard New Alternate Customers",
      icon: MdPersonAddAlt1,
      openRoute:
        "/app/dashboard/sales-dashboard/alternate-channel/onboard-new-customers",
      items: [],
    },
    {
      title: "Overall Alternate Summary",
      icon: MdAssignmentInd,
      openRoute:
        "/app/dashboard/sales-dashboard/alternate-channel/overall-summary",
      items: [],
    },
    {
      title: "Mix Bag",
      icon: MdShoppingBag,
      openRoute: "/app/dashboard/sales-dashboard/alternate-channel/mix-bag",
      items: [],
    },
    {
      title: "Data",
      icon: SiGoogleadsense,
      openRoute: "/app/dashboard/sales-dashboard/alternate-channel/data",
      items: [],
    },
  ];
  const { data: alternateRevenue = [], isLoading } = useQuery({
    queryKey: ["alternateRevenue"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/get-alternate-revenue");
      return Array.isArray(response.data) ? response.data : [];
    },
  });
  const revenueRows = useMemo(
    () =>
      alternateRevenue.flatMap((monthData) =>
        Array.isArray(monthData?.revenue)
          ? monthData.revenue
          : [monthData],
      ),
    [alternateRevenue],
  );
  const revenueGraphData = useMemo(
    () => buildAlternateRevenueGraphData(revenueRows, fiscalYear),
    [fiscalYear, revenueRows],
  );
  const summary = useMemo(() => {
    const revenueTotals = revenueGraphData.reduce(
      (totals, row) => {
        const amount = getAmount(row?.reportingAmount);
        if (row?.vertical === "Balance KRA Target") totals.due += amount;
        else totals.booked += amount;
        return totals;
      },
      { booked: 0, due: 0 },
    );
    const financialYearRows = revenueRows.filter((row) => {
      const revenueDate = dayjs(
        row?.invoiceCreationDate || row?.invoicePaidDate || row?.date,
      );

      return (
        revenueDate.isValid() &&
        !revenueDate.isBefore(fiscalYear.start) &&
        revenueDate.isBefore(fiscalYear.end)
      );
    });
    const paidClientNames = new Set();
    const allClientNames = new Set();
    const actualClientBookings = new Map();
    const actualPaidClientsByMonth = new Map();
    const currentMonth = dayjs().startOf("month");

    financialYearRows.forEach((row) => {
      const revenueDate = dayjs(getRevenueDate(row));
      const clientName = getClientName(row);
      const isPaid =
        String(row?.status || "Unpaid").trim().toLowerCase() === "paid";

      if (!clientName) return;
      allClientNames.add(clientName);
      const isActualMonth = !currentMonth.isBefore(
        revenueDate.startOf("month").add(2, "month"),
        "month",
      );
      if (isActualMonth) {
        actualClientBookings.set(
          clientName,
          (actualClientBookings.get(clientName) || 0) + 1,
        );
      }
      if (!isPaid) return;
      paidClientNames.add(clientName);
      if (isActualMonth) {
        const monthKey = revenueDate.format("YYYY-MM");
        if (!actualPaidClientsByMonth.has(monthKey)) {
          actualPaidClientsByMonth.set(monthKey, new Set());
        }
        actualPaidClientsByMonth.get(monthKey).add(clientName);
      }
    });

    const actualRevenueRows = revenueGraphData
      .filter((row) => row?.vertical === "Revenue Booked")
      .sort((first, second) =>
        dayjs(first?.graphDate).diff(dayjs(second?.graphDate)),
      );
    const latestActualRevenue = getAmount(
      actualRevenueRows.at(-1)?.reportingAmount,
    );
    const monthlyProjection = getAmount(
      revenueGraphData.find(
        (row) => row?.vertical === "Balance KRA Target",
      )?.reportingAmount,
    );
    const annualTarget = revenueTotals.booked + revenueTotals.due;
    const activeUniqueCustomers = [...actualPaidClientsByMonth.values()].reduce(
      (total, clients) => total + clients.size,
      0,
    );

    return {
      annualTarget,
      booked: revenueTotals.booked,
      due: revenueTotals.due,
      averagePrice: activeUniqueCustomers
        ? Math.round(revenueTotals.booked / activeUniqueCustomers)
        : 0,
      activeUniqueCustomers,
      repeatClients: [...actualClientBookings.values()].filter(
        (bookings) => bookings > 1,
      ).length,
      deadUniqueClients: [...allClientNames].filter(
        (clientName) => !paidClientNames.has(clientName),
      ).length,
      averageShortfallSurplus: Math.round(
        latestActualRevenue - monthlyProjection,
      ),
    };
  }, [fiscalYear.end, fiscalYear.start, revenueGraphData, revenueRows]);
  const synchronizedSummary = useMemo(() => {
    const activeUniqueCustomers =
      graphUniqueClientCount ?? summary.activeUniqueCustomers;

    return {
      ...summary,
      activeUniqueCustomers,
      averagePrice: activeUniqueCustomers
        ? Math.round(summary.booked / activeUniqueCustomers)
        : 0,
    };
  }, [graphUniqueClientCount, summary]);
  const canViewRevenueGraph = hasPermission(
    PERMISSIONS.SALES_VERTICAL_ALTERNATE_REVENUES_GRAPH.value,
  );
  const canViewUniqueClientsGraph = hasPermission(
    PERMISSIONS.SALES_VERTICAL_ALTERNATE_UNIQUE_CLIENT_COUNT_GRAPH.value,
  );
  const operationalChartPermissions = {
    newRepeat:
      PERMISSIONS.SALES_VERTICAL_ALTERNATE_NEW_VS_REPEAT_CLIENTS_GRAPH.value,
    paymentStatus:
      PERMISSIONS.SALES_VERTICAL_ALTERNATE_PAYMENT_STATUS_GRAPH.value,
    sector: PERMISSIONS.SALES_VERTICAL_ALTERNATE_SECTOR_WISE_CLIENTS_GRAPH.value,
    bookingSource:
      PERMISSIONS.SALES_VERTICAL_ALTERNATE_BOOKING_SOURCE_GRAPH.value,
  };
  const visibleOperationalCharts = Object.entries(operationalChartPermissions)
    .filter(([, permission]) => hasPermission(permission))
    .map(([chart]) => chart);
  const canViewUnpaidInvoices = hasPermission(
    PERMISSIONS.SALES_VERTICAL_ALTERNATE_UNPAID_INVOICES_TABLE.value,
  );

  if (revenueOnly) {
    if (!canViewRevenueGraph) return null;
    return (
      <div className="p-3 pt-3">
        <AlternateRevenueGraph
          graphData={revenueGraphData}
          revenueRows={revenueRows}
          fiscalYear={fiscalYear}
          isLoading={isLoading}
        />
      </div>
    );
  }

  if (uniqueClientsOnly) {
    if (!canViewUniqueClientsGraph) return null;
    return (
      <div className="p-3 pt-3">
        <AlternateUniqueClientsGraph
          revenueRows={revenueRows}
          fiscalYear={fiscalYear}
        />
      </div>
    );
  }

  if (operationalChartView) {
    if (!visibleOperationalCharts.includes(operationalChartView)) return null;
    return (
      <div className="p-3 pt-3">
        <AlternateOperationalCharts
          revenueRows={revenueRows}
          fiscalYear={fiscalYear}
          visibleCharts={[operationalChartView]}
        />
      </div>
    );
  }

  if (unpaidInvoicesOnly) {
    if (!canViewUnpaidInvoices) return null;
    return (
      <div className="p-3 pt-3">
        <AlternateUnpaidInvoices
          revenueRows={revenueRows}
          fiscalYear={fiscalYear}
          isLoading={isLoading}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-3 pt-3">
      <div className="overflow-hidden rounded-lg">
        <div className="relative h-56 w-full bg-black md:h-[17rem] xl:h-[19rem]">
          <img
            src={alternateChannelBanner}
            alt="Alternate Channel dashboard banner"
            className="h-full w-full object-contain object-right"
          />
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-[52%]"
            style={{
              background:
                "linear-gradient(to right, #fff 0%, #fff 76%, rgba(255,255,255,0.94) 82%, rgba(255,255,255,0.62) 89%, rgba(255,255,255,0.22) 95%, transparent 100%)",
            }}
          />
          <div className="absolute inset-y-0 left-0 flex w-[58%] flex-col px-1 py-4 sm:py-6">
            <p className="font-pregular text-xs uppercase tracking-[0.02em] text-[#1E3D73] sm:text-base lg:text-[15px] min-[1700px]:text-base min-[1900px]:text-lg">
              Alternate Dashboard
            </p>
            <h1 className="mt-6 max-w-full whitespace-nowrap font-serif text-3xl font-semibold leading-[0.9] text-[#1E3D73] drop-shadow-sm sm:mt-10 sm:text-5xl lg:origin-left lg:scale-x-90 lg:text-[38px] xl:text-[42px] min-[1700px]:text-[46px] min-[1900px]:scale-x-100 min-[1900px]:text-[50px]">
              <span ref={headingRef} className="inline-block whitespace-nowrap">
                ALTERNATE <span className="text-[#E64B4B]">DASHBOARD</span>
              </span>
            </h1>
            <p className="mt-5 max-w-full font-pmedium text-xl leading-[0.94] text-[#1E3D73] sm:mt-8 sm:text-3xl md:whitespace-nowrap lg:text-[35px] min-[1700px]:text-[39px] min-[1900px]:text-[46px]">
              Alternate Customers
            </p>
          </div>
          <nav
            ref={navigationRef}
            aria-label="Alternate Channel dashboard navigation"
            className="absolute bottom-0 left-0 z-10 flex w-fit max-w-[61%] items-end gap-6 overflow-x-auto px-1 sm:gap-8 lg:w-[44%] lg:max-w-none lg:justify-between lg:gap-2 min-[1700px]:w-fit min-[1700px]:max-w-[61%] min-[1700px]:gap-10"
            style={navigationStyle}
          >
            {["Annual KPA", "KRA", "Handbook", "Performance Summary"].map(
              (item) => (
                <Link
                  key={item}
                  to=""
                  className="group relative inline-flex shrink-0 items-center pb-0 pt-6 font-pmedium text-xs text-[#1E3D73] sm:text-sm min-[1700px]:text-base"
                >
                  {item}
                  <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-[#E64B4B] transition-transform duration-200 group-hover:scale-x-100" />
                </Link>
              ),
            )}
            <DashboardPopupMenu cards={menuCards} moduleLabel="Alternate" />
          </nav>
        </div>
      </div>
      <AlternateSummaryCards
        cardView={cardView}
        fiscalYear={fiscalYear}
        summary={synchronizedSummary}
        isLoading={isLoading}
        hasPermission={hasPermission}
      />
      {!cardView && canViewRevenueGraph && (
        <AlternateRevenueGraph
          graphData={revenueGraphData}
          revenueRows={revenueRows}
          fiscalYear={fiscalYear}
          isLoading={isLoading}
        />
      )}
      {!cardView && canViewUniqueClientsGraph && (
        <AlternateUniqueClientsGraph
          revenueRows={revenueRows}
          fiscalYear={fiscalYear}
          onCountChange={setGraphUniqueClientCount}
        />
      )}
      {!cardView && visibleOperationalCharts.length > 0 && (
        <AlternateOperationalCharts
          revenueRows={revenueRows}
          fiscalYear={fiscalYear}
          visibleCharts={visibleOperationalCharts}
        />
      )}
      {!cardView && canViewUnpaidInvoices && (
        <AlternateUnpaidInvoices
          revenueRows={revenueRows}
          fiscalYear={fiscalYear}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default AlternateChannelDashboard;
