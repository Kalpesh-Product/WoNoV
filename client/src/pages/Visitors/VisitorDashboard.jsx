import { RiArchiveDrawerLine, RiPagesLine } from "react-icons/ri";
import { MdFormatListBulleted } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import Card from "../../components/Card";
import DonutChart from "../../components/graphs/DonutChart";
import WidgetSection from "../../components/WidgetSection";
import DataCard from "../../components/DataCard";
import MuiTable from "../../components/Tables/MuiTable";
import BarGraph from "../../components/graphs/BarGraph";
import PieChartMui from "../../components/graphs/PieChartMui";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import humanTime from "../../utils/humanTime";
import { CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LazyDashboardWidget from "../../components/Optimization/LazyDashboardWidget";
import dayjs from "dayjs";
import YearlyGraph from "../../components/graphs/YearlyGraph";
import DateBasedGraph from "../../components/graphs/DateBasedGraph";
import { PERMISSIONS } from "../../constants/permissions";
import useAuth from "../../hooks/useAuth";
import FyBarGraphCount from "../../components/graphs/FyBarGraphCount";

const VisitorDashboard = () => {
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions?.permissions || [];

  //------------------------PAGE ACCESS START-------------------//
  const cardsConfig = [
    {
      route: "/app/visitors/add-visitor",
      title: "Add Visitor",
      icon: <RiPagesLine />,
      permission: PERMISSIONS.VISITORS_ADD_VISITOR.value,
    },
    {
      route: "/app/visitors/add-client",
      title: "Add Client",
      icon: <RiPagesLine />,
      permission: PERMISSIONS.VISITORS_ADD_CLIENT.value,
    },
    {
      route: "/app/visitors/manage-visitors",
      title: "Manage Visitors",
      icon: <RiArchiveDrawerLine />,
      permission: PERMISSIONS.VISITORS_MANAGE_VISITORS.value,
    },
    {
      route: "/app/visitors/team-members",
      title: "Team Members",
      icon: <MdFormatListBulleted />,
      permission: PERMISSIONS.VISITORS_TEAM_MEMBERS.value,
    },
    {
      route: "/app/visitors/reports",
      title: "Reports",
      icon: <CgProfile />,
      permission: PERMISSIONS.VISITORS_REPORTS.value,
    },
  ];

  const allowedCards = cardsConfig.filter(
    (card) => !card.permission || userPermissions.includes(card.permission),
  );
  //------------------------PAGE ACCESS END-------------------//

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
    }),
  );

  //---------------------------------------------------First Graph Data---------------------------------------------------//
  // Define financial year start and end
  const fyStart = dayjs("2025-04-01");
  const fyEnd = dayjs("2026-03-31");

  // Create month labels and a map
  const months = [];
  const monthlyVisitorMap = {};

  for (let i = 0; i < 12; i++) {
    const month = fyStart.add(i, "month");
    const label = month.format("MMM-YY"); // e.g., "Apr-25"
    months.push(label);
    monthlyVisitorMap[label] = 0;
  }

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

  const visitorsSeries = [
    {
      name: "Visitors",
      data: months.map((m) => monthlyVisitorMap[m]),
    },
  ];

  const visitorsChartOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },
    yaxis: {
      max: 100, // ✅ Add this line
      title: {
        text: "No. of Visitors",
      },
      labels: {
        formatter: (val) => `${Math.round(val)}`,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: "40%",
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: false,
      offsetY: -25,
      style: {
        fontSize: "12px",
        colors: ["#000"],
      },
    },
    tooltip: {
      shared: false,
    },
  };

  //---------------------------------------------------First Graph Data---------------------------------------------------//
  //---------------------------------------------------Category Wise Visitors Donut Data---------------------------------------------------//
  const totalVisitorCategories = visitorTypeRawData.reduce(
    (sum, visitor) => sum + visitor.count,
    0,
  );
  const donutVisitorCategoryData = visitorTypeRawData.map((visitor) =>
    parseFloat(((visitor.count / totalVisitorCategories) * 100).toFixed(1)),
  );
  const executiveTasksCount = visitorTypeRawData.map(
    (visitor) => visitor.count,
  );
  const colors = ["#1E3D73", "#4C66A1", "#637BB8"];
  //---------------------------------------------------Category Wise Visitors Donut Data---------------------------------------------------//
  //---------------------------------------------------Visitors Table Data---------------------------------------------------//

  const visitorsColumns = [
    { id: "id", label: "Sr No", minWidth: 72, width: 72 }, // Fixed width
    // { id: "firstName", label: "First Name", minWidth: 80 }, // Minimum width
    // { id: "lastName", label: "Last Name", minWidth: 120 },
    { id: "name", label: "Name", minWidth: 150, width: 180 },
    //{ id: "registeredClientCompany", label: "Company", minWidth: 120 },
    { id: "visitorCompany", label: "Company", minWidth: 150, width: 180 },

    {
      id: "purposeOfVisit",
      label: "Purpose",
      align: "left",
      minWidth: 180,
      width: 220,
    },
    { id: "toMeet", label: "To Meet", align: "left", minWidth: 150, width: 180 },
    { id: "email", label: "Email", minWidth: 180, width: 220 },
    { id: "phoneNumber", label: "Phone No", minWidth: 130, width: 150 },
    { id: "dateOfVisit", label: "Date of Visit", minWidth: 130, width: 150 },
    { id: "checkIn", label: "Check In", minWidth: 110, width: 130 },
    { id: "checkOut", label: "Checkout", minWidth: 110, width: 130 },
  ];
  //---------------------------------------------------Visitors Table Data---------------------------------------------------//

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
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/users/fetch-users");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  // Calculate total and gender-specific counts
  const totalUsers = usersQuery.isLoading ? [] : usersQuery.data.length;

  const maleCount = visitorsData.filter(
    (user) => user.gender?.toLowerCase() === "male",
  ).length;
  const femaleCount = visitorsData.filter(
    (user) => user.gender?.toLowerCase() === "female",
  ).length;

  const genderData = [
    {
      id: 0,
      value: ((maleCount / totalUsers) * 100).toFixed(2),
      actualCount: maleCount,
      label: "Male",
      color: "#0056B3",
    },
    {
      id: 1,
      value: ((femaleCount / totalUsers) * 100).toFixed(2),
      actualCount: femaleCount,
      label: "Female",
      color: "#FD507E",
    },
  ];

  const genderPieChart = {
    chart: {
      type: "pie",
      fontFamily: "Poppins-Regular",
      // events: {
      //   dataPointSelection: () => {
      //     navigate("employee/view-employees");
      //   },
      // },
    },
    labels: ["Male", "Female"], // Labels for the pie slices
    colors: ["#0056B3", "#FD507E"], // Pass colors as an array
    dataLabels: {
      enabled: true,
      position: "center",
      style: {
        fontSize: "14px", // Adjust the font size of the labels
        fontWeight: "bold",
      },
      dropShadow: {
        enabled: true,
        top: 1,
        left: 1,
        blur: 1,
        color: "#000",
        opacity: 0.45,
      },
      formatter: function (val) {
        return `${val.toFixed(0)}%`; // Show percentage value in the center
      },
    },
    tooltip: {
      enabled: true,
      custom: function ({ series, seriesIndex }) {
        const item = genderData[seriesIndex]; // Use genderData to fetch the correct item
        return `
          <div style="padding: 5px; font-size: 12px;">
            ${item.label}: ${item.actualCount} Visitors
          </div>`;
      },
    },
    legend: {
      position: "right",
      horizontalAlign: "center",
    },
  };
  //--------------------------------------------//
  // -----------------------Department Pie Data Start--------------------
  // const departmentWiseAssets = [
  //   { label: "IT", value: 120 },
  //   { label: "Tech", value: 90 },
  //   { label: "HR", value: 70 },
  //   { label: "Sales", value: 110 },
  //   { label: "Admin", value: 110 },
  //   { label: "Finance", value: 60 },
  //   { label: "Maintenance", value: 96 },
  // ];

  const visitorsThisMonth = visitorsData.filter((visitor) =>
    dayjs(visitor.dateOfVisit).isSame(dayjs(), "month"),
  );

  const departmentCountMapMonth = {};
  visitorsThisMonth.forEach((visitor) => {
    const departmentName = visitor.department?.name ?? "Unknown";
    departmentCountMapMonth[departmentName] =
      (departmentCountMapMonth[departmentName] || 0) + 1;
  });

  const departmentWiseAssetsMonth = Object.entries(departmentCountMapMonth).map(
    ([label, value]) => ({ label, value }),
  );

  const totalDepartmentAssetsMonth = departmentWiseAssetsMonth.reduce(
    (sum, dept) => sum + dept.value,
    0,
  );

  const departmentPieDataMonth = departmentWiseAssetsMonth.map((dept) => ({
    label: `${dept.label}`,
    value: ((dept.value / totalDepartmentAssetsMonth) * 100).toFixed(1),
    count: dept.value,
  }));

  const departmentPieOptionsMonth = {
    chart: {
      fontFamily: "Poppins-Regular",
    },
    labels: departmentPieDataMonth.map((item) => item.label),
    legend: { show: true },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(0)}%`,
    },
    tooltip: {
      y: {
        formatter: (val, { seriesIndex }) => {
          const count = departmentPieDataMonth[seriesIndex].count;
          return `${count} visitors (${val}%)`;
        },
      },
    },
    colors: ["#003f5c", "#2f4b7c", "#665191", "#a05195", "#d45087"],
  };

  const today = dayjs().startOf("day");

  const todaysVisitors = visitorsData.filter((visitor) =>
    dayjs(visitor.dateOfVisit).isSame(today, "day"),
  );

  const visitorTypeMapToday = {};
  todaysVisitors.forEach(({ visitorType }) => {
    if (!visitorType) return;
    visitorTypeMapToday[visitorType] =
      (visitorTypeMapToday[visitorType] || 0) + 1;
  });

  const visitorTypeRawDataToday = Object.entries(visitorTypeMapToday).map(
    ([label, count]) => ({ label, count }),
  );

  const totalVisitorCategoriesToday = visitorTypeRawDataToday.reduce(
    (sum, v) => sum + v.count,
    0,
  );

  const donutVisitorCategoryDataToday = visitorTypeRawDataToday.map((v) =>
    parseFloat(((v.count / totalVisitorCategoriesToday) * 100).toFixed(1)),
  );
  const executiveTasksCountToday = visitorTypeRawDataToday.map((v) => v.count);
  const labelsToday = visitorTypeRawDataToday.map((v) => v.label);

  const visitorTypeCounts = visitorsData.reduce((acc, curr) => {
    const type = curr.visitorType || "Unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const internalVisitorsCount = visitorsData.filter(
    (visitor) => visitor.visitorFlag !== "Client",
  ).length;

  const externalClientsCount = visitorsData.filter(
    (visitor) => visitor.visitorFlag === "Client",
  ).length;

  const labels = Object.keys(visitorTypeCounts);
  const series = Object.values(visitorTypeCounts);
  const tooltipValue = series.map(
    (count) => `${count} visitor${count > 1 ? "s" : ""}`,
  );

  // -----------------------Department Pie Data End--------------------
  //--------------------------------------------//
  const now = new Date();
  const checkedInCount = visitorsData.filter((v) => {
    return v.checkIn && (!v.checkOut || new Date(v.checkOut) > now);
  }).length;

  const checkedOutCount = visitorsData.filter((v) => {
    return v.checkIn && v.checkOut && new Date(v.checkOut) <= now;
  }).length;

  const checkInPieData = [
    {
      label: "Checked Out",
      value: checkedOutCount,
      color: "#28a745", // green
    },
    {
      label: "Yet To Check Out",
      value: checkedInCount,
      color: "#dc3545", // red
    },
  ];

  const checkInPieOptions = {
    chart: {
      type: "pie",
      fontFamily: "Poppins-Regular",
    },
    labels: ["Checked Out", "Yet To Check Out"],
    colors: ["#28a745", "#dc3545"],
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(0)}%`,
    },
    tooltip: {
      y: {
        formatter: (val, { seriesIndex }) => {
          const label = checkInPieData[seriesIndex].label;
          const value = checkInPieData[seriesIndex].value;
          return `${value} visitors`;
        },
      },
    },
    legend: {
      position: "right",
    },
  };

  const today1 = new Date().toDateString();
  const checkedInToday = visitorsData.filter((v1) => {
    return v1.checkIn && new Date(v1.checkIn).toDateString() === today1;
  }).length;

  const checkedOutToday = visitorsData.filter((v1) => {
    return v1.checkOut && new Date(v1.checkOut).toDateString() === today1;
  }).length;

  const yetToCheckOutToday = visitorsData.filter((v1) => {
    return (
      v1.checkIn &&
      new Date(v1.checkIn).toDateString() === today1 &&
      !v1.checkOut
    );
  }).length;

  const checkInPieData1 = [
    {
      label: "Checked In Today",
      value: checkedInToday,
      color: "#007bff",
    },
    {
      label: "Checked Out Today",
      value: checkedOutToday,
      color: "#28a745",
    },
    {
      label: "Yet To Check Out Today",
      value: yetToCheckOutToday,
      color: "#dc3545",
    },
  ];
  console.log(checkInPieData1);
  const checkInPieOptions1 = {
    chart: {
      type: "pie",
      fontFamily: "Poppins-Regular",
    },
    labels: ["Checked In Today", "Checked Out Today", "Yet To Check Out Today"],
    colors: ["#007bff", "#28a745", "#dc3545"],
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(0)}%`,
    },
    tooltip: {
      y: {
        formatter: (val, { seriesIndex }) => {
          const value = checkInPieData1[seriesIndex].value;
          return `${value} visitors`;
        },
      },
    },
    legend: {
      position: "left",
    },
  };

  const departmentWiseCounts = {};

  visitorsData.forEach((visitor) => {
    const dept = visitor.department?.name;
    if (!dept) return; // Skip if no department name

    departmentWiseCounts[dept] = (departmentWiseCounts[dept] || 0) + 1;
  });

  const pieChartData = Object.entries(departmentWiseCounts).map(
    ([label, value]) => ({
      label,
      value,
    }),
  );

  const pieChartOptions = {
    labels: pieChartData.map((d) => d.label),
    legend: {
      position: "right",
    },
    tooltip: {
      y: {
        formatter: (val) => {
          return ` ${val} visitor${val > 1 ? "s" : ""}`;
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(0)}%`,
    },
    chart: {
      type: "pie",
      fontFamily: "Poppins-Regular",
    },
    colors: ["#FFB946", "#54C4A7", "#6A5ACD", "#FF4D4F", "#00C49F"], // Extend as needed
  };

  //------------PAGE ACCESS DATA CARD----------//

  // data: visitorsData.filter((item) =>item.checkIn &&
  //     new Date(item.checkIn).toDateString() === new Date().toDateString()
  // ).length,

  const dataCardConfigs = [
    {
      key: "checkedInVisitorsToday",
      title: "Today",
      data: visitorsData.filter(
        (item) =>
          item.checkIn &&
          new Date(item.checkIn).toDateString() === new Date().toDateString(),
      ).length,
      description: "Checked In Visitors ",
      permission: PERMISSIONS.VISITORS_CHECKED_IN_VISITORS_TODAY.value,
    },

    {
      key: "yetToCheckOut",
      title: "Today",
      data: visitorsData.filter(
        (item) =>
          item.checkIn &&
          new Date(item.checkIn).toDateString() === new Date().toDateString() &&
          !item.checkOut,
      ).length,
      description: "Yet To Check Out Visitors",
      permission: PERMISSIONS.VISITORS_YET_TO_CHECK_OUT.value,
    },

    {
      key: "checkedOutToday",
      title: "Today",
      data: visitorsData.filter(
        (item) =>
          item.checkOut &&
          new Date(item.checkOut).toDateString() === new Date().toDateString(),
      ).length,
      description: "Checked Out Visitors",
      permission: PERMISSIONS.VISITORS_CHECKED_OUT_TODAY.value,
    },

    {
      key: "checkedInVisitorsToday",
      title: "Total",
      data: visitorsData.length,
      description: "Checked In Visitors ",
      permission: PERMISSIONS.VISITORS_CHECKED_IN_VISITORS_TODAY.value,
    },

    {
      key: "yetToCheckOut",
      title: "Total",
      data: visitorsData.filter((item) => item.checkOut === null).length,
      description: "Yet To Check Out Visitors",
      permission: PERMISSIONS.VISITORS_YET_TO_CHECK_OUT.value,
    },
    {
      key: "checkedOutToday",
      title: "Total",
      data: visitorsData.filter((item) => item.checkOut).length,
      description: "Checked Out Visitors",
      permission: PERMISSIONS.VISITORS_CHECKED_OUT_TODAY.value,
    },

    {
      key: "walkInVisitsToday",
      title: "Total",
      data: visitorsData.filter((item) => item.visitorType === "Walk In")
        .length,
      description: "Walk In Visits",
      permission: PERMISSIONS.VISITORS_WALK_IN_VISITS_TODAY.value,
    },
    {
      key: "scheduledVisitsToday",
      title: "Total",
      data: visitorsData.filter((item) => item.visitorType === "Scheduled")
        .length,
      description: "Scheduled Visits",
      permission: PERMISSIONS.VISITORS_SCHEDULED_VISITS_TODAY.value,
    },
    {
      key: "meetingBookingsToday",
      title: "Total",
      data: visitorsData.filter((item) => item.visitorType === "Meeting")
        .length,
      description: "Meeting Booking Visits",
      permission: PERMISSIONS.VISITORS_MEETING_BOOKINGS_TODAY.value,
    },
  ];

  //First pie-chart config data end

  const pieChartTopConfigs1 = [
    {
      layout: 2,
      key: "checkedInTodayChart",
      title: "Today",
      titleLabel: "Visitor Status",
      border: true,
      data: checkInPieData1,
      options: checkInPieOptions1,
      width: "100%",
      permission: PERMISSIONS.VISITORS_CHECKED_IN_VISITORS_TODAY.value,
    },
  ];

  const allowedPieChartsTop1 = pieChartTopConfigs1.filter(
    (widget) =>
      !widget.permission || userPermissions.includes(widget.permission),
  );

  //------------------------PAGE ACCESS DONUT START-------------------//
  const donutChartConfigs = [
    {
      layout: 2,
      key: "visitorCategories",
      title: "Overall visitor ",
      titleLabel: "category ",
      border: true,
      centerLabel: "Visitors",
      labels: labels,
      colors: ["#54C4A7", "#FFB946", "#FF4D4F", "#6A5ACD"],
      series: series,
      tooltipValue: tooltipValue,
      // isMonetary: true,
      permission: PERMISSIONS.VISITORS_VISITOR_CATEGORIES.value,
    },
  ];

  const allowedDonutCharts = donutChartConfigs.filter(
    (widget) =>
      !widget.permission || userPermissions.includes(widget.permission),
  );

  const donutChartConfig1 = [
    {
      layout: 2,
      key: "internalExternalClients",
      title: "Overall visitor ",
      titleLabel: "Internal & External Clients ",
      border: true,
      centerLabel: "Visitors",
      labels: ["Internal Visitors", "External Clients"],
      colors: ["#4BC0C0", "#36A2EB"],
      series: [internalVisitorsCount, externalClientsCount],
      tooltipValue: [
        `${internalVisitorsCount} visitor${internalVisitorsCount !== 1 ? "s" : ""}`,
        `${externalClientsCount} visitor${externalClientsCount !== 1 ? "s" : ""}`,
      ],
      // isMonetary: true,
      permission: PERMISSIONS.VISITORS_INTERNAL_AND_EXTERNAL_CATEGORIES.value,
    },
  ];

  const allowedDonutCharts1 = donutChartConfig1.filter(
    (widget) =>
      !widget.permission || userPermissions.includes(widget.permission),
  );

  //------------------------PAGE ACCESS DONUT END-------------------//
  //------------------------PAGE ACCESS PIE Top START-------------------//
  const pieChartTopConfigs = [
    {
      layout: 2,
      key: "checkedInVsYetToCheckOut",
      title: "Checked Out v/s Yet To Check Out ",
      titleLabel: "Overall",
      border: true,
      data: checkInPieData,
      options: checkInPieOptions,
      width: "100%",
      permission: PERMISSIONS.VISITORS_CHECKED_IN_VS_YET_TO_CHECK_OUT.value,
    },
  ];

  const allowedPieChartsTop = pieChartTopConfigs.filter(
    (widget) =>
      !widget.permission || userPermissions.includes(widget.permission),
  );

  //------------------------PAGE ACCESS PIE Top END-------------------//
  //------------------------PAGE ACCESS PIE Bottom START-------------------//
  const pieChartConfigs = [
    {
      key: "visitorGenderData",
      title: "Visitor Gender Data ",
      titleLabel: "This Month",
      layout: 1,
      border: true,
      percent: true,

      data: genderData,
      options: genderPieChart,
      height: 320,
      width: 500,
      permission: PERMISSIONS.VISITORS_GENDER_DATA_PIE.value,
    },
    {
      key: "departmentWiseVisits",
      title: "Department Wise Visits ",
      titleLabel: "This Month",
      layout: 1,
      border: true,
      data: pieChartData,
      options: pieChartOptions,
      height: 320,
      width: 500,
      permission: PERMISSIONS.VISITORS_DEPARTMENT_WISE_VISITS_PIE.value,
    },
  ];

  const allowedPieCharts = pieChartConfigs.filter(
    (widget) =>
      !widget.permission || userPermissions.includes(widget.permission),
  );
  //------------------------PAGE ACCESS PIE Bottom END-------------------//

  //--------------PAGE ACCESS GRAPH-------------//
  const visitorGraphConfigs = [
    {
      key: "monthlyTotalVisitors",
      layout: 1,
      data: visitorsData,
      chartOptions: visitorsChartOptions,
      dateKey: "dateOfVisit",
      graphTitle: "MONTHLY TOTAL VISITORS",
      permission: PERMISSIONS.VISITORS_MONTHLY_TOTAL_VISITORS.value,
    },
  ];
  const allowedVisitorGraphs = visitorGraphConfigs.filter(
    (widget) =>
      !widget.permission || userPermissions.includes(widget.permission),
  );

  //----------------PAGE ACCESS VISITOR TABLE----------//

  const visitorsTodayTableConfigs = [
    {
      key: "visitorsTodayTable",
      layout: 1,
      title: "Visitors Today",
      columns: visitorsColumns,
      rows: todaysVisitors.map((item, index) => ({
        id: index + 1,
        firstName: item.firstName,
        lastName: item.lastName,
        name: `${item.firstName} ${item.lastName}`,
        // registeredClientCompany: item.registeredClientCompany,
        visitorCompany: item.visitorCompany,
        address: item.address,
        phoneNumber: item.phoneNumber,
        email: item.email,
        purposeOfVisit: item.purposeOfVisit,
        toMeet: item.toMeet
          ? `${item.toMeet?.firstName} ${item.toMeet?.lastName}`
          : item.clientToMeet
            ? item?.clientToMeet?.employeeName
            : "",
        dateOfVisit: item.dateOfVisit,
        checkIn: humanTime(item.checkIn),
        checkOut: humanTime(item.checkOut),
      })),
      rowKey: "id",
      rowsToDisplay: 10,
      scroll: true,
      className: "h-full",
      permission: PERMISSIONS.VISITORS_VISITORS_TODAY.value,
    },
  ];

  const allowedVisitorsTodayTables = visitorsTodayTableConfigs.filter(
    (widget) =>
      !widget.permission || userPermissions.includes(widget.permission),
  );

  const meetingsWidgets = [
    {
      layout: 1,
      widgets: [
        ...allowedVisitorGraphs.map((item) => (
          <FyBarGraphCount
            key={item.key}
            data={item.data}
            chartOptions={item.chartOptions}
            dateKey={item.dateKey}
            graphTitle={item.graphTitle}
            groupKey="visitorType"
          />
        )),
      ],
    },
    {
      layout: allowedCards.length, // ✅ dynamic layout
      widgets: allowedCards.map((card) => (
        <Card
          key={card.title}
          route={card.route}
          title={card.title}
          icon={card.icon}
        />
      )),
    },
    {
      layout: 3,
      widgets: dataCardConfigs
        .filter((card) => userPermissions.includes(card.permission))
        .map((card) => (
          <DataCard
            key={card.key}
            title={card.title}
            data={card.data}
            description={card.description}
          />
        )),
    },
    // {
    //   layout: 2,
    //   widgets: [
    //     <WidgetSection
    //       layout={1}
    //       title={"Visitor Categories"}
    //       titleLabel={"This Month"}
    //       border>
    //       <DonutChart
    //         centerLabel="Visitors"
    //         labels={labels}
    //         colors={["#54C4A7", "#FFB946", "#FF4D4F", "#6A5ACD"]} // Add more if needed
    //         series={series}
    //         tooltipValue={tooltipValue}
    //       />
    //     </WidgetSection>,
    //     <WidgetSection
    //       layout={1}
    //       title={"Checked Out v/s Yet To Check Out"}
    //       titleLabel={"Today"}
    //       border>
    //       <PieChartMui
    //         data={checkInPieData}
    //         options={checkInPieOptions}
    //         width={"100%"}
    //       />
    //     </WidgetSection>,
    //   ],
    // },
    // {
    //   layout: 2,
    //   widgets: allowedDonutCharts.map((item) => (
    //     <WidgetSection
    //       key={item.key}
    //       layout={item.layout}
    //       title={item.title}
    //       titleLabel={item.titleLabel}
    //       border={item.border}>
    //       <DonutChart
    //         centerLabel={item.centerLabel}
    //         labels={item.labels}
    //         colors={item.colors}
    //         series={item.series}
    //         tooltipValue={item.tooltipValue}
    //       />
    //     </WidgetSection>
    //   )),
    // },
    // {
    //   layout: 2,
    //   widgets: allowedPieChartsTop.map((item) => (
    //     <WidgetSection
    //       key={item.key}
    //       layout={item.layout}
    //       title={item.title}
    //       titleLabel={item.titleLabel}
    //       border={item.border}>
    //       <PieChartMui
    //         data={item.data}
    //         options={item.options}
    //         width={item.width}
    //       />
    //     </WidgetSection>
    //   )),
    // },
    {
      layout: 2,
      widgets: [
        ...allowedPieChartsTop1.map((item) => (
          <WidgetSection
            key={item.key}
            title={item.title}
            titleLabel={item.titleLabel}
            border={item.border}
          >
            <PieChartMui
              data={item.data}
              options={item.options}
              width={item.width}
              centerAlign
            />
          </WidgetSection>
        )),

        ...allowedPieChartsTop.map((item) => (
          <WidgetSection
            key={item.key}
            title={item.title}
            titleLabel={item.titleLabel}
            border={item.border}
          >
            <PieChartMui
              data={item.data}
              options={item.options}
              width={item.width}
              centerAlign
            />
          </WidgetSection>
        )),

        ...allowedDonutCharts.map((item) => (
          <WidgetSection
            key={item.key}
            title={item.title}
            titleLabel={item.titleLabel}
            border={item.border}
          >
            <DonutChart
              centerLabel={item.centerLabel}
              labels={item.labels}
              colors={item.colors}
              series={item.series}
              tooltipValue={item.tooltipValue}
            />
          </WidgetSection>
        )),

        ...allowedDonutCharts1.map((item) => (
          <WidgetSection
            key={item.key}
            title={item.title}
            titleLabel={item.titleLabel}
            border={item.border}
          >
            <DonutChart
              centerLabel={item.centerLabel}
              labels={item.labels}
              colors={item.colors}
              series={item.series}
              tooltipValue={item.tooltipValue}
            />
          </WidgetSection>
        )),
      ],
    },

    // {
    //   layout: 2,
    //   widgets: [
    //     <WidgetSection
    //       title={"Visitor Gender Data"}
    //       titleLabel={"This Month"}
    //       border>
    //       {!isVisitorsData ? (
    //         <PieChartMui
    //           percent={true}
    //           title={"Visitor Gender Data"}
    //           data={genderData}
    //           options={genderPieChart}
    //           width={438}
    //         />
    //       ) : (
    //         <div className="h-72 flex justify-center items-center">
    //           <CircularProgress />
    //         </div>
    //       )}
    //     </WidgetSection>,
    //     <WidgetSection
    //       layout={1}
    //       title={"Department Wise Visits"}
    //       titleLabel={"This Month"}
    //       border>
    //       <PieChartMui
    //         data={pieChartData}
    //         options={pieChartOptions}
    //         height={320}
    //       />
    //     </WidgetSection>,
    //   ],
    // },
    {
      layout: allowedPieCharts.length, // ✅ dynamic layout
      widgets: allowedPieCharts.map((item) => (
        <WidgetSection
          key={item.key}
          layout={item.layout}
          title={item.title}
          titleLabel={item.titleLabel}
          border={item.border}
        >
          <PieChartMui
            percent={item.percent}
            title={item.title}
            data={item.data}
            options={item.options}
            width={item.width}
            height={item.height}
            centerAlign
          />
        </WidgetSection>
      )),
    },
    {
      layout: 1,
      widgets: [
        ...allowedVisitorsTodayTables.map((item) => (
          <WidgetSection key={item.key} layout={item.layout} padding>
            {!isVisitorsData ? (
              <MuiTable
                Title={item.title}
                columns={item.columns}
                rows={item.rows}
                rowKey={item.rowKey}
                rowsToDisplay={item.rowsToDisplay}
                scroll={item.scroll}
                className={item.className}
              />
            ) : (
              <CircularProgress />
            )}
          </WidgetSection>
        )),
      ],
    },
  ];
  return (
    <div>
      {meetingsWidgets.map((widget, index) => (
        <LazyDashboardWidget
          key={index}
          layout={widget.layout}
          widgets={widget.widgets}
        />
      ))}
    </div>
  );
};

export default VisitorDashboard;
