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

const MaintenanceOffices = () => {
  const navigate = useNavigate();
  const mockBusinessRevenueData = [
    {
      month: "April",
      domains: [
        {
          name: "ST-701A",
          revenue: 226000, // 85000 + 72000 + 69000
          clients: [
            {
              client: "Zomato",
              representative: "Rajesh Kumar",
              registerDate: "2024-01-15",
              actualRevenue: 85000,
            },
            {
              client: "Uber",
              representative: "Neha Sharma",
              registerDate: "2024-02-10",
              actualRevenue: 72000,
            },
            {
              client: "Ola",
              representative: "Amit Verma",
              registerDate: "2024-03-05",
              actualRevenue: 69000,
            },
          ],
        },
        {
          name: "ST-701B",
          revenue: 138000, // 60000 + 78000
          clients: [
            {
              client: "Tata Consultancy Services",
              representative: "Sunil Mehra",
              registerDate: "2024-01-20",
              actualRevenue: 60000,
            },
            {
              client: "Infosys",
              representative: "Priya Iyer",
              registerDate: "2024-02-25",
              actualRevenue: 78000,
            },
          ],
        },
        {
          name: "ST-601A",
          revenue: 208000, // 52000 + 97000 + 59000
          clients: [
            {
              client: "Reliance Industries",
              representative: "Deepak Nair",
              registerDate: "2024-01-18",
              actualRevenue: 52000,
            },
            {
              client: "Wipro",
              representative: "Kavita Rao",
              registerDate: "2024-02-22",
              actualRevenue: 97000,
            },
            {
              client: "Mahindra & Mahindra",
              representative: "Suresh Menon",
              registerDate: "2024-03-09",
              actualRevenue: 59000,
            },
          ],
        },
        {
          name: "ST-601B",
          revenue: 207000, // 64000 + 89000 + 54000
          clients: [
            {
              client: "Reliance Industries",
              representative: "Anjali Desai",
              registerDate: "2024-03-12",
              actualRevenue: 64000,
            },
            {
              client: "Wipro",
              representative: "Ravi Chandra",
              registerDate: "2024-04-18",
              actualRevenue: 89000,
            },
            {
              client: "Mahindra & Mahindra",
              representative: "Meena Joshi",
              registerDate: "2024-05-10",
              actualRevenue: 54000,
            },
          ],
        },
        {
          name: "ST-501A",
          revenue: 232000, // 77000 + 94000 + 61000
          clients: [
            {
              client: "Reliance Industries",
              representative: "Anjali Desai",
              registerDate: "2024-03-12",
              actualRevenue: 77000,
            },
            {
              client: "Wipro",
              representative: "Ravi Chandra",
              registerDate: "2024-04-18",
              actualRevenue: 94000,
            },
            {
              client: "Mahindra & Mahindra",
              representative: "Meena Joshi",
              registerDate: "2024-05-10",
              actualRevenue: 61000,
            },
          ],
        },
      ],
    },

    {
      month: "May",
      domains: [
        {
          name: "ST-701A",
          revenue: 150000, // 60000 + 50000 + 40000
          clients: [
            {
              client: "Paytm",
              representative: "Ravi Bhatia",
              registerDate: "2024-02-11",
              actualRevenue: 60000,
            },
            {
              client: "Byju's",
              representative: "Sneha Kapoor",
              registerDate: "2024-03-09",
              actualRevenue: 50000,
            },
            {
              client: "Swiggy",
              representative: "Ankit Reddy",
              registerDate: "2024-04-14",
              actualRevenue: 40000,
            },
          ],
        },
        {
          name: "ST-701B",
          revenue: 90000, // 50000 + 40000
          clients: [
            {
              client: "HDFC Bank",
              representative: "Rohit Joshi",
              registerDate: "2024-02-28",
              actualRevenue: 50000,
            },
            {
              client: "ICICI Bank",
              representative: "Pooja Nair",
              registerDate: "2024-03-07",
              actualRevenue: 40000,
            },
          ],
        },
        {
          name: "ST-601A",
          revenue: 140000, // 60000 + 50000 + 30000
          clients: [
            {
              client: "Asian Paints",
              representative: "Nikhil Rao",
              registerDate: "2024-05-20",
              actualRevenue: 60000,
            },
            {
              client: "Tanishq",
              representative: "Isha Kulkarni",
              registerDate: "2024-06-08",
              actualRevenue: 50000,
            },
            {
              client: "Amul",
              representative: "Vikas Sharma",
              registerDate: "2024-07-15",
              actualRevenue: 30000,
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

  if (selectedMonthData) {
    selectedMonthData.domains = selectedMonthData.domains.map((domain) => {
      const updatedClients = domain.clients.map((client, index) => ({
        ...client,
        srNo: index + 1,
        registerDate: dayjs(client.registerDate).format("DD-MM-YYYY"),
        actualRevenue: Number(client.actualRevenue).toLocaleString("en-IN"),
      }));
      return { ...domain, clients: updatedClients };
    });
  }

  // Prepare Bar Graph Data
  const graphData = [
    {
      // name: "Revenue",
      name: "Offices",
      data: selectedMonthData.domains.map((domain) => domain.clients.length),
    },
  ];

  // Graph Options
  const options = {
    chart: {
      type: "bar",
      toolbar: false,
      stacked: false,
      fontFamily: "Poppins-Regular",
    },
    xaxis: {
      categories: selectedMonthData.domains.map((domain) => domain.name),
    },
    yaxis: { title: { text: "Number Of Offices" }, tickAmount: 3 },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "30%", borderRadius: 5 },
    },
    legend: { position: "top" },
     colors: ["#54C4A7", "#EB5C45"],
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
      <WidgetSection layout={1} title={"Maintenance Offices"} border>
        <BarGraph data={[]} options={[]} height={400} />
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
                  <span className="text-subtitle font-pmedium  ">
                    {domain.name}
                  </span>
                  <span className="text-subtitle font-pmedium">
                    {/* INR {domain.revenue.toLocaleString()} */}
                  </span>
                </div>
              </AccordionSummary>
              <AccordionDetails sx={{ borderTop: "1px solid  #d1d5db" }}>
                {/* Details Start */}
                <div className="flex justify-between">
                  <div className="flex justify-between items-center w-full">
                    <span
                      className="text-subtitle font-pmedium underline text-primary
                      cursor-pointer"
                      onClick={() => {
                        localStorage.setItem("client", domain.name);
                        navigate(
                          `/app/dashboard/maintenance-dashboard/maintenance-offices/maintenance-offices-layout/${domain.name}`
                        );
                      }}>
                      View Layout {domain.name}
                    </span>

                    <div className="">
                      <p className="text-subtitle text-primary p-6 w-fit">
                        <span className="font-bold">Maintenance Lead: </span>
                        Rajesh Sawant
                      </p>
                    </div>
                  </div>
                </div>
                {/* Details End */}
                <AgTable
                  data={[]}
                  hideFilter
                  columns={[
                    {
                      headerName: "Sr No",
                      field: "srNo",
                      flex: 1,
                    },
                    {
                      headerName: "Client",
                      field: "client",
                      flex: 1,
                    },
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
                      headerName: "Actual Expense (INR)",
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
                      {/* INR {domain.revenue.toLocaleString()} */}
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

export default MaintenanceOffices;
