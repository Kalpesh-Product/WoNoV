import React from "react";
import ReactApexChart from "react-apexcharts";

const DonutChart = ({
  centerLabel,
  labels,
  colors,
  series,
  tooltipValue,
  handleClick,
  onSliceClick,
  width,
  isMonetary = false
}) => {

  const chartData = {
    series: series,
    labels: labels,
    colors: colors,
  };

  const chartOptions = {
    chart: {
      type: "donut",
      fontFamily: "Poppins-Regular",
      events: {
        dataPointSelection: (event, chartContext,config) => {
          handleClick?.(); // trigger the click handler
         if( onSliceClick && config?.dataPointIndex !== undefined){ // to get index
          console.log(config)
          const index = config.dataPointIndex;
          onSliceClick?.(index);
         }
        }
      }
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
        formatter: (val, { seriesIndex }) =>
          `${tooltipValue[seriesIndex]}`,
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
             formatter: function (w) {
  const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
  return isMonetary
    ? `INR ${total.toLocaleString("en-IN")}`
    : `${total.toLocaleString("en-IN")}`;
}
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
        width={width || "100%"}
      />
    </div>
  );
};

export default DonutChart;
