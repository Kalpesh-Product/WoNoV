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

const MaintenancePerSqFtExpense = () => {
  const mockExpensePerSqFtData = [
    {
      month: "April",
      domains: [
        {
          name: "Sunteck Kanaka - 5th Floor",
          expense: 112500,
          clients: [
            {
              buildingName: "Sunteck Kanaka",
              unitNo: "501(A)",
              occupant: "Nykaa",
              squareFeet: 450,
              actualExpense: 22000,
              location: "ST-501A",
            },
            {
              buildingName: "Sunteck Kanaka",
              unitNo: "501(B)",
              occupant: "Blinkit",
              squareFeet: 550,
              actualExpense: 27500,
              location: "ST-501B",
            },
            {
              buildingName: "Sunteck Kanaka",
              unitNo: "501(A)",
              occupant: "Flipkart",
              squareFeet: 700,
              actualExpense: 32000,
              location: "ST-501A",
            },
            {
              buildingName: "Sunteck Kanaka",
              unitNo: "501(B)",
              occupant: "Myntra",
              squareFeet: 680,
              actualExpense: 31000,
              location: "ST-501B",
            },
          ],
        },
        {
          name: "Sunteck Kanaka - 6th Floor",
          expense: 121000,
          clients: [
            {
              buildingName: "Sunteck Kanaka",
              unitNo: "601(A)",
              occupant: "Reliance Trends",
              squareFeet: 750,
              actualExpense: 35000,
              location: "ST-601A",
            },
            {
              buildingName: "Sunteck Kanaka",
              unitNo: "602(B)",
              occupant: "Tata Cliq",
              squareFeet: 640,
              actualExpense: 29000,
              location: "ST-602B",
            },
            {
              buildingName: "Sunteck Kanaka",
              unitNo: "601(A)",
              occupant: "Ajio",
              squareFeet: 660,
              actualExpense: 30000,
              location: "ST-601A",
            },
            {
              buildingName: "Sunteck Kanaka",
              unitNo: "602(B)",
              occupant: "Zivame",
              squareFeet: 600,
              actualExpense: 27000,
              location: "ST-602B",
            },
          ],
        },
        {
          name: "Sunteck Kanaka - 7th Floor",
          expense: 152000,
          clients: [
            {
              buildingName: "Sunteck Kanaka",
              unitNo: "701(A)",
              occupant: "Byju's",
              squareFeet: 800,
              actualExpense: 40000,
              location: "ST-701A",
            },
            {
              buildingName: "Sunteck Kanaka",
              unitNo: "702(B)",
              occupant: "Unacademy",
              squareFeet: 780,
              actualExpense: 39000,
              location: "ST-702B",
            },
            {
              buildingName: "Sunteck Kanaka",
              unitNo: "701(A)",
              occupant: "Toppr",
              squareFeet: 720,
              actualExpense: 36000,
              location: "ST-701A",
            },
            {
              buildingName: "Sunteck Kanaka",
              unitNo: "702(B)",
              occupant: "Khan Academy",
              squareFeet: 750,
              actualExpense: 37000,
              location: "ST-702B",
            },
          ],
        },
        {
          name: "Dempo Trade Centre - Ground Floor",
          expense: 55000,
          clients: [
            {
              buildingName: "Dempo Trade Centre",
              unitNo: "002",
              occupant: "Zomato",
              squareFeet: 500,
              actualExpense: 25000,
              location: "DTC-002",
            },
            {
              buildingName: "Dempo Trade Centre",
              unitNo: "004",
              occupant: "Swiggy",
              squareFeet: 600,
              actualExpense: 30000,
              location: "DTC-004",
            },
          ],
        },
        {
          name: "Dempo Trade Centre - 7th Floor",
          expense: 148500,
          clients: [
            {
              buildingName: "Dempo Trade Centre",
              unitNo: "706",
              occupant: "Vedantu",
              squareFeet: 760,
              actualExpense: 38000,
              location: "DTC-706",
            },
            {
              buildingName: "Dempo Trade Centre",
              unitNo: "703",
              occupant: "WhiteHat Jr",
              squareFeet: 700,
              actualExpense: 35000,
              location: "DTC-703",
            },
            {
              buildingName: "Dempo Trade Centre",
              unitNo: "703",
              occupant: "Simplilearn",
              squareFeet: 780,
              actualExpense: 39000,
              location: "DTC-703",
            },
            {
              buildingName: "Dempo Trade Centre",
              unitNo: "706",
              occupant: "UpGrad",
              squareFeet: 740,
              actualExpense: 36500,
              location: "DTC-706",
            },
          ],
        },
      ],
    },
  ];
  

  
  
  
  
  
  
  const [selectedMonth, setSelectedMonth] = useState(
    mockExpensePerSqFtData[0].month
  ); // Default to first month

  // Function to update selected month
  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  // Filter data based on selected month
  const selectedMonthData = mockExpensePerSqFtData.find(
    (data) => data.month === selectedMonth
  );


  if (selectedMonthData) {
    selectedMonthData.domains = selectedMonthData.domains.map((domain) => {
      const updatedClients = domain.clients.map((client, index) => {
        const expense = Number(client.actualExpense);
        const sqft = Number(client.squareFeet);
        const expensePerSqFt = sqft ? expense / sqft : 0;
  
        return {
          ...client,
          srNo: index + 1,
          actualExpense: expense, // Ensure number for calculations
          expensePerSqFt: expensePerSqFt.toFixed(0), // Rounded value
        };
      });
  
      return {
        ...domain,
        clients: updatedClients,
      };
    });
  }
  
  

  // Prepare Bar Graph Data
  const graphData = [
    {
      name: "Revenue",
      data: selectedMonthData.domains.map((domain) => domain.expense),
    },
  ];

  // Graph Options
  const options = {
    chart: { type: "bar", toolbar: false, stacked: false, fontFamily: "Poppins-Regular"},
    xaxis: {
      categories: selectedMonthData.domains.map((domain) => domain.name),
    },
    yaxis: { title: { text: "Expense (INR)" } },
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
            sx={{ width: "200px" }}>
            {mockExpensePerSqFtData.map((data) => (
              <MenuItem key={data.month} value={data.month}>
                {data.month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {/* Bar Graph Component */}
      <WidgetSection layout={1} title={"Expense Per Sq Ft"} border>
        <BarGraph data={graphData} options={options} height={400} />
      </WidgetSection>

      {/* Accordion Section for Domain-wise Revenue Breakdown */}
      <div className="flex flex-col gap-2 border-default border-borderGray rounded-md p-4">
      <div className="px-4 py-2 border-b-[1px] border-borderGray bg-gray-50">
          <div className="flex justify-between items-center w-full px-4 py-2">
            <span className="text-sm text-muted font-pmedium text-title">
              LOCATION
            </span>
            <span className="px-4 text-sm text-muted font-pmedium text-title flex items-center gap-1">
              REVENUE
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
                  INR {Number(domain.expense).toLocaleString()}
                  </span>
                </div>
              </AccordionSummary>
              <AccordionDetails sx={{ borderTop: "1px solid  #d1d5db" }}>
                <AgTable
                  data={domain.clients}
                  hideFilter
                  columns={[
                    { headerName: "Sr No", field: "srNo", flex: 1 },
                    { headerName: "Building Name", field: "buildingName", flex: 1 },
                    { headerName: "Unit No", field: "unitNo", flex: 1 },
                    { headerName: "Occupant", field: "occupant", flex: 1 },
                    { headerName: "Square Feet", field: "squareFeet", flex: 1 },
                    { headerName: "Actual Expense (INR)", field: "actualExpense", flex: 1 },
                    {
                      headerName: "Expense / Sq Ft (INR)",
                      field: "expensePerSqFt",
                      flex: 1,
                      valueFormatter: (params) =>
                        Number(params.value).toLocaleString("en-IN"),
                    },
                  ]}
                  tableHeight={300}
                />
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-4">
                    <span className="text-primary font-pregular">
                      Total Revenue for {domain.name}:{" "}
                    </span>
                    <span className="text-black font-pmedium">
                    INR {Number(domain.expense).toLocaleString()}
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

export default MaintenancePerSqFtExpense;
