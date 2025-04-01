import { useMediaQuery } from "@mui/material";
import React, { useRef, useState } from "react";
import ReactApexChart from "react-apexcharts";

const PieChartMui = ({ data, options, customLegend, width, height }) => {
  // Extract series data for ApexCharts
  const chartData = data.map((item) => parseFloat(item.value)); // Ensure values are numbers

  // Detect mobile view
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className="">
      <div className="w-full m-0 flex  gap-4">
        <div className="flex-1">
          <ReactApexChart
            options={options} // Use options passed directly from parent
            series={chartData} // Data values for the pie slices
            type="pie"
            width={isMobile ? "100%" : width ? width : 550}
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
