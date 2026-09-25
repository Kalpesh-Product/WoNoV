import { CircularProgress } from "@mui/material";
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
  "#6FA2D6",
];

const genderPalette = ["#1E3D73", "#54C4A7"];
const agePalette = ["#174EA6", "#2D7FF9", "#F7B801", "#20BFA9", "#7C4DCC"];

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
const nonClickableOccupancyCharts = new Set([
  "sector",
  "india",
  "gender",
  "age",
]);

const legendFormatter = (seriesName) =>
  `<span title="${seriesName}" style="display:inline-block;max-width:92px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;vertical-align:bottom;font-size:12px;line-height:1.2;">${seriesName}</span>`;

const singleLineLegendFormatter = (seriesName) =>
  `<span title="${seriesName}" style="display:inline-block;max-width:96px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;vertical-align:bottom;font-size:10px;line-height:1.2;">${seriesName}</span>`;

const blueLegendFormatter = (seriesName) =>
  `<span title="${seriesName}" style="display:inline-block;max-width:92px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;vertical-align:bottom;font-size:12px;line-height:1.2;color:#1234c9;">${seriesName}</span>`;

const navyLegendFormatter = (seriesName) =>
  `<span title="${seriesName}" style="display:inline-block;max-width:92px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;vertical-align:bottom;font-size:12px;line-height:1.2;color:#1E3D73;">${seriesName}</span>`;

const singleLineNavyLegendFormatter = (seriesName) =>
  `<span title="${seriesName}" style="display:inline-block;white-space:nowrap;vertical-align:bottom;font-size:12px;line-height:1.2;color:#1E3D73;">${seriesName}</span>`;

