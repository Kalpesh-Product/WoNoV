import React from "react";
import Chart from "react-apexcharts";

const GroupedBarGraph = ({ options, series }) => {
  return (
    <div>
      <Chart options={options} series={series} type="bar" height={400} />
    </div>
  );
};

export default GroupedBarGraph;
