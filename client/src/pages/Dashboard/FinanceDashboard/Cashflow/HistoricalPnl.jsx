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
        "totalProfitLoss": 659015,
        "clients": [
          {
            "srNo": 1,
            "month": "April",
            "income": 80000,
            "expense": 70000,
            "profitLoss": 74197,
            "department": "IT"
          },
          {
            "srNo": 2,
            "month": "May",
            "income": 85000,
            "expense": 75000,
            "profitLoss": 62586,
            "department": "Tech"
          },
          {
            "srNo": 3,
            "month": "June",
            "income": 95000,
            "expense": 80000,
            "profitLoss": 81041,
            "department": "Admin"
          },
          {
            "srNo": 4,
            "month": "July",
            "income": 100000,
            "expense": 90000,
            "profitLoss": 31077,
            "department": "Sales"
          },
          {
            "srNo": 5,
            "month": "August",
            "income": 105000,
            "expense": 95000,
            "profitLoss": 96453,
            "department": "Finance"
          },
          {
            "srNo": 6,
            "month": "September",
            "income": 110000,
            "expense": 100000,
            "profitLoss": 49643,
            "department": "IT"
          },
          {
            "srNo": 7,
            "month": "October",
            "income": 115000,
            "expense": 105000,
            "profitLoss": 133252,
            "department": "Tech"
          },
          {
            "srNo": 8,
            "month": "November",
            "income": 120000,
            "expense": 109000,
            "profitLoss": 130766,
            "department": "Admin"
          }
        ]
      },
      {
        "name": "2023-24",
        "totalProfitLoss": 580756,
        "clients": [
          {
            "srNo": 1,
            "month": "April",
            "income": 80000,
            "expense": 70000,
            "profitLoss": 25886,
            "department": "IT"
          },
          {
            "srNo": 2,
            "month": "May",
            "income": 85000,
            "expense": 75000,
            "profitLoss": 90080,
            "department": "Tech"
          },
          {
            "srNo": 3,
            "month": "June",
            "income": 95000,
            "expense": 80000,
            "profitLoss": 102970,
            "department": "Admin"
          },
          {
            "srNo": 4,
            "month": "July",
            "income": 100000,
            "expense": 90000,
            "profitLoss": 95380,
            "department": "Sales"
          },
          {
            "srNo": 5,
            "month": "August",
            "income": 105000,
            "expense": 95000,
            "profitLoss": 16332,
            "department": "Finance"
          },
          {
            "srNo": 6,
            "month": "September",
            "income": 110000,
            "expense": 100000,
            "profitLoss": 64160,
            "department": "IT"
          },
          {
            "srNo": 7,
            "month": "October",
            "income": 115000,
            "expense": 105000,
            "profitLoss": 93069,
            "department": "Tech"
          },
          {
            "srNo": 8,
            "month": "November",
            "income": 120000,
            "expense": 109000,
            "profitLoss": 92879,
            "department": "Admin"
          }
        ]
      },
      {
        "name": "2022-23",
        "totalProfitLoss": 459132,
        "clients": [
          {
            "srNo": 1,
            "month": "April",
            "income": 80000,
            "expense": 70000,
            "profitLoss": 93469,
            "department": "IT"
          },
          {
            "srNo": 2,
            "month": "May",
            "income": 85000,
            "expense": 75000,
            "profitLoss": 79615,
            "department": "Tech"
          },
          {
            "srNo": 3,
            "month": "June",
            "income": 95000,
            "expense": 80000,
            "profitLoss": 73981,
            "department": "Admin"
          },
          {
            "srNo": 4,
            "month": "July",
            "income": 100000,
            "expense": 90000,
            "profitLoss": 62319,
            "department": "Sales"
          },
          {
            "srNo": 5,
            "month": "August",
            "income": 105000,
            "expense": 95000,
            "profitLoss": 43862,
            "department": "Finance"
          },
          {
            "srNo": 6,
            "month": "September",
            "income": 110000,
            "expense": 100000,
            "profitLoss": 27267,
            "department": "IT"
          },
          {
            "srNo": 7,
            "month": "October",
            "income": 115000,
            "expense": 105000,
            "profitLoss": 48399,
            "department": "Tech"
          },
          {
            "srNo": 8,
            "month": "November",
            "income": 120000,
            "expense": 109000,
            "profitLoss": 30220,
            "department": "Admin"
          }
        ]
      },
      {
        "name": "2021-22",
        "totalProfitLoss": 364978,
        "clients": [
          {
            "srNo": 1,
            "month": "April",
            "income": 80000,
            "expense": 70000,
            "profitLoss": 56434,
            "department": "IT"
          },
          {
            "srNo": 2,
            "month": "May",
            "income": 85000,
            "expense": 75000,
            "profitLoss": 49940,
            "department": "Tech"
          },
          {
            "srNo": 3,
            "month": "June",
            "income": 95000,
            "expense": 80000,
            "profitLoss": 41680,
            "department": "Admin"
          },
          {
            "srNo": 4,
            "month": "July",
            "income": 100000,
            "expense": 90000,
            "profitLoss": 41240,
            "department": "Sales"
          },
          {
            "srNo": 5,
            "month": "August",
            "income": 105000,
            "expense": 95000,
            "profitLoss": 52293,
            "department": "Finance"
          },
          {
            "srNo": 6,
            "month": "September",
            "income": 110000,
            "expense": 100000,
            "profitLoss": 46599,
            "department": "IT"
          },
          {
            "srNo": 7,
            "month": "October",
            "income": 115000,
            "expense": 105000,
            "profitLoss": 33717,
            "department": "Tech"
          },
          {
            "srNo": 8,
            "month": "November",
            "income": 120000,
            "expense": 109000,
            "profitLoss": 43075,
            "department": "Admin"
          }
        ]
      },
      {
        "name": "2020-21",
        "totalProfitLoss": 615630,
        "clients": [
          {
            "srNo": 1,
            "month": "April",
            "income": 80000,
            "expense": 70000,
            "profitLoss": 33324,
            "department": "IT"
          },
          {
            "srNo": 2,
            "month": "May",
            "income": 85000,
            "expense": 75000,
            "profitLoss": 106534,
            "department": "Tech"
          },
          {
            "srNo": 3,
            "month": "June",
            "income": 95000,
            "expense": 80000,
            "profitLoss": 64167,
            "department": "Admin"
          },
          {
            "srNo": 4,
            "month": "July",
            "income": 100000,
            "expense": 90000,
            "profitLoss": 95236,
            "department": "Sales"
          },
          {
            "srNo": 5,
            "month": "August",
            "income": 105000,
            "expense": 95000,
            "profitLoss": 43373,
            "department": "Finance"
          },
          {
            "srNo": 6,
            "month": "September",
            "income": 110000,
            "expense": 100000,
            "profitLoss": 104447,
            "department": "IT"
          },
          {
            "srNo": 7,
            "month": "October",
            "income": 115000,
            "expense": 105000,
            "profitLoss": 92953,
            "department": "Tech"
          },
          {
            "srNo": 8,
            "month": "November",
            "income": 120000,
            "expense": 109000,
            "profitLoss": 75596,
            "department": "Admin"
          }
        ]
      },
      {
        "name": "2019-20",
        "totalProfitLoss": 620934,
        "clients": [
          {
            "srNo": 1,
            "month": "April",
            "income": 80000,
            "expense": 70000,
            "profitLoss": 23603,
            "department": "IT"
          },
          {
            "srNo": 2,
            "month": "May",
            "income": 85000,
            "expense": 75000,
            "profitLoss": 87263,
            "department": "Tech"
          },
          {
            "srNo": 3,
            "month": "June",
            "income": 95000,
            "expense": 80000,
            "profitLoss": 92783,
            "department": "Admin"
          },
          {
            "srNo": 4,
            "month": "July",
            "income": 100000,
            "expense": 90000,
            "profitLoss": 110420,
            "department": "Sales"
          },
          {
            "srNo": 5,
            "month": "August",
            "income": 105000,
            "expense": 95000,
            "profitLoss": 78060,
            "department": "Finance"
          },
          {
            "srNo": 6,
            "month": "September",
            "income": 110000,
            "expense": 100000,
            "profitLoss": 13340,
            "department": "IT"
          },
          {
            "srNo": 7,
            "month": "October",
            "income": 115000,
            "expense": 105000,
            "profitLoss": 109812,
            "department": "Tech"
          },
          {
            "srNo": 8,
            "month": "November",
            "income": 120000,
            "expense": 109000,
            "profitLoss": 105653,
            "department": "Admin"
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
            income:Number(client.income).toLocaleString("en-IN"),
            expense:Number(client.expense).toLocaleString("en-IN"),
            profitLoss:Number(client.profitLoss).toLocaleString("en-IN")
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
      data: [12000, 15000, 10000, 18000, 20000, 22000],
    },
    {
      name: "Expense",
      data: [8000, 10000, 7000, 12000, 13000, 18000],
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
        "2019 - 2020",
        "2020 - 2021",
        "2021 - 2022",
        "2022 - 2023",
        "2023 - 2024",
        "2024 - 2025",
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
        <WidgetSection border titleLabel={"FY 2024-25"}  title={"Historical P&L"}>
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
                    { header: "Department", field: "department", flex: 1 },
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
