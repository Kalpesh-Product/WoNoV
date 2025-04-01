import React from "react";
import Chart from "react-apexcharts";

const HeatMap = ({ data, options, height }) => {
  return (
    <div className="bg-white rounded-md">
      <Chart options={options} series={data} type="heatmap" height={height ? height : 450} />
    </div>
  );
};

export default HeatMap;
