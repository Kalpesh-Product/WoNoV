import React from "react";
import AreaGraph from "../../components/graphs/AreaGraph";
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
import {
  assetAvailabilityDataV,
  assetAvailabilityOptionsV,
  assetCategoriesDataV,
  departmentPieDataVX,
  departmentPieOptionsVX,
  recentAssetsColumnsVX,
  recentAssetsDataVX,
} from "./VisitorsData/VisitorsData";
import humanDate from "../../utils/humanDateForamt";
import humanTime from "../../utils/humanTime";
import { CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LazyDashboardWidget from "../../components/Optimization/LazyDashboardWidget";

const VisitorDashboard = () => {
  const navigate = useNavigate();
  const axios = useAxiosPrivate();

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
  console.log(
    "Visitors data : ",
    visitorsData.map((item) => item.firstName)
  );

  const visitorCategories = Array.isArray(visitorsData)
    ? visitorsData.map((item) => item.visitorType)
    : [];
  console.log("Visitor Categories", visitorCategories);

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

  console.log("Visitor Type :", visitorTypeRawData);
  //---------------------------------------------------Category Wise Visitors Donut Data---------------------------------------------------//
  const totalVisitorCategories = visitorTypeRawData.reduce(
    (sum, visitor) => sum + visitor.count,
    0
  );
  const donutVisitorCategoryData = visitorTypeRawData.map((visitor) =>
    parseFloat(((visitor.count / totalVisitorCategories) * 100).toFixed(1))
  );
  const executiveTasksCount = visitorTypeRawData.map(
    (visitor) => visitor.count
  );
  const labels = visitorTypeRawData.map((visitor) => visitor.label);
  const colors = ["#1E3D73", "#4C66A1", "#637BB8"];
  //---------------------------------------------------Category Wise Visitors Donut Data---------------------------------------------------//
  //---------------------------------------------------Visitors Table Data---------------------------------------------------//

  const visitorsColumns = [
    { id: "id", label: "Sr No", minWidth: 100 }, // Fixed width
    { id: "firstName", label: "First Name", minWidth: 80 }, // Minimum width
    { id: "lastName", label: "Last Name", minWidth: 120 },
    { id: "email", label: "Email", minWidth: 80 },
    { id: "phoneNumber", label: "Phone No", minWidth: 100 },
    {
      id: "purposeOfVisit",
      label: "Purpose",
      align: "left",
      minWidth: 300,
    },
    { id: "toMeet", label: "To Meet", align: "left", minWidth: 150 },
    { id: "checkIn", label: "Check In", minWidth: 120 },
    { id: "checkOut", label: "Checkout", width: 80 },
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

  const averageBookingSeries = [{ name: "Total Visitors", data }];

  const averageBookingOptions = {
    chart: { type: "bar", fontFamily: "Poppins-Regular", toolbar: false },
    xaxis: { categories: BookingMonths },
    yaxis: {
      max: 100,
      title: { text: "Visitors" },
      labels: {
        formatter: function (value) {
          return Math.round(value) + ""; // Removes decimals
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return Math.round(val) + ""; // Display percentage without decimals
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
    colors: ["#0aa9ef"], // Black color for bars
  };

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

  const maleCount = usersQuery.isLoading
    ? []
    : usersQuery.data.filter((user) => user.gender === "Male").length;

  const femaleCount = usersQuery.isLoading
    ? []
    : usersQuery.data.filter((user) => user.gender === "Female").length;

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
      events: {
        dataPointSelection: () => {
          navigate("employee/view-employees");
        },
      },
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

  //First pie-chart config data end
  const meetingsWidgets = [
    {
      layout: 1,
      widgets: [
        // <WidgetSection layout={1} border title={"Monthly Visitor Statistics"}>
        <WidgetSection
          layout={1}
          border
          title={"Monthly Total Visitors"}
          titleLabel={"FY 2024-25"}
        >
          <BarGraph
            height={400}
            data={averageBookingSeries}
            options={averageBookingOptions}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 6,
      widgets: [
        <Card
          route={"/app/visitors/add-visitor"}
          title={"Add Visitor"}
          icon={<RiPagesLine />}
        />,
        <Card
          route={"/app/visitors/manage-visitors"}
          title={"Manage Visitors"}
          icon={<RiArchiveDrawerLine />}
        />,
        <Card
          route={"/app/visitors/team-members"}
          title={"Team Members"}
          icon={<MdFormatListBulleted />}
        />,
        <Card
          route={"/app/visitors/reports"}
          title={"Reports"}
          icon={<CgProfile />}
        />,
        <Card
          route={"/app/visitors/reviews"}
          title={"Reviews"}
          icon={<RiPagesLine />}
        />,
        <Card
          route={"/app/visitors/settings"}
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
          data={visitorsData.length}
          description={"Checked In Visitors Today"}
        />,
        <DataCard
          title={"Total"}
          data={"9"}
          description={"Checked Out Today"}
        />,
        <DataCard
          title={"Total"}
          data={"6"}
          description={"Yet To Check Out"}
        />,
        <DataCard
          title={"Total"}
          data={
            visitorsData.filter((item) => item.visitorType === "Walk In").length
          }
          description={"Walk In Visits Today"}
        />,
        <DataCard
          title={"Total"}
          data={
            visitorsData.filter((item) => item.visitorType === "Scheduled")
              .length
          }
          description={"Scheduled Visits Today"}
        />,
        <DataCard
          title={"Total"}
          data={
            visitorsData.filter((item) => item.visitorType === "Meeting").length
          }
          description={"Meeting Bookings Today"}
        />,
      ],
    },
    {
      layout: 2,
      widgets: [
        <WidgetSection
          layout={1}
          title={"Visitor Categories"}
          titleLabel={"This Month"}
          border
        >
          <DonutChart
            centerLabel="Visitors"
            labels={labels}
            colors={colors}
            series={donutVisitorCategoryData}
            tooltipValue={executiveTasksCount}
          />
        </WidgetSection>,
        <WidgetSection
          layout={1}
          title={"Checked Out v/s Yet To Check Out"}
          titleLabel={"Today"}
          border
        >
          <PieChartMui
            data={assetAvailabilityDataV}
            options={assetAvailabilityOptionsV}
            width={"100%"}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 2,
      widgets: [
        // <MuiTable
        //   Title="Visitors Expected Today"
        //   columns={columns3}
        //   rows={rows3}
        // />,
        // <MuiTable
        //   Title="Pending Visits Today"
        //   columns={columns3}
        //   rows={rows3}
        // />,
      ],
    },
    {
      layout: 2,
      widgets: [
        <WidgetSection
          title={"Visitor Gender Data"}
          titleLabel={"This Month"}
          border
        >
          <PieChartMui
            percent={true}
            title={"Visitor Gender Data"}
            data={genderData}
            options={genderPieChart}
            height={400}
            width={460}
          />
        </WidgetSection>,
        <WidgetSection
          layout={1}
          title={"Department Wise Visits"}
          titleLabel={"This Month"}
          border
        >
          <PieChartMui
            data={departmentPieDataVX}
            options={departmentPieOptionsVX}
            height={700}
            width={570}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 1,
      widgets: [
        <WidgetSection layout={1} padding>
          {!isVisitorsData ? (
            <MuiTable
              Title="Visitors Today"
              columns={visitorsColumns}
              rows={[
                ...visitorsData.map((item, index) => ({
                  id: index + 1,
                  firstName: item.firstName,
                  lastName: item.lastName,
                  address: item.address,
                  phoneNumber: item.phoneNumber,
                  email: item.email,
                  purposeOfVisit: item.purposeOfVisit,
                  toMeet: item.toMeet?.firstName
                    ? item.toMeet?.firstName
                    : "Kalpesh Naik",
                  checkIn: humanTime(item.checkIn),
                  checkOut: humanTime(item.checkOut),
                })),
              ]}
              rowKey="id"
              rowsToDisplay={10}
              scroll={true}
              className="h-full"
            />
          ) : (
            <CircularProgress />
          )}
        </WidgetSection>,
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
