import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import BarGraph from "../../../components/graphs/BarGraph";
import WidgetSection from "../../../components/WidgetSection";
import { monthlyLeadsData, monthlyLeadsOptions } from "./SalesData/SalesData";
import { IoIosArrowDown } from "react-icons/io";
import AgTable from "../../../components/AgTable";

const TotalRevenue = () => {
  const rawData = [
    {
      name: "Co-Working",
      data: [
        800000, 750000, 900000, 850000, 780000, 920000, 940000, 960000, 880000,
        970000, 910000, 950000,
      ],
    },
    {
      name: "Co-Living",
      data: [
        600000, 850000, 750000, 720000, 700000, 770000, 810000, 850000, 870000,
        880000, 890000, 920000,
      ],
    },
    {
      name: "Workations",
      data: [
        700000, 600000, 800000, 790000, 760000, 780000, 800000, 830000, 820000,
        840000, 860000, 870000,
      ],
    },
    {
      name: "Virtual Offices",
      data: [
        300000, 320000, 310000, 330000, 340000, 350000, 360000, 370000, 380000,
        390000, 400000, 410000,
      ],
    },
    {
      name: "Meetings",
      data: [
        450000, 470000, 460000, 480000, 490000, 500000, 510000, 520000, 530000,
        540000, 550000, 560000,
      ],
    },
    {
      name: "Alt. Revenues",
      data: [
        200000, 210000, 220000, 230000, 240000, 250000, 260000, 270000, 280000,
        290000, 300000, 310000,
      ],
    },
  ];

  const normalizedData = rawData.map((domain) => ({
    name: domain.name,
    data: domain.data.map((val, idx) => {
      const totalThisMonth = rawData.reduce(
        (sum, item) => sum + item.data[idx],
        0
      );
      return totalThisMonth ? Math.round((val / totalThisMonth) * 100) : 0;
    }),
  }));
  const options = {
    chart: {
      stacked: true,
      fontFamily : "Poppins-Regular"
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
      title: { text: "" },
    },
    yaxis: {
      max: 100,
      labels: {
        formatter: (val) => `${val}%`,
      },
    },
    tooltip: {
      y: {
        formatter: function (val, { seriesIndex, dataPointIndex }) {
          const actualVal = rawData[seriesIndex]?.data?.[dataPointIndex];
          return actualVal ? `${actualVal.toLocaleString()} INR` : "No data";
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 5,
      },
    },
    legend: {
      show: true,
      position: "top",
    },
    colors: [
      "#1E3D73", // Dark Blue (Co-Working)
      "#2196F3", // Bright Blue (Meetings)
      "#98F5E1", // Light Mint Green (Virtual Office)
      "#00BCD4", // Cyan Blue (Workation)
      "#1976D2", // Medium Blue (Alt Revenues)
    ],
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return `${val}%`;
      },
      style: {
        fontSize: "10px",
        fontWeight: "bold",
        colors: ["#fff"],
      },
    },
  };

  const totalAnnualRevenue = rawData.reduce((sum, domain) => {
    return sum + domain.data.reduce((acc, monthVal) => acc + monthVal, 0);
  }, 0);
  const formattedRevenue = `${totalAnnualRevenue.toLocaleString("en-IN")} INR`;

  return (
    <div className="flex flex-col gap-4">
      <WidgetSection
        layout={1}
        title={"Annual Monthly Mix Revenues"}
        border
        TitleAmount={formattedRevenue}
      >
        <BarGraph height={400} data={normalizedData} options={options} />
      </WidgetSection>

      <div>
        {rawData.map((domain, index) => {
          const totalRevenue = domain.data.reduce((sum, val) => sum + val, 0);

          const monthLabels = [
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
          ];

          const rows = domain.data.map((val, idx) => {
            const [shortMonth, yearSuffix] = monthLabels[idx].split("-");
            const year = yearSuffix.startsWith("2")
              ? `20${yearSuffix}`
              : `20${yearSuffix}`;
            const fullMonthMap = {
              Jan: "January",
              Feb: "February",
              Mar: "March",
              Apr: "April",
              May: "May",
              Jun: "June",
              Jul: "July",
              Aug: "August",
              Sep: "September",
              Oct: "October",
              Nov: "November",
              Dec: "December",
            };
            return {
              month: fullMonthMap[shortMonth],
              year,
              revenue: `${val.toLocaleString()}`,
            };
          }).reverse();

          const columns = [
            { headerName: "Month", field: "month", flex: 1 },
            { headerName: "Year", field: "year", flex: 1 },
            { headerName: "Revenue (INR)", field: "revenue", flex: 1 },
          ];

          return (
            <Accordion key={index} className="py-4">
              <AccordionSummary
                expandIcon={<IoIosArrowDown />}
                aria-controls={`panel-${index}-content`}
                id={`panel-${index}-header`}
                className="border-b-[1px] border-borderGray"
              >
                <div className="flex justify-between items-center w-full px-4">
                  <span className="text-subtitle font-pmedium">
                    {domain.name}
                  </span>
                  <span className="text-subtitle font-pmedium">
                    {totalRevenue.toLocaleString()} INR
                  </span>
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <AgTable
                  search={rows.length > 5}
                  data={rows}
                  columns={columns}
                  tableHeight={300}
                />
                <span className="text-sm font-medium mt-2 block">
                  Total revenue of {domain.name}: ₹
                  {totalRevenue.toLocaleString()}
                </span>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </div>
    </div>
  );
};

export default TotalRevenue;
