import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import dayjs from "dayjs";
import {
  FiDatabase,
  FiUploadCloud,
  FiUserPlus,
  FiUsers,
} from "react-icons/fi";
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
import {
  LuChartNoAxesCombined as ChartNoAxesCombined,
  LuChartPie as ChartPie,
} from "react-icons/lu";
import { SiGoogleadsense } from "react-icons/si";
import coWorkingBanner from "../../../../assets/co-working-banner.png";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import useBannerMenuAlignment from "../../../../hooks/useBannerMenuAlignment";
import useUserPermissions from "../../../../hooks/useUserPermissions";
import { PERMISSIONS } from "../../../../constants/permissions";
import { inrFormat } from "../../../../utils/currencyFormat";
import FyBarGraph from "../../../../components/graphs/FyBarGraph";
import PieChartMui from "../../../../components/graphs/PieChartMui";
import WidgetSection from "../../../../components/WidgetSection";
import AgTable from "../../../../components/AgTable";
import StatusChip from "../../../../components/StatusChip";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";
import MuiModal from "../../../../components/MuiModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import DashboardPopupMenu from "../../../../components/DashboardPopupMenu";
import LeadsLayout from "../ViewClients/LeadsLayout";
import { setSelectedClient } from "../../../../redux/slices/clientSlice";

const COWORKING_REVENUE_ROUTE =
  "/app/dashboard/sales-dashboard/revenue/co-working";

const CoworkingBarsIcon = () => (
  <span className="flex h-8 w-8 items-end justify-center gap-1">
    <span className="h-3 w-1.5 rounded-full bg-current" />
    <span className="h-5 w-1.5 rounded-full bg-current" />
    <span className="h-7 w-1.5 rounded-full bg-current" />
  </span>
);

const getAmount = (value) =>
  Number(String(value ?? "0").replace(/,/g, "")) || 0;

const getRenewalPaymentStatus = (row) => {
  const rentStatus = String(row?.rentStatus ?? "").trim().toLowerCase();

  if (rentStatus) return rentStatus;
  if (typeof row?.status === "boolean") return row.status ? "paid" : "unpaid";
  return String(row?.status ?? "").trim().toLowerCase();
};

const getRenewalRevenueDate = (row) =>
  row?.rentDate || row?.invoiceUploadedAt || row?.invoice?.date || row?.createdAt;

const getRenewalRevenueAmount = (client) => {
  const totalDesks =
    Number(client?.totalDesks) ||
    Number(client?.openDesks || 0) + Number(client?.cabinDesks || 0);
  const currentRate = Number(
    client?.currentRate || client?.openDeskRate || client?.cabinDeskRate || 0,
  );

  return Number(
    client?.revenue ||
      client?.receivedAmount ||
      Number(client?.openTotal || 0) + Number(client?.cabinTotal || 0) ||
      totalDesks * currentRate,
  );
};

const getRenewalClientId = (revenue) =>
  typeof (revenue?.client || revenue?.clients) === "object"
    ? (revenue?.client || revenue?.clients)?._id
    : revenue?.client || revenue?.clients;

const isRenewalRevenueForClientMonth = (revenue, client, month) => {
  const revenueDate = dayjs(getRenewalRevenueDate(revenue));
  const revenueClientId = getRenewalClientId(revenue);
  const idMatches =
    revenueClientId &&
    client?._id &&
    String(revenueClientId) === String(client._id);
  const nameMatches =
    String(
      revenue?.client?.clientName ||
        revenue?.clients?.clientName ||
        revenue?.clientName ||
        "",
    )
      .trim()
      .toLowerCase() ===
    String(client?.clientName || "").trim().toLowerCase();

  return (
    revenueDate.isValid() &&
    revenueDate.isSame(month, "month") &&
    (idMatches || nameMatches)
  );
};

const isActiveRenewalClient = (client) => {
  const activeValue = client?.isActive ?? client?.clientStatus;
  const normalizedValue = String(activeValue ?? "").trim().toLowerCase();

  return (
    activeValue === true ||
    normalizedValue === "true" ||
    normalizedValue === "active"
  );
};

const hasPaidRenewal = (revenues, client, month) =>
  revenues.some(
    (revenue) =>
      getRenewalPaymentStatus(revenue) === "paid" &&
      isRenewalRevenueForClientMonth(revenue, client, month),
  );

const getMonthlyRenewalRevenue = (clients, revenues, month) =>
  clients.reduce((total, client) => {
    const endDate = dayjs(client?.termEnd || client?.endDate);
    if (
      !isActiveRenewalClient(client) ||
      !endDate.isValid() ||
      !endDate.isSame(month, "month")
    ) {
      return total;
    }

    const paidRevenue = revenues
      .filter(
        (revenue) =>
          getRenewalPaymentStatus(revenue) === "paid" &&
          isRenewalRevenueForClientMonth(revenue, client, month),
      )
      .reduce(
        (clientTotal, revenue) =>
          clientTotal +
          (getAmount(revenue?.revenue) ||
            getAmount(revenue?.receivedAmount) ||
            getAmount(revenue?.taxableAmount)),
        0,
      );

    return total + (paidRevenue || getRenewalRevenueAmount(client));
  }, 0);

const formatOccupancyLegendLabel = (value, maxLength = 11) => {
  const label = String(value || "Unknown");
  return label.length > maxLength
    ? `${label.slice(0, maxLength).trim()}...`
    : label;
};

const escapeTooltipText = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const createPieTooltip = (suffix) => ({ series = [], seriesIndex = 0, w }) => {
  const label = w?.globals?.labels?.[seriesIndex] || "Unknown";
  const value = Math.round(Number(series[seriesIndex]) || 0);
  const color = w?.globals?.colors?.[seriesIndex] || "#1E3D73";

  return `<div style="padding:8px 10px;background:${color};color:#fff;border-radius:6px;font-family:Poppins-Regular;font-size:12px;font-weight:600;box-shadow:0 2px 8px rgba(15,23,42,.22);white-space:nowrap;">${escapeTooltipText(label)}: ${value} ${suffix}</div>`;
};

const SingleLineChartLegend = ({
  labels = [],
  colors = [],
  truncateLabels = true,
}) => (
  <div className="flex w-full justify-center overflow-hidden px-2 pb-1">
    <div className="flex w-fit max-w-full flex-nowrap items-center justify-center gap-2 text-[10px] text-[#1E3D73] sm:text-[11px]">
      {labels.map((label, index) => (
        <span
          key={`${label}-${index}`}
          className={`inline-flex min-w-0 items-center justify-center gap-1 whitespace-nowrap ${
            truncateLabels
              ? "max-w-[90px] flex-[0_1_auto]"
              : "shrink-0"
          }`}
          title={label}
        >
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: colors[index] || "#1E3D73" }}
          />
          <span className={truncateLabels ? "min-w-0 truncate" : ""}>
            {truncateLabels ? formatOccupancyLegendLabel(label) : label}
          </span>
        </span>
      ))}
    </div>
  </div>
);

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

