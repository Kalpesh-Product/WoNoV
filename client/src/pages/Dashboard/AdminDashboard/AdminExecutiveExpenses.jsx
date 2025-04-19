import React, { useState } from "react";
import BarGraph from "../../../components/graphs/BarGraph";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { IoIosArrowDown } from "react-icons/io";
import AgTable from "../../../components/AgTable";
import WidgetSection from "../../../components/WidgetSection";
import dayjs from "dayjs";
import { inrFormat } from "../../../utils/currencyFormat";

const AdminExecutiveExpenses = () => {
  //Proper columns only in April
  let mockBusinessRevenueData = [
    {
      month: "April",
      domains: [
        {
          name: "ST-701A",
          revenue: 0,
          clients: [
            {
              client: "Zomato",
              representative: "John Doe",
              adminLead: "Anne Fernandes",
              registerDate: "2024-01-15",
              actualRevenue: 5200,
            },
            {
              client: "Uber",
              representative: "Jane Smith",
              adminLead: "Anne Fernandes",
              registerDate: "2024-02-10",
              actualRevenue: 4300,
            },
            {
              client: "Ola",
              representative: "Alice Johnson",
              adminLead: "Anne Fernandes",
              registerDate: "2024-03-05",
              actualRevenue: 3700,
            },
            {
              client: "Swiggy",
              representative: "Priya Mehta",
              adminLead: "Anne Fernandes",
              registerDate: "2024-02-21",
              actualRevenue: 4600,
            },
            {
              client: "Dunzo",
              representative: "Arjun Verma",
              adminLead: "Anne Fernandes",
              registerDate: "2024-01-10",
              actualRevenue: 3900,
            },
            {
              client: "Grofers",
              representative: "Meena Rao",
              adminLead: "Anne Fernandes",
              registerDate: "2024-03-01",
              actualRevenue: 4100,
            },
            {
              client: "Blinkit",
              representative: "Karan Shah",
              adminLead: "Anne Fernandes",
              registerDate: "2024-01-18",
              actualRevenue: 4400,
            },
            {
              client: "BigBasket",
              representative: "Ravi Nair",
              adminLead: "Anne Fernandes",
              registerDate: "2024-02-28",
              actualRevenue: 4800,
            },
          ],
        },
        {
          name: "ST-701B",
          revenue: 0,
          clients: [
            {
              client: "PhonePe",
              representative: "Henry Ford",
              adminLead: "Anne Fernandes",
              registerDate: "2024-02-11",
              actualRevenue: 4600,
            },
            {
              client: "Snapdeal",
              representative: "Chris Blue",
              adminLead: "Anne Fernandes",
              registerDate: "2024-01-12",
              actualRevenue: 4200,
            },
            {
              client: "Paytm",
              representative: "Rachel Black",
              adminLead: "Anne Fernandes",
              registerDate: "2024-03-02",
              actualRevenue: 4800,
            },
            {
              client: "Myntra",
              representative: "Chloe Grey",
              adminLead: "Anne Fernandes",
              registerDate: "2024-02-20",
              actualRevenue: 5000,
            },
            {
              client: "Ajio",
              representative: "Neha Verma",
              adminLead: "Anne Fernandes",
              registerDate: "2024-03-10",
              actualRevenue: 4700,
            },
            {
              client: "Meesho",
              representative: "Yash Shah",
              adminLead: "Anne Fernandes",
              registerDate: "2024-03-16",
              actualRevenue: 4300,
            },
            {
              client: "JioMart",
              representative: "Deepak Reddy",
              adminLead: "Anne Fernandes",
              registerDate: "2024-01-17",
              actualRevenue: 4500,
            },
            {
              client: "Reliance Trends",
              representative: "Ritika Sharma",
              adminLead: "Anne Fernandes",
              registerDate: "2024-02-26",
              actualRevenue: 4900,
            },
          ],
        },
        {
          name: "ST-601A",
          revenue: 0,
          clients: [
            {
              client: "Tata Cliq",
              representative: "Ananya Rao",
              adminLead: "Anne Fernandes",
              registerDate: "2024-03-12",
              actualRevenue: 5200,
            },
            {
              client: "Lenskart",
              representative: "Rohit Sen",
              adminLead: "Anne Fernandes",
              registerDate: "2024-04-18",
              actualRevenue: 5100,
            },
            {
              client: "Pepperfry",
              representative: "Kiran Das",
              adminLead: "Anne Fernandes",
              registerDate: "2024-05-10",
              actualRevenue: 5300,
            },
            {
              client: "Boat",
              representative: "Kavya Nair",
              adminLead: "Anne Fernandes",
              registerDate: "2024-01-19",
              actualRevenue: 4900,
            },
            {
              client: "Croma",
              representative: "Varun Kapoor",
              adminLead: "Anne Fernandes",
              registerDate: "2024-02-15",
              actualRevenue: 4700,
            },
            {
              client: "Decathlon",
              representative: "Simran Kaur",
              adminLead: "Anne Fernandes",
              registerDate: "2024-03-20",
              actualRevenue: 5100,
            },
            {
              client: "FirstCry",
              representative: "Amit Jain",
              adminLead: "Anne Fernandes",
              registerDate: "2024-02-27",
              actualRevenue: 4600,
            },
            {
              client: "Beardo",
              representative: "Vikas Malhotra",
              adminLead: "Anne Fernandes",
              registerDate: "2024-01-08",
              actualRevenue: 4900,
            },
          ],
        },
        {
          name: "ST-601B",
          revenue: 0,
          clients: [
            {
              client: "PharmEasy",
              representative: "Sanya Gill",
              adminLead: "Anne Fernandes",
              registerDate: "2024-01-22",
              actualRevenue: 4700,
            },
            {
              client: "1mg",
              representative: "Kunal Bhat",
              adminLead: "Anne Fernandes",
              registerDate: "2024-02-10",
              actualRevenue: 4500,
            },
            {
              client: "Tanishq",
              representative: "Divya Joshi",
              adminLead: "Anne Fernandes",
              registerDate: "2024-03-01",
              actualRevenue: 4800,
            },
            {
              client: "Tata Motors",
              representative: "Rohan Yadav",
              adminLead: "Anne Fernandes",
              registerDate: "2024-02-13",
              actualRevenue: 5000,
            },
            {
              client: "Hero",
              representative: "Mehul Desai",
              adminLead: "Anne Fernandes",
              registerDate: "2024-01-26",
              actualRevenue: 4600,
            },
            {
              client: "Maruti",
              representative: "Shruti Iyer",
              adminLead: "Anne Fernandes",
              registerDate: "2024-03-07",
              actualRevenue: 4900,
            },
            {
              client: "Mahindra",
              representative: "Nikita Jain",
              adminLead: "Anne Fernandes",
              registerDate: "2024-01-18",
              actualRevenue: 4700,
            },
            {
              client: "Oppo",
              representative: "Rahul Khanna",
              adminLead: "Anne Fernandes",
              registerDate: "2024-02-24",
              actualRevenue: 4600,
            },
          ],
        },
        {
          name: "ST-501A",
          revenue: 0,
          clients: [
            {
              client: "Vivo",
              representative: "Sneha Pillai",
              adminLead: "Anne Fernandes",
              registerDate: "2024-01-13",
              actualRevenue: 4600,
            },
            {
              client: "Realme",
              representative: "Arjun Patel",
              adminLead: "Anne Fernandes",
              registerDate: "2024-02-03",
              actualRevenue: 4800,
            },
            {
              client: "Samsung",
              representative: "Tanya Roy",
              adminLead: "Anne Fernandes",
              registerDate: "2024-01-30",
              actualRevenue: 5100,
            },
            {
              client: "OnePlus",
              representative: "Aditya Singh",
              adminLead: "Anne Fernandes",
              registerDate: "2024-02-08",
              actualRevenue: 5200,
            },
            {
              client: "Apple",
              representative: "Siddharth Mehra",
              adminLead: "Anne Fernandes",
              registerDate: "2024-03-12",
              actualRevenue: 6300,
            },
            {
              client: "Dell",
              representative: "Shreya Naik",
              adminLead: "Anne Fernandes",
              registerDate: "2024-02-16",
              actualRevenue: 5400,
            },
            {
              client: "HP",
              representative: "Gaurav Shah",
              adminLead: "Anne Fernandes",
              registerDate: "2024-03-22",
              actualRevenue: 4900,
            },
            {
              client: "Lenovo",
              representative: "Tanvi Agarwal",
              adminLead: "Anne Fernandes",
              registerDate: "2024-01-21",
              actualRevenue: 5000,
            },
          ],
        },
      ],
    },
    {
      month: "May",
      domains: [
        {
          name: "Co-Working",
          revenue: 15000,
          clients: [
            {
              client: "Client I",
              representative: "Grace Orange",
              adminLead: "Anne Fernandes",
              registerDate: "2024-02-11",
              actualRevenue: 6000,
            },
            {
              client: "Client J",
              representative: "Hank Purple",
              adminLead: "Anne Fernandes",
              registerDate: "2024-03-09",
              actualRevenue: 5000,
            },
            {
              client: "Client K",
              representative: "Isabel Cyan",
              adminLead: "Anne Fernandes",
              registerDate: "2024-04-14",
              actualRevenue: 4000,
            },
          ],
        },
        {
          name: "Workation",
          revenue: 9000,
          clients: [
            {
              client: "Client L",
              representative: "Jack Gray",
              adminLead: "Anne Fernandes",
              registerDate: "2024-02-28",
              actualRevenue: 5000,
            },
            {
              client: "Client M",
              representative: "Kara Silver",
              adminLead: "Anne Fernandes",
              registerDate: "2024-03-07",
              actualRevenue: 4000,
            },
          ],
        },
        {
          name: "Co-Living",
          revenue: 14000,
          clients: [
            {
              client: "Client N",
              representative: "Leo Gold",
              adminLead: "Anne Fernandes",
              registerDate: "2024-05-20",
              actualRevenue: 6000,
            },
            {
              client: "Client O",
              representative: "Mia Platinum",
              adminLead: "Anne Fernandes",
              registerDate: "2024-06-08",
              actualRevenue: 5000,
            },
            {
              client: "Client P",
              representative: "Noah Bronze",
              adminLead: "Anne Fernandes",
              registerDate: "2024-07-15",
              actualRevenue: 3000,
            },
          ],
        },
      ],
    },
    {
      month: "June",
      domains: [
        {
          name: "Co-Working",
          revenue: 18000,
          clients: [
            {
              client: "Client Q",
              representative: "Olivia Rose",
              adminLead: "Anne Fernandes",
              registerDate: "2024-01-30",
              actualRevenue: 7000,
            },
            {
              client: "Client R",
              representative: "Peter Brown",
              adminLead: "Anne Fernandes",
              registerDate: "2024-02-18",
              actualRevenue: 6000,
            },
            {
              client: "Client S",
              representative: "Quincy Black",
              adminLead: "Anne Fernandes",
              registerDate: "2024-03-26",
              actualRevenue: 5000,
            },
          ],
        },
        {
          name: "Workation",
          revenue: 10000,
          clients: [
            {
              client: "Client T",
              representative: "Rachel Violet",
              adminLead: "Anne Fernandes",
              registerDate: "2024-04-12",
              actualRevenue: 5000,
            },
            {
              client: "Client U",
              representative: "Sam Indigo",
              adminLead: "Anne Fernandes",
              registerDate: "2024-05-07",
              actualRevenue: 5000,
            },
          ],
        },
        {
          name: "Co-Living",
          revenue: 13000,
          clients: [
            {
              client: "Client V",
              representative: "Tina Lilac",
              adminLead: "Anne Fernandes",
              registerDate: "2024-06-05",
              actualRevenue: 6000,
            },
            {
              client: "Client W",
              representative: "Umar Yellow",
              adminLead: "Anne Fernandes",
              registerDate: "2024-07-08",
              actualRevenue: 4000,
            },
            {
              client: "Client X",
              representative: "Victor Pink",
              adminLead: "Anne Fernandes",
              registerDate: "2024-08-15",
              actualRevenue: 3000,
            },
          ],
        },
      ],
    },
    {
      month: "July",
      domains: [
        {
          name: "Co-Working",
          revenue: 20000,
          clients: [
            {
              client: "Client Y",
              representative: "Wendy Red",
              adminLead: "Anne Fernandes",
              registerDate: "2024-03-10",
              actualRevenue: 8000,
            },
            {
              client: "Client Z",
              representative: "Xavier Green",
              adminLead: "Anne Fernandes",
              registerDate: "2024-04-14",
              actualRevenue: 7000,
            },
            {
              client: "Client AA",
              representative: "Yara Blue",
              adminLead: "Anne Fernandes",
              registerDate: "2024-05-16",
              actualRevenue: 5000,
            },
          ],
        },
        {
          name: "Workation",
          revenue: 11000,
          clients: [
            {
              client: "Client AB",
              representative: "Zane Orange",
              adminLead: "Anne Fernandes",
              registerDate: "2024-06-20",
              actualRevenue: 6000,
            },
            {
              client: "Client AC",
              representative: "Adam Gray",
              adminLead: "Anne Fernandes",
              registerDate: "2024-07-10",
              actualRevenue: 5000,
            },
          ],
        },
        {
          name: "Co-Living",
          revenue: 16000,
          clients: [
            {
              client: "Client AD",
              representative: "Betty Silver",
              adminLead: "Anne Fernandes",
              registerDate: "2024-08-25",
              actualRevenue: 7000,
            },
            {
              client: "Client AE",
              representative: "Charlie Platinum",
              adminLead: "Anne Fernandes",
              registerDate: "2024-09-14",
              actualRevenue: 6000,
            },
            {
              client: "Client AF",
              representative: "David Bronze",
              adminLead: "Anne Fernandes",
              registerDate: "2024-10-05",
              actualRevenue: 3000,
            },
          ],
        },
      ],
    },
  ];

  //Calulation of total revenue of each unit
  mockBusinessRevenueData = mockBusinessRevenueData.map((data) => ({
    ...data,
    domains: data.domains.map((domain) => ({
      ...domain,
      revenue: domain.clients.reduce(
        (acc, curr) => acc + curr.actualRevenue,
        0
      ),
    })),
  }));

  const [selectedMonth, setSelectedMonth] = useState(
    mockBusinessRevenueData[0].month
  ); // Default to first month

  // Function to update selected month
  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  // Filter data based on selected month
  const selectedMonthData = mockBusinessRevenueData.find(
    (data) => data.month === selectedMonth
  );

  if (selectedMonthData) {
    selectedMonthData.domains = selectedMonthData.domains.map((domain) => {
      const updatedClients = domain.clients.map((client, index) => ({
        ...client,
        srNo: index + 1,
        registerDate: dayjs(client.registerDate).format("DD-MM-YYYY"),
        adminLead: client.adminLead,
        actualRevenue: Number(client.actualRevenue).toLocaleString("en-IN"),
      }));
      return { ...domain, clients: updatedClients };
    });
  }

  // Prepare Bar Graph Data
  const graphData = [
    {
      name: "Expense",
      data: selectedMonthData.domains.map((domain) => domain.revenue),
    },
  ];

  // Graph Options
  const options = {
    chart: {
      type: "bar",
      stacked: false,
      fontFamily: "Poppins-Regular",
      toolbar: false,
    },
    xaxis: {
      categories: selectedMonthData.domains.map((domain) => domain.name),
    },
    yaxis: { title: { text: "Revenue (INR)" } },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "30%", borderRadius: 5 },
    },
    tooltip: {
      y: {
        formatter: (val) => `INR ${inrFormat(val)}`,
      },
    },
    legend: { position: "top" },
    colors: ["#80bf01"],
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Month Selection Dropdown */}
      <div className="mb-4 flex">
        <FormControl size="small">
          <InputLabel>Select Month</InputLabel>
          <Select
            label="Select Month"
            value={selectedMonth}
            onChange={handleMonthChange}
            sx={{ width: "200px" }}>
            {mockBusinessRevenueData.map((data) => (
              <MenuItem key={data.month} value={data.month}>
                {data.month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {/* Bar Graph Component */}
      <WidgetSection layout={1} title={"Executive Expense"} border>
        <BarGraph data={graphData} options={options} height={400} />
      </WidgetSection>

      {/* Accordion Section for Domain-wise Revenue Breakdown */}
      <div className="flex flex-col gap-2 border-default border-borderGray rounded-md p-4">
        <div className="px-4 py-2 border-b-[1px] border-borderGray bg-gray-50">
          <div className="flex justify-between items-center w-full px-4 py-2">
            <span className="text-sm text-muted font-pmedium text-title">
              LOCATION
            </span>
            <span className="text-sm text-muted font-pmedium text-title flex items-center gap-1">
              EXPENSE
            </span>
          </div>
        </div>
        {selectedMonthData.domains.map((domain, index) => {
          return (
            <Accordion key={index} className="py-4">
              <AccordionSummary
                expandIcon={<IoIosArrowDown />}
                aria-controls={`panel-${index}-content`}
                id={`panel-${index}-header`}>
                <div className="flex justify-between items-center w-full px-4">
                  <span className="text-subtitle font-pmedium">
                    {domain.name}
                  </span>
                  <span className="text-subtitle font-pmedium">
                    INR {domain.revenue.toLocaleString()}
                  </span>
                </div>
              </AccordionSummary>
              <AccordionDetails sx={{ borderTop: "1px solid  #d1d5db" }}>
                <AgTable
                  data={domain.clients}
                  hideFilter
                  columns={[
                    { headerName: "Sr No", field: "srNo", flex: 1 },
                    { headerName: "Client", field: "client", flex: 1 },
                    {
                      headerName: "Representative",
                      field: "representative",
                      flex: 1,
                    },
                    {
                      headerName: "Register Date",
                      field: "registerDate",
                      flex: 1,
                    },
                    { headerName: "Admin Lead", field: "adminLead", flex: 1 },
                    {
                      headerName: "Expense (INR)",
                      field: "actualRevenue",
                      flex: 1,
                    },
                  ]}
                  tableHeight={300}
                />
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-4">
                    <span className="text-primary font-pregular">
                      Total Expense for {domain.name}:{" "}
                    </span>
                    <span className="text-black font-pmedium">
                      INR {domain.revenue.toLocaleString()}
                    </span>{" "}
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </div>
    </div>
  );
};

export default AdminExecutiveExpenses;
