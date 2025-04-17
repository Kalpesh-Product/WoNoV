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
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const MaintenanceExpenses = () => {
 
  const mockMaintenanceExpensesData = [
    {
      month: "April",
      domains: [
        {
          name: "Furniture",
          expense: 14,
          clients: [
            { item: "Office Chairs", vendor: "Godrej Interio", purchaseDate: "2024-04-05", actualExpense: 45000 },
            { item: "Office Desks", vendor: "Urban Ladder", purchaseDate: "2024-04-08", actualExpense: 60000 },
            { item: "Reception Table", vendor: "Durian", purchaseDate: "2024-04-10", actualExpense: 25000 },
            { item: "Bookshelves", vendor: "IKEA", purchaseDate: "2024-04-11", actualExpense: 15000 },
            { item: "Sofas", vendor: "Hometown", purchaseDate: "2024-04-12", actualExpense: 40000 },
            { item: "Conference Table", vendor: "Featherlite", purchaseDate: "2024-04-14", actualExpense: 55000 },
            { item: "Drawers", vendor: "Urban Ladder", purchaseDate: "2024-04-15", actualExpense: 10000 },
            { item: "File Cabinets", vendor: "Godrej Interio", purchaseDate: "2024-04-16", actualExpense: 20000 },
          ],
        },
        {
          name: "Electrical",
          expense: 30,
          clients: [
            { item: "LED Lights", vendor: "Syska", purchaseDate: "2024-04-10", actualExpense: 15000 },
            { item: "Power Cables", vendor: "Finolex", purchaseDate: "2024-04-12", actualExpense: 8000 },
            { item: "Switch Boards", vendor: "Anchor", purchaseDate: "2024-04-13", actualExpense: 6000 },
            { item: "Fans", vendor: "Havells", purchaseDate: "2024-04-14", actualExpense: 12000 },
            { item: "Tube Lights", vendor: "Philips", purchaseDate: "2024-04-15", actualExpense: 9000 },
            { item: "Electrical Panel", vendor: "L&T", purchaseDate: "2024-04-16", actualExpense: 20000 },
            { item: "MCB Box", vendor: "Schneider", purchaseDate: "2024-04-17", actualExpense: 7000 },
            { item: "Sockets", vendor: "GM Modular", purchaseDate: "2024-04-18", actualExpense: 5000 },
          ],
        },
        {
          name: "Plumbing",
          expense: 12,
          clients: [
            { item: "PVC Pipes", vendor: "Supreme Pipes", purchaseDate: "2024-04-11", actualExpense: 12000 },
            { item: "Wash Basins", vendor: "Cera", purchaseDate: "2024-04-14", actualExpense: 25000 },
            { item: "Taps", vendor: "Jaquar", purchaseDate: "2024-04-15", actualExpense: 8000 },
            { item: "Toilets", vendor: "Hindware", purchaseDate: "2024-04-16", actualExpense: 15000 },
            { item: "Geysers", vendor: "Racold", purchaseDate: "2024-04-17", actualExpense: 10000 },
            { item: "Drainage Pipes", vendor: "Ashirvad", purchaseDate: "2024-04-18", actualExpense: 9000 },
            { item: "Angle Valves", vendor: "Kohler", purchaseDate: "2024-04-19", actualExpense: 4000 },
            { item: "Water Tanks", vendor: "Sintex", purchaseDate: "2024-04-20", actualExpense: 20000 },
          ],
        },
        {
          name: "Air Conditioning",
          expense: 15,
          clients: [
            { item: "AC Repair", vendor: "Voltas Service", purchaseDate: "2024-04-15", actualExpense: 10000 },
            { item: "Split AC Installation", vendor: "Daikin", purchaseDate: "2024-04-18", actualExpense: 35000 },
            { item: "Window ACs", vendor: "Blue Star", purchaseDate: "2024-04-19", actualExpense: 30000 },
            { item: "AC Gas Refilling", vendor: "LG Service", purchaseDate: "2024-04-20", actualExpense: 5000 },
            { item: "AC Maintenance", vendor: "Carrier", purchaseDate: "2024-04-21", actualExpense: 8000 },
            { item: "Remote Units", vendor: "Voltas", purchaseDate: "2024-04-22", actualExpense: 2000 },
            { item: "Duct Cleaning", vendor: "Blue Dart Cleaners", purchaseDate: "2024-04-23", actualExpense: 7000 },
            { item: "AC Filters", vendor: "Hitachi", purchaseDate: "2024-04-24", actualExpense: 6000 },
          ],
        },
        {
          name: "Housekeeping",
          expense: 25,
          clients: [
            { item: "Cleaning Supplies", vendor: "Amazon Business", purchaseDate: "2024-04-20", actualExpense: 7000 },
            { item: "Dustbins & Dispensers", vendor: "UClean", purchaseDate: "2024-04-22", actualExpense: 9000 },
            { item: "Mops & Buckets", vendor: "Scotch-Brite", purchaseDate: "2024-04-23", actualExpense: 3000 },
            { item: "Toilet Cleaners", vendor: "Harpic", purchaseDate: "2024-04-24", actualExpense: 2000 },
            { item: "Room Fresheners", vendor: "Godrej Aer", purchaseDate: "2024-04-25", actualExpense: 1500 },
            { item: "Gloves & Masks", vendor: "3M", purchaseDate: "2024-04-26", actualExpense: 3500 },
            { item: "Microfiber Cloths", vendor: "Mr. Clean", purchaseDate: "2024-04-27", actualExpense: 1200 },
            { item: "Sanitizers", vendor: "Dettol", purchaseDate: "2024-04-28", actualExpense: 2500 },
          ],
        },
      ],
    },
  ];
  
  

  const [selectedMonth, setSelectedMonth] = useState(
    mockMaintenanceExpensesData[0].month
  ); // Default to first month

  // Function to update selected month
  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  // Filter data based on selected month
  const selectedMonthData = mockMaintenanceExpensesData.find(
    (data) => data.month === selectedMonth
  );

   if (selectedMonthData) {
      selectedMonthData.domains = selectedMonthData.domains.map((domain) => {
        const updatedClients = domain.clients.map((client, index) => ({
          ...client,
          srNo: index + 1,
          purchaseDate: dayjs(client.purchaseDate).format("DD-MM-YYYY"),
          actualExpense:Number(client.actualExpense).toLocaleString("en-IN")
        }));
        return { ...domain, clients: updatedClients };
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
    chart: { type: "bar", toolbar: false, stacked: false, fontFamily: "Poppins-Regular" },
    xaxis: {
      categories: selectedMonthData.domains.map((domain) => domain.name),
    },
    yaxis: { title: { text: "Number Of Offices" } },
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
            {mockMaintenanceExpensesData.map((data) => (
              <MenuItem key={data.month} value={data.month}>
                {data.month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {/* Bar Graph Component */}
      <WidgetSection layout={1} title={"Maintenance Expenses"} border>
        <BarGraph data={graphData} options={options} height={400} />
      </WidgetSection>

      {/* Accordion Section for Domain-wise Revenue Breakdown */}
      <div className="flex flex-col gap-2 border-default border-borderGray rounded-md p-4">
      <div className="px-4 py-2 border-b-[1px] border-borderGray bg-gray-50">
          <div className="flex justify-between items-center w-full px-4 py-2">
            <span className="text-sm text-muted font-pmedium text-title">
              CATEGORY
            </span>
            <span className="text-sm text-muted font-pmedium text-title flex items-center gap-1">
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
                  <span className="text-subtitle font-pmedium  ">
                    {domain.name}
                  </span>
                  <span className="text-subtitle font-pmedium">
                    INR {Number(domain.expense).toLocaleString()}
                  </span>
                </div>
              </AccordionSummary>
              <AccordionDetails sx={{ borderTop: "1px solid  #d1d5db" }}>
                {/* Details Start */}
                <div className="flex justify-between">
                  <div className="flex justify-between items-center w-80 px-4">
                    {/* <span
                      className="text-subtitle font-pmedium underline text-primary"
                      onClick={() => {
                        localStorage.setItem("client", domain.name);
                        navigate(
                          `/app/dashboard/maintenance-dashboard/maintenance-expenses/maintenance-expenses-layout/${domain.name}`
                        );
                      }}>
                      View Layout {domain.name}
                    </span> */}
                    {/* <span className="text-subtitle font-pmedium">
                      {domain.revenue.toLocaleString()}
                    </span> */}
                  </div>
                  {/* <div className="w-4/12 ">
                    <p className="text-subtitle text-primary p-6 w-fit">
                      <span className="font-bold">Maintenance Lead: </span>
                      Amol Kakade
                    </p>
                  </div> */}
                </div>
                {/* Details End */}
                <AgTable
                  data={domain.clients}
                  hideFilter
                  columns={
                    [
                      {
                        headerName: "Sr No",
                        field: "srNo",
                        flex: 1,
                      },
                      {
                        headerName: "Item",
                        field: "item",
                        flex: 1,
                      },
                      {
                        headerName: "Vendor",
                        field: "vendor",
                        flex: 1,
                      },
                      {
                        headerName: "Purchase Date",
                        field: "purchaseDate",
                        flex: 1,
                      },
                      {
                        headerName: "Actual Expense (INR)",
                        field: "actualExpense",
                        flex: 1,
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

export default MaintenanceExpenses;
