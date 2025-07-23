import React, { useMemo, useState } from "react";
import Chart from "react-apexcharts";
import dayjs from "dayjs";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

const getFinancialYear = (dateStr) => {
  const date = dayjs(dateStr);
  const year = date.month() < 3 ? date.year() - 1 : date.year();
  return `FY ${year}-${String((year + 1) % 100).padStart(2, "0")}`;
};

const groupDataByMonth = (data, dateKey, valueKey) => {
  const monthlyMap = {};

  data.forEach((item) => {
    const date = dayjs(item[dateKey]);
    if (!date.isValid()) return;

    const month = date.format("MMM");
    monthlyMap[month] =
      (monthlyMap[month] || 0) + (parseFloat(item[valueKey]) || 0);
  });

  const monthsOrder = [
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
    "Jan",
    "Feb",
    "Mar",
  ];

  return monthsOrder.map((month) => ({
    x: month,
    y: monthlyMap[month] || 0,
  }));
};

const FyBarGraph = ({
  data = [],
  columns = [],
  dateKey = "date",
  valueKey = "value",
  chartOptions: customChartOptions = {},
}) => {
  const fyOptions = useMemo(() => {
    const yearsSet = new Set();
    data.forEach((item) => {
      const fy = getFinancialYear(item[dateKey]);
      yearsSet.add(fy);
    });
    return Array.from(yearsSet).sort();
  }, [data, dateKey]);

  const [selectedFY, setSelectedFY] = useState(fyOptions[0]);
  const currentIndex = fyOptions.indexOf(selectedFY);

  const filteredData = useMemo(() => {
    return data.filter(
      (item) => getFinancialYear(item[dateKey]) === selectedFY
    );
  }, [data, selectedFY, dateKey]);

  const monthlyData = useMemo(
    () => groupDataByMonth(filteredData, dateKey, valueKey),
    [filteredData]
  );

  const mergedChartOptions = useMemo(() => {
    return {
      chart: {
        type: "bar",
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
        categories: monthlyData.map((d) => d.x),
      },
      yaxis: {
        labels: {
          formatter: (val) => val.toLocaleString("en-IN"),
        },
      },
      colors: ["#1E3D73"],
      ...customChartOptions, // override default options with parent values
    };
  }, [monthlyData, customChartOptions]);

  const series = [
    {
      name: valueKey,
      data: monthlyData.map((d) => d.y),
    },
  ];

  return (
    <div className="flex flex-col gap-4 rounded-md">
      <Chart
        options={mergedChartOptions}
        series={series}
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

        <span className="text-primary font-semibold">{selectedFY}</span>

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
