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
  Chip,
} from "@mui/material";
import { IoIosArrowDown } from "react-icons/io";
import AgTable from "../../../../components/AgTable";
import WidgetSection from "../../../../components/WidgetSection";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";

const FrontendLeads = () => {
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
      month: "April",
      domains: [
        {
          name: "Co-Working",
          revenue: 12,
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
          name: "Workation",
          revenue: 83,
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
          name: "Meetings",
          revenue: 17,
          clients: [
            { client: "Client F", revenue: 5000 },
            { client: "Client G", revenue: 7000 },
            { client: "Client H", revenue: 3000 },
          ],
        },
        {
          name: "Virtual Office",
          revenue: 14,
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
          name: "Other Channels",
          revenue: 13,
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
          revenue: 15654,
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
          revenue: 9795,
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
          revenue: 13,
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
          revenue: 24,
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
          revenue: 14,
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
          revenue: 23,
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
          revenue: 13,
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
          revenue: 34,
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
    yaxis: { title: { text: "Revenue (in Rupees)" } },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "30%", borderRadius: 5 },
    },
    legend: { position: "top" },
    colors: ["#80bf01"],
  };

  const leadsColumn = [
    { field: "enquiryFor", headerName: "Enquiry For" },
    {
      field: "date",
      headerName: "Date",
    },
    { field: "time", headerName: "Time" },
    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params) => {
        const statusColorMap = {
          Called: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
          Pending: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
        };
        const { backgroundColor, color } = statusColorMap[params.value] || {
          backgroundColor: "gray",
          color: "white",
        };
        return (
          <>
            <Chip
              label={params.value}
              style={{
                backgroundColor,
                color,
              }}
            />
          </>
        );
      },
    },
    { field: "name", headerName: "Name" },
    { field: "phoneNo", headerName: "Phone No" },
    { field: "email", headerName: "Email" },
  ];

  const rows = [
    {
      id: 1,
      enquiryFor: "Co-working",
      date: "2025-01-01",
      time: "10:00 AM",
      status: "Called",
      name: "Aiwinraj",
      phoneNo: "12345",
      email: "aiwin@email.com",
    },
    {
      id: 1,
      enquiryFor: "Workations",
      date: "2025-02-01",
      time: "09:15 AM",
      status: "Pending",
      name: "Alice Johnson",
      phoneNo: "555-123-4567",
      email: "alice.johnson@example.com",
    },
    {
      id: 2,
      enquiryFor: "Meeting Room",
      date: "2025-02-02",
      time: "11:30 AM",
      status: "Called",
      name: "Bob Smith",
      phoneNo: "555-234-5678",
      email: "bob.smith@example.com",
    },
    {
      id: 3,
      enquiryFor: "Virtual Office",
      date: "2025-02-03",
      time: "02:45 PM",
      status: "Called",
      name: "Carol Lee",
      phoneNo: "555-345-6789",
      email: "carol.lee@example.com",
    },
    {
      id: 4,
      enquiryFor: "Co-Living",
      date: "2025-02-04",
      time: "10:00 AM",
      status: "Pending",
      name: "David Brown",
      phoneNo: "555-456-7890",
      email: "david.brown@example.com",
    },
    {
      id: 5,
      enquiryFor: "Warranty Inquiry",
      date: "2025-02-05",
      time: "03:30 PM",
      status: "Called",
      name: "Eva Green",
      phoneNo: "555-567-8901",
      email: "eva.green@example.com",
    },
    {
      id: 6,
      enquiryFor: "Feedback Submission",
      date: "2025-02-06",
      time: "01:20 PM",
      status: "Called",
      name: "Frank White",
      phoneNo: "555-678-9012",
      email: "frank.white@example.com",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* <div>
        <AgTable
          search={true}
          searchColumn={"Name"}
          tableTitle={""}
          data={rows}
          columns={leadsColumn}
        />
      </div> */}
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
                    {domain.revenue.toLocaleString()}
                  </span>
                </div>
              </AccordionSummary>
              <AccordionDetails sx={{ borderTop: "1px solid  #d1d5db" }}>
                <AgTable
                  data={domain.clients}
                  hideFilter
                  columns={[
                    { header: "Client", field: "client", flex: 1 },
                    {
                      header: "Representative",
                      field: "representative",
                      flex: 1,
                    },
                    {
                      header: "Register Date",
                      field: "registerDate",
                      flex: 1,
                    },
                    {
                      header: "Status",
                      field: "actualRevenue",
                      flex: 1,
                    },
                  ]}
                  tableHeight={300}
                />
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-4">
                    <span className="text-primary font-pregular">
                      {/* Total Revenue for {domain.name}:{" "} */}
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

export default FrontendLeads;
