import BarGraph from "../../../components/graphs/BarGraph";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { IoIosArrowDown } from "react-icons/io";
import AgTable from "../../../components/AgTable";
import WidgetSection from "../../../components/WidgetSection";
import dayjs from "dayjs";

const CoWorking = () => {
  const monthlyRevenueData = [
    {
      month: "Apr-24",
      projected: 3000000,
      clients: [
        {
          clientName: "Zomato",
          revenue: 1000000,
          status: "Paid",
          desks: 5,
          occupancy: 1.6,
          term: 12,
          expiry: 2,
          recievedDate: "01/01/2025",
          dueDate: "02/02/2025",
        },
        {
          clientName: "UrbanClap",
          revenue: 800000,
          status: "Paid",
          desks: 5,
          occupancy: 1.6,
          term: 12,
          expiry: 2,
          recievedDate: "01/01/2025",
          dueDate: "02/02/2025",
        },
        {
          clientName: "Cred",
          revenue: 1000000,
          status: "Paid",
          desks: 5,
          occupancy: 1.6,
          term: 12,
          expiry: 2,
          recievedDate: "01/01/2025",
          dueDate: "02/02/2025",
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
          desks: 8,
          occupancy: 2.1,
          term: 12,
          expiry: 4,
          recievedDate: "03/01/2025",
          dueDate: "04/02/2025",
        },
        {
          clientName: "Freshworks",
          revenue: 1250000,
          status: "Paid",
          desks: 6,
          occupancy: 1.8,
          term: 9,
          expiry: 3,
          recievedDate: "03/01/2025",
          dueDate: "04/02/2025",
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
          desks: 10,
          occupancy: 2.5,
          term: 12,
          expiry: 6,
          recievedDate: "05/01/2025",
          dueDate: "06/02/2025",
        },
        {
          clientName: "Paytm",
          revenue: 900000,
          status: "Paid",
          desks: 7,
          occupancy: 1.9,
          term: 6,
          expiry: 2,
          recievedDate: "05/01/2025",
          dueDate: "06/02/2025",
        },
        {
          clientName: "Myntra",
          revenue: 750000,
          status: "Paid",
          desks: 5,
          occupancy: 1.6,
          term: 9,
          expiry: 3,
          recievedDate: "05/01/2025",
          dueDate: "06/02/2025",
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
          desks: 9,
          occupancy: 2.3,
          term: 12,
          expiry: 7,
          recievedDate: "07/01/2025",
          dueDate: "08/02/2025",
        },
        {
          clientName: "Meesho",
          revenue: 800000,
          status: "Paid",
          desks: 6,
          occupancy: 1.8,
          term: 6,
          expiry: 2,
          recievedDate: "07/01/2025",
          dueDate: "08/02/2025",
        },
        {
          clientName: "Delhivery",
          revenue: 600000,
          status: "Paid",
          desks: 5,
          occupancy: 1.7,
          term: 9,
          expiry: 3,
          recievedDate: "07/01/2025",
          dueDate: "08/02/2025",
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
          desks: 7,
          occupancy: 2.0,
          term: 12,
          expiry: 8,
          recievedDate: "08/01/2025",
          dueDate: "09/02/2025",
        },
        {
          clientName: "Bounce",
          revenue: 900000,
          status: "Paid",
          desks: 6,
          occupancy: 1.9,
          term: 6,
          expiry: 3,
          recievedDate: "08/01/2025",
          dueDate: "09/02/2025",
        },
        {
          clientName: "Flipkart",
          revenue: 1250000,
          status: "Paid",
          desks: 10,
          occupancy: 2.7,
          term: 12,
          expiry: 9,
          recievedDate: "08/01/2025",
          dueDate: "09/02/2025",
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
          desks: 8,
          occupancy: 2.2,
          term: 12,
          expiry: 10,
          recievedDate: "09/01/2025",
          dueDate: "10/02/2025",
        },
        {
          clientName: "Lenskart",
          revenue: 900000,
          status: "Paid",
          desks: 5,
          occupancy: 1.5,
          term: 6,
          expiry: 3,
          recievedDate: "09/01/2025",
          dueDate: "10/02/2025",
        },
        {
          clientName: "Byju's",
          revenue: 750000,
          status: "Paid",
          desks: 7,
          occupancy: 2.0,
          term: 9,
          expiry: 4,
          recievedDate: "09/01/2025",
          dueDate: "10/02/2025",
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
          desks: 9,
          occupancy: 2.4,
          term: 12,
          expiry: 11,
          recievedDate: "10/01/2025",
          dueDate: "11/02/2025",
        },
        {
          clientName: "Razorpay",
          revenue: 900000,
          status: "Paid",
          desks: 6,
          occupancy: 1.9,
          term: 6,
          expiry: 3,
          recievedDate: "10/01/2025",
          dueDate: "11/02/2025",
        },
        {
          clientName: "Udaan",
          revenue: 850000,
          status: "Paid",
          desks: 7,
          occupancy: 2.0,
          term: 9,
          expiry: 5,
          recievedDate: "10/01/2025",
          dueDate: "11/02/2025",
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
          desks: 8,
          occupancy: 2.1,
          term: 12,
          expiry: 12,
          recievedDate: "11/01/2025",
          dueDate: "12/02/2025",
        },
        {
          clientName: "CoinDCX",
          revenue: 1000000,
          status: "Paid",
          desks: 6,
          occupancy: 1.8,
          term: 6,
          expiry: 3,
          recievedDate: "11/01/2025",
          dueDate: "12/02/2025",
        },
        {
          clientName: "Dream11",
          revenue: 1200000,
          status: "Paid",
          desks: 7,
          occupancy: 2.3,
          term: 9,
          expiry: 5,
          recievedDate: "11/01/2025",
          dueDate: "12/02/2025",
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
          desks: 7,
          occupancy: 2.0,
          term: 12,
          expiry: 12,
          recievedDate: "12/01/2025",
          dueDate: "01/02/2026",
        },
        {
          clientName: "Groww",
          revenue: 1300000,
          status: "Paid",
          desks: 6,
          occupancy: 1.9,
          term: 6,
          expiry: 3,
          recievedDate: "12/01/2025",
          dueDate: "01/02/2026",
        },
        {
          clientName: "CRED",
          revenue: 1100000,
          status: "Paid",
          desks: 8,
          occupancy: 2.2,
          term: 9,
          expiry: 5,
          recievedDate: "12/01/2025",
          dueDate: "01/02/2026",
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
          desks: 9,
          occupancy: 2.4,
          term: 12,
          expiry: 12,
          recievedDate: "01/01/2026",
          dueDate: "02/02/2026",
        },
        {
          clientName: "Oyo",
          revenue: 900000,
          status: "Paid",
          desks: 7,
          occupancy: 2.0,
          term: 6,
          expiry: 3,
          recievedDate: "01/01/2026",
          dueDate: "02/02/2026",
        },
        {
          clientName: "Pharmeasy",
          revenue: 850000,
          status: "Paid",
          desks: 6,
          occupancy: 1.7,
          term: 9,
          expiry: 4,
          recievedDate: "01/01/2026",
          dueDate: "02/02/2026",
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
          status: "Paid",
          desks: 8,
          occupancy: 2.1,
          term: 12,
          expiry: 12,
          recievedDate: "02/01/2026",
          dueDate: "03/02/2026",
        },
        {
          clientName: "Boat",
          revenue: 1100000,
          status: "Paid",
          desks: 7,
          occupancy: 2.0,
          term: 6,
          expiry: 3,
          recievedDate: "02/01/2026",
          dueDate: "03/02/2026",
        },
        {
          clientName: "Zerodha",
          revenue: 1250000,
          status: "Paid",
          desks: 6,
          occupancy: 1.9,
          term: 9,
          expiry: 4,
          recievedDate: "02/01/2026",
          dueDate: "03/02/2026",
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
          desks: 8,
          occupancy: 2.2,
          term: 12,
          expiry: 12,
          recievedDate: "03/01/2026",
          dueDate: "04/02/2026",
        },
        {
          clientName: "PolicyBazaar",
          revenue: 1200000,
          status: "Paid",
          desks: 6,
          occupancy: 1.8,
          term: 6,
          expiry: 3,
          recievedDate: "03/01/2026",
          dueDate: "04/02/2026",
        },
        {
          clientName: "Swiggy",
          revenue: 1250000,
          status: "Paid",
          desks: 9,
          occupancy: 2.5,
          term: 9,
          expiry: 5,
          recievedDate: "03/01/2026",
          dueDate: "04/02/2026",
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
        formatter: (val) => `INR ${val.toLocaleString()}`,
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `INR ${val.toLocaleString()}`,
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
        title={"Annual Monthly Co Working Revenues"}
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
            data: `INR ${totalActual.toLocaleString()}`,
          }}
          secondParam={{
            title: "Projected",
            data: `INR ${totalProjected.toLocaleString()}`,
          }}
        />
      </WidgetSection>
      <div className="flex flex-col gap-2 border-default border-borderGray rounded-md p-4">
      <div className="px-4 py-2 border-b-[1px] border-borderGray bg-gray-50">
          <div className="flex justify-between items-center w-full px-4 py-2">
            <span className="text-sm text-muted font-pmedium text-title">
              MONTH
            </span>
            <span className="px-8 text-sm text-muted font-pmedium text-title flex items-center gap-1">
              REVENUE
            </span>
            
          </div>
        </div>
        {monthlyRevenueData.map((monthData, index) => {
          const totalActual = monthData.clients.reduce(
            (sum, c) => sum + c.revenue,
            0
          );

          const rows = monthData.clients.map((client, index) => ({
            id: index + 1,
            clientName: client.clientName,
            revenue: `${client.revenue.toLocaleString()}`,
            status: client.status,
            desks: client.desks,
            occupancy: client.occupancy,
            term: client.term,
            expiry: client.expiry,
            recievedDate: dayjs(client.recievedDate).format("DD-MM-YYYY"),
            dueDate:dayjs(client.dueDate).format("DD-MM-YYYY"),
          }));

          const columns = [
            { headerName: "Sr No", field: "id", width: 80 },
            { headerName: "Client Name", field: "clientName" },
            { headerName: "Revenue (INR)", field: "revenue" },
            { headerName: "Status", field: "status" },
            { headerName: "Desks", field: "desks" },
            { headerName: "Occupancy", field: "occupancy" },
            { headerName: "Term (months)", field: "term" },
            { headerName: "Expiry (months)", field: "expiry" },
            { headerName: "Received Date", field: "recievedDate" },
            { headerName: "Due Date", field: "dueDate" },
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
                  INR {totalActual.toLocaleString()}
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
                  INR {totalActual.toLocaleString()} 
                </span>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </div>
    </div>
  );
};

export default CoWorking;
