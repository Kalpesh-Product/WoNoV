import { CircularProgress, Chip } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ReactApexChart from "react-apexcharts";
import dayjs from "dayjs";
import AgTable from "../../../components/AgTable";
import PieChartMui from "../../../components/graphs/PieChartMui";
import WidgetSection from "../../../components/WidgetSection";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import useResponsiveChart from "../../../hooks/useResponsiveChart";

const palette = [
  "#121A33",
  "#28324A",
  "#2F57E5",
  "#3773FF",
  "#4D86FF",
  "#1F8ED6",
  "#0D78AD",
];

const sectorPalette = [
  "#1E3D73",
  "#34528A",
  "#4A68A1",
  "#608DB8",
  "#76A2CF",
  "#8CB8E6",
];

const genderPalette = ["#1E3D73", "#54C4A7"];

const locationChartColors = [
  "#1E3D73",
  "#FF6B6B",
  "#4ECDC4",
  "#F7B801",
  "#8E44AD",
  "#2ECC71",
  "#FF8C42",
];

const visitorCategoryColors = [
  "#54C4A7",
  "#FFB946",
  "#FF4D4F",
  "#6A5ACD",
  "#00C49F",
];

const visitorClientTypeColors = ["#4BC0C0", "#36A2EB"];
const visitorGenderColors = ["#0056B3", "#FD507E"];

const legendFormatter = (seriesName) =>
  `<span title="${seriesName}" style="display:inline-block;max-width:92px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;vertical-align:bottom;font-size:12px;line-height:1.2;">${seriesName}</span>`;

const calculateAgreementExpiry = (startDate, endDate) => {
  if (!startDate || !endDate) return "-";

  const start = dayjs(startDate);
  const end = dayjs(endDate);
  if (!start.isValid() || !end.isValid() || end.isBefore(start)) return "-";

  const totalDays = end.diff(start, "day");
  const remainingDays = Math.min(
    totalDays,
    Math.max(0, end.diff(dayjs(), "day")),
  );

  return `${remainingDays}/${totalDays} ${totalDays === 1 ? "day" : "days"}`;
};

const pieOptions = (labels, suffix, colors = palette) => ({
  chart: { type: "pie", fontFamily: "Poppins-Regular" },
  labels,
  colors,
  legend: {
    position: "bottom",
    horizontalAlign: "center",
    itemMargin: {
      horizontal: 4,
      vertical: 2,
    },
    formatter: legendFormatter,
  },
  tooltip: { y: { formatter: (value) => `${value} ${suffix}` } },
});

