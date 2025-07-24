import { lazy, Suspense, useState } from "react";
import { RiArchiveDrawerLine, RiPagesLine } from "react-icons/ri";
import { MdFormatListBulleted } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import Card from "../../components/Card";

import DataCard from "../../components/DataCard";
import MuiTable from "../../components/Tables/MuiTable";
import BarGraph from "../../components/graphs/BarGraph";
import YearlyGraph from "../../components/graphs/YearlyGraph";
import PieChartMui from "../../components/graphs/PieChartMui";
import HeatMap from "../../components/graphs/HeatMap";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { Skeleton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DonutChart from "../../components/graphs/DonutChart";
import dayjs from "dayjs";
import { useTopDepartment } from "../../hooks/useTopDepartment";
import usePageDepartment from "../../hooks/usePageDepartment";
import useAuth from "../../hooks/useAuth";
import humanTime from "../../utils/humanTime";
import StatusChip from "../../components/StatusChip";
const WidgetSection = lazy(() => import("../../components/WidgetSection"));

const MeetingDashboard = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [selectedFY, setSelectedFY] = useState("FY 2024-25");
  const { isTop } = useTopDepartment({
    additionalTopUserIds: [
      "67b83885daad0f7bab2f189a",
      "67b83885daad0f7bab2f18a9",
      "67b83885daad0f7bab2f18a6",
    ],
    additionalTopDepartmentIds: [
      "6798bae6e469e809084e24a4",
      "6798ba9de469e809084e2494",
    ],
  });

  const departments = auth.user.departments.map((dept) => {
    return dept._id.toString();
  });
  const allowedDepts = [
    "67b2cf85b9b6ed5cedeb9a2e",
    "6798bae6e469e809084e24a4",
    "6798ba9de469e809084e2494",
  ];
  const isWidgetAllowed = departments.some((id) => allowedDepts.includes(id));

  const { data: meetingsData = [], isLoading } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const response = await axios.get("/api/meetings/get-meetings");
      return response.data;
    },
  });

  const now = dayjs();

  const { data: roomsData = [], isLoading: isRoomLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const response = await axios.get("/api/meetings/get-rooms");
      return response.data;
    },
  });

  console.log(
    "rooms",
    roomsData.map((item) => item.name)
  );

  const { data: holidaysData = [], isLoading: isHolidaysLoading } = useQuery({
    queryKey: ["holidays"],
    queryFn: async () => {
      const response = await axios.get("/api/events/get-holidays");
      return response.data;
    },
  });

  const { data: visitorsData = [], isPending: isVisitorsData } = useQuery({
    queryKey: ["visitors"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/visitors/fetch-visitors");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const cardItems = [
    {
      key: "book",
      title: "Book a Meeting",
      route: "/app/meetings/book-meeting",
      icon: <RiPagesLine />,
    },
    {
      key: "manage",
      title: "Manage Meetings",
      route: "/app/meetings/manage-meetings",
      icon: <RiArchiveDrawerLine />,
      onlyTop: true,
    },
    {
      key: "calendar",
      title: "Calendar",
      route: "/app/meetings/calendar",
      icon: <MdFormatListBulleted />,
    },
    {
      key: "reports",
      title: "Reports",
      route: "/app/meetings/reports",
      icon: <CgProfile />,
    },
    {
      key: "reviews",
      title: "Reviews",
      route: "/app/meetings/reviews",
      icon: <RiPagesLine />,
      onlyTop: true,
    },
    {
      key: "settings",
      title: "Settings",
      route: "/app/meetings/settings",
      icon: <RiPagesLine />,
      onlyTop: true,
    },
  ];

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
    queryKey: ["meetings"],
    queryFn: async () => {
      const response = await axios.get("/api/meetings/get-meetings");
      const filtered = response.data.filter(
        (item) => item.meetingType === "Internal"
      );
      return filtered;
    },
  });

  // Fetch external meetings
  const { data: meetingsExternal = [] } = useQuery({
    queryKey: ["meetingsExternal"],
    queryFn: async () => {
      const response = await axios.get("/api/meetings/get-meetings");
      const filtered = response.data.filter(
        (item) => item.meetingType === "External"
      );
      return filtered;
    },
  });

  const meetingColumns = [
    { id: "id", label: "Sr No", align: "left" },
    { id: "roomName", label: "Meeting Rooms", align: "left" },
    {
      id: "status",
      label: "Status",
      align: "left",
      renderCell: (row) => <StatusChip status={row.status} />, // 👈 use your component
    },

    { id: "endTime", label: "End Time", align: "left" },
  ];

  const fyStart = dayjs("2025-04-01");
  const fyEnd = dayjs("2026-03-31");

  const months = [];
  const monthlyVisitorMap = {};

  for (let i = 0; i < 12; i++) {
    const month = fyStart.add(i, "month");
    const label = month.format("MMM-YY"); // e.g., "Apr-25"
    months.push(label);
    monthlyVisitorMap[label] = 0;
  }

  const visitorCategories = Array.isArray(visitorsData)
    ? visitorsData.map((item) => item.visitorType)
    : [];

  const visitorMap = {};
  visitorsData.forEach(({ visitorType }) => {
    if (!visitorType) return;
    visitorMap[visitorType] = (visitorMap[visitorType] || 0) + 1;
  });
  const visitorTypeRawData = Object.entries(visitorMap).map(
    ([type, count]) => ({
      label: type,
      count,
    })
  );

  // Populate the map
  visitorsData.forEach((visitor) => {
    const visitDate = dayjs(visitor.dateOfVisit);
    if (
      visitDate.isAfter(fyStart.subtract(1, "day")) &&
      visitDate.isBefore(fyEnd.add(1, "day"))
    ) {
      const label = visitDate.format("MMM-YY");
      if (monthlyVisitorMap[label] !== undefined) {
        monthlyVisitorMap[label]++;
      }
    }
  });

  const externalGuestsData = [
    {
      name: "Visitors",
      data: months.map((m) => monthlyVisitorMap[m]),
    },
  ];
  // const externalGuestsData = [
  //   {
  //     name: "Guests Visited",
  //     data: [45, 32, 60, 75, 80, 55, 90, 20, 50, 40, 70, 85], // Sample guest count per month
  //   },
  // ];

  const externalGuestsOptions = {
    chart: {
      type: "bar",
      fontFamily: "Poppins-Regular",
      toolbar: {
        show: false, // Hide toolbar for cleaner UI
      },
    },
    xaxis: {
      categories: months,
      title: {
        text: "",
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

  const meetings = [];
  // To check the number of times a meeting room is booked based on timings
  const durationCount = {};
  meetingsData.forEach((meeting) => {
    durationCount[meeting.duration] =
      (durationCount[meeting.duration] || 0) + 1;
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
      "#1E3D73", // original
      "#34528A", // slightly lighter
      "#4A68A1", // medium shade
      "#608DB8", // lighter
      "#76A2CF", // even lighter
      "#8CB8E6", // lightest
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
  // const availabilityRooms = [
  //   { roomID: 1, roomName: "Baga", status: "Available" },
  //   { roomID: 2, roomName: "Aqua", status: "Unavailable" },
  //   { roomID: 3, roomName: "Lagoon", status: "Available" },
  //   { roomID: 4, roomName: "Skyline", status: "Unavailable" },
  //   { roomID: 5, roomName: "Vista", status: "Available" },
  //   { roomID: 6, roomName: "Summit", status: "Unavailable" },
  //   { roomID: 7, roomName: "Horizon", status: "Available" },
  // ];

  // 🔁 Transform API response into availabilityRooms format
  const availabilityRooms = roomsData.map((room, index) => {
    const roomName = room.name;

    // Check if any current meeting is ongoing for this room
    const hasOngoingMeeting = meetingsData.some((meeting) => {
      return (
        meeting.roomName === roomName &&
        now.isAfter(dayjs(meeting.startTime)) &&
        now.isBefore(dayjs(meeting.endTime))
      );
    });

    return {
      roomID: index + 1,
      roomName,
      status: hasOngoingMeeting ? "Unavailable" : "Available",
    };
  });

  const availableRooms = availabilityRooms.filter(
    (r) => r.status === "Available"
  );
  const unavailableRooms = availabilityRooms.filter(
    (r) => r.status === "Unavailable"
  );

  const RoomPieData = [
    { label: "Available", value: availableRooms.length },
    { label: "Unavailable", value: unavailableRooms.length },
  ];

  const RoomOptions = {
    chart: { fontFamily: "Poppins-Regular" },
    labels: RoomPieData.map((item) => item.label),
    legend: { show: false },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(1)}%`,
    },
    tooltip: {
      y: {
        formatter: (val, { seriesIndex }) =>
          `${RoomPieData[seriesIndex].label}: ${val} rooms`,
      },
    },
    colors: ["#54C4A7", "#EB5C45"],
  };

  const CustomLegend = (
    <div>
      <ul>
        {availabilityRooms
          .sort((a, b) => (a.status === "Available" ? 1 : -1))
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
    "Apr-24",
    "May-24",
    "Jun-24",
    "Jul-24",
    "Aug-24",
    "Sep-24",
    "Oct-24",
    "Nov-24",
    "Dec-24",
    "Jan-25",
    "Feb-25",
    "Mar-25",
  ];

  // const monthMap = new Map()
  // const calculateBookedHoursPerMonth = meetingsData.map((meeting)=>{

  //   const date = new Date(meeting.startDate)
  //   const month = date.getMonth()
  //   const hours = month.duration * 24
  //   if(!monthMap.has(month)){
  //     monthMap.set({month:hours})
  //   }

  // })

  // const totalBookableHours = 1980;
  // Example booked hours data per month
  const actualBookedHoursPerMonth = {
    Apr: 1300,
    May: 1400,
    Jun: 1550,
    Jul: 1650,
    Aug: 1700,
    Sep: 1800,
    Oct: 1900,
    Nov: 1850,
    Dec: 1950,
    Jan: 1500,
    Feb: 1600,
    Mar: 1750,
  };

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Build full month range from Apr to Mar (12 months) across multiple years
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 1; // Go one year back to cover more data if needed
  const yearsToGenerate = 3; // e.g., FY 2023-24, 2024-25, 2025-26

  const fullMonthLabels = [];

  for (let y = 0; y < yearsToGenerate; y++) {
    const fyStart = new Date(startYear + y, 3); // April of the year
    for (let m = 0; m < 12; m++) {
      const date = new Date(fyStart.getFullYear(), fyStart.getMonth() + m);
      const label =
        date.toLocaleString("default", { month: "short" }) +
        "-" +
        date.getFullYear().toString().slice(-2);
      fullMonthLabels.push(label);
    }
  }

  // Map: label → duration
  const monthMap = new Map();

  meetingsData.forEach((meeting) => {
    const date = new Date(meeting.date);
    const label =
      date.toLocaleString("default", { month: "short" }) +
      "-" +
      date.getFullYear().toString().slice(-2);

    const durationMinutes = parseInt(meeting.duration);
    const durationHours = durationMinutes / 60;

    const current = monthMap.get(label) || 0;
    monthMap.set(label, current + durationHours);
  });

  const monthlyBookedHours = {};
  for (let label of fullMonthLabels) {
    monthlyBookedHours[label] = monthMap.get(label) || 0;
  }

  // 🔁 Group data by FY
  const groupedDataMap = new Map();
  const bookedHoursByFY = new Map();
  const totalBookedHours = Object.values(monthlyBookedHours).reduce(
    (acc, hours) => acc + hours,
    0
  );
  const [fyBookedHours, setFYBookedHours] = useState(totalBookedHours);
  const workinghoursPerDay = 1;
  const workingDays = 5;
  const totalBookableHours =
    roomsData.length * workinghoursPerDay * workingDays;

  fullMonthLabels.forEach((label) => {
    const [monthAbbr, yearSuffix] = label.split("-");
    const fullYear = parseInt("20" + yearSuffix);
    const monthIndex = new Date(`${monthAbbr} 1, ${fullYear}`).getMonth();

    const fyStartYear = monthIndex < 3 ? fullYear - 1 : fullYear;
    const fyLabel = `FY ${fyStartYear}-${String(
      (fyStartYear + 1) % 100
    ).padStart(2, "0")}`;

    if (!groupedDataMap.has(fyLabel)) groupedDataMap.set(fyLabel, []);
    if (!bookedHoursByFY.has(fyLabel)) bookedHoursByFY.set(fyLabel, 0);

    const bookedHours = monthlyBookedHours[label];
    bookedHoursByFY.set(fyLabel, bookedHoursByFY.get(fyLabel) + bookedHours);

    groupedDataMap.get(fyLabel).push({
      x: label,
      y: (bookedHours / totalBookableHours) * 100,
    });
  });

  // ✅ Final series for YearlyGraph
  const averageBookingSeries = Array.from(groupedDataMap.entries()).map(
    ([group, data]) => ({
      group,
      data,
    })
  );

  const averageBookingOptions = {
    chart: {
      type: "bar",
      toolbar: false,
      fontFamily: "Poppins-Regular",
      events: {
        dataPointSelection: function (event, chartContext, config) {
          const clickedMonthName =
            config.w.config.xaxis.categories[config.dataPointIndex];
          const [clickedMonth, clickedYearSuffix] = clickedMonthName.split("-");

          const monthMeetings = meetingsData.filter((meeting) => {
            const date = new Date(meeting.date);
            const meetingMonthAbbr = date.toLocaleString("default", {
              month: "short",
            });
            const meetingYearSuffix = date.getFullYear().toString().slice(-2);

            return (
              meetingMonthAbbr === clickedMonth &&
              meetingYearSuffix === clickedYearSuffix
            );
          });

          if (monthMeetings.length === 0) return;

          const month = new Date(monthMeetings[0].date).toLocaleString(
            "default",
            {
              month: "long",
            }
          );
          const year = new Date(monthMeetings[0].date).getFullYear();

          navigate(`/app/meetings/${month}-${year}-meetings`, {
            state: { meetings: monthMeetings },
          });
        },
      },
    },
    xaxis: { categories: BookingMonths },
    yaxis: {
      max: 100,
      title: { text: "Utilization (%)" },
      labels: {
        formatter: (value) => Math.round(value),
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => Math.round(val) + "%",
      style: {
        fontSize: "11px",
        colors: ["#ffff"],
      },
    },
    plotOptions: {
      bar: {
        dataLabels: {
          position: "top",
        },
        borderRadius: 5,
        columnWidth: "40%",
      },
    },
    tooltip: {
      enabled: true, // or false to disable
      y: {
        formatter: function (val) {
          return `${((val / 100) * totalBookableHours).toFixed(0)} hrs`; // Custom text, like "12 hrs"
        },
        title: {
          formatter: () => "Total hours : ", // 🔥 Hides "Series 1"
        },
      },
      x: {
        formatter: function (val) {
          return `Month: ${val}`; // Customizes "May-25"
        },
      },
    },
  };

  const bookedHours = meetingsData.reduce((acc, room) => {
    const name = room.roomName;
    const hours = parseInt(room.duration) / 60 || 0;

    if (acc[name]) {
      acc[name] += hours;
    } else {
      acc[name] = hours;
    }

    return acc;
  }, {});

  const roomNames = roomsData.map((room) => room.name).sort();

  const actualBookedHours = {};
  roomNames.forEach((name) => {
    actualBookedHours[name] = bookedHours[name] || 0;
  });

  const rooms = roomNames;

  // Calculate occupancy percentage
  const processedRoomsData = Object.keys(actualBookedHours).map((room) => ({
    x: room,
    y: (actualBookedHours[room] / totalBookableHours) * 100,
  }));

  const averageOccupancySeries = [
    { name: "Average Occupancy", data: processedRoomsData },
  ];

  const averageOccupancyOptions = {
    chart: { type: "bar", fontFamily: "Poppins-Regular", toolbar: false },
    xaxis: { categories: rooms },
    yaxis: {
      max: 100,
      title: { text: "Occupancy (%)" },
      labels: {
        formatter: function (value) {
          return Math.round(value) + "%";
        },
      },
    },
    tooltip: {
      y: {
        formatter: function (value, { dataPointIndex }) {
          const roomName = rooms[dataPointIndex];
          const actual = actualBookedHours[roomName];
          return `${actual.toFixed(0)} hours booked`;
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val.toFixed(0) + "%";
      },
      style: {
        fontSize: "11px",
        colors: ["#000"],
      },
      offsetY: -22,
    },
    plotOptions: {
      bar: {
        dataLabels: {
          position: "top",
        },
        borderRadius: 5,
        columnWidth: "40%",
      },
    },
    colors: ["#2DC1C6"],
  };

  // Heatmap for meeting timeslots
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

  function getCurrentWeekDays() {
    const today = new Date();
    const day = today.getDay(); // 0 (Sun) to 6 (Sat)
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((day + 6) % 7)); // Move to Monday
    monday.setHours(0, 0, 0, 0);

    const weekDays = [];

    for (let i = 0; i < 6; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      date.setHours(0, 0, 0, 0);
      weekDays.push(date);
    }

    return weekDays;
  }

  // Convert Date to Time Slot Label (e.g., 10AM–11AM)
  function getTimeSlotLabel(date) {
    const hour = date.getHours();
    if (hour >= 8 && hour < 20) {
      const ampm = hour < 12 ? "AM" : "PM";
      const nextHour = hour + 1;
      const nextAMPM = nextHour < 12 ? "AM" : "PM";
      const start = hour % 12 === 0 ? 12 : hour % 12;
      const end = nextHour % 12 === 0 ? 12 : nextHour % 12;
      return `${start}${ampm}-${end}${nextAMPM}`;
    }
    return null;
  }

  const weekdays = getCurrentWeekDays();

  // Create a [timeSlot][dayIndex] matrix initialized with 0s
  const matrix = Array(timeSlots.length)
    .fill(null)
    .map(() => Array(7).fill(0));

  meetingsData.forEach((meeting) => {
    const date = new Date(meeting.startTime);
    date.setSeconds(0, 0); // remove milliseconds

    // Match meeting to current week (Mon–Fri)
    for (let i = 0; i < weekdays.length; i++) {
      const weekDate = weekdays[i];

      // Format both to YYYY-MM-DD for accurate day match
      const meetingDayStr = date.toISOString().split("T")[0];
      const weekDayStr = weekDate.toISOString().split("T")[0];

      if (meetingDayStr === weekDayStr) {
        const timeSlot = getTimeSlotLabel(date);
        const slotIndex = timeSlots.indexOf(timeSlot);
        if (slotIndex !== -1) {
          matrix[slotIndex][i]++;
        }
      }
    }
  });

  // Convert to heatmap format
  const heatmapData = timeSlots.map((slot, slotIndex) => ({
    name: slot,
    data: days.map((day, dayIndex) => ({
      x: day,
      y: matrix[slotIndex][dayIndex], // No more 0 for Sat/Sun
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

  const housekeepingMap = {
    cleaning: 0,
    clean: 0,
  };

  roomsData.forEach((room) => {
    const status = room.housekeepingStatus || "Completed";

    if (status === "Pending") housekeepingMap.cleaning += 1;
    if (status === "Completed") housekeepingMap.clean += 1;
  });

  const housekeepingStatusSeries = [
    housekeepingMap.cleaning,
    housekeepingMap.clean,
  ];

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
          <YearlyGraph
            titleAmount={`TOTAL BOOKED HOURS : ${fyBookedHours.toFixed(0)}`}
            title={"AVERAGE MEETING ROOM UTILIZATION"}
            data={averageBookingSeries}
            options={averageBookingOptions}
            onYearChange={(fyLabel) => {
              setSelectedFY(fyLabel);
              setFYBookedHours(bookedHoursByFY.get(fyLabel) || 0);
            }}
          />
        </Suspense>,
      ],
    },
    {
      layout: cardItems.filter((item) => !item.onlyTop || isTop).length,
      widgets: cardItems
        .filter((item) => !item.onlyTop || isTop)
        .map((item) => (
          <Card
            key={item.key}
            route={item.route}
            title={item.title}
            icon={item.icon}
          />
        )),
    },
    ...(isWidgetAllowed
      ? [
          {
            layout: 3,
            widgets: [
              <DataCard
                title={"Total"}
                data={totalDurationInHours.toFixed(0)}
                description={"Hours Booked"}
                route={"reports"}
              />,
              <DataCard
                title={"Total"}
                data={meetingsData.length || 0}
                description={"Unique Bookings"}
                route={"reports"}
              />,
              <DataCard
                title={"Total"}
                data={
                  meetingsData.filter((item) => item.meetingType === "Internal")
                    .length || 0
                }
                description={"BIZ Nest Bookings"}
                route={"reports"}
              />,
              <DataCard
                title={"Total"}
                data={
                  meetingsData.filter((item) => item.meetingType === "External")
                    .length
                }
                description={"Guest Bookings"}
                route={"reports"}
              />,
              <DataCard
                title={"Average"}
                data={
                  meetingsData.length > 0
                    ? parseFloat(
                        (
                          meetingsData.reduce((sum, item) => {
                            const duration = parseInt(
                              item.duration?.replace("m", "")
                            );
                            return isNaN(duration) ? sum : sum + duration;
                          }, 0) /
                          60 /
                          meetingsData.length
                        ).toFixed(2)
                      )
                    : 0
                }
                description={"Hours Booked"}
                route={"reports"}
              />,
              <DataCard
                title={"Total"}
                data={
                  meetingsData
                    .filter((item) => item.meetingStatus === "Cancelled")
                    .reduce(
                      (sum, item) =>
                        sum + parseInt(item.duration.replace("m", "")),
                      0
                    ) / 60
                }
                description={"Hours Cancelled"}
                route={"reports"}
              />,
            ],
          },
          {
            layout: 2,
            widgets: [
              <MuiTable
                Title={"INTERNAL ONGOING MEETINGS HOURLY"}
                // rows={meetingInternalRows}
                rows={[
                  ...meetingsInternal
                    .filter((item) => item.meetingStatus === "Ongoing")
                    .map((item, index) => ({
                      id: index + 1,
                      roomName: item.roomName,
                      meetingType: item.meetingType,
                      endTime: humanTime(item.endTime),
                      unitName: item.location?.unitName,
                      status: item.meetingStatus,
                    })),
                ]}
                columns={meetingColumns}
                rowsToDisplay={
                  meetingsInternal.length > 0 ? meetingsInternal.length > 0 : 8
                }
                scroll={true}
              />,
              <MuiTable
                Title={"EXTERNAL ONGOING MEETINGS HOURLY"}
                rows={[
                  ...meetingsExternal
                    .filter((item) => item.meetingStatus === "Ongoing")
                    .map((item, index) => ({
                      id: index + 1,
                      roomName: item.roomName,
                      meetingType: item.meetingType,
                      endTime: humanTime(item.endTime),
                      unitName: item.location?.unitName,
                      status: item.meetingStatus,
                    })),
                ]}
                columns={meetingColumns}
                rowsToDisplay={
                  meetingsExternal.length > 0 ? meetingsExternal.length > 0 : 8
                }
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
                titleLabel={`${new Date().toLocaleString("default", {
                  month: "short",
                })}-${new Date().getFullYear().toString().slice(-2)}`}
                padding
              >
                <BarGraph
                  data={externalGuestsData}
                  options={externalGuestsOptions}
                />
              </WidgetSection>,
              <WidgetSection
                layout={1}
                border
                title={"Average Occupancy Of Rooms in %"}
                titleLabel={`${new Date().toLocaleString("default", {
                  month: "short",
                })}-${new Date().getFullYear().toString().slice(-2)}`}
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
              <WidgetSection
                layout={1}
                title={"Busy time during the week"}
                border
              >
                <HeatMap
                  data={heatmapData}
                  options={heatmapOptions}
                  height={400}
                  width={550}
                />
              </WidgetSection>,
              <WidgetSection
                layout={1}
                title={"Meeting Duration Breakdown"}
                border
              >
                <PieChartMui
                  data={meetingPieData}
                  options={meetingPieOptions}
                  height={410}
                  width={550}
                />
              </WidgetSection>,
            ],
          },
          {
            layout: 2,
            widgets: [
              <WidgetSection
                layout={1}
                title={"Room Availability Status"}
                border
                height={400}
              >
                <PieChartMui
                  data={RoomPieData}
                  options={RoomOptions}
                  customLegend={CustomLegend}
                  width={300}
                  height={300}
                />
              </WidgetSection>,
              <WidgetSection
                layout={1}
                padding
                border
                titleLabel={"Today"}
                title={"Cleaning & Hygiene Status"}
                height={350}
              >
                <DonutChart
                  series={housekeepingStatusSeries}
                  labels={["Cleaning", "Clean"]}
                  colors={["#ffc107", "#28a745"]}
                  centerLabel={"Meeting Rooms"}
                  tooltipValue={housekeepingStatusSeries}
                  width={457}
                  height={400}
                />
              </WidgetSection>,
            ],
          },
        ]
      : []),
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