const buildCoworkingRevenueGraphData = (revenueRows, fiscalYear) => {
  const currentMonth = dayjs().startOf("month");
  const fiscalMonths = Array.from({ length: 12 }, (_, index) =>
    fiscalYear.start.add(index, "month"),
  );
  const actualByMonth = new Map();

  revenueRows.forEach((row) => {
    const rentDate = dayjs(row?.rentDate);
    if (
      !rentDate.isValid() ||
      rentDate.isBefore(fiscalYear.start) ||
      !rentDate.isBefore(fiscalYear.end)
    ) {
      return;
    }

    if (String(row?.rentStatus || "").trim().toLowerCase() !== "paid") {
      return;
    }

    const monthKey = rentDate.format("YYYY-MM");
    const amount = getAmount(row?.revenue);
    actualByMonth.set(monthKey, (actualByMonth.get(monthKey) || 0) + amount);
  });

  const isActualMonthAvailable = (month) =>
    !currentMonth.isBefore(
      month.startOf("month").add(2, "month"),
      "month",
    );
  const latestActualIndex = fiscalMonths.reduce(
    (latestIndex, month, index) =>
      isActualMonthAvailable(month) ? index : latestIndex,
    -1,
  );

  if (latestActualIndex < 0) return [];

  const actualMonthAmounts = fiscalMonths
    .slice(0, latestActualIndex + 1)
    .map((month) => actualByMonth.get(month.format("YYYY-MM")) || 0)
    .filter((amount) => amount > 0);
  const averageActualRevenue = actualMonthAmounts.length
    ? actualMonthAmounts.reduce((total, amount) => total + amount, 0) /
      actualMonthAmounts.length
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

const CoworkingRevenueGraph = ({
  graphData,
  revenueRows,
  fiscalYear,
  isLoading,
}) => {
  const projectionTotal = graphData.reduce(
    (total, row) => total + getAmount(row.reportingAmount),
    0,
  );
  const axisScale = useMemo(() => {
    const highestValue = Math.max(
      0,
      ...graphData.map((item) => getAmount(item.reportingAmount)),
    );
    if (highestValue <= 0) {
      return { max: 600000, tickAmount: 3 };
    }

    const rawStep = highestValue / 3;
    const magnitude = 10 ** Math.floor(Math.log10(rawStep));
    const normalizedStep = rawStep / magnitude;
    const niceFactor = [1, 2, 5, 10].find(
      (factor) => normalizedStep <= factor,
    );
    const step = (niceFactor || 10) * magnitude;
    const max = Math.max(step, Math.ceil(highestValue / step) * step);

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
    const actualCountsByMonth = new Map(
      fiscalMonths.map((month) => [month.format("YYYY-MM"), 0]),
    );

    revenueRows.forEach((row) => {
      const rentDate = dayjs(row?.rentDate);
      if (
        !rentDate.isValid() ||
        rentDate.isBefore(fiscalYear.start) ||
        !rentDate.isBefore(fiscalYear.end)
      ) {
        return;
      }

      const monthKey = rentDate.format("YYYY-MM");
      actualCountsByMonth.set(
        monthKey,
        (actualCountsByMonth.get(monthKey) || 0) + 1,
      );
    });

    const isActualMonthAvailable = (month) =>
      !currentMonth.isBefore(month.add(2, "month"), "month");
    const elapsedMonths = fiscalMonths.filter(isActualMonthAvailable).length;
    const totalActualClients = fiscalMonths.reduce(
      (total, month) =>
        isActualMonthAvailable(month)
          ? total + (actualCountsByMonth.get(month.format("YYYY-MM")) || 0)
          : total,
      0,
    );
    const projectedClientCount = elapsedMonths
      ? Math.round(totalActualClients / elapsedMonths)
      : 0;

    return fiscalMonths.map((month) =>
      isActualMonthAvailable(month)
        ? actualCountsByMonth.get(month.format("YYYY-MM")) || 0
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
            w?.globals?.seriesNames?.[seriesIndex] || "Co-Working";
          const value = series?.[seriesIndex]?.[dataPointIndex] || 0;
          const color = w?.globals?.colors?.[seriesIndex] || "#3cb37180";
          const revenueLabel =
            seriesName === "Balance KRA Target"
              ? "Projected Revenue"
              : "Booked Revenue";

          return `<div style="min-width:160px;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 14px rgba(15,23,42,.18);border:1px solid #e5e7eb;"><div style="background:#eef2f6;color:#1f2937;font-size:12px;padding:8px 12px;border-bottom:1px solid #dbe1e8;">${label}</div><div style="display:flex;align-items:center;gap:8px;padding:10px 12px;font-size:12px;color:#111827;"><span style="width:12px;height:12px;border-radius:999px;background:${color};display:inline-block;"></span><span>${revenueLabel}:</span><span style="font-weight:700;">INR ${inrFormat(value)}</span></div><div style="display:flex;align-items:center;gap:8px;padding:0 12px 10px;font-size:12px;color:#111827;"><span aria-hidden="true">&#128101;</span><span>Co-Working Client:</span><span style="font-weight:700;">${monthlyClientCounts[dataPointIndex] || 0}</span></div></div>`;
        },
      },
      plotOptions: {
        bar: { columnWidth: "40%", borderRadius: 5, dataLabels: { position: "top" } },
      },
      legend: { labels: { colors: "#1E3D73" } },
      colors: ["#3cb37180", "#787878"],
    }),
    [amountScale, axisScale, monthlyClientCounts],
  );

  if (isLoading) return <Skeleton height={500} width="100%" />;

  return (
    <FyBarGraph
      chartId="coworking-dashboard-revenues"
      graphTitle={
        <div className="inline-flex items-baseline gap-2 whitespace-nowrap leading-none text-[#1E3D73]">
          <BiznestTitle />
          <span>CO-WORKING REVENUES - {fiscalYear.label}</span>
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

const CoworkingUniqueClientsGraph = ({ revenueRows }) => {
  const clientsByMonth = useMemo(() => {
    const grouped = {};

    revenueRows.forEach((row) => {
      const rentDate = dayjs(row?.rentDate);
      if (!rentDate.isValid()) return;

      const month = rentDate.format("MMMM");
      grouped[month] ||= [];
      grouped[month].push({
        month,
        client:
          row?.clients?.clientName ||
          row?.clientName ||
          row?.clientInvoiceName ||
          "Unknown",
        typeOfClient: "Coworking",
        date: rentDate.format("YYYY-MM-DD"),
        invoiceId: row?._id || row?.id,
      });
    });

    return Object.entries(grouped).map(([month, clients]) => ({
      month,
      clients,
    }));
  }, [revenueRows]);
  const totalUniqueClientsTitle = ({ count }) =>
    `TOTAL UNIQUE CLIENTS: ${count.toLocaleString("en-IN")}`;
  const fiscalYear = getFiscalYear();

  return (
    <LeadsLayout
      data={clientsByMonth}
      hideAccordion
      title={
        <div className="inline-flex items-baseline gap-2 whitespace-nowrap leading-none text-[#1E3D73]">
          <BiznestTitle />
          <span>CO-WORKING UNIQUE CLIENT COUNT - {fiscalYear.label}</span>
        </div>
      }
      titleAmount={totalUniqueClientsTitle}
      hideMonthAxisTitle
      noOuterPadding
      investorBlueStyle
      investorTitleAmountChip
      hideFinancialYearControls
      focusedClientSeries="Co-Working"
      actualMonthLag={2}
      virtualOfficeActualLegend="Actual Co-Working Client"
      virtualOfficeProjectedLegend="Remaining KRA Target"
      virtualOfficeActualColor="#3cb37180"
      virtualOfficeProjectedColor="#787878"
      virtualOfficeTooltipLabel="Co-Working Client"
      virtualOfficeDataLabelsAbove
    />
  );
};

const CoworkingOccupancyCharts = ({
  clients,
  isLoading,
  visibleCharts = ["sector", "desk"],
}) => {
  const sectorChart = useMemo(() => {
    const sectorDesks = clients.reduce((totals, client) => {
      const sector = String(client?.sector || "Unknown").trim() || "Unknown";
      const desks =
        getAmount(client?.totalDesks) ||
        getAmount(client?.openDesks) + getAmount(client?.cabinDesks);
      totals[sector] = (totals[sector] || 0) + desks;
      return totals;
    }, {});
    const entries = Object.entries(sectorDesks)
      .filter(([, desks]) => desks > 0)
      .sort((a, b) => b[1] - a[1]);
    const totalDesks = entries.reduce((sum, [, desks]) => sum + desks, 0);
    let otherDesks = 0;
    const displayedEntries = entries.filter(([, desks]) => {
      if (totalDesks > 0 && (desks / totalDesks) * 100 < 4) {
        otherDesks += desks;
        return false;
      }
      return true;
    });
    if (otherDesks > 0) displayedEntries.push(["Other", otherDesks]);

    return {
      data: displayedEntries.map(([sector, desks]) => ({
        label: sector,
        value: desks,
      })),
      options: {
        chart: { type: "pie", fontFamily: "Poppins-Regular", toolbar: false },
        labels: displayedEntries.map(([sector]) => sector),
        colors: [
          "#24477F",
          "#2F80ED",
          "#24B8A6",
          "#FFB800",
          "#9CB3D5",
          "#7A5AF8",
        ],
        dataLabels: {
          enabled: true,
          formatter: (value) => `${Number(value).toFixed(1)}%`,
          style: { fontSize: "12px", fontWeight: 600, colors: ["#ffffff"] },
        },
        tooltip: {
          fillSeriesColor: false,
          custom: createPieTooltip("Desks"),
        },
        legend: { show: false },
        stroke: { show: false },
      },
    };
  }, [clients]);

  const deskChart = useMemo(() => {
    const sortedClients = clients
      .map((client) => ({
        companyName: client?.clientName || "Unknown",
        totalDesks:
          getAmount(client?.totalDesks) ||
          getAmount(client?.openDesks) + getAmount(client?.cabinDesks),
      }))
      .filter((client) => client.totalDesks > 0)
      .sort((a, b) => b.totalDesks - a.totalDesks);
    const displayedClients = sortedClients.slice(0, 6);
    const otherDesks = sortedClients
      .slice(6)
      .reduce((sum, client) => sum + client.totalDesks, 0);
    if (otherDesks > 0) {
      displayedClients.push({ companyName: "Other", totalDesks: otherDesks });
    }
    const totalDesks = displayedClients.reduce(
      (sum, client) => sum + client.totalDesks,
      0,
    );

    return {
      data: displayedClients.map((client) => ({
        label: `${client.companyName} ${
          totalDesks > 0
            ? ((client.totalDesks / totalDesks) * 100).toFixed(1)
            : 0
        }%`,
        value: client.totalDesks,
      })),
      options: {
        chart: { fontFamily: "Poppins-Regular", toolbar: false },
        labels: displayedClients.map((client) => client.companyName),
        colors: [
          "#0F172A",
          "#1E293B",
          "#1D4ED8",
          "#2563EB",
          "#3B82F6",
          "#0284C7",
          "#0369A1",
        ],
        tooltip: {
          fillSeriesColor: false,
          custom: createPieTooltip("Desks"),
        },
        legend: { show: false },
      },
    };
  }, [clients]);

  const charts = [
    {
      key: "sector",
      title: "Sector Wise Bookings",
      route: "/app/dashboard/sales-dashboard/co-working/sector-wise-occupancy",
      ...sectorChart,
    },
    {
      key: "desk",
      title: "Desk Wise Bookings",
      route: "/app/dashboard/sales-dashboard/co-working/desk-wise-occupancy",
      ...deskChart,
    },
  ].filter((chart) => visibleCharts.includes(chart.key));

  return (
    <div
      className={`grid grid-cols-1 gap-4 ${
        charts.length > 1 ? "xl:grid-cols-2" : ""
      }`}
    >
      {charts.map((chart) => (
        <WidgetSection
          key={chart.key}
          layout={charts.length > 1 ? 2 : 1}
          autoHeight
          border
          borderColor="#1E3D73"
          bodyBorderColor="#9FB2CF"
          title={
            <div className="inline-flex min-w-0 flex-wrap items-baseline justify-center gap-x-2 gap-y-1 leading-tight text-[#1E3D73] lg:justify-start">
              <BiznestTitle />
              <span className="min-w-0">{chart.title}</span>
            </div>
          }
        >
          {isLoading ? (
            <Skeleton height={360} width="100%" />
          ) : (
            <PieChartMui
              data={chart.data}
              options={chart.options}
              width={500}
              height={340}
              customChartAreaHeight={280}
              customLegend={
                <SingleLineChartLegend
                  labels={chart.options.labels}
                  colors={chart.options.colors}
                />
              }
              centerAlign
            />
          )}
        </WidgetSection>
      ))}
    </div>
  );
};

const CoworkingBusinessCharts = ({
  clients,
  areClientsLoading,
  visibleCharts = ["activeStatus", "clientType"],
}) => {
  const activeStatusCounts = useMemo(
    () =>
      clients.reduce(
        (counts, client) => {
          const activeValue = client?.isActive ?? client?.clientStatus;
          const normalizedValue = String(activeValue ?? "").toLowerCase();
          const isActive =
            activeValue === true ||
            normalizedValue === "true" ||
            normalizedValue === "active";
          if (isActive) counts.active += 1;
          else counts.inactive += 1;
          return counts;
        },
        { active: 0, inactive: 0 },
      ),
    [clients],
  );
  const activeStatusData = [
    { label: "Active", value: activeStatusCounts.active },
    { label: "Inactive", value: activeStatusCounts.inactive },
  ];
  const activeStatusOptions = {
    chart: { type: "pie", fontFamily: "Poppins-Regular", toolbar: false },
    labels: activeStatusData.map((item) => item.label),
    colors: ["#24B8A6", "#F04A4A"],
    dataLabels: {
      enabled: true,
      formatter: (value) => `${Number(value).toFixed(1)}%`,
      style: { fontSize: "12px", fontWeight: 600, colors: ["#ffffff"] },
    },
    legend: {
      show: false,
    },
    tooltip: {
      fillSeriesColor: false,
      custom: ({ series = [], seriesIndex = 0, w }) => {
        const label = w?.globals?.labels?.[seriesIndex] || "Unknown";
        const value = Math.round(Number(series[seriesIndex]) || 0);
        const color = w?.globals?.colors?.[seriesIndex] || "#1E3D73";
        return `<div style="padding:8px 10px;background:${color};color:#fff;border-radius:6px;font-family:Poppins-Regular;font-size:12px;font-weight:600;box-shadow:0 2px 8px rgba(15,23,42,.22);white-space:nowrap;">${escapeTooltipText(label)} Client: ${value}</div>`;
      },
    },
    stroke: { show: false },
  };

  const clientTypeCounts = useMemo(
    () => {
      const uniqueClients = Array.from(
        new Map(
          clients.map((client, index) => [
            String(client?._id || client?.id || `client-${index}`),
            client,
          ]),
        ).values(),
      );

      return uniqueClients.reduce(
        (counts, client) => {
          const clientType = String(client?.clientType || "")
            .trim()
            .toLowerCase();

          if (["flexy desk client", "flexi desk client"].includes(clientType)) {
            counts.monthly += 1;
          } else if (clientType === "annual client") {
            counts.yearly += 1;
          }
          return counts;
        },
        { monthly: 0, yearly: 0 },
      );
    },
    [clients],
  );
  const clientTypeData = [
    { label: "Flexy Desk Client", value: clientTypeCounts.monthly },
    { label: "Annual Client", value: clientTypeCounts.yearly },
  ];
  const clientTypeOptions = {
    chart: {
      type: "pie",
      fontFamily: "Poppins-Regular",
      toolbar: { show: false },
    },
    labels: clientTypeData.map((item) => item.label),
    colors: ["#2F80ED", "#24B8A6"],
    dataLabels: {
      enabled: true,
      formatter: (value) => `${Number(value).toFixed(1)}%`,
      style: { fontSize: "12px", fontWeight: 600, colors: ["#ffffff"] },
    },
    legend: {
      show: false,
    },
    tooltip: {
      enabled: true,
      fillSeriesColor: false,
      custom: ({ series = [], seriesIndex = 0 }) => {
        const isMonthly = seriesIndex === 0;
        const frequency = isMonthly ? "Monthly" : "Yearly";
        const color = isMonthly ? "#2F80ED" : "#24B8A6";
        const count = Math.round(Number(series[seriesIndex]) || 0);

        return `<div style="padding:9px 12px;background:${color};color:#fff;border-radius:6px;font-family:Poppins-Regular;font-size:12px;font-weight:600;white-space:nowrap;">${frequency}: ${count} Clients</div>`;
      },
    },
    stroke: { show: false },
  };
  const charts = [
    {
      key: "activeStatus",
      title: "Active VS Inactive Client",
      route:
        "/app/dashboard/sales-dashboard/co-working/active-vs-inactive-client",
    },
    {
      key: "clientType",
      title: "Annual VS FLEXY DESK CLIENT",
      route: "/app/dashboard/sales-dashboard/co-working/client-type",
    },
  ].filter((chart) => visibleCharts.includes(chart.key));

  return (
    <div
      className={`grid grid-cols-1 gap-4 ${
        charts.length > 1 ? "xl:grid-cols-2" : ""
      }`}
    >
      {charts.map((chart) => (
        <WidgetSection
          key={chart.key}
          layout={charts.length > 1 ? 2 : 1}
          autoHeight
          border
          borderColor="#1E3D73"
          bodyBorderColor="#9FB2CF"
          title={
            <div className="inline-flex min-w-0 flex-wrap items-baseline justify-center gap-x-2 gap-y-1 leading-tight text-[#1E3D73] lg:justify-start">
              <BiznestTitle />
              <span className="min-w-0">{chart.title}</span>
            </div>
          }
        >
          {areClientsLoading ? (
            <Skeleton height={360} width="100%" />
          ) : chart.key === "activeStatus" ? (
            <PieChartMui
              data={activeStatusData}
              options={activeStatusOptions}
              width={500}
              height={350}
              customChartAreaHeight={300}
              customLegend={
                <SingleLineChartLegend
                  labels={activeStatusOptions.labels}
                  colors={activeStatusOptions.colors}
                  truncateLabels={false}
                />
              }
              centerAlign
            />
          ) : (
            <PieChartMui
              key={`coworking-client-type-${clientTypeCounts.monthly}-${clientTypeCounts.yearly}`}
              data={clientTypeData}
              options={clientTypeOptions}
              height={350}
              width={500}
              customChartAreaHeight={300}
              customLegend={
                <SingleLineChartLegend
                  labels={clientTypeOptions.labels}
                  colors={clientTypeOptions.colors}
                  truncateLabels={false}
                />
              }
              centerAlign
            />
          )}
        </WidgetSection>
      ))}
    </div>
  );
};

const CoworkingRenewalClientView = ({ client }) => {
  if (!client) return null;

  const startDate = client?.termStartDate || client?.startDate;
  const endDate = client?.termEnd || client?.endDate;
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const totalDesks =
    Number(client?.totalDesks) ||
    Number(client?.cabinDesks || 0) + Number(client?.openDesks || 0);
  const currentRate = Number(
    client?.currentRate ||
      client?.ratePerCabinDesk ||
      client?.ratePerOpenDesk ||
      client?.cabinDeskRate ||
      client?.openDeskRate ||
      0,
  );
  const revenue = Number(
    client?.renewalRevenue ||
      client?.revenue ||
      Number(client?.cabinTotal || 0) + Number(client?.openTotal || 0) ||
      totalDesks * currentRate,
  );
  const buildingName =
    client?.unit?.building?.buildingName ||
    client?.building?.buildingName ||
    client?.buildingName;
  const unitNo =
    client?.unit?.unitNo || client?.unitNo || client?.unit?.unitName;
  const calculatedTerm =
    start.isValid() && end.isValid()
      ? Math.max(end.diff(start, "month"), 0)
      : 0;
  const totalTerm = Number(client?.totalTerm) || calculatedTerm;
  const totalDays =
    start.isValid() && end.isValid()
      ? Math.max(end.startOf("day").diff(start.startOf("day"), "day"), 0)
      : 0;
  const remainingDays = end.isValid()
    ? Math.min(
        totalDays,
        Math.max(end.startOf("day").diff(dayjs().startOf("day"), "day"), 0),
      )
    : 0;
  const isActive =
    typeof client?.isActive === "boolean"
      ? client.isActive
      : String(client?.clientStatus || "").toLowerCase() === "active";

  const formatDate = (value) => {
    const date = dayjs(value);
    return date.isValid() ? date.format("DD-MM-YYYY") : "N/A";
  };
  const displayValue = (value) =>
    value === 0 ? "0" : value || "N/A";

  return (
    <div className="flex flex-col gap-6 text-[#1E3D73]">
      <section className="space-y-2">
        <h3 className="text-lg font-pmedium">Customer Details</h3>
        <div className="space-y-1">
          <DetalisFormatted title="Client Name" detail={displayValue(client?.clientName)} />
          <DetalisFormatted title="Sector" detail={displayValue(client?.sector)} />
          <DetalisFormatted title="Ho City" detail={displayValue(client?.hoCity || client?.city)} />
          <DetalisFormatted title="Ho State" detail={displayValue(client?.hoState || client?.state)} />
          <DetalisFormatted title="Booking Type" detail={displayValue(client?.bookingType || client?.channelLabel)} />
          <DetalisFormatted title="Revenue" detail={inrFormat(revenue)} />
          <DetalisFormatted title="Sourcing" detail={displayValue(client?.channel || client?.sourcing || client?.channelLabel)} />
          <DetalisFormatted title="Current Status" detail={displayValue(client?.currentStatus || "In Progress")} />
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-pmedium">Company Details</h3>
        <div className="space-y-1">
          <DetalisFormatted title="Building Name" detail={displayValue(buildingName)} />
          <DetalisFormatted title="Unit No" detail={displayValue(unitNo)} />
          <DetalisFormatted title="Billing Frequency" detail={displayValue(client?.billingFrequency)} />
          <DetalisFormatted title="Client Type" detail={displayValue(client?.clientType)} />
          <DetalisFormatted title="Cabin Desks" detail={displayValue(client?.cabinDesks)} />
          <DetalisFormatted title="Rate Per Cabin Desk" detail={inrFormat(client?.ratePerCabinDesk || client?.cabinDeskRate || 0)} />
          <DetalisFormatted title="Open Desks" detail={displayValue(client?.openDesks)} />
          <DetalisFormatted title="Rate Per Open Desk" detail={inrFormat(client?.ratePerOpenDesk || client?.openDeskRate || 0)} />
          <DetalisFormatted title="No of Desk" detail={displayValue(totalDesks)} />
          <DetalisFormatted title="Current Rate" detail={inrFormat(currentRate)} />
          <DetalisFormatted title="Company Status" detail={isActive ? "Active" : "Inactive"} />
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-pmedium">Agreement Details</h3>
        <div className="space-y-1">
          <DetalisFormatted title="Annual Increment" detail={`${Number(client?.annualIncrement) || 0}%`} />
          <DetalisFormatted title="Per Desk Meeting Credits" detail={displayValue(client?.perDeskMeetingCredits ?? 0)} />
          <DetalisFormatted title="Total Meeting Credits" detail={displayValue(client?.totalMeetingCredits ?? 0)} />
          <DetalisFormatted title="Start Date" detail={formatDate(startDate)} />
          <DetalisFormatted title="End Date" detail={formatDate(endDate)} />
          <DetalisFormatted title="Lock-in Period" detail={`${Number(client?.lockinPeriod || client?.lockInPeriodMonths) || 0} months`} />
          <DetalisFormatted title="Rent Date" detail={formatDate(client?.rentDate)} />
          <DetalisFormatted title="Next Increment" detail={formatDate(client?.nextIncrement || client?.nextIncrementDate)} />
          <DetalisFormatted title="Total Term" detail={`${totalTerm} months`} />
          <DetalisFormatted title="Agreement Expiry" detail={totalDays ? `${remainingDays}/${totalDays} days` : "N/A"} />
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-lg font-pmedium">POC Details</h3>
        <div className="space-y-1">
          <DetalisFormatted title="Local Poc Name" detail={displayValue(client?.localPoc?.name || client?.localPocName)} />
          <DetalisFormatted title="Local Poc Email" detail={displayValue(client?.localPoc?.email || client?.localPocEmail)} />
          <DetalisFormatted title="Local Poc Phone" detail={displayValue(client?.localPoc?.phone || client?.localPocPhone)} />
          <DetalisFormatted title="Ho Poc Name" detail={displayValue(client?.hOPoc?.name || client?.hoPoc?.name || client?.hOPocName)} />
          <DetalisFormatted title="Ho Poc Email" detail={displayValue(client?.hOPoc?.email || client?.hoPoc?.email || client?.hOPocEmail)} />
          <DetalisFormatted title="Ho Poc Phone" detail={displayValue(client?.hOPoc?.phone || client?.hoPoc?.phone || client?.hOPocPhone)} />
        </div>
      </section>
    </div>
  );
};

const CoworkingRenewalTable = ({ clients, revenues = [] }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [viewClient, setViewClient] = useState(null);
  const renewalEndMonth = useMemo(() => dayjs().startOf("month"), []);
  const renewalStartMonth = renewalEndMonth.subtract(1, "month");
  const renewalFiscalYear = getFiscalYear().label.replace("FY ", "");

  const renewalRows = useMemo(() => {
    const currentMonth = renewalEndMonth.startOf("month");
    const previousMonth = renewalStartMonth.startOf("month");

    return clients
      .filter((client) => {
        const endDate = dayjs(client?.termEnd || client?.endDate);
        const isPreviousMonth =
          endDate.isValid() && endDate.isSame(previousMonth, "month");
        const isCurrentMonth =
          endDate.isValid() && endDate.isSame(currentMonth, "month");
        const renewalMonth = isPreviousMonth ? previousMonth : currentMonth;

        return (
          isActiveRenewalClient(client) &&
          (isPreviousMonth || isCurrentMonth) &&
          !hasPaidRenewal(revenues, client, renewalMonth)
        );
      })
      .sort((first, second) =>
        dayjs(first?.termEnd || first?.endDate).diff(
          dayjs(second?.termEnd || second?.endDate),
        ),
      )
      .map((client, index) => {
        const startDate = dayjs(client?.termStartDate || client?.startDate);
        const endDate = dayjs(client?.termEnd || client?.endDate);
        const configuredTerm = Number(client?.totalTerm);
        const calculatedTerm =
          startDate.isValid() && endDate.isValid()
            ? Math.max(endDate.diff(startDate, "month"), 0)
            : 0;
        const remainingDays = endDate.diff(dayjs().startOf("day"), "day");
        const revenue = getRenewalRevenueAmount(client);

        return {
          ...client,
          clientId: client?._id,
          srNo: index + 1,
          term: `${configuredTerm || calculatedTerm} Months`,
          formattedEndDate: endDate.format("DD-MMM-YYYY"),
          daysDue: Math.abs(remainingDays),
          channelLabel: client?.channel || client?.sourcing || "—",
          renewalRevenue: revenue,
          formattedRevenue: inrFormat(revenue),
          statusLabel: client?.currentStatus || "In Progress",
        };
      });
  }, [clients, renewalEndMonth, renewalStartMonth, revenues]);

  const previousMonthRenewalRevenue = useMemo(
    () => getMonthlyRenewalRevenue(clients, revenues, renewalStartMonth),
    [clients, renewalStartMonth, revenues],
  );
  const currentMonthRenewalRevenue = useMemo(
    () => getMonthlyRenewalRevenue(clients, revenues, renewalEndMonth),
    [clients, renewalEndMonth, revenues],
  );

  const renewClient = (client) => {
    if (!client?.clientName) return;

    dispatch(setSelectedClient(client));
    navigate(
      `/app/dashboard/sales-dashboard/co-working/client/${encodeURIComponent(client.clientName)}/client-details`,
      { state: { editMode: true, renewal: true } },
    );
  };

  const columns = [
    { field: "srNo", headerName: "Sr.No", width: 90 },
    { field: "clientName", headerName: "Customer Name", flex: 1.2 },
    { field: "formattedEndDate", headerName: "Expiry Date", flex: 0.9 },
    { field: "daysDue", headerName: "Days Due", flex: 0.7 },
    { field: "channelLabel", headerName: "Channel", flex: 0.8 },
    { field: "formattedRevenue", headerName: "Revenue (INR)", flex: 0.8 },
    {
      field: "statusLabel",
      headerName: "Status",
      flex: 0.7,
      cellRenderer: (params) => <StatusChip status={params.value} />,
    },
    {
      field: "actions",
      headerName: "Action",
      width: 140,
      pinned: "right",
      sortable: false,
      filter: false,
      cellRenderer: (params) => (
        <div className="flex h-full items-center gap-2">
          <button
            type="button"
            aria-label={`View ${params.data?.clientName || "client"} details`}
            onClick={() => setViewClient(params.data)}
            className="rounded-lg bg-[#eaf4ff] p-2 text-[#1E3D73]"
          >
            <MdOutlineRemoveRedEye size={18} />
          </button>
          <ThreeDotMenu
            rowId={params.data?._id || params.data?.srNo}
            menuItems={[
              {
                label: "Renew",
                onClick: () => renewClient(params.data),
              },
            ]}
            buttonSx={{
              color: "#1E3D73",
              backgroundColor: "#eaf4ff",
              borderRadius: 2,
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <WidgetSection
      autoHeight
      border
      normalCase
      borderColor="#1E3D73"
      bodyBorderColor="#9FB2CF"
      title={
        <div className="inline-flex flex-wrap items-baseline gap-2 leading-none text-[#1E3D73]">
          <BiznestTitle />
          <span>
            CO-WORKING FY {renewalFiscalYear} - RENEWALS IN{" "}
            {renewalStartMonth.format("MMMM").toUpperCase()} -{" "}
            {renewalEndMonth.format("MMMM").toUpperCase()}
          </span>
        </div>
      }
      headerRightContent={
        <div className="flex flex-wrap items-center justify-end gap-3 text-sm font-pmedium uppercase">
          <span className="rounded-lg border border-[#a9ddba] bg-[#d8f0df] px-3 py-2 text-[#16784d]">
            {renewalStartMonth.format("MMM").toUpperCase()}: {" "}
            {inrFormat(previousMonthRenewalRevenue)}
          </span>
          <span className="rounded-lg border border-[#aec6fb] bg-[#dbe4ff] px-3 py-2 text-[#274784]">
            {renewalEndMonth.format("MMM").toUpperCase()}: {" "}
            {inrFormat(currentMonthRenewalRevenue)}
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
          data={renewalRows}
          columns={columns}
          search
          hideFilter
          showDateControls={false}
        />
      </div>
      </WidgetSection>
      <MuiModal
        open={Boolean(viewClient)}
        onClose={() => setViewClient(null)}
        title={<span className="text-[#1E3D73]">View Client Details</span>}
        widthClass="w-[min(92vw,820px)]"
      >
        <CoworkingRenewalClientView client={viewClient} />
      </MuiModal>
    </>
  );
};

const CoWorkingDashboard = ({
  revenueOnly = false,
  uniqueClientsOnly = false,
  occupancyView = null,
  businessView = null,
  pipelineRenewalOnly = false,
}) => {
  const { headingRef, navigationRef, navigationStyle } =
    useBannerMenuAlignment();
  const axios = useAxiosPrivate();
  const { hasPermission } = useUserPermissions();
  const menuCards = [
    {
      title: "Onboard New Co-Working Customers",
      icon: <MdPersonAddAlt1 />,
      permission: PERMISSIONS.SALES_VERTICAL_COWORKING_ADD_CLIENT_CARD.value,
      items: [
        {
          label: "Client Onboarding",
          description: "Add a new co-working customer",
          icon: <FiUserPlus />,
          route:
            "/app/dashboard/sales-dashboard/co-working/client-onboarding",
        },
      ],
    },
    {
      title: "Overall Co-Working Summary",
      icon: <MdAssignmentInd />,
      permission:
        PERMISSIONS.SALES_VERTICAL_COWORKING_OVERALL_SUMMARY_CARD.value,
      items: [
        {
          label: "Client Details",
          description: "View all co-working customers",
          icon: <FiUsers />,
          route: "/app/dashboard/sales-dashboard/co-working/client-details",
        },
      ],
    },
    {
      title: "Mix-Bag",
      icon: <MdShoppingBag />,
      permission: PERMISSIONS.SALES_VERTICAL_COWORKING_MIX_BAG_CARD.value,
      openRoute: "/app/dashboard/sales-dashboard/co-working/mix-bag",
      items: [],
    },
    {
      title: "Data",
      icon: <SiGoogleadsense />,
      permission: PERMISSIONS.SALES_VERTICAL_COWORKING_DATA_CARD.value,
      items: [
        {
          label: "Vendor Data",
          description: "View and manage vendor records",
          icon: <FiDatabase />,
          route: "/app/dashboard/sales-dashboard/co-working/data",
        },
        {
          label: "Vendor Onboarding",
          description: "Add a new vendor record",
          icon: <FiUploadCloud />,
          route:
            "/app/dashboard/sales-dashboard/co-working/data/vendor-onboard",
        },
      ],
    },
  ].filter(
    (card) =>
      hasPermission(PERMISSIONS.SALES_VERTICAL_COWORKING.value) ||
      hasPermission(card.permission),
  );
  const fiscalYear = useMemo(() => getFiscalYear(), []);
  const { data: revenueGroups = [], isLoading: isRevenueLoading } = useQuery({
    queryKey: ["coWorkingData"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/fetch-coworking-revenues", {
        params: { useClientDetails: true },
      });

      return Array.isArray(response.data) ? response.data : [];
    },
  });
  const { data: coworkingClients = [], isLoading: areClientsLoading } = useQuery({
    queryKey: ["coWorkingDashboardClients"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/co-working-clients");
      return Array.isArray(response.data) ? response.data : [];
    },
  });
  const activeCoworkingClients = useMemo(
    () =>
      coworkingClients.filter((client) => {
        const activeValue = client?.isActive ?? client?.clientStatus;
        const normalizedValue = String(activeValue ?? "").toLowerCase();
        return activeValue === true || normalizedValue === "true" || normalizedValue === "active";
      }),
    [coworkingClients],
  );
  const revenueRows = useMemo(
    () =>
      revenueGroups.flatMap((group) =>
        Array.isArray(group?.clients) ? group.clients : [],
      ),
    [revenueGroups],
  );
  const revenueGraphData = useMemo(
    () => buildCoworkingRevenueGraphData(revenueRows, fiscalYear),
    [fiscalYear, revenueRows],
  );
  const revenueSummary = useMemo(() => {
    const graphSummary = revenueGraphData.reduce(
      (summary, row) => {
        const amount = getAmount(row?.reportingAmount);
        if (row?.vertical === "Balance KRA Target") summary.due += amount;
        else summary.booked += amount;
        return summary;
      },
      { booked: 0, due: 0 },
    );
    const paidDesks = revenueRows.reduce((total, row) => {
      const rentDate = dayjs(row?.rentDate);
      const isPaid =
        String(row?.rentStatus || "").trim().toLowerCase() === "paid";
      return rentDate.isValid() &&
        !rentDate.isBefore(fiscalYear.start) &&
        rentDate.isBefore(fiscalYear.end) &&
        isPaid
        ? total + getAmount(row?.noOfDesks)
        : total;
    }, 0);

    return {
      ...graphSummary,
      annualTarget: graphSummary.booked + graphSummary.due,
      paidDesks,
    };
  }, [fiscalYear.end, fiscalYear.start, revenueGraphData, revenueRows]);
  const activeUniqueCustomers = useMemo(
    () =>
      revenueRows.filter((row) => {
        const rentDate = dayjs(row?.rentDate);
        return (
          rentDate.isValid() &&
          !rentDate.isBefore(fiscalYear.start) &&
          rentDate.isBefore(fiscalYear.end) &&
          !dayjs()
            .startOf("month")
            .isBefore(rentDate.startOf("month").add(2, "month"), "month")
        );
      }).length,
    [fiscalYear.end, fiscalYear.start, revenueRows],
  );
  const clientSummary = useMemo(() => {
    const renewalEndMonth = dayjs().startOf("month");
    const renewalStartMonth = renewalEndMonth.subtract(1, "month");
    const isActiveClient = (client) => {
      const activeValue = client?.isActive ?? client?.clientStatus;
      const normalizedValue = String(activeValue ?? "").toLowerCase();
      return activeValue === true || normalizedValue === "true" || normalizedValue === "active";
    };
    const hasPendingRenewal = (client) => {
      const renewalDate = dayjs(client?.termEnd || client?.endDate);
      const isPreviousMonth =
        renewalDate.isValid() && renewalDate.isSame(renewalStartMonth, "month");
      const isCurrentMonth =
        renewalDate.isValid() && renewalDate.isSame(renewalEndMonth, "month");
      const renewalMonth = isPreviousMonth
        ? renewalStartMonth
        : renewalEndMonth;

      return (
        isActiveClient(client) &&
        (isPreviousMonth || isCurrentMonth) &&
        !hasPaidRenewal(revenueRows, client, renewalMonth)
      );
    };
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
      activeUniqueCustomers,
      pipelineRenewal: coworkingClients.filter(hasPendingRenewal).length,
      deadUniqueClients: coworkingClients.filter(
        (client) => !isActiveClient(client),
      ).length,
      averageShortfallSurplus: Math.round(
        latestActualRevenue - monthlyProjection,
      ),
    };
  }, [
    activeUniqueCustomers,
    coworkingClients,
    revenueGraphData,
    revenueRows,
  ]);
  const clientDetailsRoute =
    "/app/dashboard/sales-dashboard/mix-bag/clients/co-working";
  const shortfallSurplus = clientSummary.averageShortfallSurplus;
  const summaryCards = [
    {
      title: "Annual Revenue Target",
      value: inrFormat(revenueSummary.annualTarget),
      permission:
        PERMISSIONS.SALES_VERTICAL_COWORKING_ANNUAL_REVENUE_TARGET_CARD.value,
      icon: MdTrendingUp,
      iconClass: "bg-[#eafbf3] text-[#12a573]",
      valueClass: "text-[#1E3D73]",
      route: COWORKING_REVENUE_ROUTE,
    },
    {
      title: "Revenue Booked",
      value: inrFormat(revenueSummary.booked),
      permission:
        PERMISSIONS.SALES_VERTICAL_COWORKING_REVENUE_BOOKED_CARD.value,
      icon: CoworkingBarsIcon,
      iconClass: "bg-[#ecf9ff] text-[#13a573]",
      valueClass: "text-[#13a573]",
      route: COWORKING_REVENUE_ROUTE,
    },
    {
      title: "Revenue Due",
      value: inrFormat(revenueSummary.due),
      permission: PERMISSIONS.SALES_VERTICAL_COWORKING_REVENUE_DUE_CARD.value,
      icon: ChartNoAxesCombined,
      iconClass: "bg-[#fff0f5] text-[#f04a4a]",
      valueClass: "text-[#f04a4a]",
      route: COWORKING_REVENUE_ROUTE,
    },
    {
      title: "Average Co-Working Price",
      value: inrFormat(
        clientSummary.activeUniqueCustomers > 0
          ? Math.round(
              revenueSummary.booked / clientSummary.activeUniqueCustomers,
            )
          : 0,
      ),
      permission: PERMISSIONS.SALES_VERTICAL_COWORKING_AVERAGE_PRICE_CARD.value,
      icon: ChartPie,
      iconClass: "bg-[#eaf0f8] text-[#3F6291]",
      valueClass: "text-[#1E3D73]",
      route: COWORKING_REVENUE_ROUTE,
    },
    {
      title: "Active Unique Customers",
      value: clientSummary.activeUniqueCustomers.toLocaleString("en-IN"),
      permission:
        PERMISSIONS.SALES_VERTICAL_COWORKING_ACTIVE_UNIQUE_CUSTOMERS_CARD.value,
      icon: MdGroups,
      iconClass: "bg-[#eaf0f8] text-[#3F6291]",
      valueClass: "text-[#1E3D73]",
      route: clientDetailsRoute,
    },
    {
      title: "Pipeline Renewal",
      value: clientSummary.pipelineRenewal.toLocaleString("en-IN"),
      permission:
        PERMISSIONS.SALES_VERTICAL_COWORKING_PIPELINE_RENEWAL_CARD.value,
      icon: MdAutorenew,
      iconClass: "bg-[#eaf0f8] text-[#3F6291]",
      valueClass: "text-[#1E3D73]",
      route: clientDetailsRoute,
    },
    {
      title: "Dead Unique Clients",
      value: clientSummary.deadUniqueClients.toLocaleString("en-IN"),
      permission:
        PERMISSIONS.SALES_VERTICAL_COWORKING_DEAD_UNIQUE_CLIENTS_CARD.value,
      icon: MdPersonOff,
      iconClass: "bg-[#fff0f5] text-[#f04a4a]",
      valueClass: "text-[#f04a4a]",
      route: clientDetailsRoute,
    },
    {
      title: "Average Shortfall / Surplus",
      value: `${inrFormat(Math.abs(shortfallSurplus))} ${
        shortfallSurplus > 0
          ? "Surplus"
          : shortfallSurplus < 0
            ? "Shortfall"
            : "On Target"
      }`,
      permission:
        PERMISSIONS.SALES_VERTICAL_COWORKING_AVERAGE_SHORTFALL_SURPLUS_CARD.value,
      icon: MdTrendingDown,
      iconClass:
        shortfallSurplus >= 0
          ? "bg-[#eafbf3] text-[#12a573]"
          : "bg-[#fff0f0] text-[#f04a4a]",
      valueClass:
        shortfallSurplus >= 0 ? "text-[#13a573]" : "text-[#f04a4a]",
      route: COWORKING_REVENUE_ROUTE,
    },
  ];
  const visibleSummaryCards = summaryCards.filter((card) =>
    hasPermission(card.permission),
  );
  const canViewRevenueGraph = hasPermission(
    PERMISSIONS.SALES_VERTICAL_COWORKING_REVENUES_GRAPH.value,
  );
  const canViewUniqueClientsGraph = hasPermission(
    PERMISSIONS.SALES_VERTICAL_COWORKING_UNIQUE_CLIENT_COUNT_GRAPH.value,
  );
  const occupancyPermissions = {
    sector:
      PERMISSIONS.SALES_VERTICAL_COWORKING_SECTOR_WISE_OCCUPANCY_GRAPH.value,
    desk: PERMISSIONS.SALES_VERTICAL_COWORKING_DESK_WISE_OCCUPANCY_GRAPH.value,
  };
  const visibleOccupancyCharts = ["sector", "desk"].filter((chart) =>
    hasPermission(occupancyPermissions[chart]),
  );
  const businessChartPermissions = {
    activeStatus:
      PERMISSIONS.SALES_VERTICAL_COWORKING_ACTIVE_VS_INACTIVE_CLIENT_CHART
        .value,
    clientType: PERMISSIONS.SALES_VERTICAL_COWORKING_CLIENT_TYPE_CHART.value,
  };
  const visibleBusinessCharts = ["activeStatus", "clientType"].filter(
    (chart) => hasPermission(businessChartPermissions[chart]),
  );
  const canViewPipelineRenewalTable = hasPermission(
    PERMISSIONS.SALES_VERTICAL_COWORKING_PIPELINE_RENEWAL_TABLE.value,
  );
  if (revenueOnly) {
    return (
      <div className="p-3 pt-3">
        <CoworkingRevenueGraph
          graphData={revenueGraphData}
          revenueRows={revenueRows}
          fiscalYear={fiscalYear}
          isLoading={isRevenueLoading}
        />
      </div>
    );
  }

  if (uniqueClientsOnly) {
    return (
      <div className="p-3 pt-3">
        <CoworkingUniqueClientsGraph revenueRows={revenueRows} />
      </div>
    );
  }

  if (occupancyView) {
    return (
      <div className="p-3 pt-3">
        <CoworkingOccupancyCharts
          clients={activeCoworkingClients}
          isLoading={areClientsLoading}
          visibleCharts={[occupancyView]}
        />
      </div>
    );
  }

  if (businessView) {
    return (
      <div className="p-3 pt-3">
        <CoworkingBusinessCharts
          clients={coworkingClients}
          areClientsLoading={areClientsLoading}
          visibleCharts={[businessView]}
        />
      </div>
    );
  }

  if (pipelineRenewalOnly) {
    return (
      <div className="p-3 pt-3">
        <CoworkingRenewalTable
          clients={coworkingClients}
          revenues={revenueRows}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-3 pt-3">
      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="relative h-56 w-full md:h-[17rem] xl:h-[19rem]">
          <img
            src={coWorkingBanner}
            alt="BIZNest Co-Working dashboard banner"
            className="h-full w-full object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-[55%]"
            style={{
              background:
                "linear-gradient(to right, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.95) 86%, rgba(255,255,255,0) 100%)",
            }}
          />
          <div className="absolute inset-y-0 left-0 flex w-[55%] flex-col px-1 py-4 sm:py-6">
            <p className="font-pregular text-xs uppercase tracking-[0.02em] text-[#1E3D73] sm:text-base lg:text-[15px] min-[1700px]:text-base min-[1900px]:text-lg">
              Co-Working Dashboard
            </p>
            <h1 className="mt-6 max-w-full whitespace-nowrap font-serif text-3xl font-semibold leading-[0.9] text-[#1E3D73] drop-shadow-sm sm:mt-10 sm:text-5xl lg:origin-left lg:scale-x-90 lg:text-[38px] xl:text-[42px] min-[1700px]:text-[46px] min-[1900px]:scale-x-100 min-[1900px]:text-[50px]">
              <span ref={headingRef} className="inline-block whitespace-nowrap">
                CO-WORKING <span className="text-[#E64B4B]">DASHBOARD</span>
              </span>
            </h1>
            <p className="mt-5 max-w-full font-pmedium text-xl leading-[0.94] text-[#1E3D73] sm:mt-8 sm:text-3xl md:whitespace-nowrap lg:text-[35px] min-[1700px]:text-[39px] min-[1900px]:text-[46px]">
              Co-Working Customers
            </p>
          </div>
          <nav
            ref={navigationRef}
            aria-label="Co-Working dashboard navigation"
            className="absolute bottom-0 left-0 z-10 flex w-fit max-w-[61%] items-end gap-6 overflow-x-auto px-1 sm:gap-8 lg:w-[47.5%] lg:max-w-none lg:justify-between lg:gap-2 min-[1700px]:w-fit min-[1700px]:max-w-[61%] min-[1700px]:gap-10"
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
            <DashboardPopupMenu
              cards={menuCards}
              moduleLabel="Co-Working"
            />
          </nav>
        </div>
      </div>

      {visibleSummaryCards.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {visibleSummaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
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
                    {isRevenueLoading || areClientsLoading ? "—" : card.value}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      )}

      {canViewRevenueGraph && (
        <CoworkingRevenueGraph
          graphData={revenueGraphData}
          revenueRows={revenueRows}
          fiscalYear={fiscalYear}
          isLoading={isRevenueLoading}
        />
      )}

      {canViewUniqueClientsGraph && (
        <CoworkingUniqueClientsGraph revenueRows={revenueRows} />
      )}

      {visibleOccupancyCharts.length > 0 && (
        <CoworkingOccupancyCharts
          clients={activeCoworkingClients}
          isLoading={areClientsLoading}
          visibleCharts={visibleOccupancyCharts}
        />
      )}

      {visibleBusinessCharts.length > 0 && (
        <CoworkingBusinessCharts
          clients={coworkingClients}
          areClientsLoading={areClientsLoading}
          visibleCharts={visibleBusinessCharts}
        />
      )}

      {canViewPipelineRenewalTable && (
        <CoworkingRenewalTable
          clients={coworkingClients}
          revenues={revenueRows}
        />
      )}
    </div>
  );
};

export default CoWorkingDashboard;
