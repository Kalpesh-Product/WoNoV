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
import workationBanner from "../../../../assets/workation-banner.png";
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
  String(
    row?.client?.clientName ||
      row?.clientName ||
      row?.nameOfClient ||
      row?.clientInvoiceName ||
      "",
  ).trim();

const normalizeClientName = (row) => getClientName(row).toLowerCase();

const getFiscalYear = () => {
  const now = dayjs();
  const startYear = now.month() >= 3 ? now.year() : now.year() - 1;

  return {
    label: `FY ${startYear}-${String(startYear + 1).slice(-2)}`,
    start: dayjs().year(startYear).month(3).startOf("month"),
    end: dayjs().year(startYear + 1).month(3).startOf("month"),
  };
};

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

const WorkationBarsIcon = () => (
  <span className="flex h-8 w-8 items-end justify-center gap-1">
    <span className="h-3 w-1.5 rounded-full bg-current" />
    <span className="h-5 w-1.5 rounded-full bg-current" />
    <span className="h-7 w-1.5 rounded-full bg-current" />
  </span>
);

const buildWorkationRevenueGraphData = (revenueRows, fiscalYear) => {
  const currentMonth = dayjs().startOf("month");
  const fiscalMonths = Array.from({ length: 12 }, (_, index) =>
    fiscalYear.start.add(index, "month"),
  );
  const actualByMonth = new Map();

  revenueRows.forEach((row) => {
    const revenueDate = dayjs(row?.date);
    if (
      !revenueDate.isValid() ||
      revenueDate.isBefore(fiscalYear.start) ||
      !revenueDate.isBefore(fiscalYear.end)
    ) {
      return;
    }

    if (String(row?.status || "").trim().toLowerCase() !== "paid") {
      return;
    }

    const monthKey = revenueDate.format("YYYY-MM");
    const amount = getAmount(row?.taxableAmount);
    actualByMonth.set(monthKey, (actualByMonth.get(monthKey) || 0) + amount);
  });

  const isActualMonthAvailable = (month) =>
    !currentMonth.isBefore(month.startOf("month").add(2, "month"), "month");
  const latestActualIndex = fiscalMonths.reduce(
    (latestIndex, month, index) =>
      isActualMonthAvailable(month) ? index : latestIndex,
    -1,
  );

  if (latestActualIndex < 0) return [];

  const actualMonthAmounts = fiscalMonths
    .slice(0, latestActualIndex + 1)
    .map((month) => actualByMonth.get(month.format("YYYY-MM")) || 0);
  const totalActualRevenue = actualMonthAmounts.reduce(
    (total, amount) => total + amount,
    0,
  );
  const totalActualMonths = latestActualIndex + 1;
  const averageActualRevenue = totalActualMonths
    ? totalActualRevenue / totalActualMonths
    : 0;

  return fiscalMonths.flatMap((month, index) => {
    const actualAmount = actualByMonth.get(month.format("YYYY-MM")) || 0;

    if (index <= latestActualIndex && actualAmount > 0) {
      return [
        {
          graphDate: month.toISOString(),
          reportingAmount: actualAmount,
          vertical: "Revenue Booked",
        },
      ];
    }

    if (index > latestActualIndex && averageActualRevenue > 0) {
      return [
        {
          graphDate: month.toISOString(),
          reportingAmount: averageActualRevenue,
          vertical: "Balance KRA Target",
        },
      ];
    }

    return [];
  });
};

