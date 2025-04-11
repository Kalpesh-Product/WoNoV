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
import dayjs from "dayjs";

const RevenueTarget = () => {
  const mockBusinessRevenueData = [
    {
      month: "April",
      domains: [
        {
          name: "Co-Working",
          revenue: 125680,
          clients: [
            {
              srNo: "1",
              client: "Zomato",
              representative: "John Doe",
              registerDate: "2024-01-15",
              actualRevenue: 5000,
            },
            {
              srNo: "2",
              client: "Uber",
              representative: "Jane Smith",
              registerDate: "2024-02-10",
              actualRevenue: 4000,
            },
            {
              srNo: "3",
              client: "Ola",
              representative: "Alice Johnson",
              registerDate: "2024-03-05",
              actualRevenue: 3000,
            },
          ],
        },
        {
          name: "Workation",
          revenue: 83630,
          clients: [
            {
              srNo: "1",
              client: "Client D",
              representative: "Bob Brown",
              registerDate: "2024-01-20",
              actualRevenue: 4000,
            },
            {
              srNo: "2",
              client: "Client E",
              representative: "Charlie White",
              registerDate: "2024-02-25",
              actualRevenue: 4000,
            },
            {
              srNo: "3",
              client: "Client F",
              representative: "Charlie White",
              registerDate: "2024-02-25",
              actualRevenue: 4000,
            },
          ],
        },
        {
          name: "Meetings",
          revenue: 157840,
          clients: [
            { srNo: "1", client: "Client F", revenue: 5000 },
            { srNo: "2", client: "Client G", revenue: 7000 },
            { srNo: "3", client: "Client H", revenue: 3000 },
          ],
        },
        {
          name: "Virtual Office",
          revenue: 156380,
          clients: [
            {
              srNo: "1",
              client: "Client F",
              representative: "Daniel Green",
              registerDate: "2024-03-12",
              actualRevenue: 5000,
            },
            {
              srNo: "2",
              client: "Client G",
              representative: "Eva Black",
              registerDate: "2024-04-18",
              actualRevenue: 7000,
            },
            {
              srNo: "3",
              client: "Client H",
              representative: "Frank Blue",
              registerDate: "2024-05-10",
              actualRevenue: 3000,
            },
          ],
        },
        {
          name: "Other Channels",
          revenue: 156470,
          clients: [
            {
              srNo: "1",
              client: "Client F",
              representative: "Daniel Green",
              registerDate: "2024-03-12",
              actualRevenue: 5000,
            },
            {
              srNo: "2",
              client: "Client G",
              representative: "Eva Black",
              registerDate: "2024-04-18",
              actualRevenue: 7000,
            },
            {
              srNo: "3",
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
          revenue: 15654,
          clients: [
            {
              srNo: "1",
              client: "Client I",
              representative: "Grace Orange",
              registerDate: "2024-02-11",
              actualRevenue: 6000,
            },
            {
              srNo: "2",
              client: "Client J",
              representative: "Hank Purple",
              registerDate: "2024-03-09",
              actualRevenue: 5000,
            },
            {
              srNo: "3",
              client: "Client K",
              representative: "Isabel Cyan",
              registerDate: "2024-04-14",
              actualRevenue: 4000,
            },
          ],
        },
        {
          name: "Workation",
          revenue: 9795,
          clients: [
            {
              srNo: "1",
              client: "Client L",
              representative: "Jack Gray",
              registerDate: "2024-02-28",
              actualRevenue: 5000,
            },
            {
              srNo: "2",
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
              srNo: "1",
              client: "Client N",
              representative: "Leo Gold",
              registerDate: "2024-05-20",
              actualRevenue: 6000,
            },
            {
              srNo: "2",
              client: "Client O",
              representative: "Mia Platinum",
              registerDate: "2024-06-08",
              actualRevenue: 5000,
            },
            {
              srNo: "3",
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
          revenue: 18264,
          clients: [
            {
              srNo: "1",
              client: "Client Q",
              representative: "Olivia Rose",
              registerDate: "2024-01-30",
              actualRevenue: 7000,
            },
            {
              srNo: "2",
              client: "Client R",
              representative: "Peter Brown",
              registerDate: "2024-02-18",
              actualRevenue: 6000,
            },
            {
              srNo: "3",
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
              srNo: "1",
              client: "Client T",
              representative: "Rachel Violet",
              registerDate: "2024-04-12",
              actualRevenue: 5000,
            },
            {
              srNo: "2",
              client: "Client U",
              representative: "Sam Indigo",
              registerDate: "2024-05-07",
              actualRevenue: 5000,
            },
          ],
        },
        {
          name: "Co-Living",
          revenue: 13586,
          clients: [
            {
              srNo: "1",
              client: "Client V",
              representative: "Tina Lilac",
              registerDate: "2024-06-05",
              actualRevenue: 6000,
            },
            {
              srNo: "2",
              client: "Client W",
              representative: "Umar Yellow",
              registerDate: "2024-07-08",
              actualRevenue: 4000,
            },
            {
              srNo: "3",
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
              srNo: "1",
              client: "Client Y",
              representative: "Wendy Red",
              registerDate: "2024-03-10",
              actualRevenue: 8000,
            },
            {
              srNo: "2",
              client: "Client Z",
              representative: "Xavier Green",
              registerDate: "2024-04-14",
              actualRevenue: 7000,
            },
            {
              srNo: "3",
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
              srNo: "1",
              client: "Client AB",
              representative: "Zane Orange",
              registerDate: "2024-06-20",
              actualRevenue: 6000,
            },
            {
              srNo: "2",
              client: "Client AC",
              representative: "Adam Gray",
              registerDate: "2024-07-10",
              actualRevenue: 5000,
            },
          ],
        },
        {
          name: "Co-Living",
          revenue: 16468,
          clients: [
            {
              srNo: "1",
              client: "Client AD",
              representative: "Betty Silver",
              registerDate: "2024-08-25",
              actualRevenue: 7000,
            },
            {
              srNo: "2",
              client: "Client AE",
              representative: "Charlie Platinum",
              registerDate: "2024-09-14",
              actualRevenue: 6000,
            },
            {
              srNo: "3",
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
    yaxis: { title: { text: "Revenue (in Rupees)" } },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "30%", borderRadius: 5 },
    },
    legend: { position: "top" },
    // colors: ["#1E3D73"],
    colors: ["#1E3D73"],
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Month Selection Dropdown */}
      <div className="mb-4">
        <FormControl size="small">
          <InputLabel>Select Month</InputLabel>
          <Select
            value={selectedMonth}
            onChange={handleMonthChange}
            sx={{ width: "200px" }}
            label="Select Month"
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
      <WidgetSection
        layout={1}
        border
        padding
        title={"Vertical-wise Revenue Targets"}
        titleLabel={dayjs().format("MMMM YYYY") }
        TitleAmount={"Total INR 6,80,000"}
      >
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
                id={`panel-${index}-header`}
                className="border-b-[1px] border-borderGray"
              >
                <div className="flex justify-between items-center w-full px-4">
                  <span className="text-subtitle font-pmedium">
                    {domain.name}
                  </span>
                  <span className="text-subtitle font-pmedium">
                    {domain.revenue.toLocaleString()} INR
                  </span>
                </div>
              </AccordionSummary>
              <AccordionDetails sx={{ borderTop: "1px solid  #d1d5db" }}>
                <AgTable
                  data={domain.clients}
                  hideFilter
                  columns={[
                    { header: "Sr.No", field: "srNo", flex: 1 },
                    { header: "Client Name", field: "client", flex: 1 },
                    {
                      header: "Representative",
                      field: "representative",
                      flex: 1,
                    },
                    { header: "End Of Tenure", field: "registerDate", flex: 1 },
                    {
                      header: "Target Revenue",
                      field: "actualRevenue",
                      flex: 1,
                    },
                  ]}
                  tableHeight={300}
                />
                <span className="block mt-2 font-medium">
                  Total Revenue for {domain.name}: ₹
                  {domain.revenue.toLocaleString()}
                </span>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </div>
    </div>
  );
};

export default RevenueTarget;
