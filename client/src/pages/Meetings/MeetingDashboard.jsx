import { lazy, Suspense } from "react";
import { RiArchiveDrawerLine, RiPagesLine } from "react-icons/ri";
import { MdFormatListBulleted } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import Card from "../../components/Card";

import DataCard from "../../components/DataCard";
import MuiTable from "../../components/Tables/MuiTable";
import BarGraph from "../../components/graphs/BarGraph";
import PieChartMui from "../../components/graphs/PieChartMui";
import HeatMap from "../../components/graphs/HeatMap";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { Skeleton } from "@mui/material";
import { useNavigate } from "react-router-dom";
const WidgetSection = lazy(() => import("../../components/WidgetSection"));

const MeetingDashboard = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();

  const { data: meetingsData = [], isLoading } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const response = await axios.get("/api/meetings/get-meetings");
      return response.data;
    },
  });
  
  // Function to calculate total duration in hours
  const calculateTotalDurationInHours = (meetings) => {
    return meetings.reduce((total, meeting) => {
      // Extract the duration string (e.g., "30m", "1h", etc.)
      const durationStr = meeting.duration || "0m";

      // Parse the duration string using dayjs to extract minutes
      const minutes = parseDuration(durationStr);

      // Convert minutes to hours
      const hours = minutes / 60;

      return total + hours;
    }, 0);
  };

  // Function to parse duration like "30m", "1h", etc.
  const parseDuration = (durationStr) => {
    const regex = /(\d+)(m|h)/;
    const match = durationStr.match(regex);
    if (match) {
      const value = parseInt(match[1], 10);
      const unit = match[2];

      if (unit === "m") {
        return value; // Return minutes if 'm'
      } else if (unit === "h") {
        return value * 60; // Convert hours to minutes if 'h'
      }
    }

    return 0; // Default to 0 if no valid duration format is found
  };

  // Total duration in hours
  const totalDurationInHours = calculateTotalDurationInHours(meetingsData);
  // Fetch internal meetings
  const { data: meetingsInternal = [] } = useQuery({
    queryKey: ["meetingsInternal"],
    queryFn: async () => {
      const response = await axios.get(
        "/api/meetings/get-meetings-type?type=Internal"
      );

      return response.data;
    },
  });

  // Fetch external meetings
  const { data: meetingsExternal = [] } = useQuery({
    queryKey: ["meetingsExternal"],
    queryFn: async () => {
      const response = await axios.get(
        "/api/meetings/get-meetings-type?type=External"
      );
      return response.data;
    },
  });

  const meetingColumns = [
    { id: "id", label: "ID", align: "left" },
    { id: "roomName", label: "Meeting Rooms", align: "left" },
    { id: "unitName", label: "Location", align: "left" },
    { id: "endTime", label: "End Time", align: "left" },
  ];

  const externalGuestsData = [
    {
      name: "Guests Visited",
      data: [45, 32, 60, 75, 80, 55, 90, 20, 50, 40, 70, 85], // Sample guest count per month
    },
  ];

  const externalGuestsOptions = {
    chart: {
      type: "bar",
      fontFamily: "Poppins-Regular",
      toolbar: {
        show: false, // Hide toolbar for cleaner UI
      },
    },
    xaxis: {
      categories: [
        "Apr-24",
        "May-24",
        "Jun-24",
        "Jul-24",
        "Aug-24",
        "Sep-24",
        "Oct-24",
        "Nov-24",
        "Dec-24",
        "Jan-24",
        "Feb-24",
        "Mar-24",
      ],
      title: {
        text: "Financial Year Months",
      },
      labels: {
        style: {
          fontSize: "8px", // 👈 Set your desired font size here
          fontFamily: "Poppins-Regular", // Optional: ensure it matches your chart font
          colors: "#333", // Optional: label color
        },
      },
    },
    yaxis: {
      max: 100, // Maximum count on Y-axis
      title: {
        text: "Guest Count",
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "65%",
        borderRadius: 5,
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true, // Disable data labels for a cleaner look
      style: {
        fontSize: "12px",
        colors: ["#000"], // Set label color
      },
      offsetY: -22, // Adjust position slightly above the bars
    },
    colors: ["#08b6bc"], // Blue color bars
  };

  const meetings = [
    { meetingId: 1, meetingTime: "30min", mostUsedRoom: "Baga" },
    { meetingId: 2, meetingTime: "1hr", mostUsedRoom: "Baga" },
    { meetingId: 3, meetingTime: "30min", mostUsedRoom: "Aqua" },
    { meetingId: 4, meetingTime: "2hr", mostUsedRoom: "Baga" },
    { meetingId: 5, meetingTime: "1hr", mostUsedRoom: "Aqua" },
    { meetingId: 6, meetingTime: "30min", mostUsedRoom: "Lagoon" },
    { meetingId: 7, meetingTime: "2hr", mostUsedRoom: "Baga" },
    { meetingId: 8, meetingTime: "1hr", mostUsedRoom: "Lagoon" },
    { meetingId: 9, meetingTime: "1hr 30min", mostUsedRoom: "Lagoon" },
    { meetingId: 10, meetingTime: "1hr 30min", mostUsedRoom: "Lagoon" },
    { meetingId: 11, meetingTime: "3hr", mostUsedRoom: "Lagoon" },
    { meetingId: 11, meetingTime: "3hr", mostUsedRoom: "Lagoon" },
  ];

  // To check the number of times a meeting room is booked based on timings
  const durationCount = {};
  meetings.forEach((meeting) => {
    durationCount[meeting.meetingTime] =
      (durationCount[meeting.meetingTime] || 0) + 1;
  });

  // Convert to Pie Chart Data Format
  const meetingPieData = Object.entries(durationCount).map(([time, count]) => ({
    label: time,
    value: count,
  }));

  const meetingPieOptions = {
    chart: { fontFamily: "Poppins-Regular" },
    labels: meetingPieData.map((item) => item.label), // Show "30min", "1hr", etc. on the chart
    legend: {
      position: "right",
    },
    colors: [
      "#BBDEFB", // Light Blue (darker than before)
      "#90CAF9", // Soft Blue
      "#64B5F6", // Mild Blue
      "#42A5F5", // Medium Blue
      "#1E88E5", // Deep Blue
      "#1565C0", // Dark Blue
    ],
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(1)}%`, // Show percentage
      style: {
        fontSize: "12px",
        colors: ["#ffff"], // Ensure white text for better visibility
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} meetings`, // Tooltip: "X meetings"
      },
    },
  };

  //Room availabilty pie
  // Sample Room Data
  const availabilityRooms = [
    { roomID: 1, roomName: "Baga", status: "Available" },
    { roomID: 2, roomName: "Aqua", status: "Unavailable" },
    { roomID: 3, roomName: "Lagoon", status: "Available" },
    { roomID: 4, roomName: "Skyline", status: "Unavailable" },
    { roomID: 5, roomName: "Vista", status: "Available" },
    { roomID: 6, roomName: "Summit", status: "Unavailable" },
    { roomID: 7, roomName: "Horizon", status: "Available" },
  ];

  // 🔹 Process Data for Pie Chart
  const availableRooms = availabilityRooms.filter(
    (room) => room.status === "Available"
  );
  const unavailableRooms = availabilityRooms.filter(
    (room) => room.status === "Unavailable"
  );

  const RoomPieData = [
    { label: "Available", value: availableRooms.length },
    { label: "Unavailable", value: unavailableRooms.length },
  ];

  // 🔹 ApexCharts Options
  const RoomOptions = {
    chart: {
      fontFamily: "Poppins-Regular",
    },
    labels: RoomPieData.map((item) => item.label), // Labels: Available & Unavailable
    legend: { show: false }, // Hide default ApexCharts legend
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(1)}%`, // Show percentage
    },
    tooltip: {
      y: {
        formatter: (val, { seriesIndex }) =>
          `${RoomPieData[seriesIndex].label}: ${val} rooms`,
      },
    },
    colors: ["#28a745", "#dc3545"], // Green for Available, Red for Unavailable
  };

  // 🔹 Custom Legend Component
  const CustomLegend = (
    <div>
      <ul>
        {availabilityRooms
          .sort((a, b) => (a.status === "Available" ? -1 : 1)) // Sort Available rooms first
          .map((room, index) => (
            <li key={index} className="flex items-center mb-1">
              <span
                className="w-2 h-2 rounded-full mr-2"
                style={{
                  backgroundColor:
                    room.status === "Available" ? "#28a745" : "#dc3545",
                }}
              ></span>
              <span className="text-content text-gray-400">
                {room.roomName}
              </span>
            </li>
          ))}
      </ul>
    </div>
  );

  const BookingMonths = [
    "Jan-24",
    "Feb-24",
    "Mar-24",
    "Apr-24",
    "May-24",
    "Jun-24",
    "Jul-24",
    "Aug-24",
    "Sep-24",
    "Oct-24",
    "Nov-24",
    "Dec-24",
  ]

  // Example booked hours data per month
  const actualBookedHoursPerMonth = {
    Jan: 1500,
    Feb: 1600,
    Mar: 1750,
    Apr: 1300,
    May: 1400,
    Jun: 1550,
    Jul: 1650,
    Aug: 1700,
    Sep: 1800,
    Oct: 1900,
    Nov: 1850,
    Dec: 1950,
  };

  // Calculate percentage utilization
  const totalBookableHours = 1980;
  const data = Object.keys(actualBookedHoursPerMonth).map((month) => ({
    x: month,
    y: (actualBookedHoursPerMonth[month] / totalBookableHours) * 100,
  }));

  const averageBookingSeries = [{ name: "Booking Utilization", data }];

  const averageBookingOptions = {
    chart: { type: "bar", fontFamily: "Poppins-Regular",
      events: {
        dataPointSelection: function (event, chartContext, config) {
          const clickedMonthName = config.w.config.xaxis.categories[config.dataPointIndex];
          const monthIndex = new Date(`${clickedMonthName} 1, 2024`).getMonth();  
          console.log(clickedMonthName)
       
          const monthMeetings = meetingsData.filter(
            (meeting) => {
              new Date(meeting.date).getMonth()
            } 
          );
          console.log(monthMeetings)
      
          navigate("/app/meetings/month-meetings", {
            state: { meetings: monthMeetings, month: clickedMonthName },
          });
        }
      },
     },
    xaxis: { categories: BookingMonths },
    yaxis: {
      max: 100,
      title: { text: "Utilization (%)" },
      labels: {
        formatter: function (value) {
          return Math.round(value) + "%"; // Removes decimals
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return Math.round(val) + "%"; // Display percentage without decimals
      },
      style: {
        fontSize: "11px",
        colors: ["#ffff"], // White color for visibility inside bars
      },
    },
    plotOptions: {
      bar: {
        dataLabels: {
          position: "top", // Places labels inside the bar
        },
        borderRadius: 5,
        columnWidth: "40%",
      },
    },
    // annotations: {
    //   yaxis: [
    //     {
    //       y: 100,
    //       borderColor: "#ff0000",
    //       borderWidth: 3,
    //       strokeDashArray: 0, // Solid line
    //       label: {
    //         text: "100% Utilization",
    //         position: "center",
    //         offsetX: 10,
    //         offsetY: -10,
    //         style: {
    //           color: "#ff0000",
    //           fontWeight: "bold",
    //         },
    //       },
    //     },
    //   ],
    // },
  };

  const rooms = [
    "Baga",
    "Arambol",
    "Sydney",
    "Zurich",
    "Hawaii",
    "Miami",
    "Madrid",
    "Vatican",
  ];
  const totalBookableRoomHours = 198; // 9 hours per day * 22 days

  // Example actual hours booked per room (you can replace these with real data)
  const actualBookedHours = {
    Baga: 150,
    Arambol: 120,
    Sydney: 180,
    Zurich: 160,
    Hawaii: 140,
    Miami: 170,
    Madrid: 110,
    Vatican: 130,
  };

  // Calculate occupancy percentage
  const processedRoomsData = Object.keys(actualBookedHours).map((room) => ({
    x: room,
    y: (actualBookedHours[room] / totalBookableRoomHours) * 100,
  }));

  const averageOccupancySeries = [
    { name: "Average Occupancy", data: processedRoomsData },
  ];

  const averageOccupancyOptions = {
    chart: { type: "bar", fontFamily: "Poppins-Regular" },
    xaxis: { categories: rooms, title: { text: "Rooms" } },
    yaxis: {
      max: 100,
      title: { text: "Occupancy (%)" },
      labels: {
        formatter: function (value) {
          return Math.round(value) + "%"; // Removes decimals
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return Math.round(val) + "%"; // Display percentage without decimals
      },
      style: {
        fontSize: "11px",
        colors: ["#000"], // Black for better visibility
      },
      offsetY: -22,
    },
    plotOptions: {
      bar: {
        dataLabels: {
          position: "top", // Places labels inside the bar
        },
        borderRadius: 5,
        columnWidth: "40%",
      },
    },
    colors: ["#2DC1C6"],
  };

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const timeSlots = [
    "8AM-9AM",
    "9AM-10AM",
    "10AM-11AM",
    "11AM-12PM",
    "12PM-1PM",
    "1PM-2PM",
    "2PM-3PM",
    "3PM-4PM",
    "4PM-5PM",
    "5PM-6PM",
    "6PM-7PM",
    "7PM-8PM",
  ];

  // Mock Data: Replace this with real booking data
  const generateRandomData = () =>
    timeSlots.map(() => Math.floor(Math.random() * 20)); // Max 20 bookings

  const heatmapData = timeSlots.map((slot, index) => ({
    name: slot,
    data: days.map((day, dayIndex) => ({
      x: day, // Day of the week
      y: day === "Sun" || day === "Sat" ? 0 : generateRandomData()[index], // No bookings for Sun/Sat
    })),
  }));

  const heatmapOptions = {
    chart: {
      type: "heatmap",
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },
    dataLabels: { enabled: false },
    colors: ["#d1d5db", "#B2FFB2", "#4CAF50", "#2E7D32", "#1B5E20"], // White to Dark Green Scale
    plotOptions: {
      heatmap: {
        colorScale: {
          ranges: [
            { from: 0, to: 0, color: "#d1d5db", name: "No Bookings" }, // White (No data)
            { from: 1, to: 5, color: "#B2FFB2", name: "Low (1-5)" }, // Light Green
            { from: 6, to: 10, color: "#4CAF50", name: "Moderate (6-10)" }, // Green
            { from: 11, to: 15, color: "#2E7D32", name: "High (11-15)" }, // Dark Green
            { from: 16, to: 20, color: "#1B5E20", name: "Very High (16-20)" }, // Darkest Green
          ],
        },
      },
    },
    xaxis: { categories: days },
    tooltip: {
      y: {
        formatter: (val) => (val > 0 ? `${val} Bookings` : "No Bookings"),
      },
    },
  };

  const meetingsWidgets = [
    {
      layout: 1,
      widgets: [
        <Suspense
          fallback={
            <div className="flex flex-col gap-2">
              {/* Simulating chart skeleton */}
              <Skeleton variant="text" width={200} height={30} />
              <Skeleton variant="rectangular" width="100%" height={300} />
            </div>
          }
        >
          <WidgetSection
            layout={1}
            border
            title={"Average Meeting Room Bookings"}
          >
            <BarGraph
              height={400}
              data={averageBookingSeries}
              options={averageBookingOptions}
            />
          </WidgetSection>
        </Suspense>,
      ],
    },
    {
      layout: 6,
      widgets: [
        <Card
          route={"/app/meetings/book-meeting"}
          title={"Book a Meeting"}
          icon={<RiPagesLine />}
        />,
        <Card
          route={"/app/meetings/manage-meetings"}
          title={"Manage Meetings"}
          icon={<RiArchiveDrawerLine />}
        />,
        <Card
          route={"/app/meetings/calendar"}
          title={"Calendar"}
          icon={<MdFormatListBulleted />}
        />,
        <Card
          route={"/app/meetings/reports"}
          title={"Reports"}
          icon={<CgProfile />}
        />,
        <Card
          route={"/app/meetings/reviews"}
          title={"Reviews"}
          icon={<RiPagesLine />}
        />,
        <Card
          route={"/app/meetings/settings"}
          title={"Settings"}
          icon={<RiPagesLine />}
        />,
      ],
    },
    {
      layout: 3,
      widgets: [
        <DataCard
          title={"Total"}
          data={totalDurationInHours}
          description={"Hours Booked"}
        />,
        <DataCard
          title={"Total"}
          data={meetingsData.length || 0}
          description={"Unique Bookings"}
        />,
        <DataCard
          title={"Total"}
          data={
            meetingsData.filter((item) => item.meetingType === "Internal")
              .length || 0
          }
          description={"BIZ Nest Bookings"}
        />,
        <DataCard
          title={"Total"}
          data={
            meetingsData.filter((item) => item.meetingType === "External")
              .length
          }
          description={"Guest Bookings"}
        />,
        <DataCard
          title={"Average"}
          data={parseFloat(
            (
              meetingsData.reduce(
                (sum, item) => sum + parseInt(item.duration.replace("m", "")),
                0
              ) /
              60 /
              meetingsData.length
            ).toFixed(2)
          )}
          description={"Hours Booked"}
        />,
        <DataCard
          title={"Total"}
          data={
            meetingsData
              .filter((item) => item.meetingStatus === "Cancelled")
              .reduce(
                (sum, item) => sum + parseInt(item.duration.replace("m", "")),
                0
              ) / 60
          }
          description={"Hours Cancelled"}
        />,
      ],
    },

    {
      layout: 2,
      widgets: [
        <MuiTable
          Title={"Internal Ongoing Meeting Hourly"}
          // rows={meetingInternalRows}
          rows={[
            ...meetingsInternal.map((item, index) => ({
              id: index + 1,
              roomName: item.roomName,
              meetingType: item.meetingType,
              endTime: item.endTime,
              unitName: item.location?.unitName,
            })),
          ]}
          columns={meetingColumns}
          rowsToDisplay={5}
          scroll={true}
        />,
        <MuiTable
          Title={"External Ongoing Meeting Hourly"}
          rows={[
            ...meetingsExternal.map((item, index) => ({
              id: index + 1,
              roomName: item.roomName,
              meetingType: item.meetingType,
              endTime: item.endTime,
              unitName: item.location?.unitName,
            })),
          ]}
          columns={meetingColumns}
          rowsToDisplay={5}
          scroll={true}
        />,
      ],
    },
    {
      layout: 2,
      widgets: [
        <WidgetSection
          layout={1}
          border
          title={"External Guests Visited"}
          padding
        >
          <BarGraph data={externalGuestsData} options={externalGuestsOptions} />
        </WidgetSection>,
        <WidgetSection
          layout={1}
          border
          title={"Average Occupancy Of Rooms in %"}
          padding
        >
          <BarGraph
            data={averageOccupancySeries}
            options={averageOccupancyOptions}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 2,
      widgets: [
        <WidgetSection layout={1} title={"Busy time during the week"} border>
          <HeatMap data={heatmapData} options={heatmapOptions} height={400} />
        </WidgetSection>,
        <WidgetSection layout={1} title={"Meeting Duration Breakdown"} border>
          <PieChartMui
            data={meetingPieData}
            options={meetingPieOptions}
            height={400}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 2,
      widgets: [
        <WidgetSection layout={1} title={"Room Availability Status"} border>
          <PieChartMui
            data={RoomPieData}
            options={RoomOptions}
            customLegend={CustomLegend}
            width={300}
          />
        </WidgetSection>,
      ],
    },
  ];
  return (
    <div>
      <div>
        {meetingsWidgets.map((widget, index) => (
          <div>
            <WidgetSection key={index} layout={widget.layout}>
              {widget?.widgets}
            </WidgetSection>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MeetingDashboard;
