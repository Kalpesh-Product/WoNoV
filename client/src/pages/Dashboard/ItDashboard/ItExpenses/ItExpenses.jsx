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

const ItExpenses = () => {
  const navigate = useNavigate();
  const mockBusinessRevenueData = [
    {
      month: "April",
      domains: [
        {
          name: "ST-701A",
          revenue: 10,
          clients: [
            {
              client: "Zomato",
              representative: "John Doe",
              registerDate: "2024-01-15",
              actualRevenue: 5000,
            },
            {
              client: "Uber",
              representative: "Jane Smith",
              registerDate: "2024-02-10",
              actualRevenue: 4000,
            },
            {
              client: "Ola",
              representative: "Alice Johnson",
              registerDate: "2024-03-05",
              actualRevenue: 3000,
            },
          ],
        },
        {
          name: "ST-701B",
          revenue: 10,
          clients: [
            {
              client: "Client D",
              representative: "Bob Brown",
              registerDate: "2024-01-20",
              actualRevenue: 4000,
            },
            {
              client: "Client E",
              representative: "Charlie White",
              registerDate: "2024-02-25",
              actualRevenue: 4000,
            },
          ],
        },
        {
          name: "ST-601A",
          revenue: 10,
          clients: [
            { client: "Client F", revenue: 5000 },
            { client: "Client G", revenue: 7000 },
            { client: "Client H", revenue: 3000 },
          ],
        },
        {
          name: "ST-601B",
          revenue: 10,
          clients: [
            {
              client: "Client F",
              representative: "Daniel Green",
              registerDate: "2024-03-12",
              actualRevenue: 5000,
            },
            {
              client: "Client G",
              representative: "Eva Black",
              registerDate: "2024-04-18",
              actualRevenue: 7000,
            },
            {
              client: "Client H",
              representative: "Frank Blue",
              registerDate: "2024-05-10",
              actualRevenue: 3000,
            },
          ],
        },
        {
          name: "ST-501A",
          revenue: 10,
          clients: [
            {
              client: "Client F",
              representative: "Daniel Green",
              registerDate: "2024-03-12",
              actualRevenue: 5000,
            },
            {
              client: "Client G",
              representative: "Eva Black",
              registerDate: "2024-04-18",
              actualRevenue: 7000,
            },
            {
              client: "Client H",
              representative: "Frank Blue",
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
          revenue: 10,
          clients: [
            {
              client: "Client I",
              representative: "Grace Orange",
              registerDate: "2024-02-11",
              actualRevenue: 6000,
            },
            {
              client: "Client J",
              representative: "Hank Purple",
              registerDate: "2024-03-09",
              actualRevenue: 5000,
            },
            {
              client: "Client K",
              representative: "Isabel Cyan",
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
              registerDate: "2024-02-28",
              actualRevenue: 5000,
            },
            {
              client: "Client M",
              representative: "Kara Silver",
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
              registerDate: "2024-05-20",
              actualRevenue: 6000,
            },
            {
              client: "Client O",
              representative: "Mia Platinum",
              registerDate: "2024-06-08",
              actualRevenue: 5000,
            },
            {
              client: "Client P",
              representative: "Noah Bronze",
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
              registerDate: "2024-01-30",
              actualRevenue: 7000,
            },
            {
              client: "Client R",
              representative: "Peter Brown",
              registerDate: "2024-02-18",
              actualRevenue: 6000,
            },
            {
              client: "Client S",
              representative: "Quincy Black",
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
              registerDate: "2024-04-12",
              actualRevenue: 5000,
            },
            {
              client: "Client U",
              representative: "Sam Indigo",
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
              registerDate: "2024-06-05",
              actualRevenue: 6000,
            },
            {
              client: "Client W",
              representative: "Umar Yellow",
              registerDate: "2024-07-08",
              actualRevenue: 4000,
            },
            {
              client: "Client X",
              representative: "Victor Pink",
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
              registerDate: "2024-03-10",
              actualRevenue: 8000,
            },
            {
              client: "Client Z",
              representative: "Xavier Green",
              registerDate: "2024-04-14",
              actualRevenue: 7000,
            },
            {
              client: "Client AA",
              representative: "Yara Blue",
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
              registerDate: "2024-06-20",
              actualRevenue: 6000,
            },
            {
              client: "Client AC",
              representative: "Adam Gray",
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
              registerDate: "2024-08-25",
              actualRevenue: 7000,
            },
            {
              client: "Client AE",
              representative: "Charlie Platinum",
              registerDate: "2024-09-14",
              actualRevenue: 6000,
            },
            {
              client: "Client AF",
              representative: "David Bronze",
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
      name: "Revenue",
      data: selectedMonthData.domains.map((domain) => domain.revenue),
    },
  ];

  // Graph Options
  const options = {
    chart: { type: "bar", stacked: false, fontFamily: "Poppins-Regular" },
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
            {mockBusinessRevenueData.map((data) => (
              <MenuItem key={data.month} value={data.month}>
                {data.month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {/* Bar Graph Component */}
      <WidgetSection layout={1} title={"IT Expenses"} border>
        <BarGraph data={graphData} options={options} height={400} />
      </WidgetSection>

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
                  <span className="text-subtitle font-pmedium  ">
                    {domain.name}
                  </span>
                  <span className="text-subtitle font-pmedium">
                    {domain.revenue.toLocaleString()}
                  </span>
                </div>
              </AccordionSummary>
              <AccordionDetails sx={{ borderTop: "1px solid  #d1d5db" }}>
                {/* Details Start */}
                <div className="flex justify-between">
                  <div className="flex justify-between items-center w-80 px-4">
                    <span
                      className="text-subtitle font-pmedium underline text-primary"
                      onClick={() => {
                        localStorage.setItem("client", domain.name);
                        navigate(
                          `/app/dashboard/it-dashboard/it-expenses/it-expenses-layout/${domain.name}`
                        );
                      }}>
                      View Layout {domain.name}
                    </span>
                    {/* <span className="text-subtitle font-pmedium">
                      {domain.revenue.toLocaleString()}
                    </span> */}
                  </div>
                  <div className="w-4/12 ">
                    <p className="text-subtitle text-primary p-6 w-fit">
                      <span className="font-bold">Admin Lead: </span>
                      Machindranath Parkar
                    </p>
                  </div>
                </div>
                {/* Details End */}
                <AgTable
                  data={domain.clients}
                  hideFilter
                  columns={[
                    {
                      header: "Sr. No.",
                      field: "client",
                      flex: 1,
                      // cellRenderer: (params) => (
                      //   <span
                      //     style={{
                      //       color: "#1E3D73",
                      //       textDecoration: "underline",
                      //       cursor: "pointer",
                      //     }}
                      //     onClick={() => {
                      //       localStorage.setItem("client", params.data.client);
                      //       navigate(
                      //         `/app/dashboard/it-dashboard/it-expenses/it-expenses-layout/${params.data.client}`
                      //       );
                      //     }}>
                      //     {params.value}
                      //   </span>
                      // ),
                    },
                    {
                      header: "Unit No.",
                      field: "representative",
                      flex: 1,
                    },
                    { header: "Unit Floor", field: "registerDate", flex: 1 },
                    {
                      header: "Unit Name",
                      field: "actualRevenue",
                      flex: 1,
                    },
                    {
                      header: "Building",
                      field: "actualRevenue",
                      flex: 1,
                    },
                    {
                      header: "Location",
                      field: "actualRevenue",
                      flex: 1,
                    },
                    {
                      header: "Annual Expense",
                      field: "actualRevenue",
                      flex: 1,
                    },
                    {
                      header: "Action",
                      field: "actualRevenue",
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
                      ₹{domain.revenue.toLocaleString()}
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

export default ItExpenses;