const InvestorDonutChart = ({
  centerLabel,
  labels,
  colors,
  series,
  tooltipValue,
  legendFormatter,
  legendPosition = "bottom",
  height = 350,
}) => {
  const { chartKey, containerRef } = useResponsiveChart();

  const chartOptions = {
    chart: {
      type: "donut",
      animations: { enabled: false },
      fontFamily: "Poppins-Regular",
    },
    colors,
    labels,
    legend: {
      position: legendPosition,
      formatter: legendFormatter,
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(0)}%`,
    },
    tooltip: {
      enabled: true,
      custom: function ({ seriesIndex }) {
        const fullLabel = labels[seriesIndex];
        const tooltipDetail = tooltipValue?.[seriesIndex];
        return `<div style="padding: 8px">
                  <strong>${fullLabel}</strong>${
                    tooltipDetail ? `<br/><span>${tooltipDetail}</span>` : ""
                  }
                </div>`;
      },
      y: {
        formatter: (val, { seriesIndex }) => `${tooltipValue[seriesIndex]}`,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            value: {
              show: true,
              fontSize: "14px",
              fontWeight: 500,
              formatter: function (val) {
                const numericVal = parseFloat(val);
                return `${numericVal.toLocaleString("en-IN")}`;
              },
            },
            total: {
              show: true,
              label: `${centerLabel}`,
              fontSize: "16px",
              fontWeight: "bold",
              formatter: function (w) {
                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return `${total.toLocaleString("en-IN")}`;
              },
            },
          },
        },
      },
    },
  };

  return (
    <div className="rounded-md" ref={containerRef}>
      <ReactApexChart
        key={chartKey}
        options={chartOptions}
        series={series}
        type="donut"
        height={height}
        width="100%"
      />
    </div>
  );
};

const topWithOther = (entries, limit = 6, includeOther = true) => {
  const sorted = entries.sort((a, b) => b.value - a.value);
  const visible = sorted.slice(0, limit);
  if (!includeOther) return visible;
  const other = sorted.slice(limit).reduce((sum, item) => sum + item.value, 0);
  return other ? [...visible, { label: "Other", value: other }] : visible;
};

const InvestorOperationalCharts = ({ visibleCharts, routes }) => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const needsClients = visibleCharts.some((key) =>
    ["sector", "client", "gender", "india", "desks"].includes(key),
  );
  const needsVisitors = visibleCharts.some((key) =>
    ["visitorCategory", "visitorClientType", "visitorGender"].includes(key),
  );

  const { data: clients = [], isPending: clientsPending } = useQuery({
    queryKey: ["investor-operational-coworking-clients"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/co-working-clients");
      return Array.isArray(response.data)
        ? response.data.filter((client) => client.isActive)
        : [];
    },
    enabled: needsClients,
  });
  const showClientDetails =
    visibleCharts.length === 1 &&
    ["client", "desks"].includes(visibleCharts[0]);
  const showGenderDetails =
    visibleCharts.length === 1 && visibleCharts[0] === "gender";
  const showIndiaDetails =
    visibleCharts.length === 1 && visibleCharts[0] === "india";
  const showSectorDetails =
    visibleCharts.length === 1 && visibleCharts[0] === "sector";
  const showVisitorCategoryDetails =
    visibleCharts.length === 1 && visibleCharts[0] === "visitorCategory";
  const showVisitorClientTypeDetails =
    visibleCharts.length === 1 && visibleCharts[0] === "visitorClientType";
  const showVisitorGenderDetails =
    visibleCharts.length === 1 && visibleCharts[0] === "visitorGender";
  const { data: allCoworkingClients = [] } = useQuery({
    queryKey: ["investor-client-wise-occupancy-details"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/co-working-clients");
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: showClientDetails,
  });

  const { data: visitors = [], isPending: visitorsPending } = useQuery({
    queryKey: ["investor-operational-visitors"],
    queryFn: async () => {
      const response = await axios.get("/api/visitors/fetch-visitors");
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: needsVisitors,
  });

  const chartData = useMemo(() => {
    const deskEntries = topWithOther(
      clients
        .map((client) => ({
          label: client.clientName || "Unknown",
          value: Number(client.totalDesks) || 0,
        }))
        .filter((item) => item.value > 0),
    );

    const countBy = (items, getLabel, { skipUnknown = false } = {}) =>
      Object.entries(
        items.reduce((counts, item) => {
          const label = String(getLabel(item) || "").trim();
          if (skipUnknown && (!label || label.toLowerCase() === "unknown")) {
            return counts;
          }
          const finalLabel = label || "Unknown";
          counts[finalLabel] = (counts[finalLabel] || 0) + 1;
          return counts;
        }, {}),
      ).map(([label, value]) => ({ label, value }));

    const sectors = topWithOther(
      countBy(clients, (client) => client.sector, { skipUnknown: true }),
      5,
      true,
    );
    const states = topWithOther(
      countBy(clients, (client) => client.hostate?.trim() || client.hoState?.trim()),
    );
    const members = clients.flatMap((client) =>
      Array.isArray(client.members) ? client.members : [],
    );
    const memberGender = countBy(members, (member) => {
      const gender = String(member.gender || "").trim().toLowerCase();
      if (gender.startsWith("m")) return "Male";
      if (gender.startsWith("f")) return "Female";
      return "Other";
    });
    const visitorCategories = topWithOther(
      countBy(visitors, (visitor) => visitor.visitorType),
    );
    const visitorGender = countBy(visitors, (visitor) => {
      const gender = String(visitor.gender || "").trim().toLowerCase();
      if (gender === "male") return "Male";
      if (gender === "female") return "Female";
      return "Other";
    });
    const internal = visitors.filter(
      (visitor) => visitor.visitorFlag !== "Client",
    ).length;
    const external = visitors.length - internal;

    return {
      sector: {
        title: "Sector-wise Occupancy",
        data: sectors,
        suffix: "Clients",
        colors: sectorPalette,
      },
      client: { title: "Client-wise Occupancy", data: deskEntries, suffix: "Desks" },
      gender: {
        title: "Client Member Gender Wise Data",
        data: memberGender,
        suffix: "Members",
        colors: genderPalette,
      },
      india: {
        title: "India-wise Members",
        data: states,
        suffix: "Companies",
        colors: locationChartColors,
      },
      desks: { title: "Total Desks Company Wise", data: deskEntries, suffix: "Desks" },
      visitorCategory: {
        title: "Overall visitor category",
        donut: true,
        data: visitorCategories,
        colors: visitorCategoryColors,
      },
      visitorClientType: {
        title: "Overall visitor Internal & External Clients",
        donut: true,
        data: [
          { label: "Internal Visitors", value: internal },
          { label: "External Clients", value: external },
        ],
        colors: visitorClientTypeColors,
      },
      visitorGender: {
        title: "Overall Visitor Gender Data",
        data: visitorGender,
        suffix: "Visitors",
        colors: visitorGenderColors,
      },
    };
  }, [clients, visitors]);

  const isLoading = clientsPending || visitorsPending;

  const renderChart = (key) => {
    const chart = chartData[key];
    const labels = chart.data.map((item) => item.label);
    const series = chart.data.map((item) => item.value);

    return (
      <WidgetSection key={key} title={chart.title} border>
        <div
          className="cursor-pointer"
          role="button"
          tabIndex={0}
          aria-label={`View ${chart.title}`}
          onClick={() => navigate(routes[key])}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") navigate(routes[key]);
          }}
        >
          {isLoading ? (
            <div className="flex h-80 items-center justify-center">
              <CircularProgress />
            </div>
          ) : chart.donut ? (
            <InvestorDonutChart
              centerLabel="Visitors"
              labels={labels}
              colors={chart.colors || palette}
              series={series}
              tooltipValue={series.map((value) => `${value} Visitors`)}
              legendFormatter={legendFormatter}
            />
          ) : (
            <PieChartMui
              data={chart.data}
              options={pieOptions(labels, chart.suffix, chart.colors || palette)}
              width={500}
              height={350}
              centerAlign
            />
          )}
        </div>
      </WidgetSection>
    );
  };

  const fullWidthChartKeys = ["desks", "visitorGender"];
  const regularCharts = visibleCharts.filter(
    (key) => !fullWidthChartKeys.includes(key),
  );
  const fullWidthCharts = visibleCharts.filter((key) =>
    fullWidthChartKeys.includes(key),
  );
  const clientDetailsData = useMemo(
    () =>
      [...allCoworkingClients]
        .sort(
          (a, b) =>
            Number(b.openDesks || 0) + Number(b.cabinDesks || 0) -
            (Number(a.openDesks || 0) + Number(a.cabinDesks || 0)),
        )
        .map((client, index) => {
          const desks =
            Number(client.openDesks || 0) + Number(client.cabinDesks || 0);

          return {
            id: index + 1,
            clientName: client.clientName || "Unknown",
            desks,
            occupancy: ((desks / 589) * 100).toFixed(1),
            agreementExpiry: calculateAgreementExpiry(
              client.startDate,
              client.endDate,
            ),
            status: Boolean(client.isActive),
          };
        }),
    [allCoworkingClients],
  );

  const clientDetailsColumns = [
    { field: "id", headerName: "Sr No", width: 150 },
    { field: "clientName", headerName: "Client Name", flex: 1 },
    { field: "desks", headerName: "Desks", flex: 0.5 },
    {
      field: "occupancy",
      headerName: "Occupancy (%)",
      flex: 0.5,
      cellRenderer: (params) => `${params.value}%`,
    },
    { field: "agreementExpiry", headerName: "Agreement Expiry", flex: 0.5 },
    {
      field: "status",
      headerName: "Status",
      sort: "desc",
      flex: 1,
      cellRenderer: (params) => (
        <Chip
          label={params.value ? "Active" : "Inactive"}
          style={
            params.value
              ? { backgroundColor: "#90EE90", color: "#006400" }
              : { backgroundColor: "#FFECC5", color: "#CC8400" }
          }
        />
      ),
    },
  ];
  const desksDetailsColumns = [
    { field: "id", headerName: "Sr No", width: 150 },
    { field: "clientName", headerName: "Client Name", flex: 1 },
    { field: "desks", headerName: "Desks", flex: 0.5 },
  ];
  const genderDetailsData = [
    {
      id: 1,
      male:
        chartData.gender?.data.find((item) => item.label === "Male")?.value ||
        0,
      female:
        chartData.gender?.data.find((item) => item.label === "Female")?.value ||
        0,
    },
  ];
  const genderDetailsColumns = [
    { field: "id", headerName: "Sr No", width: 150 },
    { field: "male", headerName: "Male", flex: 1 },
    { field: "female", headerName: "Female", flex: 1 },
  ];
  const indiaDetailsData = chartData.india?.data.map((item, index) => ({
    id: index + 1,
    state: item.label,
    memberCount: item.value,
  }));
  const indiaDetailsColumns = [
    { field: "id", headerName: "Sr No", width: 150 },
    { field: "state", headerName: "State", flex: 1 },
    { field: "memberCount", headerName: "Member Count", flex: 1 },
  ];
  const sectorDetailsData = chartData.sector?.data.map((item, index) => ({
    id: index + 1,
    sector: item.label,
    clientCount: item.value,
  }));
  const sectorDetailsColumns = [
    { field: "id", headerName: "Sr No", width: 150 },
    { field: "sector", headerName: "Sector", flex: 1 },
    { field: "clientCount", headerName: "Client Count", flex: 1 },
  ];
  const visitorCategoryDetailsData = chartData.visitorCategory?.data.map(
    (item, index) => ({
      id: index + 1,
      visitorType: item.label,
      visitorCount: item.value,
    }),
  );
  const visitorCategoryDetailsColumns = [
    { field: "id", headerName: "Sr No", width: 150 },
    { field: "visitorType", headerName: "Visitor Type", flex: 1 },
    { field: "visitorCount", headerName: "Visitor Count", flex: 1 },
  ];
  const visitorGenderDetailsData = chartData.visitorGender?.data.map(
    (item, index) => ({
      id: index + 1,
      gender: item.label,
      visitorCount: item.value,
    }),
  );
  const visitorGenderDetailsColumns = [
    { field: "id", headerName: "Sr No", width: 150 },
    { field: "gender", headerName: "Gender", flex: 1 },
    { field: "visitorCount", headerName: "Visitor Count", flex: 1 },
  ];
  const visitorCategoryTotal = visitorCategoryDetailsData.reduce(
    (total, item) => total + Number(item.visitorCount || 0),
    0,
  );
  const visitorClientTypeDetailsData = chartData.visitorClientType?.data.map(
    (item, index) => ({
      id: index + 1,
      visitorType: item.label,
      visitorCount: item.value,
    }),
  );
  const visitorClientTypeTotal = visitorClientTypeDetailsData.reduce(
    (total, item) => total + Number(item.visitorCount || 0),
    0,
  );

  return (
    <>
      {regularCharts.length > 0 && (
        <WidgetSection layout={2} gridGap="gap-x-4 gap-y-6">
          {regularCharts.map(renderChart)}
        </WidgetSection>
      )}
      {fullWidthCharts.length > 0 && (
        <div className="-mt-2">
          <WidgetSection layout={1}>
            {fullWidthCharts.map(renderChart)}
          </WidgetSection>
        </div>
      )}
      {showClientDetails && (
        <div className="px-4">
          <WidgetSection title="CO-WORKING CLIENT DETAILS" border>
            <AgTable
              data={clientDetailsData}
              columns={
                visibleCharts[0] === "desks"
                  ? desksDetailsColumns
                  : clientDetailsColumns
              }
              search
            />
          </WidgetSection>
        </div>
      )}
      {showGenderDetails && (
        <div className="px-4">
          <WidgetSection title="CLIENT MEMBER GENDER WISE DETAILS" border>
            <AgTable
              data={genderDetailsData}
              columns={genderDetailsColumns}
              search
            />
          </WidgetSection>
        </div>
      )}
      {showIndiaDetails && (
        <div className="px-4">
          <WidgetSection title="INDIA-WISE MEMBERS DETAILS" border>
            <AgTable data={indiaDetailsData} columns={indiaDetailsColumns} search />
          </WidgetSection>
        </div>
      )}
      {showSectorDetails && (
        <div className="px-4">
          <WidgetSection title="SECTOR-WISE OCCUPANCY DETAILS" border>
            <AgTable data={sectorDetailsData} columns={sectorDetailsColumns} search />
          </WidgetSection>
        </div>
      )}
      {showVisitorCategoryDetails && (
        <div className="px-4">
          <WidgetSection
            title="OVERALL VISITOR CATEGORY DETAILS"
            TitleAmountTotal={visitorCategoryTotal}
            totalTitle="TOTAL"
            summaryChipVariant="ticket"
            border
          >
            <AgTable
              data={visitorCategoryDetailsData}
              columns={visitorCategoryDetailsColumns}
              search
            />
          </WidgetSection>
        </div>
      )}
      {showVisitorClientTypeDetails && (
        <div className="px-4">
          <WidgetSection
            title="OVERALL VISITOR INTERNAL & EXTERNAL CLIENTS DETAILS"
            TitleAmountTotal={visitorClientTypeTotal}
            totalTitle="TOTAL"
            summaryChipVariant="ticket"
            border
          >
            <AgTable
              data={visitorClientTypeDetailsData}
              columns={visitorCategoryDetailsColumns}
              search
            />
          </WidgetSection>
        </div>
      )}
      {showVisitorGenderDetails && (
        <div className="px-4">
          <WidgetSection title="OVERALL VISITOR GENDER DETAILS" border>
            <AgTable
              data={visitorGenderDetailsData}
              columns={visitorGenderDetailsColumns}
              search
            />
          </WidgetSection>
        </div>
      )}
    </>
  );
};

export default InvestorOperationalCharts;
