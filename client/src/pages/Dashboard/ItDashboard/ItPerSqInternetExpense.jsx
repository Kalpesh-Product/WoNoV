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

const ItPerSqInternetExpense = () => {
  const mockBusinessRevenueData = [
    {
      month: "April",
      domains: [
        {
          name: "ST-701A",
          totalSqFt: 2000,
          revenue: 12000,
          clients: [
            {
              client: "Zomato",
              representative: "Rohan Mehta",
              registerDate: "2024-01-15",
              actualRevenue: 5000,
            },
            {
              client: "Uber",
              representative: "Priya Sharma",
              registerDate: "2024-02-10",
              actualRevenue: 4000,
            },
            {
              client: "Ola",
              representative: "Aditi Menon",
              registerDate: "2024-03-05",
              actualRevenue: 3000,
            },
          ],
        },
        {
          name: "ST-701B",
          totalSqFt: 1600,
          revenue: 8000,
          clients: [
            {
              client: "Swiggy",
              representative: "Ravi Kapoor",
              registerDate: "2024-01-20",
              actualRevenue: 4000,
            },
            {
              client: "Flipkart",
              representative: "Neha Iyer",
              registerDate: "2024-02-25",
              actualRevenue: 4000,
            },
          ],
        },
        {
          name: "ST-601A",
          totalSqFt: 2200,
          revenue: 15000,
          clients: [
            {
              client: "Paytm",
              representative: "Ravi Malhotra",
              registerDate: "2024-02-08",
              actualRevenue: 5000,
            },
            {
              client: "BigBasket",
              representative: "Sneha Kulkarni",
              registerDate: "2024-03-12",
              actualRevenue: 7000,
            },
            {
              client: "BYJU'S",
              representative: "Aditya Ghosh",
              registerDate: "2024-04-05",
              actualRevenue: 3000,
            },
          ],
        },
        {
          name: "ST-601B",
          totalSqFt: 2100,
          revenue: 15000,
          clients: [
            {
              client: "Paytm",
              representative: "Ankit Verma",
              registerDate: "2024-03-12",
              actualRevenue: 5000,
            },
            {
              client: "BigBasket",
              representative: "Sneha Reddy",
              registerDate: "2024-04-18",
              actualRevenue: 7000,
            },
            {
              client: "BYJU'S",
              representative: "Vikram Das",
              registerDate: "2024-05-10",
              actualRevenue: 3000,
            },
          ],
        },
        {
          name: "ST-501A",
          totalSqFt: 1950,
          revenue: 15000,
          clients: [
            {
              client: "Paytm",
              representative: "Ankit Verma",
              registerDate: "2024-03-12",
              actualRevenue: 5000,
            },
            {
              client: "BigBasket",
              representative: "Sneha Reddy",
              registerDate: "2024-04-18",
              actualRevenue: 7000,
            },
            {
              client: "BYJU'S",
              representative: "Vikram Das",
              registerDate: "2024-05-10",
              actualRevenue: 3000,
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
          totalSqFt: 2100,
          clients: [
            {
              client: "Infosys Ventures",
              representative: "Ritika Nair",
              registerDate: "2024-02-11",
              actualRevenue: 6000,
            },
            {
              client: "Tata Innovations",
              representative: "Harsh Vardhan",
              registerDate: "2024-03-09",
              actualRevenue: 5000,
            },
            {
              client: "RedDot Labs",
              representative: "Ishita Rao",
              registerDate: "2024-04-14",
              actualRevenue: 4000,
            },
          ],
        },
        {
          name: "Workation",
          revenue: 9000,
          totalSqFt: 2120,
          clients: [
            {
              client: "Himalayan Escapes",
              representative: "Jignesh Patel",
              registerDate: "2024-02-28",
              actualRevenue: 5000,
            },
            {
              client: "Kerala Nomads",
              representative: "Kavya Menon",
              registerDate: "2024-03-07",
              actualRevenue: 4000,
            },
          ],
        },
        {
          name: "Co-Living",
          revenue: 14000,
          totalSqFt: 1970,
          clients: [
            {
              client: "Zolo Living",
              representative: "Lakshya Mehra",
              registerDate: "2024-05-20",
              actualRevenue: 6000,
            },
            {
              client: "Colive South",
              representative: "Megha Joshi",
              registerDate: "2024-06-08",
              actualRevenue: 5000,
            },
            {
              client: "StayAbode",
              representative: "Nikhil Reddy",
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
          totalSqFt: 2000,
          clients: [
            {
              client: "Zomato",
              representative: "Rajeev Mehta",
              registerDate: "2024-01-30",
              actualRevenue: 7000,
            },
            {
              client: "Paytm",
              representative: "Nisha Reddy",
              registerDate: "2024-02-18",
              actualRevenue: 6000,
            },
            {
              client: "BYJU'S",
              representative: "Prakash Nair",
              registerDate: "2024-03-26",
              actualRevenue: 5000,
            },
          ],
        },
        {
          name: "Workation",
          revenue: 10000,
          totalSqFt: 1070,
          clients: [
            {
              client: "OYO",
              representative: "Rekha Sharma",
              registerDate: "2024-04-12",
              actualRevenue: 5000,
            },
            {
              client: "Nykaa",
              representative: "Saurav Kapoor",
              registerDate: "2024-05-07",
              actualRevenue: 5000,
            },
          ],
        },
        {
          name: "Co-Living",
          revenue: 13000,
          totalSqFt: 3000,
          clients: [
            {
              client: "Urban Company",
              representative: "Tanvi Rao",
              registerDate: "2024-06-05",
              actualRevenue: 6000,
            },
            {
              client: "Delhivery",
              representative: "Uday Singh",
              registerDate: "2024-07-08",
              actualRevenue: 4000,
            },
            {
              client: "FreshToHome",
              representative: "Vikas Shetty",
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
          totalSqFt: 2000,
          clients: [
            {
              client: "Swiggy",
              representative: "Wasim Khan",
              registerDate: "2024-03-10",
              actualRevenue: 8000,
            },
            {
              client: "CRED",
              representative: "Xenia Batra",
              registerDate: "2024-04-14",
              actualRevenue: 7000,
            },
            {
              client: "Dunzo",
              representative: "Yashika Jain",
              registerDate: "2024-05-16",
              actualRevenue: 5000,
            },
          ],
        },
        {
          name: "Workation",
          revenue: 11000,
          totalSqFt: 1100,
          clients: [
            {
              client: "MakeMyTrip",
              representative: "Zaid Hussain",
              registerDate: "2024-06-20",
              actualRevenue: 6000,
            },
            {
              client: "RedBus",
              representative: "Aarav Menon",
              registerDate: "2024-07-10",
              actualRevenue: 5000,
            },
          ],
        },
        {
          name: "Co-Living",
          revenue: 16000,
          totalSqFt: 1600,
          clients: [
            {
              client: "NestAway",
              representative: "Bhavana Patil",
              registerDate: "2024-08-25",
              actualRevenue: 7000,
            },
            {
              client: "Stanza Living",
              representative: "Chirag Rao",
              registerDate: "2024-09-14",
              actualRevenue: 6000,
            },
            {
              client: "NoBroker",
              representative: "Deepika Sethi",
              registerDate: "2024-10-05",
              actualRevenue: 3000,
            },
          ],
        },
      ],
    },
  ];

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

  // Prepare Bar Graph Data
  const graphData = [
    {
      name: "Internet Expense",
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
    yaxis: { title: { text: "" } },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "30%", borderRadius: 5 },
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
            sx={{ width: "200px" }}
          >
            {mockBusinessRevenueData.map((data) => (
              <MenuItem key={data.month} value={data.month}>
                {data.month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {/* Bar Graph Component */}
      <WidgetSection layout={1} title={"Internet Expense Per Sq Ft"} border>
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
              TOTAL SQ.FT
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
                id={`panel-${index}-header`}
              >
                <div className="flex justify-between items-center w-full px-4">
                  <span className="text-subtitle font-pmedium">
                    {domain.name}
                  </span>
                  <span className="text-subtitle font-pmedium">
                    {domain.totalSqFt}
                  </span>
                  <span className="text-subtitle font-pmedium">
                    INR {domain.revenue.toLocaleString()}
                  </span>
                </div>
              </AccordionSummary>
              <AccordionDetails sx={{ borderTop: "1px solid  #d1d5db" }}>
                <AgTable
                  data={domain.clients.map((client, index) => ({
                    ...client,
                    srNo: index + 1,
                    registerDate: dayjs(client.registerDate).format(
                      "DD-MM-YYYY"
                    ),
                    actualRevenue: inrFormat(client.actualRevenue),
                    expensePerSqFt: inrFormat(
                      Math.round(
                        (client.actualRevenue / domain.totalSqFt) * 2
                      ) / 2
                    ),
                  }))}
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
                    {
                      headerName: "Internet Expense (INR)",
                      field: "actualRevenue",
                      flex: 1,
                    },
                    {
                      headerName: "Expense per Sq.Ft (INR)",
                      field: "expensePerSqFt",
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

export default ItPerSqInternetExpense;
