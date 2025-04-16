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
              "income": 2014925,
              "expense": 1306212,
              "profitLoss": 708713,
              "domain": "Coworking"
            },
            {
              "srNo": 2,
              "month": "May",
              "income": 1876361,
              "expense": 1222636,
              "profitLoss": 653725,
              "domain": "Virtual Office"
            },
            {
              "srNo": 3,
              "month": "June",
              "income": 1920155,
              "expense": 1264458,
              "profitLoss": 655697,
              "domain": "Workations"
            },
            {
              "srNo": 4,
              "month": "July",
              "income": 2096502,
              "expense": 1397673,
              "profitLoss": 698829,
              "domain": "Café"
            },
            {
              "srNo": 5,
              "month": "August",
              "income": 2001110,
              "expense": 1264458,
              "profitLoss": 736652,
              "domain": "Meeting Rooms"
            },
            {
              "srNo": 6,
              "month": "September",
              "income": 1876361,
              "expense": 1222636,
              "profitLoss": 653725,
              "domain": "Coworking"
            },
            {
              "srNo": 7,
              "month": "October",
              "income": 1963949,
              "expense": 1306212,
              "profitLoss": 657737,
              "domain": "Virtual Office"
            },
            {
              "srNo": 8,
              "month": "November",
              "income": 1876361,
              "expense": 1041714,
              "profitLoss": 834647,
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
              "income": 1800000,
              "expense": 1200000,
              "profitLoss": 600000,
              "domain": "Coworking"
            },
            {
              "srNo": 2,
              "month": "May",
              "income": 1700000,
              "expense": 1000000,
              "profitLoss": 700000,
              "domain": "Virtual Office"
            },
            {
              "srNo": 3,
              "month": "June",
              "income": 1900000,
              "expense": 1100000,
              "profitLoss": 800000,
              "domain": "Workations"
            },
            {
              "srNo": 4,
              "month": "July",
              "income": 2000000,
              "expense": 1200000,
              "profitLoss": 800000,
              "domain": "Café"
            },
            {
              "srNo": 5,
              "month": "August",
              "income": 1600000,
              "expense": 1000000,
              "profitLoss": 600000,
              "domain": "Meetng Rooms"
            },
            {
              "srNo": 6,
              "month": "September",
              "income": 1500000,
              "expense": 1300000,
              "profitLoss": 200000,
              "domain": "Coworking"
            },
            {
              "srNo": 7,
              "month": "October",
              "income": 1400000,
              "expense": 1100000,
              "profitLoss": 300000,
              "domain": "Virtual Office"
            },
            {
              "srNo": 8,
              "month": "November",
              "income": 1300000,
              "expense": 900000,
              "profitLoss": 400000,
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
              "income": 1058824,
              "expense": 1012195,
              "profitLoss": 46629,
              "domain": "Coworking"
            },
            {
              "srNo": 2,
              "month": "May",
              "income": 1125000,
              "expense": 1082675,
              "profitLoss": 42325,
              "domain": "Virtual Office"
            },
            {
              "srNo": 3,
              "month": "June",
              "income": 1257353,
              "expense": 1150902,
              "profitLoss": 106451,
              "domain": "Workations"
            },
            {
              "srNo": 4,
              "month": "July",
              "income": 1323529,
              "expense": 1298780,
              "profitLoss": 24749,
              "domain": "Café"
            },
            {
              "srNo": 5,
              "month": "August",
              "income": 1389706,
              "expense": 1376707,
              "profitLoss": 12999,
              "domain": "Meetng Rooms"
            },
            {
              "srNo": 6,
              "month": "September",
              "income": 1455882,
              "expense": 1444634,
              "profitLoss": 11248,
              "domain": "Coworking"
            },
            {
              "srNo": 7,
              "month": "October",
              "income": 1522059,
              "expense": 1512561,
              "profitLoss": 9498,
              "domain": "Virtual Office"
            },
            {
              "srNo": 8,
              "month": "November",
              "income": 1626546,
              "expense": 1588235,
              "profitLoss": 38311,
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
              "income": 2002002,
              "expense": 1189397,
              "profitLoss": 812605,
              "domain": "Coworking"
            },
            {
              "srNo": 2,
              "month": "May",
              "income": 2127127,
              "expense": 1274354,
              "profitLoss": 852773,
              "domain": "Virtual Office"
            },
            {
              "srNo": 3,
              "month": "June",
              "income": 2377377,
              "expense": 1359311,
              "profitLoss": 1018066,
              "domain": "Workations"
            },
            {
              "srNo": 4,
              "month": "July",
              "income": 2502503,
              "expense": 1529225,
              "profitLoss": 973278,
              "domain": "Café"
            },
            {
              "srNo": 5,
              "month": "August",
              "income": 2627628,
              "expense": 1614182,
              "profitLoss": 1013446,
              "domain": "Meetng Rooms"
            },
            {
              "srNo": 6,
              "month": "September",
              "income": 275275,
              "expense": 169914,
              "profitLoss": 105361,
              "domain": "Coworking"
            },
            {
              "srNo": 7,
              "month": "October",
              "income": 287788,
              "expense": 178410,
              "profitLoss": 109378,
              "domain": "Virtual Office"
            },
            {
              "srNo": 8,
              "month": "November",
              "income": 300300,
              "expense": 185206,
              "profitLoss": 115094,
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
