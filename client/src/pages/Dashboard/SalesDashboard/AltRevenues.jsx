import BarGraph from "../../../components/graphs/BarGraph";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { IoIosArrowDown } from "react-icons/io";
import AgTable from "../../../components/AgTable";
import WidgetSection from "../../../components/WidgetSection";

const AltRevenues = () => {
  const monthlyRevenueData = [
    {
      month: "Apr-24",
      projected: 3000000,
      clients: [
        {
          revenueSource: "Stand Up Comedy",
          revenue: 1000000,
          recievedDate: "01/01/2025",
        },
        {
          revenueSource: "Stand Up Comedy",
          revenue: 800000,
          recievedDate: "01/01/2025",
        },
        {
          revenueSource: "Stand Up Comedy",
          revenue: 1000000,
          recievedDate: "01/01/2025",
        },
      ],
    },
    {
      month: "May-24",
      projected: 2800000,
      clients: [
        {
          revenueSource: "Corporate Workshop",
          revenue: 1200000,
          recievedDate: "03/01/2025",
        },
        {
          revenueSource: "Product Launch Event",
          revenue: 900000,
          recievedDate: "03/01/2025",
        },
        {
          revenueSource: "Startup Pitch Night",
          revenue: 700000,
          recievedDate: "03/01/2025",
        },
      ],
    },
    {
      month: "Jun-24",
      projected: 2900000,
      clients: [
        {
          revenueSource: "Music Concert",
          revenue: 1300000,
          recievedDate: "05/01/2025",
        },
        {
          revenueSource: "Art Exhibition",
          revenue: 1000000,
          recievedDate: "05/01/2025",
        },
        {
          revenueSource: "Networking Meetup",
          revenue: 600000,
          recievedDate: "05/01/2025",
        },
      ],
    },
    {
      month: "Jul-24",
      projected: 3100000,
      clients: [
        {
          revenueSource: "Tech Conference",
          revenue: 1400000,
          recievedDate: "07/01/2025",
        },
        {
          revenueSource: "Food Festival",
          revenue: 1000000,
          recievedDate: "07/01/2025",
        },
        {
          revenueSource: "Photography Workshop",
          revenue: 700000,
          recievedDate: "07/01/2025",
        },
      ],
    },
    {
      month: "Aug-24",
      projected: 3200000,
      clients: [
        {
          revenueSource: "Film Screening",
          revenue: 1200000,
          recievedDate: "08/01/2025",
        },
        {
          revenueSource: "Health & Wellness Expo",
          revenue: 1000000,
          recievedDate: "08/01/2025",
        },
        {
          revenueSource: "AI Panel Discussion",
          revenue: 1000000,
          recievedDate: "08/01/2025",
        },
      ],
    },
    {
      month: "Sep-24",
      projected: 3000000,
      clients: [
        {
          revenueSource: "Open Mic Night",
          revenue: 1000000,
          recievedDate: "09/01/2025",
        },
        {
          revenueSource: "Investor Roundtable",
          revenue: 1100000,
          recievedDate: "09/01/2025",
        },
        {
          revenueSource: "SaaS Product Demo Day",
          revenue: 900000,
          recievedDate: "09/01/2025",
        },
      ],
    },
    {
      month: "Oct-24",
      projected: 3300000,
      clients: [
        {
          revenueSource: "Design Thinking Workshop",
          revenue: 1200000,
          recievedDate: "10/01/2025",
        },
        {
          revenueSource: "Food Entrepreneur Fair",
          revenue: 1100000,
          recievedDate: "10/01/2025",
        },
        {
          revenueSource: "Blockchain Bootcamp",
          revenue: 1000000,
          recievedDate: "10/01/2025",
        },
      ],
    },
    {
      month: "Nov-24",
      projected: 3400000,
      clients: [
        {
          revenueSource: "Tech Startup Expo",
          revenue: 1300000,
          recievedDate: "11/01/2025",
        },
        {
          revenueSource: "Creative Writing Retreat",
          revenue: 1100000,
          recievedDate: "11/01/2025",
        },
        {
          revenueSource: "Interior Design Showcase",
          revenue: 1000000,
          recievedDate: "11/01/2025",
        },
      ],
    },
    {
      month: "Dec-24",
      projected: 3500000,
      clients: [
        {
          revenueSource: "New Year Gala",
          revenue: 1500000,
          recievedDate: "12/01/2025",
        },
        {
          revenueSource: "Winter Art Carnival",
          revenue: 1000000,
          recievedDate: "12/01/2025",
        },
        {
          revenueSource: "Sustainable Living Summit",
          revenue: 1000000,
          recievedDate: "12/01/2025",
        },
      ],
    },
    {
      month: "Jan-25",
      projected: 3600000,
      clients: [
        {
          revenueSource: "Entrepreneurship Bootcamp",
          revenue: 1400000,
          recievedDate: "01/01/2026",
        },
        {
          revenueSource: "Women in Tech Forum",
          revenue: 1100000,
          recievedDate: "01/01/2026",
        },
        {
          revenueSource: "Digital Marketing Masterclass",
          revenue: 1100000,
          recievedDate: "01/01/2026",
        },
      ],
    },
    {
      month: "Feb-25",
      projected: 3700000,
      clients: [
        {
          revenueSource: "Startup Awards Night",
          revenue: 1400000,
          recievedDate: "02/01/2026",
        },
        {
          revenueSource: "Investor Pitch Showcase",
          revenue: 1200000,
          recievedDate: "02/01/2026",
        },
        {
          revenueSource: "Fintech Founders Forum",
          revenue: 1100000,
          recievedDate: "02/01/2026",
        },
      ],
    },
    {
      month: "Mar-25",
      projected: 3800000,
      clients: [
        {
          revenueSource: "Annual Innovation Conference",
          revenue: 1500000,
          recievedDate: "03/01/2026",
        },
        {
          revenueSource: "Music & Media Summit",
          revenue: 1200000,
          recievedDate: "03/01/2026",
        },
        {
          revenueSource: "Creative Business Fest",
          revenue: 1100000,
          recievedDate: "03/01/2026",
        },
      ],
    },
  ];
  const series = [
    {
      name: "Projected Revenue",
      data: monthlyRevenueData.map((item) => item.projected),
    },
    {
      name: "Actual Revenue",
      data: monthlyRevenueData.map((item) =>
        item.clients.reduce((sum, c) => sum + c.revenue, 0)
      ),
    },
  ];

  const options = {
    chart: {
      stacked: false,
      toolbar: false,
      fontFamily: "Poppins-Regular",
    },
    legend: {
      show: true,
      position: "top",
    },
    dataLabels: {
      enabled: false,
      formatter: function (val) {
        return `${val}%`;
      },
      style: {
        fontSize: "10px",
        fontWeight: "bold",
        colors: ["#fff"],
      },
    },
    xaxis: {
      categories: monthlyRevenueData.map((item) => item.month),
    },
    yaxis: {
      labels: {
        formatter: (val) => `₹${val.toLocaleString()}`,
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val.toLocaleString()} INR`,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "75%",
        borderRadius: 5,
      },
    },
    colors: ["#1E3D73", "#80bf01"],
  };
  const totalActual = monthlyRevenueData.reduce((sum, month) => {
    return (
      sum +
      month.clients.reduce((monthSum, client) => monthSum + client.revenue, 0)
    );
  }, 0);

  const totalProjected = monthlyRevenueData.reduce(
    (sum, month) => sum + (month.projected ?? 0),
    0
  );

  return (
    <div className="p-4 flex flex-col gap-4">
      <WidgetSection
        title={"Annual Monthly Alternate Revenues"}
        titleLabel={"FY 2024-25"}
        border
      >
        <BarGraph
          data={series}
          options={options}
          height={400}
          customLegend
          firstParam={{
            title: "Actual",
            data: `${totalActual.toLocaleString()} INR`,
          }}
          secondParam={{
            title: "Projected",
            data: `${totalProjected.toLocaleString()} INR`,
          }}
        />
      </WidgetSection>

      <div>
        {monthlyRevenueData.map((monthData, index) => {
          const totalActual = monthData.clients.reduce(
            (sum, c) => sum + c.revenue,
            0
          );

          const rows = monthData.clients.map((client, index) => ({
            id: index + 1,
            revenueSource: client.revenueSource,
            revenue: `${client.revenue.toLocaleString()}`,
            recievedDate: client.recievedDate,
          }));

          const columns = [
            { headerName: "ID", field: "id", width: 80 },
            { headerName: "Revenue Source", field: "revenueSource", flex: 1 },
            { headerName: "Revenue (INR)", field: "revenue", flex: 1 },
            { headerName: "Received Date", field: "recievedDate", flex: 1 },
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
                    {monthData.month}
                  </span>
                  <span className="text-subtitle font-pmedium">
                    {totalActual.toLocaleString()} INR
                  </span>
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <AgTable
                  search={rows.length > 5}
                  hideFilter={rows.length < 5}
                  data={rows}
                  columns={columns}
                  tableHeight={300}
                />
                <span className="text-sm font-medium mt-2 block">
                  Total Actual Revenue for {monthData.month}:
                  {totalActual.toLocaleString()} INR
                </span>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </div>
    </div>
  );
};

export default AltRevenues;
