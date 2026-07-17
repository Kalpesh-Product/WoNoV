import React, { useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import dayjs from "dayjs";
import { inrFormat } from "../../utils/currencyFormat";
import SecondaryButton from "../SecondaryButton";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import WidgetSection from "../WidgetSection";

// Get financial year label
const getFinancialYear = (dateStr) => {
  const date = dayjs(dateStr);
  if (!date.isValid()) return null;
  const year = date.month() < 3 ? date.year() - 1 : date.year();
  return `FY ${year}-${String((year + 1) % 100).padStart(2, "0")}`;
};

// Generate MMM-YY label from date
const getMonthLabel = (dateStr) => {
  const date = dayjs(dateStr);
  return date.isValid() ? date.format("MMM-YY") : "";
};

const getMonthsForFinancialYear = (fyLabel) => {
  if (!fyLabel?.startsWith("FY")) return [];

  const [startYearStr] = fyLabel.replace("FY", "").trim().split("-");
  const startYear = parseInt(startYearStr, 10);

  if (Number.isNaN(startYear)) return [];

  const endYear = startYear + 1;

  return [
    `Apr-${String(startYear).slice(-2)}`,
    `May-${String(startYear).slice(-2)}`,
    `Jun-${String(startYear).slice(-2)}`,
    `Jul-${String(startYear).slice(-2)}`,
    `Aug-${String(startYear).slice(-2)}`,
    `Sep-${String(startYear).slice(-2)}`,
    `Oct-${String(startYear).slice(-2)}`,
    `Nov-${String(startYear).slice(-2)}`,
    `Dec-${String(startYear).slice(-2)}`,
    `Jan-${String(endYear).slice(-2)}`,
    `Feb-${String(endYear).slice(-2)}`,
    `Mar-${String(endYear).slice(-2)}`,
  ];
};

const getCurrentFinancialYear = () => {
  const today = dayjs();
  const year = today.month() < 3 ? today.year() - 1 : today.year();
  return `FY ${year}-${String((year + 1) % 100).padStart(2, "0")}`;
};

const shiftFinancialYear = (fyLabel, direction) => {
  if (!fyLabel?.startsWith("FY")) {
    return getCurrentFinancialYear();
  }

  const [startYearStr] = fyLabel.replace("FY", "").trim().split("-");
  const startYear = parseInt(startYearStr, 10);

  if (Number.isNaN(startYear)) {
    return getCurrentFinancialYear();
  }

  const nextStartYear = startYear + direction;
  return `FY ${nextStartYear}-${String((nextStartYear + 1) % 100).padStart(2, "0")}`;
};

const FyMonthBarGraph = ({
  data = [],
  dateKey = "dueDate",
  labelKey = "unitNo",
  valueKey = "actualAmount",
  graphTitle = "Monthly Expenses",
  chartOptions = {},
  fixedFY = "",
}) => {
  // Extract FYs and Month labels
  const fyOptions = useMemo(() => {
    const set = new Set();
    data.forEach((d) => {
      const fy = getFinancialYear(d?.[dateKey]);
      if (fy) set.add(fy);
    });
    return Array.from(set).sort();
  }, [data, dateKey]);

  const [selectedFY, setSelectedFY] = useState("");
  const [monthOptions, setMonthOptions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const effectiveFY = fixedFY || selectedFY;

  useEffect(() => {
    if (fixedFY) {
      setSelectedFY(fixedFY);
      return;
    }

    const currentFY = getCurrentFinancialYear();

    if (!selectedFY) {
      setSelectedFY(currentFY);
    }
  }, [fixedFY, selectedFY]);

  const fyFilteredData = useMemo(() => {
    return data.filter((d) => getFinancialYear(d?.[dateKey]) === effectiveFY);
  }, [data, effectiveFY, dateKey]);

  useEffect(() => {
    const fyMonths = getMonthsForFinancialYear(effectiveFY);
    setMonthOptions(fyMonths);

    if (!fyMonths.length) {
      if (selectedMonth) {
        setSelectedMonth("");
      }
      return;
    }

    const currentMonthLabel = dayjs().format("MMM-YY");
    const defaultMonth = fyMonths.includes(currentMonthLabel)
      ? currentMonthLabel
      : fyMonths[0];

    if (!selectedMonth || !fyMonths.includes(selectedMonth)) {
      setSelectedMonth(defaultMonth);
    }
  }, [effectiveFY, selectedMonth]);

  const currentMonthIndex = monthOptions.indexOf(selectedMonth);

  const filteredData = useMemo(() => {
    return fyFilteredData.filter(
      (d) => getMonthLabel(d?.[dateKey]) === selectedMonth
    );
  }, [fyFilteredData, selectedMonth, dateKey]);
  const barData = useMemo(() => {
    const grouped = {};

    filteredData.forEach((item) => {
      const label = item?.[labelKey] || "Unknown";
      const value = parseFloat(item?.[valueKey]) || 0;
      grouped[label] = (grouped[label] || 0) + value;
    });

    // Sort the keys
    const categories = Object.keys(grouped).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );

    const values = categories.map((label) => grouped[label]);

    return { categories, values, total: values.reduce((a, b) => a + b, 0) };
  }, [filteredData, labelKey, valueKey]);

  const yMax = Math.max(...barData.values, 1);
  const roundedMax = Math.ceil(yMax / 7) * 7;
  const mergedOptions = useMemo(() => {
    return {
      chart: {
        type: "bar",
        height: 350,
        toolbar: { show: false },
        fontFamily: "Poppins-Regular",
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: "40%",
          dataLabels: {
            position: "top",
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => {
          return inrFormat(val);
        },

        style: {
          fontSize: "12px",
          colors: ["#000"],
        },
        offsetY: -22,
      },
      xaxis: {
        categories: barData.categories,
      },
      yaxis: {
        labels: {
          formatter: (val) => inrFormat(val),
        },
      },
      tooltip: {
        custom: function ({ series, seriesIndex, dataPointIndex, w }) {
          const label = barData.categories[dataPointIndex]; // labelKey value
          const value = barData.values[dataPointIndex]; // valueKey value

          return `
      <div style="padding: 8px;">
        <div class="apexcharts-tooltip-title" style="font-weight: 300; margin-bottom: 4px; width : 200px"> ${label}</div>
        <div">       <span style="height: 10px; width: 10px; border-radius: 50%; background-color: ${w.globals.colors[0]
            }; display: inline-block;"></span> INR ${inrFormat(value)}</div>
      </div>
    `;
        },
      },

      colors: ["#1E3D73"],
      ...chartOptions,
    };
  }, [barData.categories, chartOptions]);

  if (fyOptions.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        No valid financial year data available.
      </div>
    );
  }

  return (
    <WidgetSection
      border
      title={`${graphTitle}  ${effectiveFY}`}
      TitleAmount={`INR ${inrFormat(barData.total || 0)}`}
    >
      <div className="flex flex-col gap-4 rounded-md">
        <Chart
          options={mergedOptions}
          series={[{ name: valueKey, data: barData.values }]}
          type="bar"
          height={350}
        />

        <div className="flex justify-center items-center gap-6 mt-8 flex-wrap">
          {/* FY Navigation */}
          <div className="flex items-center gap-2">
            <SecondaryButton
              title={<MdNavigateBefore />}
              disabled={Boolean(fixedFY)}
              handleSubmit={() =>
                setSelectedFY(shiftFinancialYear(selectedFY, -1))
              }
            />
            <span className="text-primary font-semibold text-content">
              {effectiveFY || selectedFY}
            </span>
            <SecondaryButton
              title={<MdNavigateNext />}
              disabled={Boolean(fixedFY)}
              handleSubmit={() =>
                setSelectedFY(shiftFinancialYear(selectedFY, 1))
              }
            />
          </div>

          {/* Month Navigation */}
          <div className="flex items-center gap-2">
            <SecondaryButton
              title={<MdNavigateBefore />}
              disabled={currentMonthIndex === 0}
              handleSubmit={() =>
                setSelectedMonth(monthOptions[currentMonthIndex - 1])
              }
            />
            <span className="text-primary font-semibold text-content">{selectedMonth}</span>
            <SecondaryButton
              title={<MdNavigateNext />}
              disabled={currentMonthIndex === monthOptions.length - 1}
              handleSubmit={() =>
                setSelectedMonth(monthOptions[currentMonthIndex + 1])
              }
            />
          </div>
        </div>
      </div>
    </WidgetSection>
  );
};

export default FyMonthBarGraph;
