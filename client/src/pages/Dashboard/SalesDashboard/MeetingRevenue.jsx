import BarGraph from "../../../components/graphs/BarGraph";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { IoIosArrowDown } from "react-icons/io";
import AgTable from "../../../components/AgTable";
import WidgetSection from "../../../components/WidgetSection";

const MeetingRevenue = () => {
  const monthlyMeetingeData = [
    {
      month: "Apr-24",
      projected: 3000000,
      clients: [
        {
          clientName: "Zomato",
          revenue: 1000000,
          status: "Paid",
          totalCredits: 100,
          usedCredits: 80,
          extraCredits: 10,
          bookingHours: 150,
        },
        {
          clientName: "UrbanClap",
          revenue: 800000,
          status: "Unpaid",
          totalCredits: 100,
          usedCredits: 80,
          extraCredits: 10,
          bookingHours: 150,
        },
        {
          clientName: "Cred",
          revenue: 1000000,
          status: "Paid",
          totalCredits: 100,
          usedCredits: 80,
          extraCredits: 10,
          bookingHours: 150,
        },
      ],
    },
    {
      month: "May-24",
      projected: 2800000,
      clients: [
        {
          clientName: "Swiggy",
          revenue: 1500000,
          status: "Paid",
          totalCredits: 120,
          usedCredits: 90,
          extraCredits: 15,
          bookingHours: 170,
        },
        {
          clientName: "Freshworks",
          revenue: 1250000,
          status: "Unpaid",
          totalCredits: 100,
          usedCredits: 85,
          extraCredits: 10,
          bookingHours: 160,
        },
      ],
    },
    {
      month: "Jun-24",
      projected: 2900000,
      clients: [
        {
          clientName: "Zoho",
          revenue: 1200000,
          status: "Paid",
          totalCredits: 110,
          usedCredits: 95,
          extraCredits: 12,
          bookingHours: 175,
        },
        {
          clientName: "Paytm",
          revenue: 900000,
          status: "Paid",
          totalCredits: 100,
          usedCredits: 80,
          extraCredits: 8,
          bookingHours: 140,
        },
        {
          clientName: "Myntra",
          revenue: 750000,
          status: "Unpaid",
          totalCredits: 90,
          usedCredits: 70,
          extraCredits: 5,
          bookingHours: 130,
        },
      ],
    },
    {
      month: "Jul-24",
      projected: 3100000,
      clients: [
        {
          clientName: "Tata 1mg",
          revenue: 1600000,
          status: "Paid",
          totalCredits: 130,
          usedCredits: 110,
          extraCredits: 10,
          bookingHours: 190,
        },
        {
          clientName: "Meesho",
          revenue: 800000,
          status: "Unpaid",
          totalCredits: 100,
          usedCredits: 85,
          extraCredits: 7,
          bookingHours: 165,
        },
        {
          clientName: "Delhivery",
          revenue: 600000,
          status: "Paid",
          totalCredits: 95,
          usedCredits: 80,
          extraCredits: 6,
          bookingHours: 155,
        },
      ],
    },
    {
      month: "Aug-24",
      projected: 3200000,
      clients: [
        {
          clientName: "CureFit",
          revenue: 1000000,
          status: "Paid",
          totalCredits: 110,
          usedCredits: 95,
          extraCredits: 5,
          bookingHours: 160,
        },
        {
          clientName: "Bounce",
          revenue: 900000,
          status: "Paid",
          totalCredits: 100,
          usedCredits: 85,
          extraCredits: 6,
          bookingHours: 155,
        },
        {
          clientName: "Flipkart",
          revenue: 1250000,
          status: "Unpaid",
          totalCredits: 130,
          usedCredits: 100,
          extraCredits: 15,
          bookingHours: 180,
        },
      ],
    },
    {
      month: "Sep-24",
      projected: 3000000,
      clients: [
        {
          clientName: "BigBasket",
          revenue: 1300000,
          status: "Paid",
          totalCredits: 120,
          usedCredits: 105,
          extraCredits: 10,
          bookingHours: 170,
        },
        {
          clientName: "Lenskart",
          revenue: 900000,
          status: "Unpaid",
          totalCredits: 100,
          usedCredits: 90,
          extraCredits: 7,
          bookingHours: 165,
        },
        {
          clientName: "Byju's",
          revenue: 750000,
          status: "Paid",
          totalCredits: 90,
          usedCredits: 80,
          extraCredits: 5,
          bookingHours: 150,
        },
      ],
    },
    {
      month: "Oct-24",
      projected: 3300000,
      clients: [
        {
          clientName: "Nykaa",
          revenue: 1500000,
          status: "Paid",
          totalCredits: 140,
          usedCredits: 120,
          extraCredits: 12,
          bookingHours: 190,
        },
        {
          clientName: "Razorpay",
          revenue: 900000,
          status: "Paid",
          totalCredits: 100,
          usedCredits: 90,
          extraCredits: 6,
          bookingHours: 160,
        },
        {
          clientName: "Udaan",
          revenue: 850000,
          status: "Unpaid",
          totalCredits: 110,
          usedCredits: 95,
          extraCredits: 10,
          bookingHours: 170,
        },
      ],
    },
    {
      month: "Nov-24",
      projected: 3400000,
      clients: [
        {
          clientName: "InMobi",
          revenue: 1200000,
          status: "Paid",
          totalCredits: 120,
          usedCredits: 100,
          extraCredits: 10,
          bookingHours: 175,
        },
        {
          clientName: "CoinDCX",
          revenue: 1000000,
          status: "Unpaid",
          totalCredits: 100,
          usedCredits: 85,
          extraCredits: 8,
          bookingHours: 160,
        },
        {
          clientName: "Dream11",
          revenue: 1200000,
          status: "Paid",
          totalCredits: 130,
          usedCredits: 110,
          extraCredits: 12,
          bookingHours: 180,
        },
      ],
    },
    {
      month: "Dec-24",
      projected: 3500000,
      clients: [
        {
          clientName: "Unacademy",
          revenue: 1100000,
          status: "Paid",
          totalCredits: 115,
          usedCredits: 90,
          extraCredits: 5,
          bookingHours: 165,
        },
        {
          clientName: "Groww",
          revenue: 1300000,
          status: "Paid",
          totalCredits: 125,
          usedCredits: 100,
          extraCredits: 8,
          bookingHours: 170,
        },
        {
          clientName: "CRED",
          revenue: 1100000,
          status: "Unpaid",
          totalCredits: 110,
          usedCredits: 95,
          extraCredits: 10,
          bookingHours: 160,
        },
      ],
    },
    {
      month: "Jan-25",
      projected: 3600000,
      clients: [
        {
          clientName: "Zepto",
          revenue: 1800000,
          status: "Paid",
          totalCredits: 140,
          usedCredits: 120,
          extraCredits: 15,
          bookingHours: 190,
        },
        {
          clientName: "Oyo",
          revenue: 900000,
          status: "Paid",
          totalCredits: 110,
          usedCredits: 95,
          extraCredits: 8,
          bookingHours: 165,
        },
        {
          clientName: "Pharmeasy",
          revenue: 850000,
          status: "Unpaid",
          totalCredits: 100,
          usedCredits: 85,
          extraCredits: 7,
          bookingHours: 155,
        },
      ],
    },
    {
      month: "Feb-25",
      projected: 3700000,
      clients: [
        {
          clientName: "Cars24",
          revenue: 1300000,
          status: "Unpaid",
          totalCredits: 120,
          usedCredits: 100,
          extraCredits: 10,
          bookingHours: 170,
        },
        {
          clientName: "Boat",
          revenue: 1100000,
          status: "Paid",
          totalCredits: 110,
          usedCredits: 95,
          extraCredits: 8,
          bookingHours: 160,
        },
        {
          clientName: "Zerodha",
          revenue: 1250000,
          status: "Paid",
          totalCredits: 130,
          usedCredits: 115,
          extraCredits: 12,
          bookingHours: 185,
        },
      ],
    },
    {
      month: "Mar-25",
      projected: 3800000,
      clients: [
        {
          clientName: "RedBus",
          revenue: 1300000,
          status: "Paid",
          totalCredits: 125,
          usedCredits: 105,
          extraCredits: 10,
          bookingHours: 175,
        },
        {
          clientName: "PolicyBazaar",
          revenue: 1200000,
          status: "Unpaid",
          totalCredits: 115,
          usedCredits: 100,
          extraCredits: 8,
          bookingHours: 165,
        },
        {
          clientName: "Swiggy",
          revenue: 1250000,
          status: "Paid",
          totalCredits: 130,
          usedCredits: 110,
          extraCredits: 10,
          bookingHours: 180,
        },
      ],
    },
  ];
  const series = [
    {
      name: "Projected Revenue",
      data: monthlyMeetingeData.map((item) => item.projected),
    },
    {
      name: "Actual Revenue",
      data: monthlyMeetingeData.map((item) =>
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
      categories: monthlyMeetingeData.map((item) => item.month),
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
  const totalActual = monthlyMeetingeData.reduce((sum, month) => {
    return (
      sum +
      month.clients.reduce((monthSum, client) => monthSum + client.revenue, 0)
    );
  }, 0);

  const totalProjected = monthlyMeetingeData.reduce(
    (sum, month) => sum + (month.projected ?? 0),
    0
  );
  return (
    <div className="p-4 flex flex-col gap-4">
      <WidgetSection
        title={"Annual Monthly Meetings Revenues"}
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
        {monthlyMeetingeData.map((monthData, index) => {
          const totalActual = monthData.clients.reduce(
            (sum, c) => sum + c.revenue,
            0
          );

          const rows = monthData.clients.map((client, index) => ({
            id: index + 1,
            clientName: client.clientName,
            revenue: `${client.revenue.toLocaleString()}`,
            status: client.status,
            totalCredits: client.totalCredits,
            usedCredits: client.usedCredits,
            extraCredits: client.extraCredits,
            bookingHours: client.bookingHours,
          }));

          const columns = [
            { headerName: "ID", field: "id", width: 80 },
            { headerName: "Client Name", field: "clientName", flex: 1 },
            { headerName: "Revenue (INR)", field: "revenue", flex: 1 },
            { headerName: "Total Credits", field: "totalCredits", flex: 1 },
            { headerName: "Used Credits", field: "usedCredits", flex: 1 },
            { headerName: "Extra Credits", field: "extraCredits", flex: 1 },
            { headerName: "Booking Hours", field: "bookingHours", flex: 1 },
            { headerName: "Status", field: "status", flex: 1 },
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

export default MeetingRevenue;
