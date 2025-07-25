import React, { useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import dayjs from "dayjs";
import SecondaryButton from "../SecondaryButton";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import WidgetSection from "../WidgetSection";

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

// helper to get nested property
const getValueByPath = (obj, path) => {
  return path.split(".").reduce((acc, part) => acc?.[part], obj);
};

const FyBarGraphCount = ({
  data = [],
  dateKey = "dateOfContact",
  groupKey = "serviceCategory.serviceName",
  chartOptions = {},
  graphTitle = "",
}) => {
  const fyOptions = useMemo(() => {
    const yearsSet = new Set();
    data.forEach((item) => {
      const fy = getFinancialYear(item?.[dateKey]);
      if (fy) yearsSet.add(fy);
    });
    return Array.from(yearsSet).sort();
  }, [data, dateKey]);

  const [selectedFY, setSelectedFY] = useState("");
  useEffect(() => {
    if (fyOptions.length > 0 && !selectedFY) {
      setSelectedFY(fyOptions[0]);
    }
  }, [fyOptions, selectedFY]);

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
    if (!selectedFY || !groupKey) return [];
    const base = {};
    const months = getMonthsWithYearLabels(selectedFY);

    filteredData.forEach((item) => {
      const date = dayjs(item?.[dateKey]);
      if (!date.isValid()) return;

      const month = date.format("MMM");
      const match = months.find((m) => m.month === month);
      if (!match) return;

      const label = match.label;
      const group = getValueByPath(item, groupKey) || "Unknown";

      if (!base[group]) base[group] = {};
      base[group][label] = (base[group][label] || 0) + 1;
    });

    return Object.entries(base).map(([group, monthData]) => ({
      name: group,
      data: months.map(({ label }) => monthData[label] || 0),
    }));
  }, [filteredData, selectedFY, dateKey, groupKey]);

  const fyTotalCount = useMemo(() => {
    return stackedSeries.reduce((total, group) => {
      return (
        total +
        group.data.reduce((sum, val) => sum + (parseInt(val) || 0), 0)
      );
    }, 0);
  }, [stackedSeries]);

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
          columnWidth: "40%",
        },
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: monthsWithLabels.map((m) => m.label),
      },
      yaxis: {
        title: { text: "Count" },
        labels: {
          formatter: (val) =>
            typeof val === "number" ? val.toLocaleString("en-IN") : "0",
        },
      },
      legend: {
        position: "top",
      },
      tooltip: {
        shared: true,
      },
      colors: ["#2196F3", "#00BCD4", "#1E88E5", "#0D47A1", "#5C6BC0"],
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
    <WidgetSection
      border
      title={`${graphTitle} ${selectedFY}`}
      TitleAmount={`Total Count: ${fyTotalCount}`}
    >
      <div className="flex flex-col gap-4 rounded-md">
        <Chart
          options={mergedChartOptions}
          series={stackedSeries}
          type="bar"
          height={350}
        />
        <div className="flex justify-center items-center gap-4 mt-4">
          <SecondaryButton
            title={<MdNavigateBefore />}
            disabled={currentIndex === 0}
            handleSubmit={() => setSelectedFY(fyOptions[currentIndex - 1])}
          />
          <span className="text-primary text-content font-semibold">
            {selectedFY || "N/A"}
          </span>
          <SecondaryButton
            disabled={currentIndex === fyOptions.length - 1}
            handleSubmit={() => setSelectedFY(fyOptions[currentIndex + 1])}
            title={<MdNavigateNext />}
          />
        </div>
      </div>
    </WidgetSection>
  );
};

export default FyBarGraphCount;
