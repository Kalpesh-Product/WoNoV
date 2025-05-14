import { useMediaQuery } from "@mui/material";
import React, { useRef, useState } from "react";
import ReactApexChart from "react-apexcharts";
import useResponsiveChart from "../../hooks/useResponsiveChart";

const PieChartMui = ({ data, options, customLegend, width, height }) => {
  // Extract series data for ApexCharts
  const chartData = data.map((item) => parseFloat(item.value)); // Ensure values are numbers

  // Detect mobile view
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { containerRef, chartKey } = useResponsiveChart();
  const updatedOptions = {
    ...options,
    chart: {
      ...options.chart,
      animations: {
        enabled: false,
      },
    },
  };

  return (
    <div className="">
      <div className="w-full m-0 flex  gap-4">
        <div ref={containerRef} className="flex-1">
          <ReactApexChart
            key={chartKey}
            options={updatedOptions} // Use options passed directly from parent
            series={chartData} // Data values for the pie slices
            type="pie"
            width={isMobile ? "100%" : width ? width : 500}
            height={height ? height : 350}
          />
        </div>

        {/* Custom Legend Passed from Parent */}
        {customLegend ? (
          <div
            className={`${
              customLegend ? "flex-1" : ""
            } p-4 justify-center items-center`}
          >
            {customLegend}
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default PieChartMui;
