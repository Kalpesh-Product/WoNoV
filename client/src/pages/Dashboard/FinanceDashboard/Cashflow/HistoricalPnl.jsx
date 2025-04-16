import React, { useState } from "react";
import BarGraph from "../../../../components/graphs/BarGraph";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { IoIosArrowDown } from "react-icons/io";
import AgTable from "../../../../components/AgTable";
import WidgetSection from "../../../../components/WidgetSection";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { inrFormat } from "../../../../utils/currencyFormat";

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
              "income": 20740741,
              "expense": 14502762,
              "profitLoss": 6237979,
              "domain": "Coworking"
            },
            {
              "srNo": 2,
              "month": "May",
              "income": 22037037,
              "expense": 15538674,
              "profitLoss": 6498363,
              "domain": "Virtual Office"
            },
            {
              "srNo": 3,
              "month": "June",
              "income": 24629630,
              "expense": 16574586,
              "profitLoss": 8055044,
              "domain": "Workations"
            },
            {
              "srNo": 4,
              "month": "July",
              "income": 25925926,
              "expense": 18646409,
              "profitLoss": 7279517,
              "domain": "Meetng Rooms"
            },
            {
              "srNo": 5,
              "month": "August",
              "income": 27222222,
              "expense": 19682320,
              "profitLoss": 7539902,
              "domain": "Other Income"
            },
            {
              "srNo": 6,
              "month": "September",
              "income": 28518519,
              "expense": 20718232,
              "profitLoss": 7800287,
              "domain": "Coworking"
            },
            {
              "srNo": 7,
              "month": "October",
              "income": 29814815,
              "expense": 21754144,
              "profitLoss": 8060671,
              "domain": "Virtual Office"
            },
            {
              "srNo": 8,
              "month": "November",
              "income": 31111111,
              "expense": 22582873,
              "profitLoss": 8528238,
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
              "income": 3650000,
              "expense": 2300000,
              "profitLoss": 1350000,
              "domain": "Coworking"
            },
            {
              "srNo": 2,
              "month": "May",
              "income": 3250000,
              "expense": 2000000,
              "profitLoss": 1250000,
              "domain": "Virtual Office"
            },
            {
              "srNo": 3,
              "month": "June",
              "income": 3100000,
              "expense": 1800000,
              "profitLoss": 1300000,
              "domain": "Workations"
            },
            {
              "srNo": 4,
              "month": "July",
              "income": 4000000,
              "expense": 2500000,
              "profitLoss": 1500000,
              "domain": "Café"
            },
            {
              "srNo": 5,
              "month": "August",
              "income": 3950000,
              "expense": 2200000,
              "profitLoss": 1750000,
              "domain": "Meeting Rooms"
            },
            {
              "srNo": 6,
              "month": "September",
              "income": 3350000,
              "expense": 1900000,
              "profitLoss": 1450000,
              "domain": "Coworking"
            },
            {
              "srNo": 7,
              "month": "October",
              "income": 3550000,
              "expense": 1950000,
              "profitLoss": 1600000,
              "domain": "Virtual Office"
            },
            {
              "srNo": 8,
              "month": "November",
              "income": 3700000,
              "expense": 1900000,
              "profitLoss": 1800000,
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
              "income": 2312500,
              "expense": 1500000,
              "profitLoss": 812500,
              "domain": "Coworking"
            },
            {
              "srNo": 2,
              "month": "May",
              "income": 2150000,
              "expense": 1400000,
              "profitLoss": 750000,
              "domain": "Virtual Office"
            },
            {
              "srNo": 3,
              "month": "June",
              "income": 2200000,
              "expense": 1450000,
              "profitLoss": 750000,
              "domain": "Workations"
            },
            {
              "srNo": 4,
              "month": "July",
              "income": 2400000,
              "expense": 1600000,
              "profitLoss": 800000,
              "domain": "Café"
            },
            {
              "srNo": 5,
              "month": "August",
              "income": 2300000,
              "expense": 1450000,
              "profitLoss": 850000,
              "domain": "Meeting Rooms"
            },
            {
              "srNo": 6,
              "month": "September",
              "income": 2150000,
              "expense": 1400000,
              "profitLoss": 750000,
              "domain": "Coworking"
            },
            {
              "srNo": 7,
              "month": "October",
              "income": 2250000,
              "expense": 1500000,
              "profitLoss": 750000,
              "domain": "Virtual Office"
            },
            {
              "srNo": 8,
              "month": "November",
              "income": 2150000,
              "expense": 1300000,
              "profitLoss": 850000,
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
      const updatedClients = domain.clients.map((client, index) => {
        const income = Number(client.income);
        const expense = Number(client.expense);
        const profitLoss = income - expense;

        return {
          ...client,
          srNo: index + 1,
          income: income,
          expense: expense,
          profitLoss: profitLoss,
          rawProfitLoss: profitLoss, // used for internal calc
        };
      });

      const recalculatedTotal = updatedClients.reduce((sum, client) => {
        return sum + Number(client.rawProfitLoss);
      }, 0);

      return {
        ...domain,
        clients: updatedClients,
        totalProfitLoss: recalculatedTotal,
      };
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
                  data={domain.clients.map(client => {
                    return {
                      ...client,
                      income: inrFormat(client.income),
                      expense: inrFormat(client.expense),
                      profitLoss: inrFormat(client.profitLoss)
                    }
                  })}
                  hideFilter
                  columns={[
                    { headerName: "Sr No", field: "srNo", flex: 1 },
                    { headerName: "Verticals", field: "domain", flex: 1 },
                    { headerName: "Income (INR)", field: "income", flex: 1 },
                    { headerName: "Expense (INR)", field: "expense", flex: 1 },
                    { headerName: "Profit / Loss (INR)", field: "profitLoss", flex: 1 },
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
