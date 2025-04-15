import React, { useState } from "react";
import BarGraph from "../../../../components/graphs/BarGraph";
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
import AgTable from "../../../../components/AgTable";
import WidgetSection from "../../../../components/WidgetSection";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import dayjs from "dayjs";

const HistoricalPnl = () => {
  const axios = useAxiosPrivate();
  const { data: revenueData = [], isPending: isRevenuePending } = useQuery({
    queryKey: ["revenueData"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/sales/fetch-revenues");
        console.log("Revenue Data", response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching clients data:", error);
      }
    },
  });


  const mockBusinessRevenueData = [
    {
      "month": "FY 2024-25",
      "domains": [
        {
          "name": "2024-25",
          "totalProfitLoss": 6590150,
          "clients": [
            {
              "srNo": 1,
              "month": "April",
              "income": 8000000,
              "expense": 7000000,
              "profitLoss": 74197,
              "domain": "Coworking"
            },
            {
              "srNo": 2,
              "month": "May",
              "income": 8500000,
              "expense": 7500000,
              "profitLoss": 62586,
              "domain": "Virtual Office"
            },
            {
              "srNo": 3,
              "month": "June",
              "income": 9500000,
              "expense": 8000000,
              "profitLoss": 81041,
              "domain": "Workations"
            },
            {
              "srNo": 4,
              "month": "July",
              "income": 10000000,
              "expense": 9000000,
              "profitLoss": 31077,
              "domain": "Meetng Rooms"
            },
            {
              "srNo": 5,
              "month": "August",
              "income": 10500000,
              "expense": 9500000,
              "profitLoss": 96453,
              "domain": "Other Income"
            },
            {
              "srNo": 6,
              "month": "September",
              "income": 11000000,
              "expense": 10000000,
              "profitLoss": 49643,
              "domain": "Coworking"
            },
            {
              "srNo": 7,
              "month": "October",
              "income": 11500000,
              "expense": 10500000,
              "profitLoss": 133252,
              "domain": "Virtual Office"
            },
            {
              "srNo": 8,
              "month": "November",
              "income": 12000000,
              "expense": 10900000,
              "profitLoss": 130766,
              "domain": "Workations"
            }
          ]
        },
        {
          "name": "2023-24",
          "totalProfitLoss": 5807560,
          "clients": [
            {
              "srNo": 1,
              "month": "April",
              "income": 8000000,
              "expense": 7000000,
              "profitLoss": 25886,
              "domain": "Coworking"
            },
            {
              "srNo": 2,
              "month": "May",
              "income": 8500000,
              "expense": 7500000,
              "profitLoss": 90080,
              "domain": "Virtual Office"
            },
            {
              "srNo": 3,
              "month": "June",
              "income": 9500000,
              "expense": 8000000,
              "profitLoss": 102970,
              "domain": "Workations"
            },
            {
              "srNo": 4,
              "month": "July",
              "income": 10000000,
              "expense": 9000000,
              "profitLoss": 95380,
              "domain": "Café"
            },
            {
              "srNo": 5,
              "month": "August",
              "income": 10500000,
              "expense": 9500000,
              "profitLoss": 16332,
              "domain": "Meetng Rooms"
            },
            {
              "srNo": 6,
              "month": "September",
              "income": 11000000,
              "expense": 10000000,
              "profitLoss": 64160,
              "domain": "Coworking"
            },
            {
              "srNo": 7,
              "month": "October",
              "income": 11500000,
              "expense": 10500000,
              "profitLoss": 93069,
              "domain": "Virtual Office"
            },
            {
              "srNo": 8,
              "month": "November",
              "income": 12000000,
              "expense": 10900000,
              "profitLoss": 92879,
              "domain": "Workations"
            }
          ]
        },
        {
          "name": "2022-23",
          "totalProfitLoss": 4591320,
          "clients": [
            {
              "srNo": 1,
              "month": "April",
              "income": 8000000,
              "expense": 7000000,
              "profitLoss": 93469,
              "domain": "Coworking"
            },
            {
              "srNo": 2,
              "month": "May",
              "income": 8500000,
              "expense": 7500000,
              "profitLoss": 79615,
              "domain": "Virtual Office"
            },
            {
              "srNo": 3,
              "month": "June",
              "income": 9500000,
              "expense": 8000000,
              "profitLoss": 73981,
              "domain": "Workations"
            },
            {
              "srNo": 4,
              "month": "July",
              "income": 10000000,
              "expense": 9000000,
              "profitLoss": 62319,
              "domain": "Café"
            },
            {
              "srNo": 5,
              "month": "August",
              "income": 10500000,
              "expense": 9500000,
              "profitLoss": 43862,
              "domain": "Meetng Rooms"
            },
            {
              "srNo": 6,
              "month": "September",
              "income": 11000000,
              "expense": 10000000,
              "profitLoss": 27267,
              "domain": "Coworking"
            },
            {
              "srNo": 7,
              "month": "October",
              "income": 11500000,
              "expense": 10500000,
              "profitLoss": 48399,
              "domain": "Virtual Office"
            },
            {
              "srNo": 8,
              "month": "November",
              "income": 12000000,
              "expense": 10900000,
              "profitLoss": 30220,
              "domain": "Workations"
            }
          ]
        },
        {
          "name": "2021-22",
          "totalProfitLoss": 3649780,
          "clients": [
            {
              "srNo": 1,
              "month": "April",
              "income": 8000000,
              "expense": 7000000,
              "profitLoss": 56434,
              "domain": "Coworking"
            },
            {
              "srNo": 2,
              "month": "May",
              "income": 8500000,
              "expense": 7500000,
              "profitLoss": 49940,
              "domain": "Virtual Office"
            },
            {
              "srNo": 3,
              "month": "June",
              "income": 9500000,
              "expense": 8000000,
              "profitLoss": 41680,
              "domain": "Workations"
            },
            {
              "srNo": 4,
              "month": "July",
              "income": 10000000,
              "expense": 9000000,
              "profitLoss": 41240,
              "domain": "Café"
            },
            {
              "srNo": 5,
              "month": "August",
              "income": 10500000,
              "expense": 9500000,
              "profitLoss": 52293,
              "domain": "Meetng Rooms"
            },
            {
              "srNo": 6,
              "month": "September",
              "income": 11000000,
              "expense": 10000000,
              "profitLoss": 46599,
              "domain": "Coworking"
            },
            {
              "srNo": 7,
              "month": "October",
              "income": 11500000,
              "expense": 10500000,
              "profitLoss": 33717,
              "domain": "Virtual Office"
            },
            {
              "srNo": 8,
              "month": "November",
              "income": 12000000,
              "expense": 10900000,
              "profitLoss": 43075,
              "domain": "Workations"
            }
          ]
        },
        {
          "name": "2020-21",
          "totalProfitLoss": 6156300,
          "clients": [
            {
              "srNo": 1,
              "month": "April",
              "income": 8000000,
              "expense": 7000000,
              "profitLoss": 33324,
              "domain": "Coworking"
            },
            {
              "srNo": 2,
              "month": "May",
              "income": 8500000,
              "expense": 7500000,
              "profitLoss": 106534,
              "domain": "Virtual Office"
            },
            {
              "srNo": 3,
              "month": "June",
              "income": 9500000,
              "expense": 8000000,
              "profitLoss": 64167,
              "domain": "Workations"
            },
            {
              "srNo": 4,
              "month": "July",
              "income": 10000000,
              "expense": 9000000,
              "profitLoss": 95236,
              "domain": "Café"
            },
            {
              "srNo": 5,
              "month": "August",
              "income": 10500000,
              "expense": 9500000,
              "profitLoss": 43373,
              "domain": "Meetng Rooms"
            },
            {
              "srNo": 6,
              "month": "September",
              "income": 11000000,
              "expense": 10000000,
              "profitLoss": 104447,
              "domain": "Coworking"
            },
            {
              "srNo": 7,
              "month": "October",
              "income": 11500000,
              "expense": 10500000,
              "profitLoss": 92953,
              "domain": "Virtual Office"
            },
            {
              "srNo": 8,
              "month": "November",
              "income": 12000000,
              "expense": 10900000,
              "profitLoss": 75596,
              "domain": "Workations"
            }
          ]
        },
        {
          "name": "2019-20",
          "totalProfitLoss": 6209340,
          "clients": [
            {
              "srNo": 1,
              "month": "April",
              "income": 8000000,
              "expense": 7000000,
              "profitLoss": 23603,
              "domain": "Coworking"
            },
            {
              "srNo": 2,
              "month": "May",
              "income": 8500000,
              "expense": 7500000,
              "profitLoss": 87263,
              "domain": "Virtual Office"
            },
            {
              "srNo": 3,
              "month": "June",
              "income": 9500000,
              "expense": 8000000,
              "profitLoss": 92783,
              "domain": "Workations"
            },
            {
              "srNo": 4,
              "month": "July",
              "income": 10000000,
              "expense": 9000000,
              "profitLoss": 110420,
              "domain": "Café"
            },
            {
              "srNo": 5,
              "month": "August",
              "income": 10500000,
              "expense": 9500000,
              "profitLoss": 78060,
              "domain": "Meetng Rooms"
            },
            {
              "srNo": 6,
              "month": "September",
              "income": 1100000,
              "expense": 1000000,
              "profitLoss": 13340,
              "domain": "Coworking"
            },
            {
              "srNo": 7,
              "month": "October",
              "income": 1150000,
              "expense": 1050000,
              "profitLoss": 109812,
              "domain": "Virtual Office"
            },
            {
              "srNo": 8,
              "month": "November",
              "income": 1200000,
              "expense": 1090000,
              "profitLoss": 105653,
              "domain": "Workations"
            }
          ]
        }
      ]
    }
  ]

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
        income: Number(client.income).toLocaleString("en-IN"),
        expense: Number(client.expense).toLocaleString("en-IN"),
        profitLoss: Number(client.profitLoss).toLocaleString("en-IN")
      }));
      return { ...domain, clients: updatedClients };
    });
  }

  // Prepare Bar Graph Data
  const graphData = [
    {
      name: "Revenue",
      data: selectedMonthData.domains.map((domain) => domain.totalProfitLoss),
    },
  ];

  // Graph Options
  const options = {
    chart: { type: "bar", stacked: false, fontFamily: "Poppins-Regular" },
    xaxis: {
      categories: selectedMonthData.domains.map((domain) => domain.name),
    },
    yaxis: { title: { text: "Revenue (in Rupees)" } },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "30%", borderRadius: 5 },
    },
    legend: { position: "top" },
    colors: ["#80bf01"],
  };
  //-----------------------------------------------------Graph------------------------------------------------------//
  const incomeExpenseData = [
    {
      name: "Income",
      data: [12500000, 13800000, 14800000, 16000000, 18500000, 21000000], // in ₹
    },
    {
      name: "Expense",
      data: [7500000, 8200000, 8900000, 10200000, 12000000, 15000000], // in ₹
    },
  ];


  const incomeExpenseOptions = {
    chart: {
      id: "income-vs-expense-bar",
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },
    colors: ["#54C4A7", "#EB5C45"], // Green for income, Red for expense
    legend: {
      show: true,
      position: "top",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 6, // Adds rounded corners to the top of bars
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "FY 2019 - 20",
        "FY 2020 - 21",
        "FY 2021 - 22",
        "FY 2022 - 23",
        "FY 2023 - 24",
        "FY 2024 - 25",
        // "Oct-24",
        // "Nov-24",
        // "Dec-24",
        // "Jan-25",
        // "Feb-25",
        // "Mar-25",
      ],

    },
    yaxis: {
      title: {
        text: "Amount (INR)",
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val) => `INR ${val.toLocaleString()}`,
      },
    },
  };
  //-----------------------------------------------------Graph------------------------------------------------------//

  const techWidgets = [
    {
      layout: 1,
      widgets: [
        <WidgetSection border title={"Historical P&L"}>
          <BarGraph
            data={incomeExpenseData}
            options={incomeExpenseOptions}

          />
        </WidgetSection>,
      ],
    },
  ];

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Month Selection Dropdown */}
      {/* <div className="mb-4 flex">
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
      </div> */}

      {/* Bar Graph Component */}
      {/* <WidgetSection layout={1} title={"Historical P&L"} border>
        <BarGraph data={graphData} options={options} height={400} />
      </WidgetSection> */}
      {techWidgets.map((section, index) => (
        <WidgetSection key={index} layout={section?.layout} padding>
          {section?.widgets}
        </WidgetSection>
      ))}

      {/* Accordion Section for Domain-wise Revenue Breakdown */}
      <div>
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
                    INR {domain.totalProfitLoss.toLocaleString()}
                  </span>
                </div>
              </AccordionSummary>
              <AccordionDetails sx={{ borderTop: "1px solid  #d1d5db" }}>
                <AgTable
                  data={domain.clients}
                  hideFilter
                  columns={[
                    { header: "Sr No", field: "srNo", flex: 1 },
                    { header: "Domain", field: "domain", flex: 1 },
                    { header: "Income (INR)", field: "income", flex: 1 },
                    { header: "Expense (INR)", field: "expense", flex: 1 },
                    { header: "Profit / Loss (INR)", field: "profitLoss", flex: 1 },
                  ]}
                  tableHeight={300}
                />
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-4">
                    <span className="text-primary font-pregular">
                      Total Revenue for {domain.name}:{" "}
                    </span>
                    <span className="text-black font-pmedium">
                      INR {domain.totalProfitLoss.toLocaleString()}
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

export default HistoricalPnl;
