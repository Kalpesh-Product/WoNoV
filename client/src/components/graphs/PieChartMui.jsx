import { useMediaQuery } from "@mui/material";
import React, { useRef, useState } from "react";
import ReactApexChart from "react-apexcharts";
import useResponsiveChart from "../../hooks/useResponsiveChart";

const PieChartMui = ({ data, options, width = 320, height = 320 }) => {
  const chartData = data.map((item) => parseFloat(item.value));
  const { containerRef, chartKey } = useResponsiveChart();

  const updatedOptions = {
    ...options,
    chart: {
      ...options.chart,
      zoom: { enabled: false },
      animations: { enabled: false },
    },
    legend: {
      ...options.legend,
      position: "bottom",
    },
  };

  return (
 <div className="w-full flex flex-col justify-between" style={{ height }}>
      <div ref={containerRef} style={{ flex: 1 }}>
        <ReactApexChart
          key={chartKey}
          options={updatedOptions}
          series={chartData}
          type="pie"
          height={height - 20} // Reserve space for built-in legend
        />
      </div>
    </div>

  );
};

export default PieChartMui;
