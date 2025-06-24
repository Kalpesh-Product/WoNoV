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
import PageFrame from "../../../../components/Pages/PageFrame";

const FrontendLeads = () => {
  const axios = useAxiosPrivate();
  const { data: revenueData = [], isPending: isRevenuePending } = useQuery({
    queryKey: ["revenueData"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/sales/fetch-revenues");
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
          revenue: 9,
          clients: [
            {
              srNo: 1,
              date: "01-04-2025",
              time: "10:00 AM",
              name: "Aarav Thakur",
              phone: "9811208753",
              status: "Pending",
            },
            {
              srNo: 2,
              date: "02-04-2025",
              time: "02:30 PM",
              name: "Bhavna Joshi",
              phone: "9487337194",
              status: "Follow-up",
            },
            {
              srNo: 3,
              date: "03-04-2025",
              time: "09:15 AM",
              name: "Chetan Rawal",
              phone: "9828899290",
              status: "Pending",
            },
            {
              srNo: 4,
              date: "04-04-2025",
              time: "11:45 AM",
              name: "Divya Saini",
              phone: "9751382616",
              status: "Follow-up",
            },
            {
              srNo: 5,
              date: "05-04-2025",
              time: "03:00 PM",
              name: "Eshan Dubey",
              phone: "9894331626",
              status: "Pending",
            },
            {
              srNo: 6,
              date: "06-04-2025",
              time: "01:30 PM",
              name: "Falguni Mehra",
              phone: "9741777376",
              status: "Follow-up",
            },
            {
              srNo: 7,
              date: "07-04-2025",
              time: "12:15 PM",
              name: "Gaurav Kulkarni",
              phone: "9837373505",
              status: "Pending",
            },
            {
              srNo: 8,
              date: "08-04-2025",
              time: "04:00 PM",
              name: "Hina Parmar",
              phone: "9404873976",
              status: "Follow-up",
            },
            {
              srNo: 9,
              date: "09-04-2025",
              time: "10:45 AM",
              name: "Ishaan Vyas",
              phone: "9487337194",
              status: "Pending",
            },
          ],
        },
        {
          name: "Workation",
          revenue: 9,
          clients: [
            {
              srNo: 1,
              date: "01-04-2025",
              time: "11:00 AM",
              name: "Kiran Bedi",
              phone: "9487337194",
              status: "Pending",
            },
            {
              srNo: 2,
              date: "02-04-2025",
              time: "03:30 PM",
              name: "Lalit Shukla",
              phone: "9828899290",
              status: "Follow-up",
            },
            {
              srNo: 3,
              date: "03-04-2025",
              time: "09:45 AM",
              name: "Meera Nair",
              phone: "9404873976",
              status: "Pending",
            },
            {
              srNo: 4,
              date: "04-04-2025",
              time: "01:15 PM",
              name: "Nitin Garg",
              phone: "9894331626",
              status: "Follow-up",
            },
            {
              srNo: 5,
              date: "05-04-2025",
              time: "10:30 AM",
              name: "Ojasvi Rana",
              phone: "9751382616",
              status: "Pending",
            },
            {
              srNo: 6,
              date: "06-04-2025",
              time: "02:45 PM",
              name: "Poonam Desai",
              phone: "9741777376",
              status: "Follow-up",
            },
            {
              srNo: 7,
              date: "07-04-2025",
              time: "12:00 PM",
              name: "Qadir Khan",
              phone: "9837373505",
              status: "Pending",
            },
            {
              srNo: 8,
              date: "08-04-2025",
              time: "04:30 PM",
              name: "Rhea Malhotra",
              phone: "9811208753",
              status: "Follow-up",
            },
          ],
        },
        {
          name: "Meetings",
          revenue: 10,
          clients: [
            {
              srNo: 1,
              date: "01-04-2025",
              time: "12:30 PM",
              name: "Umesh Yadav",
              phone: "9751382616",
              status: "Pending",
            },
            {
              srNo: 2,
              date: "02-04-2025",
              time: "04:15 PM",
              name: "Vandana Sethi",
              phone: "9837373505",
              status: "Follow-up",
            },
            {
              srNo: 3,
              date: "03-04-2025",
              time: "10:15 AM",
              name: "Waseem Ali",
              phone: "9828899290",
              status: "Pending",
            },
            {
              srNo: 4,
              date: "04-04-2025",
              time: "02:00 PM",
              name: "Xena Gupta",
              phone: "9487337194",
              status: "Follow-up",
            },
            {
              srNo: 5,
              date: "05-04-2025",
              time: "11:30 AM",
              name: "Yashwant Rao",
              phone: "9894331626",
              status: "Pending",
            },
            {
              srNo: 6,
              date: "06-04-2025",
              time: "03:45 PM",
              name: "Zara Sheikh",
              phone: "9741777376",
              status: "Follow-up",
            },
            {
              srNo: 7,
              date: "07-04-2025",
              time: "01:00 PM",
              name: "Aditi Pathak",
              phone: "9404873976",
              status: "Pending",
            },
            {
              srNo: 8,
              date: "08-04-2025",
              time: "05:00 PM",
              name: "Bhuvan Chawla",
              phone: "9811208753",
              status: "Follow-up",
            },
            {
              srNo: 9,
              date: "09-04-2025",
              time: "12:45 PM",
              name: "Chitra Bose",
              phone: "9751382616",
              status: "Pending",
            },
            {
              srNo: 10,
              date: "10-04-2025",
              time: "04:30 PM",
              name: "Dhruv Menon",
              phone: "9837373505",
              status: "Follow-up",
            },
          ],
        },
        {
          name: "Virtual Office",
          revenue: 8,
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
          ].map((client) => ({
            ...client,
            date: client.date.split("-").reverse().join("-"), // Convert YYYY-MM-DD to DD-MM-YYYY
          })),
        },
        {
          name: "Co-Living",
          revenue: 10,
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
          ].map((client) => ({
            ...client,
            date: client.date.split("-").reverse().join("-"), // Convert YYYY-MM-DD to DD-MM-YYYY
          })),
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
    colors: ["#54C4A7", "#EB5C45"],
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

  return (
    <div className="flex flex-col gap-8">
      <PageFrame>
        <div>
          {/* Accordion Section for Domain-wise Revenue Breakdown */}
          <div className="flex flex-col gap-4 justify-between">
            <span className="font-pmedium text-title text-primary">
              New Leads - April 2025
            </span>
            <hr />
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
                        {/* {domain.revenue.toLocaleString()} Leads */}
                      </span>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails sx={{ borderTop: "1px solid  #d1d5db" }}>
                    <AgTable
                      data={[]}
                      hideFilter
                      columns={[
                        { header: "Sr. No.", field: "srNo", flex: 0.5 },
                        { header: "Date", field: "date", flex: 1 },
                        { header: "Time", field: "time", flex: 1 },
                        { header: "Name", field: "name", flex: 1 },
                        { header: "Phone No.", field: "phone", flex: 1 },
                        { header: "Status", field: "status", flex: 1 },
                      ]}
                      tableHeight={400}
                    />
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </div>
        </div>
      </PageFrame>
    </div>
  );
};

export default FrontendLeads;