const pieOptions = (
  labels,
  suffix,
  colors = palette,
  singleLine = false,
  blueLegend = false,
  navyLegend = false,
  compactLegend = false,
) => ({
  chart: { type: "pie", fontFamily: "Poppins-Regular" },
  labels,
  colors,
  legend: {
    show: !singleLine,
    position: "bottom",
    horizontalAlign: "center",
    width: "100%",
    height: labels.length > 8 ? 72 : 48,
    ...(singleLine || compactLegend
      ? {
          width: singleLine ? 850 : "100%",
          fontSize: compactLegend ? "12px" : "10px",
          markers: { width: 8, height: 8 },
        }
      : {}),
    itemMargin: {
      horizontal: singleLine || compactLegend ? 2 : 4,
      vertical: singleLine || compactLegend ? 0 : 4,
    },
    ...(blueLegend || navyLegend
      ? {
          labels: {
            colors: navyLegend ? "#1E3D73" : "#1234c9",
          },
        }
      : {}),
    formatter: compactLegend
      ? singleLineNavyLegendFormatter
      : navyLegend
      ? navyLegendFormatter
      : blueLegend
        ? blueLegendFormatter
      : singleLine
        ? singleLineLegendFormatter
        : legendFormatter,
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

const InvestorOperationalCharts = ({
  visibleCharts,
  routes,
  showDetails = false,
  flushLayout = false,
  investorInventoryStyle = false,
  noOuterPadding = false,
}) => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const needsClients = visibleCharts.some((key) =>
    ["sector", "age", "gender", "india"].includes(key),
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
  const showGenderDetails =
    showDetails && visibleCharts.length === 1 && visibleCharts[0] === "gender";
  const showAgeDetails =
    showDetails && visibleCharts.length === 1 && visibleCharts[0] === "age";
  const showIndiaDetails =
    showDetails && visibleCharts.length === 1 && visibleCharts[0] === "india";
  const showSectorDetails =
    showDetails && visibleCharts.length === 1 && visibleCharts[0] === "sector";
  const showVisitorCategoryDetails =
    showDetails &&
    visibleCharts.length === 1 &&
    visibleCharts[0] === "visitorCategory";
  const showVisitorClientTypeDetails =
    showDetails &&
    visibleCharts.length === 1 &&
    visibleCharts[0] === "visitorClientType";
  const showVisitorGenderDetails =
    showDetails &&
    visibleCharts.length === 1 &&
    visibleCharts[0] === "visitorGender";
  const { data: visitors = [], isPending: visitorsPending } = useQuery({
    queryKey: ["investor-operational-visitors"],
    queryFn: async () => {
      const response = await axios.get("/api/visitors/fetch-visitors");
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: needsVisitors,
  });

  const chartData = useMemo(() => {
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
    const ageGroups = [
      { label: "21-25 Age Group", min: 21, max: 25 },
      { label: "26-30 Age Group", min: 26, max: 30 },
      { label: "30-35 Age Group", min: 31, max: 35 },
      { label: "35-40 Age Group", min: 36, max: 40 },
      { label: "40+ Age Group", min: 41, max: Infinity },
    ].map((group) => ({ ...group, value: 0 }));

    members.forEach((member) => {
      const dob = dayjs(member.dob || member.dateOfBirth);
      if (!dob.isValid()) return;

      const age = dayjs().diff(dob, "year");
      const group = ageGroups.find(
        ({ min, max }) => age >= min && age <= max,
      );
      if (group) group.value += 1;
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
      age: {
        title: "Age-Wise Occupancy",
        data: ageGroups.map(({ label, value }) => ({ label, value })),
        suffix: "Members",
        colors: agePalette,
      },
      gender: {
        title: "Gender-Wise Occupancy",
        data: memberGender,
        suffix: "Members",
        colors: genderPalette,
      },
      india: {
        title: "India-wise Occupancy",
        data: states,
        suffix: "Companies",
        colors: locationChartColors,
      },
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

  const isLoading =
    (needsClients && clientsPending) || (needsVisitors && visitorsPending);

  const renderChart = (key) => {
    const chart = chartData[key];
    const isClickable = !nonClickableOccupancyCharts.has(key) && routes?.[key];
    const labels = chart.data.map((item) => item.label);
    const series = chart.data.map((item) => item.value);
    const chartColors = chart.colors || palette;
    const hasScrollableLegend = ["sector", "age", "gender", "india"].includes(
      key,
    );
    const useBlueText =
      ["age", "gender", "sector", "india"].includes(key) ||
      (investorInventoryStyle && ["sector", "india"].includes(key));
    const useNavyText = ["age", "gender", "sector", "india"].includes(key);
    const useInvestorBorder = ["age", "gender", "sector", "india"].includes(
      key,
    );
    const customChartLegend = hasScrollableLegend && (
      <div className="w-full max-w-full px-2 pb-1 select-none">
        <div
          className={`flex items-center justify-center gap-y-2 ${
            key === "age" ? "flex-nowrap gap-x-2" : "flex-wrap gap-x-4"
          }`}
        >
          {labels.map((label, index) => (
            <div
              key={label}
              className={`flex min-w-0 items-center gap-1 text-xs ${
                useNavyText
                  ? "text-[#1E3D73]"
                  : useBlueText
                    ? "text-[#1234c9]"
                    : ""
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: chartColors[index] }}
              />
              <span
                className={key === "age" ? "whitespace-nowrap" : "max-w-28 truncate"}
                title={label}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );

    return (
      <WidgetSection
        key={key}
        borderColor={useInvestorBorder ? "#1E3D73" : undefined}
        bodyBorderColor={useInvestorBorder ? "#9FB2CF" : undefined}
        title={
          useBlueText ? (
            <span className={useNavyText ? "text-[#1E3D73]" : "text-[#1234c9]"}>
              {chart.title}
            </span>
          ) : (
            chart.title
          )
        }
        border
        height={flushLayout ? "h-[433px]" : undefined}
       // height={fillHeight}
      >
        <div
          className={isClickable ? "cursor-pointer" : ""}
          {...(isClickable
            ? {
                role: "button",
                tabIndex: 0,
                "aria-label": `View ${chart.title}`,
                onClick: () => navigate(routes[key]),
                onKeyDown: (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    navigate(routes[key]);
                  }
                },
              }
            : {})}
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
              options={pieOptions(
                labels,
                chart.suffix,
                chartColors,
                hasScrollableLegend,
                useBlueText,
                useNavyText,
                key === "age",
              )}
              width={500}
              height={350}
              customLegend={customChartLegend}
              customChartAreaHeight={
                key === "age" || key === "gender" ? 302 : undefined
              }
              centerAlign
            />
          )}
        </div>
      </WidgetSection>
    );
  };

  const fullWidthChartKeys = ["visitorGender"];
  const regularCharts = visibleCharts.filter(
    (key) => !fullWidthChartKeys.includes(key),
  );
  const fullWidthCharts = visibleCharts.filter((key) =>
    fullWidthChartKeys.includes(key),
  );
  const genderDetailsData = (chartData.gender?.data || [])
    .filter((item) => ["Male", "Female"].includes(item.label))
    .map((item, index) => ({
      id: index + 1,
      gender: item.label,
      count: item.value,
    }));
  const genderDetailsColumns = [
    { field: "id", headerName: "Sr No", width: 150 },
    { field: "gender", headerName: "Gender", flex: 1 },
    { field: "count", headerName: "Count", flex: 1 },
  ];
  const ageGroupTotal = (chartData.age?.data || []).reduce(
    (total, item) => total + Number(item.value || 0),
    0,
  );
  const ageDetailsData = (chartData.age?.data || []).map((item, index) => ({
    id: index + 1,
    ageGroup: item.label,
    members: Number(item.value || 0),
    occupancy: ageGroupTotal
      ? `${((Number(item.value || 0) / ageGroupTotal) * 100).toFixed(1)}%`
      : "0.0%",
  }));
  const ageDetailsColumns = [
    { field: "id", headerName: "Sr No", width: 150 },
    { field: "ageGroup", headerName: "Age Group", flex: 1 },
    { field: "members", headerName: "Members", flex: 1 },
    { field: "occupancy", headerName: "Occupancy", flex: 1 },
  ];
  const indiaDetailsData = useMemo(() => {
    const stateCounts = clients.reduce((counts, client) => {
      const state = String(
        client.hostate?.trim() || client.hoState?.trim() || "",
      );
      if (!state || state.toLowerCase() === "unknown") return counts;
      counts[state] = (counts[state] || 0) + 1;
      return counts;
    }, {});

    return Object.entries(stateCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([state, memberCount], index) => ({
        id: index + 1,
        state,
        memberCount,
      }));
  }, [clients]);
  const indiaDetailsColumns = [
    { field: "id", headerName: "Sr No", width: 150 },
    { field: "state", headerName: "State", flex: 1 },
    { field: "memberCount", headerName: "Member Count", flex: 1 },
  ];
  const sectorDetailsData = useMemo(() => {
    const sectorCounts = clients.reduce((counts, client) => {
      const sector = String(client.sector || "").trim();
      if (!sector || sector.toLowerCase() === "unknown") return counts;
      counts[sector] = (counts[sector] || 0) + 1;
      return counts;
    }, {});

    return Object.entries(sectorCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([sector, clientCount], index) => ({
        id: index + 1,
        sector,
        clientCount,
      }));
  }, [clients]);
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
        <WidgetSection
          layout={2}
          gridGap={investorInventoryStyle ? "gap-x-4 gap-y-4" : "gap-x-4 gap-y-6"}
          padding={investorInventoryStyle || noOuterPadding}
        >
          {regularCharts.map(renderChart)}
        </WidgetSection>
      )}
      {fullWidthCharts.length > 0 && (
        flushLayout ? (
          fullWidthCharts.map(renderChart)
        ) : (
          <div className="-mt-2">
            <WidgetSection layout={1}>
              {fullWidthCharts.map(renderChart)}
            </WidgetSection>
          </div>
        )
      )}
      {showGenderDetails && (
        <div className="px-4">
          <WidgetSection
            title={
              <span className="text-[#1234c9]">
                GENDER-WISE OCCUPANCY DETAILS
              </span>
            }
            border
          >
            <div className="[&_.ag-header-cell-text]:text-[#1234c9] [&_.ag-cell]:text-[#1234c9] [&_.MuiInputLabel-root]:text-[#1234c9] [&_.MuiInputBase-input]:text-[#1234c9] [&_svg]:text-[#1234c9]">
              <AgTable
                data={genderDetailsData}
                columns={genderDetailsColumns}
                search
              />
            </div>
          </WidgetSection>
        </div>
      )}
      {showAgeDetails && (
        <div className="px-4">
          <WidgetSection
            title={
              <span className="text-[#1234c9]">AGE-WISE OCCUPANCY DETAILS</span>
            }
            border
          >
            <div className="[&_.ag-header-cell-text]:text-[#1234c9] [&_.ag-cell]:text-[#1234c9] [&_.MuiInputLabel-root]:text-[#1234c9] [&_.MuiInputBase-input]:text-[#1234c9] [&_svg]:text-[#1234c9]">
              <AgTable
                data={ageDetailsData}
                columns={ageDetailsColumns}
                search
              />
            </div>
          </WidgetSection>
        </div>
      )}
      {showIndiaDetails && (
        <div className="px-4">
          <WidgetSection
            title={
              <span className="text-[#1234c9]">
                INDIA-WISE OCCUPANCY DETAILS
              </span>
            }
            border
          >
            <div className="[&_.ag-header-cell-text]:text-[#1234c9] [&_.ag-cell]:text-[#1234c9] [&_.MuiInputLabel-root]:text-[#1234c9] [&_.MuiInputBase-input]:text-[#1234c9] [&_svg]:text-[#1234c9]">
              <AgTable
                data={indiaDetailsData}
                columns={indiaDetailsColumns}
                search
              />
            </div>
          </WidgetSection>
        </div>
      )}
      {showSectorDetails && (
        <div className="px-4">
          <WidgetSection
            title={
              <span className="text-[#1234c9]">
                SECTOR-WISE OCCUPANCY DETAILS
              </span>
            }
            border
          >
            <div className="[&_.ag-header-cell-text]:text-[#1234c9] [&_.ag-cell]:text-[#1234c9] [&_.MuiInputLabel-root]:text-[#1234c9] [&_.MuiInputBase-input]:text-[#1234c9] [&_svg]:text-[#1234c9]">
              <AgTable
                data={sectorDetailsData}
                columns={sectorDetailsColumns}
                search
              />
            </div>
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
