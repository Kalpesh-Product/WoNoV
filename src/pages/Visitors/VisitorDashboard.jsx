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

const VisitorDashboard = () => {
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
  const recentAssetsColumnsVX = [
    { id: "id", label: "Sr No" },
    { id: "firstName", label: "First Name" },
    { id: "lastName", label: "Last Name" },
    { id: "email", label: "Email" },
    { id: "phoneNumber", label: "Phone No" },
    { id: "purposeOfVisit", label: "Purpose", align: "right" },
    { id: "toMeet", label: "To Meet", align: "right" },
    { id: "checkIn", label: "Check In" },
    { id: "checkOut", label: "Checkout" },
    //   {
    //     id: "actions",
    //     label: "Actions",
    //     align: "center",
    //     renderCell: () => <PrimaryButton title={"View"} />,
    //   },
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
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
    "Jan",
    "Feb",
    "Mar",
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
    chart: { type: "bar", fontFamily: "Poppins-Regular" },
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
    colors: ["#1E3D73"], // Black color for bars
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
  const meetingsWidgets = [
    {
      layout: 1,
      widgets: [
        <WidgetSection layout={1} border title={"Monthly Visitor Statistics"}>
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
          data={"2"}
          description={"Checked Out Today"}
        />,
        <DataCard
          title={"Total"}
          data={"7"}
          description={"Yet To Check Out"}
        />,
        <DataCard
          title={"Total"}
          data={
            visitorsData.filter((item) => item.visitorType === "Walk In").length
          }
          description={"Walk In Visits"}
        />,
        <DataCard
          title={"Total"}
          data={
            visitorsData.filter((item) => item.visitorType === "Scheduled")
              .length
          }
          description={"Scheduled Visits"}
        />,
        <DataCard
          title={"Total"}
          data={
            visitorsData.filter((item) => item.visitorType === "Meeting").length
          }
          description={"Meeting Booking"}
        />,
      ],
    },
    {
      layout: 2,
      widgets: [
        <WidgetSection
          layout={1}
          title={"Visitor Categories This Month"}
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
          title={"Checked In v/s Checked Out Visitors Today"}
          border
        >
          <PieChartMui
            data={assetAvailabilityDataV}
            options={assetAvailabilityOptionsV}
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
        // <WidgetSection title={"Visitor Gender Data"} border>
        //   <PieChartMui
        //     percent={true}
        //     title={"Visitor Gender Data"}
        //     data={genderData}
        //     options={genderPieChart}
        //   />
        // </WidgetSection>,
        <WidgetSection layout={1} title={"Department Wise Visits"} border>
          <PieChartMui
            data={departmentPieDataVX}
            options={departmentPieOptionsVX}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 1,
      widgets: [
        <WidgetSection layout={1} padding>
          <MuiTable
            Title="Visitors Today"
            columns={recentAssetsColumnsVX}
            rows={visitorsData.map((item, index) => ({
              id: index + 1,
              firstName: item.firstName,
              lastName: item.lastName,
              address: item.address,
              phoneNumber: item.phoneNumber,
              email: item.email,
              purposeOfVisit: item.purposeOfVisit,
              toMeet: item.toMeet,
              checkIn: humanTime(item.checkIn),
              checkOut: humanTime(item.checkOut),
            }))}
            rowKey="id"
            rowsToDisplay={10}
            scroll={true}
            className="h-full"
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

export default VisitorDashboard;
