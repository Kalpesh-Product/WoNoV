import Card from "../../../components/Card";
import React from "react";
import { useLocation } from "react-router-dom";
import LayerBarGraph from "../../../components/graphs/LayerBarGraph";
import WidgetSection from "../../../components/WidgetSection";
import { MdRebaseEdit } from "react-icons/md";
import { LuHardDriveUpload } from "react-icons/lu";
import { CgWebsite } from "react-icons/cg";
import DataCard from "../../../components/DataCard";
import { SiCashapp } from "react-icons/si";
import { SiGoogleadsense } from "react-icons/si";
import { MdMiscellaneousServices } from "react-icons/md";
import BarGraph from "../../../components/graphs/BarGraph";
import PieChartMui from "../../../components/graphs/PieChartMui";
import LineGraph from "../../../components/graphs/LineGraph";
import BudgetGraph from "../../../components/graphs/BudgetGraph";

const FrontendDashboard = () => {
  const utilisedData = [
    125000, 150000, 99000, 85000, 70000, 50000, 80000, 95000, 100000, 65000,
    50000, 120000,
  ];

  const maxBudget = [
    100000, 120000, 100000, 100000, 80000, 60000, 85000, 95000, 100000, 70000,
    60000, 110000,
  ];

  const siteVisitorsData = [
    {
      name: "Site Visitors",
      data: [
        1200, 1000, 900, 1100, 1300, 800, 950, 1050, 1150, 1250, 1350, 1400,
      ], // Monthly counts
    },
  ];

  // Chart options
  const siteVisitorOptions = {
    chart: {
      fontFamily: "Poppins-Regular",
      id: "site-visitors-bar",
      toolbar: { show: false },
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
      ], // Financial year months
      title: {
        text: undefined, // 👈 empty string works too
      },
    },
    yaxis: {
      title: {
        text: "Visitors Count",
      },
      min: 0,
      max: 1700,
      tickAmount: 5, // 0, 20, 40, ... 140
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: "35%",
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true, // Disable data labels for a cleaner look
      style: {
        fontSize: "12px",
        colors: ["#000"], // Set label color
      },
      offsetY: -22, // Adjust position slightly above the bars
    },
    tooltip: {
      theme: "light",
    },
  };

  const nationWiseData = [
    { id: 0, value: 30, actualCount: 300, label: "Mumbai", color: "#00274D" }, // Deep Navy Blue
    { id: 1, value: 20, actualCount: 200, label: "Delhi", color: "#003F7F" }, // Dark Blue
    {
      id: 2,
      value: 15,
      actualCount: 150,
      label: "Bangalore",
      color: "#0056B3",
    }, // Royal Blue
    {
      id: 3,
      value: 10,
      actualCount: 100,
      label: "Hyderabad",
      color: "#0073E6",
    }, // Bright Blue
    { id: 4, value: 8, actualCount: 80, label: "Chennai", color: "#338FFF" }, // Sky Blue
    { id: 5, value: 7, actualCount: 70, label: "Kolkata", color: "#6699FF" }, // Light Blue
    { id: 6, value: 5, actualCount: 50, label: "Pune", color: "#99B3FF" }, // Soft Blue
    { id: 7, value: 5, actualCount: 50, label: "Ahmedabad", color: "#CCD9FF" }, // Very Light Blue
  ];

  // Updated Pie Chart Configuration
  const nationWisePieChart = {
    chart: {
      type: "pie",
      fontFamily: "Poppins-Regular",
    },
    labels: nationWiseData.map((item) => item.label),
    colors: nationWiseData.map((item) => item.color), // Apply new shades of blue
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return `${val.toFixed(0)}%`; // Display percentage
      },
    },
    tooltip: {
      enabled: true,
      custom: function ({ series, seriesIndex }) {
        const item = nationWiseData[seriesIndex];
        return `
          <div style="padding: 5px; font-size: 12px;">
            ${item.label}: ${item.actualCount} visitors
          </div>`;
      },
    },
    legend: {
      position: "right",
      horizontalAlign: "center",
    },
  };

  //Line Graph data

  const totalIssues = [5, 7, 6, 6, 5, 5, 5, 8, 6, 4, 6, 7];
  const resolvedIssues = [4, 7, 5, 6, 4, 4, 5, 7, 6, 4, 5, 7];

  // Calculate percentage of resolved issues
  const resolvedPercentage = totalIssues.map((total, index) => {
    return ((resolvedIssues[index] / total) * 100).toFixed(2); // Convert to percentage
  });

  const websiteIssuesOptions = {
    chart: {
      id: "website-resolved-issues",
      type: "line",
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "Poppins-Regular",
    },
    stroke: {
      width: 4,
    },
    markers: {
      size: 6,
      colors: ["#0056B3"],
      strokeColors: "#fff",
      strokeWidth: 2,
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
      title: {
        text: "Resolved Percentage (%)",
      },
      labels: {
        formatter: (value) => `${value}%`,
      },
      min: 0,
      max: 100,
      tickAmount: 5, // 0, 20, 40, 60, 80, 100
    },
    tooltip: {
      enabled: true,
      custom: function ({ series, seriesIndex, dataPointIndex }) {
        return `<div style="padding: 8px; font-size: 12px;">
          <strong>Resolved Percentage:</strong> ${resolvedPercentage[dataPointIndex]}%<br />
          <strong>Total Issues:</strong> ${totalIssues[dataPointIndex]}<br />
          <strong>Resolved Issues:</strong> ${resolvedIssues[dataPointIndex]}
        </div>`;
      },
    },
    legend: {
      show: true, // No need for legend since only one line is displayed
    },
  };

  const websiteIssuesData = [
    {
      name: "Resolved Percentage",
      data: resolvedPercentage,
      color: "#0056B3",
    },
  ];

  const goaDistrictData = [
    { id: 0, value: 40, actualCount: 400, label: "Panaji", color: "#00274D" }, // Deep Navy Blue
    { id: 1, value: 25, actualCount: 250, label: "Margao", color: "#003F7F" }, // Dark Blue
    { id: 2, value: 15, actualCount: 150, label: "Mapusa", color: "#0056B3" }, // Royal Blue
    { id: 3, value: 10, actualCount: 100, label: "Pernem", color: "#0073E6" }, // Bright Blue
    { id: 4, value: 10, actualCount: 100, label: "Vasco", color: "#338FFF" }, // Sky Blue
  ];

  // Updated Pie Chart Configuration for Goa Districts
  const goaDistrictPieChart = {
    chart: {
      type: "pie",
      fontFamily: "Poppins-Regular",
    },
    labels: goaDistrictData.map((item) => item.label),
    colors: goaDistrictData.map((item) => item.color),
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return `${val.toFixed(0)}%`; // Display percentage
      },
    },
    tooltip: {
      enabled: true,
      custom: function ({ series, seriesIndex }) {
        const item = goaDistrictData[seriesIndex];
        return `
          <div style="padding: 5px; font-size: 12px;">
            ${item.label}: ${item.actualCount} visitors
          </div>`;
      },
    },
    legend: {
      position: "right",
      horizontalAlign: "center",
    },
  };

  const techWidgets = [
    {
      layout: 1,
      widgets: [
        <WidgetSection
          layout={1}
          border
          title={"Budget v/s Achievements"}
          titleLabel={"FY 2024-25"}>
          {/* <LayerBarGraph data={data} options={options} /> */}
          <BudgetGraph
            utilisedData={utilisedData}
            maxBudget={maxBudget}
            route={"finance/budget"}
          />
          <hr />
          <WidgetSection layout={3} padding>
            <DataCard
              data={"40K"}
              title={"Projected"}
              route={"/app/dashboard/frontend-dashboard/finance"}
              description={`Current Month: ${new Date().toLocaleString(
                "default",
                {
                  month: "short",
                }
              )}-24`}
            />
            <DataCard
              data={"35K"}
              title={"Actual"}
              route={"/app/dashboard/frontend-dashboard/finance"}
              description={`Current Month: ${new Date().toLocaleString(
                "default",
                {
                  month: "short",
                }
              )}-24`}
            />
            <DataCard
              data={6000}
              title={"Requested"}
              route={"/app/dashboard/frontend-dashboard/finance"}
              description={`Current Month: ${new Date().toLocaleString(
                "default",
                {
                  month: "short",
                }
              )}-24`}
            />
          </WidgetSection>
        </WidgetSection>,
      ],
    },
    {
      layout: 5,
      widgets: [
        <Card
          icon={<LuHardDriveUpload />}
          title="Edit website"
          route={`/app/dashboard/frontend-dashboard/edit-theme/BIZNest/Home`}
        />,
        <Card icon={<CgWebsite />} title="New Themes" route={"select-theme"} />,
        <Card icon={<SiCashapp />} title="Finance" route={"finance"} />,
        <Card icon={<SiGoogleadsense />} title="Data" route={"data"} />,
        <Card
          icon={<MdMiscellaneousServices />}
          title="Settings"
          route={"settings"}
        />,
      ],
    },
    {
      layout: 1,
      widgets: [
        <WidgetSection
          layout={1}
          border
          title={"Site Visitors"}
          titleLabel={"FY 2024-25"}>
          <BarGraph data={siteVisitorsData} options={siteVisitorOptions} />
        </WidgetSection>,
      ],
    },

    {
      layout: 2,
      widgets: [
        <WidgetSection layout={1} border title={"Nation-wise site Visitors"}>
          <PieChartMui
            percent={true} // Enable percentage display
            data={nationWiseData} // Pass processed data
            options={nationWisePieChart}
            width={500}
          />
        </WidgetSection>,
        <WidgetSection layout={1} border title={"State-wise site Visitors"}>
          <PieChartMui
            percent={true} // Enable percentage display
            data={goaDistrictData} // Pass processed data
            options={goaDistrictPieChart}
            width={500}
          />
        </WidgetSection>,
      ],
    },

    {
      layout: 1,
      widgets: [
        <WidgetSection layout={1} title={"Website Issues Raised"} border>
          <LineGraph options={websiteIssuesOptions} data={websiteIssuesData} />
        </WidgetSection>,
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

export default FrontendDashboard;
