;
import ReactApexChart from "react-apexcharts";

const DonutChart = ({ centerLabel, labels, colors, series, title }) => {
  // Example data
  const chartData = {
    series: series, // High, Medium, Low percentages
    labels: labels,
    colors: colors, // Red, Yellow, Green
  };

  const chartOptions = {
    chart: {
      type: "donut",
      fontFamily:"Poppins-Regular"
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
        formatter: (val) => `${val}%`,
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
