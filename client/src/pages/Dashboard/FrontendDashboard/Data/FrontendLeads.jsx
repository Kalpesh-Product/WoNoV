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
  // const mockBusinessRevenueData = [
  //   {
  //     month: "April",
  //     domains: [
  //       {
  //         name: "Co-Working",
  //         revenue: 12,
  //         clients: [
  //           {
  //             client: "Zomato",
  //             representative: "John Doe",
  //             registerDate: "2024-01-15",
  //             actualRevenue: 5000,
  //           },
  //           {
  //             client: "Uber",
  //             representative: "Jane Smith",
  //             registerDate: "2024-02-10",
  //             actualRevenue: 4000,
  //           },
  //           {
  //             client: "Ola",
  //             representative: "Alice Johnson",
  //             registerDate: "2024-03-05",
  //             actualRevenue: 3000,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Workation",
  //         revenue: 83,
  //         clients: [
  //           {
  //             client: "Client D",
  //             representative: "Bob Brown",
  //             registerDate: "2024-01-20",
  //             actualRevenue: 4000,
  //           },
  //           {
  //             client: "Client E",
  //             representative: "Charlie White",
  //             registerDate: "2024-02-25",
  //             actualRevenue: 4000,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Meetings",
  //         revenue: 17,
  //         clients: [
  //           { client: "Client F", revenue: 5000 },
  //           { client: "Client G", revenue: 7000 },
  //           { client: "Client H", revenue: 3000 },
  //         ],
  //       },
  //       {
  //         name: "Virtual Office",
  //         revenue: 14,
  //         clients: [
  //           {
  //             client: "Client F",
  //             representative: "Daniel Green",
  //             registerDate: "2024-03-12",
  //             actualRevenue: 5000,
  //           },
  //           {
  //             client: "Client G",
  //             representative: "Eva Black",
  //             registerDate: "2024-04-18",
  //             actualRevenue: 7000,
  //           },
  //           {
  //             client: "Client H",
  //             representative: "Frank Blue",
  //             registerDate: "2024-05-10",
  //             actualRevenue: 3000,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Other Channels",
  //         revenue: 13,
  //         clients: [
  //           {
  //             client: "Client F",
  //             representative: "Daniel Green",
  //             registerDate: "2024-03-12",
  //             actualRevenue: 5000,
  //           },
  //           {
  //             client: "Client G",
  //             representative: "Eva Black",
  //             registerDate: "2024-04-18",
  //             actualRevenue: 7000,
  //           },
  //           {
  //             client: "Client H",
  //             representative: "Frank Blue",
  //             registerDate: "2024-05-10",
  //             actualRevenue: 3000,
  //           },
  //         ],
  //       },
  //     ],
  //   },
  //   {
  //     month: "May",
  //     domains: [
  //       {
  //         name: "Co-Working",
  //         revenue: 15654,
  //         clients: [
  //           {
  //             client: "Client I",
  //             representative: "Grace Orange",
  //             registerDate: "2024-02-11",
  //             actualRevenue: 6000,
  //           },
  //           {
  //             client: "Client J",
  //             representative: "Hank Purple",
  //             registerDate: "2024-03-09",
  //             actualRevenue: 5000,
  //           },
  //           {
  //             client: "Client K",
  //             representative: "Isabel Cyan",
  //             registerDate: "2024-04-14",
  //             actualRevenue: 4000,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Workation",
  //         revenue: 9795,
  //         clients: [
  //           {
  //             client: "Client L",
  //             representative: "Jack Gray",
  //             registerDate: "2024-02-28",
  //             actualRevenue: 5000,
  //           },
  //           {
  //             client: "Client M",
  //             representative: "Kara Silver",
  //             registerDate: "2024-03-07",
  //             actualRevenue: 4000,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Co-Living",
  //         revenue: 14000,
  //         clients: [
  //           {
  //             client: "Client N",
  //             representative: "Leo Gold",
  //             registerDate: "2024-05-20",
  //             actualRevenue: 6000,
  //           },
  //           {
  //             client: "Client O",
  //             representative: "Mia Platinum",
  //             registerDate: "2024-06-08",
  //             actualRevenue: 5000,
  //           },
  //           {
  //             client: "Client P",
  //             representative: "Noah Bronze",
  //             registerDate: "2024-07-15",
  //             actualRevenue: 3000,
  //           },
  //         ],
  //       },
  //     ],
  //   },
  //   {
  //     month: "June",
  //     domains: [
  //       {
  //         name: "Co-Working",
  //         revenue: 13,
  //         clients: [
  //           {
  //             client: "Client Q",
  //             representative: "Olivia Rose",
  //             registerDate: "2024-01-30",
  //             actualRevenue: 7000,
  //           },
  //           {
  //             client: "Client R",
  //             representative: "Peter Brown",
  //             registerDate: "2024-02-18",
  //             actualRevenue: 6000,
  //           },
  //           {
  //             client: "Client S",
  //             representative: "Quincy Black",
  //             registerDate: "2024-03-26",
  //             actualRevenue: 5000,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Workation",
  //         revenue: 24,
  //         clients: [
  //           {
  //             client: "Client T",
  //             representative: "Rachel Violet",
  //             registerDate: "2024-04-12",
  //             actualRevenue: 5000,
  //           },
  //           {
  //             client: "Client U",
  //             representative: "Sam Indigo",
  //             registerDate: "2024-05-07",
  //             actualRevenue: 5000,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Co-Living",
  //         revenue: 14,
  //         clients: [
  //           {
  //             client: "Client V",
  //             representative: "Tina Lilac",
  //             registerDate: "2024-06-05",
  //             actualRevenue: 6000,
  //           },
  //           {
  //             client: "Client W",
  //             representative: "Umar Yellow",
  //             registerDate: "2024-07-08",
  //             actualRevenue: 4000,
  //           },
  //           {
  //             client: "Client X",
  //             representative: "Victor Pink",
  //             registerDate: "2024-08-15",
  //             actualRevenue: 3000,
  //           },
  //         ],
  //       },
  //     ],
  //   },
  //   {
  //     month: "July",
  //     domains: [
  //       {
  //         name: "Co-Working",
  //         revenue: 23,
  //         clients: [
  //           {
  //             client: "Client Y",
  //             representative: "Wendy Red",
  //             registerDate: "2024-03-10",
  //             actualRevenue: 8000,
  //           },
  //           {
  //             client: "Client Z",
  //             representative: "Xavier Green",
  //             registerDate: "2024-04-14",
  //             actualRevenue: 7000,
  //           },
  //           {
  //             client: "Client AA",
  //             representative: "Yara Blue",
  //             registerDate: "2024-05-16",
  //             actualRevenue: 5000,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Workation",
  //         revenue: 13,
  //         clients: [
  //           {
  //             client: "Client AB",
  //             representative: "Zane Orange",
  //             registerDate: "2024-06-20",
  //             actualRevenue: 6000,
  //           },
  //           {
  //             client: "Client AC",
  //             representative: "Adam Gray",
  //             registerDate: "2024-07-10",
  //             actualRevenue: 5000,
  //           },
  //         ],
  //       },
  //       {
  //         name: "Co-Living",
  //         revenue: 34,
  //         clients: [
  //           {
  //             client: "Client AD",
  //             representative: "Betty Silver",
  //             registerDate: "2024-08-25",
  //             actualRevenue: 7000,
  //           },
  //           {
  //             client: "Client AE",
  //             representative: "Charlie Platinum",
  //             registerDate: "2024-09-14",
  //             actualRevenue: 6000,
  //           },
  //           {
  //             client: "Client AF",
  //             representative: "David Bronze",
  //             registerDate: "2024-10-05",
  //             actualRevenue: 3000,
  //           },
  //         ],
  //       },
  //     ],
  //   },
  // ];

  const mockBusinessRevenueData = [
    {
      month: "April",
      domains: [
        {
          name: "Co-Working",
          revenue: 19,
          clients: [
            {
              srNo: 1,
              date: "2025-04-01",
              time: "10:00",
              name: "Aarav Thakur",
              phone: "9811208753",
              status: "Pending",
            },
            {
              srNo: 2,
              date: "2025-04-02",
              time: "14:30",
              name: "Bhavna Joshi",
              phone: "9487337194",
              status: "Follow-up",
            },
            {
              srNo: 3,
              date: "2025-04-03",
              time: "09:15",
              name: "Chetan Rawal",
              phone: "9828899290",
              status: "Pending",
            },
            {
              srNo: 4,
              date: "2025-04-04",
              time: "11:45",
              name: "Divya Saini",
              phone: "9751382616",
              status: "Follow-up",
            },
            {
              srNo: 5,
              date: "2025-04-05",
              time: "15:00",
              name: "Eshan Dubey",
              phone: "9894331626",
              status: "Pending",
            },
            {
              srNo: 6,
              date: "2025-04-06",
              time: "13:30",
              name: "Falguni Mehra",
              phone: "9741777376",
              status: "Follow-up",
            },
            {
              srNo: 7,
              date: "2025-04-07",
              time: "12:15",
              name: "Gaurav Kulkarni",
              phone: "9837373505",
              status: "Pending",
            },
            {
              srNo: 8,
              date: "2025-04-08",
              time: "16:00",
              name: "Hina Parmar",
              phone: "9404873976",
              status: "Follow-up",
            },
            {
              srNo: 9,
              date: "2025-04-09",
              time: "10:45",
              name: "Ishaan Vyas",
              phone: "9487337194",
              status: "Pending",
            },
            {
              srNo: 10,
              date: "2025-04-10",
              time: "14:15",
              name: "Jaya Sen",
              phone: "9811208753",
              status: "Follow-up",
            },
          ],
        },
        {
          name: "Workation",
          revenue: 8,
          clients: [
            {
              srNo: 1,
              date: "2025-04-01",
              time: "11:00",
              name: "Kiran Bedi",
              phone: "9487337194",
              status: "Pending",
            },
            {
              srNo: 2,
              date: "2025-04-02",
              time: "15:30",
              name: "Lalit Shukla",
              phone: "9828899290",
              status: "Follow-up",
            },
            {
              srNo: 3,
              date: "2025-04-03",
              time: "09:45",
              name: "Meera Nair",
              phone: "9404873976",
              status: "Pending",
            },
            {
              srNo: 4,
              date: "2025-04-04",
              time: "13:15",
              name: "Nitin Garg",
              phone: "9894331626",
              status: "Follow-up",
            },
            {
              srNo: 5,
              date: "2025-04-05",
              time: "10:30",
              name: "Ojasvi Rana",
              phone: "9751382616",
              status: "Pending",
            },
            {
              srNo: 6,
              date: "2025-04-06",
              time: "14:45",
              name: "Poonam Desai",
              phone: "9741777376",
              status: "Follow-up",
            },
            {
              srNo: 7,
              date: "2025-04-07",
              time: "12:00",
              name: "Qadir Khan",
              phone: "9837373505",
              status: "Pending",
            },
            {
              srNo: 8,
              date: "2025-04-08",
              time: "16:30",
              name: "Rhea Malhotra",
              phone: "9811208753",
              status: "Follow-up",
            },
            {
              srNo: 9,
              date: "2025-04-09",
              time: "11:15",
              name: "Sachin Tomar",
              phone: "9487337194",
              status: "Pending",
            },
            {
              srNo: 10,
              date: "2025-04-10",
              time: "15:00",
              name: "Tanvi Arora",
              phone: "9828899290",
              status: "Follow-up",
            },
          ],
        },
        {
          name: "Meetings",
          revenue: 14,
          clients: [
            {
              srNo: 1,
              date: "2025-04-01",
              time: "12:30",
              name: "Umesh Yadav",
              phone: "9751382616",
              status: "Pending",
            },
            {
              srNo: 2,
              date: "2025-04-02",
              time: "16:15",
              name: "Vandana Sethi",
              phone: "9837373505",
              status: "Follow-up",
            },
            {
              srNo: 3,
              date: "2025-04-03",
              time: "10:15",
              name: "Waseem Ali",
              phone: "9828899290",
              status: "Pending",
            },
            {
              srNo: 4,
              date: "2025-04-04",
              time: "14:00",
              name: "Xena Gupta",
              phone: "9487337194",
              status: "Follow-up",
            },
            {
              srNo: 5,
              date: "2025-04-05",
              time: "11:30",
              name: "Yashwant Rao",
              phone: "9894331626",
              status: "Pending",
            },
            {
              srNo: 6,
              date: "2025-04-06",
              time: "15:45",
              name: "Zara Sheikh",
              phone: "9741777376",
              status: "Follow-up",
            },
            {
              srNo: 7,
              date: "2025-04-07",
              time: "13:00",
              name: "Aditi Pathak",
              phone: "9404873976",
              status: "Pending",
            },
            {
              srNo: 8,
              date: "2025-04-08",
              time: "17:00",
              name: "Bhuvan Chawla",
              phone: "9811208753",
              status: "Follow-up",
            },
            {
              srNo: 9,
              date: "2025-04-09",
              time: "12:45",
              name: "Chitra Bose",
              phone: "9751382616",
              status: "Pending",
            },
            {
              srNo: 10,
              date: "2025-04-10",
              time: "16:30",
              name: "Dhruv Menon",
              phone: "9837373505",
              status: "Follow-up",
            },
          ],
        },
        {
          name: "Virtual Office",
          revenue: 21,
          clients: [
            {
              srNo: 1,
              date: "2025-04-01",
              time: "13:45",
              name: "Esha Trivedi",
              phone: "9751382616",
              status: "Pending",
            },
            {
              srNo: 2,
              date: "2025-04-02",
              time: "17:30",
              name: "Farooq Siddiqui",
              phone: "9741777376",
              status: "Follow-up",
            },
            {
              srNo: 3,
              date: "2025-04-03",
              time: "11:00",
              name: "Gitanjali Roy",
              phone: "9837373505",
              status: "Pending",
            },
            {
              srNo: 4,
              date: "2025-04-04",
              time: "15:15",
              name: "Harsh Vardhan",
              phone: "9487337194",
              status: "Follow-up",
            },
            {
              srNo: 5,
              date: "2025-04-05",
              time: "12:15",
              name: "Indira Kaul",
              phone: "9828899290",
              status: "Pending",
            },
            {
              srNo: 6,
              date: "2025-04-06",
              time: "16:45",
              name: "Jatin Puri",
              phone: "9894331626",
              status: "Follow-up",
            },
            {
              srNo: 7,
              date: "2025-04-07",
              time: "14:00",
              name: "Kavita Luthra",
              phone: "9404873976",
              status: "Pending",
            },
            {
              srNo: 8,
              date: "2025-04-08",
              time: "18:00",
              name: "Lakshmi Nair",
              phone: "9811208753",
              status: "Follow-up",
            },
            {
              srNo: 9,
              date: "2025-04-09",
              time: "13:30",
              name: "Manish Tandon",
              phone: "9751382616",
              status: "Pending",
            },
            {
              srNo: 10,
              date: "2025-04-10",
              time: "17:15",
              name: "Neelam Rathi",
              phone: "9741777376",
              status: "Follow-up",
            },
          ],
        },
        {
          name: "Co-Living",
          revenue: 17,
          clients: [
            {
              srNo: 1,
              date: "2025-04-01",
              time: "14:15",
              name: "Omkar Patil",
              phone: "9894331626",
              status: "Pending",
            },
            {
              srNo: 2,
              date: "2025-04-02",
              time: "18:30",
              name: "Pallavi Dutta",
              phone: "9487337194",
              status: "Follow-up",
            },
            {
              srNo: 3,
              date: "2025-04-03",
              time: "12:00",
              name: "Qasim Rizvi",
              phone: "9811208753",
              status: "Pending",
            },
            {
              srNo: 4,
              date: "2025-04-04",
              time: "16:30",
              name: "Rekha Sharma",
              phone: "9828899290",
              status: "Follow-up",
            },
            {
              srNo: 5,
              date: "2025-04-05",
              time: "13:15",
              name: "Siddhant Jain",
              phone: "9751382616",
              status: "Pending",
            },
            {
              srNo: 6,
              date: "2025-04-06",
              time: "17:45",
              name: "Tanya Kohli",
              phone: "9741777376",
              status: "Follow-up",
            },
            {
              srNo: 7,
              date: "2025-04-07",
              time: "15:00",
              name: "Ujjwal Das",
              phone: "9837373505",
              status: "Pending",
            },
            {
              srNo: 8,
              date: "2025-04-08",
              time: "19:00",
              name: "Vaishali More",
              phone: "9404873976",
              status: "Follow-up",
            },
            {
              srNo: 9,
              date: "2025-04-09",
              time: "14:45",
              name: "Yuvraj Singh",
              phone: "9487337194",
              status: "Pending",
            },
            {
              srNo: 10,
              date: "2025-04-10",
              time: "18:15",
              name: "Zoya Akhtar",
              phone: "9894331626",
              status: "Follow-up",
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
      <div className="flex items-center justify-between py-4">
        <span className="font-pmedium text-title text-primary">
          New Leads - April 2025
        </span>
        {/* <div className="flex items-center gap-4">
          {exportData ? (
            <PrimaryButton
              title={"Export"}
              handleSubmit={() => {
                if (gridRef.current) {
                  gridRef.current.api.exportDataAsCsv({
                    fileName: `${tableTitle || "table-data"}.csv`,
                  });
                }
              }}
            />
          ) : (
            ""
          )}
          {buttonTitle ? (
            <PrimaryButton title={buttonTitle} handleSubmit={handleClick} />
          ) : (
            ""
          )}
        </div> */}
      </div>
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
                  // columns={[
                  //   { header: "Client", field: "client", flex: 1 },
                  //   {
                  //     header: "Representative",
                  //     field: "representative",
                  //     flex: 1,
                  //   },
                  //   {
                  //     header: "Register Date",
                  //     field: "registerDate",
                  //     flex: 1,
                  //   },
                  //   {
                  //     header: "Status",
                  //     field: "actualRevenue",
                  //     flex: 1,
                  //   },
                  // ]}
                  columns={[
                    { header: "Sr. No.", field: "srNo", flex: 0.5 },
                    { header: "Date", field: "date", flex: 1 },
                    { header: "Time", field: "time", flex: 1 },
                    { header: "Name", field: "name", flex: 1 },
                    { header: "Phone No.", field: "phone", flex: 1 },
                    { header: "Status", field: "status", flex: 1 },
                  ]}
                  tableHeight={300}
                />
                {/* <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-4">
                    <span className="text-primary font-pregular">
                     
                    </span>
                    <span className="text-black font-pmedium">
                      ₹{domain.revenue.toLocaleString()}
                    </span>{" "}
                  </div>
                </div> */}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </div>
    </div>
  );
};

export default FrontendLeads;