const WorkationRevenueGraph = ({
  graphData,
  revenueRows,
  fiscalYear,
  isLoading,
}) => {
  const projectionTotal = graphData.reduce(
    (total, row) => total + getAmount(row?.reportingAmount),
    0,
  );
  const axisScale = useMemo(() => {
    const highestValue = Math.max(
      0,
      ...graphData.map((item) => getAmount(item?.reportingAmount)),
    );
    if (highestValue <= 0) return { max: 600000, tickAmount: 3 };

    const rawStep = highestValue / 3;
    const magnitude = 10 ** Math.floor(Math.log10(rawStep));
    const normalizedStep = rawStep / magnitude;
    const niceFactor = [1, 2, 5, 10].find(
      (factor) => normalizedStep <= factor,
    );
    const step = (niceFactor || 10) * magnitude;
    const max = Math.max(
      step,
      Math.ceil(highestValue / step) * step + step,
    );

    return { max, tickAmount: Math.round(max / step) };
  }, [graphData]);
  const amountScale = useMemo(() => {
    const highestValue = Math.max(
      0,
      ...graphData.map((item) => getAmount(item?.reportingAmount)),
    );
    if (highestValue >= 10000000) {
      return { divisor: 10000000, title: "Amount In Crores (INR)" };
    }
    if (highestValue >= 100000) {
      return { divisor: 100000, title: "Amount In Lakhs (INR)" };
    }
    if (highestValue >= 1000) {
      return { divisor: 1000, title: "Amount In Thousands (INR)" };
    }
    return { divisor: 1, title: "Amount (INR)" };
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
      const revenueDate = dayjs(row?.date);
      const clientName = normalizeClientName(row);
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
      actualClientsByMonth.get(monthKey)?.add(clientName);
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
          Number(value / amountScale.divisor).toLocaleString("en-IN", {
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
        max: axisScale.max,
        tickAmount: axisScale.tickAmount,
        forceNiceScale: false,
        title: { text: amountScale.title, style: { color: "#1E3D73" } },
        labels: {
          style: { colors: "#1E3D73" },
          formatter: (value) =>
            Number(value / amountScale.divisor).toLocaleString("en-IN", {
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
            w?.globals?.seriesNames?.[seriesIndex] || "Workation";
          const value = series?.[seriesIndex]?.[dataPointIndex] || 0;
          const color = w?.globals?.colors?.[seriesIndex] || "#3cb37180";
          const revenueLabel =
            seriesName === "Balance KRA Target"
              ? "Projected Revenue"
              : "Booked Revenue";

          return `<div style="min-width:160px;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 14px rgba(15,23,42,.18);border:1px solid #e5e7eb;"><div style="background:#eef2f6;color:#1f2937;font-size:12px;padding:8px 12px;border-bottom:1px solid #dbe1e8;">${label}</div><div style="display:flex;align-items:center;gap:8px;padding:10px 12px;font-size:12px;color:#111827;"><span style="width:12px;height:12px;border-radius:999px;background:${color};display:inline-block;"></span><span>${revenueLabel}:</span><span style="font-weight:700;">INR ${inrFormat(value)}</span></div><div style="display:flex;align-items:center;gap:8px;padding:0 12px 10px;font-size:12px;color:#111827;"><span aria-hidden="true">&#128101;</span><span>Workation Client:</span><span style="font-weight:700;">${monthlyClientCounts[dataPointIndex] || 0}</span></div></div>`;
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
    [amountScale, axisScale, monthlyClientCounts],
  );

  if (isLoading) return <Skeleton height={500} width="100%" />;

  return (
    <FyBarGraph
      chartId="workation-dashboard-revenues"
      graphTitle={
        <div className="inline-flex items-baseline gap-2 whitespace-nowrap leading-none text-[#1E3D73]">
          <BiznestTitle />
          <span>WORKATION REVENUES - {fiscalYear.label}</span>
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

const WorkationUniqueClientsGraph = ({ revenueRows }) => {
  const fiscalYear = useMemo(() => getFiscalYear(), []);
  const projectedClientsPerMonth = useMemo(() => {
    const currentMonth = dayjs().startOf("month");
    const actualMonths = Array.from({ length: 12 }, (_, index) =>
      fiscalYear.start.add(index, "month"),
    ).filter(
      (month) => !currentMonth.isBefore(month.add(2, "month"), "month"),
    );
    const actualClientNames = new Set(
      revenueRows
        .filter((row) => {
          const revenueDate = dayjs(row?.date);
          return (
            String(row?.status || "").trim().toLowerCase() === "paid" &&
            revenueDate.isValid() &&
            !revenueDate.isBefore(fiscalYear.start) &&
            revenueDate.isBefore(fiscalYear.end) &&
            actualMonths.some((month) => month.isSame(revenueDate, "month"))
          );
        })
        .map(normalizeClientName)
        .filter(Boolean),
    );
    const totalActualClients = actualClientNames.size;

    if (!actualMonths.length || !totalActualClients) return 0;
    return Math.max(1, Math.round(totalActualClients / actualMonths.length));
  }, [fiscalYear, revenueRows]);
  const clientsByMonth = useMemo(() => {
    const grouped = {};
    const currentMonth = dayjs().startOf("month");
    const fiscalMonths = Array.from({ length: 12 }, (_, index) =>
      fiscalYear.start.add(index, "month"),
    );
    const isActualMonthAvailable = (month) =>
      !currentMonth.isBefore(month.add(2, "month"), "month");

    const seenClientNames = new Set();
    const sortedRevenueRows = [...revenueRows].sort((first, second) =>
      dayjs(first?.date).diff(dayjs(second?.date)),
    );

    sortedRevenueRows.forEach((row) => {
      const revenueDate = dayjs(row?.date);
      const clientName = normalizeClientName(row);
      if (
        String(row?.status || "").trim().toLowerCase() !== "paid" ||
        !clientName ||
        seenClientNames.has(clientName) ||
        !revenueDate.isValid() ||
        revenueDate.isBefore(fiscalYear.start) ||
        !revenueDate.isBefore(fiscalYear.end)
      ) {
        return;
      }

      seenClientNames.add(clientName);
      const monthKey = revenueDate.format("YYYY-MM");
      grouped[monthKey] ||= [];
      grouped[monthKey].push({
        month: revenueDate.format("MMMM"),
        client:
          row?.client?.clientName ||
          row?.nameOfClient ||
          row?.clientInvoiceName ||
          "Unknown",
        typeOfClient: "Workation",
        date: revenueDate.format("YYYY-MM-DD"),
        paymentStatus: row?.status || "—",
        invoiceId: row?._id || row?.id,
      });
    });

    fiscalMonths.forEach((month) => {
      if (isActualMonthAvailable(month) || projectedClientsPerMonth <= 0) {
        return;
      }

      const monthKey = month.format("YYYY-MM");
      grouped[monthKey] = Array.from(
        { length: projectedClientsPerMonth },
        (_, index) => ({
          month: month.format("MMMM"),
          client: `Projected Workation Client ${index + 1}`,
          typeOfClient: "Workation",
          date: month.startOf("month").format("YYYY-MM-DD"),
          paymentStatus: "Projected",
          invoiceId: `projected-${monthKey}-${index + 1}`,
        }),
      );
    });

    return Object.entries(grouped).map(([month, clients]) => ({ month, clients }));
  }, [fiscalYear, projectedClientsPerMonth, revenueRows]);

  return (
    <LeadsLayout
      data={clientsByMonth}
      hideAccordion
      title={
        <div className="inline-flex items-baseline gap-2 whitespace-nowrap leading-none text-[#1E3D73]">
          <BiznestTitle />
          <span>WORKATION UNIQUE CLIENT COUNT - {fiscalYear.label}</span>
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
      actualMonthLag={2}
      virtualOfficeActualLegend="Actual Workation Client"
      virtualOfficeProjectedLegend="Remaining KRA Target"
      virtualOfficeActualColor="#3cb37180"
      virtualOfficeProjectedColor="#787878"
      virtualOfficeTooltipLabel="Workation Client"
      virtualOfficeDataLabelsAbove
    />
  );
};

const WorkationOperationalCharts = ({
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
      const revenueDate = dayjs(row?.date);
      return (
        revenueDate.isValid() &&
        !revenueDate.isBefore(fiscalYear.start) &&
        revenueDate.isBefore(fiscalYear.end)
      );
    });
    const actualRows = financialYearRows.filter((row) => {
      const revenueMonth = dayjs(row?.date).startOf("month");
      return !currentMonth.isBefore(revenueMonth.add(2, "month"), "month");
    });
    const paidAmount = actualRows.reduce(
      (total, row) =>
        String(row?.status || "").trim().toLowerCase() === "paid"
          ? total + getAmount(row?.taxableAmount)
          : total,
      0,
    );
    const unpaidAmount = actualRows.reduce(
      (total, row) =>
        String(row?.status || "").trim().toLowerCase() !== "paid"
          ? total + getAmount(row?.taxableAmount)
          : total,
      0,
    );
    const clientBookings = new Map();

    actualRows.forEach((row) => {
      const clientName = normalizeClientName(row);
      if (!clientName) return;
      clientBookings.set(clientName, (clientBookings.get(clientName) || 0) + 1);
    });

    const newClients = [...clientBookings.values()].filter(
      (bookings) => bookings === 1,
    ).length;
    const repeatClients = [...clientBookings.values()].filter(
      (bookings) => bookings > 1,
    ).length;
    const groupRows = (fieldCandidates) => {
      const grouped = new Map();

      financialYearRows.forEach((row) => {
        const value = fieldCandidates
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
        { label: "New Clients", value: newClients },
        { label: "Repeat Clients", value: repeatClients },
      ],
      sector: groupRows(["sector", "clientSector", "businessSector"]),
      bookingSource: groupRows([
        "bookingSource",
        "source",
        "sourcingChannel",
      ]),
      totalPaid: paidAmount,
      totalPayment: paidAmount + unpaidAmount,
    };
  }, [fiscalYear.end, fiscalYear.start, revenueRows]);
  const definitions = {
    paymentStatus: {
      title: "WORKATION PAYMENT STATUS",
      data: chartData.paymentStatus,
      colors: ["#2186eb", "#f21f5b"],
      chip: `OVERALL PAID: ₹ ${inrFormat(chartData.totalPaid)}`,
    },
    newRepeat: {
      title: "WORKATION NEW VS REPEAT CLIENTS",
      data: chartData.newRepeat,
      colors: ["#13866f", "#ff8f1f"],
    },
    sector: {
      title: "WORKATION SECTOR WISE CLIENTS",
      data: chartData.sector,
      colors: ["#24467d", "#3385ee", "#22bba9", "#7548ce", "#9cb2cf"],
      needsData: chartData.sector.length === 0,
    },
    bookingSource: {
      title: "WORKATION BOOKING SOURCE",
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
          !chart.needsData && chart.chip ? (
            <span className="shrink-0 whitespace-nowrap rounded-lg border border-[#aec6fb] bg-[#dbe4ff] px-2 py-1.5 text-sm font-pmedium uppercase text-[#274784] min-[1700px]:px-3 min-[1700px]:py-2 min-[1700px]:text-body">
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
  const chartColumns = [leftCharts, rightCharts].filter(
    (charts) => charts.length,
  );

  return (
    <div
      className={`grid grid-cols-1 gap-4 ${
        chartColumns.length > 1 ? "xl:grid-cols-2" : ""
      }`}
    >
      {chartColumns.map((charts) => (
        <div key={charts.join("-")} className="flex flex-col gap-4">
          {charts.map(renderChart)}
        </div>
      ))}
    </div>
  );
};

const WorkationUnpaidInvoices = ({ revenueRows, fiscalYear, isLoading }) => {
  const [viewRow, setViewRow] = useState(null);
  const october = fiscalYear.start.add(6, "month");
  const november = fiscalYear.start.add(7, "month");
  const unpaidRows = useMemo(
    () =>
      revenueRows
        .filter((row) => {
          const revenueDate = dayjs(row?.date);
          const isUnpaid =
            String(row?.status || "Unpaid").trim().toLowerCase() !== "paid";
          const isOctoberOrNovember =
            revenueDate.isValid() &&
            (revenueDate.isSame(october, "month") ||
              revenueDate.isSame(november, "month"));

          return isUnpaid && isOctoberOrNovember;
        })
        .sort((first, second) => dayjs(first?.date).diff(dayjs(second?.date)))
        .map((row, index) => ({
          ...row,
          srNo: index + 1,
          clientName: getClientName(row) || "-",
          taxableAmountLabel: inrFormat(getAmount(row?.taxableAmount)),
          gstLabel: inrFormat(getAmount(row?.gst)),
          totalAmountLabel: inrFormat(
            getAmount(row?.totalAmount) ||
              getAmount(row?.taxableAmount) + getAmount(row?.gst),
          ),
          revenueDateLabel: dayjs(row?.date).format("DD-MMM-YYYY"),
          statusLabel: "Unpaid",
        })),
    [november, october, revenueRows],
  );
  const getInvoiceTotal = (row) =>
    getAmount(row?.totalAmount) ||
    getAmount(row?.taxableAmount) + getAmount(row?.gst);
  const octoberTaxableTotal = unpaidRows
    .filter((row) => dayjs(row?.date).isSame(october, "month"))
    .reduce((total, row) => total + getAmount(row?.taxableAmount), 0);
  const novemberTaxableTotal = unpaidRows
    .filter((row) => dayjs(row?.date).isSame(november, "month"))
    .reduce((total, row) => total + getAmount(row?.taxableAmount), 0);
  const columns = [
    { field: "srNo", headerName: "Sr.No", width: 90 },
    { field: "clientName", headerName: "Client Name", flex: 1.1 },
    { field: "particulars", headerName: "Particulars", flex: 1.3 },
    {
      field: "taxableAmountLabel",
      headerName: "Taxable (INR)",
      flex: 0.9,
    },
    { field: "gstLabel", headerName: "GST (INR)", flex: 0.8 },
    { field: "totalAmountLabel", headerName: "Total (INR)", flex: 0.9 },
    {
      field: "revenueDateLabel",
      headerName: "Revenue Date",
      flex: 1,
    },
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
            to="/app/dashboard/sales-dashboard/workation/unpaid-invoices"
            className="inline-flex items-baseline gap-2 leading-none text-[#1E3D73]"
          >
            <BiznestTitle />
            <span>
              WORKATION {fiscalYear.label} - UNPAID INVOICES IN OCTOBER - NOVEMBER
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
              View Workation Invoice Details
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
                  detail={getClientName(viewRow) || "—"}
                />
                <DetalisFormatted
                  gap="w-64 shrink-0"
                  title="Client Invoice Name"
                  detail={
                    viewRow.clientInvoiceName ||
                    getClientName(viewRow) ||
                    "—"
                  }
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
                    dayjs(viewRow.date).isValid()
                      ? dayjs(viewRow.date).format("DD-MM-YYYY")
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

const WorkationSummaryCards = ({
  cardView,
  fiscalYear,
  revenueSummary,
  clientSummary,
  isLoading,
  hasPermission,
}) => {
  const cards = [
    {
      key: "annualRevenueTarget",
      title: "Annual Revenue Target",
      value: inrFormat(revenueSummary.annualTarget),
      permission:
        PERMISSIONS.SALES_VERTICAL_WORKATION_ANNUAL_REVENUE_TARGET_CARD.value,
      icon: MdTrendingUp,
      iconClass: "bg-[#eafbf3] text-[#12a573]",
      valueClass: "text-[#1E3D73]",
    },
    {
      key: "revenueBooked",
      title: "Revenue Booked",
      value: inrFormat(revenueSummary.booked),
      permission:
        PERMISSIONS.SALES_VERTICAL_WORKATION_REVENUE_BOOKED_CARD.value,
      icon: WorkationBarsIcon,
      iconClass: "bg-[#ecf9ff] text-[#13a573]",
      valueClass: "text-[#13a573]",
    },
    {
      key: "revenueDue",
      title: "Revenue Due",
      value: inrFormat(revenueSummary.due),
      permission: PERMISSIONS.SALES_VERTICAL_WORKATION_REVENUE_DUE_CARD.value,
      icon: ChartNoAxesCombined,
      iconClass: "bg-[#fff0f5] text-[#f04a4a]",
      valueClass: "text-[#f04a4a]",
    },
    {
      key: "averagePrice",
      title: "Average Workation Price",
      value: inrFormat(
        clientSummary.activeUniqueCustomers > 0
          ? Math.round(
              revenueSummary.booked / clientSummary.activeUniqueCustomers,
            )
          : 0,
      ),
      permission: PERMISSIONS.SALES_VERTICAL_WORKATION_AVERAGE_PRICE_CARD.value,
      icon: ChartPie,
      iconClass: "bg-[#eaf0f8] text-[#3F6291]",
      valueClass: "text-[#1E3D73]",
    },
    {
      key: "activeUniqueCustomers",
      title: "Active Unique Customers",
      value: clientSummary.activeUniqueCustomers.toLocaleString("en-IN"),
      permission:
        PERMISSIONS.SALES_VERTICAL_WORKATION_ACTIVE_UNIQUE_CUSTOMERS_CARD.value,
      icon: MdGroups,
      iconClass: "bg-[#eaf0f8] text-[#3F6291]",
      valueClass: "text-[#1E3D73]",
    },
    {
      key: "repeatClients",
      title: "Repeat Client",
      value: clientSummary.repeatClients.toLocaleString("en-IN"),
      permission:
        PERMISSIONS.SALES_VERTICAL_WORKATION_REPEAT_CLIENT_CARD.value,
      icon: MdAutorenew,
      iconClass: "bg-[#eaf0f8] text-[#3F6291]",
      valueClass: "text-[#1E3D73]",
    },
    {
      key: "deadUniqueClients",
      title: "Dead Unique Clients",
      value: clientSummary.deadUniqueClients.toLocaleString("en-IN"),
      permission:
        PERMISSIONS.SALES_VERTICAL_WORKATION_DEAD_UNIQUE_CLIENTS_CARD.value,
      icon: MdPersonOff,
      iconClass: "bg-[#fff0f5] text-[#f04a4a]",
      valueClass: "text-[#f04a4a]",
    },
    {
      key: "averageShortfallSurplus",
      title: "Average Shortfall / Surplus",
      value: `${inrFormat(
        Math.abs(clientSummary.averageShortfallSurplus),
      )} ${
        clientSummary.averageShortfallSurplus > 0
          ? "Surplus"
          : clientSummary.averageShortfallSurplus < 0
            ? "Shortfall"
            : "On Target"
      }`,
      permission:
        PERMISSIONS
          .SALES_VERTICAL_WORKATION_AVERAGE_SHORTFALL_SURPLUS_CARD.value,
      icon: MdTrendingDown,
      iconClass:
        clientSummary.averageShortfallSurplus >= 0
          ? "bg-[#eafbf3] text-[#12a573]"
          : "bg-[#fff0f0] text-[#f04a4a]",
      valueClass:
        clientSummary.averageShortfallSurplus >= 0
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

const WorkationDashboard = ({
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
  const menuCards = [
    {
      title: "Onboard New Workation Customers",
      icon: MdPersonAddAlt1,
      permission:
        PERMISSIONS.SALES_VERTICAL_WORKATION_ONBOARD_CUSTOMERS_CARD.value,
      openRoute:
        "/app/dashboard/sales-dashboard/workation/onboard-new-customers",
      items: [],
    },
    {
      title: "Overall Workation Summary",
      icon: MdAssignmentInd,
      permission:
        PERMISSIONS.SALES_VERTICAL_WORKATION_OVERALL_SUMMARY_CARD.value,
      openRoute: "/app/dashboard/sales-dashboard/workation/overall-summary",
      items: [],
    },
    {
      title: "Mix Bag",
      icon: MdShoppingBag,
      permission: PERMISSIONS.SALES_VERTICAL_WORKATION_MIX_BAG_CARD.value,
      openRoute: "/app/dashboard/sales-dashboard/workation/mix-bag",
      items: [],
    },
    {
      title: "Data",
      icon: SiGoogleadsense,
      permission: PERMISSIONS.SALES_VERTICAL_WORKATION_DATA_CARD.value,
      openRoute: "/app/dashboard/sales-dashboard/workation/data",
      items: [],
    },
  ].filter((card) => hasPermission(card.permission));
  const { data: revenueRows = [], isLoading } = useQuery({
    queryKey: ["workation-dashboard-revenue"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/get-workation-revenue");
      return Array.isArray(response.data) ? response.data : [];
    },
  });
  const { data: workationClients = [] } = useQuery({
    queryKey: ["workation-dashboard-clients"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/get-workation-clients");
      return Array.isArray(response.data) ? response.data : [];
    },
  });
  const revenueGraphData = useMemo(
    () => buildWorkationRevenueGraphData(revenueRows, fiscalYear),
    [fiscalYear, revenueRows],
  );
  const revenueSummary = useMemo(() => {
    const summary = revenueGraphData.reduce(
      (totals, row) => {
        const amount = getAmount(row?.reportingAmount);
        if (row?.vertical === "Balance KRA Target") totals.due += amount;
        else totals.booked += amount;
        return totals;
      },
      { booked: 0, due: 0 },
    );

    return {
      ...summary,
      annualTarget: summary.booked + summary.due,
    };
  }, [revenueGraphData]);
  const clientSummary = useMemo(() => {
    const actualClientNames = new Set();
    const clientBookings = new Map();
    const activeFinancialYearClientNames = new Set();

    revenueRows.forEach((row) => {
        const revenueDate = dayjs(row?.date);
      const clientName = normalizeClientName(row);
      const isInFinancialYear =
        revenueDate.isValid() &&
        !revenueDate.isBefore(fiscalYear.start) &&
        revenueDate.isBefore(fiscalYear.end);

      if (!clientName || !isInFinancialYear) return;

      activeFinancialYearClientNames.add(clientName);
      clientBookings.set(clientName, (clientBookings.get(clientName) || 0) + 1);
      const isPaid =
        String(row?.status || "").trim().toLowerCase() === "paid";
      if (
        isPaid &&
        !dayjs()
          .startOf("month")
          .isBefore(revenueDate.startOf("month").add(2, "month"), "month")
      ) {
        actualClientNames.add(clientName);
      }
    });

    const knownClientNames = new Set(
      workationClients.map(normalizeClientName).filter(Boolean),
    );
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

    return {
      activeUniqueCustomers: actualClientNames.size,
      repeatClients: [...clientBookings.values()].filter(
        (bookings) => bookings > 1,
      ).length,
      deadUniqueClients: [...knownClientNames].filter(
        (clientName) => !activeFinancialYearClientNames.has(clientName),
      ).length,
      averageShortfallSurplus: Math.round(
        latestActualRevenue - monthlyProjection,
      ),
    };
  }, [fiscalYear.end, fiscalYear.start, revenueGraphData, revenueRows, workationClients]);
  const canViewRevenueGraph = hasPermission(
    PERMISSIONS.SALES_VERTICAL_WORKATION_REVENUES_GRAPH.value,
  );
  const canViewUniqueClientsGraph = hasPermission(
    PERMISSIONS.SALES_VERTICAL_WORKATION_UNIQUE_CLIENT_COUNT_GRAPH.value,
  );
  const operationalChartPermissions = {
    newRepeat:
      PERMISSIONS.SALES_VERTICAL_WORKATION_NEW_VS_REPEAT_CLIENTS_GRAPH.value,
    paymentStatus:
      PERMISSIONS.SALES_VERTICAL_WORKATION_PAYMENT_STATUS_GRAPH.value,
    sector:
      PERMISSIONS.SALES_VERTICAL_WORKATION_SECTOR_WISE_CLIENTS_GRAPH.value,
    bookingSource:
      PERMISSIONS.SALES_VERTICAL_WORKATION_BOOKING_SOURCE_GRAPH.value,
  };
  const visibleOperationalCharts = Object.entries(
    operationalChartPermissions,
  )
    .filter(([, permission]) => hasPermission(permission))
    .map(([chart]) => chart);
  const canViewUnpaidInvoices = hasPermission(
    PERMISSIONS.SALES_VERTICAL_WORKATION_UNPAID_INVOICES_TABLE.value,
  );

  if (revenueOnly) {
    if (!canViewRevenueGraph) return null;
    return (
      <div className="p-3 pt-3">
        <WorkationRevenueGraph
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
        <WorkationUniqueClientsGraph revenueRows={revenueRows} />
      </div>
    );
  }

  if (operationalChartView) {
    if (!visibleOperationalCharts.includes(operationalChartView)) return null;
    return (
      <div className="p-3 pt-3">
        <WorkationOperationalCharts
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
        <WorkationUnpaidInvoices
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
        <div className="relative h-56 w-full md:h-[17rem] xl:h-[19rem]">
          <img
            src={workationBanner}
            alt="Workation dashboard banner"
            className="h-full w-full object-cover"
            style={{ objectPosition: "center 68%" }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-[55%] bg-white/95"
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, black 0%, black 84%, transparent 100%)",
              maskImage:
                "linear-gradient(to right, black 0%, black 84%, transparent 100%)",
            }}
          />
          <div className="absolute inset-y-0 left-0 flex w-[55%] flex-col px-1 py-4 sm:py-6">
            <p className="font-pregular text-xs uppercase tracking-[0.02em] text-[#1E3D73] sm:text-base lg:text-[15px] min-[1700px]:text-base min-[1900px]:text-lg">
              Workation Dashboard
            </p>
            <h1 className="mt-6 max-w-full whitespace-nowrap font-serif text-3xl font-semibold leading-[0.9] text-[#1E3D73] drop-shadow-sm sm:mt-10 sm:text-5xl lg:origin-left lg:scale-x-90 lg:text-[38px] xl:text-[42px] min-[1700px]:text-[46px] min-[1900px]:scale-x-100 min-[1900px]:text-[50px]">
              <span ref={headingRef} className="inline-block whitespace-nowrap">
                WORKATION <span className="text-[#E64B4B]">DASHBOARD</span>
              </span>
            </h1>
            <p className="mt-5 max-w-full font-pmedium text-xl leading-[0.94] text-[#1E3D73] sm:mt-8 sm:text-3xl md:whitespace-nowrap lg:text-[35px] min-[1700px]:text-[39px] min-[1900px]:text-[46px]">
              Workation Customers
            </p>
          </div>
          <nav
            ref={navigationRef}
            aria-label="Workation dashboard navigation"
            className="absolute bottom-0 left-0 z-10 flex w-fit max-w-[61%] items-end gap-6 overflow-x-auto px-1 sm:gap-8 lg:w-[45.5%] lg:max-w-none lg:justify-between lg:gap-2 min-[1700px]:w-fit min-[1700px]:max-w-[61%] min-[1700px]:gap-10"
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
            <DashboardPopupMenu cards={menuCards} moduleLabel="Workation" />
          </nav>
        </div>
      </div>

      <WorkationSummaryCards
        cardView={cardView}
        fiscalYear={fiscalYear}
        revenueSummary={revenueSummary}
        clientSummary={clientSummary}
        isLoading={isLoading}
        hasPermission={hasPermission}
      />

      {!cardView && canViewRevenueGraph && (
        <WorkationRevenueGraph
          graphData={revenueGraphData}
          revenueRows={revenueRows}
          fiscalYear={fiscalYear}
          isLoading={isLoading}
        />
      )}

      {!cardView && canViewUniqueClientsGraph && (
        <WorkationUniqueClientsGraph revenueRows={revenueRows} />
      )}

      {!cardView && visibleOperationalCharts.length > 0 && (
        <WorkationOperationalCharts
          revenueRows={revenueRows}
          fiscalYear={fiscalYear}
          visibleCharts={visibleOperationalCharts}
        />
      )}

      {!cardView && canViewUnpaidInvoices && (
        <WorkationUnpaidInvoices
          revenueRows={revenueRows}
          fiscalYear={fiscalYear}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default WorkationDashboard;
