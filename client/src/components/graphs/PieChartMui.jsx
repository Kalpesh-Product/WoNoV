import { useMediaQuery } from "@mui/material";
import React, { useRef, useState } from "react";
import ReactApexChart from "react-apexcharts";
import useResponsiveChart from "../../hooks/useResponsiveChart";

const PieChartMui = ({
  data,
  options,
  width = 320,
  height = 320,
  customLegend,
  centerAlign = false,
}) => {
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
    <div className="w-full flex flex-col" style={{ height }}>
      <div
        ref={containerRef}
        className={
          centerAlign
            ? "flex items-center justify-center w-full h-full"
            : "flex items-center"
        }
        style={centerAlign ? undefined : { width, height }}
      >
        {centerAlign ? (
          <div style={{ width, height }}>
            <ReactApexChart
              key={chartKey}
              options={updatedOptions}
              series={chartData}
              type="pie"
              height="100%"
              width="100%"
            />
          </div>
        ) : (
          <ReactApexChart
            key={chartKey}
            options={updatedOptions}
            series={chartData}
            type="pie"
            height="100%"
          />
        )}
        {customLegend && (
          <div>
            <div className="w-full flex justify-between">{customLegend}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PieChartMui;
