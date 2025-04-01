import React from "react";
import Card from "../../../components/Card";
import {
  MdFormatListBulleted,
  MdOutlineMiscellaneousServices,
} from "react-icons/md";
import { SiCashapp, SiGoogleadsense } from "react-icons/si";
import WidgetSection from "../../../components/WidgetSection";
import LayerBarGraph from "../../../components/graphs/LayerBarGraph";
import DataCard from "../../../components/DataCard";
import PieChartMui from "../../../components/graphs/PieChartMui";
import DonutChart from "../../../components/graphs/DonutChart";
import MuiTable from "../../../components/Tables/MuiTable";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import TreemapGraph from "../../../components/graphs/TreemapGraph";
dayjs.extend(customParseFormat);
const AdminDashboard = () => {
  const utilisedData = [125, 150, 99, 85, 70, 50, 80, 95, 100, 65, 50, 120];
  const defaultData = utilisedData.map((value) =>
    Math.max(100 - Math.min(value, 100), 0)
  );
  const utilisedStack = utilisedData.map((value) => Math.min(value, 100));
  const exceededData = utilisedData.map((value) =>
    value > 100 ? value - 100 : 0
  );

  const data = [
    { name: "Utilised Budget", data: utilisedStack },
    { name: "Default Budget", data: defaultData },
    { name: "Exceeded Budget", data: exceededData },
  ];

  const options = {
    chart: {
      type: "bar",
      stacked: true,
      fontFamily: "Poppins-Regular",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "35%",
        borderRadius: 3,
        borderRadiusWhenStacked: "all",
        borderRadiusApplication: "end",
      },
    },
    colors: ["#27C96A", "#275D3E", "#FF0000"], // Colors for the series
    dataLabels: {
      enabled: true,
      formatter: (value, { seriesIndex }) => {
        if (seriesIndex === 1) return "";
        return `${value}%`;
      },
    },
    xaxis: {
      categories: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
    },
    yaxis: {
      max: 150,
      labels: {
        formatter: (value) => `${value}%`,
      },
    },
    tooltip: {
      y: {
        formatter: (value) => `${value}%`,
      },
    },
    legend: {
      show: true,
      position: "top",
    },
  };
  //-----------------------------------------------------------------------------------------------------------------//
  const taskData = [
    { unit: "ST-701A", tasks: 25 },
    { unit: "ST-701B", tasks: 30 },
    { unit: "ST-701A", tasks: 25 },
    { unit: "ST-701B", tasks: 30 },
    { unit: "ST-701A", tasks: 25 },
    { unit: "ST-701B", tasks: 30 },
    { unit: "ST-701A", tasks: 25 },
    { unit: "ST-701B", tasks: 30 },
  ];

  const totalUnitWiseTask = taskData.reduce((sum, item) => sum + item.tasks, 0);
  const unitWisePieData = taskData.map((item) => ({
    label: `${item.unit} (${((item.tasks / totalUnitWiseTask) * 100).toFixed(
      1
    )}%)`,
    value: item.tasks,
  }));

  const unitTreemapOptions = {
    labels: unitWisePieData.map((item) => item.label),
    chart: {
      fontFamily: "Poppins-Regular",
      toolbar: false,
    },
    toolTip: {
      y: {
        formatter: (val) => `${((val / totalUnitWiseTask) * 100).toFixed(1)}%`,
      },
    },
  };
  //-----------------------------------------------------------------------------------------------------------------//
  const executiveTasks = [
    { name: "Mac", tasks: 30 },
    { name: "Anne", tasks: 10 },
    { name: "Naaz", tasks: 20 },
  ];

  const executiveTotalTasks = executiveTasks.reduce(
    (sum, user) => sum + user.tasks,
    0
  );
  const pieExecutiveData = executiveTasks.map((user) =>
    parseFloat(((user.tasks / executiveTotalTasks) * 100).toFixed(1))
  );
  const executiveTasksCount = executiveTasks.map((user) => user.tasks);
  const labels = executiveTasks.map((user) => user.name);
  const colors = ["#FF5733", "#FFC300", "#28B463"];
  //-----------------------------------------------------------------------------------------------------------------//
  const companyWiseDesk = [
    { company: "Zomato", desks: "12" },
    { company: "SquadStack", desks: "10" },
    { company: "Zimetrics", desks: "15" },
    { company: "Others", desks: "16" },
  ];
  const totalCompanyDesks = companyWiseDesk.reduce(
    (sum, item) => sum + item.desks,
    0
  );
  const pieCompanyWiseDeskData = companyWiseDesk.map((item) => ({
    label: `${item.company} (${((item.desks / totalCompanyDesks) * 100).toFixed(
      1
    )}%)`,
    value: item.desks,
  }));
  const pieCompanyWiseDeskOptions = {
    labels: companyWiseDesk.map((item) => item.company),
    chart: {
      fontFamily: "Poppins-Regular",
    },
    toolTip: {
      y: {
        formatter: (val) => `${((val / totalCompanyDesks) * 100).toFixed(1)}%`,
      },
    },
  };
  //-----------------------------------------------------------------------------------------------------------------//
  const genderData = [
    { gender: "Male", count: "45" },
    { gender: "Female", count: "40" },
  ];
  const totalGenderCount = genderData.reduce(
    (sum, item) => sum + item.count,
    0
  );
  const pieGenderData = genderData.map((item) => ({
    label: `${item.gender} ${((item.count / totalGenderCount) * 100).toFixed(
      1
    )}%`,
    value: item.count,
  }));
  const pieGenderOptions = {
    labels: genderData.map((item) => item.gender),
    chart: {
      fontFamily: "Poppins-Regular",
    },
    tooltip: {
      y: {
        formatter: (val) => `${((val / totalGenderCount) * 100).toFixed(1)}%`,
      },
    },
  };
  //-----------------------------------------------------------------------------------------------------------------//
  const houseKeepingMemberData = [
    { name: "John", dateOfJoin: "20-02-2025", building: "DTC", unitNo: "002" },
    {
      name: "Alice",
      dateOfJoin: "27-02-2025",
      building: "ST",
      unitNo: "701(A)",
    },
    {
      name: "Raj Kumar",
      dateOfJoin: "12-03-2025",
      building: "ST",
      unitNo: "601(B)",
    },
  ];
  const houseKeepingMemberColumns = [
    { id: "id", label: "ID", align: "left" },
    { id: "name", label: "Name", align: "left" },
    { id: "dateOfJoin", label: "Date Of Join", align: "left" },
    { id: "building", label: "Building", align: "left" },
    { id: "unitNo", label: "Unit No", align: "left" },
  ];
  //-----------------------------------------------------------------------------------------------------------------//
  const executiveShiftData = [
    {
      id: 1,
      name: "Amit Sharma",
      building: "ST",
      unitNo: "701(A)",
      startTime: "09:00 AM",
      endTime: "05:00 PM",
    },
    {
      id: 2,
      name: "Priya Nair",
      building: "ST",
      unitNo: "701(A)",
      startTime: "10:00 AM",
      endTime: "06:00 PM",
    },
    {
      id: 3,
      name: "Rohan Verma",
      building: "DTC",
      unitNo: "002",
      startTime: "08:00 AM",
      endTime: "04:00 PM",
    },
    {
      id: 4,
      name: "Sneha Mehta",
      building: "DTC",
      unitNo: "003",
      startTime: "11:00 AM",
      endTime: "07:00 PM",
    },
    {
      id: 5,
      name: "Karan Desai",
      building: "ST",
      unitNo: "601(B)",
      startTime: "07:00 AM",
      endTime: "03:00 PM",
    },
    {
      id: 6,
      name: "Anjali Kapoor",
      building: "ST",
      unitNo: "501(B)",
      startTime: "12:00 PM",
      endTime: "08:00 PM",
    },
    {
      id: 7,
      name: "Anjali Kapoor",
      building: "ST",
      unitNo: "501(B)",
      startTime: "12:00 PM",
      endTime: "08:00 PM",
    },
  ];

  const executiveShiftColumns = [
    { id: "id", label: "ID", align: "left" },
    { id: "name", label: "Name", align: "left" },
    { id: "building", label: "Building", align: "left" },
    { id: "unitNo", label: "Unit No", align: "left" },
    { id: "startTime", label: "Start Time", align: "left" },
    { id: "endTime", label: "End Time", align: "left" },
  ];
  //-----------------------------------------------------------------------------------------------------------------//
  const upcomingEventsData = [
    {
      event: "IBDO Anniversary Celebration",
      date: "12-02-2025",
      location: "Garrison Cafe",
    },
    {
      event: "Zomato Anniversary Celebration",
      date: "15-02-2025",
      location: "Garrison Cafe",
    },
    {
      event: "SquadStack Anniversary Celebration",
      date: "01-03-2025",
      location: "Garrison Cafe",
    },
  ];
  const upcomingEventsColumns = [
    { id: "id", label: "ID", align: "left" },
    { id: "event", label: "Event", align: "left" },
    { id: "date", label: "Date", align: "left" },
    { id: "location", label: "Location", align: "left" },
  ];
  //-----------------------------------------------------------------------------------------------------------------//
  const clientMemberBirthdays = [
    {
      name: "John Doe",
      company: "Zomato",
      dateOfJoin: "02-02-2024",
      dateOfBirth: "18-03-2001",
    },
    {
      name: "Anita Rao",
      company: "Swiggy",
      dateOfJoin: "12-05-2021",
      dateOfBirth: "25-03-1995",
    },
    {
      name: "Ravi Patel",
      company: "Paytm",
      dateOfJoin: "01-01-2020",
      dateOfBirth: "01-04-1988",
    },
    {
      name: "Sneha Shah",
      company: "Byju's",
      dateOfJoin: "10-07-2022",
      dateOfBirth: "22-03-1990",
    },
    {
      name: "Vikram Singh",
      company: "Nykaa",
      dateOfJoin: "15-08-2019",
      dateOfBirth: "29-03-1993",
    },
    {
      name: "Meena Iyer",
      company: "Flipkart",
      dateOfJoin: "20-09-2023",
      dateOfBirth: "20-03-1997",
    },
  ];
  const clientMemberBirthdaysColumns = [
    { id: "name", label: "Name", align: "left" },
    { id: "upComingIn", label: "Upcoming In", align: "left" },
    { id: "completedYears", label: "Completed Years", align: "left" },
    { id: "company", label: "Company", align: "left" },
  ];

  const today = dayjs();
  const cutOff = today.add(15, "day");
  const upcomingBirthdays = clientMemberBirthdays
    .map((item) => {
      const dob = dayjs(item.dateOfBirth, "DD-MM-YYYY");
      const thisYearBirthday = dob.set("year", today.year());

      const birthday = thisYearBirthday.isBefore(today)
        ? thisYearBirthday.add(1, "year")
        : thisYearBirthday;

      //completed years

      const doj = dayjs(item.dateOfJoin, "DD-MM-YYYY");
      const completedYears = today.diff(doj, "year");
      const upComingIn = birthday.diff(today, "days");

      return {
        ...item,
        upComingIn: upComingIn,
        completedYears,
        isUpcoming:
          birthday.isBefore(cutOff) &&
          birthday.isAfter(today.subtract(1, "day")),
      };
    })
    .filter((item) => item.isUpcoming);
  //-----------------------------------------------------------------------------------------------------------------//
  const clientAnniversaryData = [
    { client: "Zomato", dateOfJoin: "21-03-2023" },
    { client: "Flipkart", dateOfJoin: "20-09-2023" },
    { client: "Nykaa", dateOfJoin: "15-08-2019" },
    { client: "SquadStack", dateOfJoin: "25-03-2024" },
  ];

  const upComingClientAnniversary = clientAnniversaryData
    .map((item) => {
      const doj = dayjs(item.dateOfJoin, "DD-MM-YYYY");
      const thisYearAnniversary = doj.set("year", today.year());
      const anniversary = thisYearAnniversary.isBefore(today)
        ? thisYearAnniversary.add(1, "year")
        : thisYearAnniversary;
      const completedYears = today.diff(doj, "years");
      const upComingIn = anniversary.diff(today, "days");

      return {
        ...item,
        upComingIn: upComingIn,
        completedYears: completedYears,
        thisYearAnniversary: thisYearAnniversary.format("DD-MM-YYYY"),
        isUpcoming:
          anniversary.isBefore(cutOff) &&
          anniversary.isAfter(today.subtract(1, "day")),
      };
    })
    .filter((item) => item.isUpcoming);

  const upComingClientAnniversaryColumns = [
    { id: "id", label: "ID", align: "left" },
    { id: "client", label: "Client", align: "left" },
    { id: "dateOfJoin", label: "Date of Join", align: "left" },
    { id: "completedYears", label: "Completed Years", align: "left" },
    { id: "upComingIn", label: "Upcoming in", align: "left" },
  ];

  console.log("upcomingClientAnniversary : ", upComingClientAnniversary);
  //-----------------------------------------------------------------------------------------------------------------//
  const techWidgets = [
    {
      layout: 1,
      widgets: [
        <WidgetSection border title={"Budget v/s Achievements"}>
          <LayerBarGraph data={data} options={options} />
        </WidgetSection>,
      ],
    },
    {
      layout: 6,
      widgets: [
        <Card
          icon={<MdFormatListBulleted />}
          title="Annual Expenses"
          route={"/app/dashboard/admin-dashboard/annual-expenses"}
        />,
        <Card
          icon={<MdFormatListBulleted />}
          title="Inventory"
          route={"/app/dashboard/admin-dashboard/inventory"}
        />,
        <Card
          icon={<SiCashapp />}
          title="Finance"
          route={"/app/dashboard/admin-dashboard/finance"}
        />,
        <Card
          icon={<MdFormatListBulleted />}
          title="Mix-Bag"
          route={"mix-bag"}
        />,
        <Card
          icon={<SiGoogleadsense />}
          title="Data"
          route={"/app/dashboard/admin-dashboard/data"}
        />,
        <Card
          icon={<MdOutlineMiscellaneousServices />}
          title="Settings"
          route={"/app/dashboard/admin-dashboard/settings"}
        />,
      ],
    },
    {
      layout: 3,
      widgets: [
        <DataCard
          route={"admin-offices"}
          title={"Total"}
          data={"11"}
          description={"Admin Offices"}
        />,
        <DataCard
          route={"admin-expenses"}
          title={"Total"}
          data={"38"}
          description={"Monthly Due Tasks"}
        />,
        <DataCard
          route={"admin-expenses"}
          title={"Average"}
          data={"60000"}
          description={"Monthly Expense"}
        />,
      ],
    },
    {
      layout: 3,
      widgets: [
        <DataCard
          route={"per-sq-ft-expense"}
          title={"Total INR"}
          data={"14"}
          description={"Expense Per Sq. Ft."}
        />,
        <DataCard
          route={"per-sq-ft-electricity-expense"}
          title={"Total INR"}
          data={"8"}
          description={"Electricity Expense Per Sq. Ft."}
        />,
        <DataCard
          route={"admin-executive-expense"}
          title={"Top Executive"}
          data={""}
          description={"Mr. Machindranath Parkar"}
        />,
      ],
    },
    {
      layout: 2,
      widgets: [
        <WidgetSection border title={"Unit Wise Due Tasks"}>
          <TreemapGraph data={unitWisePieData} options={unitTreemapOptions} />
        </WidgetSection>,
        <WidgetSection border title={"Executive Wise Due Tasks"}>
          <DonutChart
            centerLabel="Tasks"
            labels={labels}
            colors={colors}
            series={pieExecutiveData}
            tooltipValue={executiveTasksCount}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 2,
      widgets: [
        <WidgetSection border title={"Total Desks Company Wise"}>
          <PieChartMui
            data={pieCompanyWiseDeskData}
            options={pieCompanyWiseDeskOptions}
          />
        </WidgetSection>,
        <WidgetSection border title={"Biometrics Gender Data"}>
          <PieChartMui data={pieGenderData} options={pieGenderOptions} />
        </WidgetSection>,
      ],
    },
    {
      layout: 2,
      widgets: [
        <MuiTable
          Title={"Newly Joined House Keeping Members"}
          rowsToDisplay={4}
          scroll
          rows={[
            ...houseKeepingMemberData.map((item, index) => ({
              id: index + 1,
              name: item.name,
              dateOfJoin: item.dateOfJoin,
              building: item.building,
              unitNo: item.unitNo,
            })),
          ]}
          columns={houseKeepingMemberColumns}
        />,

        <WidgetSection border title={"House Keeping Staff Gender Data"}>
          <PieChartMui data={pieGenderData} options={pieGenderOptions} />
        </WidgetSection>,
      ],
    },
    {
      layout: 2,
      widgets: [
        <MuiTable
          scroll
          Title={"Executive Weekly Shift Table"}
          rowsToDisplay={3}
          rows={executiveShiftData}
          columns={executiveShiftColumns}
        />,
        <MuiTable
          scroll
          Title={"Upcoming Events List"}
          rowsToDisplay={3}
          rows={[
            ...upcomingEventsData.map((item, index) => ({
              id: index + 1,
              event: item.event,
              date: item.date,
              location: item.location,
            })),
          ]}
          columns={upcomingEventsColumns}
        />,
        <MuiTable
          columns={clientMemberBirthdaysColumns}
          scroll
          rowsToDisplay={3}
          Title={"Upcoming Client Member Birthdays"}
          rows={[
            ...upcomingBirthdays
              .sort((a, b) => a.upComingIn - b.upComingIn)
              .map((item, index) => ({
                id: index + 1,
                name: item.name,
                upComingIn: item.upComingIn === 0 ? "Today" : item.upComingIn,
                company: item.company,
                completedYears: item.completedYears,
              })),
          ]}
        />,
        <MuiTable
          columns={upComingClientAnniversaryColumns}
          scroll
          rowsToDisplay={3}
          Title={"Upcoming Client Anniversaries"}
          rows={[
            ...upComingClientAnniversary
              .sort((a, b) => a.upComingIn - b.upComingIn)
              .map((item, index) => ({
                id: index + 1,
                client: item.client,
                dateOfJoin: item.dateOfJoin,
                upComingIn:
                  item.upComingIn === 0 ? "Today" : `${item.upComingIn} days`,
                completedYears: `${item.completedYears} years`,
              })),
          ]}
        />,
      ],
    },
  ];

  return (
    <div>
      {techWidgets.map((section, index) => (
        <WidgetSection key={index} layout={section?.layout}>
          {section?.widgets}
        </WidgetSection>
      ))}
    </div>
  );
};

export default AdminDashboard;
