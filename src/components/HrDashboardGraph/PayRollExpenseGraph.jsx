import { useLocation } from "react-router-dom";
import { MdRebaseEdit } from "react-icons/md";
import { LuHardDriveUpload } from "react-icons/lu";
import { SiCashapp } from "react-icons/si";
import { SiGoogleadsense } from "react-icons/si";
import { CgWebsite } from "react-icons/cg";
import { MdMiscellaneousServices } from "react-icons/md";
import LayerBarGraph from "../graphs/LayerBarGraph";
import Card from "../Card";
import WidgetSection from "../WidgetSection";
import DataCard from "../DataCard";
import BarGraph from "../graphs/BarGraph";

const PayRollExpenseGraph = () => {
  const location = useLocation(); //will need to change useLocation and use context for content rendering once the auth is done

  // Data and calculations
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
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 8,
      },
    },
    colors: ["#00FF00", "#0000FF", "#FF0000"], // Colors for the series
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
        <LayerBarGraph
        key="bar-1"
          title="Budget v/s Achievements"
          data={data}
          options={options}
        />,
      ],
    },
    {
      layout: 6,
      widgets: [
       <Card key="" icon={<MdRebaseEdit />} title="Edit Live Theme" />,
       <Card key="" icon={<LuHardDriveUpload />} title="Upload Website" />,
       <Card key="" icon={<CgWebsite />} title="New Themes" />,
       <Card key="" icon={<SiCashapp />} title="Budget" />,
       <Card key="" icon={<SiGoogleadsense />} title="Leads" />,
       <Card key="" icon={<MdMiscellaneousServices />} title="Miscellaneous" />,
      ],
    },
    {
      layout: 3,
      widgets: [
        <DataCard key=""
          title={"Projected"}
          data={23}
          description={"Per Unit Cost"}
        />,
        <DataCard key="" title={"Actual"} data={23} description={"Per Unit Cost"} />,
        <DataCard key="" title={"Requested"} data={6000} description={"Pending"} />,
      ],
    },
    {
      layout: 2,
      widgets: [
        <BarGraph
        key="bar-2"
          data={[
            150,
            320,
            450,
            720,
            880,
            910,
            960,
            990,
            1000,
            1110,
            1200,
            1450, // Example random values
          ]}
          title={"Unique Companies"}
        />,
      ],
    },
  ];

  // Map departments to widget arrays
  const departmentWidgets = {
    "frontend-dashboard": techWidgets,
  };

  // Get department key from location
  const departmentKey = location.pathname.split("/").pop(); // Extracts "frontend-dashboard" or "sales-dashboard"

  // Get widgets for the department, default to an empty array
  const widgets = departmentWidgets[departmentKey] || [];

  return (
    <div>
      {widgets.map((section, index) => (
        <WidgetSection key={index} layout={section?.layout}>
          {section?.widgets}
        </WidgetSection>
      ))}
    </div>
  );
};

export default PayRollExpenseGraph;
