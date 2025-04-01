import React from "react";
import ReactApexChart from "react-apexcharts";

const DonutChart = ({ centerLabel, labels, colors, series, tooltipValue }) => {
  const chartData = {
    series: series, 
    labels: labels,
    colors: colors, 
  };

  const chartOptions = {
    chart: {
      type: "donut",
      fontFamily: "Poppins-Regular"
    },
    colors: chartData.colors,
    labels: chartData.labels,
    legend: {
      position: "right",
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(0)}%`,
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val, { seriesIndex }) => `${tooltipValue[seriesIndex]} (${val.toFixed(1)}%)`,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: `Total ${centerLabel}`,
              fontSize: "16px",
              fontWeight: "bold",
            },
          },
        },
      },
    },
  };

  return (
    <div className="rounded-md">
      <ReactApexChart
        options={chartOptions}
        series={chartData.series}
        type="donut"
        height={350}
      />
    </div>
  );
};

export default DonutChart;
