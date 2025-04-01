import React, { useState } from "react";
import Chart from "react-apexcharts";

const AreaGraph = () => {
  const [timeFilter, setTimeFilter] = useState("Yearly"); // State for the filter

  // Example data for different time ranges
  const allData = {
    Yearly: {
      series: [
        {
          name: "Total Tickets",
          data: [150, 120, 100, 50, 100, 200, 80, 130, 140, 90, 110, 170],
          color: "#007bff", // Blue
        },
        {
          name: "Closed Tickets",
          data: [120, 100, 80, 45, 60, 150, 75, 110, 120, 70, 90, 150],
          color: "#28a745", // Green
        },
        {
          name: "Open Tickets",
          data: [30, 20, 20, 5, 40, 50, 5, 20, 20, 20, 20, 20],
          color: "#ff4d4d", // Red
        },
      ],
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ], // Months
    },
    Monthly: {
      series: [
        {
          name: "Total Tickets",
          data: [50, 45, 60, 55, 70, 75, 65],
          color: "#007bff", // Blue
        },
        {
          name: "Closed Tickets",
          data: [40, 35, 50, 45, 60, 65, 55],
          color: "#28a745", // Green
        },
        {
          name: "Open Tickets",
          data: [10, 10, 10, 10, 10, 10, 10],
          color: "#ff4d4d", // Red
        },
      ],
      categories: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7"], // Weeks
    },
    Weekly: {
      series: [
        {
          name: "Total Tickets",
          data: [20, 30, 25, 40, 35, 45, 50],
          color: "#007bff", // Blue
        },
        {
          name: "Closed Tickets",
          data: [15, 20, 18, 30, 25, 35, 40],
          color: "#28a745", // Green
        },
        {
          name: "Open Tickets",
          data: [5, 10, 7, 10, 10, 10, 10],
          color: "#ff4d4d", // Red
        },
      ],
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], // Days of the week
    },
  };

  // Get the current data based on the selected filter
  const chartData = allData[timeFilter];

  const chartOptions = {
    chart: {
      type: "area",
      height: 350,
      fontFamily:"Poppins-Regular",
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
      scrollable: false,
    },
    colors: chartData.series.map((item) => item.color),
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    xaxis: {
      categories: chartData.categories,
    },
    yaxis: {
      min: 0,
      max: timeFilter === "Yearly" ? 250 : 100,
    },
    tooltip: {
      shared: true,
      intersect: false,
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
    },
    grid: {
      borderColor: "#f1f1f1",
    },
  };

  return (
    <div className=" rounded-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-title font-pregular"></h2>
        <div className="flex gap-2">
          {["Yearly", "Monthly", "Weekly"].map((filter) => (
            <button
              key={filter}
              className={`px-4 py-2 text-sm font-medium rounded ${
                timeFilter === filter
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-black"
              }`}
              onClick={() => setTimeFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      <Chart
        options={chartOptions}
        series={chartData.series}
        type="area"
        height={350}
      />
    </div>
  );
};

export default AreaGraph;
