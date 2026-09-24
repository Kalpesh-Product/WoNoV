import React, { useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import dayjs from "dayjs";
import { inrFormat } from "../../utils/currencyFormat";
import SecondaryButton from "../SecondaryButton";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import WidgetSection from "../WidgetSection";
import { useCurrency } from "../../context/CurrencyContext";

const getCurrentFinancialYearStart = () => {
  const today = dayjs();
  return today.month() < 3 ? today.year() - 1 : today.year();
};

const getFinancialYear = (dateStr) => {
  const date = dayjs(dateStr);
  if (!date.isValid()) return null;
  const year = date.month() < 3 ? date.year() - 1 : date.year();
  return `FY ${year}-${String((year + 1) % 100).padStart(2, "0")}`;
};

const getFinancialYearStart = (dateStr) => {
  const date = dayjs(dateStr);
  if (!date.isValid()) return null;
  return date.month() < 3 ? date.year() - 1 : date.year();
};

const getMonthsWithYearLabels = (fyLabel) => {
  if (!fyLabel?.startsWith("FY")) return [];
  const [startYearStr] = fyLabel.replace("FY", "").split("-");
  const startYear = parseInt(startYearStr);
  if (isNaN(startYear)) return [];

  const endYear = startYear + 1;
  return [
    { month: "Apr", label: `Apr-${String(startYear).slice(-2)}` },
    { month: "May", label: `May-${String(startYear).slice(-2)}` },
    { month: "Jun", label: `Jun-${String(startYear).slice(-2)}` },
    { month: "Jul", label: `Jul-${String(startYear).slice(-2)}` },
    { month: "Aug", label: `Aug-${String(startYear).slice(-2)}` },
    { month: "Sep", label: `Sep-${String(startYear).slice(-2)}` },
    { month: "Oct", label: `Oct-${String(startYear).slice(-2)}` },
    { month: "Nov", label: `Nov-${String(startYear).slice(-2)}` },
    { month: "Dec", label: `Dec-${String(startYear).slice(-2)}` },
    { month: "Jan", label: `Jan-${String(endYear).slice(-2)}` },
    { month: "Feb", label: `Feb-${String(endYear).slice(-2)}` },
    { month: "Mar", label: `Mar-${String(endYear).slice(-2)}` },
  ];
};

const PROJECTED_SERIES_PREFIX = "Projected ";
const ACTUAL_RANK_PREFIX = "Actual Rank ";
const PROJECTED_RANK_PREFIX = "Projected Rank ";
const INVESTOR_ACTUAL_STACK_ORDER = [
  "Co-Working",
  "Virtual Office",
  "Meeting",
  "Alternate",
];
const INVESTOR_PROJECTED_STACK_ORDER = [
  "Co-Working",
  "Virtual Office",
  "Meeting",
  "Alternate",
].map((vertical) => `${PROJECTED_SERIES_PREFIX}${vertical}`);
const INVESTOR_PROJECTED_COLORS = [
  "#3c3c3c",
  "#616161",
  "#787878",
  "#b4b4b4",
  "#f0f0f0",
];
const INVESTOR_ACTUAL_COLORS = {
  "Co-Working": "#365D96",
  Meeting: "#2196F3",
  Alternate: "#80CED6",
  Workation: "#54C4A7",
  "Virtual Office": "#11daf5",
};
const INVESTOR_LEGEND_ITEMS = [
  { label: "Co-Working", color: "#365D96" },
  { label: "Virtual Office", color: "#11daf5" },
  { label: "Meeting", color: "#2196F3" },
  { label: "Alternate", color: "#80CED6" },
  { label: "Projected", color: "#787878" },
];
const INVESTOR_TOOLTIP_ROWS = [
  { vertical: "Co-Working", label: "Co-Working" },
  { vertical: "Virtual Office", label: "Virtual Office" },
  { vertical: "Meeting", label: "Meetings" },
  { vertical: "Alternate", label: "Alt Revenues" },
];
const INVESTOR_LEGEND_TO_SERIES = {
  Meeting: "Meeting",
  Alternate: "Alternate",
  "Virtual Office": "Virtual Office",
  "Co-Working": "Co-Working",
};

const FyBarGraphPercentage = ({
  data = [],
  dateKey = "date",
  valueKey = "revenue",
  totalValue,
  chartOptions = {},
  graphTitle = "",
  tooltipBuilder,
  hideYearNavigation = false,
  investorVariant = false,
  seriesColors = {},
  legendItems = [],
  showSmallLabels = false,
  hideHeaderAmounts = false,
  showFiscalYearInTitle = true,
}) => {
  const { format } = useCurrency();
  const currentFYStartYear = getCurrentFinancialYearStart();
  const fyOptions = useMemo(() => {
    const yearsSet = new Set();
    data.forEach((item) => {
      const fyStart = getFinancialYearStart(item?.[dateKey]);
      if (fyStart !== null) yearsSet.add(fyStart);
    });
    return Array.from(yearsSet)
      .sort((a, b) => a - b)
      .map((fyStart) => `FY ${fyStart}-${String((fyStart + 1) % 100).padStart(2, "0")}`);
  }, [data, dateKey]);

  const [selectedFYStartYear, setSelectedFYStartYear] = useState(
    currentFYStartYear
  );
  const [hiddenInvestorLegendItems, setHiddenInvestorLegendItems] = useState([]);
  const [hiddenLegendSeries, setHiddenLegendSeries] = useState([]);

  useEffect(() => {
    if (fyOptions.length > 0) {
      const lastAvailableFY = fyOptions[fyOptions.length - 1];
      const [startYearStr] = lastAvailableFY.replace("FY", "").trim().split("-");
      const parsedStartYear = parseInt(startYearStr, 10);
      setSelectedFYStartYear(
        Number.isNaN(parsedStartYear) ? currentFYStartYear : parsedStartYear
      );
    } else {
      setSelectedFYStartYear(currentFYStartYear);
    }
  }, [fyOptions, currentFYStartYear]);

  const selectedFY = `FY ${selectedFYStartYear}-${String((selectedFYStartYear + 1) % 100).padStart(2, "0")}`;

  const monthsWithLabels = useMemo(() => {
    return getMonthsWithYearLabels(selectedFY);
  }, [selectedFY]);

  const filteredData = useMemo(() => {
    return data.filter(
      (item) => getFinancialYear(item?.[dateKey]) === selectedFY
    );
  }, [data, selectedFY, dateKey]);

  const { stackedSeries, rawDataMap, monthlyTotals, actualTotal, projectedTotal } = useMemo(() => {
    if (!selectedFY)
      return {
        stackedSeries: [],
        rawDataMap: {},
        monthlyTotals: {},
        actualTotal: 0,
        projectedTotal: 0,
      };

    const months = getMonthsWithYearLabels(selectedFY);
    const monthlyTotals = {};
    let actualTotal = 0;
    let projectedTotal = 0;
    const base = {};

    filteredData.forEach((item) => {
      const date = dayjs(item?.[dateKey]);
      if (!date.isValid()) return;

      const month = date.format("MMM");
      const match = months.find((m) => m.month === month);
      if (!match) return;

      const label = match.label;
      const vertical = item?.vertical || "Unknown";
      const seriesName =
        investorVariant && item?.isProjected
          ? `${PROJECTED_SERIES_PREFIX}${vertical}`
          : vertical;
      const value = parseFloat(item?.[valueKey]) || 0;

      if (!base[seriesName]) base[seriesName] = {};
      base[seriesName][label] = (base[seriesName][label] || 0) + value;
      monthlyTotals[label] = (monthlyTotals[label] || 0) + value;

      if (investorVariant && item?.isProjected) {
        projectedTotal += value;
      } else {
        actualTotal += value;
      }
    });

    const preferredStackOrder = investorVariant
      ? [...INVESTOR_ACTUAL_STACK_ORDER, ...INVESTOR_PROJECTED_STACK_ORDER]
      : Object.keys(base);
    const orderedVerticals = investorVariant
      ? [
        ...preferredStackOrder.filter((vertical) => base[vertical]),
        ...Object.keys(base).filter(
          (vertical) => !preferredStackOrder.includes(vertical)
        ),
      ]
      : preferredStackOrder;

    const rawDataMap = {};
    const categorySeries = orderedVerticals.map((vertical) => {
      const monthData = base[vertical] || {};
      const raw = months.map(({ label }) => monthData[label] || 0);
      rawDataMap[vertical] = raw;

      const data = raw.map((val, i) => {
        const label = months[i].label;
        let total =
          typeof totalValue === "function"
            ? totalValue(label)
            : typeof totalValue === "number"
              ? totalValue
              : monthlyTotals[label] || 1;
        return parseFloat(((val / total) * 100).toFixed(2));
      });

      return { name: vertical, data };
    });

    const createRankedSeries = (seriesGroup, rankPrefix, projected = false) =>
      Array.from({ length: seriesGroup.length }, (_, rankIndex) => ({
        name: `${rankPrefix}${rankIndex + 1}`,
        data: months.map(({ label }, monthIndex) => {
          const rankedValues = seriesGroup
            .map(({ name, data }) => ({
              name,
              value: data[monthIndex] || 0,
            }))
            .sort((a, b) => a.value - b.value);
          const rankedPoint = rankedValues[rankIndex];
          const vertical = projected
            ? rankedPoint?.name.replace(PROJECTED_SERIES_PREFIX, "")
            : rankedPoint?.name;
          const stackIndex = INVESTOR_ACTUAL_STACK_ORDER.indexOf(vertical);

          return {
            x: label,
            y: rankedPoint?.value || 0,
            sourceSeriesName: rankedPoint?.name,
            fillColor: projected
              ? INVESTOR_PROJECTED_COLORS[stackIndex] || "#f0f0f0"
              : INVESTOR_ACTUAL_COLORS[vertical] || "#1E3D73",
          };
        }),
      }));

    const stackedSeries = investorVariant
      ? [
          ...createRankedSeries(
            categorySeries.filter(
              ({ name }) => !name.startsWith(PROJECTED_SERIES_PREFIX)
            ),
            ACTUAL_RANK_PREFIX
          ),
          ...createRankedSeries(
            categorySeries.filter(({ name }) =>
              name.startsWith(PROJECTED_SERIES_PREFIX)
            ),
            PROJECTED_RANK_PREFIX,
            true
          ),
        ]
      : categorySeries;

    return { stackedSeries, rawDataMap, monthlyTotals, actualTotal, projectedTotal };
  }, [filteredData, selectedFY, valueKey, dateKey, totalValue, investorVariant]);

  const hiddenInvestorSeriesNames = useMemo(() => {
    if (!investorVariant) return new Set();

    const hiddenSeries = new Set();

    hiddenInvestorLegendItems.forEach((label) => {
      if (label === "Projected") {
        stackedSeries
          .filter(({ name }) => name.startsWith(PROJECTED_RANK_PREFIX))
          .forEach(({ name }) => hiddenSeries.add(name));
        return;
      }

      const seriesName = INVESTOR_LEGEND_TO_SERIES[label];
      if (seriesName) hiddenSeries.add(seriesName);
    });

    return hiddenSeries;
  }, [hiddenInvestorLegendItems, investorVariant, stackedSeries]);

  const displayedStackedSeries = useMemo(() => {
    const hiddenSeriesNames = investorVariant
      ? hiddenInvestorSeriesNames
      : new Set(hiddenLegendSeries);

    if (hiddenSeriesNames.size === 0) {
      return stackedSeries;
    }

    return stackedSeries.map((series) => ({
      ...series,
      data: series.data.map((point) => {
        const sourceSeriesName = point?.sourceSeriesName;
        const shouldHide =
          hiddenSeriesNames.has(series.name) ||
          (sourceSeriesName && hiddenSeriesNames.has(sourceSeriesName));

        return shouldHide
          ? typeof point === "object"
            ? { ...point, y: 0 }
            : 0
          : point;
      }),
    }));
  }, [hiddenInvestorSeriesNames, hiddenLegendSeries, investorVariant, stackedSeries]);

  const displayedRawDataMap = useMemo(() => {
    const hiddenSeriesNames = investorVariant
      ? hiddenInvestorSeriesNames
      : new Set(hiddenLegendSeries);

    if (hiddenSeriesNames.size === 0) {
      return rawDataMap;
    }

    return Object.fromEntries(
      Object.entries(rawDataMap).map(([seriesName, values]) => [
        seriesName,
        hiddenSeriesNames.has(seriesName)
          ? values.map(() => 0)
          : values,
      ])
    );
  }, [hiddenInvestorSeriesNames, hiddenLegendSeries, investorVariant, rawDataMap]);

  const toggleInvestorLegendItem = (label) => {
    setHiddenInvestorLegendItems((current) =>
      current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label]
    );
  };

  const mergedChartOptions = useMemo(() => {
    return {
      chart: {
        type: "bar",
        stacked: true,
        height: 350,
        toolbar: { show: false },
        fontFamily: "Poppins-Regular",
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: false,
          columnWidth: investorVariant ? "38%" : "40%",
          ...(investorVariant
            ? {
                dataLabels: {
                  hideOverflowingLabels: false,
                  maxItems: 100,
                },
              }
            : showSmallLabels
              ? {
                  dataLabels: {
                    hideOverflowingLabels: false,
                    maxItems: 100,
                  },
                }
              : {}),
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          const numericValue = typeof val === "number" ? val : Number(val?.y ?? val);
          const roundedValue = Math.round(numericValue);
          if (!investorVariant) {
            return !showSmallLabels || roundedValue >= 4
              ? `${roundedValue}%`
              : "";
          }
          return roundedValue >= 4 ? `${roundedValue}%` : "";
        },
        style: {
          fontSize: "12px",
          fontWeight: "bold",
          colors: ["#fff"],
        },
        offsetY: investorVariant ? -1 : 0,
      },
      xaxis: {
        categories: monthsWithLabels.map((m) => m.label),
        ...(investorVariant
          ? {
              crosshairs: {
                show: false,
              },
            }
          : {}),
        labels: {
          style: investorVariant
            ? {
              colors: "#1E3D73",
            }
            : {},
        },
      },
      yaxis: {
        min: 0,
        max: 100,
        labels: {
          style: investorVariant
            ? {
              colors: "#1E3D73",
            }
            : {},
          formatter: (val) => `${val.toFixed(0)}%`,
        },
      },
      legend: {
        show: !investorVariant && legendItems.length === 0,
        position: "top",
        ...(investorVariant
          ? {
            labels: {
              colors: "#1E3D73",
            },
          }
          : {}),
      },
      tooltip: {
        shared: false,
        custom: ({ series, dataPointIndex, w }) => {
          const monthLabel =
            w?.globals?.categoryLabels?.[dataPointIndex] ||
            w?.globals?.labels?.[dataPointIndex] ||
            w?.config?.xaxis?.categories?.[dataPointIndex] ||
            "N/A";

          if (typeof tooltipBuilder === "function") {
            return tooltipBuilder({
              series,
              dataPointIndex,
              w,
              monthLabel,
              rawDataMap: displayedRawDataMap,
              inrFormat,
            });
          }

          if (investorVariant) {
            const hasProjectedValue = INVESTOR_TOOLTIP_ROWS.some(({ vertical }) => {
              const seriesName = `${PROJECTED_SERIES_PREFIX}${vertical}`;
              return (displayedRawDataMap?.[seriesName]?.[dataPointIndex] ?? 0) > 0;
            });

            const rowsHtml = INVESTOR_TOOLTIP_ROWS.map(({ vertical, label }) => {
              const seriesName = hasProjectedValue
                ? `${PROJECTED_SERIES_PREFIX}${vertical}`
                : vertical;
              const projectedColorIndex =
                INVESTOR_ACTUAL_STACK_ORDER.indexOf(vertical);
              const color = hasProjectedValue
                ? INVESTOR_PROJECTED_COLORS[projectedColorIndex] || "#787878"
                : INVESTOR_ACTUAL_COLORS[vertical] || "#2f8edc";
              const rawVal = displayedRawDataMap?.[seriesName]?.[dataPointIndex] ?? 0;

              return `
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:7px;">
                  <span style="width:10px; height:10px; flex:0 0 10px; border-radius:50%; background:${color}; display:inline-block;"></span>
                  <span style="display:flex; align-items:center; gap:6px; color:#111827; white-space:nowrap;">
                    <span>${hasProjectedValue ? `Projected ${label}` : label}:</span>
                    <strong>${format(rawVal)}</strong>
                  </span>
                </div>
                ${vertical === "Alternate" ? '<hr style="margin:2px 0 8px; border:0; border-top:1px solid #e5e7eb;" />' : ""}`;
            }).join("");

            const total = INVESTOR_TOOLTIP_ROWS.reduce((sum, { vertical }) => {
              const seriesName = hasProjectedValue
                ? `${PROJECTED_SERIES_PREFIX}${vertical}`
                : vertical;
              return sum + (displayedRawDataMap?.[seriesName]?.[dataPointIndex] ?? 0);
            }, 0);

            return `
              <div style="width:max-content; min-width:0; font-family:Poppins-Regular,sans-serif; font-size:12px; line-height:1.4;">
                <div class="apexcharts-tooltip-title" style="margin-bottom:8px; font-size:12px; font-weight:400;">${monthLabel}</div>
                <div style="padding:0 10px 10px;">
                  ${rowsHtml}
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span style="width:10px; height:10px; flex:0 0 10px; border-radius:50%; background:#F59E0B; display:inline-block;"></span>
                    <span style="display:flex; align-items:center; gap:6px; color:#111827; white-space:nowrap;">
                      <span>${hasProjectedValue ? "Projected Total" : "Total"}:</span>
                      <strong>${format(total)}</strong>
                    </span>
                  </div>
                </div>
              </div>`;
          }

          let tooltipHtml = `<div class="apex-tooltip-title">${monthLabel}</div>`;
          let total = 0;

          w.globals.seriesNames.forEach((seriesName, i) => {
            // const percentVal = series[i][dataPointIndex];
            const rawVal = displayedRawDataMap?.[seriesName]?.[dataPointIndex] ?? 0;
            const isProjectedSeries = seriesName.startsWith(PROJECTED_SERIES_PREFIX);

            if (investorVariant && rawVal <= 0) return;

            total += rawVal;

            const displaySeriesName =
              investorVariant && isProjectedSeries
                ? seriesName.replace(PROJECTED_SERIES_PREFIX, "Projected ")
                : seriesName;

            tooltipHtml += `
              <div style="display: flex; justify-content: space-between; gap: 40px;">
                <span style="color: ${w.globals.colors[i]
              }; font-weight: 500;">${displaySeriesName}</span>
                <span>${inrFormat(rawVal)}</span>
              </div>`;
          });

          tooltipHtml += `<hr style="margin-top: 6px;"/>
            <div style="text-align: right; font-weight: 600;">Total: INR ${inrFormat(
            total
          )}</div>`;

          return `<div class="apex-tooltip-custom" style="padding : 10px">${tooltipHtml}</div>`;
        },
      },

      colors: investorVariant
        ? displayedStackedSeries.map(({ name }) =>
            name.startsWith(PROJECTED_RANK_PREFIX) ? "#787878" : "#1E3D73"
          )
        : Object.keys(seriesColors).length > 0
          ? displayedStackedSeries.map(
              ({ name }) => seriesColors[name] || "#6B7280"
            )
          : ["#1E3D73", "#4CAF50", "#FF9800", "#9C27B0", "#F44336"],
      ...(investorVariant
        ? {
          grid: {
            padding: {
              top: 8,
              bottom: 8,
            },
          },
        }
        : {}),
      ...chartOptions,
    };
  }, [
    monthsWithLabels,
    chartOptions,
    displayedRawDataMap,
    displayedStackedSeries,
    tooltipBuilder,
    investorVariant,
    format,
    seriesColors,
    legendItems.length,
    showSmallLabels,
  ]);

  if (fyOptions.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        No valid financial year data available.
      </div>
    );
  }

  const title = React.isValidElement(graphTitle) ? (
    <>
      {graphTitle}
      {showFiscalYearInTitle && (
        <span className={investorVariant ? "ml-1 text-[#1E3D73]" : "ml-1"}>
          {investorVariant ? `- ${selectedFY}` : selectedFY}
        </span>
      )}
    </>
  ) : (
    `${graphTitle}${showFiscalYearInTitle ? ` ${selectedFY}` : ""}`
  );
  const totalHeaderAmount = `INR ${inrFormat(
    Object.values(monthlyTotals).reduce((sum, val) => sum + val, 0)
  )}`;
  const actualHeaderAmount = investorVariant
    ? format(actualTotal)
    : `INR ${inrFormat(actualTotal)}`;
  const projectedHeaderAmount = investorVariant
    ? format(projectedTotal)
    : `INR ${inrFormat(projectedTotal)}`;
  const headerProps = investorVariant
    ? {
      headerRightContent: hideHeaderAmounts ? null : (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="flex items-center justify-center rounded-lg border border-[#aec6fb] bg-[#dbe4ff] px-3 py-2 text-body font-pmedium uppercase text-[#274784]">
            {actualHeaderAmount}
          </div>
          <div className="flex items-center justify-center rounded-lg border border-[#c8c8c8] bg-[#f0f0f0] px-3 py-2 text-body font-pmedium uppercase text-[#3c3c3c]">
            {projectedHeaderAmount}
          </div>
        </div>
      ),
    }
    : {
      TitleAmount: totalHeaderAmount,
    };

  return (
    <WidgetSection
      border
      borderColor={investorVariant ? "#1E3D73" : undefined}
      bodyBorderColor={investorVariant ? "#9FB2CF" : undefined}
      title={title}
      {...headerProps}
    >
      <div className="flex flex-col gap-4 rounded-md">
        {investorVariant && (
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-3 text-xs text-[#1E3D73]">
            {INVESTOR_LEGEND_ITEMS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => toggleInvestorLegendItem(item.label)}
                className={`flex items-center gap-1 ${
                  hiddenInvestorLegendItems.includes(item.label)
                    ? "opacity-40"
                    : ""
                }`}
              >
                <span
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {!investorVariant && legendItems.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-3 text-content text-gray-700">
            {legendItems.map(({ label, seriesName }) => (
              <button
                key={seriesName}
                type="button"
                onClick={() =>
                  setHiddenLegendSeries((current) =>
                    current.includes(seriesName)
                      ? current.filter((item) => item !== seriesName)
                      : [...current, seriesName]
                  )
                }
                className={`flex items-center gap-1 ${
                  hiddenLegendSeries.includes(seriesName) ? "opacity-40" : ""
                }`}
              >
                <span
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: seriesColors[seriesName] }}
                />
                <span>{label}</span>
              </button>
            ))}
          </div>
        )}

        <div className="fy-percentage-chart">
          <Chart
            options={mergedChartOptions}
            series={displayedStackedSeries}
            type="bar"
            height={350}
          />
        </div>

        {!hideYearNavigation && (
          <div className="flex justify-center items-center gap-4 mt-4">
            <SecondaryButton
              title={<MdNavigateBefore />}
              handleSubmit={() =>
                setSelectedFYStartYear((prevYear) => prevYear - 1)
              }
            />

            <span className="text-primary text-content font-semibold">
              {selectedFY || "N/A"}
            </span>

            <SecondaryButton
              handleSubmit={() =>
                setSelectedFYStartYear((prevYear) => prevYear + 1)
              }
              title={<MdNavigateNext />}
            />
          </div>
        )}
      </div>
    </WidgetSection>
  );
};

export default FyBarGraphPercentage;
