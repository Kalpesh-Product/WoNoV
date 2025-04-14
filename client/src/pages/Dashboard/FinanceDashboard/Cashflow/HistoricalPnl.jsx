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
    month: "FY 2024-25",
    domains: [
      {
        name: "2024-2025",
        totalProfitLoss: 136000,
        clients: [
          { srNo: 1, month: "April", income: 80000, expense: 70000, profitLoss: 10000 },
          { srNo: 2, month: "May", income: 85000, expense: 75000, profitLoss: 10000 },
          { srNo: 3, month: "June", income: 95000, expense: 80000, profitLoss: 15000 },
          { srNo: 4, month: "July", income: 100000, expense: 90000, profitLoss: 10000 },
          { srNo: 5, month: "August", income: 105000, expense: 95000, profitLoss: 10000 },
          { srNo: 6, month: "September", income: 110000, expense: 100000, profitLoss: 10000 },
          { srNo: 7, month: "October", income: 115000, expense: 105000, profitLoss: 10000 },
          { srNo: 8, month: "November", income: 120000, expense: 109000, profitLoss: 11000 },
        ],
      },
      {
        name: "2023-2024",
        totalProfitLoss: 230000,
        clients: [
          { srNo: 1, month: "April", income: 120000, expense: 80000, profitLoss: 40000 },
          { srNo: 2, month: "May", income: 110000, expense: 90000, profitLoss: 20000 },
          { srNo: 3, month: "June", income: 95000, expense: 105000, profitLoss: -10000 },
          { srNo: 4, month: "July", income: 150000, expense: 70000, profitLoss: 80000 },
          { srNo: 5, month: "August", income: 100000, expense: 120000, profitLoss: -20000 },
          { srNo: 6, month: "September", income: 130000, expense: 90000, profitLoss: 40000 },
          { srNo: 7, month: "October", income: 140000, expense: 100000, profitLoss: 40000 },
          { srNo: 8, month: "November", income: 90000, expense: 90000, profitLoss: 25000 },
        ],
      },
      {
        name: "2022-2023",
        totalProfitLoss: 140000,
        clients: [
          { srNo: 1, month: "April", income: 90000, expense: 70000, profitLoss: 20000 },
          { srNo: 2, month: "May", income: 95000, expense: 90000, profitLoss: 5000 },
          { srNo: 3, month: "June", income: 100000, expense: 95000, profitLoss: 5000 },
          { srNo: 4, month: "July", income: 85000, expense: 70000, profitLoss: 15000 },
          { srNo: 5, month: "August", income: 120000, expense: 100000, profitLoss: 20000 },
          { srNo: 6, month: "September", income: 110000, expense: 95000, profitLoss: 15000 },
          { srNo: 7, month: "October", income: 130000, expense: 110000, profitLoss: 20000 },
          { srNo: 8, month: "November", income: 125000, expense: 100000, profitLoss: 25000 },
        ],
      },
      {
        name: "2021-2022",
        totalProfitLoss: 174000,
        clients: [
          { srNo: 1, month: "April", income: 105000, expense: 80000, profitLoss: 25000 },
          { srNo: 2, month: "May", income: 95000, expense: 80000, profitLoss: 15000 },
          { srNo: 3, month: "June", income: 110000, expense: 90000, profitLoss: 20000 },
          { srNo: 4, month: "July", income: 115000, expense: 85000, profitLoss: 30000 },
          { srNo: 5, month: "August", income: 125000, expense: 100000, profitLoss: 25000 },
          { srNo: 6, month: "September", income: 95000, expense: 90000, profitLoss: 5000 },
          { srNo: 7, month: "October", income: 100000, expense: 85000, profitLoss: 15000 },
          { srNo: 8, month: "November", income: 105000, expense: 90000, profitLoss: 15000 },
        ],
      },
      {
        name: "2020-2021",
        totalProfitLoss: 126000,
        clients: [
          { srNo: 1, month: "April", income: 80000, expense: 70000, profitLoss: 10000 },
          { srNo: 2, month: "May", income: 85000, expense: 75000, profitLoss: 10000 },
          { srNo: 3, month: "June", income: 95000, expense: 80000, profitLoss: 15000 },
          { srNo: 4, month: "July", income: 100000, expense: 90000, profitLoss: 10000 },
          { srNo: 5, month: "August", income: 105000, expense: 95000, profitLoss: 10000 },
          { srNo: 6, month: "September", income: 110000, expense: 100000, profitLoss: 10000 },
          { srNo: 7, month: "October", income: 115000, expense: 105000, profitLoss: 10000 },
          { srNo: 8, month: "November", income: 120000, expense: 109000, profitLoss: 11000 },
        ],
      },
      {
        name: "2019-2020",
        totalProfitLoss: 107000,
        clients: [
          { srNo: 1, month: "April", income: 70000, expense: 60000, profitLoss: 10000 },
          { srNo: 2, month: "May", income: 80000, expense: 65000, profitLoss: 15000 },
          { srNo: 3, month: "June", income: 85000, expense: 75000, profitLoss: 10000 },
          { srNo: 4, month: "July", income: 90000, expense: 80000, profitLoss: 10000 },
          { srNo: 5, month: "August", income: 95000, expense: 85000, profitLoss: 10000 },
          { srNo: 6, month: "September", income: 100000, expense: 90000, profitLoss: 10000 },
          { srNo: 7, month: "October", income: 105000, expense: 95000, profitLoss: 10000 },
          { srNo: 8, month: "November", income: 110000, expense: 97000, profitLoss: 13000 },
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
    colors: ["#4CAF50", "#F44336"], // Green for income, Red for expense
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "70%",
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
      title: {
        text: "2020-2025", // overridden by BarGraph component
      },
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
        formatter: (val) => `₹${val.toLocaleString()}`,
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
                    { header: "Department", field: "department", flex: 1 },
                    { header: "Income", field: "income", flex: 1 },
                    { header: "Expense", field: "expense", flex: 1 },
                    { header: "Profit / Loss", field: "profitLoss", flex: 1 },
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
