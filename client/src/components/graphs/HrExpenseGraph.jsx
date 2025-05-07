import React from "react";
import Chart from "react-apexcharts";
import { useNavigate } from "react-router-dom";

const HrExpenseGraph = ({ utilisedData, maxBudget, route }) => {
  const navigate = useNavigate();

  const utilisedPercent = utilisedData?.map((val, i) =>
    Math.min((val / maxBudget[i]) * 100, 100)
  );

  const defaultPercent = utilisedData?.map((val, i) =>
    Math.max(0, 100 - Math.min((val / maxBudget[i]) * 100, 100))
  );

  const exceededPercent = utilisedData?.map((val, i) =>
    val > maxBudget[i] ? ((val - maxBudget[i]) / maxBudget[i]) * 100 : 0
  );

  const data = [
    { name: "Utilised Budget", data: utilisedPercent },
    { name: "Allocated Budget", data: defaultPercent },
    { name: "Exceeded Budget", data: exceededPercent },
  ];

  const options = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      stacked: true,
      fontFamily: "Poppins-Regular",
      events: {
        dataPointSelection: () => navigate(route),
      },
    },

    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "35%",
        borderRadius: 3,
        borderRadiusWhenStacked: "all",
        borderRadiusApplication: "end",
      },
    },
    colors: ["#36BA98", "#275D3E", "#E83F25"],
    dataLabels: {
      enabled: true,
      formatter: (value, { seriesIndex }) => {
        if (seriesIndex === 1) return ""; // hide default budget
        return `${Math.round(value)}%`;
      },
    },
    xaxis: {
      categories: [
        "Apr-24",
        "May-24",
        "Jun-24",
        "Jul-24",
        "Aug-24",
        "Sep-24",
        "Oct-24",
        "Nov-24",
        "Dec-24",
        "Jan-25",
        "Feb-25",
        "Mar-25",
      ],
    },
    yaxis: {
      max: 200, // to allow overflow for exceeded cases
      labels: {
        formatter: (val) => `${Math.round(val)}%`,
      },
      title: { text: "Amount In Lakns (INR)" },
    },
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const actual = utilisedData[dataPointIndex];
        const budget = maxBudget[dataPointIndex];
        const utilised = Math.min(actual, budget);
        const unused = Math.max(0, budget - utilised);
        const exceeded = actual > budget ? actual - budget : 0;

        return `
            <div style="padding: 8px; font-size: 13px; font-family: Poppins, sans-serif">
        
              <div style="display: flex; align-items: center; justify-content: space-between; background-color: #d0f0dc; color: #1b5e20; padding: 6px 8px; border-radius: 4px; margin-bottom: 4px;">
                <div><strong>Utilised Budget</strong></div>
                <div style="width: 20px;"></div>
                <div style="text-align: right;">${utilised.toLocaleString()} INR</div>
              </div>
       
            </div>
          `;
      },
    },

    legend: {
      show: true,
      position: "top",
    },
  };
  return (
    <div>
      <Chart options={options} series={data} type="bar" height={350} />
    </div>
  );
};

export default HrExpenseGraph;
