import React from "react";
import Card from "../../../components/Card";
import { MdFormatListBulleted, MdOutlineMiscellaneousServices } from "react-icons/md";
import { SiCashapp, SiGoogleadsense } from "react-icons/si";
import WidgetSection from "../../../components/WidgetSection";
import LayerBarGraph from "../../../components/graphs/LayerBarGraph";

const FinanceDashboard = () => {
  const utilisedData = [125, 150, 99, 85, 70, 50, 80, 95, 100, 65, 50, 120];
  const defaultData = utilisedData.map((value) =>
    Math.max(100 - Math.min(value, 100), 0)
  );
  const utilisedStack = utilisedData.map((value) => Math.min(value, 100));
  const exceededData = utilisedData.map((value) =>
    value > 100 ? value - 100 : 0
  );

  const data = [
    { name: "Utilised Budget", data: utilisedStack },
    { name: "Default Budget", data: defaultData },
    { name: "Exceeded Budget", data: exceededData },
  ];

  const options = {
    chart: {
      type: "bar",
      stacked: true,
      fontFamily: "Poppins-Regular",
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
    colors: ["#27C96A", "#275D3E", "#FF0000"], // Colors for the series
    dataLabels: {
      enabled: true,
      formatter: (value, { seriesIndex }) => {
        if (seriesIndex === 1) return "";
        return `${value}%`;
      },
    },
    xaxis: {
      categories: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
    },
    yaxis: {
      max: 150,
      labels: {
        formatter: (value) => `${value}%`,
      },
    },
    tooltip: {
      y: {
        formatter: (value) => `${value}%`,
      },
    },
    legend: {
      show: true,
      position: "top",
    },
  };
  const techWidgets = [
    {
      layout: 1,
      widgets: [
        <WidgetSection border title={"Budget v/s Achievements"}>
          <LayerBarGraph data={data} options={options} />
        </WidgetSection>,
      ],
    },
    {
      layout: 4,
      widgets: [
        <Card icon={<MdFormatListBulleted />} title="Mix-Bag" />,
        <Card icon={<SiCashapp />} title="Finance" route={"finance"} />,
        <Card icon={<SiGoogleadsense />} title="Data" />,
        <Card
          icon={<MdOutlineMiscellaneousServices />}
          title="Settings"
          
        />,
      ],
    },
  ];

  return (
    <div>
      {techWidgets.map((section, index) => (
        <WidgetSection key={index} layout={section?.layout}>
          {section?.widgets}
        </WidgetSection>
      ))}
    </div>
  );
};

export default FinanceDashboard;
