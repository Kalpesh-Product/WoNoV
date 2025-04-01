import React from "react";
import Chart from "react-apexcharts";

const LayerBarGraph = ({ title, data, options }) => {
  // Generate the custom legend items dynamically
  const customLegend = data
    .filter((series) => series.group === "total") // Only include "Total" series
    .map((series, index) => {
      const departmentName = series.name.split(" ")[0]; // Extract department name
      const color = options.colors[index]; // Get the corresponding color

      return (
        <div key={departmentName} className="flex items-center mr-4">
          <span
            style={{
              backgroundColor: color,
              width: "12px",
              height: "12px",
              display: "inline-block",
              borderRadius: "50%",
              marginRight: "8px",
            }}
          ></span>
          <span className="text-sm">{departmentName}</span>
        </div>
      );
    });
  return (
    <div className="bg-white rounded-md">
      <div className=" p-4 ">
        <span className="text-lg">{title}</span>
      </div>
      <div className="">
        {title === "Department Wise Tasks% Vs Achievements in %" && (
          <div className="flex justify-center items-center my-4">
            {customLegend}
          </div>
        )}
        <Chart options={options} series={data} type="bar" height={350} />
      </div>
    </div>
  );
};

export default LayerBarGraph;
