import React, { useMemo, useState } from "react";
import Chart from "react-apexcharts";
import dayjs from "dayjs";

const getFinancialYear = (dateStr) => {
  const date = dayjs(dateStr);
  if (!date.isValid()) return null;
  const year = date.month() < 3 ? date.year() - 1 : date.year();
  return `FY ${year}-${String((year + 1) % 100).padStart(2, "0")}`;
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

const FyBarGraph = ({
  data = [],
  dateKey = "date",
  valueKey = "revenue",
  chartOptions = {},
}) => {
  const fyOptions = useMemo(() => {
    const yearsSet = new Set();
    data.forEach((item) => {
      const fy = getFinancialYear(item?.[dateKey]);
      if (fy) yearsSet.add(fy);
    });
    return Array.from(yearsSet).sort();
  }, [data, dateKey]);

  const [selectedFY, setSelectedFY] = useState(fyOptions[0] || "");

  const currentIndex = fyOptions.indexOf(selectedFY);

  const monthsWithLabels = useMemo(() => {
    return getMonthsWithYearLabels(selectedFY);
  }, [selectedFY]);

  const filteredData = useMemo(() => {
    return data.filter(
      (item) => getFinancialYear(item?.[dateKey]) === selectedFY
    );
  }, [data, selectedFY, dateKey]);

  const stackedSeries = useMemo(() => {
    if (!selectedFY) return [];
    const base = {};
    const months = getMonthsWithYearLabels(selectedFY);

    filteredData.forEach((item) => {
      const date = dayjs(item?.[dateKey]);
      if (!date.isValid()) return;

      const month = date.format("MMM");
      const match = months.find((m) => m.month === month);
      if (!match) return;

      const label = match.label;
      const vertical = item?.vertical || "Unknown";

      if (!base[vertical]) base[vertical] = {};
      base[vertical][label] =
        (base[vertical][label] || 0) + (parseFloat(item?.[valueKey]) || 0);
    });

    return Object.entries(base).map(([vertical, monthData]) => ({
      name: vertical,
      data: months.map(({ label }) => monthData[label] || 0),
    }));
  }, [filteredData, selectedFY, valueKey, dateKey]);

  const mergedChartOptions = useMemo(() => {
    return {
      chart: {
        type: "bar",
        stacked: true,
        height: 350,
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: false,
          columnWidth: "45%",
        },
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: monthsWithLabels.map((m) => m.label),
      },
      yaxis: {
        labels: {
          formatter: (val) =>
            typeof val === "number" ? val.toLocaleString("en-IN") : "0",
        },
      },
      legend: {
        position: "top",
      },
      colors: ["#1E3D73", "#4CAF50", "#FF9800", "#9C27B0", "#F44336"],
      ...chartOptions,
    };
  }, [monthsWithLabels, chartOptions]);

  if (fyOptions.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        No valid financial year data available.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-md">
      <Chart
        options={mergedChartOptions}
        series={stackedSeries}
        type="bar"
        height={350}
      />

      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          className={`px-4 py-1 rounded-md border ${
            currentIndex === 0
              ? "border-gray-300 text-gray-400 cursor-not-allowed"
              : "border-primary text-primary hover:bg-primary hover:text-white"
          }`}
          disabled={currentIndex === 0}
          onClick={() => setSelectedFY(fyOptions[currentIndex - 1])}
        >
          Prev
        </button>

        <span className="text-primary font-semibold">
          {selectedFY || "N/A"}
        </span>

        <button
          className={`px-4 py-1 rounded-md border ${
            currentIndex === fyOptions.length - 1
              ? "border-gray-300 text-gray-400 cursor-not-allowed"
              : "border-primary text-primary hover:bg-primary hover:text-white"
          }`}
          disabled={currentIndex === fyOptions.length - 1}
          onClick={() => setSelectedFY(fyOptions[currentIndex + 1])}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default FyBarGraph;
