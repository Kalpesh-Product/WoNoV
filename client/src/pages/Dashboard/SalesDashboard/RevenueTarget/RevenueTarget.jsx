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
import { inrFormat } from "../../../../utils/currencyFormat";

const RevenueTarget = () => {
  const mockBusinessRevenueData = [
    {
      month: "April",
      domains: [
        {
          name: "Co-Working",
          revenue: 12568000,
          clients: [
            {
              srNo: "1",
              client: "Zomato",
              representative: "Dipiksha Gawas",
              registerDate: "2024-01-15",
              actualRevenue: inrFormat(540000),
            },
            {
              srNo: "2",
              client: "Lancesoft",
              representative: "Samarth Wagrekar",
              registerDate: "2024-02-10",
              actualRevenue: inrFormat(403000),
            },
            {
              srNo: "3",
              client: "Zimetrics",
              representative: "Shrey Vernaker",
              registerDate: "2024-03-05",
              actualRevenue: inrFormat(306000),
            },
          ],
        },
        {
          name: "Workation",
          revenue: 8363000,
          clients: [
            {
              srNo: "1",
              client: "Turtlemint",
              representative: "Bob Brown",
              registerDate: "2024-01-20",
              actualRevenue: inrFormat(480040),
            },
            {
              srNo: "2",
              client: "Infuse",
              representative: "Charlie White",
              registerDate: "2024-02-25",
              actualRevenue: inrFormat(780076),
            },
            {
              srNo: "3",
              client: "91HR",
              representative: "Charlie White",
              registerDate: "2024-02-25",
              actualRevenue: inrFormat(345600),
            },

          ],
        },
        {
          name: "Meetings",
          revenue: 15784000,
          clients: [
            {
              srNo: "4",
              client: "Capillary",
              representative: "Diana Prince",
              registerDate: "2024-03-18",
              actualRevenue: inrFormat(725000),
            },
            {
              srNo: "5",
              client: "CredAble",
              representative: "Bruce Wayne",
              registerDate: "2024-04-02",
              actualRevenue: inrFormat(890000),
            },
            {
              srNo: "6",
              client: "FarEye",
              representative: "Clark Kent",
              registerDate: "2024-04-10",
              actualRevenue: inrFormat(615000),
            },

          ],
        },
        {
          name: "Virtual Office",
          revenue: 14638000,
          clients: [
            {
              srNo: "7",
              client: "Yellow.ai",
              representative: "Peter Hoffman",
              registerDate: "2024-04-12",
              actualRevenue: inrFormat(760000),
            },
            {
              srNo: "8",
              client: "Ninjacart",
              representative: "Tony Perez",
              registerDate: "2024-04-14",
              actualRevenue: inrFormat(925000),
            },
            {
              srNo: "9",
              client: "Porter",
              representative: "Natasha Malik",
              registerDate: "2024-04-13",
              actualRevenue: inrFormat(830000),
            },

          ],
        },
        {
          name: "Other Channels",
          revenue: 12647000,
          clients: [
            {
              srNo: "10",
              client: "Delhivery",
              representative: "Steve Pascal",
              registerDate: "2024-04-15",
              actualRevenue: inrFormat(980000),
            },
            {
              srNo: "11",
              client: "Moglix",
              representative: "Melissa Barera",
              registerDate: "2024-04-16",
              actualRevenue: inrFormat(645000),
            },
            {
              srNo: "12",
              client: "Razorpay",
              representative: "Stephen Gomez",
              registerDate: "2024-04-17",
              actualRevenue: inrFormat(715000),
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
          revenue: 156540,
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
          revenue: 97950,
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
          revenue: 140000,
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
          revenue: 182640,
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
          revenue: 100000,
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
          revenue: 135860,
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
          revenue: 200000,
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
          revenue: 110000,
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
          revenue: 164680,
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
    chart: { type: "bar", toolbar: false, stacked: false, fontFamily: "Poppins-Regular" },
    xaxis: {
      categories: selectedMonthData.domains.map((domain) => domain.name),
    },
    yaxis: {
      title: { text: "Revenue (INR)" },
      labels: {
        formatter: (value) => `INR ${value.toLocaleString("en-IN")}`
      }
    },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "30%", borderRadius: 5 },
    },
    legend: { position: "top" },
    // colors: ["#1E3D73"],
    colors: ["#1E3D73"],
  };

  return (
    <div className="py-4 flex flex-col gap-4">
      {/* Month Selection Dropdown */}
      <div className="mb-4">
        <FormControl size="small">
          <InputLabel>Select Month</InputLabel>
          <Select
            value={selectedMonth}
            onChange={handleMonthChange}
            sx={{ width: "200px" }}
            label="Select Month">
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
        titleLabel={dayjs().format("MMMM YYYY")}
        TitleAmount={`INR ${inrFormat("6800000")}`}>
        <BarGraph data={graphData} options={options} height={400} />
      </WidgetSection>

      {/* Accordion Section for Domain-wise Revenue Breakdown */}
      <div className="flex flex-col gap-2 border-default border-borderGray rounded-md p-4">
      <div className="px-4 py-2 border-b-[1px] border-borderGray bg-gray-50">
          <div className="flex justify-between items-center w-full px-4 py-2">
            <span className=" text-sm text-muted font-pmedium text-title">
              VERTICAL
            </span>
            <span className="px-8 text-sm text-muted font-pmedium text-title flex items-center gap-1">
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
                id={`panel-${index}-header`}
                className="border-b-[1px] border-borderGray">
                <div className="flex justify-between items-center w-full px-4">
                  <span className="text-subtitle font-pmedium">
                    {domain.name}
                  </span>
                  <span className="text-subtitle font-pmedium">
                  INR {domain.revenue.toLocaleString()} 
                  </span>
                </div>
              </AccordionSummary>
              <AccordionDetails sx={{ borderTop: "1px solid  #d1d5db" }}>
                <AgTable
                  data={domain.clients.map((client,index) => ({
                                    ...client,
                                    registerDate: dayjs(client.registerDate).format("DD-MM-YYYY"),
                                    srNo:index+1
                                  }))}
                  hideFilter
                  columns={[
                    { headerName: "Sr No", field: "srNo", flex: 1 },
                    { headerName: "Client", field: "client", flex: 1 },
                    {
                      headerName: "Representative",
                      field: "representative",
                      flex: 1,
                    },
                    { headerName: "Register Date", field: "registerDate", flex: 1 },
                    {
                      headerName: "Actual Revenue (INR)",
                      field: "actualRevenue",
                      flex: 1,
                    },
                  ]}
                  tableHeight={300}
                />
                
                <span className="text-primary font-pregular">
                      Total Revenue for {domain.name}:{" "}
                    </span>
                    <span className="text-black font-pmedium">
                      INR&nbsp;{domain.revenue.toLocaleString("en-IN")}
                    </span>{" "}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </div>
    </div>
  );
};

export default RevenueTarget;
