import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import YearlyGraph from "./YearlyGraph"

const DateBasedGraph = ({
  rawData = [],
  instanceTitle="",
  dateKey = "date",
  name = "Data", // name for the series
  valueExtractor = () => 1, // optional: extract value from data row
  yAxisTitle = "Count",
  yAxisMax = 50,
  chartTitle = "Date Based Graph",
}) => {
  const [selectedFY, setSelectedFY] = useState(null);
  const [selectedTotal, setSelectedTotal] = useState(0);

  const { series, options, totalsByFY } = useMemo(() => {
    const fyMap = new Map();
    const totalByFY = new Map();
    const monthSet = new Set();

    rawData.forEach((item) => {
      const date = dayjs(item[dateKey]);
      if (!date.isValid()) return;

      const label = date.format("MMM-YY"); // e.g., "Apr-25"
      monthSet.add(label);

      const month = date.month(); // 0–11
      const year = date.year();
      const fyStartYear = month < 3 ? year - 1 : year;
      const fyLabel = `FY ${fyStartYear}-${String((fyStartYear + 1) % 100).padStart(2, "0")}`;

      if (!fyMap.has(fyLabel)) fyMap.set(fyLabel, new Map());
      if (!totalByFY.has(fyLabel)) totalByFY.set(fyLabel, 0);

      const currentVal = fyMap.get(fyLabel).get(label) || 0;
      const addVal = valueExtractor(item) ?? 1;

      fyMap.get(fyLabel).set(label, currentVal + addVal);
      totalByFY.set(fyLabel, totalByFY.get(fyLabel) + addVal);
    });

    const allMonthsSorted = Array.from(monthSet).sort((a, b) => {
      const parse = (label) => {
        const [mon, yy] = label.split("-");
        return new Date(`20${yy}`, new Date(`${mon} 1, 2000`).getMonth());
      };
      return parse(a) - parse(b);
    });

    const series = Array.from(fyMap.entries()).map(([fyLabel, monthMap]) => ({
      group: fyLabel,
      name,
      data: allMonthsSorted.map((m) => monthMap.get(m) || 0),
    }));

    const options = {
      chart: {
        type: "bar",
        toolbar: { show: false },
        fontFamily: "Poppins-Regular",
        events: {
          dataPointSelection: (event, chartCtx, config) => {
            const fy = series[config.seriesIndex]?.group;
            if (fy) {
              setSelectedFY(fy);
              setSelectedTotal(totalByFY.get(fy) || 0);
            }
          },
        },
      },
      xaxis: {
        categories: allMonthsSorted,
      },
      yaxis: {
        max: yAxisMax,
        title: { text: yAxisTitle },
        labels: {
          formatter: (val) => `${Math.round(val)}`,
        },
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: false,
          columnWidth: "40%",
          dataLabels: { position: "top" },
        },
      },
      dataLabels: {
        enabled: true,
        offsetY: -25,
        style: {
          fontSize: "12px",
          colors: ["#000"],
        },
      },
      tooltip:{
        enabled : false
      }
    };

    return {
      series,
      options,
      totalsByFY: totalByFY,
    };
  }, [rawData, dateKey]);

  return (
    <YearlyGraph
      title={chartTitle}
      data={series}
      options={options}
      titleAmount={
        selectedFY
          ? `${instanceTitle || "TOTAL"} : ${selectedTotal}`
          : "Click on a bar to view FY total"
      }
      onYearChange={(fyLabel) => {
        setSelectedFY(fyLabel);
        setSelectedTotal(totalsByFY.get(fyLabel) || 0);
      }}
    />
  );
};

export default DateBasedGraph;
