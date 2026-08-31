import { CircularProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DonutChart from "../../../components/graphs/DonutChart";
import PieChartMui from "../../../components/graphs/PieChartMui";
import WidgetSection from "../../../components/WidgetSection";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

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

  return (
    <WidgetSection layout={2}>
      {visibleCharts.map((key) => {
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
                <DonutChart
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
                  height={320}
                  centerAlign
                />
              )}
            </div>
          </WidgetSection>
        );
      })}
    </WidgetSection>
  );
};

export default InvestorOperationalCharts;
